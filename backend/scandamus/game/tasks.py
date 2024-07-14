import json
import logging
import random

from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import Tournament, Entry, Match
from players.models import Player
#from .tournament_match import start_tournament_match
#from .consumers import LoungeSession
from channels.layers import get_channel_layer
from channels.db import database_sync_to_async
from asgiref.sync import async_to_sync
from .match_utils import send_tournament_match_jwt

logger = logging.getLogger(__name__)

@shared_task
def check_tournament_start_times():
    now = timezone.now()
    offset = timedelta(minutes=5) # 5分前に準備期間開始
    check_time = now + offset
    logger.info(f'Current time: {now}, Check time: {check_time}')

    all_tournaments = Tournament.objects.all()
    for t in all_tournaments:
        logger.info(f'Tournament: {t.name}, Start time: {t.start}, Status: {t.status}')
    
    tournaments = Tournament.objects.filter(start__lte=check_time, status='upcoming')

    for tournament in tournaments:
        logger.info(f'Tournament {tournament.name} is preparing')
        tournament.status = 'preparing'
        tournament.save()

        tournament_name = tournament.name
        
        # 5分前までのエントリーが有効
        entried_players_id_list = list(Entry.objects.filter(tournament=tournament).values_list('player_id', flat=True))

        # エントリーしている人数が４人未満の場合はトーナメントをキャンセル
        number_of_players = len(entried_players_id_list)
        if number_of_players < 4: # 4人揃わない場合は中止
            logger.info(f'Entried players in this entry list {number_of_players} <= 4, so cancel tournament {tournament_name}')
            tournament.status = 'canceled'
            tournament.save()
            notify_players.delay(tournament_name, entried_players_id_list, 'canceled', False)
            return
        
        logger.info(f'{number_of_players} players entries {tournament_name}')
    
        # 5分前に準備の通知
        notify_players.delay(tournament_name, entried_players_id_list, 'tournament_prepare', True)

        # 2分前になると控室集合の通知
        #notify_players.apply_async((tournament_name, entried_players_id_list, 'tournament_call', True), countdown=(tournament.start - now - timedelta(minutes=2)).total_seconds())
        
        # 開始時刻の通知
        # notify_players.apply_async((tournament_name, entried_players_id_list, 'tournament_match', True), countdown=(tournament.start - now).total_seconds())
        create_initial_round.apply_async((tournament.id, entried_players_id_list), countdown=(tournament.start - now).total_seconds())

@shared_task
def notify_players(tournament_name, entried_players_id_list, status, is_update_player_status):
    logger.info(f'{tournament_name} status: {status}')

    for player_id in entried_players_id_list:
        try:
            if is_update_player_status:
                update_player_status(player_id, status)
            player = Player.objects.get(id=player_id)
            player_name = player.user.username
            logger.info(f'player_id:{player.id} name:{player_name} is in entrylist')
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'friends_{player.id}',
                {
                    'type': 'send_notification',
                    'player_id': player.id,
                    'action': status,
                    'name': tournament_name,
                }
            )
        except Player.DoesNotExist:
            logger.error(f'Error in notify_players: Player with id {player_id} doesnot exist')

@shared_task
def update_player_status(player_id, status):
    try:
        player = Player.objects.get(id=player_id)
        player.status = status
        player.save()
        player_name = player.user.username
        logger.info(f'{player_name} status updated to {status}')
    except Player.DoesNotExist:
        logger.error('Error in update_player_status: player DoesNotExist')

@shared_task
def create_initial_round(tournament_id, entried_players_id_list):
    logger.info('create_initial_round in')
    try:
        tournament = Tournament.objects.get(id=tournament_id)
    except Tournament.DoesNotExist:
        logger.error('Error in create_initial_round: tournament DoesNotExist')
        return
    
    tournament.status = 'ongoing'
    tournament.save()

    online_players = Player.objects.filter(id__in=entried_players_id_list, online=True)
    number_of_players = online_players.count()

    if number_of_players < 4: # 4人揃わない場合は中止
        logger.info(f'Online player in this entry list {number_of_players}<= 1, so cancel tournament {tournament.name}')
        tournament.status = 'canceled'
        tournament.save()
        notify_players(tournament.name, entried_players_id_list, 'canceled', False)
        return

    player_list = list(online_players)
    random.shuffle(player_list)
    create_matches(tournament, player_list, round_number=1)

def report_match_result(match_id):
    match = Match.objects.get(id=match_id)
    tournament = match.tournament
    current_round = match.round
    logger.info(f'report_match_result in roundN{current_round}')

    matched_in_round = tournament.matches.filter(round=current_round)
    if all(m.status == 'after' for m in matched_in_round):
        if current_round in [-1, -3]: # round -1:決勝戦, -3:3位決定戦
            finalize_tournament(tournament)
        else:
            create_next_round(tournament, current_round)

def finalize_tournament(tournament):
    logger.info('finalize_tournament in')
    final_match = tournament.matches.get(round=-1)
    third_place_match = tournament.matches.get(round=-3)

    tournament.winner = final_match.winner
    tournament.second_place = final_match.player1 if final_match.winner == final_match.player2 else final_match.player2
    tournament.third_place = third_place_match.winner
    tournament.status = 'finished'
    tournament.update_result_json()
    tournament.save()

def create_next_round(tournament, current_round):
    logger.info('create_next_round in')
    previous_round_matches = tournament.matches.filter(round=current_round)
    winners = [match.winner for match in previous_round_matches if match.winner]

    if tournament.bye_player:
        winners.append(tournament.bye_player)
    
    if len(winners) == 2:
        create_final_round(tournament, winners, previous_round_matches)
        return
    
    current_round += 1

    create_matches(tournament, winners, current_round)

    tournament.current_round = current_round
    tournament.update_result_json()
    tournament.save()

def create_final_round(tournament, winners, previous_round_matches):
    logger.info('create_final_round in')
    # 決勝戦
    create_match(tournament, winners[0], winners[1], round=-1)

    semifinal_losers = [
        match.player1 if match.winner == match.player2 else match.player2 for match in previous_round_matches
    ]
    # 3位決定戦
    create_match(tournament, semifinal_losers[0], semifinal_losers[1], round=-3)

def create_match(tournament, player1, player2, round, game_name='pong'):
    match = Match.objects.create(
        tournament=tournament,
        player1=player1,
        player2=player2,
        round=round,
        game_name=game_name,
        status='before'
    )
    match.save()
    tournament.matches.add(match)
    tournament.save()
    async_to_sync(send_tournament_match_jwt)(match)

def create_matches(tournament, players, round_number):
    number_of_players = len(players)
    logger.info(f'create_matches in : number_of_players:{number_of_players}')
    matches = []

    for i in range(0, len(players) - 1, 2):
        player1 = players[i]
        player2 = players[i + 1]
        match = Match(
            tournament=tournament,
            round=round_number,
            player1=player1,
            player2=player2,
            status='before'
        )
        match.save()
        matches.append(match)
        async_to_sync(send_tournament_match_jwt)(match)

    if len(players) % 2 == 1:
        tournament.bye_player = players[-1] # 最後の要素のPlayer
    else:
        tournament.bye_player = None

    logger.info(f'Type of matches: {type(matches)}')  # 型を確認
    number_of_matches = len(matches)
    logger.info(f'size of macthes: {number_of_matches}')
   #Match.objects.bulk_create(matches)
    tournament.matches.add(*matches)
    tournament.save()
    



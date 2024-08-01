import json
import jwt
import logging

from django.contrib.auth.models import User
from .models import Player, Entry
from .models import Match, Tournament, Entry
from django.conf import settings
from django.db import transaction
from .match_utils import authenticate_token, get_player_by_user
from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async

#import random

from celery import shared_task
#from django.utils import timezone
#from datetime import timedelta

from channels.layers import get_channel_layer

from .match_utils import send_tournament_match_jwt, notify_bye_player


logger = logging.getLogger(__name__)


async def handle_enter_tournament_room(consumer, token, data):
    from .consumers import LoungeSession

    user, error = await authenticate_token(token)
    if not user:
        logger.error('Error: Authentication Failed')
        logger.error(f'error={error}')
        try:
            await consumer.send(text_data=json.dumps({
                'type': 'authenticationFailed',
                'message': error
            }))
        except Exception as e:
            logger.error(f'Failed to send to consumer: {e}')
        return
    
    player = await get_player_by_user(user)
    if not player:
        logger.error(f"No player found for user: {user.username}")
    if player.status != 'tournament_room':
        logger.error(f'{user.username} can not enter tournament room as status: {player.status}')
        await send_entry_error(consumer, 'invalidEnter')
        return
    
    tournament_name = data.get('name')
    entry = await get_entry(player, tournament_name)
    if entry is None:
        logger.error(f'{user.username} can not enter tournament room')
        await send_entry_error(consumer, 'invalidEnter')
        return

    if tournament_name not in LoungeSession.tournament_entry:
        LoungeSession.tournament_entry[tournament_name] = []
    LoungeSession.tournament_entry[tournament_name].append(entry)
    tournament = await database_sync_to_async(lambda: entry.tournament)()
    tournament_id = await database_sync_to_async(lambda: entry.tournament.id)()
    nickname = entry.nickname
    start = tournament.start

    message = json.dumps({
        'type': 'tournamentMatch',
        'action': 'enterRoom',
        'id': tournament_id,
        'nickname': nickname,
        'name': tournament_name,
        'start': start.isoformat()
    })
    await send_to_client(consumer, message)
    logger.info(f'Sent {tournament_name} room permission to {user.username}')

# preparingのトーナメントである場合にEntryを返す(控室enter check)
@database_sync_to_async
def get_entry(player, tournament_name):
    try:
        tournament = Tournament.objects.get(name=tournament_name, status='preparing')
    except Tournament.DoesNotExist:
        return None
    try:
        return Entry.objects.get(player=player, tournament=tournament)
    except Entry.DoesNotExist:
        return None

async def send_entry_error(websocket, action):
    message = json.dumps({
        'type': 'tournamentMatch',
        'action': action
    })
    send_to_client(websocket, message)

async def send_to_client(websocket, message):
    try:
        await websocket.send(text_data=message)
    except Exception as e:
        logger.error(f'Failed to send to consumer: {e}')
        return
    
def report_match_result(match_id):
    match = Match.objects.get(id=match_id)
    tournament = match.tournament
    current_round = match.round
    logger.info(f'report_match_result in round:{current_round}')

    matched_in_round = tournament.matches.filter(round=current_round)
    if current_round in [-1, -3]: # round -1:決勝戦, -3:3位決定戦
        final_match = tournament.matches.get(round=-1)
        third_place_match = tournament.matches.get(round=-3)
        if final_match.status == 'after' and third_place_match.status == 'after':
            finalize_tournament(tournament)
    elif current_round in [-4, -5, -6]: # 3人決戦
        handle_three_players_round(tournament, current_round)
    elif all(m.status == 'after' for m in matched_in_round):
        create_next_round(tournament, current_round)

# 最後にABCの3人が残った場合
# 1戦目（round==-4）: A vs B
# 2戦目（round==-5）: 1戦目の敗者 vs C　（敗者は3位）
# 3戦目（round==-6）: 1戦目の勝者 vs 2戦目の勝者　（勝者は1位、敗者は2位）
def handle_three_players_round(tournament, current_round):
    from .tasks import notify_players
    logger.info('handle_three_players_round')
    previous_round_match = tournament.matches.filter(round=current_round).order_by('-id').first()
    if current_round == -4:
        first_loser = previous_round_match.player1 if previous_round_match.winner == previous_round_match.player2 else previous_round_match.player2
        create_match(tournament, first_loser, tournament.bye_player, -5) # 内部でtournament.save()あり
        tournament.bye_player = None
        tournament.save(update_fields=['bye_player'])
        logger.info(f'//-- tournament save() on: handle_three_players_round 1')
        notify_players(tournament.name, [previous_round_match.winner.id], 'notifyWaitFinal', False)#1戦目勝者は決勝待ち
    elif current_round == -5:
        first_match = tournament.matches.filter(round=-4).order_by('-id').first()
        second_match = tournament.matches.filter(round=-5).order_by('-id').first()
        tournament.third_place = second_match.player1 if second_match.winner == second_match.player2 else second_match.player2
        tournament.save(update_fields=['third_place'])
        logger.info(f'//-- tournament save() on: handle_three_players_round 2')
        create_match(tournament, first_match.winner, second_match.winner, -6)
        notify_players(tournament.name, [tournament.third_place.id], 'notifyFinalOnGoing', False)#3位には決勝戦進行中表示
    elif current_round == -6:
        finalize_tounrnament_by_three_players(tournament)

def finalize_tounrnament_by_three_players(tournament):
    from .tasks import notify_players
    logger.info('finalize_tournament_by_three_players in')
    final_match = tournament.matches.filter(round=-6).order_by('-id').first()
    entried_players_id_list = list(Entry.objects.filter(tournament=tournament).values_list('player_id', flat=True))

    reset_player_status_if_in_tournament(tournament)
    tournament.winner = final_match.winner
    tournament.second_place = final_match.player1 if final_match.winner == final_match.player2 else final_match.player2
    tournament.status = 'finished'
    tournament.save(update_fields=['winner', 'second_place', 'status'])
    logger.info(f'//-- tournament save() on: finalize_tounrnament_by_three_players')
    tournament.finalize_result_json(True)
    notify_players(tournament.name, entried_players_id_list, 'finished', False)

def finalize_tournament(tournament):
    from .tasks import notify_players
    logger.info('finalize_tournament in')
    final_match = tournament.matches.filter(round=-1).order_by('-id').first()
    third_place_match = tournament.matches.filter(round=-3).order_by('-id').first()
    entried_players_id_list = list(Entry.objects.filter(tournament=tournament).values_list('player_id', flat=True))

    reset_player_status_if_in_tournament(tournament)
    tournament.winner = final_match.winner
    tournament.second_place = final_match.player1 if final_match.winner == final_match.player2 else final_match.player2
    tournament.third_place = third_place_match.winner
    tournament.status = 'finished'
    tournament.save(update_fields=['winner', 'second_place', 'third_place', 'status'])
    logger.info(f'//-- tournament save() on: finalize_tournament')
    tournament.finalize_result_json()
    notify_players(tournament.name, entried_players_id_list, 'finished', False)

def create_next_round(tournament, current_round):
    from .tasks import notify_players
    logger.info('create_next_round in')
    previous_round_matches = tournament.matches.filter(round=current_round)
    winners = [match.winner for match in previous_round_matches if match.winner]
    entried_players_id_list = list(Entry.objects.filter(tournament=tournament).values_list('player_id', flat=True))
    tournament.update_result_json(current_round)

    if tournament.bye_player:
        winners.insert(0, tournament.bye_player)
        tournament.bye_player == None
        tournament.save(update_fields=['bye_player'])
        logger.info(f'//-- tournament save() on: create_next_round 1')

    losers = [player_id for player_id in entried_players_id_list if player_id not in [player.id for player in winners]]
    notify_players(tournament.name, losers, 'roundEnd', False)
    
    number_of_winners = len(winners)
    if number_of_winners == 2:
        create_final_round(tournament, winners, previous_round_matches)
        return
    elif number_of_winners == 3:
        create_match(tournament, winners[0], winners[1], -4) # -4:3人決戦の1戦目
        tournament.bye_player = winners[-1]
        tournament.save(update_fields=['bye_player'])
        logger.info(f'//-- tournament save() on: create_next_round 2')
        notify_players(tournament.name, [tournament.bye_player.id], 'notifyWaitSemiFinal', False)#準決勝2戦目待ち
        return
    
    current_round += 1

    create_matches(tournament, winners, current_round)

    tournament.current_round = current_round
    tournament.save(update_fields=['current_round'])
    logger.info(f'//-- tournament save() on: create_next_round 3')

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
    with transaction.atomic():
        match = Match.objects.create(
            tournament=tournament,
            player1=player1,
            player2=player2,
            round=round,
            game_name=game_name,
            status='before'
        )
        match.save(update_fields=['tournament', 'player1', 'player2', 'round', 'game_name', 'status'])
    logger.info(f'//-- Match save() on: create_match')
    tournament.matches.add(match)
    tournament.save(update_fields=['matches'])
    logger.info(f'//-- tournament save() on: create_match')
    async_to_sync(send_tournament_match_jwt)(match)

def create_matches(tournament, players, round_number):
    number_of_players = len(players)
    logger.info(f'create_matches in : number_of_players:{number_of_players}')
    matches = []

    for i in range(0, len(players) - 1, 2):
        with transaction.atomic():
            player1 = players[i]
            player2 = players[i + 1]
            match = Match(
                tournament=tournament,
                round=round_number,
                player1=player1,
                player2=player2,
                status='before'
            )
            match.save(update_fields=['tournament', 'round', 'player1', 'player2', 'status'])
            logger.info(f'//-- Match save() on: create_matches')
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
    with transaction.atomic():
        tournament.matches.add(*matches)
        tournament.save(update_fields=['bye_player'])
        logger.info(f'//-- tournament save() on: create_matches')
    if tournament.bye_player:
        notify_bye_player(tournament)


def reset_player_status_if_in_tournament(tournament):
    logger.info('reset_player_status in')
    entried_players = Entry.objects.filter(tournament=tournament)
    for entry in entried_players:
        try:
            player = entry.player
            logger.info(f'{entry.nickname}: {player.status}')
            if player.status in ['tournament', 'tournament_match', 'tournament_room', 'tournament_prepare']:
                player.status = 'waiting'
                player.save(update_fields=['status'])
        except Player.DoesNotExist:
            pass

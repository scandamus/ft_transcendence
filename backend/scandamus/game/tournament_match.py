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
    
    user = consumer.user
    player = consumer.player

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
        if final_match.status in ['after', 'canceled'] and third_place_match.status in ['after', 'canceled']:
            finalize_tournament(tournament)
    elif current_round in [-4, -5, -6]: # 3人決戦
        if match and match.status == 'canceled':
            finalize_tounrnament_by_three_players(tournament, current_round)
            return
        handle_three_players_round(tournament, current_round)
    elif all(m.status in ['after', 'canceled'] for m in matched_in_round):
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
        first_loser = (
            previous_round_match.player1 if previous_round_match.winner == previous_round_match.player2
            else previous_round_match.player2 if previous_round_match.winner == previous_round_match.player1
            else None
        )
        create_match(tournament, first_loser, tournament.bye_player, -5)
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

def finalize_tounrnament_by_three_players(tournament, current_round=-6):
    from .tasks import notify_players
    logger.info('finalize_tournament_by_three_players in')
    try:
        match = tournament.matches.filter(round=current_round).order_by('-id').first()
        entried_players_id_list = list(Entry.objects.filter(tournament=tournament).values_list('player_id', flat=True))

        reset_player_status_if_in_tournament(tournament)

        if match.status == 'after':
            tournament.winner = match.winner
            tournament.second_place = (
                match.player1 if match.winner == match.player2
                else match.player2 if match.winner == match.player1
                else None
            )
        elif match.status == 'canceled':
            assign_ranking_on_cancellation(tournament, current_round, match)
    except Exception as e:
        logger.error(f'Failed to finalize {tournament.name}')

    tournament.status = 'finished'
    tournament.save(update_fields=['winner', 'second_place', 'status'])
    logger.info(f'//-- tournament save() on: finalize_tounrnament_by_three_players')
    tournament.finalize_result_json(True)
    notify_players(tournament.name, entried_players_id_list, 'finished', False)

# Matchに両者ともジョインしないままタイムアウトした場合の処理
# キャンセルとなったMatchに参加したPlayerの順位は常にplayer1側優先
def assign_ranking_on_cancellation(tournament, canceled_round, match):
    if canceled_round == -4:
        tournament.winner = tournament.bye_player
        tournament.second_place = match.player1
        tournament.third_place = match.player2
    elif canceled_round == -5:
        first_match = tournament.matches.filter(round=-4).order_by('-id').first()
        tournament.winner = first_match.winner
        tournament.second_place = match.player1
        tournament.third_place = match.player2
    elif canceled_round == -6:
        tournament.winner = match.player1
        tournament.second_place = match.player2
        # third_placeはround==-5で確定済み
    else:
        logger.error(f'Failed to assign ranking on cancellation: {tournament.name}')

def finalize_tournament(tournament, current_round=-1):
    from .tasks import notify_players
    logger.info('finalize_tournament in')
    try:
        reset_player_status_if_in_tournament(tournament)
        logger.info('reset_player_status_if_in_tournament completed')
        
        if current_round in [-1, -3]:
            final_match = tournament.matches.filter(round=-1).order_by('-id').first()
            third_place_match = tournament.matches.filter(round=-3).order_by('-id').first()
            logger.info(f'final_match: {final_match}, third_place_match: {third_place_match}')

            # 決勝戦が両者棄権（キャンセル）/ 3位決定戦は有効な場合
            if final_match.status == 'canceled' and third_place_match.status == 'after':
                # あくまで決勝戦を優先するパターン
                tournament.winner = final_match.player1
                tournament.second_place = final_match.player2
                tournament.third_place = third_place_match.winner

                # 3位決定戦を繰り上げるパターン
                # tournament.winner = third_place_match.winner
                # tournament.second_place = (
                #    third_place_match.player2 if third_place_match.winner == third_place_match.player1
                #    else third_place_player1 if third_place_match.winner == third_place_match.player2
                #    else None
                # }
                # tournament.third_place = None
            else: # 決勝戦は有効 / 3位決定戦が両者棄権（キャンセル）
                tournament.winner = final_match.winner
                tournament.second_place = (
                    final_match.player1 if final_match.winner == final_match.player2
                    else final_match.player2 if final_match.winner == final_match.player1
                    else None
                )
                tournament.third_place = (
                    third_place_match.winner if third_place_match.winner
                    else third_place_match.player1
                )
        elif current_round > 0: # and also winner < 2
            matches_with_after_status = tournament.matches.filter(round=current_round, status='after')
            matches_with_canceled_status = tournament.matches.filter(round=current_round, status='canceled')
            number_of_matches_with_after_status = matches_with_after_status.count()
            number_of_matches_with_canceled_status = matches_with_canceled_status.count()
            if number_of_matches_with_after_status >= 2: # should not be here
                logger.error(f'Failed to finalize tournament: {tournament.name}')
                return
            elif number_of_matches_with_after_status == 0: # すべてのマッチがキャンセルされた場合は1〜3位をNoneのままに
                logger.info(f'All matches in {tournament.name} / round {current_round} have been canceled')
            else: # if number_of_matches_with_after_status == 1 成立した1マッチの勝者を1位、敗者を2位        
                match = matches_with_after_status.first()
                tournament.winner = match.winner
                tournament.second_place = (
                    match.player1 if match.winner == match.player2
                    else match.player2 if match.winner == match.player1
                    else None
                )
                if number_of_matches_with_canceled_status == 1: # キャンセルが1マッチだけの場合はそのマッチのplayer1を3位に
                    canceled_match = matches_with_canceled_status.first()
                    tournament.third_place = canceled_match.player1 if canceled_match.player1 else None

        entried_players_id_list = list(Entry.objects.filter(tournament=tournament).values_list('player_id', flat=True))

    except Exception as e:
        logger.error(f'Failed to finalize {tournament.name}')

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
    elif number_of_winners < 2: # ２人未満のとき。両者がMatchに接続せずにMatch.status == 'canceled'となった場合に生じる可能性があり
        finalize_tournament(tournament, current_round)
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
        match.player1 if match.winner == match.player2
        else match.player2 if match.winner == match.player1
        else None
        for match in previous_round_matches
    ]

    if len(semifinal_losers) < 2: # should not be True
        return
    
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
        match.save()
        logger.info(f'//-- Match save() on: create_match')
    tournament.matches.add(match)
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
            match.save()
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
                logger.info(f'//-- player save() on: reset_player_status_if_in_tournament')
        except Player.DoesNotExist:
            pass

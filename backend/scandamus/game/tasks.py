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
from .tournament_match import create_matches

logger = logging.getLogger(__name__)

@shared_task
def check_tournament_start_times():
    now = timezone.now()
    offset = timedelta(minutes=5) # 5分前に準備期間開始
    check_time = now + offset
    logger.info(f'Current time: {now}, Check time: {check_time}')

    all_tournaments = Tournament.objects.all()
    for t in all_tournaments:
        if t.status in ['upcoming', 'prepagin', 'ongoing']:
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
        logger.info(f'Online player in this entry list {number_of_players} <= 4, so cancel tournament {tournament.name}')
        tournament.status = 'canceled'
        tournament.save()
        notify_players(tournament.name, entried_players_id_list, 'canceled', False)
        return

    player_list = list(online_players)
    random.shuffle(player_list)
    create_matches(tournament, player_list, round_number=1)
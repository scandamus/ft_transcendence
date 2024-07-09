import json
import logging

from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import Tournament, Entry
from players.models import Player
#from .tournament_match import start_tournament_match
#from .consumers import LoungeSession
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

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
        logger.info(f'Tournament {tournament.name} is starting now!')
        tournament.status = 'ongoing'
        tournament.save()

        tournament_name = tournament.name
        entried_players_id_list = list(Entry.objects.filter(tournament=tournament).values_list('player_id', flat=True))

        # 5分前に準備の通知
        notify_players.delay(tournament_name, entried_players_id_list, 'tournament_prepare')

        # 2分前になると控室集合の通知
        notify_players.apply_async((tournament_name, entried_players_id_list, 'tournament_call'), countdown=(tournament.start - now - timedelta(minutes=2)).total_seconds())
        
        # 開始時刻の通知
        notify_players.apply_async((tournament_name, entried_players_id_list, 'tournament_match'), countdown=(tournament.start - now).total_seconds())

@shared_task
def notify_players(tournament_name, entried_players_id_list, status):
    logger.info(f'{tournament_name} status: {status}')

    for player_id in entried_players_id_list:
        try:
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
        logger.error('Error in update_player_status Player DoesNotExist')
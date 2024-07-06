import json
import logging

from celery import shared_task
from django.utils import timezone
from .models import Tournament, Entry
#from .tournament_match import start_tournament_match
#from .consumers import LoungeSession
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

logger = logging.getLogger(__name__)

@shared_task
def check_tournament_start_times():
    now = timezone.now()
    tournaments = Tournament.objects.filter(start__lte=now, status='upcoming')

    for tournament in tournaments:
        logger.info(f'Tournament {tournament.name} is starting now!')
        tournament.status = 'ongoing'
        tournament.save()

        start_tournament_match.delay(tournament)

@shared_task
def start_tournament_match(tournament):
    logger.info(f'{tournament} is starting!!!')
    entried_players = Entry.objects.filter(tournament=tournament)

    for entry in entried_players:
        player = entry.player
        player_name = player.user.username
        logger.info(f'player_id:{player.id} name:{player_name} is in entrylist')
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'friends_{player.id}',
            {
                'type': 'send_notification',
                'player_id': player.id,
                'action': 'call',
                'message': f'Tournament {tournament} is starting now!'
            }
        )
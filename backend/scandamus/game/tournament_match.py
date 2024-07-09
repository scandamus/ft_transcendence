import json
import jwt
import logging

from django.contrib.auth.models import User
from .models import Player, Entry
from .models import Match, Tournament
from django.conf import settings
from django.db import transaction
from .match_utils import authenticate_token, get_player_by_user
from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async


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
    if player.status != 'tournament_call':
        logger.error(f'{user.username} can not enter tournament room as status: {player.status}')
        send_entry_error(consumer, 'invalidEnter')
        return
    
    tournament_name = data.get('name')
    entry = get_entry(player, tournament_name)
    if entry is None:
        logger.error(f'{user.username} can not enter tournament room')
        send_entry_error(consumer, 'invalidEnter')
        return

    LoungeSession.tournament_entry[tournament_name].append(entry)

    message = json.dumps({
        'type': 'tournamentMatch',
        'action': 'enterRoom',
        'id': entry.tournament.id,
        'name': tournament_name
    })
    send_to_client(consumer, message)
    logger.info(f'Sent {tournament_name} room permission to {user.username}')

async def start_tournament_match(consumer, tournament_name):
    from .consumers import LoungeSession

    



# ongoingのトーナメントである場合にEntryを返す
@database_sync_to_async
def get_entry(player, tournament_name):
    try:
        tournament = Tournament.objects.filter(name=tournament_name, status='ongoing')
    except Tournament.DoesNotExist:
        return None
    return Entry.objects.filter(player=player, tournament=tournament)

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
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
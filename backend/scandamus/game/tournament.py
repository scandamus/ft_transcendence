import json
import jwt
import logging

from django.contrib.auth.models import User
from .models import Player
from .models import Tournament, Entry
from .serializers import TournamentSerializer, EntrySerializer
from django.conf import settings
from django.db import transaction, IntegrityError
from channels.db import database_sync_to_async
from datetime import datetime, timedelta, timezone
from django.utils.timezone import make_aware, now as django_now
from .match_utils import authenticate_token, get_player_by_user

logger = logging.getLogger(__name__)

async def handle_create_tournament(consumer, data):
    user, error = await authenticate_token(data['token'])
    if not user:
        logger.error('Error: Authentication Failed')
        logger.error(f'error={error}')
        await consumer.send(text_data=json.dumps({
            'type': 'authenticationFailed',
            'message': error
        }))
        return

    player = await get_player_by_user(user)
    if not player:
        logger.error(f"No player found for user: {user.username}")
    serializer = TournamentSerializer(data = data)
    if serializer.is_valid():
        tournament, created = await create_tournament(data)
        if tournament is None:
            return  # 無効なjsonを送ってきた場合はセキュリティの観点から無視
        if created:
            await consumer.send(text_data=json.dumps({
                'type': 'tournament',
                'action': 'created',
                'name': tournament.name,
                'start': tournament.start.isoformat(),
                'period': tournament.start.isoformat(),
            }))
        else: #トーナメント名重複
            await consumer.send(text_data=json.dumps({
                'type': 'tournament',
                'action': 'invalidTournamentTitle',
                'message': {'name': ['tournamentNameAlreadyExists']}
            }))
    else:
        logger.error(f"invalid tournament data: {serializer.errors}")
        await consumer.send(text_data=json.dumps({
            'type': 'tournament',
            'action': 'invalidTournamentTitle',
            'message': serializer.errors
        }))

@database_sync_to_async
def create_tournament(data):
    try:
        name = data.get('name', None)
        start = data.get('start', None)

        if not name or not name.strip() or start is None:
            logger.error(f'name: {name}, start: {start}')
            return None, None
        
        min_offset = settings.CREATE_TOURNAMENT_TIMELIMIT_MIN
        min_start = datetime.now(timezone.utc) + timedelta(minutes=int(min_offset))

        start = datetime.fromisoformat(start)    
        start_utc = start
        logger.info(f'start: {start}, start(utc): {start_utc}, min_start(utc): {min_start}')
        # existing_tournaments =Tournament.objects.all()
        # for tournament in existing_tournaments:
        #     tournament_start = tournament.start
        #     if abs((start_utc - tournament_start).total_seconds()) < 6 * 3600:
        #         raise ValueError(f'interval error')

        tournament, created = Tournament.objects.get_or_create(
            name=data['name'],
            start=start_utc,
            period=start_utc
        )
        return tournament, created
    except IntegrityError as e:
        logger.info(f'Tournament with title "{data["name"]}" already exists')
        tournament = Tournament.objects.get(name=data['name'])
        return tournament, False
    except ValueError as e:
        logger.error(f'Validation error: {e}')
        return None, None
    except Exception as e:
        logger.error(f'Error in tournament json: {e}')
        return None, None

async def handle_entry_tournament(consumer, data):
    user, error = await authenticate_token(data['token'])
    if not user:
        logger.error('Error: Authentication Failed')
        logger.error(f'error={error}')
        await consumer.send(text_data=json.dumps({
            'type': 'authenticationFailed',
            'message': error
        }))
        return

    player = await get_player_by_user(user)
    if not player:
        logger.error(f"No player found for user: {user.username}")
        await send_entry_error(consumer, 'invalidPlayer')
        return

    serializer = EntrySerializer(data=data)
    if serializer.is_valid():
        tournament, nickname = await get_tournament_and_nickname(consumer, data)
        if tournament is None:
            await send_entry_error(consumer, 'invalidTournament')
            return

        entry = await get_entry(tournament, player)
        if entry:
            logger.info(f"Entry already exists for player {user.username} in tournament {tournament.name}")
            await send_entry_error(consumer, 'alreadyEnterd')
            return

        if await is_duplicate_nickname(tournament, nickname):
            logger.info(f'Nickname {nickname} already exists in tournament {tournament}')
            await send_entry_error(consumer, 'duplicateNickname')
            return

        result = await create_entry(tournament, player, nickname)
        if result is 'capacityFull':
            logger.info(f'{tournament.name} capacity is full')
            await send_entry_error(consumer, 'capacityFull')
            return

        logger.info(f'nickname {result.nickname} just entried {tournament.name}')
        await consumer.send(text_data=json.dumps({
            'type': 'tournament',
            'action': 'entryDone',
            'name': tournament.name
        }))
    else:
        logger.error(f"invalid nickname: {serializer.errors}")
        await consumer.send(text_data=json.dumps({
            'type': 'tournament',
            'action': 'invalidNickname',
            'message': serializer.errors
        }))

async def handle_cancel_entry(consumer, data):
    user, error = await authenticate_token(data['token'])
    if not user:
        logger.error('Error: Authentication Failed')
        logger.error(f'error={error}')
        await consumer.send(text_data=json.dumps({
            'type': 'authenticationFailed',
            'message': error
        }))
        return

    player = await get_player_by_user(user)
    if not player:
        logger.error(f"No player found for user: {user.username}")
        await send_entry_error(consumer, 'invalidPlayer')
        return
    
    tournament, nickname = await get_tournament_and_nickname(consumer, data)
    if tournament is None:
        await send_entry_error(consumer, 'invalidTournament')
        return

    entry = await get_entry(tournament, player)
    if entry is None:
        logger.info(f'Entry doesnot exist for player {user.username} in tournament {tournament.name}')
        await send_entry_error(consumer, 'invalidCancelRequest')
        return

    await remove_entry(tournament, player)

    logger.info(f'Entry for player {user.username} in tournament {tournament.name} has been removed')
    await consumer.send(text_data=json.dumps({
        'type': 'tournament',
        'action': 'removeEntryDone',
        'name': tournament.name
    }))

@database_sync_to_async
def get_tournament_and_nickname(consumer, data):
    try:
        id = data.get('id', None)
        name = data.get('name', None)
        nickname = data.get('nickname', None)
        
        if id is None or name is None or nickname is None:
            logger.error(f'Error entry_tournament socket json id:{id}, name:{name}, nickname:{nickname}')
            return None, None
        
        tournament = Tournament.objects.get(id=id)
        if tournament or tournament.status is not 'upcoming': # 本来upcomingではないリクエストは来ない
            logger.info(f'{tournament} found in database')
            return tournament, nickname
        logger.error(f'{name} is not found')
        return None, None

    except Exception as e:
        logger.error(f'Error in get_tournament: {e}')
        return None, None

@database_sync_to_async
def get_entry(tournament, player):
    try:
        return Entry.objects.get(tournament=tournament, player=player)
    except Entry.DoesNotExist:
        return None

@database_sync_to_async
def is_duplicate_nickname(tournament, nickname):
    return Entry.objects.filter(tournament=tournament, nickname=nickname).exists()

@database_sync_to_async
def create_entry(tournament, player, nickname):
    with transaction.atomic():
        if Entry.objects.filter(tournament=tournament).count() >= tournament.max_participants:
            return 'capacityFull'
        return Entry.objects.create(tournament=tournament, player=player, nickname=nickname)

@database_sync_to_async
def remove_entry(tournament, player):
    Entry.objects.filter(tournament=tournament, player=player).delete()


async def send_entry_error(websocket, action):
    await websocket.send(text_data=json.dumps({
        'type': 'tournament',
        'action': action
    }))
    logger.error(f'sent error to user: {action}')
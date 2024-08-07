import json
import jwt
import logging

from asgiref.sync import sync_to_async
from django.contrib.auth.models import User
from .models import Player
from .models import Tournament, Entry
from .serializers import TournamentSerializer, EntrySerializer, async_validate_start_time
from django.conf import settings
from django.db import transaction, IntegrityError
from rest_framework import serializers
from channels.db import database_sync_to_async
from datetime import datetime, timedelta, timezone

logger = logging.getLogger(__name__)

async def handle_create_tournament(consumer, data):
    user = consumer.user
    player = consumer.player

    serializer = TournamentSerializer(data = data)
    start_time = data.get('start')
    if isinstance(start_time, str):
        start_time = datetime.fromisoformat(start_time)
    custom_errors = {}
    try:
        await async_validate_start_time(start_time)
    except serializers.ValidationError as e:
        if 'start' in custom_errors:
            custom_errors['start'].extend(e.detail)
        else:
            custom_errors['start'] = e.detail

    if custom_errors:
        try:
            await consumer.send(text_data=json.dumps({
                'type': 'tournament',
                'action': 'invalidTournamentStart',
                'message': custom_errors
            }))
        except Exception as e:
            logger.error(f'Error in decline_frined_request: {e}')

    name = data.get('name')
    existing_tournament = await sync_to_async(lambda: Tournament.objects.filter(name=name).first())()
    if existing_tournament:
        try:
            await consumer.send(text_data=json.dumps({
                'type': 'tournament',
                'action': 'invalidTournamentTitle',
                'message': {'name': ['tournamentNameAlreadyExists']}
            }))
        except Exception as e:
            logger.error(f'Error in decline_frined_request: {e}')

    if custom_errors or existing_tournament:
        return

    try:
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
            else:
                await consumer.send(text_data=json.dumps({
                    'type': 'tournament',
                    'action': 'invalidTournamentTitle',
                    'message': {'name': ['tournamentNameAlreadyExists']}
                }))
        else: #charTypeなどフロントで弾けているはずのエラー
            logger.error(f"invalid tournament data: {serializer.errors}")
            await consumer.send(text_data=json.dumps({
                'type': 'tournament',
                'action': 'invalidTournamentTitle',
                'message': serializer.errors
            }))
    except Exception as e:
        logger.error(f'Error in handle_create_tournament: {e}')

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
        logger.error(f'Error create_tournament: {e}')
        return None, None

async def handle_entry_tournament(consumer, data):
    user = consumer.user
    player = consumer.player
    if not player:
        logger.error(f"No player found for user: {user.username}")
        await send_entry_error(consumer, 'invalidPlayer')
        return

    try:
        serializer = EntrySerializer(data=data)
        if serializer.is_valid():
            tournament, nickname = await get_tournament_and_nickname(consumer, data)
            if tournament is None:
                await send_entry_error(consumer, 'invalidEntryRequest')
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
            if result == 'capacityFull':
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
    except Exception as e:
        logger.error(f'Error in handle_entry_tournament: {e}')

async def handle_cancel_entry(consumer, data):
    user = consumer.user
    player = consumer.player
    if not player or not user:
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
    try:
        await consumer.send(text_data=json.dumps({
            'type': 'tournament',
            'action': 'removeEntryDone',
            'name': tournament.name
        }))
    except Exception as e:
        logger.error(f'Error in handle_cancel_entry: {e}')

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
        if tournament and tournament.status == 'upcoming': # 本来upcomingではないリクエストは来ない
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
    try:
        await websocket.send(text_data=json.dumps({
            'type': 'tournament',
            'action': action
        }))
    except Exception as e:
        logger.error(f'Error in send_entry_error: {e}')
    logger.error(f'sent error to user: {action}')
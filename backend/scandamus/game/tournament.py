import json
import jwt
import logging

from django.contrib.auth.models import User
from .models import Player
from .models import Tournament
from django.conf import settings
from django.db import transaction, IntegrityError
from channels.db import database_sync_to_async
from datetime import datetime, timedelta, timezone
from django.utils.timezone import make_aware, now as django_now
from .match_utils import send_match_jwt_to_all, authenticate_token, get_player_by_user, get_required_players

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

    tournament, created = await create_tournament(data)
    if tournament is None:
        return # 無効なjsonを送ってきた場合はセキュリティの観点から無視
    if created:
        await consumer.send(text_data=json.dumps({
            'type': 'tournament',
            'action': 'created',
            'name': tournament.name,
            'start': tournament.start.isoformat(),
        }))
    else:
        await consumer.send(text_data=json.dumps({
            'type': 'tournament',
            'action': 'alreadyExists',
            'name': tournament.name,
            'start': tournament.start.isoformat(),
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
        if start_utc < min_start:
            raise ValueError(f'Start date must be at least {min_offset} minutes in the future')

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
    except ValueError as e: # 時刻がCREATE_TOURNAMENT_TIMELIMIT_MIN分より前だった場合
        logger.error(f'Validation error: {e}')
        return None, None
    except Exception as e:
        logger.error(f'Error in tournament json: {e}')
        return None, None

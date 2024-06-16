import json
import jwt
import logging

# from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User
from .models import Player
from .models import Match
from channels.db import database_sync_to_async
from datetime import datetime, timedelta
from rest_framework_simplejwt.backends import TokenBackend
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError, TokenBackendError
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from .utils import generate_game_jwt
from django.conf import settings
from django.db import transaction

logger = logging.getLogger(__name__)

async def handle_join_game(consumer, token):
    user, error = await authenticate_token(token)
    if user:
        player = await get_player_from_user(user)
        if not player:
            logger.error(f"No player found for user: {user.username}")
        consumer.gamePlayers[user.username] = {
            'user': user,
            'players_id': player.id,
            'websocket': consumer
        }
        logger.info(f"user={user.username} requesting new game match")
        if len(consumer.gamePlayers) == 2:
            logger.debug("Two players found, starting match creation process")
            players_list = list(consumer.gamePlayers.values())
            logger.info(f'Players list: {players_list}')
            player1 = await get_player_from_user(players_list[0]['user'])
            player2 = await get_player_from_user(players_list[1]['user'])
            logger.debug(f"Player 1: {player1.id}, Player 2: {player2.id}")
            match = await create_match(player1, player2)
            for player in players_list:
                game_token = await issue_jwt(player['user'], player['players_id'], match.id)
                await player['websocket'].send(text_data=json.dumps({
                    'type': 'gameSession',
                    'jwt': game_token,
                    'username': player['user'].username,
                    'match_id': match.id
                }))
                consumer.gamePlayers.clear()
    else:
        logger.error('Error: Authentication Failed')
        logger.error(f'error={error}')
        await consumer.send(text_data=json.dumps({
            'type': 'authenticationFailed',
            'message': error
        }))
        
async def handle_join_game_cancel(consumer):
    if hasattr(consumer, 'user') and consumer.user.username in consumer.gamePlayers:
        del consumer.gamePlayers[consumer.user.username]
        logger.info(f'{consumer.user.username}: cancel accepted.')

@database_sync_to_async
def get_player_from_user(user):
    try:
        return Player.objects.get(user=user)
    except Player.DoesNotExist:
        logger.info(f"Player doesn't exist for user: {user.username}")
        return None

@database_sync_to_async
def issue_jwt(user, players_id, match_id):
    expire = datetime.utcnow() + timedelta(minutes=1)
    payload = {
        'user_id': user.id,
        'username': user.username,
        'players_id': players_id,
        'match_id': match_id,
        'iat': datetime.utcnow(),
        'exp': expire,
        'aud': 'pong-server',
        'iss': 'backend'
    }
    token = jwt.encode(payload, settings.SIMPLE_JWT['SIGNING_KEY'], algorithm='HS256')
    return token

@database_sync_to_async
def create_match(player1, player2):
    # マッチをDBに登録
    with transaction.atomic():
        match = Match.objects.create(
            player1=player1,
            player2=player2,
            status='before'
        )
    logger.info(f'Match created, {match}, ID: {match.id}, Player1: {match.player1}, Player2: {match.player2}')
    return match

@database_sync_to_async
def authenticate_token(token):
    try:
        token_backend = TokenBackend(algorithm=settings.SIMPLE_JWT['ALGORITHM'], signing_key=settings.SIMPLE_JWT['SIGNING_KEY'])
        validated_token = token_backend.decode(token, verify=True)
        user_id = validated_token['user_id']
        user = User.objects.get(id=user_id)
        #self.user = user
        return user, None
    except TokenBackendError as e:
        logger.info(f"TokenBackendError: " + str(e))
        return None, 'Error: Token Backend Error.'
    except (InvalidToken, TokenError) as e:
        logger.info(f"Error decoding token: {str(e)}")
        return None, 'Error: Token is invalid or expired.'
    except (User.DoesNotExist) as e:
        logger.info(f"User not found")
        return None, 'User not found'

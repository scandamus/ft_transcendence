import json
import jwt
import logging

from django.contrib.auth.models import User
from .models import Player
from .models import Match
from channels.db import database_sync_to_async
from datetime import datetime, timedelta
from rest_framework_simplejwt.backends import TokenBackend
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError, TokenBackendError
from django.conf import settings
from django.db import transaction

logger = logging.getLogger(__name__)

async def send_friend_match_jwt(consumer, from_username, game_name='pong'):
    player1 = await get_player_by_username(from_username)
    player2 = consumer.player
    match = await create_match(player1, player2)
    
    for player in [player1, player2]:
        game_token = await issue_jwt(player.user, player.id, match.id, game_name)
        websocket = consumer.players.get(player.user.username)
        player_name = 'player1' if player == player1 else 'player2'
        try:
            await websocket.send(text_data=json.dumps({
                'type': 'gameSession',
                'game_name': game_name,
                'jwt': game_token,
                'username': player.user.username,
                'match_id': match.id,
                'player_name': player_name
            }))
        except Exception as e:
            logger.error(f'Failed to send message to {player.user.username}: {e}')

        await update_player_status_and_match(player, match, 'frined_match')
        

async def send_lounge_match_jwt_to_all(consumer, players_list, game_name):
    match = await create_match_universal(players_list, game_name)
    for index, player_info in enumerate(players_list):
        player = player_info['player']
        user = await get_user_by_player(player)
        player_id = player_info['players_id']
        game_token = await issue_jwt(user, player_id, match.id, game_name)
        websocket = player_info['websocket']
        player_name = f'player{index + 1}'
        try:
            await websocket.send(text_data=json.dumps({
                'type': 'gameSession',
                'game_name': game_name, 
                'jwt': game_token,
                'username': player.user.username,
                'match_id': match.id,
                'player_name': player_name            
            }))
        except Exception as e:
            logger.error(f'Failed to send message to {player.user.username}: {e}')
        
        await update_player_status_and_match(player, match, 'lounge_match')

@database_sync_to_async
def get_user_by_player(player):
    return player.user

@database_sync_to_async
def get_player_by_username(username):
    return Player.objects.get(user__username=username)

@database_sync_to_async
def get_player_by_user(user):
    try:
        return Player.objects.get(user=user)
    except Player.DoesNotExist:
        logger.info(f"Player doesn't exist for user: {user.username}")
        return None

@database_sync_to_async
def issue_jwt(user, players_id, match_id, game_name='pong'):
    expire = datetime.utcnow() + timedelta(minutes=1)
    payload = {
        'game_name': game_name,
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
def create_match_universal(players_list, game_name):
    with transaction.atomic():
        len_of_players_list = len(players_list)
        if get_required_players(game_name) is not len_of_players_list:
            logger.error(f'Error create match for {game_name}')
            return
        
        player1 = players_list[0]['player'] if len_of_players_list > 0 else None
        player2 = players_list[1]['player'] if len_of_players_list > 1 else None
        player3 = players_list[2]['player'] if len_of_players_list > 2 else None
        player4 = players_list[3]['player'] if len_of_players_list > 3 else None

        match = Match.objects.create(
            game_name=game_name,
            status='before',
            player1=player1,
            player2=player2,
            player3=player3,
            player4=player4,
        )
        match.save()
    logger.info(f'Match created, ID: {match.id}, Players: {[player_info["user"].username for player_info in players_list]}')
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

def get_required_players(game_name):
    return 4 if game_name == 'pong4' else 2

@database_sync_to_async
def update_player_status_and_match(player, match, status):
    player.status = status
    player.current_match = match
    player.save()

@database_sync_to_async
def update_player_status(player, status):
    player.status = status
    player.save()
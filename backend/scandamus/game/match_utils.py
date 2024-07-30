import json
import jwt
import logging

from django.contrib.auth.models import User
from .models import Player
from .models import Match, Entry
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from datetime import datetime, timedelta
from rest_framework_simplejwt.backends import TokenBackend
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError, TokenBackendError
from django.conf import settings
from django.db import transaction
from asgiref.sync import async_to_sync

logger = logging.getLogger(__name__)

async def send_friend_match_jwt(consumer, from_username, game_name='pong'):
    player1 = await get_player_by_username(from_username)
    player2 = consumer.player
    match = await create_match(player1, player2)
    usernames = [{'username': player1.user.username, 'avatar': player1.avatar.url if player2.avatar else None},
                 {'username': player2.user.username, 'avatar': player2.avatar.url if player2.avatar else None}]

    for player in [player1, player2]:
        player_name = 'player1' if player == player1 else 'player2'
        game_token = await issue_jwt(player.user, player_name, player.id, match.id, game_name)
        websocket = consumer.players.get(player.user.username)
        try:
            await websocket.send(text_data=json.dumps({
                'type': 'gameSession',
                'game_name': game_name,
                'jwt': game_token,
                'username': player.user.username,
                'all_usernames': usernames,
                'match_id': match.id,
                'player_name': player_name
            }))
        except Exception as e:
            logger.error(f'Failed to send message to {player.user.username}: {e}')

        await update_player_status_and_match(player, match, 'friend_match')

async def send_tournament_match_jwt(match, game_name='pong'):
    logger.info('send_tournament_match_jwt in')
    #from .consumers import LoungeSession

    tournament = await database_sync_to_async(lambda: match.tournament)()
    if not tournament:
        logger.error('Error match is not for tournament')
        return
    
    player1 = await database_sync_to_async(lambda: match.player1)()
    player2 = await database_sync_to_async(lambda: match.player2)()
    player1_nickname = await get_nickname(tournament, player1)
    player2_nickname = await get_nickname(tournament, player2)
    usernames = [{'username': player1_nickname, 'avatar': player1.avatar.url if player1.avatar else None},
                 {'username': player2_nickname, 'avatar': player2.avatar.url if player2.avatar else None}]
        
    for player in [player1, player2]:
        player_name = 'player1' if player == player1 else 'player2'
        user = await database_sync_to_async(lambda: player.user)()
        game_token = await issue_jwt(user, player_name, player.id, match.id, game_name)
        #websocket =  LoungeSession.players.get(player.user.username)
        channel_layer = get_channel_layer()

        try:
            #await websocket.send(text_data=json.dumps({
            await channel_layer.group_send(
                f'friends_{player.id}',
                {
                    'type': 'gameSessionTournament',
                    'game_name': game_name,
                    'jwt': game_token,
                    'username': player.user.username,
                    'all_usernames': usernames,
                    'match_id': match.id,
                    'player_name': player_name,
                    'tournament_name': tournament.name,
                    'round': match.round,
                    'tournament_id': tournament.id,
                }
            )
            await update_player_status_and_match(player, match, 'tournament_match')
        except Exception as e:
            logger.error(f'Failed to send message to {player.user.username}: {e}')

async def send_lounge_match_jwt_to_all(consumer, players_list, game_name):
    match = await create_match_universal(players_list, game_name)
    usernames = [
        {'username': player_info['player'].user.username,
         'avatar': player_info['player'].avatar.url if player_info['player'].avatar else None}
        for player_info in players_list]

    for index, player_info in enumerate(players_list):
        player = player_info['player']
        user = await get_user_by_player(player)
        player_id = player_info['players_id']
        player_name = f'player{index + 1}'
        game_token = await issue_jwt(user, player_name, player_id, match.id, game_name)
        websocket = player_info['websocket']
        try:
            await websocket.send(text_data=json.dumps({
                'type': 'gameSession',
                'game_name': game_name, 
                'jwt': game_token,
                'username': player.user.username,
                'all_usernames': usernames,
                'match_id': match.id,
                'player_name': player_name            
            }))
        except Exception as e:
            logger.error(f'Failed to send message to {player.user.username}: {e}')
        
        await update_player_status_and_match(player, match, 'lounge_match')

def send_reconnect_match_jwt(consumer, player, match):
    logger.info(f'{player.user.username} send_reconnect_match_jwt in')
    game_name = match.game_name
    match_id = match.id
    player_id = player.id
    tournament_name = match.tournament.name if match.tournament is not None else None
    tournament_id = match.tournament.id if match.tournament else None
    round = match.round
    players = [match.player1, match.player2, match.player3 if match.player3 else None, match.player4 if match.player4 else None]
    usernames = [
        {'username': each_player.user.username,
         'avatar': each_player.avatar.url if each_player.avatar else None}
        for each_player in players if each_player is not None]
    
    if len(usernames) == 2 and match.tournament is not None:
        player1_nickname = async_to_sync(get_nickname)(match.tournament, match.player1)
        player2_nickname = async_to_sync(get_nickname)(match.tournament, match.player2)
        usernames[0]['username'] = player1_nickname
        usernames[1]['username'] = player2_nickname

    user = player.user
    player_name = 'player1' if player == match.player1 else 'player2' if player == match.player2 else 'player3' if player == match.player3 else 'player4' if player == match.player4 else None
    game_token = async_to_sync(issue_jwt)(user, player_name, player_id, match_id, game_name)
    try:
        async_to_sync(consumer.send)(text_data=json.dumps({
            'type': 'gameSessionReconnect',
            'tournament': 'true' if match.tournament is not None else 'false',   
            'game_name': game_name, 
            'jwt': game_token,
            'username': player.user.username,
            'all_usernames': usernames,
            'match_id': match_id,
            'player_name': player_name,
            'tournament_name': tournament_name,
            'round': round,
            'tournament_id': tournament_id               
        }))
        logger.info(f'gameSessionReconnect is sent to {player.user.username}')
    except Exception as e:
        logger.error(f'Failed to send message to {player.user.username}: {e}')

def notify_bye_player(tournament):
    logger.info(f'notify_bye_player in {tournament.name}')
    player = tournament.bye_player
    channel_layer = get_channel_layer()

    try:
        async_to_sync(channel_layer.group_send)(
            f'friends_{player.id}',
            {
                'type': 'send_notification_bye_player',
                'tournament_name': tournament.name
            }
        )
    except Exception as e:
        logger.error(f'Failed to send message to {player.user.username}: {e}')

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
def issue_jwt(user, player_name, players_id, match_id, game_name='pong'):
    expire = datetime.utcnow() + timedelta(minutes=1)
    payload = {
        'game_name': game_name,
        'user_id': user.id,
        'username': user.username,
        'player_name': player_name,
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
    logger.info(f'update_player_status {player.user.username}: {status}')
    player.status = status
    player.save()

@database_sync_to_async
def get_nickname(tournament, player):
    try:
        entry = Entry.objects.get(tournament=tournament, player=player)
        logger.info(f'Nickname for player {player.id}: {entry.nickname}')
        return entry.nickname
    except Exception as e:
        logger.error(f'Error in get_nickname for player {player.id} in tournament {tournament.id}: {e}')
        return None
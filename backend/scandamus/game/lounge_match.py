import json
import jwt
import logging

from django.contrib.auth.models import User
from .models import Player
from .models import Match
from django.conf import settings
from django.db import transaction
from .match_utils import send_lounge_match_jwt_to_all, authenticate_token, get_player_by_user, get_required_players, update_player_status

logger = logging.getLogger(__name__)

async def handle_join_lounge_match(consumer, token, game_name):
    if not validate_game_name(game_name):
        logger.error(f'Error game_name:{game_name} in handle_join_lounge_match')
        return
    
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
    if player.status != 'waiting':
        logger.error(f'{user.username} can not request new game as playing the match')
        return

    async with consumer.matchmaking_lock:
        if game_name not in consumer.gamePlayers:
            consumer.gamePlayers[game_name] = {}
        consumer.gamePlayers[game_name][user.username] = {
            'user': user,
            'player': player,
            'players_id': player.id,
            'websocket': consumer
        }
        
        await update_player_status(player, 'lounge_waiting')
        logger.info(f"user={user.username} requesting new game match")
        required_players = get_required_players(game_name)
    
        if len(consumer.gamePlayers[game_name]) == required_players:
            logger.debug("Two players found, starting match creation process")
            players_list = list(consumer.gamePlayers[game_name].values())
            await send_lounge_match_jwt_to_all(consumer, players_list, game_name)
            consumer.gamePlayers[game_name].clear()
        else:
            await send_available_players(consumer, game_name)

async def handle_exit_lounge_room(consumer, game_name):
    if hasattr(consumer, 'user') and consumer.user.username in consumer.gamePlayers[game_name]:
        del consumer.gamePlayers[game_name][consumer.user.username]
        logger.info(f'{consumer.user.username}: cancel accepted.')
        await send_available_players(consumer, game_name)
        await update_player_status(consumer.player, 'waiting')
    else:
        logger.info(f'Handle_exit_lounge_room: no more player in this {game_name} room')

async def send_available_players(consumer, game_name):
    required_players = get_required_players(game_name)
    available_players = required_players - len(consumer.gamePlayers[game_name])
    message = json.dumps({
        'type': 'lounge',
        'action': 'update',
        'availablePlayers': available_players,
    })
    for player_info in consumer.gamePlayers[game_name].values():
        websocket = player_info['websocket']
        if websocket:
            await websocket.send(text_data=message)
        else:
            logger.warning(f'No websocket for player: {player_info['user'].username}')

def validate_game_name(game_name):
    return game_name == 'pong' or game_name == 'pong4'

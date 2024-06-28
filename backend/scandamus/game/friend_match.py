import json
import jwt
import logging

from django.contrib.auth.models import User
from .models import Player
from .models import Match
from django.conf import settings
from django.db import transaction
from .match_utils import send_friend_match_jwt, authenticate_token, get_player_by_username, get_player_by_user, update_player_status

logger = logging.getLogger(__name__)

async def handle_request_game(consumer, data):
    from .consumers import LoungeSession

    logger.info('handle_request_game in')
    opponent_name = data.get('opponent_username')
    token = data.get('token')
    
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

    try:
        opponent_player = await get_player_by_username(opponent_name)
    except Player.DoesNotExist:
        logger.error(f'Opponent player: {opponent_name} does not exist')
        try:
            await consumer.send(text_data=json.dumps({
                'type': 'frinedMatchRequest',
                'action': 'error',
                'error': 'userDoesnotExist',
                'message': f'{opponent_name} does not exist',
            }))
        except Exception as e:
            logger.error(f'Failed to send to consumer: {e}')
        return
    
    logger.info(f'opponent player: {opponent_name} status {opponent_player.status}')
    if opponent_player.status != 'waiting':
        logger.info(f'Opppnent player: {opponent_name} is not in waiting status')
        try:
            await consumer.send(text_data=json.dumps({
                'type': 'friendMatchRequest',
                'action': 'error',
                'error': 'playerNotWaitingStatus',
            }))
        except Exception as e:
            logger.error(f'Failed to send to consumer: {e}')
        return
    
    if opponent_name in consumer.players:
        request_id = f'{consumer.user.username}_vs_{opponent_name}'
        LoungeSession.pending_requests[request_id] = {
            'from_username': consumer.user.username,
            'to_username': opponent_name
        }
        logger.info(f'request_id = {request_id}')
        opponent_ws = consumer.players[opponent_name]
        try:
            await opponent_ws.send(text_data=json.dumps({
                'type': 'friendMatchRequest',
                'action': 'requested',
                'from': consumer.user.username,
                'from_id': user.id,
                'request_id': request_id,
            }))
            logger.info(f'Sent to opponent {opponent_name}')
            await update_player_status(player, 'friend_waiting')
            await update_player_status(opponent_player, 'friend_waiting')
            logger.info(f'player.status:{user.username} status:{player.status}')
            logger.info(f'opponent_player:{opponent_name} status:{player.status}')
        except Exception as e:
            logger.error(f'Failed to send message to {opponent_name}: {e}')
    else:
        try:
            await consumer.send(text_data=json.dumps({
                'type': 'friendMatchRequest',
                'action': 'error',
                'error': 'userOffline',
                'message': 'Opponent player not online',
            }))
            logger.info(f'Error opponent player is not online')
        except Exception as e:
            logger.error(f'Failed to send to consumer: {e}')

async def handle_accept_game(consumer, data):
    from .consumers import LoungeSession

    request_id = data.get('request_id')
    from_username = data.get('from_username')

    if not request_id or not from_username:
        await consumer.send(text_data=json.dumps({
            'type': 'friendMatchRequest',
            'action': 'error',
            'error': 'invalidRequest',
            'message': 'Invalid Request',
        }))
        logger.error(f'Error in handle_accept_game: no request_id or no username: ID {request_id}')
        return
    
    if not isinstance(request_id, (str, int)):
        logger.error(f'Error in handle_accept_game: request_id is not a string or int, request_id: {request_id}')
        return
    
    if request_id not in LoungeSession.pending_requests:
        await consumer.send(text_data=json.dumps({
            'type': 'friendMatchRequest',
            'action': 'error',
            'error': 'invalidRequest',
            'message': 'Invalid Request ID',
        }))
        logger.error(f'Error in handle_accept_game: request_id is invalid: ID {request_id}')
        return

    request = LoungeSession.pending_requests[request_id]
    if request['to_username'] != consumer.user.username:
        await consumer.send(text_data=json.dumps({
            'type': 'friendMatchRequest',
            'action': 'error',
            'error': 'requestNotMatch',
            'message': 'Request ID does not match', 
        }))
        return
        
    if from_username in consumer.players:
        await send_friend_match_jwt(consumer, request['from_username'])
        LoungeSession.pending_requests.pop(request_id)
    else:
        await consumer.send(text_data=json.dumps({
            'type': 'friendMatchRequest',
            'action': 'error',
            'error': 'userOffline',
            'message': 'Requester not online',
        }))

async def handle_reject_game(consumer, data):
    from .consumers import LoungeSession

    request_id = data.get('request_id')
    if not request_id:
        logger.error('Error in handle_reject_game: not request_id')
        return
    
    if request_id in LoungeSession.pending_requests:
        request = LoungeSession.pending_requests.pop(request_id)
        logger.info(f'Request {request_id} cancelled successfully.')
        to_username = request['to_username']

        # セキュリティ対策: 無関係なユーザーからのリジェクトを無視
        if consumer.user.username != to_username:
            logger.error(f'Error in handle_reject_game: invalid request for reject ID:{request_id} from {consumer.username}')
            return

        to_player = await get_player_by_username(to_username)
        update_player_status(to_player, 'waiting')
        
        from_username = request['from_username']
        if from_username in consumer.players:
            from_socket = consumer.players[from_username]
            from_player = await get_player_by_username(from_username)
            update_player_status(from_player, 'waiting')
            await from_socket.send(text_data=json.dumps({
                'type': 'friendMatchRequest',
                'action': 'rejected',
            }))
            logger.info(f'Sent rejected is happen to {from_username}')
        else:
            logger.error(f'{from_username} is not online')

async def handle_cancel_game(consumer, data):
    from .consumers import LoungeSession

    opponent_name = data.get('opponent_username')
    if not opponent_name:
        logger.error('Error in handle_cancel_game: empty opponent username')
        return
    
    try:
        request_id = f'{consumer.user.username}_vs_{opponent_name}'
        if not request_id in LoungeSession.pending_requests:
            logger.error(f'{consumer.user.username} request cancel invalid friend request {request_id}')
            return
        
        request = LoungeSession.pending_requests.pop(request_id)
        await update_player_status(consumer.player, 'waiting')

        to_username = request['to_username']
        if to_username in consumer.players:
            to_player = await get_player_by_username(to_username)
            await update_player_status(to_player, 'waiting')
            await consumer.players[to_username].send(text_data=json.dumps({
                'type': 'friendMatchRequest',
                'action': 'cancelled',                
            }))
            logger.info(f'Cancelled successfully and informed opponent player')
        else:
            logger.error(f'Cancelled successfully but opponent is not online')
    except Exception as e:
        logger.error(f'Error: {str(e)}')

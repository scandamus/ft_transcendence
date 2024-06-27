import json
import jwt
import logging

from django.contrib.auth.models import User
from .models import Player
from .models import Match
from django.conf import settings
from django.db import transaction
from .match_utils import send_match_jwt, authenticate_token

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
        await consumer.send(text_data=json.dumps({
            'type': 'authenticationFailed',
            'message': error
        }))
        return
    
    request_id = f'{consumer.user.username}_vs_{opponent_name}'
    LoungeSession.pending_requests[request_id] = {
        'from_username': consumer.user.username,
        'to_username': opponent_name
    }
    logger.info(f'request_id = {request_id}')
    if opponent_name in consumer.players:
        opponent_ws = consumer.players[opponent_name]
        await opponent_ws.send(text_data=json.dumps({
            'type': 'friendMatchRequest',
            'action': 'requested',
            'from': consumer.user.username,
            'from_id': user.id,
            'request_id': request_id,
        }))
        logger.info(f'Sent to opponent {opponent_name}')
    else:
        await consumer.send(text_data=json.dumps({
            'type': 'friendMatchRequest',
            'action': 'error',
            'error': 'userOffline',
            'message': 'Opponent player not online',
        }))
        logger.info(f'Error opponent player is not online')

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
        await send_match_jwt(consumer, request['from_username'])
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

        from_username = request['from_username']
        if from_username in consumer.players:
            from_socket = consumer.players[from_username]
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
            return
        
        request = LoungeSession.pending_requests.pop(request_id)
        to_username = request['to_username']
        if to_username in consumer.players:
            await consumer.players[to_username].send(text_data=json.dumps({
                'type': 'friendMatchRequest',
                'action': 'cancelled',                
            }))
            logger.info(f'Cancelled successfully and informed opponent player')
        else:
            logger.error(f'Cancelled successfully but opponent is not online')
    except Exception as e:
        logger.error(f'Error: {str(e)}')

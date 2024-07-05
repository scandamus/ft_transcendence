from rest_framework_simplejwt.authentication import JWTAuthentication

import json
import jwt
import logging

# from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User
from .models import Player
from channels.db import database_sync_to_async
from datetime import datetime, timedelta
from rest_framework_simplejwt.backends import TokenBackend
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError, TokenBackendError
#from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from django.conf import settings

logger = logging.getLogger(__name__)


class CustomJWTAuthentication(JWTAuthentication):
    def get_header(self, request):
        token = request.COOKIES.get('access')
        request.META['HTTP_AUTHORIZATION'] = '{header_type} {access_token}'.format(
            header_type="Bearer", access_token=token)
        refresh = request.COOKIES.get('refresh')
        request.META['HTTP_REFRESH_TOKEN'] = refresh
        return super().get_header(request)


async def handle_auth(consumer, token):
    user, error = await authenticate_token(token)
    if user:
        player = await get_player_from_user(user)
        if player:
            consumer.user = user
            consumer.player = player
            consumer.group_name = f'friends_{consumer.player.id}'
            await consumer.channel_layer.group_add(consumer.group_name, consumer.channel_name)
            logger.info(f'Authentiated user_id: {user.id}, username: {user.username}, player_id: {player.id}')
            try:
                await consumer.send(text_data=json.dumps({
                    'type': 'ack',
                    'message': 'Authentication successful'
                }))
            except () as e:
                logger.error(f'Error in handle_auth can not send')

        else:
            logger.error('Error: player not found')
            await consumer.send(text_data=json.dumps({
                'type': 'authenticationFailed',
                'message': 'Player not found'
            }))
    else:
        logger.error('Error: Authentication Failed')
        logger.error(f'error={error}')
        await consumer.send(text_data=json.dumps({
            'type': 'authenticationFailed',
            'message': error
        }))


@database_sync_to_async
def authenticate_token(token):
    try:
        token_backend = TokenBackend(algorithm=settings.SIMPLE_JWT['ALGORITHM'],
                                     signing_key=settings.SIMPLE_JWT['SIGNING_KEY'])
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


@database_sync_to_async
def get_player_from_user(user):
    try:
        return Player.objects.get(user=user)
    except Player.DoesNotExist:
        logger.info(f"Player doesn't exist for user: {user.username}")
        return None

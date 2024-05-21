import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework_simplejwt.backends import TokenBackend
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError, TokenBackendError
#from jwt.exceptions import ExpiredSignatureError
from .utils import generate_game_jwt
from django.conf import settings

import logging

logger = logging.getLogger(__name__)

class LoungeSession(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        action = text_data_json.get('action')

        if action == 'join_game':
            token = text_data_json.get('token')
            logger.info(f"token={token}")
            user = await self.get_user_from_token(token)
            if user:
                game_token = await self.issue_game_token(user)
                await self.send(text_data=json.dumps({
                    'type': 'gameSession',
                    'jwt': game_token,
                    'username': user.username,
                }))
            else:
                await self.send(text_data=json.dumps({
                    'error': 'User authentication failed'
                }))
        else:
            await self.send(text_data=json.dumps({
                'message': 'response from server'
            }))

    @database_sync_to_async
    def get_user_from_token(self, token):
        try:
            logger.info(f"Attempting to decode token: {token}, type: {type(token)}")
            logger.info(f"Using signing key: {settings.SIMPLE_JWT['SIGNING_KEY']}, type: {type(settings.SIMPLE_JWT['SIGNING_KEY'])}")
            logger.info(f"Using algorithm: {settings.SIMPLE_JWT['ALGORITHM']}")
            token_backend = TokenBackend(algorithm=settings.SIMPLE_JWT['ALGORITHM'], signing_key=settings.SIMPLE_JWT['SIGNING_KEY'])
            validated_token = token_backend.decode(token, verify=True)
        #    access_token = AccessToken(token)
            user_id = validated_token['user_id']
            return User.objects.get(id=user_id)
        except TokenBackendError as e:
            logger.info(f"TokenBackendError: " + str(e))
            return None
        except (InvalidToken, TokenError) as e:
            logger.info(f"Error decoding token: {str(e)}")
            return None
        except (User.DoesNotExist) as e:
            logger.info(f"User does not exist")
            return None
#        except Exception as e:
#            logger.info(f"Unhandled exception caught: {str(e)}")

    @database_sync_to_async
    def issue_game_token(self, user):
        # ゲームセッション用トークン発行
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)

    async def disconnect(self, close_code):
        pass
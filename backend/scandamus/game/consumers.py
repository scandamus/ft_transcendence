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
from django.db import transaction

from .models import Match
from players.models import Player
import logging

logger = logging.getLogger(__name__)

class LoungeSession(AsyncWebsocketConsumer):
    players = {}

    async def connect(self):
        await self.accept()

    async def receive(self, text_data):
        logger.info(f"received text_data: {text_data}")
        try:
            text_data_json = json.loads(text_data)
            logger.info(f"Decoded JSON: {text_data_json}, Type: {type(text_data_json)}")  # 追加: デコード後のデータをログに記録
            if not isinstance(text_data_json, dict):
                logger.error(f"Type error: Expected dict, got {type(text_data_json).__name__}")
                raise TypeError("Expected text_data_json to be a dict")
            action = text_data_json.get('action')
            logger.info(f"Action: {action}")
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {str(e)}")
            await self.close()
            return
        except AttributeError as e:
            logger.error(f"aaaAttribute error: {str(e)}")
            await self.close()
            return

        if action == 'join_game':
            token = text_data_json.get('token')
            logger.info(f"token={token}")
            user = await self.get_user_from_token(token)
            if user:
                self.players[user.username] = {
                    'user': user,
                    'websocket': self
                }
                logger.info(f"user={user.username} requesting new game match")
                if len(self.players) == 2:
                    players_list = list(self.players.values())
                    player1 = await self.get_player_from_user(players_list[0]['user'])
                    player2 = await self.get_player_from_user(players_list[1]['user'])
                    match = await self.create_match(player1, player2)
                    for player in players_list:
                        game_token = await self.issue_game_token(player['user'])
                        await player['websocket'].send(text_data=json.dumps({
                            'type': 'gameSession',
                            'jwt': game_token,
                            'username': player['user'].username,
                            'match_id': match.id
                        }))
                    self.players.clear()
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

    @database_sync_to_async
    def get_player_from_user(self, user):
        try:
            return Player.objects.get(user=user)
        except Player.DoesNotExist:
            logger.info(f"Player doesn't exist for user: {user.username}")
            return None

    @database_sync_to_async
    def issue_game_token(self, user):
        # ゲームセッション用トークン発行
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)

    @database_sync_to_async
    def create_match(self, player1, player2):
        # マッチをDBに登録
        with transaction.atomic():
            match = Match.objects.create(
                player1=player1,
                player2=player2,
                status='before'
            )
        logger.info('Match created')
        return match

    async def disconnect(self, close_code):
        pass

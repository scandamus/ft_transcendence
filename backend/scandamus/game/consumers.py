import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User
from .utils import generate_game_jwt
import logging
from .join_game import handle_join_game, handle_join_game_cancel, handle_game_state
from .friends import send_friend_request, send_friend_request_by_username, accept_friend_request, decline_friend_request, remove_friend
from players.auth import handle_auth

logger = logging.getLogger(__name__)

class LoungeSession(AsyncWebsocketConsumer):
    players = {}
    gamePlayers = {}

    async def connect(self):
        await self.accept()
        self.user = self.scope['user']

    async def receive(self, text_data):
        logger.info(f"received text_data: {text_data}")
        try:
            text_data_json = json.loads(text_data)
            logger.info(f"Decoded JSON: {text_data_json}, Type: {type(text_data_json)}")  # 追加: デコード後のデータをログに記録
            if not isinstance(text_data_json, dict):
                logger.error(f"Type error: Expected dict, got {type(text_data_json).__name__}")
                raise TypeError("Expected text_data_json to be a dict")
            action = text_data_json.get('action')
            token = text_data_json.get('token')
            logger.info(f"Action: {action}")
            logger.info(f"token={token}")
            # logger.info(f"------------------------------------ {text_data_json['opponentName']}")

            if action == 'authWebSocket':
                await handle_auth(self, token)
            if action == 'joinGame':
                await handle_join_game(self, token, text_data_json['opponentName'])
            # elif action == 'gameState':
            #     await handle_game_state(self, token, text_data_json['match_id'], text_data_json['score1'], text_data_json['score2'], text_data_json['status'])
            elif action == 'cancel':
                await handle_join_game_cancel(self)
            elif action == 'requestByUsername':
                await send_friend_request_by_username(self, text_data_json['username'])
            elif action == 'sendRequest':
                await send_friend_request(self, text_data_json['username'])
            elif action == 'acceptRequest':
                await accept_friend_request(self, text_data_json['request_id'])
            elif action == 'declineRequest':
                await decline_friend_request(self, text_data_json['request_id'])
            elif action == 'removeFriend':
                await remove_friend(self, text_data_json['username'])
            else:
                await self.send(text_data=json.dumps({
                    'message': 'response from server'
                }))

        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {str(e)}")
            await self.close()
        except AttributeError as e:
            logger.error(f"aaaAttribute error: {str(e)}")
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, 'user') and self.user.username in self.players:
            del self.players[self.user.username]
            logger.info(f'User {self.user.username} disconnected and removed from players list.')
        else:
            logger.info('Disconnect called but no user found.')

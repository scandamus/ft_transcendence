import json
import asyncio
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User
from .utils import generate_game_jwt
from .friends import send_friend_request, send_friend_request_by_username, accept_friend_request, decline_friend_request, remove_friend
from players.auth import handle_auth
from .friend_match import handle_request_game, handle_accept_game, handle_reject_game, handle_cancel_game
from .lounge_match import handle_join_lounge_match, handle_exit_lounge_room
from .tournament import handle_create_tournament

logger = logging.getLogger(__name__)

class LoungeSession(AsyncWebsocketConsumer):
    players = {}
    gamePlayers = {}
    pending_requests = {}
    matchmaking_lock = asyncio.Lock()

    async def connect(self):
        await self.accept()
        self.user = self.scope['user']

    async def receive(self, text_data):
        logger.info(f'received text_data: {text_data}')
        try:
            text_data_json = json.loads(text_data)
            logger.info(f'Decoded JSON: {text_data_json}, Type: {type(text_data_json)}')  # 追加: デコード後のデータをログに記録
            if not isinstance(text_data_json, dict):
                logger.error(f'Type error: Expected dict, got {type(text_data_json).__name__}')
                raise TypeError('Expected text_data_json to be a dict')
            msg_type = text_data_json.get('type')
            action = text_data_json.get('action')
            token = text_data_json.get('token')
            logger.info(f'Action: {action}')
            logger.info(f'token={token}')

            if msg_type == 'authWebSocket':
                await handle_auth(self, token)
            elif msg_type == 'friendMatchRequest':
                if action == 'requestGame':
                    await handle_request_game(self, text_data_json)
                elif action == 'acceptGame':
                    await handle_accept_game(self, text_data_json)
                elif action == 'rejectGame':
                    await handle_reject_game(self, text_data_json)
                elif action == 'cancelGame':
                    await handle_cancel_game(self, text_data_json)
                # # join_gameは廃止？
                # elif action == 'joinGame':
                #     await handle_join_game(self, token)
                # elif action == 'cancel':
                #     await handle_join_game_cancel(self)
            elif msg_type == 'friendRequest':
                if action == 'requestByUsername':
                    await send_friend_request_by_username(self, text_data_json['username'])
                elif action == 'sendRequest':
                    await send_friend_request(self, text_data_json['user_id'])
                elif action == 'acceptRequest':
                    await accept_friend_request(self, text_data_json['request_id'])
                elif action == 'declineRequest':
                    await decline_friend_request(self, text_data_json['request_id'])
                elif action == 'removeFriend':
                    await remove_friend(self, text_data_json['username'])
            elif msg_type == 'lounge':
                if action == 'requestJoinMatch':
                    await handle_join_lounge_match(self, token, text_data_json['game'])
                elif action == 'requestExitRoom':
                    await handle_exit_lounge_room(self, text_data_json['game'])
            elif msg_type == 'tournament':
                if action == 'createTournament':
                    await handle_create_tournament(self, text_data_json)
            else:
                await self.send(text_data=json.dumps({
                    'message': 'response from server'
                }))

        except json.JSONDecodeError as e:
            logger.error(f'JSON decode error: {str(e)}')
            await self.close()
        except AttributeError as e:
            logger.error(f'aaaAttribute error: {str(e)}')
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, 'user') and self.user.username in self.players:
            del self.players[self.user.username]
            logger.info(f'User {self.user.username} disconnected and removed from players list.')
        else:
            logger.info('Disconnect called but no user found.')

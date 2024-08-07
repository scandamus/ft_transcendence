import json
import asyncio
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User
from players.models import Player
from .friends import send_friend_request, send_friend_request_by_username, accept_friend_request, decline_friend_request, remove_friend
from players.auth import handle_auth
from .friend_match import handle_request_game, handle_accept_game, handle_reject_game, handle_cancel_game
from .lounge_match import handle_join_lounge_match, handle_exit_lounge_room
from .tournament import handle_create_tournament, handle_entry_tournament, handle_cancel_entry
from .tournament_match import handle_enter_tournament_room
from players.friend_utils import send_status_to_friends
from .match_utils import get_player_by_user, send_tournament_match_jwt, update_player_status, get_player_by_id
from channels.db import database_sync_to_async
from channels.auth import get_user

logger = logging.getLogger(__name__)

class LoungeSession(AsyncWebsocketConsumer):
    players = {}
    gamePlayers = {}
    pending_requests = {}
    tournament_entry = {}
    matchmaking_lock = asyncio.Lock()

    async def connect(self):
        await self.accept()
        self.player = None
        self.user = None

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
                LoungeSession.players[self.user.username] = self
                logger.info(f'LoungeSession.players: {list(LoungeSession.players.keys())}')
                return
            
            if not self.player or not self.user:
                logger.error('Error in receive: authWebSocket needed')
                return

            self.player = await get_player_by_id(self.player.id)
            logger.info(f'received by {self.user.username}')

            if msg_type == 'friendMatchRequest':
                if action == 'requestGame':
                    await handle_request_game(self, text_data_json)
                elif action == 'acceptGame':
                    await handle_accept_game(self, text_data_json)
                elif action == 'rejectGame':
                    await handle_reject_game(self, text_data_json)
                elif action == 'cancelGame':
                    await handle_cancel_game(self, text_data_json)
            elif msg_type == 'friendRequest':
                if action == 'requestByUsername':
                    await send_friend_request_by_username(self, text_data_json['username'])
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
                elif action == 'entryTournament':
                    await handle_entry_tournament(self, text_data_json)
                elif action == 'cancelEntry':
                    await handle_cancel_entry(self, text_data_json)
                elif action == 'enterRoomRequest':
                    await handle_enter_tournament_room(self, token, text_data_json)
            else:
                await self.send(text_data=json.dumps({
                    'message': 'response from server'
                }))

        except json.JSONDecodeError as e:
            logger.error(f'JSON decode error: {str(e)}')
            await self.close()
        except AttributeError as e:
            logger.error(f'Attribute error in receive: {str(e)} - {text_data}')
            await self.close()
        except Exception as e:
            logger.error(f'Unexpected error: {str(e)}')
            await self.close()

    async def friend_status(self, event):
        logger.info(f'friend_status in : {self.user.username}')
        changed_username = event['username']
        online_status = event['online']
        await self.send(text_data=json.dumps({
            'type': 'friendStatus',
            'action': 'change',
            'username': changed_username,
            'online': online_status,
        }))
        logger.info(f'sent online status: {online_status} of {changed_username} to {self.user.username}')

    async def friend_status(self, event):
        logger.info(f'friend_status in : {self.user.username}')
        changed_username = event['username']
        online_status = event['online']
        await self.send(text_data=json.dumps({
            'type': 'friendStatus',
            'action': 'change',
            'username': changed_username,
            'online': online_status,
        }))
        logger.info(f'sent online status: {online_status} of {changed_username} to {self.user.username}')

    async def disconnect(self, close_code):
        if hasattr(self, 'user') and self.user is not None and self.user.username in self.players:
            del LoungeSession.players[self.user.username]
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
            logger.info(f'User {self.user.username} disconnected and removed from players list.')
            logger.info(f'LoungeSession.players: {list(LoungeSession.players.keys())}')

            # reset player status
            player = await get_player_by_id(self.player.id)
            if player:
                if player.status in ['friend_waiting', 'lounge_waiting']:
                    player.status = 'waiting'
                    await database_sync_to_async(player.save)(update_fields=['status'])
                    logger.info(f'{self.user.username} status set to waiting')
                    logger.info(f'//-- player save() on: disconnect 1')
                player.online = False
                await database_sync_to_async(player.save)(update_fields=['online'])
                logger.info(f'//-- player save() on: disconnect 2')
                await send_status_to_friends(player, 'offline')
  
            # remove pending_requests
            request_to_remove = []
            for request_id, request in self.pending_requests.items():
                if request['from_username'] == self.user.username:
                    request_to_remove.append(request_id)

            for request_id in request_to_remove:
                request = self.pending_requests.pop(request_id)
                logger.info(f'Removed pending request {request_id} due to disconnection')

                to_username = request['to_username']
                if to_username in self.players:
                    await self.players[to_username].send(text_data=json.dumps({
                        'type': 'friendMatchRequest',
                        'action': 'cancelled',                
                    }))
                    logger.info(f'Cancelled successfully and informed opponent player')
                else:
                    logger.error(f'Cancelled successfully but opponent is not online')
        else:
            logger.info('Disconnect called but no user found.')

    # jsonのスタイルに合わせてここはcamelCaseのまま（受け取ったjsonをそのまま送るため）
    async def gameSessionTournament(self, data):
        try:
            username = data['username']
            logger.info(f'tournament jwt is sending to {username}')
            await self.send(text_data=json.dumps(data))
        except Exception as e:
            logger.error(f'Error in gameSessionTournament: {e}')

    async def send_notification_bye_player(self, event):
        logger.info('notify_by_player in')
        try:
            await self.send(text_data=json.dumps({
                'type': 'tournamentMatch',
                'action': 'notifyByePlayer',
                'name': event['tournament_name']
            }))
        except Exception as e:
            logger.error(f'Error in gameSessionTournament: {e}')

    async def send_notification(self, event):
        try:
            player_id = event['player_id']
            action = event['action']
            name = event['name']
            logger.info(f'player_id:{player_id} tournament:{name} {action}')

            await self.send(text_data=json.dumps({
                    'type': 'tournamentMatch',
                    'action': action,
                    'name': name
            }))
#            if action == 'startMatch':
#                await send_tournament_match_jwt(self, event)
            if action == 'canceled':
                player = await get_player_by_user(self.user)
                await update_player_status(player, 'waiting')
        except Exception as e:
            logger.error(f'Error in send_notification: {e}')

    async def disconnect_by_new_login(self, event):
        logger.info('Disconnect by new login')
        try:
            await self.send(text_data=json.dumps({
                'type': 'disconnectByNewLogin'
            }))
        except Exception as e:
            logger.error(f'Error in send disconnect by new login')
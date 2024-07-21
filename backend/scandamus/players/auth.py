import json
import jwt
import logging

# from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User
from .models import Player
from game.models import Tournament, Entry
from channels.db import database_sync_to_async
from datetime import datetime, timedelta
from rest_framework_simplejwt.backends import TokenBackend
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError, TokenBackendError
from django.core.exceptions import ObjectDoesNotExist
#from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from django.conf import settings
from players.friend_utils import send_status_to_friends

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
            consumer.group_name = f'friends_{player.id}'
            await consumer.channel_layer.group_add(consumer.group_name, consumer.channel_name)
            logger.info(f'Authentiated user_id: {user.id}, username: {user.username}, player_id: {player.id}')

            if not player.online:
                player.online = True
                await database_sync_to_async(player.save)()
                logger.info(f'{user.username} online status is online')

                # tournament_prepare: トーナメントが準備中（5分前〜開始前）の場合
                if player.status == 'tournament_prepare' or player.status == 'tournament_room':
                    try:
                        tournament = await database_sync_to_async(Tournament.objects.get)(status='prepare')                
                        if tournament.status == 'preparing' and await is_entry_available(player, tournament):                        
                            await consumer.send(text_data=json.dumps({
                                'type': 'tournamentMatch',
                                'action': player_status,
                                'name': tournament.name
                            }))
                        else: # すでにエントリーしていたトーナメントが開始後だった場合
                            raise ObjectDoesNotExist  # エントリーが無効な場合も例外を発生させる
                    except ObjectDoesNotExist:
                        player.status = 'waiting'
                        await database_sync_to_async(player.save)()
                        logger.info('Player status set to waiting')

                # continue match: マッチ中に切断したユーザーが再度接続した際にマッチへの復帰を試みる
                if player.status in ['friend_match', 'lounge_match', 'tournament_match']:
                    match = await database_sync_to_async(lambda: player.current_match)()    
                    logger.info(f'handle_auth: {user.username} is in match_id {match.id}!!')
                    # TODO: マッチ復帰トライ処理
                    player.status = 'waiting'
                    player.current_match = None
                    await database_sync_to_async(player.save)()
                    
                # reset player status: backendが意図せず落ちるなどdisconnect時のリセット処理がされなかった場合の対応
                if player.status in ['friend_waiting', 'lounge_waiting']:
                    player.status = 'waiting'
                    await database_sync_to_async(player.save)()
                    logger.info(f'{user.username} status set to waiting')
                
                # オフラインからオンラインになった場合にフレンドへ通知
                await send_status_to_friends(player, 'online')

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

@database_sync_to_async
def is_entry_available(player, tournament):
    try:
        entry = Entry.objects.get(tournament=tournament, player=player)
        return entry is not None
    except Entry.DoesNotExist:
        return False
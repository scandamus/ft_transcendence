import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from players.models import FriendRequest, Player
from django.contrib.auth.models import User
from channels.db import database_sync_to_async

logger = logging.getLogger(__name__)

@database_sync_to_async
def get_user(user_id):
    try:
        logger.info(f'user_id={user_id}')
        user = User.objects.get(id=user_id)
        logger.info(f'User found: {user.username}')
        player_profile = user.player_profile
        logger.info(f'Player profile found for user {user.username}')
        return player_profile
    except User.DoesNotExist:
        logger.error(f'User with id {user_id} does not exist')
        raise
    except Exception as e:
        logger.error(f'Error retrieving player profile for user {user_id}: {str(e)}')
        raise

# @database_sync_to_async
# def get_player(user):
#     try:
#         return Player.objects.get(user=user)
#     except Player.DoesNotExist:
#         logger.error(f'Player profile does not exist for user {user.username}')
#         raise

@database_sync_to_async
def get_player_from_user(user):
    try:
        logger.info(f"get_player_from_user: {user.username}")
        player = Player.objects.get(user=user)
        logger.info(f"player.usr.usrname= {player.user.username}")
        return Player.objects.get(user=user)
    except Player.DoesNotExist:
        logger.info(f"Player doesn't exist for user: {user.username}")
        return None
    
@database_sync_to_async
def get_user_by_username(username):
    logger.info(f'get_user_by_username: username= {username}')
    return User.objects.get(username=username)

@database_sync_to_async
def create_friend_request(from_user, to_user):
    try:
        return FriendRequest.objects.get_or_create(from_user=from_user, to_user=to_user)
    except Exception as e:
        logger.error(f'Error in create_frined_request: {str(e)}')

@database_sync_to_async
def delete_friend_request(from_user, to_user):
    return FriendRequest.objects.filter(from_user=from_user, to_user=to_user).delete()
    
@database_sync_to_async
def get_friend_request(request_id):
    return FriendRequest.objects.get(id=request_id)

@database_sync_to_async
def approve_frined_request_db(friend_request):
        logger.debug(f'Approving friend request: {friend_request}')
        friend_request.to_user.friends.add(friend_request.from_user)
        friend_request.from_user.friends.add(friend_request.to_user)

        # 互いにフレンド申請していた場合にto_userからの申請もデータベースから削除する
        opposite_request = FriendRequest.objects.filter(from_user=friend_request.to_user, to_user=friend_request.from_user)
        if opposite_request.exists():
            opposite_request.delete()
        friend_request.delete()

@database_sync_to_async
def cancel_friend_request_db(request_id): #from_user, to_user):
     FriendRequest.objects.get(id=request_id).delete()
#        FriendRequest.objects.filter(from_user=from_user, to_user=to_user).delete()

@database_sync_to_async
def remove_friend_db(from_user, user_to_remove):
        from_user.friends.remove(user_to_remove)
        user_to_remove.friends.remove(from_user)

@database_sync_to_async
def get_username_by_player(player):
    return player.user.username

@database_sync_to_async
def get_user_request_from_username(friend_request):
        return friend_request.from_user.user.username

@database_sync_to_async
def get_user_request_to_username(friend_request):
        return friend_request.to_user.user.username

@database_sync_to_async
def get_from_id_by_request(friend_request):
     return friend_request.from_user.id
#        return friend_request.from_user.id

@database_sync_to_async
def get_to_id_by_request(friend_request):
    return friend_request.to_user.id
#        return friend_request.to_user.id



# @database_sync_to_async
# def are_already_friends(user1, user2):
#     return user1.friends.filter(id=user2.id).exists()

@database_sync_to_async
def are_already_friends(user1, user2):
    try:
        logger.info(f'Checking if {user1} and {user2} are already friends.')
        result = user1.friends.filter(id=user2.id).exists()
        logger.info(f'Friend check result: {result}')
        return result
    except Exception as e:
        logger.error(f'Error in are_already_friends: {str(e)}')
        raise


async def send_friend_request(consumer, player):
        to_user = player
        from_user = consumer.player
        to_user_id = to_user.user.id
        from_username = from_user.user.username
        to_username = to_user.user.username
        await create_friend_request(from_user, to_user)
        to_consumer = consumer.players.get(to_username)
        if to_consumer:
            await to_consumer.send(text_data=json.dumps(
                {
                    'type': 'friendRequest',
                    'from_username': from_username,
                    'to_username': to_username,
                    'action': 'received',
                }
            ))
        else:
             logger.error(f'User {to_username} not connected to WebSocket')
        await consumer.send(text_data=json.dumps(
            {
                'type': 'ack',
                'action': 'sentRequestSuccess',
                'to_username': to_username,
            }
        ))
        logger.info(f'Sent friend request from {from_username} to {to_username}')
    
async def accept_friend_request(consumer, request_id):
        friend_request = await get_friend_request(request_id)
        to_user_username = await get_user_request_to_username(friend_request)
        to_user_id = await get_to_id_by_request(friend_request)
        scope_user_username = await get_username_by_player(consumer.player)
        logger.info(f'scope_user_username={scope_user_username}')
        if to_user_username == scope_user_username:
            await approve_frined_request_db(friend_request)
            from_user_username = await get_user_request_from_username(friend_request)
            if from_user_username:
                 logger.info(f'accept_friend_request {from_user_username} to {to_user_username}')
            from_user_id = await get_from_id_by_request(friend_request)
            await consumer.players[from_user_username].send(text_data=json.dumps(
                 {
                    'type': 'friendRequest',
                    'from_username': to_user_username,
                    'action': 'accepted',                      
                 }
            ))
            await consumer.send(text_data=json.dumps(
                {
                    'type': 'ack',
                    'from_username': from_user_username,
                    'action': 'acceptRequestSuccess',
                }
            ))
            logger.info(f'Accepted friend request from {from_user_username}')
        else:
            from_user_username = await get_user_request_from_username(friend_request)
            logger.error(f'Error in accept_friend_request {from_user_username} to {to_user_username}')

async def decline_friend_request(consumer, request_id):
        friend_request = await get_friend_request(request_id)
        to_username = await get_user_request_to_username(friend_request)
        from_username = await get_user_request_from_username(friend_request)
        if friend_request.to_user != consumer.player:
             await consumer.send(text_data=json.dumps(
                  {
                       'type': 'ack',
                       'action': 'error',
                       'error': 'invalidDeclineFriendReq',
                  }
             ))
             return
        await cancel_friend_request_db(friend_request.id)
        await consumer.send(text_data=json.dumps(
            {
                'type': 'ack',
                'username': from_username,
                'action': 'declineRequestSuccess',
            }
        ))
        logger.info(f'Decline friend request {from_username} to {to_username}')

async def remove_friend(consumer, username):
        user_to_remove = await get_user_by_username(username)
        to_player = await get_player_from_user(user_to_remove)
        from_player = consumer.player
        await remove_friend_db(from_player, to_player)#user_to_remove)
        from_username = await get_username_by_player(from_player)
        to_username = await get_username_by_player(to_player)
        logger.info(f'Removing friend: from_player={from_username}, to_player={to_username}')

        await consumer.players[from_username].send(text_data=json.dumps(
            {
                'type': 'ack',
                'username': to_username,
                'action': 'removeSuccess',
            }
        ))
        await consumer.players[to_username].send(text_data=json.dumps(
            {
                'type': 'friendRequest',
                'from_username': from_username,
                'action': 'removed',
            }            
        ))
        logger.info(f'Remove friend {user_to_remove.username}')

async def friend_request(self, event):
        await self.send(text_data=json.dumps({
            'from_user': event['from_user'],
            'action': event['action'],
        }))
        logger.info(f'Event: {event}')

async def send_friend_request_by_username(consumer, username):
    try:
        logger.info(f'send request by username= {username}')
        to_user = await get_user_by_username(username)
        from_player = consumer.player
        to_player = await get_player_from_user(to_user)
        if from_player == to_player:
            await consumer.send(text_data=json.dumps({
                    'type': 'ack',
                    'action': 'error',
                    'error': 'sendFriendReqSelf',
            }))
            return
    
        if await are_already_friends(from_player, to_player):
            await consumer.send(text_data=json.dumps({
                    'type': 'ack',
                    'username': username,
                    'action': 'error',
                    'error': 'alreadyFriends',
            }))
            return
        await send_friend_request(consumer, to_player)
    except User.DoesNotExist:
        await consumer.send(text_data=json.dumps({
                'type': 'ack',
                'username': username,
                'action': 'error',
                'error': 'usernameNotExists',
        }))
    except Exception as e:
        logger.error(f'Error in send_frined_request_by_username: {str(e)}')
        await consumer.send(text_data=json.dumps({
                'type': 'ack',
                'action': 'error',
                'message': f'Error occured in send_frined_request_by_username: {str(e)}'
        }))
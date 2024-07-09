import json
import asyncio
from django.db.models import Q
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer

import logging

logger = logging.getLogger(__name__)


async def send_status_to_friends(player, statusToChange):
    if not player:
        return

    player_name = await get_username(player)

    logger.info(f'send_status_to_friends for {player_name} with status {statusToChange}')
    friends = await database_sync_to_async(list)(
        player.friends.filter(online=True)
    )

    logger.info('Friends to notify:')
    for friend in friends:
        friend_name = await get_username(friend)
        logger.info(f'Friend ID: {friend.id}, Username: {friend_name}, Online: {friend.online}, Status: {friend.status}')
    channel_layer = get_channel_layer()

    tasks = []
    for friend in friends:
        friend_name = await get_username(friend)
        group_name = f'friends_{friend.id}'
        logger.info(f'sending ws to {group_name} {friend_name}')
        task = (
            channel_layer.group_send(
                group_name,
                {
                    'type': 'friend_status',
                    'username': player_name,
                    'online': statusToChange,
                }
            )
        )
        tasks.append(task)

    results = await asyncio.gather(*tasks, return_exceptions=True)
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            logger.error(f'Error sending ws to friends_{friends[i].id} {result}')
        else:
            logger.info(f'Successfully sent ws to friends_{friends[i].id}')

@database_sync_to_async
def get_username(player):
    return player.user.username
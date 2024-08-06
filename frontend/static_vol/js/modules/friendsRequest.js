'use strict';

import { webSocketManager } from './websocket.js';
import { pongHandler } from './websocketHandler.js';
import { initToken } from './token.js';

const sendFriendRequest = async (to_username) => {
    console.log('sendFriendRequest');
    try {
        await webSocketManager.openWebSocket('lounge', pongHandler);
        webSocketManager.sendWebSocketMessage('lounge', {
            type: 'friendRequest',
            action: 'requestByUsername',
            username: to_username
        });
    } catch (error) {
        console.error('Failed to open or send through WebSocket: ', error);
    }
}

const acceptFriendRequest = async (requestId) => {
    console.log('acceptFriendRequest');
    try {
        await webSocketManager.openWebSocket('lounge', pongHandler);
        webSocketManager.sendWebSocketMessage('lounge', {
            type: 'friendRequest',
            action: 'acceptRequest',
            request_id: requestId,
        });
    } catch (error) {
        console.error('Failed to open or send through WebSocket: ', error);
    }
}

const declineFriendRequest = async (requestId) => {
    console.log('declineFriendRequest');
    try {
        await webSocketManager.openWebSocket('lounge', pongHandler);
        webSocketManager.sendWebSocketMessage('lounge', {
            type: 'friendRequest',
            action: 'declineRequest',
            request_id: requestId,
        });
    } catch (error) {
        console.error('Failed to open or send through WebSocket: ', error);
    }
}

const removeFriend = async (to_username) => {
    console.log('removeFriend');
    try {
        await webSocketManager.openWebSocket('lounge', pongHandler);
        webSocketManager.sendWebSocketMessage('lounge', {
            type: 'friendRequest',
            action: 'removeFriend',
            username: to_username,
        });
    } catch (error) {
        console.error('Failed to open or send through WebSocket: ', error);
    }
}

export { sendFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend };

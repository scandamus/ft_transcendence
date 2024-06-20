'use strict';

import { webSocketManager } from './websocket.js';
import { pongHandler } from './websocketHandler.js';
import { initToken } from './token.js';

const join_game = async () => {
    console.log('join_game');
    try {
        const accessToken = await initToken();
        await webSocketManager.openWebSocket('lounge', pongHandler);
        webSocketManager.sendWebSocketMessage('lounge', {
            action: 'joinGame',
            token: accessToken.token
        });
        console.log('Request join_game sent to backend.');
    } catch (error) {
        console.error('Failed to open or send through WebSocket: ', error);
    }
}

const request_game = async (username, user_id) => {
    console.log('request_game called');
    try {
        const accessToken = await initToken();
        console.log('Before opening WebSocket');
        await webSocketManager.openWebSocket('lounge', pongHandler);
        console.log('WebSocket opened');

        webSocketManager.sendWebSocketMessage('lounge', {
            type: 'friendMatchRequest',
            action: 'requestGame',
            //vs_id: user_id,
            opponent_username: username,
            token: accessToken.token
        });
        console.log(`Request game with ${username} ID: ${user_id} sent to backend.`);
    } catch (error) {
        console.error('Failed to open or send through WebSocket: ', error);
    }
}

const accept_game = async (request_id, from_username) => {
    console.log('accept_game ${request_id}')
    try {
        const accessToken = await initToken();
        await webSocketManager.openWebSocket('lounge', pongHandler);
        webSocketManager.sendWebSocketMessage('lounge', {
            type: 'friendMatchRequest',
            action: 'acceptGame',
            request_id: request_id,
            from_username: from_username,
            token: accessToken.token,
        });
        console.log(`Accept game with ${from_username} request ID: ${request_id}`);
    } catch (error) {
        console.error('Failed to open or send through WebSocket: ', error);
    }
}

const reject_game = async (request_id, from_username) => {
    console.log('reject_game ${request_id}')
    try {
        const accessToken = await initToken();
        await webSocketManager.openWebSocket('lounge', pongHandler);
        webSocketManager.sendWebSocketMessage('lounge', {
            type: 'friendMatchRequest',
            action: 'rejectGame',
            request_id: request_id,
            from_username: from_username,
            token: accessToken.token,
        });
        console.log(`Reject game with ${from_username} request ID: ${request_id}`);
    } catch (error) {
        console.error('Failed to open or send through WebSocket: ', error);
    }
}

const cancel_game = (username) => {
    console.log('cancel_game');
    try {
        console.log('Cancelling the game...');
        webSocketManager.sendWebSocketMessage('lounge', {
            type: 'friendMatchRequest',
            action: 'cancelGame',
            opponent_username: username,
        });
        console.log('Cancel request sent to backend.');
    } catch {
        console.error('Failed to send cancel request.');
    }
}

export { join_game, request_game, accept_game, reject_game, cancel_game };

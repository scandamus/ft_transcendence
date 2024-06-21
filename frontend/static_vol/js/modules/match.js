'use strict';

import { webSocketManager } from './websocket.js';
import { pongHandler } from './websocketHandler.js';
import { initToken } from './token.js';

const join_game = async (opponentName=null) => {
    console.log('join_game');
    try {
        const accessToken = await initToken();
        await webSocketManager.openWebSocket('lounge', pongHandler);
        console.log("------------------------------", opponentName);
        webSocketManager.sendWebSocketMessage('lounge', {
            action: 'joinGame',
            token: accessToken.token,
            opponentName: opponentName,
        });
        console.log('Request join_game sent to backend.');
    } catch (error) {
        console.error('Failed to open or send through WebSocket: ', error);
    }
}

const cancel_game = () => {
    console.log('cancel_game');
    try {
        console.log('Cancelling the game...');
        webSocketManager.sendWebSocketMessage('lounge', {
            action: 'cancel'
        });
        console.log('Cancel request sent to backend.');
    } catch {
        console.error('Failed to send cancel request.');
    }
}

export { join_game, cancel_game };

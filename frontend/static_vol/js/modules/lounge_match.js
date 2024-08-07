'use strict';

import { webSocketManager } from './websocket.js';
import { pongHandler } from './websocketHandler.js';
import { initToken } from './token.js';

const join_lounge_game = async(gameName) => {
    console.log(`join_${gameName}`);
    try {
        await webSocketManager.openWebSocket('lounge', pongHandler);
        webSocketManager.sendWebSocketMessage('lounge', {
            type: 'lounge',
            action: 'requestJoinMatch',
            game: gameName,
        });
        console.log(`Request join_game: ${gameName}  sent to backend.`);
    } catch (error) {
        console.error('Failed to open or send through WebSocket: ', error);
    }
}

const exit_lounge_match_room = async (gameName) => {
    console.log('exit_lounge_match_room');
    try {
        await webSocketManager.openWebSocket('lounge', pongHandler);
        webSocketManager.sendWebSocketMessage('lounge', {
            type: 'lounge',
            action: 'requestExitRoom',
            game: gameName,
        });
        console.log('Request exit_lounge_match_room to backend');
    } catch (error) {
        console.error('Failed to open or send through WebSocket: ', error);
    }
}

export { join_lounge_game, exit_lounge_match_room };
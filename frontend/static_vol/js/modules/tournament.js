'use strict';

import { webSocketManager } from './websocket.js';
import { pongHandler } from './websocketHandler.js';
import { initToken } from './token.js';
import { addNotice } from './notice.js';

const createTournament = async(tournamentTitle, startTime) => {
    console.log(`createTournament ${tournamentTitle} - ${startTime}`);
    try {
        const accessToken = await initToken();
        await webSocketManager.openWebSocket('lounge', pongHandler);
        webSocketManager.sendWebSocketMessage('lounge', {
            type: 'tournament',
            action: 'createTournament',
            name: tournamentTitle,
            start: startTime,
            token: accessToken.token
        });
        console.log(`Create tournament: ${tournamentTitle}  sent to backend.`);
    } catch (error) {
        console.error('Failed to open or send through WebSocket: ', error);
    }
}

export { createTournament };
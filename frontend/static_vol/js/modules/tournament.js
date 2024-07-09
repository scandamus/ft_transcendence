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

const entryUpcomingTournament = async(data) => {
    console.log(`entryTournament ${data.title}`);
    try {
        const accessToken = await initToken();
        await webSocketManager.openWebSocket('lounge', pongHandler);
        webSocketManager.sendWebSocketMessage('lounge', {
            type: 'tournament',
            action: 'entryTournament',
            id: data.idTitle,
            name: data.title,
            nickname: data.nickname,
            token: accessToken.token
        });
        console.log(`Entry tournament request: ${data.title}  sent to backend.`);
    } catch (error) {
        console.error('Failed to open or send through WebSocket: ', error);
    }
}

const cancelEntryTournament = async(tournamentId, tournamentName) => {
    console.log(`cancelTournamentEntry ${tournamentName}`);
    try {
        const accessToken = await initToken();
        await webSocketManager.openWebSocket('lounge', pongHandler);
        webSocketManager.sendWebSocketMessage('lounge', {
            type: 'tournament',
            action: 'cancelEntry',
            id: tournamentId,
            name: tournamentName,
            nickname: 'dummy',
            token: accessToken.token
        });
        console.log(`Cancel tournament entry: ${tournamentName}  sent to backend.`);
    } catch (error) {
        console.error('Failed to open or send through WebSocket: ', error);
    }   
}

const enterTournamentRoomRequest = async(tournamentName) => {
    console.log(`enterTournamentRoom ${tournamentName}`);
    try {
        const accessToken = await initToken();
        await webSocketManager.openWebSocket('lounge', pongHandler);
        webSocketManager.sendWebSocketMessage('lounge', {
            type: 'tournament',
            action: 'enterRoomRequest',
            name: tournamentName,
            token: accessToken.token
        });
        console.log(`Sent entering request tournament room ${tournamentName}`);
    } catch (error) {
        console.error('Failed to open or send through WebSocket: ', error);  
    }
}

export { createTournament, entryUpcomingTournament, cancelEntryTournament, enterTournamentRoomRequest };
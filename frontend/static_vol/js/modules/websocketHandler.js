import { getValidToken, refreshAccessToken } from "./token.js";
import { webSocketManager } from "./websocket.js";

export const pongHandler = (event, containerId) => {
    let data;
    try {
        data = JSON.parse(event.data);
    } catch {
        console.error(`Error parsing data from ${containerId}: `, error);
    }
    if (data.type === 'authenticationFailed') {
        console.error(data.message);
        refreshAccessToken();
    }
    if (data.type === 'gameSession') {
        loadGameContent(data);
    }
}

const pongGameHandler = (event, containerId) => {
    let data;
    try {
        data = JSON.parse(event.data);
    } catch {
        console.error(`Error parsing data from ${containerId}: `, error);
    }
    console.log(`Message from ${containerId}: `, data);
}

const loadGameContent = async (data) => {
    const { jwt, match_id, username } = data;

    console.log(`Loading pong content with JWT: `, jwt);
    console.log(`match_id: ${match_id}, Username: ${username}`);

    const gameMatchId = match_id; 
    const containerId = `pong/${gameMatchId}`;
    await webSocketManager.openWebSocket(containerId, pongGameHandler);
    console.log(`URL = ${containerId}`);
    const socket = webSocketManager.getWebSocket(containerId);

    if (socket) {
        console.log('socket opened');
        socket.onopen = async () => {
            console.log('WebSocket for pong-server opened');
            try {
                    webSocketManager.sendWebSocketMessage(containerId, {
                         action: 'authenticate',
                         jwt: jwt
                    });
                    console.log('Token sent to pong-server, stopping further process.');
                    return;
                    // TODO: ゲーム画面に変遷してゲームのjsを続行
            } catch (error) {
                console.error('Error user page init: ', error);
            }
        }
    } else {
        console.error('WebSocket for pong-server is not available.');
    }
}
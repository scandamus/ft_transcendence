import { getValidToken } from "./token.js";

class WebSocketManager {
    constructor() {
        this.sockets = {};
        this.messageHandlers = {};
    }
    
    openWebSocket(containerId, messageHandler) {
        if (this.sockets[containerId]) {
            const accessToken = getValidToken('accessToken');
            if (!accessToken) {
                console.log('Access Token is missing or expired. Closing socket...');
                this.closeWebSocket(containerId);

                setTimeout(() => {
                    this.openWebSocket(containerId, messageHandler);
                }, 3000); // 3 sec
                return;
            }
                console.log(`WebSocket for ${containerId} is already open.`);
                return;
        }

        const accessToken = getValidToken('accessToken');
        if (!accessToken) {
            console.error('Access token is missing');
            return;
        }
        
        const url = 'wss://'
            + window.location.host
            + '/ws/'
            + containerId
            + '/';

        const socket = new WebSocket(url);

        socket.onopen = () => {
            console.log(`WebSocket for ${containerId} is open now.`);
        };

        socket.onmessage = (event) => {
            this.handleMessage(containerId, event);
        };

        socket.onclose = (event) => {
            console.log(`WebSocket for ${containerId} is onclose.`);
            this.handleClose(containerId);
        };

        socket.onerror = (error) => {
            console.error(`WebSocket error for ${containerId}: `, error);
        };

        this.sockets[containerId] = socket;
        this.messageHandlers[containerId] = messageHandler || this.defaultMessageHandler(this, containerId);
    }

    defaultMessageHandler(event, containerId) {
        const data = JSON.parse(event.data);
        console.log(`Default handler message from ${containerId}:`, data)
    }

    loadGameContent(jwt, containerId) {
        console.log(`Loading ${containerId}`);
   }

    handleMessage(containerId, event) {
        const handler = this.messageHandlers[containerId];
        if (handler) {
            handler(event, containerId);
        } else {
            console.error(`No message from ${containerId}`);
        }
    }

    handleClose(containerId) {
        console.log(`WebSocket for ${containerId} is closing now.`);
        delete this.sockets[containerId];
        delete this.messageHandlers[containerId];
    }

    closeWebSocket(containerId) {
        const socket = this.sockets[containerId];
        if (socket) {
            socket.close();
            delete this.sockets[containerId];
            delete this.messageHandlers[containerId];
            console.log(`WebSocket for ${containerId} has been closed.`);
        }
    }

    sendWebSocketMessage(containerId, message) {
        const socket = this.sockets[containerId];
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
            console.log(`Message sent to ${containerId}:`, message);
        } else {
            console.error(`WebSocket for ${containerId} is not open.`);
        }
    }
}

// Singleton instance
export const webSocketManager = new WebSocketManager();
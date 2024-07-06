import { getValidToken, initToken } from "./token.js";

class WebSocketManager {
    constructor() {
        this.sockets = {};
        this.messageHandlers = {};
    }
    
    async openWebSocket(containerId, messageHandler) {
        return new Promise(async (resolve, reject) => {
            if (this.sockets[containerId] && this.sockets[containerId].readyState) {
                console.log(`WebSocket for ${containerId} is already open.`);
                resolve(this.sockets[containerId]);
                return;
            }

            const accessTokenResult = await getValidToken('accessToken');
            if (!accessTokenResult.token) {
                console.error('Access token is missing or invalid');
                reject('Access token is missing or invalid.');
                return;
            }

            const url = 'wss://'
                + window.location.host
                + '/ws/'
                + containerId
                + '/';

            const socket = new WebSocket(url);

            // 接続したら必ずAccessToekenを送る
            socket.onopen = () => {
                console.log(`WebSocket for ${containerId} is open now.`);
                this.sockets[containerId] = socket;
                this.messageHandlers[containerId] = messageHandler || this.defaultMessageHandler(this, containerId);
                if (containerId === 'lounge') {
                    this.sendAccessToken(containerId)
                        .then(() => {
                            console.log(`Sent access token to ${containerId}`);
                            resolve(socket);
                        })
                        .catch((error) => {
                            console.error(`Failed to send access token for ${containerId}: `, error);
                            reject(error);
                        });
                } else {
                    resolve(socket);
                }
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
                reject(error);
            };
        })
    }

    defaultMessageHandler(event, containerId) {
        const data = JSON.parse(event.data);
        console.log(`Default handler message from ${containerId}:`, data)
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

    isWebSocketOpened(containerId) {
        const socket = this.sockets[containerId];
        return socket && socket.readyState === WebSocket.OPEN;
    }

    getWebSocket(containerId) {
        return this.sockets[containerId];
    }

    async sendAccessToken(containerId) {
        console.log(`sendAccessToken to ${containerId}`);
        try {
            const accessToken = await initToken();
//            await webSocketManager.openWebSocket(containerId, this.messageHandlers[containerId]);
            console.log('sendAccessToken: initToken() finish');
            const message = {
                type: 'authWebSocket',
                action: 'auth',
                token: accessToken.token
            };
            this.sendWebSocketMessage(containerId, message);
            console.log('send access token to backend.');
        } catch (error) {
            console.error('Failed to open or send through WebSocket: ', error);
        }
    }
}

// Singleton instance
export const webSocketManager = new WebSocketManager();
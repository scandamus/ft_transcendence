import { getValidToken, initToken } from "./token.js";
import { handleLogout } from "./logout.js";
import { addNotice } from "./notice.js";
import { labels } from "./labels.js";

class WebSocketManager {
    constructor() {
        this.sockets = {};
        this.messageHandlers = {};
        this.reconnectInterval = 1000; // 再接続の試行間隔
        this.maxReconnectAttempts = 10; // 再接続の最大試行回数
        this.reconnectAttempts = {}; // 再接続の試行カウンタ
        this.isWebSocketClosed = {}; // true:意図的にクローズされている
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
                this.reconnectAttempts[containerId] = 0;
                this.isWebSocketClosed[containerId] = false;
            };

            socket.onmessage = (event) => {
                this.handleMessage(containerId, event);
            };

            socket.onclose = (event) => {
                console.log(`WebSocket for ${containerId} is onclose.`);
                const handler = this.messageHandlers[containerId];
                this.handleClose(containerId);
                if (!this.isWebSocketClosed[containerId] && this.reconnectAttempts[containerId] < this.maxReconnectAttempts) {
                    setTimeout(() => {
                        console.log(`Try to reconnect WebScoket for ${containerId}`);
                        this.reconnectAttempts[containerId]++;
                        this.openWebSocket(containerId, handler);
                    }, this.reconnectInterval);
                } else if (!this.isWebSocketClosed[containerId]) {
                    addNotice(labels.common.disconnected, true);
                    handleLogout(new Event('logout'));
                }
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
        if (this.sockets[containerId]) {
            delete this.sockets[containerId];
        }
        if (this.messageHandlers[containerId]) {
            delete this.messageHandlers[containerId];
        }
    }

    closeWebSocket(containerId) {
        const socket = this.sockets[containerId];
        if (socket) {
            this.isWebSocketClosed[containerId] = true;
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
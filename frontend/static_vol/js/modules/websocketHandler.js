import { getValidToken, refreshAccessToken } from "./token.js";
import { webSocketManager } from "./websocket.js";
import { addNotice } from "./notice.js";
import { updateFriendsList, updateFriendRequestList } from './friendList.js';
import PageBase from "../components/PageBase.js";

export const pongHandler = (event, containerId) => {
    let data;
    try {
        data = JSON.parse(event.data);
        if (data.type === 'authenticationFailed') {
            console.error(data.message);
            refreshAccessToken();
            // TODO: リフレッシュ後に再接続？
            // backendでjwtを再度生成してもらって再度pong-serverに投げる？
            // Playersクラスにステータスが要りそう（オンライン、オフライン、ゲーム中、ゲーム中ならばmatch_idも）
        }
        if (data.type === 'gameSession') {
            loadGameContent(data);
        }
        else if (data.type === 'friendRequest') {
            handleFriendRequestReceived(data);
        }
        else if (data.type === 'ack') {
            handleFriendRequestAck(data);
        }
    } catch(error) {
        console.error(`Error parsing data from ${containerId}: `, error);
    }
}

const pongGameHandler = (event, containerId) => {
    let data;
    try {
        data = JSON.parse(event.data);
    } catch(error) {
        console.error(`Error parsing data from ${containerId}: `, error);
    }
    if (data.type === 'error') {
        console.error(data.message);
    }
    if (data.type === 'authenticationFailed') {
        console.error(data.error);
        refreshAccessToken();
    }
    console.log(`Message from ${containerId}: `, data);
}

const loadGameContent = async (data) => {
    const { jwt, match_id, username } = data;

    console.log(`Loading pong content with JWT: `, jwt);
    console.log(`match_id: ${match_id}, Username: ${username}`);

    const gameMatchId = match_id; 
    const containerId = `pong/${gameMatchId}`;
    console.log(`URL = ${containerId}`);

    try {
        const socket = await webSocketManager.openWebSocket(containerId, pongGameHandler);
        console.log(`WebScoket for ${containerId} is open!!!`);
        if (socket.readyState === WebSocket.OPEN) {
            webSocketManager.sendWebSocketMessage(containerId, {
                action: 'authenticate',
                jwt: jwt
            });
            console.log('Token sent to pong-server');
            // TODO: ゲーム画面に変遷してゲーム続行

        } else {
            console.error('WebSocket is not in OPEN state.');
        }
    } catch (error) {
        console.error('Error loadGameContent fails initializing WebSocket.');
    
    }
}

const handleFriendRequestAck = (data) => {
    const currentPage = PageBase.isInstance(PageBase.instance, 'Friends') || PageBase.isInstance(PageBase.instance, 'Dashboard');

    if (data.action === 'error') {
        if (data.error === 'alreadyFriends') {
            addNotice(`${data.username}さんはすでに友達です`, true);
        } else if (data.error === 'usernameNotExists') {
            addNotice(`${data.username}は存在しません`, true);
        } else if (data.error === 'sendFriendReqSelf') {
            addNotice(`自分自身は友達になれないのですよ`, true);
        } else if (data.error === 'invalidDeclineFriendReq') {
            addNotice(`友達申請の削除ができませんでした`, true);
        } else {
            console.error(`Error: ${data.message}`);
        }
    } else if (data.action === 'sentRequestSuccess') {
        console.log(`Friend request is sent to ${data.to_username}`, );
        addNotice(`${data.to_username}さんに友達申請が送信されました`, false);
        if (currentPage) {
            updateFriendRequestList()
                .then(() => {
                    currentPage.listenRequest();
                });
        }
    } else if (data.action === 'acceptRequestSuccess') {
        console.log('Accept friend request is successfully done');
        addNotice(`${data.from_username}さんと友達になりました`, false);
        if (currentPage) {
            updateFriendRequestList();
            updateFriendsList()
                .then(() => {
                    currentPage.listenRequest();
                });
        }
    } else if (data.action === 'declineRequestSuccess') {
        console.log('Decline friend request is successfully done');
        if (currentPage) {
            updateFriendRequestList()
                .then(() => {
                    currentPage.listenRequest();
                });
        }
    } else if (data.action === 'removeSuccess') {
        console.log('Remove Successfully done');
        addNotice(`${data.username}さんとの友達を解除しました`, false);
        if (currentPage) {
            updateFriendsList()
                .then(() => {
                    currentPage.listenRequest();
                });
        }
    }
}

const handleFriendRequestReceived = (data) => {
    const currentPage = PageBase.isInstance(PageBase.instance, 'Friends') || PageBase.isInstance(PageBase.instance, 'Dashboard');

    console.log('handleFriendRepuestReceived: received');
    if (data.action === 'received') {
        addNotice(`${data.from_username}さんから友達申請が来ました`, false);
        if (currentPage) {
            updateFriendRequestList()
                .then(() => {
                    currentPage.listenRequest();
                });
        }
    } else if (data.action === 'accepted') {
        addNotice(`${data.from_username}さんが友達申請を承認しました`, false);
        if (currentPage) {
            Promise.all([
                updateFriendRequestList(),
                updateFriendsList()
            ])
                .then(() => {
                    currentPage.listenRequest();
                });
        }

    } else if (data.action === 'removed') {
        //rmられは通知されない
        if (currentPage) {
            updateFriendsList()
                .then(() => {
                    currentPage.listenRequest();
                });
        }
    }
}
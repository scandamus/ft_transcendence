import { getValidToken, refreshAccessToken } from "./token.js";
import { webSocketManager } from "./websocket.js";
import { pageInstances } from "./pageInstances.js";
import { addNotice } from "./notice.js";
import { updateFriendsList, updateFriendRequestList } from './friendList.js';
import { router } from "./router.js";

import { labels } from './labels.js'; // TODO use labels but wait for merge

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
    if (data.type === 'startGame') {
        console.log('game starting');
    }
    else if (data.type === 'error') {
        console.error(data.message);
    }
    else if (data.type === 'authenticationFailed') {
        console.error(data.error);
        refreshAccessToken();
    }
    console.log(`Message from ${containerId}: `, data);
}

const loadGameContent = async (data) => {
    const { jwt, match_id, username, player_name } = data;

    console.log(`Loading pong content with JWT: `, jwt);
    console.log(`match_id: ${match_id}, Username: ${username}, Player_name: ${player_name}`);

    const gameMatchId = match_id; 
    const containerId = `pong/${gameMatchId}`;
    console.log(`URL = ${containerId}`);

    try {
        const socket = await webSocketManager.openWebSocket(containerId, pongGameHandler);
        console.log(`WebSocket for ${containerId} is open!!!`);
        if (socket.readyState === WebSocket.OPEN) {
            webSocketManager.sendWebSocketMessage(containerId, {
                action: 'authenticate',
                jwt: jwt,
                player_name: player_name,
            });
            console.log('Token sent to pong-server');
            // TODO: ゲーム画面に変遷してゲーム続行
            window.history.pushState({}, null, `/game/play:${gameMatchId}`);
            await router(true);
        } else {
            console.error('WebSocket is not in OPEN state.');
        }
    } catch (error) {
        console.error('Error loadGameContent fails initializing WebSocket.', error);
    }
}

const handleFriendRequestAck = (data) => {
    const currentPage = pageInstances.getInstance('Friends') || pageInstances.getInstance('Dashboard'); // その他も
    const isPageFriend = !!(pageInstances.getInstance('Friends'));
    if (data.action === 'error') {
        if (data.error === 'alreadyFriends') {
            addNotice(labels.friendRequest[data.error].replace('$name', data.username), false);
        } else if (data.error === 'usernameNotExists') {
            addNotice(labels.friendRequest[data.error].replace('$name', data.username), true);
        } else if (data.error === 'sendFriendReqSelf') {
            addNotice(labels.friendRequest[data.error].replace('$name', data.username), true);
        } else if (data.error === 'invalidDeclineFriendReq') {
            addNotice(labels.friendRequest[data.error].replace('$name', data.username), true);
        } else {
            console.error(`Error: ${data.message}`);
        }
    } else if (data.action === 'sentRequestSuccess') {
        console.log('Friend request by username is sent to ', data.to_username);
        addNotice(labels.friendRequest[data.action].replace('$name', data.to_username), false);
        if (currentPage) {
            updateFriendRequestList()
                .then(() => {
                    currentPage.listenRequest();
                });
        }
    } else if (data.action === 'acceptRequestSuccess') {
        console.log('Accept friend request is successfully done');
        addNotice(labels.friendRequest[data.action].replace('$name', data.from_username), false);
        if (currentPage) {
            updateFriendRequestList();
            updateFriendsList(isPageFriend)
                .then(() => {
                    currentPage.listenRequest();
                });
        }
    } else if (data.action === 'declineRequestSuccess') {
        console.log('Decline friend request is successfully done');
        addNotice(labels.friendRequest[data.action].replace('$name', data.username), false);
        if (currentPage) {
            updateFriendRequestList()
                .then(() => {
                    currentPage.listenRequest();
                });
        }
    } else if (data.action === 'removeSuccess') {
        console.log('Remove Successfully done');
        addNotice(labels.friendRequest[data.action].replace('$name', data.username), false);
        if (currentPage) {
            updateFriendsList(isPageFriend)
                .then(() => {
                    currentPage.listenRequest();
                });
        }
    }
}

const handleFriendRequestReceived = (data) => {
    const currentPage = pageInstances.getInstance('Friends') || pageInstances.getInstance('Dashboard'); //|| pageInstances.getInstance('Home') // その他も
    const isPageFriend = !!(pageInstances.getInstance('Friends'));

    console.log('handleFriendRepuestReceived: received');
    if (data.action === 'received') {
        addNotice(labels.friendRequest[data.action].replace('$name', data.from_username), false);
        if (currentPage) {
            updateFriendRequestList()
                .then(() => {
                    currentPage.listenRequest();
                });
        }
    } else if (data.action === 'accepted') {
        addNotice(labels.friendRequest[data.action].replace('$name', data.from_username), false);
        if (currentPage) {
            Promise.all([
                updateFriendRequestList(),
                updateFriendsList(isPageFriend)
            ])
                .then(() => {
                    currentPage.listenRequest();
                });
        }

    } else if (data.action === 'removed') {
        //rmられは通知されない
        console.log(labels.friendRequest[data.action].replace('$name', data.from_username));
        if (currentPage) {
            updateFriendsList(isPageFriend)
                .then(() => {
                    currentPage.listenRequest();
                });
        }
    }
}

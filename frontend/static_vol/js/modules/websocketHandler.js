import { getValidToken, refreshAccessToken } from "./token.js";
import { webSocketManager } from "./websocket.js";
import { closeModal, showModalReceiveMatchRequest, showModalWaitForOpponent } from "./modal.js";
import { addNotice } from "./notice.js";
import { updateFriendsList, updateFriendRequestList } from './friendList.js';
import PageBase from "../components/PageBase.js";
import { router } from "./router.js";
import { labels } from './labels.js'; // TODO use labels but wait for merge
import { updateModalAvailablePlayers } from "./modal.js";

export const pongHandler = (event, containerId) => {
    console.log(`pongHandler called for containerID: ${containerId}`)
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
        else if (data.type === 'friendMatchRequest') {
            handleFriendMatchRequestReceived(data);
        }
        else if (data.type === 'friendRequest') {
            handleFriendRequestReceived(data);
        }
        else if (data.type === 'ack') { // TODO: friendRequestAckに変更？
            handleFriendRequestAck(data);
        }
        else if (data.type === 'lounge') {
            handleLoungeMatchReceived(data);
        }
        else if (data.type === 'tournament') {
            handleTournamentReceived(data);
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
    const { game_name, jwt, match_id, username, player_name } = data;

    closeModal();

    console.log(`Loading ${game_name} content with JWT: `, jwt);
    console.log(`match_id: ${match_id}, Username: ${username}, Player_name: ${player_name}`);

    const gameMatchId = match_id; 
    const containerId = `${game_name}/${gameMatchId}`;
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
            if (game_name === 'pong') {
                window.history.pushState({}, null, `/game/pong/play:${gameMatchId}`);
            } else {
                // game_name === 'pong4'
                window.history.pushState({}, null, `/game/pong4/play:${gameMatchId}`);
            }
            await router(true);
        } else {
            console.error('WebSocket is not in OPEN state.');
        }
    } catch (error) {
        console.error('Error loadGameContent fails initializing WebSocket.', error);
    }
}

const handleFriendRequestAck = (data) => {
    const currentPage = (PageBase.isInstance(PageBase.instance, 'Friends') || PageBase.isInstance(PageBase.instance, 'Dashboard'))
                                ? PageBase.instance : null;
    if (data.action === 'error') {
        if (data.error === 'alreadyFriends') {
            addNotice(labels.friendRequest['alreadyFriends'].replace('$name', data.username), false);
        } else if (data.error === 'usernameNotExists') {
            addNotice(labels.friendRequest['usernameNotExists'].replace('$name', data.username), true);
        } else if (data.error === 'sendFriendReqSelf') {
            addNotice(labels.friendRequest['sendFriendReqSelf'].replace('$name', data.username), true);
        } else if (data.error === 'invalidDeclineFriendReq') {
            addNotice(labels.friendRequest['invalidDeclineFriendReq'].replace('$name', data.username), true);
        } else {
            console.error(`Error: ${data.message}`);
        }
    } else if (data.action === 'sentRequestSuccess') {
        console.log('Friend request by username is sent to ', data.to_username);
        addNotice(labels.friendRequest['sentRequestSuccess'].replace('$name', data.to_username), false);
        if (currentPage) {
            updateFriendRequestList(currentPage).then(() => {});
        }
    } else if (data.action === 'acceptRequestSuccess') {
        console.log('Accept friend request is successfully done');
        addNotice(labels.friendRequest['acceptRequestSuccess'].replace('$name', data.from_username), false);
        if (currentPage) {
            updateFriendRequestList(currentPage).then(() => {});
            updateFriendsList(currentPage).then(() => {});
        }
    } else if (data.action === 'declineRequestSuccess') {
        console.log('Decline friend request is successfully done');
        addNotice(labels.friendRequest['declineRequestSuccess'].replace('$name', data.username), false);
        if (currentPage) {
            updateFriendRequestList(currentPage).then(() => {});
        }
    } else if (data.action === 'removeSuccess') {
        console.log('Remove Successfully done');
        addNotice(labels.friendRequest['removeSuccess'].replace('$name', data.username), false);
        if (currentPage) {
            updateFriendsList(currentPage).then(() => {});
        }
    }
}

const handleFriendRequestReceived = (data) => {
    const currentPage = (PageBase.isInstance(PageBase.instance, 'Friends') || PageBase.isInstance(PageBase.instance, 'Dashboard'))
                                ? PageBase.instance : null;

    console.log('handleFriendRepuestReceived: received');
    if (data.action === 'received') {
        addNotice(labels.friendRequest['received'].replace('$name', data.from_username), false);
        if (currentPage) {
            updateFriendRequestList(currentPage).then(() => {});
        }
    } else if (data.action === 'accepted') {
        addNotice(labels.friendRequest['accepted'].replace('$name', data.from_username), false);
        if (currentPage) {
            updateFriendsList(currentPage).then(() => {});
        }
    } else if (data.action === 'removed') {
        //rmられは通知されない
        console.log(labels.friendRequest['removed'].replace('$name', data.from_username));
        if (currentPage) {
            updateFriendsList(currentPage).then(() => {});
        }
    }
}

const handleFriendMatchRequestReceived = (data) => {
    if (data.action === 'requested') {
        // TODO: すでに別のプレイヤーからのリクエストが来ている場合の処理
        showModalReceiveMatchRequest(data);
    } else if (data.action === 'accepted') {
        // 対戦相手がアクセプトボタンを押した
    } else if (data.action === 'cancelled') {
        // 対戦を申し込んだ主がキャンセルボタンを押した
        closeModal();
        addNotice(labels.matchRequest['cancelled'], true);
    } else if (data.action === 'rejected') {
        // 申し込んだ相手がリジェクトボタンを押した
        closeModal();
        addNotice(labels.matchRequest['rejected'], true);
    } else if (data.action === 'error') {
        closeModal();
        if (data.error === 'playerNotWaitingStatus') {
            addNotice(labels.matchRequest['playerNotWaitingStatus'], true);
        } else if (data.error === 'userOffline') {
            addNotice(labels.matchRequest['userOffline'], true);
        } else {
            console.error(`Error: ${data.message}`);
        }
    }
}

const handleLoungeMatchReceived = (data) => {
    if (data.action === 'update') {
        updateModalAvailablePlayers(data.availablePlayers);
    } else if (data.action === 'error') {
        closeModal();
        alert(`Error: ${data.message}`);
    }
}

const handleTournamentReceived = (data) => {
    if (data.action === 'created') {
        const startUTC = new Date(data.start);
        const startLocal = startUTC.toLocaleString();
        console.log(`UTC Time: ${startUTC.toISOString()}`);
        console.log(`Local Time: ${startLocal}`);
        const message = `${data.name} - ${startLocal} が作成されました`;
        console.log(`${message}`);
        addNotice(message, false);
    } else if (data.action === 'alreadyExists') {
        const message = `同名のトーナメントがすでに存在しています`;
        addNotice(message, true);
    }
}

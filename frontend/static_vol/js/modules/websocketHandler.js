import { getValidToken, refreshAccessToken } from "./token.js";
import { webSocketManager } from "./websocket.js";
import { pageInstances } from "./pageInstances.js";
import { closeModal, showModalReceiveMatchRequest } from "./modal.js";

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
    } catch (error) {
        console.error(`Error parsing data from ${containerId}: `, error);
    }
}

const pongGameHandler = (event, containerId) => {
    let data;
    try {
        data = JSON.parse(event.data);
    } catch {
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

    closeModal();

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
    const currentPage = pageInstances.getInstance('Friends') || pageInstances.getInstance('Dashboard'); // その他も

    if (data.action === 'error') {
        if (data.error === 'alreadyFriends') {
            alert(`${data.username}さんはすでに友達です`);
        } else if (data.error === 'usernameNotExists') {
            alert(`${data.username}は存在しません`);
        } else if (data.error === 'sendFriendReqSelf') {
            alert(`自分自身は友達になれないのですよ`);
        } else if (data.error === 'invalidDeclineFriendReq') {
            alert(`友達申請の削除ができませんでした`);
        } else {
            console.error(`Error: ${data.message}`);
        }
    } else if (data.action === 'sentRequestSuccess') {
        console.log('Friend request by username is sent to ', data.to_username);
        alert(`${data.to_username}さんに友達申請が送信されました`);
        if (currentPage) {
            currentPage.updateFriendRequestList()
                .then(() => {
                    currentPage.listenRequest();
                });
        }
    } else if (data.action === 'acceptRequestSuccess') {
        console.log('Accept friend request is successfully done');
        alert(`${data.from_username}さんと友達になりました`);
        if (currentPage) {
            currentPage.updateFriendRequestList();
            currentPage.updateFriendsList()
                .then(() => {
                    currentPage.listenRequest();
                });
        }
    } else if (data.action === 'declineRequestSuccess') {
        console.log('Decline friend request is successfully done');
        if (currentPage) {
            currentPage.updateFriendRequestList()
                .then(() => {
                    currentPage.listenRequest();
                });
        }
    } else if (data.action === 'removeSuccess') {
        console.log('Remove Successfully done');
        alert(`${data.username}さんとの友達を解除しました`);
        if (currentPage) {
            currentPage.updateFriendsList()
                .then(() => {
                    currentPage.listenRequest();
                });
        }
    }
}

const handleFriendRequestReceived = (data) => {
    const currentPage = pageInstances.getInstance('Friends') || pageInstances.getInstance('Dashboard'); //|| pageInstances.getInstance('Home') // その他も

    console.log('handleFriendRepuestReceived: received');
    if (data.action === 'received') {
        alert(`${data.from_username}さんから友達申請が来ました`);
        if (currentPage) {
            currentPage.updateFriendRequestList()
                .then(() => {
                    currentPage.listenRequest();
                });
        }
    } else if (data.action === 'accepted') {
        alert(`${data.from_username}さんが友達申請を承認しました`);
        if (currentPage) {
            Promise.all([
                currentPage.updateFriendRequestList(),
                currentPage.updateFriendsList()
            ])
                .then(() => {
                    currentPage.listenRequest();
                });
        }

    } else if (data.action === 'removed') {
        alert(`${data.from_username}さんと友達じゃなくなりました`);
        if (currentPage) {
            currentPage.updateFriendsList()
                .then(() => {
                    currentPage.listenRequest();
                });
        }
    }
}

const handleFriendMatchRequestReceived = (data) => {
    if (data.action === 'requested') {
        // TODO: すでに別のプレイヤーからのリクエストが来ている場合の処理
        // alert(`${data.from}さんから対戦リクエストです！`);
        showModalReceiveMatchRequest(data);
    } else if (data.action === 'accepted') {
        // 対戦相手がアクセプトボタンを押した
        // alert(`対戦相手が承諾しました`)
    } else if (data.action === 'cancelled') {
        // 対戦を申し込んだ主がキャンセルボタンを押した
        closeModal();
        alert(`対戦相手にキャンセルされました`)
    } else if (data.action === 'rejected') {
        // 申し込んだ相手がリジェクトボタンを押した
        // TODO: リジェクトされたメッセージを出す？
        closeModal();
        alert(`対戦相手にリジェクトされました`)
    } else if (data.action === 'error') {
        closeModal();
        alert(`エラー：${data.message}`);
    }
}
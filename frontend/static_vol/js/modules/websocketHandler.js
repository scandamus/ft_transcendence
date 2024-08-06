import { getValidToken, refreshAccessToken } from "./token.js";
import { webSocketManager } from "./websocket.js";
import { closeModal, showModalReceiveMatchRequest, showModalWaitForOpponent } from "./modal.js";
import { addNotice } from "./notice.js";
import { updateFriendsList, updateFriendRequestList } from './friendList.js';
import PageBase from "../components/PageBase.js";
import { router } from "./router.js";
import { labels } from './labels.js'; // TODO use labels but wait for merge
import { updateModalAvailablePlayers, closeModalOnEntryDone } from "./modal.js";
import { updateOngoingTournamentList, updateUpcomingTournamentList } from "./tournamentList.js";
import { enterTournamentRoomRequest } from "./tournament.js";
import { handleReceiveWsTournamentValidationError } from './form.js';
import { handleLogout } from "./logout.js";
import { toggleFriendsDisplay } from "./friendsFull.js";

export const pongHandler = (event, containerId) => {
    console.log(`pongHandler called for containerID: ${containerId}`);
    let data;
    try {
        data = JSON.parse(event.data);
        console.log('Received JSON:', data); // オブジェクト全体をログに表示
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
        else if (data.type === 'gameSessionTournament') {
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
        else if (data.type === 'friendStatus') {
            handleFriendStatusReceived(data);
        }
        else if (data.type === 'tournament') {
            handleTournamentReceived(data);
        }
        else if (data.type === 'tournamentMatch') {
            handleTournamentMatchReceived(data);
        }
        else if (data.type === 'disconnectByNewLogin') {
            handleDisconnetByNewLogin();
        }
        else if (data.type === 'gameSessionReconnect') {
            handleGameSesssionReconnect(data);
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
}

const loadGameContent = async (data) => {
    const { game_name, jwt, match_id, username, player_name, all_usernames, type, round, tournament_id } = data;

    closeModal();

    console.log(`Loading ${game_name} content with JWT: `, jwt);
    console.log(`match_id: ${match_id}, Username: ${username}, Player_name: ${player_name}, all_usernames: ${JSON.stringify(all_usernames)}, tournament_id: ${tournament_id}`);

    const gameMatchId = match_id; 
    const containerId = `${game_name}/${gameMatchId}`;
    console.log(`URL = ${containerId}`);
    sessionStorage.setItem('all_usernames', JSON.stringify(all_usernames));
    sessionStorage.setItem('player_name', player_name);

    let tournamentId;
    if (type === 'gameSessionTournament' || (type === 'gameSessionReconnect' && tournament_id !== null)) {
        // enterRoomできていなかった場合はtournamentIdがnullになるのでここでセットする
        tournamentId = sessionStorage.getItem('tournament_id');
        if (!tournamentId || tournamentId === 'null' || tournamentId === 'undefined' || tournamentId !== tournament_id) {
            sessionStorage.setItem('tournament_id', tournament_id);
            tournamentId = sessionStorage.getItem('tournament_id');
        }
    }

    if (type === 'gameSessionTournament') {
        //トーナメント詳細ページにいなければリダイレクト(基本的にはトーナメント開始時)
        if (window.location.pathname !== `/tournament/detail:${tournamentId}`) {
            window.history.pushState(null, null, `/tournament/detail:${tournamentId}`);
            await router(true);
        }
        if (PageBase.isInstance(PageBase.instance, 'TournamentDetail')) {
            await PageBase.instance.generateTournamentResult();
            PageBase.instance.displayNextMatch(all_usernames, round);
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    try {
        const socket = await webSocketManager.openWebSocket(containerId, pongGameHandler);
        console.log(`WebSocket for ${containerId} is open!!!`);
        let action;
        if (type === 'gameSessionReconnect') {
            console.log('RECONNECT MATCH!!');
            action = 'authenticateReconnect';
        } else {
            action = 'authenticate';
        }
        if (socket.readyState === WebSocket.OPEN) {
            webSocketManager.sendWebSocketMessage(containerId, {
                action: action,
                jwt: jwt,
                player_name: player_name,
            });
            console.log('Token sent to pong-server');
            // TODO: ゲーム画面に変遷してゲーム続行
            if (game_name === 'pong') {
                window.history.pushState(null, null, `/game/pong/play:${gameMatchId}`);
            } else {
                // game_name === 'pong4'
                window.history.pushState(null, null, `/game/pong4/play:${gameMatchId}`);
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
            addNotice(labels.friendRequest.alreadyFriends.replace('$name', data.username), false);
        } else if (data.error === 'usernameNotExists') {
            addNotice(labels.friendRequest.usernameNotExists.replace('$name', data.username), true);
        } else if (data.error === 'sendFriendReqSelf') {
            addNotice(labels.friendRequest.sendFriendReqSelf.replace('$name', data.username), true);
        } else if (data.error === 'invalidDeclineFriendReq') {
            addNotice(labels.friendRequest.invalidDeclineFriendReq.replace('$name', data.username), true);
        } else if (data.error === 'mutualReq') {
            addNotice(labels.friendRequest.mutualReq.replace('$name', data.username), false);
        } else if (data.error === 'alreadyReq') {
            addNotice(labels.friendRequest.alreadyReq.replace('$name', data.username), false);
        } else {
            console.error(`Error: ${data.message}`);
        }
    } else if (data.action === 'sentRequestSuccess') {
        console.log('Friend request by username is sent to ', data.to_username);
        addNotice(labels.friendRequest.sentRequestSuccess.replace('$name', data.to_username), false);
        if (currentPage) {
            updateFriendRequestList(currentPage).then(() => {});
        }
    } else if (data.action === 'acceptRequestSuccess') {
        console.log('Accept friend request is successfully done');
        addNotice(labels.friendRequest.acceptRequestSuccess.replace('$name', data.from_username), false);
        if (currentPage) {
            updateFriendsList(currentPage)
                .then(() => {
                    toggleFriendsDisplay(currentPage);
                });
        }
    } else if (data.action === 'declineRequestSuccess') {
        console.log('Decline friend request is successfully done');
        addNotice(labels.friendRequest.declineRequestSuccess.replace('$name', data.username), false);
        if (currentPage) {
            updateFriendRequestList(currentPage).then(() => {});
        }
    } else if (data.action === 'removeSuccess') {
        console.log('Remove Successfully done');
        addNotice(labels.friendRequest.removeSuccess.replace('$name', data.username), false);
        if (currentPage) {
            updateFriendsList(currentPage)
                .then(() => {
                    toggleFriendsDisplay(currentPage);
                });
        }
    } else if (data.action === 'maxFriendsReached') {
        addNotice(labels.friendRequest.missedRequestAccept.replace('$name', data.to_username), true);
    }
}

const handleFriendRequestReceived = (data) => {
    const currentPage = (PageBase.isInstance(PageBase.instance, 'Friends') || PageBase.isInstance(PageBase.instance, 'Dashboard'))
                                ? PageBase.instance : null;

    console.log('handleFriendRepuestReceived: received');
    if (data.action === 'received') {
        addNotice(labels.friendRequest.received.replace('$name', data.from_username), false);
        if (currentPage) {
            updateFriendRequestList(currentPage).then(() => {});
        }
    } else if (data.action === 'accepted') {
        addNotice(labels.friendRequest.accepted.replace('$name', data.to_username), false);
        if (currentPage) {
            updateFriendsList(currentPage)
                .then(() => {
                    toggleFriendsDisplay(currentPage);
                });
        }
    } else if (data.action === 'removed') {
        //rmられは通知されない
        console.log(labels.friendRequest.removed.replace('$name', data.from_username));
        //friendリスト更新
        if (currentPage) {
            updateFriendsList(currentPage)
                .then(() => {
                    toggleFriendsDisplay(currentPage);
                });
        }
    } else if (data.action === 'acceptRequestFailedFull') {
        //承認したけど相手が上限
        addNotice(labels.friendRequest.acceptRequestFailedFull.replace('$name', data.from_username), true);
    } else if (data.action === 'acceptRequestFailedFull2') {
        //承認したけど自分が上限(通常はフロントで弾く)
        addNotice(labels.friendRequest.acceptRequestFailedFull2, true);
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
        addNotice(labels.matchRequest.cancelled, true);
    } else if (data.action === 'rejected') {
        // 申し込んだ相手がリジェクトボタンを押した
        closeModal();
        addNotice(labels.matchRequest.rejected, true);
    } else if (data.action === 'error') {
        closeModal();
        if (data.error === 'playerNotWaitingStatus') {
            addNotice(labels.matchRequest.playerNotWaitingStatus, true);
        } else if (data.error === 'userOffline') {
            addNotice(labels.matchRequest.userOffline, true);
        } else if (data.error === 'inTournament') {
            addNotice(labels.matchRequest.msgCannotRequestInTournament, true);
        } else if (data.error === 'inMatch') {
            addNotice(labels.matchRequest.msgCannotRequestInMatch, true);
        } else if (data.error === 'matchWaiting') {
            addNotice(labels.matchRequest.msgCannotRequestInMatchWaiting, true);
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
        if (data.error === 'inTournament') {
            addNotice(labels.matchRequest.msgCannotRequestInTournament, true);
        } else if (data.error === 'inMatch') {
            addNotice(labels.matchRequest.msgCannotRequestInMatch, true);
        } else if (data.error === 'matchWaiting') {
            addNotice(labels.matchRequest.msgCannotRequestInMatchWaiting, true);
        } else {
            console.error(`Error: ${data.message}`);
        }
    }
}

const handleFriendStatusReceived = (data) => {
    const currentPage = (PageBase.isInstance(PageBase.instance, 'Friends') || PageBase.isInstance(PageBase.instance, 'Dashboard'))
                                ? PageBase.instance : null;

    if (data.action === 'change') {
        const online_status_msg = data.online === 'online' ? labels.friends.labelOnline : labels.friends.labelOffline;
        console.log(`friendStatus change: ${data.username} to ${online_status_msg}`);
        addNotice(labels.friends.msgChangeFriendOnline.replace('$friend', data.username).replace('$online', online_status_msg), false);
        if (currentPage) {
            updateFriendsList(currentPage)
                .then(() => {
                    toggleFriendsDisplay(currentPage);
                });
        }
    }
}

const handleTournamentReceived = (data) => {
    const currentPage = PageBase.isInstance(PageBase.instance, 'Tournament') ? PageBase.instance : null;

    if (data.action === 'created') {
        const startUTC = new Date(data.start);
        const startLocal = startUTC.toLocaleString();
        console.log(`UTC Time: ${startUTC.toISOString()}`);
        console.log(`Local Time: ${startLocal}`);
        if (currentPage) {
            PageBase.instance.resetFormCreateTournament();
            updateUpcomingTournamentList(currentPage).then((start_dates) => {
                currentPage.start_dates = start_dates;
            });
        }
        const message = labels.tournament.msgCreateDone.replace('$tournament', data.name).replace('$start', startLocal);
        console.log(`${message}`);
        addNotice(message, false);
    } else if (data.action === 'invalidTournamentTitle' || data.action === 'invalidTournamentStart') {
        handleReceiveWsTournamentValidationError(data);
        if (currentPage) {
            updateUpcomingTournamentList(currentPage).then((start_dates) => {
                currentPage.start_dates = start_dates;
            });
        }
    } else if (data.action === 'entryDone') {
        closeModalOnEntryDone();
        addNotice(labels.tournament.msgEntryDone.replace('$tournament', data.name), false);
        if (currentPage) {
            updateUpcomingTournamentList(currentPage).then((start_dates) => {
                currentPage.start_dates = start_dates;
            });
        }
    } else if (data.action === 'duplicateNickname') {
        addNotice(labels.tournament.msgEntryDupNickname, true);
    } else if (data.action === 'alreadyEnterd') {
        closeModalOnEntryDone();
        addNotice(labels.tournament.msgAlreadyEntered, true);
    } else if (data.action === 'capacityFull') {
        closeModalOnEntryDone();
        addNotice(labels.tournament.msgCapacityFull, true);
    } else if (data.action === 'invalidTournament') {
        closeModalOnEntryDone();
        addNotice(labels.tournament.msgEntryInvalidTournament, true);
    } else if (data.action === 'invalidPlayer') {
        closeModalOnEntryDone();
        addNotice(labels.tournament.msgEntryInvalidPlayer, true);
    } else if (data.action === 'removeEntryDone') {
        addNotice(labels.tournament.msgEntryCanceled.replace('$tournament', data.name), false);
        if (currentPage) {
            updateUpcomingTournamentList(currentPage).then((start_dates) => {
                currentPage.start_dates = start_dates;
            });
        }
    } else if (data.action === 'invalidCancelRequest') {
        addNotice(labels.tournament.msgNoEntry, true);
    } else if (data.action === 'invalidNickname') {
        handleReceiveWsTournamentValidationError(data);
    } else if (data.action === 'invalidEntryRequest') {
        addNotice(labels.tournament.msgInvalidEntry, true);
        if (currentPage) {
            updateUpcomingTournamentList(currentPage).then(() => {});
            updateOngoingTournamentList(currentPage).then(() => {});
        }
    }
}

const handleTournamentMatchReceived = async (data) => {
    const currentPage = PageBase.isInstance(PageBase.instance, 'Tournament') ? PageBase.instance : null;

    if (data.action === 'tournament_prepare') {
        addNotice(labels.tournament.msgPrepare.replace('$tournament', data.name), false);
        if (currentPage) {
            updateUpcomingTournamentList(currentPage).then(() => {});
            updateOngoingTournamentList(currentPage).then(() => {});
        }
    } else if (data.action === 'tournament_room') {
        //ここでdata.nameを渡せないとentry情報が取得できずcan not enter tournament roomになる
        await enterTournamentRoomRequest(data.name);
    } else if (data.action === 'tournament_match') {
        addNotice(labels.tournament.msgStart.replace('$tournament', data.name), false);
    } else if (data.action === 'enterRoom') {
        //tornament.nameを渡せずenterRoomできなければここに入れない
        sessionStorage.setItem('tournament_id', data.id);
        sessionStorage.setItem('tournament_status', 'waiting_start');
        addNotice(labels.tournament.msgEnterRoom.replace('$tournament', data.name), false);
        if (!data.id) {
            console.log(`can not enter room`);
            return;
        }
        if (window.location.pathname !== `/tournament/detail:${data.id}`) {
            window.history.pushState(null, null, `/tournament/detail:${data.id}`);
            await router(true);
        }
    } else if (data.action === 'canceled') {
        addNotice(labels.tournament.msgCanceled.replace('$tournament', data.name), true);
        if (currentPage) {
            updateUpcomingTournamentList(currentPage).then(() => {});
            updateOngoingTournamentList(currentPage).then(() => {});
        }
        window.history.pushState(null, null, '/dashboard');
        await router(true);
    } else if (data.action === 'finished') {
        addNotice(labels.tournament.msgFinished.replace('$tournament', data.name), false);
        sessionStorage.removeItem('tournament_id');
        if (PageBase.isInstance(PageBase.instance, 'TournamentDetail')) {
            PageBase.instance.hideWaiting();
            await PageBase.instance.generateTournamentResult();
        }
        sessionStorage.removeItem('tournament_status');
    } else if (data.action === 'notifyByePlayer') {
        if (PageBase.isInstance(PageBase.instance, 'TournamentDetail')) {
            PageBase.instance.displayWaiting(labels.tournament.labelWaitBye, labels.tournament.msgWaitBye);
            await PageBase.instance.generateTournamentResult();
        }
    } else if (data.action === 'notifyWaitSemiFinal') {
        if (PageBase.isInstance(PageBase.instance, 'TournamentDetail')) {
            PageBase.instance.displayWaiting(labels.tournament.labelWaitSemiFinal, labels.tournament.msgWaitSemiFinal);
            await PageBase.instance.generateTournamentResult();
        }
    } else if (data.action === 'notifyWaitFinal') {
        if (PageBase.isInstance(PageBase.instance, 'TournamentDetail')) {
            PageBase.instance.displayWaiting(labels.tournament.labelWaitFinal, labels.tournament.msgWaitFinal);
        }
    } else if (data.action === 'notifyFinalOnGoing') {
        if (PageBase.isInstance(PageBase.instance, 'TournamentDetail')) {
            PageBase.instance.displayWaiting(labels.tournament.labelFinalOnGoing, labels.tournament.msgFinalOnGoing);
        }
    } else if (data.action === 'roundEnd') {
        if (PageBase.isInstance(PageBase.instance, 'TournamentDetail')) {
            PageBase.instance.displayWaiting(labels.tournament.labelWaitLose, labels.tournament.msgWaitLose);
            await PageBase.instance.generateTournamentResult();
        }
    }
    console.log(`${data.name} ${data.action}の通知です`);
}

const handleDisconnetByNewLogin = () => {
    addNotice(labels.common.disconnectedByNewLogin, true);
    console.log('Disconnect by new login');
    handleLogout(new Event('logout'));
}

const handleGameSesssionReconnect = (data) => {
    addNotice(labels.match.msgReconnectMatch, false);
    console.log('Rejoin to the match');
    loadGameContent(data);
}
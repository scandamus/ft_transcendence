'use strict';

import { accept_game, reject_game, cancel_game, join_game, request_game } from "./match.js";
import { join_lounge_game, exit_lounge_match_room } from "./lounge_match.js";
import { getToken, initToken } from "./token.js";
import * as mc from "./modalContents.js";
import { labels } from './labels.js';
import { entryUpcomingTournament } from "./tournament.js";
import { router } from "./router.js";
import GamePlay from "../components/GamePlay.js";
import GamePlayQuad from "../components/GamePlayQuad.js";
import { webSocketManager } from "./websocket.js";
import { SiteInfo } from "./SiteInfo.js";
import PageBase from "../components/PageBase.js";
import { addListenerToList, removeListenerAndClearList } from './listenerCommon.js';
import { addNotice } from "./notice.js";
import { updateOngoingTournamentList, updateUpcomingTournamentList } from "./tournamentList.js";

const endIndicator = (ev) => {
    const indicatorBar = ev.target;
    indicatorBar.removeEventListener('transitionend', endIndicator);
    closeModalOnCancel();
};

//elHtmlのルート要素は`.blockModal`とする
const showModal = (elHtml) => {
    //modal open
    const elModal = document.getElementById('wrapModal');
    elModal.classList.add('is-show');
    elModal.innerHTML = elHtml;
        
    //キャンセルボタンにaddEventListener
    const btnCancel = document.querySelector('.blockBtnCancel_button');
    if (btnCancel) {
        btnCancel.addEventListener('click', closeModalOnCancel);
    }

    //AcceptボタンにaddEventListener
    const btnAccept = document.querySelector('.blockBtnAccept_button');
    if (btnAccept) {
        btnAccept.addEventListener('click', closeModalOnAccept);
    }

    //RejectボタンにaddEventListener
    const btnReject = document.querySelector('.blockBtnReject_button');
    if (btnReject) {
        //todo: Reject特化の関数が必要か検討
        btnReject.addEventListener('click', closeModalOnReject);
    }

    //ReturnToGameボタンにaddEventListener
    const btnReturnToGame = document.querySelector('.blockBtnReturnToGame_button');
    if (btnReturnToGame) {
        btnReturnToGame.addEventListener('click', closeModalOnReturnToGame);
    }

    //ExitGameボタンにaddEventListener
    const btnExitGame = document.querySelector('.blockBtnExitGame_button');
    if (btnExitGame) {
        btnExitGame.addEventListener('click', closeModalOnExitGame);
    }

    //インディケータがあれば進行、終了でcloseModalOnCancel
    const indicator = document.getElementById('indicator');
    if (indicator) {
        const indicatorBar = indicator.querySelector('.unitIndicator_bar');
        indicatorBar.addEventListener('transitionend', endIndicator);
        requestAnimationFrame(() => {
            indicator.classList.add('is-progress');
        });
    }

    //todo: インディケータのないモーダルは何かしら閉じるようにしておく
}

const closeModalOnCancel = () => {
    console.log('closeModalOnCancel');
    const modal = document.querySelector('.blockModal');
    const username = modal.getAttribute('data-modal-username');
    const matchType = modal.getAttribute('data-modal-match_type');

    initToken()
        .then((accessToken) => {
            //btnCancel, btnReject removeEventListener
            const btnCancel = document.querySelector('.blockBtnCancel_button');
            if (btnCancel) {
                btnCancel.removeEventListener('click', closeModalOnCancel);
            }
            const btnReject = document.querySelector('.blockBtnReject_button');
            if (btnReject) {
                btnReject.addEventListener('click', closeModalOnCancel);
            }
            //indicator removeEventListener
            const indicator = document.getElementById('indicator');
            if (indicator) {
                const indicatorBar = indicator.querySelector('.unitIndicator_bar');
                indicatorBar.removeEventListener('transitionend', endIndicator);
            }
            const btnReturnToGame = document.querySelector('.blockBtnReturnToGame_button');
            if (btnReturnToGame) {
                btnReturnToGame.removeEventListener('click', closeModalOnReturnToGame);
            }
            const btnExitGame = document.querySelector('.blockBtnExitGame_button');
            if (btnExitGame) {
                btnExitGame.removeEventListener('click', closeModalOnExitGame);
            }
            console.log(`matchType: ${matchType}`);
            if (matchType === 'friendMatch') {
                //cancel game
                console.log(`cancel friend Match: ${username}`);
                cancel_game(username);
            } else if (matchType === 'loungeMatch') {
                console.log('cancel lounge match');
                exit_lounge_match_room(modal.getAttribute('data-modal-game_name'));
            } else if (matchType === 'entryTournament') {
                console.log('cancel entry tournament');
            }
        })
        .then(() => {
            //modal close
            closeModal();
        });
}

const closeModalOnReject = (ev) => {
    console.log('closeModalOnReject');
    const modal = ev.target.closest('.blockModal');
    const args = {
        request_id: modal.getAttribute('data-modal-request_id'),
        username: modal.getAttribute('data-modal-username')
    };

    initToken()
        .then((accessToken) => {
            //btnCancel, btnReject removeEventListener
            const btnCancel = document.querySelector('.blockBtnCancel_button');
            if (btnCancel) {
                btnCancel.removeEventListener('click', closeModalOnCancel);
            }
            const btnReject = document.querySelector('.blockBtnReject_button');
            if (btnReject) {
                btnReject.removeEventListener('click', closeModalOnReject);
            }
            //indicator removeEventListener
            const indicator = document.getElementById('indicator');
            if (indicator) {
                const indicatorBar = indicator.querySelector('.unitIndicator_bar');
                indicatorBar.removeEventListener('transitionend', endIndicator);
            }
            //cancel game
            console.log(`reject game: ${args.request_id}`);
            reject_game(args.request_id, args.username);
        })
        .then(() => {
            closeModal();
        });
}

const closeModalOnAccept = (ev) => {
    console.log('closeModalOnAccept');
    const modal = ev.target.closest('.blockModal');
    const args = {
        request_id: modal.getAttribute('data-modal-request_id'),
        username: modal.getAttribute('data-modal-username')
    };

    initToken()
        .then((accessToken) => {
            //AcceptボタンremoveEventListener
            const btnAccept = document.querySelector('.blockBtnAccept_button');
            btnAccept.removeEventListener('click', closeModalOnAccept);
            //indicator removeEventListener
            const btnReject = document.querySelector('.blockBtnReject_button');
            btnReject.addEventListener('click', closeModalOnCancel);
            //todo:start game
            accept_game(args.request_id, args.username);
            console.log(`accept game: ${args.request_id}`);
        })
        .then(() => {
            closeModal();
        });
}

const closeModalOnReturnToGame = () => {
    console.log('closeModalOnReturnToGame');
    const containerId = (GamePlay.instance) ? GamePlay.instance.containerId : GamePlayQuad.instance.containerId;

    initToken()
        .then((accessToken) => {
            const btnReturnToGame = document.querySelector('.blockBtnReturnToGame_button');
            if (btnReturnToGame) {
                btnReturnToGame.removeEventListener('click', closeModalOnReturnToGame);
            }
            const btnExitGame = document.querySelector('.blockBtnExitGame_button');
            if (btnExitGame) {
                btnExitGame.removeEventListener('click', closeModalOnExitGame);
            }
        })
        .then(() => {
            window.history.pushState(null, null, `/game/${containerId}`);
            closeModal();
        });
}

const setScoreToInvalid = () => {
    const siteInfo = new SiteInfo();
    const userName = siteInfo.getUsername();
    const currentPage = (PageBase.isInstance(PageBase.instance, 'GamePlay') || PageBase.isInstance(PageBase.instance, 'GamePlayQuad'))
                                ? PageBase.instance : null;
    if (!currentPage) return;
    for (let i = 0; i < 4; i++) {
        if (PageBase.isInstance(PageBase.instance, 'GamePlay') && i > 2) break;
        const player = `player${i+1}`;
        const score = `score${i+1}`;

        if (currentPage[player] === userName) {
            // 対応するスコアを -1 に設定
            currentPage[score] = -1;
            console.log(`Set ${score} to -1 for player ${userName}`);
            break ;
        }
    }
}

const handleExitGame = (instance) => {
    console.log('handleExitGame')
    const containerId = PageBase.isInstance(instance, 'GamePlay') ? GamePlay.instance.containerId : GamePlayQuad.instance.containerId;
    webSocketManager.closeWebSocket(containerId);
    instance.containerId = ''
    //todo: score -1にする
    //setScoreToInvalid();
    //todo: status, current_match更新
}

const closeModalOnExitGame = (ev) => {
    ev.preventDefault();
    console.log('closeModalOnExitGame');

    initToken()
        .then((accessToken) => {
            const btnReturnToGame = document.querySelector('.blockBtnReturnToGame_button');
            if (btnReturnToGame) {
                btnReturnToGame.removeEventListener('click', closeModalOnReturnToGame);
            }
            const btnExitGame = document.querySelector('.blockBtnExitGame_button');
            if (btnExitGame) {
                btnExitGame.removeEventListener('click', closeModalOnExitGame);
            }
        })
        .then(async () => {
            closeModal();
            handleExitGame(PageBase.instance);
            try {
                await router(getToken('accessToken'));
            } catch (error) {
                console.error(error);
            }
        });
}

const closeModal = () => {
    const elModal = document.getElementById('wrapModal');
    elModal.classList.remove('is-show');
    elModal.innerHTML = '';
}

const contModal = {
    sendMatchRequest: mc.sendMatchRequest,
    receiveMatchRequest: mc.receiveMatchRequest,
    waitForOpponent: mc.waitForOpponent,
    entryTournament: mc.entryTournament,
    exitGame: mc.exitGame
};

const getModalHtml = (modalType, args) => {
    return contModal[modalType](args);
}

const showModalSendMatchRequest = (ev) => {
    const button = ev.target;
    const args = {
        titleModal: labels.modal.titleSendMatchRequest,
        username: button.dataset.username,
        avatar: button.dataset.avatar,
        labelCancel: labels.modal.labelCancel,
        matchType: 'friendMatch',
    }
    const elHtml = getModalHtml('sendMatchRequest', args);
    request_game(button.dataset.username, button.dataset.id)
        .then(r => {
            showModal(elHtml);
        });
}

const showModalReceiveMatchRequest = (data) => {
    // WebSocketから受け取った相手のusernameおよびavatarを表示
    const avatar = data.avatar ? data.avatar : '/images/avatar_default.png';
    const args = {
        titleModal: labels.modal.titleReceiveMatchRequest,
        username: data.from,
        request_id: data.request_id,
        avatar: avatar,
        labelAccept: labels.modal.labelAccept,
        labelReject: labels.modal.labelReject,
    }
    const elModal = document.querySelector('.blockModal');
    if (elModal) {
        reject_game(data.request_id, data.from).then(() => {});
        return;
    }
    const elHtml = getModalHtml('receiveMatchRequest', args);
    showModal(elHtml);
}

const showModalWaitForOpponent = (ev) => {
    ev.preventDefault();
    const buttonId = ev.target.id;
//    const gameType = buttonId === 'dualGameButton' ? 'dual' : 'quad';
    const gameName = buttonId === 'btnJoinDual' ? 'pong' : 'pong4';
    const capacityNum = buttonId === 'btnJoinDual' ? 2 : 4;

    const args = {
        titleModal: labels.modal.titleWaitForOpponent,
        labelCancel: labels.modal.labelCancel,
        labelCapacity: labels.modal.labelCapacity,
        labelAvailable: labels.modal.labelAvailable,
        labelCapacityNum: capacityNum,
        matchType: 'loungeMatch',
        game_name: gameName,
    };
    const elHtml = getModalHtml('waitForOpponent', args);
    join_lounge_game(gameName)
        .then(r => {
            showModal(elHtml);
        });
}

const showModalEntryTournament = (ev) => {
    const formData = new FormData(ev.target.closest('form'));
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });
    if (Object.keys(data).length === 0) {
        //formから取得するデータが無い
        return;
    }

    const currentTime = new Date();
    const tournamentStartTime = new Date(data['start']);
    const entryDeadline = new Date(tournamentStartTime.getTime() - 5 * 60 * 1000);
    if (currentTime > entryDeadline) {
        addNotice(`トーナメント ${data['idTitle']} のエントリー期限を過ぎています`, true);
        const currentPage = PageBase.isInstance(PageBase.instance, 'Tournament') ? PageBase.instance : null;
        updateUpcomingTournamentList(currentPage).then(() => {});
        updateOngoingTournamentList(currentPage).then(() => {});
        return;
    }

    let listDesc = '';
    for (let i = 0; i < labels.tournament.descNickname.length; i++) {
        listDesc += `<li>${labels.tournament.descNickname[i]}</li>`;
    }
    const args = {
        titleModal: labels.modal.titleEntryTournament,
        labelNickname: labels.modal.labelNickname,
        labelEntry: labels.modal.labelEntry,
        labelCancel: labels.modal.labelCancel,
        labelTournamentId: data['idTitle'],
        labelTournamentTitle: data['title'],
        labelTournamentStart: data['start'],
        desc: listDesc
    }
    const elHtml = getModalHtml('entryTournament', args);
    showModal(elHtml);

    const formEntry = document.getElementById('formEntryTournament');
    const elNickname = document.getElementById('inputNickname');

    const boundHandleInput = PageBase.instance.handleInput.bind(PageBase.instance);
    addListenerToList(
        PageBase.instance.listListenElEntryTournament,
        elNickname,
        boundHandleInput,
        'blur'
    );

    if (formEntry) {
        formEntry.addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const nickname = elNickname.value;
            try {
                data.nickname = nickname;
                await entryUpcomingTournament(data);
                //closeModal();はdata.action === 'entryDone'で呼ぶ
                console.log(`Tournament ID: ${data['idTitle']}, Nickname: ${nickname}`);
            } catch (error) {
                console.error('Entry failed:', error);
            }
        });
    }
}

const closeModalOnEntryDone = () => {
    removeListenerAndClearList(PageBase.instance.listListenElEntryTournament);
    closeModal();
}

const updateModalAvailablePlayers = (availablePlayers) => {
    const modal = document.querySelector('.blockModal');
    if (modal) {
        const availableSpan = modal.querySelector('.unitCapacity_numerator span');
        if (availableSpan) {
            availableSpan.textContent = availablePlayers;
        }
    }
}

const showModalExitGame = () => {
    const args = {
        titleModal: labels.modal.titleExitGame,
        labelExitGame: labels.modal.labelExitGame,
        labelReturnToGame: labels.modal.labelReturnToGame
    }
    const elHtml = getModalHtml('exitGame', args);
    showModal(elHtml);
}

export { showModal, closeModalOnCancel, showModalSendMatchRequest, showModalReceiveMatchRequest, showModalWaitForOpponent, showModalEntryTournament, closeModal, updateModalAvailablePlayers, handleExitGame, showModalExitGame, closeModalOnReturnToGame, closeModalOnEntryDone };

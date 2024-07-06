'use strict';

import { accept_game, reject_game, cancel_game, join_game, request_game } from "./match.js";
import { join_lounge_game, exit_lounge_match_room } from "./lounge_match.js";
import { initToken } from "./token.js";
import * as mc from "./modalContents.js";
import { labels } from './labels.js';
import { entryUpcomingTournament } from "./tournament.js";

const endIndicator = (ev) => {
    const indicatorBar = ev.target;
    indicatorBar.removeEventListener('transitionend', endIndicator);
    closeModalOnCancel(ev);
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

const closeModalOnCancel = (ev) => {
    console.log('closeModalOnCancel');
    const modal = ev.target.closest('.blockModal');
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

const closeModal = () => {
    const elModal = document.getElementById('wrapModal');
    elModal.classList.remove('is-show');
    elModal.innerHTML = '';
}

const contModal = {
    sendMatchRequest: mc.sendMatchRequest,
    receiveMatchRequest: mc.receiveMatchRequest,
    waitForOpponent: mc.waitForOpponent,
    entryTournament: mc.entryTournament
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
    const args = {
        titleModal: labels.modal.titleEntryTournament,
        labelNickname: labels.modal.labelNickname,
        labelEntry: labels.modal.labelEntry,
        labelCancel: labels.modal.labelCancel,
        labelTournamentId: data['idTitle'],
        labelTournamentTitle: data['title'],
        labelTournamentStart: data['start'],
    }
    const elHtml = getModalHtml('entryTournament', args);
    showModal(elHtml);

    const formEntry = document.getElementById('formEntryTournament');
    if (formEntry) {
        formEntry.addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const nickname = formEntry.querySelector('#inputNickname').value;
            try {
                data.nickname = nickname;
                await entryUpcomingTournament(data);
                closeModal();
                console.log(`Tournament ID: ${data['idTitle']}, Nickname: ${nickname}`);
            } catch (error) {
                console.error('Entry failed:', error);
            }
        });
    }
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

export { showModal, closeModalOnCancel, showModalSendMatchRequest, showModalReceiveMatchRequest, showModalWaitForOpponent, showModalEntryTournament, closeModal, updateModalAvailablePlayers };


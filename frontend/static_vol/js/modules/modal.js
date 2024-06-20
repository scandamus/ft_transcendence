'use strict';

import { accept_game, reject_game, cancel_game, join_game, request_game } from "./match.js";
import { initToken } from "./token.js";
import * as mc from "./modalContents.js";

const endIndicator = (ev) => {
    const indicatorBar = ev.target;
    indicatorBar.removeEventListener('transitionend', endIndicator);
    closeModalOnCancel();
};

//elHtmlのルート要素は`.blockModal`とする
const showModal = (elHtml, args) => {
    //modal open
    const elModal = document.getElementById('wrapModal');
    elModal.classList.add('is-show');
    elModal.innerHTML = elHtml;

    //キャンセルボタンにaddEventListener
    const btnCancel = document.querySelector('.blockBtnCancel_button');
    if (btnCancel) {
        btnCancel.addEventListener('click', () => closeModalOnCancel(args));
    }

    //AcceptボタンにaddEventListener
    const btnAccept = document.querySelector('.blockBtnAccept_button');
    if (btnAccept) {
        btnAccept.addEventListener('click', () => closeModalOnAccept(args));
    }

    //RejectボタンにaddEventListener
    const btnReject = document.querySelector('.blockBtnReject_button');
    if (btnReject) {
        //todo: Reject特化の関数が必要か検討
        btnReject.addEventListener('click', () => closeModalOnReject(args));
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

const closeModalOnCancel = (args) => {
    console.log('closeModalOnCancel');
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
            //cancel game
            console.log(`cancel game: ${args.username}`);
            cancel_game(args.username);
        })
        .then(() => {
            closeModal();
        });
}

const closeModalOnReject = (args) => {
    console.log('closeModalOnReject');
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

const closeModalOnAccept = (args) => {
    console.log('closeModalOnAccept');
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
        titleModal: '対戦を申し込みました',
        username: button.dataset.username,
        avatar: button.dataset.avatar,
        labelCancel: 'キャンセル',
    }
    const elHtml = getModalHtml('sendMatchRequest', args);
    //todo: 対戦相手に通知、承諾 or Rejectを受け付けるなど
    // 以下を変更し、friend_match_game()を呼ぶ
    request_game(button.dataset.username, button.dataset.id)
        .then(r => {
            showModal(elHtml, args);
        });
}

const showModalReceiveMatchRequest = (data) => {
    // WebSocketから受け取った相手のusernameおよびavatarを表示
    // 
    //const button = ev.target;
    const args = {
        titleModal: '対戦申し込みがありました',
        username: data.from,
        request_id: data.request_id,
        avatar: '',
    //    username: button.dataset.name,
    //    avatar: button.dataset.avatar,
        labelAccept: 'Accept',
        labelReject: 'Reject'
    }
    const elHtml = getModalHtml('receiveMatchRequest', args);
    showModal(elHtml, args);
}

const showModalWaitForOpponent = (ev) => {
    const formData = new FormData(ev.target.closest('form'));
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });
    const args = {
        titleModal: 'Waiting...',
        labelCancel: 'キャンセル',
        labelCapacity: '定員',
        labelAvailable: '募集中',
    }
    args.labelCapacityNum = (data['gameType'] === 'dual') ? 2 : 4;
    const elHtml = getModalHtml('waitForOpponent', args);
    join_game()
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
        titleModal: 'Entry Tournament',
        labelNickname: 'NickName',
        labelEntry: 'Entry',
        labelCancel: 'Cancel',
        labelTournamentId: data['idTitle'],
        labelTournamentTitle: data['title'],
        labelTournamentStart: data['start'],
    }
    //args.labelTournamentTitle = data['title'];
    const elHtml = getModalHtml('entryTournament', args);
    join_game()
        .then(r => {
            showModal(elHtml);
        });
}

export { closeModalOnCancel, showModalSendMatchRequest, showModalReceiveMatchRequest, showModalWaitForOpponent, showModalEntryTournament, closeModal };


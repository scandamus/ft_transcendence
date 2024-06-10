'use strict';

import { cancel_game, join_game } from "./match.js";
import { initToken } from "./token.js";
import * as mc from "./modalContents.js";

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
        btnReject.addEventListener('click', closeModalOnCancel);
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
            cancel_game();
        })
        .then(() => {
            closeModal();
        });
}

const closeModalOnAccept = () => {
    initToken()
        .then((accessToken) => {
            //AcceptボタンremoveEventListener
            const btnAccept = document.querySelector('.blockBtnAccept_button');
            btnAccept.removeEventListener('click', closeModalOnAccept);
            //indicator removeEventListener
            const btnReject = document.querySelector('.blockBtnReject_button');
            btnReject.addEventListener('click', closeModalOnCancel);
            //todo:start game
            console.log('start game');
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
    waitForOpponentDual: mc.waitForOpponentDual,
    waitForOpponentQuad: mc.waitForOpponentQuad,
};

const getModalHtml = (modalType, args) => {
    return contModal[modalType](args);
}



const showModalMatchRequest = (ev) => {
    const button = ev.target;
    const args = {
        titleModal: '対戦を申し込みました',
        username: button.dataset.name,
        avatar: button.dataset.avatar,
        labelCancel: 'キャンセル',
    }
    const elHtml = getModalHtml('sendMatchRequest', args);
    //todo: 対戦相手に通知、承諾 or Rejectを受け付けるなど
    join_game()
        .then(r => {
            showModal(elHtml);
        });
}

const showModalReceiveReqMatch = (ev) => {
    const button = ev.target;
    const args = {
        titleModal: '対戦申し込みがありました',
        username: button.dataset.name,
        avatar: button.dataset.avatar,
        labelAccept: 'Accept',
        labelReject: 'Reject'
    }
    const elHtml = getModalHtml('receiveMatchRequest', args);
    join_game()
        .then(r => {
            showModal(elHtml);
        });
}

const showModalWaitForOpponent = (ev) => {
    const formData = new FormData(ev.target.closest('form'));
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });
    const args = {
        titleModal: 'Waiting...',
        labelCancel: 'キャンセル'
    }
    const modalTypeForGame = (data['gameType'] === 'dual') ? 'waitForOpponentDual' : 'waitForOpponentQuad';
    const elHtml = getModalHtml(modalTypeForGame, args);
    join_game()
        .then(r => {
            showModal(elHtml);
        });
}

export { showModal, closeModalOnCancel, getModalHtml, showModalMatchRequest, showModalReceiveReqMatch, showModalWaitForOpponent };

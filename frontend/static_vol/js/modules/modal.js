'use strict';

import { cancel_game } from "./match.js";
import { initToken } from "./token.js";

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
    btnCancel.addEventListener('click', closeModalOnCancel);

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
            //キャンセルボタンremoveEventListener
            const btnCancel = document.querySelector('.blockBtnCancel_button');
            btnCancel.removeEventListener('click', closeModalOnCancel);
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
            //modal close
            closeModal();
        });
}

const closeModal = () => {
    const elModal = document.getElementById('wrapModal');
    elModal.classList.remove('is-show');
    elModal.innerHTML = '';
}

export { showModal, closeModalOnCancel, closeModal };

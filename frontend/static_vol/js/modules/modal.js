'use strict';

const endIndicator = (ev) => {
    const indicatorBar = ev.target;
    indicatorBar.removeEventListener('transitionend', endIndicator);
    closeModal();
};

//elHtmlのルート要素は`.blockModal`とする
const showModal = (elHtml) => {
    //modal open
    const elModal = document.getElementById('wrapModal');
    elModal.classList.add('is-show');
    elModal.innerHTML = elHtml;

    //キャンセルボタンにaddEventListener
    const btnCancel = document.querySelectorAll('.blockBtnCancel_button');
    btnCancel.forEach((btn) => {
        btn.addEventListener('click', closeModal);
    });

    //インディケータがあれば進行、終了でcloseModal
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

const closeModal = () => {
    //キャンセルボタンremoveEventListener
    const btnCancel = document.querySelectorAll('.blockBtnCancel_button');
    btnCancel.forEach((btn) => {
        btn.removeEventListener('click', closeModal);
    });
    const indicator = document.getElementById('indicator');
    if (indicator) {
        const indicatorBar = indicator.querySelector('.unitIndicator_bar');
        indicatorBar.removeEventListener('transitionend', endIndicator);
    }
    //modal close
    const elModal = document.getElementById('wrapModal');
    elModal.classList.remove('is-show');
    elModal.innerHTML = '';
}

export { showModal, closeModal };

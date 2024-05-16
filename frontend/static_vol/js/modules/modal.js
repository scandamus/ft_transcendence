'use strict';

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

    //インディケータがあれば進行
    const indicator = document.getElementById('indicator');
    if (indicator) {
        requestAnimationFrame(() => {
            indicator.classList.add('is-progress');
        });
    }
}

const closeModal = () => {
    //キャンセルボタンremoveEventListener
    const btnCancel = document.querySelectorAll('.blockBtnCancel_button');
    btnCancel.forEach((btn) => {
        btn.removeEventListener('click', closeModal);
    });

    //modal close
    const elModal = document.getElementById('wrapModal');
    elModal.classList.remove('is-show');
    elModal.innerHTML = '';
}

export { showModal };

'use strict';

const addNotice = async　(textNotice) => {
    const elNoticeWrap = document.getElementById('wrapNotice');
    const elNoticeHtml = `
        <li class="unitNotice">
            <p>usernameに友達申請を送信しました</p>
            <button type="button" class="unitNotice_button"><img src="/images/ico-cross-white.svg" alt="close" width="10px" height="10px"></button>
        </li>
    `;
    elNoticeWrap.insertAdjacentHTML('beforeend', elNoticeHtml);
    const newNotice = elNoticeWrap.lastElementChild;
    setTimeout(() => {
    newNotice.classList.add('unitNotice-appear');
    }, 5);
    await new Promise(resolve => {
        newNotice.addEventListener('transitionend', resolve, { once: true });
    });
    await new Promise(resolve => setTimeout(resolve, 10000));
    newNotice.classList.add('unitNotice-disappear');
    await new Promise(resolve => {
        newNotice.addEventListener('transitionend', resolve, { once: true });
    });
    newNotice.remove();
}

export { addNotice };

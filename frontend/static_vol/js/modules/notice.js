'use strict';

const addNoticeMod = async　(textNotice, isError) => {
    const elNoticeWrap = document.getElementById('wrapNotice');
    const noticeClass = isError ? 'unitNotice unitNotice-error' : 'unitNotice';
    const elNoticeHtml = `
        <li class="${noticeClass}">
            <p>${textNotice}</p>
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
    await new Promise(resolve => setTimeout(resolve, 5000));
    return newNotice;
}

const removeNoticeMod =　(elNotice) => {
    elNotice.classList.add('unitNotice-disappear');
    elNotice.addEventListener('transitionend', () => {
        elNotice.remove();
    }, { once: true });
}

export { addNoticeMod, removeNoticeMod };

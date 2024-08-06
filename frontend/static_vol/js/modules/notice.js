'use strict';

const addNoticeMod = async (textNotice, isError) => {
    const elNoticeWrap = document.getElementById('wrapNotice');
    const noticeClass = isError ? 'unitNotice unitNotice-error' : 'unitNotice';
    const elNoticeHtml = `
        <li class="${noticeClass}">
            <p>${textNotice}</p>
            <button type="button" class="unitNotice_button"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="width:10px;height:10px;" xml:space="preserve"><path style="fill:rgba(255, 255, 255, 0.7)" d="M512 52.535 459.467.002l-203.465 203.46L52.538.002 0 52.535l203.47 203.47L0 459.465l52.533 52.533 203.469-203.471 203.465 203.471L512 459.475l-203.464-203.47z"/></svg></button>
        </li>
    `;
    elNoticeWrap.insertAdjacentHTML('beforeend', elNoticeHtml);
    const newNotice = elNoticeWrap.lastElementChild;
    newNotice.querySelector('.unitNotice_button')
        .addEventListener('click', ()=>{removeNoticeMod(newNotice)}, { once: true });
    setTimeout(() => {
        newNotice.classList.add('unitNotice-appear');
    }, 100);
    await new Promise(resolve => {
        newNotice.addEventListener('transitionend', resolve, { once: true });
    });
    await new Promise(resolve => setTimeout(resolve, 5000));
    return newNotice;
}

const removeNoticeMod = (elNotice) => {
    if (elNotice && document.body.contains(elNotice)) {
        elNotice.classList.add('unitNotice-disappear');
        elNotice.addEventListener('transitionend', () => {
            elNotice.remove();
        }, { once: true });
    }
}

const addNotice = (message, isError) => {
    addNoticeMod(message, isError)
        .then((elNotice) => {
            removeNoticeMod(elNotice);
        })
        .catch(error => {
            console.error('addNotice failed:', error);
        })
}

export { addNotice };

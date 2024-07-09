'use strict';

import { getUserInfo, switchDisplayAccount } from './modules/auth.js';
import { addLinkPageEvClick, router } from './modules/router.js';
import { switchLanguage } from './modules/switchLanguage.js';
import { getToken } from "./modules/token.js";
import { SiteInfo } from "./modules/SiteInfo.js";

//load
document.addEventListener('DOMContentLoaded', async () => {
    const siteInfo = new SiteInfo();
    try {
        await getUserInfo().then(() => {})
        await switchDisplayAccount();
        if (siteInfo.getUsername()) {
            await router(true);
        } else {
            await router(false);
        }
    } catch (error) {
        console.error(error);
    }
    //todo: selectedLanguageが未セットならdefault lang
    //const selectedLanguage = localStorage.getItem('selectedLanguage');

    //共通パーツのa[data-link]にaddEventListener
    const linkPagesCommon = document.querySelectorAll(':not(#app) a[data-link]');
    addLinkPageEvClick(linkPagesCommon);

    //ブラウザの履歴移動でrouter呼ぶようaddEventListener
    window.addEventListener('popstate', router);

    // 言語切り替え
    switchLanguage();
    changeFontSize();
});

//reload
window.addEventListener('beforeunload', () => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
});

//changeFontSige
const changeFontSize = () => {
    const elHtml = document.querySelector('html');
    const btnTextSmall = document.getElementById('btnTextSmall');
    const btnTextMid = document.getElementById('btnTextMid');
    const btnTextBig = document.getElementById('btnTextBig');

    btnTextSmall.addEventListener('click', () => {
        elHtml.style.fontSize = '52.5%';
    });
    btnTextMid.addEventListener('click', () => {
        elHtml.style.fontSize = '62.5%';
    });
    btnTextBig.addEventListener('click', () => {
        elHtml.style.fontSize = '80%';
    });
}

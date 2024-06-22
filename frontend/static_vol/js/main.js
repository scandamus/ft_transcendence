'use strict';

import { getUserInfo, switchDisplayAccount } from './modules/auth.js';
import { addLinkPageEvClick, router } from './modules/router.js';
import { switchLanguage } from './modules/switchLanguage.js';
import { getToken } from "./modules/token.js";

//load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const accessToken = getToken('accessToken');
        if (accessToken) {
            await router(true);
        } else {
            await router(false);
        }
        getUserInfo()
            .then(data => {
                switchDisplayAccount(data);
            })
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
});

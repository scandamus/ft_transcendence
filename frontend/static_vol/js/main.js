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
        await getUserInfo()
            .then(data => {
                if (data) {
                    siteInfo.setUsername(data.username);
                }
            })
        const username = siteInfo.getUsername();
        if (username) {
            await switchDisplayAccount(username);
            await router(true);
        } else {
            await switchDisplayAccount(false);
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
});

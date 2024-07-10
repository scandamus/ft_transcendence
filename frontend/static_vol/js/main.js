'use strict';

import { getUserInfo, switchDisplayAccount } from './modules/auth.js';
import { addLinkPageEvClick, router } from './modules/router.js';
import { switchLanguage } from './modules/switchLanguage.js';
import { getToken } from "./modules/token.js";
import { SiteInfo } from "./modules/SiteInfo.js";

//load
document.addEventListener('DOMContentLoaded', async () => {
    // 言語切り替え
    switchLanguage();

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

    //共通パーツのa[data-link]にaddEventListener
    const linkPagesCommon = document.querySelectorAll(':not(#app) a[data-link]');
    addLinkPageEvClick(linkPagesCommon);

    //ブラウザの履歴移動でrouter呼ぶようaddEventListener
    window.addEventListener('popstate', router);
});

//reload
window.addEventListener('beforeunload', () => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('all_usernames');
});

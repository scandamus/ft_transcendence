"use strict";

import { getUserInfo, switchDisplayAccount } from './modules/auth.js';
import { addLinkPageEvClick, checkProtectedRoute, router } from './modules/router.js';
import { switchLanguage } from './modules/switchLanguage.js';

//load
document.addEventListener("DOMContentLoaded", async () => {
    getUserInfo()
        .then(data => {
            switchDisplayAccount(data);
        })
        .catch(error => {
                console.error('getUserInfo failed:', error);
            });
    // if (!isLoggedIn && checkProtectedRoute(window.location.pathname)) {
    //     window.history.pushState({}, "", "/");
    //     router("/");
    //     return ;
    // }
    //todo: selectedLanguageが未セットならdefault lang
    //const selectedLanguage = localStorage.getItem("selectedLanguage");
    try {
        await router();
    } catch (error) {
        console.error(error);
    }
    //共通パーツのa[data-link]にaddEventListener
    const linkPagesCommon = document.querySelectorAll(':not(#app) a[data-link]');
    addLinkPageEvClick(linkPagesCommon);

    //ブラウザの履歴移動でrouter呼ぶようaddEventListener
    window.addEventListener("popstate", router);

    // 言語切り替え
    switchLanguage();
});

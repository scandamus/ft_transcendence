'use strict';

import { getUserInfo, switchDisplayAccount } from './modules/auth.js';
import { addLinkPageEvClick, router } from './modules/router.js';
import { setLangAttrSelected, setLang, getLang, updateDbLang } from './modules/switchLanguage.js';
import { switchLabels } from "./modules/labels.js";
import { getToken } from "./modules/token.js";

//load
document.addEventListener('DOMContentLoaded', async () => {
    //lang設定
    const lang = getLang();
    const elSelectLang = document.getElementById('languageSelect');
    setLangAttrSelected(elSelectLang, lang);
    switchLabels(lang);

    //router
    try {
        await router(false);
    } catch (error) {
        console.error(error);
    }

    //共通パーツのa[data-link]にaddEventListener
    const linkPagesCommon = document.querySelectorAll(':not(#app) a[data-link]');
    addLinkPageEvClick(linkPagesCommon);

    //ブラウザの履歴移動でrouter呼ぶようaddEventListener
    window.addEventListener('popstate', router);

    //言語切り替えonChangeをlisten
    elSelectLang.addEventListener('change', (ev) => {
        const elSelectLang = ev.target;
        const selectedLanguage = elSelectLang.value;
        const currentLang = localStorage.getItem('configLang');
        if (selectedLanguage !== currentLang) {
            setLang(elSelectLang, selectedLanguage);
            router(getToken('accessToken'));
        }
    });
});

//reload
window.addEventListener('beforeunload', () => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
});

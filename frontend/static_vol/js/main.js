'use strict';

import { getUserInfo, switchDisplayAccount } from './modules/auth.js';
import { addLinkPageEvClick, router } from './modules/router.js';
import { setLangAttrSelected, setLang, saveLang, getLang } from './modules/switchLanguage.js';
import { switchLabels } from "./modules/labels.js";
import { getToken } from "./modules/token.js";

//load
document.addEventListener('DOMContentLoaded', async () => {
    //lang設定
    const lang = getLang();
    const elSelectLang = document.getElementById('languageSelect');
    setLang(elSelectLang, lang);

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

        // ログイン状態判定
        const isLogin = !!sessionStorage.getItem('accessToken');
        if (selectedLanguage !== currentLang) {
            setLang(elSelectLang, selectedLanguage);
            saveLang(selectedLanguage);
            router(isLogin);
        }
    });

    changeFontSize();
});

//reload
window.addEventListener('beforeunload', () => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('all_usernames');
    sessionStorage.removeItem('player_name');
    sessionStorage.removeItem('tournament_id');
    sessionStorage.removeItem('tournament_status');
});

const unitChangeFontSize = (size, target, elHtml) => {
    const listSize = target.closest('.blockFontSize_list');
    const btnCurrent = listSize.querySelector('button.is-current');
    if (btnCurrent !== target) {
        btnCurrent.classList.remove('is-current');
        elHtml.style.fontSize = size;
        target.classList.add('is-current');
    }
}

//changeFontSige
const changeFontSize = () => {
    const elHtml = document.querySelector('html');
    const btnTextSmall = document.getElementById('btnTextSmall');
    const btnTextMid = document.getElementById('btnTextMid');
    const btnTextBig = document.getElementById('btnTextBig');

    btnTextMid.classList.add('is-current');
    btnTextSmall.addEventListener('click', (ev) => {
        unitChangeFontSize('52.5%', ev.target, elHtml);

    });
    btnTextMid.addEventListener('click', (ev) => {
        unitChangeFontSize('62.5%', ev.target, elHtml);
    });
    btnTextBig.addEventListener('click', (ev) => {
        unitChangeFontSize('80%', ev.target, elHtml);
    });
}

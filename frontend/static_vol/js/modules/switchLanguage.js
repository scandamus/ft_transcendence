'use strict';

import { labels, switchLabels } from './labels.js';
import { getToken, refreshAccessToken } from './token.js';
import { languageLabels } from './labels.js';
import { forcedLogout } from "./logout.js";
import { addNotice } from "./notice.js";

const setLangAttrSelected = (elSelectLang, lang) => {
    const options = elSelectLang.querySelectorAll('option');
    options.forEach(option => {
        option.removeAttribute('selected');
    });
    const elSelectedOption = elSelectLang.querySelector(`option[value="${lang}"]`);
    if (elSelectedOption) {
        elSelectedOption.setAttribute('selected', 'selected');
    }

    const previousElement = elSelectLang.previousElementSibling;
    if (previousElement && previousElement.tagName.toLowerCase() === 'label') {
        previousElement.textContent = `${labels.common.switchLang} :`;
    }
}

const setLangLogout = () => {
    const btnLogout = document.getElementById('btnLogoutForm');
    if (btnLogout) {
        btnLogout.innerText = labels.home.labelButtonLogout;
    }
}

const setLang = async (elSelectLang, lang) => {
    document.documentElement.lang = lang;
    await switchLabels(lang);
    setLangAttrSelected(elSelectLang, lang);
    setLangLogout();
}

const saveLang = async (lang) => {
    try {
        if (localStorage.getItem('configLang') !== lang) {
            localStorage.setItem('configLang', lang);
        }
        if(!getToken('accessToken')) {
            return;
        }
        const data = await updateDbLang(lang, false);
        if (!data) {
            throw new Error(`Failed to updateDbLang`);
        }
    } catch (error) {
        console.error('Failed to saveLang: ', error);
    }
}

const getLang = () => {
    const langStorage = localStorage.getItem('configLang');
    if (langStorage && (langStorage in languageLabels)) {
        return langStorage;
    }
    if (langStorage && !(langStorage in languageLabels)) {
        localStorage.removeItem('configLang');
    }
    return 'en';

};

const updateDbLang = async (lang, isRefresh) => {
    try {
        const accessToken = getToken('accessToken');
        const response = await fetch('/api/players/lang/', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ lang }),
        });
        if (response.ok) {
            return response.json();
        } else if (response.status === 401) {
            if (!isRefresh) {
                if (!await refreshAccessToken()) {
                    const error = new Error(`fail refresh token( ${response.status} )`);
                    error.status = response.status;
                    throw error;
                }
                return await updateDbLang(lang, true);
            } else {
                const error = new Error(`refreshed accessToken is invalid( ${response.status} )`);
                error.status = response.status;
                throw error;
            }
        } else {
            const error = new Error(`updateDbLang error. status( ${response.status} )`);
            error.status = response.status;
            throw error;
        }
    } catch (error) {
        console.error('Error on updateDbLang:', error);
        addNotice(labels.common.failUpdateDbLang, true);
        if (error.status === 401) {
            forcedLogout();
        }
        return null;
    }
}

export { setLangAttrSelected, setLang, saveLang, getLang, updateDbLang };

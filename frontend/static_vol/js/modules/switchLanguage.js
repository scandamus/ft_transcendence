'use strict';

import { labels, switchLabels } from './labels.js';
import { getToken, refreshAccessToken } from './token.js';
import { languageLabels } from './labels.js';

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

const saveLang = (lang) => {
    try {
        if (localStorage.getItem('configLang') !== lang) {
            localStorage.setItem('configLang', lang);
        }
        updateDbLang(lang, false)
            .then((data) => {
                if (!data) {
                    throw new Error(`Failed to updateDbLang`);
                }
            })
            .catch((error) => {
                console.error('Failed to updateDbLang: ', error);
            });
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
        if (accessToken === null) {
            console.log(`//updateDbLang null`)
            return Promise.resolve(null);
        }
        fetch('/api/players/lang/', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({lang}),
        })
            .then( async (response) => {
                if (!response.ok) {
                    if (!isRefresh) {
                        if (!await refreshAccessToken()) {
                            throw new Error('fail refresh token');
                        }
                        return await updateDbLang(lang, true);
                    } else {
                        throw new Error('refreshed accessToken is invalid.');
                    }
                    throw new Error(`Failed to update language: ${response.status}`);
                 }
                return response.json();
            })
            .then((data) => {
                if (!data) {
                    throw new Error(`Failed to updateDbLang`);
                }
                console.log('Language updated successfully:', data.message);
                return data;
            })
            .catch((error) => {
                console.error('Error update Lang', error);
            });
    } catch (error) {
        console.error('Error updateDbLang: ', error);
    }
}

export { setLangAttrSelected, setLang, saveLang, getLang, updateDbLang };

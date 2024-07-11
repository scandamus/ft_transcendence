'use strict';

import { labels, switchLabels } from './labels.js';
import { getToken } from './token.js';
import { languageLabels } from './labels.js';

const setLangAttrSelected = (elSelectLang, selectedLanguage) => {
    const options = elSelectLang.querySelectorAll('option');
    options.forEach(option => {
        option.removeAttribute('selected');
    });
    const elSelectedOption = elSelectLang.querySelector(`option[value="${selectedLanguage}"]`);
    if (elSelectedOption) {
        elSelectedOption.setAttribute('selected', 'selected');
    }

    const previousElement = elSelectLang.previousElementSibling;
    if (previousElement && previousElement.tagName.toLowerCase() === 'label') {
        previousElement.textContent = `${labels.common.switchLang} :`;
    }
}

const setLang = async (elSelectLang, lang) => {
    document.documentElement.lang = lang;
    await switchLabels(lang);
    setLangAttrSelected(elSelectLang, lang);
}

const saveLang = (lang) => {
    if (localStorage.getItem('configLang') !== lang) {
        localStorage.setItem('configLang', lang);
    }
    updateDbLang(lang);
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

const updateDbLang = (lang) => {
    const accessToken = getToken('accessToken');
    if (accessToken === null) {
        return Promise.resolve(null);
    }
    console.log(`updateDbLang: ${lang}`)
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
                throw new Error(response.status);
             }
            return response.json();
        })
        .then((data) => {
            console.log('Language updated successfully:', data.message);
            return data;
        })
        .catch((error) => {
            console.error('Error update Lang', error);
        });
}

export { setLangAttrSelected, setLang, saveLang, getLang, updateDbLang };

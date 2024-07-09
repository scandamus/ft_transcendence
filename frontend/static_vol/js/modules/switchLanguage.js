'use strict';

import { switchLabels } from './labels.js';
import { router } from './router.js';
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
}

const setLang = (elSelectLang, lang) => {
    localStorage.setItem('configLang', lang);
    setLangAttrSelected(elSelectLang, lang);
    switchLabels(lang);
    router(getToken('accessToken'));
}

const getLang = (lang) => {
    if (!lang || !(lang in languageLabels)) {
        localStorage.setItem('configLang', 'en');
        return 'en';
    }
    return lang;
};

// todo: DB: ユーザーの意図した言語でバックアップ。
// todo: localStorage: 普段遣い。ログアウト時も保持。
// todo: DBに保存し、localStorageにも随時反映して保持。急にログアウトしてしまった時も保持できるように。
//  login時点でDB, localStorageに異なる場合DB優先しlocalStorageにも反映。（他の端末で変更したかもしれない。）

export { setLangAttrSelected, setLang, getLang };

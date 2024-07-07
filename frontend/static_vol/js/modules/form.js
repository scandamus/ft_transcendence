'use strict';

import { labels } from './labels.js';

const errorTypes = ['valueMissing', 'patternMismatch', 'tooLong', 'tooShort', 'rangeOverflow', 'rangeUnderflow', 'customError'];

const errorMessages = {
    'valueMissing': labels.formErrorMessages.valueMissing,
    'patternMismatch': labels.formErrorMessages.patternMismatch,
    'tooLong': labels.formErrorMessages.tooLong,
    'tooShort': labels.formErrorMessages.tooShort,
    'rangeOverflow': labels.formErrorMessages.outOfRange,
    'rangeUnderflow': labels.formErrorMessages.outOfRange,
    //for customError
    'passwordIsNotSame': labels.formErrorMessages.passwordIsNotSame,
    'isExists': labels.formErrorMessages.isExists,
    //以下はfront validate弾けているはずができずにbackend validateでエラーになるパターン
    'invalidUsernameLenBackend': 'username is invalid.(len - backend)',
    'invalidUsernameCharacterTypesBackend': 'username is invalid.(character types - backend)',
    'invalidUsernameBlank': 'username is required.(required - backend)',
    'invalidPasswordLenBackend': 'password is invalid.(len - backend)',
    'invalidPasswordCharacterTypesBackend': 'password is invalid.(character types - backend)',
    'invalidPasswordBlank': 'password is required.(required - backend)',
    //for Tournament
    'invalidTournamentNameLenBackend': 'Tournament title is invalid.(len - backend)',
    'invalidTournamentnameCharacterTypesBackend': 'Tournament title is invalid.(character types - backend)',
    'invalidTournamentnameBlank': 'Tournament title is required.(required - backend)',
    'invalidNicknameLenBackend': 'Nickname is invalid.(len - backend)',
    'invalidNicknameCharacterTypesBackend': 'Nickname is invalid.(character types - backend)',
    'invalidNicknameBlank': 'Nickname is required.(required - backend)',
    //for LogIn
    'loginError1': labels.formErrorMessages.loginError1,
    'loginError2': labels.formErrorMessages.loginError2,
}

const addErrorMessage = (errWrapper, errorType) => {
    const elError = document.createElement('li');
    elError.textContent = errorMessages[errorType];
    elError.setAttribute('data-error-type', errorType);
    errWrapper.appendChild(elError);
}

const addErrorMessageCustom = (errWrapper, errorKey) => {
    const elError = document.createElement('li');
    elError.textContent = errorMessages[errorKey];
    elError.setAttribute('data-error-type', 'customError');
    elError.setAttribute('data-error-custom', errorKey);
    errWrapper.appendChild(elError);
}

const checkInputValid = (elInput) => {
    const errWrapper = elInput.parentNode.querySelector('.listError');
    const errWrapperPasswordConfirm =
        document.getElementById('registerPasswordConfirm').parentNode.querySelector('.listError');

    //validate OK
    const validityState = elInput.validity;
    if (validityState.valid) {
        const listLiError = errWrapper.querySelectorAll('li[data-error-type]');
        listLiError.forEach((li) => {
            li.remove();
        });
        return true;
    }

    //invalid。error表示してreturn false
    errorTypes.forEach((errorType) => {
        //customError => data-error-customが重複しないかで判定
        if (errorType === 'customError') {
            const errorKey = elInput.validationMessage;
            const listLiError = (errorKey === 'passwordIsNotSame') ?
                errWrapperPasswordConfirm.querySelectorAll('li[data-error-type]') :
                errWrapper.querySelectorAll('li[data-error-type]');
            const targetLi = Array.from(listLiError).find(li => li.getAttribute('data-error-custom') === errorKey);
            if (validityState[errorType]) {
                if (!targetLi) {
                    //password不一致エラーはconfirmのエラーとして表示
                    if (errorKey === 'passwordIsNotSame') {
                        addErrorMessageCustom(errWrapperPasswordConfirm, errorKey);
                    } else {
                        addErrorMessageCustom(errWrapper, errorKey);
                    }
                }
            } else {
                const targetLi = (elInput.id === 'registerPassword' || elInput.id === 'registerPasswordConfirm') ?
                    Array.from(errWrapperPasswordConfirm.querySelectorAll('li[data-error-type]')).find(li => li.getAttribute('data-error-custom')) :
                    Array.from(listLiError).find(li => li.getAttribute('data-error-custom'));
                if (targetLi) {
                    targetLi.remove();
                }
            }
        } else { //not customError => data-error-typeで判定
            const listLiError = errWrapper.querySelectorAll('li[data-error-type]');
            const targetLi = Array.from(listLiError).find(li => li.getAttribute('data-error-type') === errorType);
            if (validityState[errorType]) {
                if (!targetLi) {
                    addErrorMessage(errWrapper, errorType);
                }
            } else {
                if (targetLi) {
                    targetLi.remove();
                }
            }
        }
    });
    return false;
}

const checkSearchFriendInputValid = (elInput) => {
    const errWrapper = elInput.closest('form').querySelector('.listError');

    //validate OK
    const validityState = elInput.validity;
    if (validityState.valid) {
        const listLiError = errWrapper.querySelectorAll('li[data-error-type]');
        listLiError.forEach((li) => {
            li.remove();
        });
        return true;
    }

    //invalid。error表示してreturn false
    errorTypes.forEach((errorType) => {
        const listLiError = errWrapper.querySelectorAll('li[data-error-type]');
        const targetLi = Array.from(listLiError).find(li => li.getAttribute('data-error-type') === errorType);
        if (validityState[errorType]) {
            console.log(`//errorType: ${errorType}`)
            if (!targetLi) {
                addErrorMessage(errWrapper, errorType);
            }
        } else {
            if (targetLi) {
                targetLi.remove();
            }
        }
    });
    return false;
}

const checkTournamentInputValid = (elInput) => {
    const errWrapper = elInput.parentNode.querySelector('.listError');

    //validate OK
    const validityState = elInput.validity;
    if (validityState.valid) {
        const listLiError = errWrapper.querySelectorAll('li[data-error-type]');
        listLiError.forEach((li) => {
            li.remove();
        });
        return true;
    }

    //invalid。error表示してreturn false
    errorTypes.forEach((errorType) => {
        if (errorType === 'customError') {
            const errorKey = elInput.validationMessage;
            const listLiError = errWrapper.querySelectorAll('li[data-error-type]');
            const targetLi = Array.from(listLiError).find(li => li.getAttribute('data-error-custom') === errorKey);
            if (validityState[errorType]) {
                if (!targetLi) {
                    addErrorMessageCustom(errWrapper, errorKey);
                }
            } else {
                const targetLi = Array.from(listLiError).find(li => li.getAttribute('data-error-custom'));
                if (targetLi) {
                    targetLi.remove();
                }
            }
        } else {
            const listLiError = errWrapper.querySelectorAll('li[data-error-type]');
            const targetLi = Array.from(listLiError).find(li => li.getAttribute('data-error-type') === errorType);
            if (validityState[errorType]) {
                if (!targetLi) {
                    addErrorMessage(errWrapper, errorType);
                }
            } else {
                if (targetLi) {
                    targetLi.remove();
                }
            }
        }
    });
    return false;
}

const checkFormReady = (form, button) => {
    console.log(`/////checkFormReady`)
    if (form.checkValidity()) {
        if (button.hasAttribute('disabled')) {
            button.removeAttribute('disabled');
        }
        return true;
    } else if (!button.hasAttribute('disabled')) {
        button.setAttribute('disabled', '');
        return false;
    }
}

export { errorTypes, addErrorMessage, addErrorMessageCustom, checkInputValid, checkSearchFriendInputValid, checkTournamentInputValid, checkFormReady };

'use strict';

const errorTypes = ['valueMissing', 'patternMismatch', 'tooLong', 'tooShort', 'customError'];

const errorMessages = {
    'valueMissing': 'This field is required.',
    'patternMismatch': 'The character types used do not meet the requirement.',
    'tooLong': 'The character count is too long.',
    'tooShort': 'The character count is too short.',
    //for customError
    'passwordIsNotSame': 'password is not same.',
    'isExists': 'This username already exists.',
    //以下はfront validate弾けているはずができずにbackend validateでエラーになるパターン
    'invalidUsernameLenBackend': 'username is invalid.(len - backend)',
    'invalidUsernameCharacterTypesBackend': 'username is invalid.(character types - backend)',
    'invalidUsernameBlank': 'username is required.(required - backend)',
    'invalidPasswordLenBackend': 'password is invalid.(len - backend)',
    'invalidPasswordCharacterTypesBackend': 'password is invalid.(character types - backend)',
    'invalidPasswordBlank': 'password is required.(required - backend)',
};

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
};

export { addErrorMessage, addErrorMessageCustom, checkInputValid };

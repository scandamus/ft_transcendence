'use strict';

const listLiErrorByType = {
    valueMissing: [],
    patternMismatch: [],
    tooLong: [],
    tooShort: [],
    customError: []
};

const errorMessages = {
    'valueMissing': 'This field is required.',
    'patternMismatch': 'The character types used do not meet the requirement.',
    'tooLong': 'The character count is too long.',
    'tooShort': 'The character count is too short.',
    //for customError
    'passwordIsNotSame': 'password is not same.',
    'isExists': 'This username already exists.',
    'invalidUsernameLenBackend': 'username is invalid.(len - backend)',
    'invalidUsernameCharacterTypesBackend': 'username is invalid.(character types - backend)',
    'invalidPasswordLenBackend': 'password is invalid.(len - backend)',
    'invalidPasswordCharacterTypesBackend': 'password is invalid.(character types - backend)',
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
    const listLiError = errWrapper.querySelectorAll('li[data-error-type]');
    listLiError.forEach((li) => {
        const errorType = li.getAttribute('data-error-type');
        if (listLiErrorByType.hasOwnProperty(errorType)) {
            listLiErrorByType[errorType].push(li);
        }
    });

    //validate OK
    const validityState = elInput.validity;
    if (validityState.valid) {
        listLiError.forEach((li) => {
            li.remove();
        });
        for (const key in listLiErrorByType) {
            listLiErrorByType[key] = [];
        }
        return true;
    }

    //invalid。error表示してreturn false
    for (const errorType in listLiErrorByType) {
        const errorList = listLiErrorByType[errorType];
        //customErrorの場合はdata-error-customが重複しないかで判定
        if (errorType === 'customError') {
            const errorKey = elInput.validationMessage;
            if (validityState[errorType]) {//該当errorType
                const isDisplayed = errorList.some((li) => {
                    return li.getAttribute('data-error-custom') === errorKey;
                });
                if (!isDisplayed) {
                    addErrorMessageCustom(errWrapper, errorKey);
                }
            } else if (errorList.length > 0) {//該当errorTypeが修正された(かもしれない)
                errorList.forEach((li) => {
                    li.remove();
                });
            }
        }  else { //not customError data-error-typeが重複しないかで判定
            if (validityState[errorType]) {//該当errorType
                if (errorList.length === 0) {
                    addErrorMessage(errWrapper, errorType);
                }
            } else if (errorList.length > 0) {//該当errorTypeが修正された
                errorList.forEach((li) => {
                    li.remove();
                });
            }
        }
    }
    return false;
};

export { addErrorMessage, addErrorMessageCustom, checkInputValid };

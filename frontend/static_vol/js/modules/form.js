'use strict';

const errorMessages = {
    'valueMissing': 'This field is required.',
    'isExists': 'This username already exists.',
    'patternMismatch': 'The character types used do not meet the requirement.',
    'tooShortOrTooLong': 'The character count does not meet the requirement.',
    'passwordIsNotSame': 'password is not same.',
    'invalidUsernameLenBackend': 'username is invalid.(len - backend)',
    'invalidUsernameCharacterTypesBackend': 'username is invalid.(character types - backend)',
    'invalidPasswordLenBackend': 'password is invalid.(len - backend)',
    'invalidPasswordCharacterTypesBackend': 'password is invalid.(character types - backend)',
};

const addErrorMessage = (errWrapper, errorType, isCustomError) => {
    const elError = document.createElement('li');
    elError.textContent = errorMessages[errorType];
    if (isCustomError) {
        elError.setAttribute('data-error-type', 'customError');
    } else {
        elError.setAttribute('data-error-type', errorType);
    }
    errWrapper.appendChild(elError);
}

const checkInputValid = (elInput) => {
    const errWrapper = elInput.parentNode.querySelector('.listError');
    const liValueMissing = errWrapper.querySelector('li[data-error-type="valueMissing"]');
    const liPatternMismatch = errWrapper.querySelector('li[data-error-type="patternMismatch"]');
    const liTooShortOrTooLong = errWrapper.querySelector('li[data-error-type="tooShortOrTooLong"]');
    const liCustomError = errWrapper.querySelector('li[data-error-type="customError"]');
    const validityState = elInput.validity;
    if (validityState.valid) {
        if (liValueMissing) {
            liValueMissing.remove();
        }
        if (liPatternMismatch) {
            liPatternMismatch.remove();
        }
        if (liTooShortOrTooLong) {
            liTooShortOrTooLong.remove();
        }
        if (liCustomError) {
            liCustomError.remove();
        }
        return true;
    }
    //これ以降はinvalid。error表示してreturn false
    // requiredが未入力
    if (validityState.valueMissing) {
        if (!liValueMissing) {
            addErrorMessage(errWrapper, 'valueMissing', false);
        }
    } else if (liValueMissing) {
        liValueMissing.remove();
    }
    // patternを満たさない
    if (validityState.patternMismatch) {
        if (!liPatternMismatch) {
            addErrorMessage(errWrapper, 'patternMismatch', false);
        }
    } else if (liPatternMismatch) {
        liPatternMismatch.remove();
    }
    // 文字数が規定に反する
    if (validityState.tooShort || validityState.tooLong) {
        if (!liTooShortOrTooLong) {
            addErrorMessage(errWrapper, 'tooShortOrTooLong', false);
        }
    } else if (liTooShortOrTooLong) {
        liTooShortOrTooLong.remove();
    }
    // customError
    if (validityState.customError) {
        if (!liCustomError) {
            addErrorMessage(errWrapper, elInput.validationMessage, true);
        }
    } else if (liCustomError) {
        liCustomError.remove();
    }
    // todo: min, max, step, typeは設定箇所が無いためチェックなし
    return false;
};

export { addErrorMessage, checkInputValid };

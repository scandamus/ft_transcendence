'use strict';

const errorMessages = {
    'valueMissing': 'This field is required.',
    'patternMismatch': 'The character types used do not meet the requirement.',
    'tooShortOrTooLong': 'The character count does not meet the requirement.'
};

const addErrorMessage = (errWrapper, errorType) => {
    const elError = document.createElement('li');
    elError.textContent = errorMessages[errorType];
    elError.setAttribute('data-error-type', errorType);
    errWrapper.appendChild(elError);
}

const checkInputValid = (elInput) => {
    const errWrapper = elInput.parentNode.querySelector('.listError');
    const liValueMissing = errWrapper.querySelector('li[data-error-type="valueMissing"]');
    const liPatternMismatch = errWrapper.querySelector('li[data-error-type="patternMismatch"]');
    const liTooShortOrTooLong = errWrapper.querySelector('li[data-error-type="tooShortOrTooLong"]');
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
        return true;
    }
    //これ以降はinvalid。error表示してreturn false
    // requiredが未入力
    if (validityState.valueMissing) {
        if (!liValueMissing) {
            addErrorMessage(errWrapper, 'valueMissing');
        }
    } else if (liValueMissing) {
        liValueMissing.remove();
    }
    // patternを満たさない
    if (validityState.patternMismatch) {
        if (!liPatternMismatch) {
            addErrorMessage(errWrapper, 'patternMismatch');
        }
    } else if (liPatternMismatch) {
        liPatternMismatch.remove();
    }
    // 文字数が規定に反する
    if (validityState.tooShort || validityState.tooLong) {
        if (!liTooShortOrTooLong) {
            addErrorMessage(errWrapper, 'tooShortOrTooLong');
        }
    } else if (liTooShortOrTooLong) {
        liTooShortOrTooLong.remove();
    }
    // todo: min, max, step, typeは設定箇所が無いためチェックなし
    return false;
};

export { checkInputValid };

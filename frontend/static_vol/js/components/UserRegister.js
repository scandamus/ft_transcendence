'use strict';

import PageBase from './PageBase.js';
import { router, routes } from '../modules/router.js';
import { addErrorMessage, addErrorMessageCustom, checkInputValid } from '../modules/form.js';

export default class extends PageBase {
    constructor(params) {
        super(params);
        this.setTitle('UserRegister');
        this.labelButton = '確認する'; // TODO json
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.listenConfirm.bind(this));
        this.addAfterRenderHandler(this.restoreInputForm.bind(this));
    }

    async renderHtml() {
        return `
            <form id="formUserRegister" class="formUserRegister blockForm" action="" method="post">
                <dl class="unitFormInput">
                    <dt class="unitFormInput_label"><label for="registUsername">username</label></dt>
                    <dd class="unitFormInput_input">
                        <input type="text" id="registUsername" placeholder="Enter username" pattern="^(?=.*[a-zA-Z0-9])[\\w_]+$" minlength="3" maxlength="32" required />
                        <ul class="listError"></ul>
                    </dd>
                </dl>
                <dl class="unitFormInput">
                    <dt class="unitFormInput_label"><label for="registPassword">password</label></dt>
                    <dd class="unitFormInput_input">
                        <input type="password" id="registPassword" placeholder="Enter password"
                            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@_#$%&!.,+*~'])[\\w@_#$%&!.,+*~']+$" minlength="8" maxlength="24" required />
                        <ul class="listError"></ul>
                    </dd>
                </dl>
                <dl class="unitFormInput">
                    <dt class="unitFormInput_label"><label for="registPasswordConfirm">password(confirm)</label></dt>
                    <dd class="unitFormInput_input">
                        <input type="password" id="registPasswordConfirm" placeholder="Enter password(confirm)"
                            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@_#$%&!.,+*~'])[\\w@_#$%&!.,+*~']+$" minlength="8" maxlength="24" required />
                        <ul class="listError"></ul>
                    </dd>
                </dl>
                <button type="submit" id="btnConfirmForm" class="formUserRegister_button unitButton" disabled>${this.labelButton}</button>
            </form>
        `;
    }

    listenConfirm() {
        const btnConfirm = document.getElementById('btnConfirmForm');
        btnConfirm.addEventListener('click', this.handleConfirm.bind(this));
        this.addListenEvent(btnConfirm, this.handleConfirm, 'click');

        const elUsername = document.getElementById('registUsername');
        elUsername.addEventListener('blur', this.handleInput.bind(this));
        this.addListenEvent(elUsername, this.handleInput, 'blur');

        const elPassword = document.getElementById('registPassword');
        elPassword.addEventListener('blur', this.handleInput.bind(this));
        this.addListenEvent(elPassword, this.handleInput, 'blur');

        const elPasswordConfirm = document.getElementById('registPasswordConfirm');
        elPasswordConfirm.addEventListener('blur', this.handleInput.bind(this));
        this.addListenEvent(elPasswordConfirm, this.handleInput, 'blur');
    }

    checkFormReady() {
        const formRegister = document.querySelector('form');
        const btnConfirm = document.getElementById('btnConfirmForm');
        if (formRegister.checkValidity()) {
            if (btnConfirm.hasAttribute('disabled')) {
                btnConfirm.removeAttribute('disabled');
            }
        } else if (!btnConfirm.hasAttribute('disabled')) {
            btnConfirm.setAttribute('disabled', '');
        }
    }

    handleInput(ev) {
        const elInput = ev.target;
        const elPassword = document.getElementById('registPassword');
        const elPasswordConfirm = document.getElementById('registPasswordConfirm');
        //初回入力時、invalid styleが当たるようにclass付与
        const classHasInput = 'has-input';
        if (!elInput.classList.contains(classHasInput)) {
            elInput.classList.add(classHasInput);
        }
        //customError
        //password(確認)の値が等しいか
        if ((elInput === elPassword || elInput === elPasswordConfirm)
            && elPassword.classList.contains(classHasInput)
            && elPasswordConfirm.classList.contains(classHasInput)) {
            if (elPassword.value !== elPasswordConfirm.value) {
                elPassword.setCustomValidity('passwordIsNotSame');
                elPasswordConfirm.setCustomValidity('passwordIsNotSame');
            } else {
                elPassword.setCustomValidity('');
                elPasswordConfirm.setCustomValidity('');
            }
        }
        //formの各input validate
        checkInputValid(elInput);
        //ボタンenabled切り替え(ok=>ngもありうる)
        this.checkFormReady();
    }

    handleConfirm(ev) {
        ev.preventDefault();
        const elUsername = document.getElementById('registUsername');
        const elPassword = document.getElementById('registPassword');
        const btnConfirm = document.getElementById('btnConfirmForm');

        const data = {
            username: elUsername.value,
            password: elPassword.value
        };

        fetch('https://localhost/api/players/validate/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then( async (response) => {
                if (!response.ok) {
                    const responseBody = await response.text();
                    throw new Error(responseBody);
                 }
                return response.json();
            })
            .then( async () => {
                //確認画面用にsessionStorageに保存。送信時削除
                sessionStorage.setItem('username', data.username);
                sessionStorage.setItem('password', data.password);
                history.pushState(null, null, '/register/confirm');
                await router(false);
            })
            .catch((error) => {
                this.handleBackendValidationError(error, btnConfirm, elUsername, elPassword);
            });
    }

    handleBackendValidationError(error, btnConfirm, elUsername, elPassword) {
        let tmpValueUsername,  tmpValuePassword;
        const errorObject = JSON.parse(error.message);
        btnConfirm.setAttribute('disabled', '');
        Object.keys(errorObject).forEach((key) => {
            let elInput = (key === 'username') ? elUsername : elPassword;
            let errWrapper = elInput.parentNode.querySelector('.listError');
            errorObject[key].forEach((value) => {
                elInput.setCustomValidity(value);
                addErrorMessageCustom(errWrapper, value);
            });
            // 値が更新されたらエラー表示削除（都度backendでvalidateできないので仮で修正されたとみなす）
            elInput.addEventListener('focus', () => {
                if (key === 'username') {
                    tmpValueUsername = elInput.value;
                } else if (key === 'password') {
                    tmpValuePassword = elInput.value;
                }
            });
            elInput.addEventListener('blur', () => {
                const tmpValue = (key === 'username') ? tmpValueUsername : tmpValuePassword;
                if (tmpValue !== elInput.value) {
                    const listLiCustomError = errWrapper.querySelectorAll('li[data-error-type="customError"]');
                    listLiCustomError.forEach((li) => {
                        li.remove();
                    });
                    elInput.setCustomValidity('');
                    this.checkFormReady();
                }
            });
        });
    }

    restoreInputForm() {
        const elUsername = document.getElementById('registUsername');
        const tmpValueUsername = sessionStorage.getItem('username');
        if (tmpValueUsername) {
            elUsername.value = sessionStorage.getItem('username');
        }
    }
}

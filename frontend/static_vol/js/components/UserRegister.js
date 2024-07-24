'use strict';

import PageBase from './PageBase.js';
import { router } from '../modules/router.js';
import { addErrorMessageCustom, checkInputValid, checkFormReady } from '../modules/form.js';
import { labels } from '../modules/labels.js';

export default class SignUp extends PageBase {
    static instance = null;

    constructor(params) {
        if (SignUp.instance) {
            return SignUp.instance;
        }
        super(params);
        SignUp.instance = this;
        this.title = 'SIGN UP';
        this.setTitle(this.title);
        this.clearBreadcrumb();

        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.listenConfirm.bind(this));
        this.addAfterRenderHandler(this.restoreInputForm.bind(this));
    }

    async renderHtml() {
        let listDescUsername = '';
        for (let i = 0; i < labels.register.descUsername.length; i++) {
            listDescUsername += `<li>${labels.register.descUsername[i]}</li>`;
        }
        let listDescPassword = '';
        for (let i = 0; i < labels.register.descPassword.length; i++) {
            listDescPassword += `<li>${labels.register.descPassword[i]}</li>`;
        }
        return `
            <form id="formUserRegister" class="formUserRegister blockForm" action="" method="post">
                <dl class="unitFormInput">
                    <dt class="unitFormInput_label"><label for="registerUsername">${labels.register.labelUsername}</label></dt>
                    <dd class="unitFormInput_input">
                        <input type="text" id="registerUsername" title="${labels.register.descUsername}" placeholder="Enter username" pattern="(?=.*[a-z0-9])[a-z0-9_]+" minlength="3" maxlength="32" aria-describedby="annotationRegisterUsername errorRegisterUsername" required aria-required="true" />
                        <ul id="errorRegisterUsername" class="listError"></ul>
                        <ul id="annotationRegisterUsername" class="listAnnotation">${listDescUsername}</ul>
                    </dd>
                </dl>
                <dl class="unitFormInput">
                    <dt class="unitFormInput_label"><label for="registerPassword">${labels.register.labelPassword}</label></dt>
                    <dd class="unitFormInput_input">
                        <input type="password" id="registerPassword" title="${labels.register.descPassword}" placeholder="Enter password"
                            pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@_#$%&!.,+*~'])[\\w@_#$%&!.,+*~']+" minlength="8" maxlength="24" aria-describedby="annotationRegisterPassword errorRegisterPassword" required aria-required="true" />
                        <ul id="errorRegisterPassword" class="listError"></ul>
                        <ul id="annotationRegisterPassword" class="listAnnotation">${listDescPassword}</ul>
                    </dd>
                </dl>
                <dl class="unitFormInput">
                    <dt class="unitFormInput_label"><label for="registerPasswordConfirm">${labels.register.labelPasswordConfirm}</label></dt>
                    <dd class="unitFormInput_input">
                        <input type="password" id="registerPasswordConfirm" title="${labels.register.descPasswordConfirm}" placeholder="Enter password(confirm)"
                            pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@_#$%&!.,+*~'])[\\w@_#$%&!.,+*~']+" minlength="8" maxlength="24" aria-describedby="annotationRegisterPasswordConfirm errorRegisterPasswordConfirm" required aria-required="true" />
                        <ul id="errorRegisterPasswordConfirm" class="listError"></ul>
                        <ul id="annotationRegisterPasswordConfirm" class="listAnnotation"><li>${labels.register.descPasswordConfirm}</li></ul>
                    </dd>
                </dl>
                <button type="submit" id="btnConfirmForm" class="formUserRegister_button unitButton" disabled>${labels.register.labelButtonConfirm}</button>
                <p class="ParaAnnotation">${labels.common.btnEnable}</p>
            </form>
        `;
    }

    listenConfirm() {
        const btnConfirm = document.getElementById('btnConfirmForm');
        const boundHandleConfirm = this.handleConfirm.bind(this);
        this.addListListenInInstance(btnConfirm, boundHandleConfirm, 'click');

        const elUsername = document.getElementById('registerUsername');
        const elPassword = document.getElementById('registerPassword');
        const elPasswordConfirm = document.getElementById('registerPasswordConfirm');
        const boundHandleInput = this.handleInput.bind(this);
        this.addListListenInInstance(elUsername, boundHandleInput, 'blur');
        this.addListListenInInstance(elPassword, boundHandleInput, 'blur');
        this.addListListenInInstance(elPasswordConfirm, boundHandleInput, 'blur');
    }

    handleInput(ev) {
        const elForm = ev.target.closest('form');
        const btnConfirm = document.getElementById('btnConfirmForm');
        const elInput = ev.target;
        const elPassword = document.getElementById('registerPassword');
        const elPasswordConfirm = document.getElementById('registerPasswordConfirm');
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
        checkFormReady(elForm, btnConfirm);
    }

    handleConfirm(ev) {
        ev.preventDefault();
        const elForm = ev.target.closest('form');
        const elUsername = document.getElementById('registerUsername');
        const elPassword = document.getElementById('registerPassword');
        const btnConfirm = document.getElementById('btnConfirmForm');
        if (!checkFormReady(elForm, btnConfirm)) {
            return ;
        }

        const data = {
            username: elUsername.value,
            password: elPassword.value
        };

        fetch('/api/players/validate/', {
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
                this.handleBackendValidationError(error.message, btnConfirm, elUsername, elPassword);
            });
    }

    handleBackendValidationError(error, btnConfirm, elUsername, elPassword) {
        const formRegister = document.querySelector('form');
        let tmpValueUsername,  tmpValuePassword;
        const errorObject = JSON.parse(error);
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
                    checkFormReady(formRegister, btnConfirm);
                }
            });
        });
    }

    restoreInputForm() {
        const elUsername = document.getElementById('registerUsername');
        const tmpValueUsername = sessionStorage.getItem('username');
        const tmpValueIsConfirm = sessionStorage.getItem('isConfirm');
        const isExistUsername = sessionStorage.getItem('isExist');
        if (tmpValueUsername) {
            elUsername.value = sessionStorage.getItem('username');
        }
        //confirmからのhistory.back();ならisConfirmを削除
        if (tmpValueIsConfirm) {
            sessionStorage.removeItem('isConfirm');
        }
        if (isExistUsername) {
            const elPassword = document.getElementById('registerPassword');
            const btnConfirm = document.getElementById('btnConfirmForm');
            this.handleBackendValidationError(sessionStorage.getItem('errorMessage'), btnConfirm, elUsername, elPassword);
            sessionStorage.removeItem('isExist');
            sessionStorage.removeItem('errorMessage');
        }
    }

    destroy() {
        SignUp.instance = null;
        super.destroy();
    }
}

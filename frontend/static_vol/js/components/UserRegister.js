'use strict';

import PageBase from './PageBase.js';
import { router } from '../modules/router.js';

export default class extends PageBase {
    constructor(params) {
        super(params);
        this.setTitle('UserRegister');
        this.labelButton = '確認する'; // TODO json
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.watchForms.bind(this));
        this.addAfterRenderHandler(this.listenConfirm.bind(this));
    }

    async renderHtml() {
        return `
            <form class="formUserRegister blockForm" action="" method="post">
                <dl class="unitFormInput">
                    <dt class="unitFormInput_label"><label for="registUsername">username</label></dt>
                    <dd class="unitFormInput_input"><input type="text" id="registUsername" placeholder="Enter username" pattern="^(?!.*?[-_][-_])[a-zA-Z0-9](?:[-_]?[a-zA-Z0-9])[a-zA-Z0-9]$" minlength="3" maxlength="30" required /></dd>
                </dl>
                <dl class="unitFormInput">
                    <dt class="unitFormInput_label"><label for="registPassword">password</label></dt>
                    <dd class="unitFormInput_input"><input type="password" id="registPassword" placeholder="Enter password" pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$" required /></dd>
                </dl>
                <dl class="unitFormInput">
                    <dt class="unitFormInput_label"><label for="registPasswordConfirm">password(confirm)</label></dt>
                    <dd class="unitFormInput_input"><input type="password" id="registPasswordConfirm" placeholder="Enter password(confirm)" pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$" required /></dd>
                </dl>
                <button type="submit" id="btnConfirmForm" class="formUserRegister_button unitButton">${this.labelButton}</button>
            </form>
        `;
    }

    watchValidateForm(inputField) {
        const classHasInput = 'has-input';
        const addHasInput = () => {
            inputField.classList.add(classHasInput);
            inputField.removeEventListener('blur', addHasInput);
        };

        if (!inputField.classList.contains(classHasInput)) {
            inputField.addEventListener('blur', addHasInput);
        }
    }

    watchForms() {
        const elUsername = document.getElementById('registUsername');
        const elPassword = document.getElementById('registPassword');
        const elPasswordConfirm = document.getElementById('registPasswordConfirm');
        this.watchValidateForm(elUsername);
        this.watchValidateForm(elPassword);
        this.watchValidateForm(elPasswordConfirm);
    }

    listenConfirm() {
        const btnConfirm = document.getElementById('btnConfirmForm');
        btnConfirm.addEventListener('click', this.handleConfirm.bind(this));
        this.addListenEvent(btnConfirm, this.handleConfirm, 'click');
    }

    handleConfirm(ev) {
        ev.preventDefault();
        const elUsername = document.getElementById('registUsername');
        const elPassword = document.getElementById('registPassword');
        const elPasswordConfirm = document.getElementById('registPasswordConfirm');
        let numError = 0;
        if (elUsername.validity.patternMismatch) {
            console.error('username is invalid.');
            numError++;
        }
        if (elPassword.validity.patternMismatch) {
            console.error('password is invalid.');
            numError++;
        }
        if (elPassword.value !== elPasswordConfirm.value) {
            console.error('The passwords you entered are not the same.');
            numError++;
        }
        if (numError) {
            return ;
        }

        const data = {
            username: elUsername.value,
            password: elPassword.value
        };

        fetch('http://localhost:8001/api/players/validate/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('confirm failed with status: ' + response.status);
                }
                return response.json();
            })
            .then( async () => {
                sessionStorage.setItem('username', data.username);
                sessionStorage.setItem('password', data.password);
                history.pushState(null, null, '/register/confirm');
                await router(false);
            })
            .catch(error => {
                console.error('confirm failed:', error);
            });
    }
}

'use strict';

import PageBase from './PageBase.js';

export default class extends PageBase {
    constructor(params) {
        super(params);
        this.setTitle('UserRegister');
        this.labelButton = '確認する'; // TODO json
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.watchValidateForm.bind(this));
        this.addAfterRenderHandler(this.listenRegister.bind(this));
    }

    async renderHtml() {
        return `
            <form class="formUserRegister blockForm" action="" method="post">
                <dl class="unitFormInput">
                    <dt class="unitFormInput_label"><label for="registUsername">name</label></dt>
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
                <button type="submit" id="btnRegisterForm" class="formUserRegister_button unitButton">${this.labelButton}</button>
            </form>
        `;
    }

    watchValidateForm() {
        //focus外れたらvalidチェック
        //passは両方入力履歴あれば一致チェック
    }

    listenRegister() {
        const btnRegister = document.getElementById('btnRegisterForm');
        btnRegister.addEventListener('click', this.handleRegister.bind(this));
        this.addListenEvent(btnRegister, this.handleRegister, 'click');
    }

    handleRegister(ev) {
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
                    throw new Error('register failed with status: ' + response.status);
                }
                return response.json();
            })
            .then(() => {
                sessionStorage.setItem('username', data.username);
                sessionStorage.setItem('password', data.password);
                window.history.pushState({}, '', '/register/confirm');//todo:router
            })
            .catch(error => {
                console.error('register failed:', error);
            });
    }
}

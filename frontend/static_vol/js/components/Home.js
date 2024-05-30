'use strict';

import PageBase from './PageBase.js';
import { getUserInfo, switchDisplayAccount } from '../modules/auth.js';
import { router } from '../modules/router.js';

export default class extends PageBase {
    constructor(params) {
        super(params);
        this.setTitle('LOGIN');
        this.labelButtonLogin = 'LOGIN'; // TODO json
        this.txtSignUp = 'Don\'t have an account?'; // TODO json
        this.labelLinkSignUp = 'SIGN UP'; // TODO json
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.listenLogin.bind(this));
    }

    async renderHtml() {
        return `
            <form action="" method="post" class="blockForm blockForm-home">
                <dl class="blockForm_el">
                    <dt>username</dt>
                    <dd><input type="text" id="loginUsername" placeholder="Enter username"></dd>
                </dl>
                <dl class="blockForm_el">
                    <dt>password</dt>
                    <dd><input type="password" id="loginPassword" placeholder="Enter password"></dd>
                </dl>
                <p class="blockForm_button"><button type="submit" id="btnLoginForm" class="unitButton unitButton-large">${this.labelButtonLogin}</button></p>
            </form>
            <hr />
            <dl class="blockSignUp">
                <dt class="blockSignUp_txt">${this.txtSignUp}</dt>
                <dd class="blockSignUp_link"><a href="/register" class="unitButton" data-link>${this.labelLinkSignUp}</a></dd>
            </dl>
        `;
    }

    listenLogin() {
        const btnLogin = document.getElementById('btnLoginForm');
        btnLogin.addEventListener('click', this.handleLogin.bind(this));
        this.addListenEvent(btnLogin, this.handleLogin, 'click');
    }

    handleLogin(ev) {
        ev.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        const data = {
            username: username,
            password: password
        };

        fetch('https://localhost/api/players/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Login failed with status: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                localStorage.setItem('accessToken', data.access_token);
                localStorage.setItem('refreshToken', data.refresh_token);
                return getUserInfo();
            })
            .then((userData) => {
                switchDisplayAccount(userData);//not return
                router(true);
            })
            .catch(error => {
                console.error('Login failed:', error);
            });
    }
}

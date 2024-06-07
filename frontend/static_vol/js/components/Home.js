'use strict';

import PageBase from './PageBase.js';
import { getUserInfo, switchDisplayAccount } from '../modules/auth.js';
import { router } from '../modules/router.js';
import { webSocketManager } from '../modules/websocket.js';
import { pongHandler } from '../modules/WebsocketHandler.js';
//import { openWebSocket } from '../modules/websocket.js';

export default class extends PageBase {
    constructor(params) {
        super(params);
        this.setTitle('LOGIN');
        this.labelButtonLogin = 'LOGIN'; // TODO json
        this.txtSignUp = 'Don\'t have an account?'; // TODO json
        this.labelLinkSignUp = 'SIGN UP'; // TODO json
        this.textLoginError1 = 'Login failed. Please check your username and password.'; // TODO json
        this.textLoginError2 = 'Something went wrong. Unable to log in.';
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.listenLogin.bind(this));
    }

    async renderHtml() {
        return `
            <form id="formLogin" class="blockForm blockForm-home" action="" method="post">
                <dl class="blockForm_el">
                    <dt>username</dt>
                    <dd><input type="text" id="loginUsername" placeholder="Enter username" pattern="(?=.*[a-z0-9])[a-z0-9_]+" minlength="3" maxlength="32" required /></dd>
                </dl>
                <dl class="blockForm_el">
                    <dt>password</dt>
                    <dd><input type="password" id="loginPassword" placeholder="Enter password" pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@_#$%&!.,+*~'])[\\w@_#$%&!.,+*~']+" minlength="8" maxlength="24" required /></dd>
                </dl>
                <ul class="blockForm_el listError"></ul>
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
        const formLogin = document.getElementById('formLogin');
        if (!formLogin.checkValidity()) {
            this.handleValidationError(this.textLoginError1);
            return;
        }

        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        const data = {
            username: username,
            password: password
        };
        console.log('Sending data :', data);
        fetch('https://localhost/api/players/login/', {
                method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                console.log('Response status: ', response.status);
                if (!response.ok) {
                    if (response.status === 403) {
                        throw new Error(this.textLoginError1);
                    }
                    throw new Error(this.textLoginError2);
                }
                return response.json();
            })
            .then(data => {
                localStorage.setItem('accessToken', data.access_token);
                localStorage.setItem('refreshToken', data.refresh_token);
                webSocketManager.openWebSocket('lounge', pongHandler);
                return getUserInfo();
            })
            .then((userData) => {
                switchDisplayAccount(userData);//not return
                router(true);
            })
            .catch(error => {
                //console.error('Login failed:', error);
                this.handleValidationError(error);
            });
    }

    handleValidationError(error) {
        console.error('///handleValidationError:', error);
    }
}

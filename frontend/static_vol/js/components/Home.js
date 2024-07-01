'use strict';

import PageBase from './PageBase.js';
import { getUserInfo, switchDisplayAccount } from '../modules/auth.js';
import { router } from '../modules/router.js';
import { webSocketManager } from '../modules/websocket.js';
import { pongHandler } from '../modules/WebsocketHandler.js';
import { labels } from '../modules/labels.js';
import { addErrorMessage } from '../modules/form.js';
//import { openWebSocket } from '../modules/websocket.js';

export default class LogIn extends PageBase {
    constructor(params) {
        super(params);
        LogIn.instance = this;
        this.setTitle(this.title);
        this.clearBreadcrumb();

        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.listenLogin.bind(this));
    }

    async renderHtml() {
        return `
            <form id="formLogin" class="blockForm blockForm-home" action="" method="post">
                <dl class="blockForm_el">
                    <dt>${labels.home.labelUsername}</dt>
                    <dd><input type="text" id="loginUsername" placeholder="Enter username" pattern="(?=.*[a-z0-9])[a-z0-9_]+" minlength="3" maxlength="32" required /></dd>
                </dl>
                <dl class="blockForm_el">
                    <dt>${labels.home.labelPassword}</dt>
                    <dd><input type="password" id="loginPassword" placeholder="Enter password" pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@_#$%&!.,+*~'])[\\w@_#$%&!.,+*~']+" minlength="8" maxlength="24" required /></dd>
                </dl>
                <ul class="blockForm_el listError"></ul>
                <p class="blockForm_button"><button type="submit" id="btnLoginForm" class="unitButton unitButton-large">${labels.home.labelButtonLogin}</button></p>
            </form>
            <hr />
            <dl class="blockSignUp">
                <dt class="blockSignUp_txt">${labels.home.textSignUp}</dt>
                <dd class="blockSignUp_link"><a href="/register" class="unitButton" data-link>${labels.home.labelLinkSignUp}</a></dd>
            </dl>
        `;
    }

    listenLogin() {
        const btnLogin = document.getElementById('btnLoginForm');
        const boundHandleLogin = this.handleLogin.bind(this);
        this.addListListenInInstance(btnLogin, boundHandleLogin, 'click');
    }

    handleLogin(ev) {
        ev.preventDefault();
        const formLogin = document.getElementById('formLogin');
        if (!formLogin.checkValidity()) {
            this.handleValidationError('loginError1');
            return;
        }

        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        const data = {
            username: username,
            password: password
        };
        console.log('Sending data :', data);
        fetch('/api/players/login/', {
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
                        throw new Error('loginError1');
                    }
                    throw new Error('loginError2');
                }
                return response.json();
            })
            .then(data => {
                localStorage.setItem('accessToken', data.access_token);
                localStorage.setItem('refreshToken', data.refresh_token);
                webSocketManager.openWebSocket('lounge', pongHandler)
                    .then(() => {
                        //return webSocketManager.sendAccessToken('lounge');
                        return;
                    })
                    .catch((error) => {
                        console.error('WebSocket connection or token send failed', error);
                    });
                return getUserInfo();
            })
            .then((data) => {
                if (data) {
                    switchDisplayAccount()
                        .then(() => {
                            router(true).then(() => {});
                        });
                }
            })
            .catch(error => {
                this.handleValidationError('loginError2');
            });
    }

    handleValidationError(error) {
        //console.error('///handleValidationError:', error);
        const errWrapper = document.querySelector('.listError');
        addErrorMessage(errWrapper, error);
    }

    destroy() {
        super.destroy();
    }
}

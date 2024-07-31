'use strict';

import PageBase from './PageBase.js';
import { getUserInfo, switchDisplayAccount } from '../modules/auth.js';
import { router } from '../modules/router.js';
import { webSocketManager } from '../modules/websocket.js';
import { pongHandler } from '../modules/websocketHandler.js';
import { labels } from '../modules/labels.js';
import { addErrorMessage } from '../modules/form.js';
import { setLang, saveLang } from '../modules/switchLanguage.js';
//import { openWebSocket } from '../modules/websocket.js';

export default class LogIn extends PageBase {
    static instance = null;

    constructor(params) {
        if (LogIn.instance) {
            return LogIn.instance;
        }
        super(params);
        LogIn.instance = this;
        this.setTitle(this.title);
        this.clearBreadcrumb();
        this.loginInProgress = false;
        this.loginErrorType = '';

        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.listenLogin.bind(this));
        this.addAfterRenderHandler(this.listenFocus.bind(this));
        this.addAfterRenderHandler(this.listenAuthMessage.bind(this));
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
            <div class="blockLogin42">
                <p><button type="button" id="btnLogin42" class="unitButton unitButton-large">42LOGIN</button></p>
            </div>
            <hr />
            <dl class="blockSignUp">
                <dt class="blockSignUp_txt">${labels.home.textSignUp}</dt>
                <dd class="blockSignUp_link"><a href="/register" class="unitButton" data-link>${labels.home.labelLinkSignUp}</a></dd>
            </dl>
        `;
    }

    listenFocus() {
        const ids = ['loginUsername', 'loginPassword'];
        const inputFocus = ids.map(id => document.getElementById(id));
        const boundHandleFocus = this.handleFocus.bind(this);
        inputFocus.forEach((input) => {
            this.addListListenInInstance(input, boundHandleFocus, 'focus');
        });
    }

    handleFocus(ev) {
        const errWrapper = document.querySelector('.listError');
        const listError = errWrapper.querySelectorAll('li');
        listError.forEach((li) => {
            li.remove();
        });
        this.loginErrorType = '';
    }

    listenLogin() {
        const btnLogin = document.getElementById('btnLoginForm');
        const boundHandleLogin = this.handleLogin.bind(this);
        this.addListListenInInstance(btnLogin, boundHandleLogin, 'click');

        const btnLogin42 = document.getElementById('btnLogin42');
        const boundHandleLogin42 = this.handleLogin42.bind(this);
        this.addListListenInInstance(btnLogin42, boundHandleLogin42, 'click');
    }

    handleLogin(ev) {
        ev.preventDefault();
        //すでに処理中ならキャンセル
        if (this.loginInProgress) {
            return;
        }
        this.loginInProgress = true;
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
                sessionStorage.setItem('accessToken', data.access_token);
                sessionStorage.setItem('refreshToken', data.refresh_token);
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
                    const langStorage = localStorage.getItem('configLang');
                    const elSelectLang = document.getElementById('languageSelect');
                    //localStorageにconfigLangあり、かつDBと異なる場合はlocalStorage優先
                    if (langStorage && (data.lang !== langStorage)) {
                        setLang(elSelectLang, langStorage);
                        saveLang(langStorage);
                    } else {
                        setLang(elSelectLang, data.lang);
                        saveLang(data.lang);
                    }
                    switchDisplayAccount()
                        .then(() => {
                            router(true).then(() => {});
                        });
                }
            })
            .catch((error) => {
                this.handleValidationError(error.message);
            })
            .finally(() => {
                this.loginInProgress = false;
            });
    }

    handleValidationError(error) {
        if (this.loginErrorType !== error) {
            this.loginErrorType = error;
            const errWrapper = document.querySelector('.listError');
            addErrorMessage(errWrapper, error);
        }
    }

    async handleLogin42(ev) {
        ev.preventDefault();
        try {
            const response = await fetch('/api/oauth42/authorize42');
            const data = await response.json();

            const width = 600;
            const height = 700;
            const left = (window.screen.width / 2) - (width / 2);
            const top = (window.screen.height / 2) - (height / 2);
            window.open(
                data.authorize_url,
                '42AuthWindow',
                `width=${width},height=${height},top=${top},left=${left},toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=no`
            );
        } catch (error) {
            console.error('Failed to get authorize URL:', error);
        }
    }

    listenAuthMessage() {
        const boundHandleAuthMessage = this.handleAuthMessage.bind(this);
        this.addListListenInInstance(window, boundHandleAuthMessage, 'message');
    }

    async handleAuthMessage(ev) {
        if (ev.origin !== window.location.origin) {
            console.log('Message from untrusted origin:', ev.origin);
            return;
        }
        const data = ev.data;
        if (data && data.code && data.state) {
            const response = await fetch('/api/oauth42/exchange_token42/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: data.code,
                    state: data.state
                }),
            });

            if (response.ok) {
                const tokenData = await response.json();
                sessionStorage.setItem('accessToken', tokenData.access_token);
                sessionStorage.setItem('refreshToken', tokenData.refresh_token);
                await webSocketManager.openWebSocket('lounge', pongHandler);
                window.history.pushState({}, null, '/dashboard');
                const userInfo = await getUserInfo();
                if (userInfo) {
                    const langStorage = localStorage.getItem('configLang');
                    const elSelectLang = document.getElementById('languageSelect');
                    // localStorageにconfigLangあり、かつDBと異なる場合はlocalStorage優先
                    if (langStorage && (userInfo.lang !== langStorage)) {
                        setLang(elSelectLang, langStorage);
                        await saveLang(langStorage);
                    } else {
                        setLang(elSelectLang, userInfo.lang);
                        await saveLang(userInfo.lang);
                    }

                    await switchDisplayAccount();
                    await router(true);
                }
            } else {
                console.error('Failed to exchange token');
            }
        }
    }

    destroy() {
        LogIn.instance = null;
        super.destroy();
    }
}

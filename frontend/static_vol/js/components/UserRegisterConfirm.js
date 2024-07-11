'use strict';

import PageBase from './PageBase.js';
import { router, routes } from '../modules/router.js';
import { labels } from '../modules/labels.js';

export default class SignUpConfirm extends PageBase {
    static instance = null;

    constructor(params) {
        if (SignUpConfirm.instance) {
            return SignUpConfirm.instance;
        }
        super(params);
        SignUpConfirm.instance = this;
        this.title = 'SIGN UP';
        this.setTitle(this.title);
        this.clearBreadcrumb();

        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.displayInputData.bind(this));
        this.addAfterRenderHandler(this.listenLinkBack.bind(this));
        this.addAfterRenderHandler(this.listenRegister.bind(this));
    }

    async renderHtml() {
        return `
            <form class="formUserRegister blockForm" action="" method="post">
                <p>${labels.register.textConfirm}</p>
                <dl class="unitFormInput">
                    <dt class="unitFormInput_label">${labels.register.labelUsername}</label></dt>
                    <dd id="confirmUsername" class="unitFormInput_input unitFormInput_input-confirm"></dd>
                </dl>
                <dl class="unitFormInput">
                    <dt class="unitFormInput_label">${labels.register.labelPassword}</label></dt>
                    <dd class="unitFormInput_input unitFormInput_input-confirm">**********</dd>
                </dl>
                <ul class="listButton">
                    <li><button type="button" id="btnBackForm" class="formUserRegister_button unitButton">${labels.register.labelButtonBack}</button></li>
                    <li><button type="submit" id="btnRegisterForm" class="formUserRegister_button unitButton">${labels.register.labelButtonRegister}</button></li>
                </ul>
            </form>
        `;
    }

    async displayInputData() {
        const elUsername = document.getElementById('confirmUsername');
        const tmpValueUsername = sessionStorage.getItem('username');
        const tmpValuePassword = sessionStorage.getItem('password');
        //tmpValueUsernameがなければフロー外遷移。リダイレクト
        if (!tmpValueUsername || !tmpValuePassword) {
            history.pushState(null, null, routes.register.path);
            await router(false);
        } else {
            elUsername.textContent = sessionStorage.getItem('username');
        }
    }

    listenLinkBack() {
        const btnBack = document.getElementById('btnBackForm');
        const boundHandleBack = this.handleBack.bind(this);
        this.addListListenInInstance(btnBack, boundHandleBack, 'click');
    }

    handleBack() {
        sessionStorage.removeItem('password');
        history.back();
    }

    listenRegister() {
        const btnRegister = document.getElementById('btnRegisterForm');
        const boundHandleRegister = this.handleRegister.bind(this);
        this.addListListenInInstance(btnRegister, boundHandleRegister, 'click');
    }

    handleRegister(ev) {
        ev.preventDefault();

        const data = {
            username: sessionStorage.getItem('username'),
            password: sessionStorage.getItem('password')
        };

        fetch('/api/players/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(async response => {
                if (!response.ok) {
                    const responseBody = await response.text();
                    throw new Error(responseBody);
                }
                return response.json();
            })
            .then( async () => {
                sessionStorage.setItem('isConfirm', 'true');
                history.pushState(null, null, '/register/complete');
                await router(false);
            })
            .catch( async (error) => {
                const errorObject = JSON.parse(error.message);
                if (errorObject.username && errorObject.username.includes('isExists')) {
                    sessionStorage.setItem('isExist', 'true');
                    sessionStorage.setItem('errorMessage', error.message);
                    this.handleBack();
                } else {
                    console.error('register failed:', error);
                }
            });
    }

    destroy() {
        SignUpConfirm.instance = null;
        super.destroy();
    }
}

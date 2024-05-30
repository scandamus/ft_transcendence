'use strict';

import PageBase from './PageBase.js';
import { router, routes } from '../modules/router.js';

export default class extends PageBase {
    constructor(params) {
        super(params);
        this.setTitle('UserRegister - confirm');
        this.labelButtonRegister = '登録する'; // TODO json
        this.labelButtonBack = '修正する';
        this.textConfirm = '下記の内容で登録します';
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.displayInputData.bind(this));
        this.addAfterRenderHandler(this.listenLinkBack.bind(this));
        this.addAfterRenderHandler(this.listenRegister.bind(this));
    }

    async renderHtml() {
        return `
            <form class="formUserRegister blockForm" action="" method="post">
                <p>${this.textConfirm}</p>
                <dl class="unitFormInput">
                    <dt class="unitFormInput_label"><label for="">username</label></dt>
                    <dd id="confirmUsername" class="unitFormInput_input unitFormInput_input-confirm"></dd>
                </dl>
                <dl class="unitFormInput">
                    <dt class="unitFormInput_label"><label for="">password</label></dt>
                    <dd class="unitFormInput_input unitFormInput_input-confirm">**********</dd>
                </dl>
                <ul class="listButton">
                    <li><button type="button" id="btnBackForm" class="formUserRegister_button unitButton">${this.labelButtonBack}</button></li>
                    <li><button type="submit" id="btnRegisterForm" class="formUserRegister_button unitButton">${this.labelButtonRegister}</button></li>
                </ul>
            </form>
        `;
    }

    async displayInputData() {
        const elUsername = document.getElementById('confirmUsername');
        const tmpValueUsername = sessionStorage.getItem('username');
        if (!tmpValueUsername) {
            history.pushState(null, null, routes.register.path);
            await router(false);
        } else {
            elUsername.textContent = sessionStorage.getItem('username');
        }
    }

    listenLinkBack() {
        const btnBack = document.getElementById('btnBackForm');
        btnBack.addEventListener('click', this.handleBack.bind(this));
        this.addListenEvent(btnBack, this.handleBack, 'click');
    }

    handleBack() {
        history.back();
    }

    listenRegister() {
        const btnRegister = document.getElementById('btnRegisterForm');
        btnRegister.addEventListener('click', this.handleRegister.bind(this));
        this.addListenEvent(btnRegister, this.handleRegister, 'click');
    }

    handleRegister(ev) {
        ev.preventDefault();

        const data = {
            username: sessionStorage.getItem('username'),
            password: sessionStorage.getItem('password')
        };

        fetch('http://localhost:8001/api/players/regist/', {
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
            .then( async () => {
                history.pushState(null, null, '/register/complete');
                await router(false);
            })
            .catch(error => {
                console.error('register failed:', error);
            });
    }
}

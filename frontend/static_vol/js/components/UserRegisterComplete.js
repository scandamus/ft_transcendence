'use strict';

import PageBase from './PageBase.js';
import { router, routes } from '../modules/router.js';

export default class SignUpComplete extends PageBase {
    constructor(params) {
        super(params);
        SignUpComplete.instance = this;
        this.setTitle('SIGN UP');
        this.message = '登録完了しました'; // TODO json
        this.labelButtonLogin = 'LOGIN'; // TODO json
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.checkRegisterFlow.bind(this));
    }

    async renderHtml() {
        return `
            <p class="unitTextComplete unitBox">${this.message}</p>
            <p class="unitButtonWrap"><a href="/" class="unitButton unitButton-large" data-link>${this.labelButtonLogin}</a></p>
        `;
    }

    async checkRegisterFlow() {
        const tmpValueIsConfirm = sessionStorage.getItem('isConfirm');
        //tmpValueUsername or tmpValueIsConfirm がなければフロー外遷移。リダイレクト
        if (!tmpValueIsConfirm) {
            if (sessionStorage.getItem('password')) {
                sessionStorage.removeItem('password');
            }
            history.pushState(null, null, routes.register.path);
            await router(false);
        } else {
                sessionStorage.removeItem('username');
                sessionStorage.removeItem('password');
        }
    }

    destroy() {
        super.destroy();
    }
}

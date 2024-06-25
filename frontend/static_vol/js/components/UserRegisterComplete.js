'use strict';

import PageBase from './PageBase.js';
import { router, routes } from '../modules/router.js';
import { labels } from '../modules/labels.js';

export default class SignUpComplete extends PageBase {
    constructor(params) {
        super(params);
        SignUpComplete.instance = this;
        this.setTitle('SIGN UP');
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.checkRegisterFlow.bind(this));
    }

    async renderHtml() {
        return `
            <p class="unitTextComplete unitBox">${labels.register.textComplete}</p>
            <p class="unitButtonWrap"><a href="/" class="unitButton unitButton-large" data-link>${labels.register.labelButtonLogin}</a></p>
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

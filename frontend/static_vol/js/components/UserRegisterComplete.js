'use strict';

import PageBase from './PageBase.js';

export default class extends PageBase {
    constructor(params) {
        super(params);
        this.setTitle('UserRegister - complete');
        this.message = '登録完了しました'; // TODO json
        this.labelButtonLogin = 'LOGIN'; // TODO json
    }

    async renderHtml() {
        return `
            <p class="unitTextComplete unitBox">${this.message}</p>
            <p class="unitButtonWrap"><a href="/" class="unitButton unitButton-large" data-link>${this.labelButtonLogin}</a></p>
        `;
    }
}

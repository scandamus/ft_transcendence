"use strict";

import PageBase from "./PageBase.js";

export default class extends PageBase {
    constructor(params) {
        super(params);
        this.setTitle("UserRegister - complete");
        this.message = "登録完了しました";
    }

    async getHtml() {
        return `
           <p class="unitTextComplete unitBox">${this.message}</p>
        `;
    }
}
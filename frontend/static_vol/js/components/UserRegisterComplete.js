"use strict";

import PageBase from "./PageBase.js";

export default class extends PageBase {
    constructor(params) {
        super(params);
        this.setTitle("UserRegister - complete");
        this.message = "登録完了しました"; // TODO json
    }

    async renderHtml() {
        return `
           <p class="unitTextComplete unitBox">${this.message}</p>
        `;
    }
}

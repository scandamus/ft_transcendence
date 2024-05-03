"use strict";

import PageBase from "./PageBase.js";

export default class extends PageBase {
    constructor(params) {
        super(params);
        this.setTitle("LOGIN");
        this.labelButton = "サインイン with 42";
    }

    async getHtml() {
        return `
            <form action="" method="post" class="blockForm blockForm-home">
                <button type="submit" id="btnLogin" class="unitButton unitButton-large">${this.labelButton}</button>
            </form>
        `;
    }
}
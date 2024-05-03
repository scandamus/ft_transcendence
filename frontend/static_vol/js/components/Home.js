"use strict";

import PageBase from "./PageBase.js";

export default class extends PageBase {
    constructor(params) {
        super(params);
        this.setTitle("LOGIN");
        this.labelButton = "サインイン with 42";
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.listenLogin.bind(this));
    }

    async renderHtml() {
        return `
            <form action="" method="post" class="blockForm blockForm-home">
                <button type="submit" id="btnLogin" class="unitButton unitButton-large">${this.labelButton}</button>
            </form>
        `;
    }

    listenLogin() {
        const btnLogin = document.querySelector("#btnLogin");
        btnLogin.addEventListener("click", this.handleLogin.bind(this));
        this.addListenEvent(btnLogin, this.handleLogin, "click");
    }

    handleLogin(ev) {
        ev.preventDefault();
        // todo:ログイン処理
        console.log("ログインボタンがクリックされました");
    }
}
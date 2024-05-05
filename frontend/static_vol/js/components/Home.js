"use strict";

import PageBase from "./PageBase.js";

export default class extends PageBase {
    constructor(params) {
        super(params);
        this.setTitle("LOGIN");
        this.labelButtonForm = "ログイン";
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.listenLogin.bind(this));
    }

    async renderHtml() {
        return `
            <form action="" method="post" class="blockForm blockForm-home">
                <input type="text" id="loginUsername" placeholder="Enter username">
                <input type="password" id="loginPassword" placeholder="Enter password">
                <button type="submit" id="btnLoginForm" class="unitButton">${this.labelButtonForm}</button>
            </form>
        `;
    }

    listenLogin() {
        const btnLogin = document.querySelector("#btnLoginForm");
        btnLogin.addEventListener("click", this.handleLogin.bind(this));
        this.addListenEvent(btnLogin, this.handleLogin, "click");
    }

    handleLogin(ev) {
        ev.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        const data = {
            username: username,
            password: password
        };

        fetch('http://localhost:8001/api/players/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Login failed with status: ' + response.status);
            }
            console.log("Login successful");  // ここでログイン成功をログに出力
            // todo: 表示名切り替え
        })
        .catch(error => {
            console.error('Login failed:', error);
        });
    }
}
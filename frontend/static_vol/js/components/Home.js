"use strict";

import PageBase from "./PageBase.js";
import { switchDisplayAccount, checkLoginStatus } from "/js/modules/auth.js";

export default class extends PageBase {
    constructor(params) {
        super(params);
        this.setTitle("LOGIN");
        this.labelButtonLogin = "ログイン"; // TODO json
        this.labelButtonLogout = "ログアウト"; // TODO json
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.listenLogin.bind(this));
        this.addAfterRenderHandler(this.listenLogout.bind(this));
    }

    async renderHtml() {
        return `
            <form action="" method="post" class="blockForm blockForm-home">
                <input type="text" id="loginUsername" placeholder="Enter username">
                <input type="password" id="loginPassword" placeholder="Enter password">
                <button type="submit" id="btnLoginForm" class="unitButton">${this.labelButtonLogin}</button>
            </form>
            <form action="" method="post" class="blockForm blockForm-home">
                <button type="submit" id="btnLogoutForm" class="unitButton">${this.labelButtonLogout}</button>
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
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Login failed with status: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                localStorage.setItem('accessToken', data.access_token);
                localStorage.setItem('refreshToken', data.refresh_token);
                console.log("Login successful");  // ここでログイン成功をログに出力
                switchDisplayAccount();
            })
            .catch(error => {
                console.error('Login failed:', error);
            });
    }

    listenLogout() {
        const btnLogout = document.querySelector("#btnLogoutForm");
        btnLogout.addEventListener("click", this.handleLogout.bind(this));
        this.addListenEvent(btnLogout, this.handleLogout, "click");
    }

    handleLogout(ev) {
        ev.preventDefault();
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        fetch('http://localhost:8001/api/players/logout/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Refresh-Token': `${refreshToken}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Logout failed with status: ' + response.status);
                }
                console.log("Logout successful");
            })
            .catch(error => {
                console.error('Logout failed:', error);
            });
    }
}

"use strict";

import PageBase from "./PageBase.js";

export default class extends PageBase {
    constructor(params) {
        super(params);
        this.setTitle("GameMatch");
        this.labelButton = "対戦を申し込む";
    }

    async getListPlayers() {
        return fetch('http://localhost:8001/api/players/')
            .then(response => response.json())
            .then(data => {
                return data;
            })
            .catch(error => {
                console.error("Error fetching users:", error);
                throw error;
            });
    }

    async getHtml() {
        const listUsers = await this.getListPlayers();
        if (!listUsers || listUsers.length === 0) {
            return '<div>No players found.</div>';
        }
        return `
            <div class="listPlayers">
                ${listUsers.map(player => `
                <section class="unitListItem">
                    <header class="unitListItem_header">
                        <div class="unitPlayerName">
                            <h3>${player.playername}</h3>
                            <p class="thumb"><img src="//ui-avatars.com/api/?name=Aa Bb&background=e3ad03&color=ffffff" alt="" width="60" height="60"></p>
                        </div>
                        <button class="unitButton">${this.labelButton}</button>
                    </header>
                    <div class="unitListItem_content unitPlayerScore">
                        <p>RANK: 4 (20勝3敗)</p>
                        <p>過去の対戦成績: 2勝1敗</p>
                    </div>
                </section>
                `).join('')}
            </div>
        `;
    }
}
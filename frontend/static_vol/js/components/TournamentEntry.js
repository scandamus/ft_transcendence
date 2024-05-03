"use strict";

import PageBase from "./PageBase.js";

export default class extends PageBase {
    constructor(params) {
        super(params);
        this.setTitle("TournamentEntry");
        this.labelButton = "エントリー";
        this.txtDeadline = "エントリー締切";
    }

    async getHtml() {
        return `
            <div class="listTournaments">
                <section class="unitListItem">
                    <header class="unitListItem_header">
                        <div class="unitTournamentName">
                            <h3>tournament55</h3>
                            <p>2024/04/16 21:00</p>
                        </div>
                        <button class="unitButton">${this.labelButton}</button>
                    </header>
                    <div class="unitListItem_content unitTournamentInfo">
                        <p>capacity: 2 / 12</p>
                        <p>${this.txtDeadline}: 2024/04/16 18:00</p>
                    </div>
                </section>
                <section class="unitListItem">
                    <header class="unitListItem_header">
                        <div class="unitTournamentName">
                            <h3>tournament55</h3>
                            <p>2024/04/16 21:00</p>
                        </div>
                        <button class="unitButton">${this.labelButton}</button>
                    </header>
                    <div class="unitListItem_content unitTournamentInfo">
                        <p>capacity: 2 / 12</p>
                        <p>${this.txtDeadline}: 2024/04/16 18:00</p>
                    </div>
                </section>
                <section class="unitListItem">
                    <header class="unitListItem_header">
                        <div class="unitTournamentName">
                            <h3>tournament55</h3>
                            <p>2024/04/16 21:00</p>
                        </div>
                        <button class="unitButton">${this.labelButton}</button>
                    </header>
                    <div class="unitListItem_content unitTournamentInfo">
                        <p>capacity: 2 / 12</p>
                        <p>${this.txtDeadline}: 2024/04/16 18:00</p>
                    </div>
                </section>
                <section class="unitListItem">
                    <header class="unitListItem_header">
                        <div class="unitTournamentName">
                            <h3>tournament55</h3>
                            <p>2024/04/16 21:00</p>
                        </div>
                        <button class="unitButton">${this.labelButton}</button>
                    </header>
                    <div class="unitListItem_content unitTournamentInfo">
                        <p>capacity: 2 / 12</p>
                        <p>${this.txtDeadline}: 2024/04/16 18:00</p>
                    </div>
                </section>
                <section class="unitListItem">
                    <header class="unitListItem_header">
                        <div class="unitTournamentName">
                            <h3>tournament55</h3>
                            <p>2024/04/16 21:00</p>
                        </div>
                        <button class="unitButton">${this.labelButton}</button>
                    </header>
                    <div class="unitListItem_content unitTournamentInfo">
                        <p>capacity: 2 / 12</p>
                        <p>${this.txtDeadline}: 2024/04/16 18:00</p>
                    </div>
                </section>
                <section class="unitListItem">
                    <header class="unitListItem_header">
                        <div class="unitTournamentName">
                            <h3>tournament55</h3>
                            <p>2024/04/16 21:00</p>
                        </div>
                        <button class="unitButton">${this.labelButton}</button>
                    </header>
                    <div class="unitListItem_content unitTournamentInfo">
                        <p>capacity: 2 / 12</p>
                        <p>${this.txtDeadline}: 2024/04/16 18:00</p>
                    </div>
                </section>
                <section class="unitListItem">
                    <header class="unitListItem_header">
                        <div class="unitTournamentName">
                            <h3>tournament55</h3>
                            <p>2024/04/16 21:00</p>
                        </div>
                        <button class="unitButton">${this.labelButton}</button>
                    </header>
                    <div class="unitListItem_content unitTournamentInfo">
                        <p>capacity: 2 / 12</p>
                        <p>${this.txtDeadline}: 2024/04/16 18:00</p>
                    </div>
                </section>
                <section class="unitListItem">
                    <header class="unitListItem_header">
                        <div class="unitTournamentName">
                            <h3>tournament55</h3>
                            <p>2024/04/16 21:00</p>
                        </div>
                        <button class="unitButton">${this.labelButton}</button>
                    </header>
                    <div class="unitListItem_content unitTournamentInfo">
                        <p>capacity: 2 / 12</p>
                        <p>${this.txtDeadline}: 2024/04/16 18:00</p>
                    </div>
                </section>
                <section class="unitListItem">
                    <header class="unitListItem_header">
                        <div class="unitTournamentName">
                            <h3>tournament55</h3>
                            <p>2024/04/16 21:00</p>
                        </div>
                        <button class="unitButton">${this.labelButton}</button>
                    </header>
                    <div class="unitListItem_content unitTournamentInfo">
                        <p>capacity: 2 / 12</p>
                        <p>${this.txtDeadline}: 2024/04/16 18:00</p>
                    </div>
                </section>
                <section class="unitListItem">
                    <header class="unitListItem_header">
                        <div class="unitTournamentName">
                            <h3>tournament55</h3>
                            <p>2024/04/16 21:00</p>
                        </div>
                        <button class="unitButton">${this.labelButton}</button>
                    </header>
                    <div class="unitListItem_content unitTournamentInfo">
                        <p>capacity: 2 / 12</p>
                        <p>${this.txtDeadline}: 2024/04/16 18:00</p>
                    </div>
                </section>
            </div>
        `;
    }
}
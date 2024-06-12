'use strict';

import PageBase from './PageBase.js';

export default class extends PageBase {
    constructor(params) {
        super(params);
        this.setTitle('Tournament');
        this.labelCreateTournament = 'Create Tournament'; // TODO json
        this.labelTournamentTitle = 'Tournament Title';
        this.labelStart = 'Start Time';
        this.labelEntry = 'Entry';
        this.labelCancelEntry = 'Cancel';
        this.labelTitleUpcoming = 'Upcoming';
        this.labelTitleInPlay = 'InPlay';
        this.labelTitleRecent = 'Recent';
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.listenCreateTournament.bind(this));
    }

    async renderHtml() {
        return `
            <div class="wrapTournament">
                <form id="formCreateTournament" class="formCreateTournament blockForm unitBox" action="" method="post">
                    <dl class="blockForm_el formCreateTournament_elInput formCreateTournament_elInput-title">
                        <dt>${this.labelTournamentTitle}</dt>
                        <dd><input type="text" id="inputTournamentTitle" placeholder="Enter Tournament Title" pattern="(?=.*[a-z0-9])[a-z0-9_]+" minlength="3" maxlength="32" required /></dd>
                    </dl>
                    <dl class="blockForm_el formCreateTournament_elInput formCreateTournament_elInput-start">
                        <dt>${this.labelStart}</dt>
                        <dd>
                            <input
                              type="datetime-local"
                              id="startTime"
                              name="startTime"
                              value="2024-07-01T21:00"
                              min="2024-07-01T21:00"
                              max="2024-08-01T21:00" />
                        </dd>
                    </dl>
                    <p class="formCreateTournament_button blockForm_button"><button type="submit" id="btnCreateTournament" class="unitButton">${this.labelCreateTournament}</button></p>
                </form>
                <section class="blockTournamentList">
                    <h3 class="blockTournamentList_title unitTitle1">${this.labelTitleUpcoming}</h3>
                    <div class="blockTournamentList_list listLineDivide">
                        <section class="unitTournament">
                            <header class="unitTournament_header">
                                <h4 class="unitTournament_title">TournamentTitle1</h4>
                                <p class="unitTournament_start">2024/07/3 13:00</p>
                            </header>
                            <p class="unitTournament_nickname">(as 01234567890123456789012345678901)</p>
                            <form class="unitTournament_form">
                                <input type="hidden" name="title" value="TournamentTitle">
                                <input type="hidden" name="date" value="2024/05/3 13:00">
                                <input type="hidden" name="nickname" value="nickname6">
                                <p class="blockForm_button"><button type="submit" class="unitButtonDecline">${this.labelCancelEntry}</button></p>
                            </form>
                        </section>
                        <section class="unitTournament">
                            <header class="unitTournament_header">
                                <h4 class="unitTournament_title">TournamentTitle1</h4>
                                <p class="unitTournament_start">2024/07/3 13:00</p>
                            </header>
                            <p class="unitTournament_nickname">(as 012)</p>
                            <form class="unitTournament_form">
                                <input type="hidden" name="title" value="TournamentTitle">
                                <input type="hidden" name="date" value="2024/05/3 13:00">
                                <input type="hidden" name="nickname" value="nickname6">
                                <p class="blockForm_button"><button type="submit" class="unitButtonDecline">${this.labelCancelEntry}</button></p>
                            </form>
                        </section>
                        <section class="unitTournament">
                            <header class="unitTournament_header">
                                <h4 class="unitTournament_title">TournamentTitle2</h4>
                                <p class="unitTournament_start">2024/07/5 21:00</p>
                            </header>
                            <form class="unitTournament_form">
                                <input type="hidden" name="title" value="TournamentTitle2">
                                <input type="hidden" name="date" value="2024/07/5 21:00">
                                <p class="blockForm_button"><button type="submit" class="unitButton">${this.labelEntry}</button></p>
                            </form>
                        </section>
                    </div>
                </section>
                <section class="blockTournamentList">
                    <h3 class="blockTournamentList_title unitTitle1">${this.labelTitleInPlay}</h3>
                    <div class="blockTournamentList_list listLineDivide">
                        <section class="unitTournament unitTournament-link">
                            <a href="/tournament/detail_id" data-link>
                                <header class="unitTournament_header">
                                    <h4 class="unitTournament_title">TournamentTitle1</h4>
                                    <p class="unitTournament_start">2024/07/3 13:00</p>
                                </header>
                                <p class="unitTournament_nickname">(as nickname6)</p>
                            </a>
                        </section>
                        <section class="unitTournament unitTournament-link">
                            <a href="/tournament/detail_id" data-link>
                                <header class="unitTournament_header">
                                    <h4 class="unitTournament_title">TournamentTitle2</h4>
                                    <p class="unitTournament_start">2024/07/5 21:00</p>
                                </header>
                            </a>
                        </section>
                    </div>
                </section>
                <section class="blockTournamentList">
                    <h3 class="blockTournamentList_title unitTitle1">${this.labelTitleRecent}</h3>
                    <div class="blockTournamentList_list listLineDivide">
                        <section class="unitTournament unitTournament-link">
                            <a href="/tournament/detail_id" data-link>
                                <header class="unitTournament_header">
                                    <h4 class="unitTournament_title">TournamentTitle1</h4>
                                    <p class="unitTournament_start">2024/07/3 13:00</p>
                                </header>
                                <p class="unitTournament_nickname">(as 01234567890123456789012345678901)</p>
                            </a>
                        </section>
                        <section class="unitTournament unitTournament-link">
                            <a href="/tournament/detail_id" data-link>
                                <header class="unitTournament_header">
                                    <h4 class="unitTournament_title">TournamentTitle2</h4>
                                    <p class="unitTournament_start">2024/07/5 21:00</p>
                                </header>
                            </a>
                        </section>
                    </div>
                </section>
            </div>
            <ol class="breadcrumb">
                <li><a href="/">dashboard</a></li>
                <li>Tournament</li>
            </ol>
        `;
    }

    listenCreateTournament() {
        const btnCreateTournament = document.getElementById('btnCreateTournament');
        btnCreateTournament.addEventListener('click', this.handleCreateTournament.bind(this));
        this.addListenEvent(btnCreateTournament, this.handleCreateTournament, 'click');
    }

    handleCreateTournament(ev) {
        ev.preventDefault();
        console.log("handleCreateTournament");
        //todo: CreateTournament
    }
}

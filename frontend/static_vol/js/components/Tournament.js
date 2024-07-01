'use strict';

import PageBase from './PageBase.js';
import { showModalEntryTournament, showModalSendMatchRequest } from "../modules/modal.js";
import { labels } from '../modules/labels.js';
import { createTournament } from '../modules/tournament.js';
import { addNotice } from '../modules/notice.js';
import { CREATE_TOURNAMENT_TIMELIMIT_MIN } from '../modules/env.js';

export default class Tournament extends PageBase {
    constructor(params) {
        super(params);
        Tournament.instance = this;
        this.title = 'Tournament';
        this.setTitle(this.title);
        this.generateBreadcrumb(this.title, this.breadcrumbLinks);

        this.labelEntry = 'Entry';
        this.labelCancelEntry = 'Cancel';

        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.listenCreateTournament.bind(this));
        this.addAfterRenderHandler(this.listenCancelTournament.bind(this));
        this.addAfterRenderHandler(this.listenEntryTournament.bind(this));
    }

    async renderHtml() {
        return `
            <div class="wrapTournament">
                <form id="formCreateTournament" class="formCreateTournament blockForm unitBox" action="" method="post">
                    <dl class="blockForm_el formCreateTournament_elInput formCreateTournament_elInput-title">
                        <dt>${labels.tournament.labelTournamentTitle}</dt>
                        <dd><input type="text" id="inputTournamentTitle" placeholder="Enter Tournament Title" pattern="(?=.*[a-z0-9])[a-z0-9_]+" minlength="3" maxlength="32" required /></dd>
                    </dl>
                    <dl class="blockForm_el formCreateTournament_elInput formCreateTournament_elInput-start">
                        <dt>${labels.tournament.labelStart}</dt>
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
                    <p class="formCreateTournament_button blockForm_button"><button type="submit" id="btnCreateTournament" class="unitButton">${labels.tournament.labelCreateTournament}</button></p>
                </form>
                <section class="blockTournamentList">
                    <h3 class="blockTournamentList_title unitTitle1">${labels.tournament.labelTitleUpcoming}</h3>
                    <div class="blockTournamentList_list listLineDivide">
                        <section class="unitTournament">
                            <header class="unitTournament_header">
                                <h4 class="unitTournament_title">TournamentTitle1</h4>
                                <p class="unitTournament_start">2024/07/3 13:00</p>
                            </header>
                            <div class="unitTournament_body">
                                <p class="unitTournament_capacity">( <strong>6</strong> / 50 )</p>
                                <p class="unitTournament_nickname">as 01234567890123456789012345678901</p>
                                <form class="unitTournament_form" action="" method="post">
                                    <input type="hidden" name="idTitle" value="1">
                                    <input type="hidden" name="title" value="TournamentTitle">
                                    <input type="hidden" name="start" value="2024/05/3 13:00">
                                    <input type="hidden" name="nickname" value="nickname6">
                                    <p class="blockForm_button"><button type="submit" class="unitButtonDecline">${labels.tournament.labelCancelEntry}</button></p>
                                </form>
                            </div>
                        </section>
                        <section class="unitTournament">
                            <header class="unitTournament_header">
                                <h4 class="unitTournament_title">TournamentTitle1</h4>
                                <p class="unitTournament_start">2024/07/3 13:00</p>
                            </header>
                            <div class="unitTournament_body">
                                <p class="unitTournament_capacity">( <strong>6</strong> / 50 )</p>
                                <p class="unitTournament_nickname">as 012</p>
                                <form class="unitTournament_form" action="" method="post">
                                    <input type="hidden" name="idTitle" value="2">
                                    <input type="hidden" name="title" value="TournamentTitle">
                                    <input type="hidden" name="start" value="2024/05/3 13:00">
                                    <input type="hidden" name="nickname" value="nickname6">
                                    <p class="blockForm_button"><button type="submit" class="unitButtonDecline">${labels.tournament.labelCancelEntry}</button></p>
                                </form>
                            </div>
                        </section>
                        <section class="unitTournament">
                            <header class="unitTournament_header">
                                <h4 class="unitTournament_title">TournamentTitle2</h4>
                                <p class="unitTournament_start">2024/07/5 21:00</p>
                            </header>
                            <div class="unitTournament_body">
                                <p class="unitTournament_capacity">( <strong>6</strong> / 50 )</p>
                                <form class="unitTournament_form" action="" method="post">
                                    <input type="hidden" name="idTitle" value="3">
                                    <input type="hidden" name="title" value="TournamentTitle2">
                                    <input type="hidden" name="start" value="2024/07/5 21:00">
                                    <p class="blockForm_button"><button type="button" class="unitButton">${labels.tournament.labelEntry}</button></p>
                                </form>
                            </div>
                        </section>
                        <section class="unitTournament">
                            <header class="unitTournament_header">
                                <h4 class="unitTournament_title">TournamentTitle2</h4>
                                <p class="unitTournament_start">2024/07/5 21:00</p>
                            </header>
                            <div class="unitTournament_body">
                                <p class="unitTournament_capacity">( <strong>50</strong> / 50 )</p>
                                <form class="unitTournament_form">
                                    <!-- todo: 満員の場合、フォーム要素なしにしておく -->
                                    <p class="blockForm_button"><button type="button" class="unitButton" disabled>${labels.tournament.labelEntry}</button></p>
                                </form>
                            </div>
                        </section>
                    </div>
                </section>
                <section class="blockTournamentList">
                    <h3 class="blockTournamentList_title unitTitle1">${labels.tournament.labelTitleInPlay}</h3>
                    <div class="blockTournamentList_list listLineDivide">
                        <section class="unitTournament unitTournament-link">
                            <a href="/tournament/detail_id" data-link>
                                <header class="unitTournament_header">
                                    <h4 class="unitTournament_title">TournamentTitle1</h4>
                                    <p class="unitTournament_start">2024/07/3 13:00</p>
                                </header>
                                <div class="unitTournament_body">
                                    <p class="unitTournament_nickname">as nickname6</p>
                                </div>
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
                    <h3 class="blockTournamentList_title unitTitle1">${labels.tournament.labelTitleRecent}</h3>
                    <div class="blockTournamentList_list listLineDivide">
                        <section class="unitTournament unitTournament-link">
                            <a href="/tournament/detail_id" data-link>
                                <header class="unitTournament_header">
                                    <h4 class="unitTournament_title">TournamentTitle1</h4>
                                    <p class="unitTournament_start">2024/07/3 13:00</p>
                                </header>
                                <div class="unitTournament_body">
                                    <p class="unitTournament_nickname">as 01234567890123456789012345678901</p>
                                </div>
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
        `;
    }

    listenCreateTournament() {
        const btnCreateTournament = document.getElementById('btnCreateTournament');
        const boundHandleCreateTournament = this.handleCreateTournament.bind(this);
        this.addListListenInInstance(btnCreateTournament, boundHandleCreateTournament, 'click');
    }

    handleCreateTournament(ev) {
        ev.preventDefault();
        console.log("handleCreateTournament");

        const tournamentTitle = document.getElementById('inputTournamentTitle').value;
        if (!tournamentTitle || !tournamentTitle.trim()) {
            addNotice('トーナメントのタイトルを入力してください', true);
            return;
        }

        const startTimeInput = document.getElementById('startTime').value;
        const startTime = new Date(startTimeInput);
        const now = new Date();
        now.setMinutes(now.getMinutes() + CREATE_TOURNAMENT_TIMELIMIT_MIN);
        const minUTC = new Date(now.toISOString());
        const startUTC = new Date(startTime.toISOString());
        console.log(`startUTC: ${startUTC}, minUTC: ${minUTC}`);
        if (startUTC < minUTC) {
             addNotice(`トーナメントの開始時刻は${CREATE_TOURNAMENT_TIMELIMIT_MIN}分後以降に設定してください`, true);
             return;
        }
        createTournament(tournamentTitle, startTime);
    }

    listenCancelTournament() {
        const btnCancelTournament = document.querySelectorAll('.unitTournament_form .unitButtonDecline');
        const boundHandleCancelTournament = this.handleCancelTournament.bind(this);
        btnCancelTournament.forEach((btn) => {
            this.addListListenInInstance(btn, boundHandleCancelTournament, 'click');
        });
    }

    handleCancelTournament(ev) {
        ev.preventDefault();
        console.log("handleCancelTournament");
        //todo: CancelTournament
    }

    listenEntryTournament() {
        const btnEntryTournament = document.querySelectorAll('.unitTournament_form .unitButton');
        const boundShowModalEntryTournament = showModalEntryTournament.bind(this);
        btnEntryTournament.forEach((btn) => {
            this.addListListenInInstance(btn, boundShowModalEntryTournament, 'click');//todo: rm 確認
        });
    }

    destroy() {
        super.destroy();
    }
}

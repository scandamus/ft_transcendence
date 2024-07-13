'use strict';

import PageBase from './PageBase.js';
//import { showModalEntryTournament, showModalSendMatchRequest } from "../modules/modal.js";
import { labels } from '../modules/labels.js';
import { createTournament } from '../modules/tournament.js';
import { addNotice } from '../modules/notice.js';
import { CREATE_TOURNAMENT_TIMELIMIT_MIN } from '../modules/env.js';
//import { fetchTournaments } from '../modules/tounamentApi.js';
import { updateOngoingTournamentList, updateUpcomingTournamentList } from '../modules/tournamentList.js'

export default class Tournament extends PageBase {
    static instance = null;

    constructor(params) {
        if (Tournament.instance) {
            return Tournament.instance;
        }
        super(params);
        Tournament.instance = this;
        this.title = 'Tournament';
        this.setTitle(this.title);
        this.generateBreadcrumb(this.title, this.breadcrumbLinks);

        this.labelEntry = 'Entry';
        this.labelCancelEntry = 'Cancel';

        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.listenCreateTournament.bind(this));
        this.addAfterRenderHandler(this.updateLists.bind(this));

        //Instance固有のlistenerList
        this.listListenEntryTournament = [];
        this.listListenCancelEntryTournament = [];
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
                    <div class="blockTournamentList_upcoming listLineDivide">
                </section>
                <section class="blockTournamentList">
                    <h3 class="blockTournamentList_title unitTitle1">${labels.tournament.labelTitleInPlay}</h3>
                    <div class="blockTournamentList_ongoing listLineDivide"></div>
                </section>
                <section class="blockTournamentList">
                    <h3 class="blockTournamentList_title unitTitle1">${labels.tournament.labelTitleRecent}</h3>
                    <div class="blockTournamentList_list listLineDivide">
                        <section class="unitTournament unitTournament-link">
                            <a href="/tournament/detail:1" data-link>
                                <header class="unitTournament_header">
                                    <h4 class="unitTournament_title">TournamentTitle1</h4>
                                    <p class="unitTournament_start">2024/07/3 13:00</p>
                                </header>
                                <div class="unitTournament_body">
                                    <p class="unitTournament_nickname">as 01234567890123456789012345678901</p>
                                </div>
                            </a>
                        </section>
                    </div>
                </section>
            </div>
        `;
    }

    updateLists() {
        try {
            updateUpcomingTournamentList(this).then(() => {});
            updateOngoingTournamentList(this).then(() => {});
 //           updateFinishedTournamentList(this).then(() => {});
        } catch (error) {
            console.error('Failed to update lists: ', error);
            throw error;
        }
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

    // listenCancelTournament() {
    //     const btnCancelTournament = document.querySelectorAll('.unitTournament_form .unitButtonDecline');
    //     const boundHandleCancelTournament = this.handleCancelTournament.bind(this);
    //     btnCancelTournament.forEach((btn) => {
    //         const form = btn.closest('form');
    //         const tournamentName = form.querySelector('input[name="title"]').value;
    //         this.addListListenInInstance(btn, boundHandleCancelTournament, 'click');
    //         console.log(`[Add listner] cancel tournament to ${tournamentName}`);
    //     });
    // }

    // handleCancelTournament(ev) {
    //     ev.preventDefault();
    //     const form = ev.target.closest('form');
    //     const tournamentId = form.querySelector('input[name="idTitle"]').value;
    //     const tournamentName = form.querySelector('input[name="title"]').value;
    
    //     console.log(`Canceling entry for tournament: ${tournamentName} (ID: ${tournamentId})`);
    //     cancelTournamentEntry(tournamentId, tournamentName);
    // }

    // listenEntryTournament() {
    //     const btnEntryTournament = document.querySelectorAll('.unitTournament_form .unitButton');
    //     const boundShowModalEntryTournament = showModalEntryTournament.bind(this);
    //     btnEntryTournament.forEach((btn) => {
    //         const form = btn.closest('form');
    //         const tournamentName = form.querySelector('input[name="title"]').value;
    //         this.addListListenInInstance(btn, boundShowModalEntryTournament, 'click');//todo: rm 確認
    //         console.log(`[Add listener] entry tournament to ${tournamentName}`);
    //     });
    // }

    destroy() {
        Tournament.instance = null;
        super.destroy();
    }
}
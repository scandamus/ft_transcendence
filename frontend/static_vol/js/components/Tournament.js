'use strict';

import PageBase from './PageBase.js';
//import { showModalEntryTournament, showModalSendMatchRequest } from "../modules/modal.js";
import { labels } from '../modules/labels.js';
import { createTournament } from '../modules/tournament.js';
import { addNotice } from '../modules/notice.js';
import { CREATE_TOURNAMENT_TIMELIMIT_MIN } from '../modules/env.js';
//import { fetchTournaments } from '../modules/tounamentApi.js';
import { updateOngoingTournamentList, updateUpcomingTournamentList } from '../modules/tournamentList.js'
import { checkTournamentInputValid, checkFormReady } from "../modules/form.js";

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
        this.start_dates = [];

        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.listenCreateTournament.bind(this));
        this.addAfterRenderHandler(this.updateLists.bind(this));
        this.addAfterRenderHandler(this.resetFormCreateTournament.bind(this));

        //Instance固有のlistenerList
        this.listListenEntryTournament = [];
        this.listListenCancelEntryTournament = [];
        this.listListenElEntryTournament = [];
    }

    async renderHtml() {
        let listDescTournamentTitle = '';
        for (let i = 0; i < labels.tournament.descTournamentTitle.length; i++) {
            listDescTournamentTitle += `<li>${labels.tournament.descTournamentTitle[i]}</li>`;
        }
        let listDescTournamentStart = '';
        for (let i = 0; i < labels.tournament.descTournamentStart.length; i++) {
            listDescTournamentStart += `<li>${labels.tournament.descTournamentStart[i]}</li>`;
        }
        return `
            <div class="wrapTournament">
                <form id="formCreateTournament" class="formCreateTournament blockForm unitBox" action="" method="post">
                    <dl class="blockForm_el formCreateTournament_elInput formCreateTournament_elInput-title">
                        <dt>${labels.tournament.labelTournamentTitle}</dt>
                        <dd>
                            <input type="text" id="inputTournamentTitle" placeholder="Enter Tournament Title" pattern="[\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FFF\\w@_#$%&!.+*~]+" minlength="3" maxlength="50" required />
                            <ul class="listError"></ul>
                            <ul class="listAnnotation">${listDescTournamentTitle}</ul>
                        </dd>
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
                            <ul class="listError"></ul>
                            <ul class="listAnnotation">${listDescTournamentStart}</ul>
                        </dd>
                    </dl>
                    <p class="formCreateTournament_button blockForm_button"><button type="submit" id="btnCreateTournament" class="unitButton" disabled>${labels.tournament.labelCreateTournament}</button></p>
                </form>
                <p class="btnUpdateTournamentLists"><button type="button" id="btnUpdateTournamentLists_button" class="unitButton unitButton-small">${labels.tournament.labelUpdateLists}</button></p>
                <section class="blockTournamentList">
                    <h3 class="blockTournamentList_title unitTitle1">${labels.tournament.labelTitleUpcoming}</h3>
                    <div class="blockTournamentList_upcoming listLineDivide"></div>
                </section>
                <section class="blockTournamentList">
                    <h3 class="blockTournamentList_title unitTitle1">${labels.tournament.labelTitleInPlay}</h3>
                    <div class="blockTournamentList_ongoing listLineDivide">
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

    updateLists() {
        try {
            updateUpcomingTournamentList(this).then((start_dates) => {
                this.start_dates = start_dates;
            });
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

        const elTournamentTitle = document.getElementById('inputTournamentTitle');
        const elTournamentStart = document.getElementById('startTime');
        const boundHandleInput = this.handleInput.bind(this);
        this.addListListenInInstance(elTournamentTitle, boundHandleInput, 'blur');
        this.addListListenInInstance(elTournamentStart, boundHandleInput, 'blur');

        const btnUpdateList = document.getElementById('btnUpdateTournamentLists_button');
        const boundUpdateLists = this.updateLists.bind(this);
        this.addListListenInInstance(btnUpdateList, boundUpdateLists, 'click');
    }

    handleCreateTournament(ev) {
        ev.preventDefault();
        console.log("handleCreateTournament");

        const tournamentTitle = document.getElementById('inputTournamentTitle').value;
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

    formatToDatetimeLocal(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    resetFormCreateTournament() {
        const elTournamentTitle = document.getElementById('inputTournamentTitle');
        const elStartTime = document.getElementById('startTime');

        //clear tournament title
        if (elTournamentTitle.classList.contains('has-input')) {
            elTournamentTitle.classList.remove('has-input');
        }
        elTournamentTitle.value = '';
        //reset data
        let dateTime = new Date();
        dateTime.setMinutes(dateTime.getMinutes() + CREATE_TOURNAMENT_TIMELIMIT_MIN);
        if (dateTime.getMinutes() !== 0) {
            dateTime.setHours(dateTime.getHours() + 1);
        }
        dateTime.setMinutes(0);
        dateTime.setSeconds(0);
        dateTime.setMilliseconds(0);
        const minTimeFormatted = this.formatToDatetimeLocal(dateTime);
        dateTime.setMonth(dateTime.getMonth() + 1);
        const maxTimeFormatted = this.formatToDatetimeLocal(dateTime);
        elStartTime.min = minTimeFormatted;
        elStartTime.max = maxTimeFormatted;
        elStartTime.value = minTimeFormatted;
    }

    handleInput(ev) {
        const elForm = ev.target.closest('form');
        const btnCreateTournament = document.getElementById('btnCreateTournament');
        const btnEntryTournament = document.getElementById('btnEntryTournament');
        const elInput = ev.target;
        //初回入力時、invalid styleが当たるようにclass付与
        const classHasInput = 'has-input';
        if (!elInput.classList.contains(classHasInput)) {
            elInput.classList.add(classHasInput);
        }
        //formの各input validate
        checkTournamentInputValid(elInput);
        //ボタンenabled切り替え(ok=>ngもありうる)
        const btn = (elForm.classList.contains('formEntryTournament')) ? btnEntryTournament : btnCreateTournament;
        checkFormReady(elForm, btn);
    }

    destroy() {
        Tournament.instance = null;
        super.destroy();
    }
}
'use strict';

import PageBase from './PageBase.js';
import { showModalEntryTournament, showModalSendMatchRequest } from "../modules/modal.js";
import { labels } from '../modules/labels.js';
import { fetchTournamentDetail } from "../modules/tounamentApi.js";
import { formatDateToLocal } from "../modules/formatDateToLocal.js";

export default class TournamentDetail extends PageBase {
    static instance = null;

    constructor(params) {
        if (TournamentDetail.instance) {
            return TournamentDetail.instance;
        }
        super(params);
        TournamentDetail.instance = this;
        //setTitleはrenderHtml()で取得後に行う
        this.id = params.id.split(':')[1];
        this.tournamentData = ``;
        this.renderedRounds = new Set();
        this.elWaiting = null;
        this.elNextMatchWrap = null;
        this.elNextMatch = null;
        this.elNextMatchTitle = null;
        this.elWaitingTitle = null;
        this.elWaitingContent = null;
        this.avatarMap = null;
        this.breadcrumbLinks.push({ href: '/tournament', text: 'tournament' });

        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.getDomElements.bind(this));
        this.addAfterRenderHandler(this.generateTournamentResult.bind(this));
    }

    async renderHtml() {
        this.tournamentData = await fetchTournamentDetail(this.id, false);
        this.title = this.tournamentData.name;
        this.setTitle(this.title);
        this.generateBreadcrumb(this.title, this.breadcrumbLinks);
        this.avatarMap = this.tournamentData.player_avatar_map;

        return `
            <div class="wrapTournament">
                <p class="blockTournamentStart">${formatDateToLocal(this.tournamentData.start)} START</p>
                <section class="blockTournamentWaiting unitBox">
                    <h3 class="blockTournamentWaiting_title"></h3>
                    <div class="blockTournamentWaiting_message">
                        <p></p>
                    </div>
                </section>
                <section class="blockTournamentNextMatch unitBox">
                    <h3 class="blockTournamentNextMatch_title"></h3>
                    <div class="blockNextMatch"></div>
                </section>
                <div class="blockTournamentRanking unitBox"></div>
                <div class="wrapTournamentRound"></div>
            </div>`;
    }

    getElWaiting() {
        if (!this.elWaiting) {
            this.elWaiting = document.querySelector('.blockTournamentWaiting');
        }
        return this.elWaiting;
    }

    getElNextMatchWrap() {
        if (!this.elNextMatchWrap) {
            this.elNextMatchWrap = document.querySelector('.blockTournamentNextMatch');
        }
        return this.elNextMatchWrap;
    }

    getElNextMatch() {
        if (!this.elNextMatch) {
            this.elNextMatch = this.elNextMatchWrap.querySelector('.blockNextMatch');
        }
        return this.elNextMatch;
    }

    getElNextMatchTitle() {
        if (!this.elNextMatchTitle) {
            this.elNextMatchTitle = this.elNextMatchWrap.querySelector('.blockTournamentNextMatch_title');
        }
        return this.elNextMatchTitle;
    }

    getElWaitingTitle() {
        if (!this.elWaitingTitle) {
            this.elWaitingTitle = this.elWaiting.querySelector('.blockTournamentWaiting_title');
        }
        return this.elWaitingTitle;
    }

    getElWaitingContent() {
        if (!this.elWaitingContent) {
            this.elWaitingContent = this.elWaiting.querySelector('.blockTournamentWaiting_message');
        }
        return this.elWaitingContent;
    }

    getDomElements() {
        this.getElWaiting();
        this.getElNextMatchWrap();
        this.getElNextMatch();
        this.getElNextMatchTitle();
        this.getElWaitingTitle();
        this.getElWaitingContent();

        if (sessionStorage.getItem('tournament_status') === 'waiting_start') {
            this.displayWaiting(labels.tournament.labelWaitStart, labels.tournament.msgWaitStart);
        } else if (sessionStorage.getItem('tournament_status') === 'waiting_round') {
            this.displayWaiting(labels.tournament.labelWaitRound, labels.tournament.msgWaitRound);
        }
    }

    async generateTournamentResult() {
        this.tournamentData = await fetchTournamentDetail(this.id, false);
        const result = (this.tournamentData && this.tournamentData.result) ? JSON.parse(this.tournamentData.result) : '';
        const wrapTournamentRound = document.querySelector('.wrapTournamentRound');
        const blockTournamentRanking = document.querySelector('.blockTournamentRanking');
        result.forEach(item => {
            if (item.round !== undefined && !this.renderedRounds.has(item.round)) {
                const roundList = this.generateRoundList(item);
                if (roundList) {
                    wrapTournamentRound.insertAdjacentHTML('afterbegin', roundList);
                }
                this.renderedRounds.add(item.round);
            } else if (item.rankings !== undefined) {
                blockTournamentRanking.innerHTML = this.generateRankingList(item.rankings);
                blockTournamentRanking.classList.add('is-show');
            }
        });
    }

    generateRankingList(rankings) {
        const avatar1 = this.avatarMap[rankings.winner_id] ? this.avatarMap[rankings.winner_id] : `/images/avatar_default.png`;
        const avatar2 = this.avatarMap[rankings.second_id] ? this.avatarMap[rankings.second_id] : `/images/avatar_default.png`;
        const avatar3 = this.avatarMap[rankings.third_id] ? this.avatarMap[rankings.third_id] : `/images/avatar_default.png`;
        return `
            <dl class="unitRanker">
                <dt class="unitRanker_rank unitRanker_rank-1"><span>${labels.tournament.labelWinner}</span></dt>
                <dd class="unitRanker_user">
                    <img src="${avatar1}" alt="" width="50" height="50">
                    ${rankings.winner}
                </dd>
            </dl>
            <dl class="unitRanker">
                <dt class="unitRanker_rank unitRanker_rank-2"><span>${labels.tournament.labelSecondPlace}</span></dt>
                <dd class="unitRanker_user">
                    <img src="${avatar2}" alt="" width="50" height="50">
                    ${rankings.second}
                </dd>
            </dl>
            <dl class="unitRanker">
                <dt class="unitRanker_rank unitRanker_rank-3"><span>${labels.tournament.labelThirdPlace}</span></dt>
                <dd class="unitRanker_user">
                    <img src="${avatar3}" alt="" width="50" height="50">
                    ${rankings.third}
                </dd>
            </dl>`;
    }

    generateMatch(match) {
        let matchHtml = '';
        const avatar1 = this.avatarMap[match.player1_id] ? this.avatarMap[match.player1_id] : `/images/avatar_default.png`;
        const avatar2 = this.avatarMap[match.player2_id] ? this.avatarMap[match.player2_id] : `/images/avatar_default.png`;
        matchHtml += `
                <div class="blockMatch">
                    <section class="blockMatch_player unitMatchPlayer">
                        <header class="unitMatchPlayer_header">
                            <img src="${avatar1}" alt="" width="50" height="50">
                            <h4 class="unitMatchPlayer_title">${match.player1}</h4>
                        </header>`;
        if (match.score1 !== undefined && match.score1 !== null) {
            matchHtml += `
                        <p class="unitMatchPlayer_score">${match.score1}</p>`;
        } else {
            matchHtml += `
                        <p class="unitMatchPlayer_score">?</p>`;
        }
        if (match.winner === match.player1) {
            matchHtml += `
                        <p class="unitMatchPlayer_result">win</p>`;
        }
        matchHtml += `
                    </section>
                    <p class="blockMatch_vs">VS</p>
                    <section class="blockMatch_player unitMatchPlayer">
                        <header class="unitMatchPlayer_header">
                            <img src="${avatar2}" alt="" width="50" height="50">
                            <h4 class="unitMatchPlayer_title">${match.player2}</h4>
                        </header>`;
        if (match.score2 !== undefined && match.score2 !== null) {

            matchHtml += `
                        <p class="unitMatchPlayer_score">${match.score2}</p>`;
        } else {
            matchHtml += `
                        <p class="unitMatchPlayer_score">?</p>`;
        }
        if (match.winner === match.player2) {
            matchHtml += `
                        <p class="unitMatchPlayer_result">win</p>`;
        }
        matchHtml += `
                    </section>
                </div>`;
        return matchHtml;
    }

    generateRoundList(matches) {
        let resultHtml = '';
        let labelRound = '';
        const listSemifinal = matches.round === -4 ? ' listSemifinal' : '';
        if (matches.round === -1 || matches.round === -6) {
            labelRound = labels.tournament.labelRoundFinal;
        } else if (matches.round === -4) {
            labelRound = labels.tournament.labelRoundSemiFinal;
        } else if (matches.round === -5) {
            const elListSemifinal = document.querySelector('.listSemifinal');
            elListSemifinal.insertAdjacentHTML('afterbegin', this.generateMatch(matches.matches[0]));
            return;
        } else if (matches.round === -3) {
            labelRound = labels.tournament.labelRoundThirdPlaceRound
        } else if (matches.round === 3) {
            labelRound = labels.tournament.labelRound3;
        } else if (matches.round === 2) {
            labelRound = labels.tournament.labelRound2;
        } else if (matches.round === 1) {
            labelRound = labels.tournament.labelRound1;
        }
        resultHtml += `
            <section class="blockTournamentRound">
                <h3 class="blockTournamentRound_title unitTitle1">${labelRound}</h3>
                <div class="blockTournamentRound_listMatch${listSemifinal} listLineDivide">`;
            for (const match of matches.matches) {
                resultHtml += this.generateMatch(match);
            }
            if (matches.bye_player) {
                const avatarBye = this.avatarMap[matches.bye_player_id] ? this.avatarMap[matches.bye_player_id] : `/images/avatar_default.png`;
                resultHtml += `
                    <section class="blockByePlayer">
                        <h4 class="blockByePlayer_title">${labels.tournament.labelByePlayer}</h4>
                        <p class="blockByePlayer_player">
                            <img src="${avatarBye}" alt="" width="50" height="50">
                            <span>${matches.bye_player}</span>
                        </p>
                    </section>`;
            }
            resultHtml += `
                    </div>
                </section>`;
        return resultHtml;
    }

    displayNextMatch(all_usernames, round) {
        this.hideWaiting();
        let labelRound = '';
        this.getElNextMatch().innerHTML = `
            <section class="blockNextMatch_player unitNextMatchPlayer">
                <h4 class="unitNextMatchPlayer_title">${all_usernames[0].username}</h4>
                <img src="${all_usernames[0].avatar || '/images/avatar_default.png'}" alt="" width="100" height="100" class="unitNextMatchPlayer_thumb">
            </section>
            <p class="blockNextMatch_vs">VS</p>
            <section class="blockNextMatch_player unitNextMatchPlayer">
                <h4 class="unitNextMatchPlayer_title">${all_usernames[1].username}</h4>
                <img src="${all_usernames[1].avatar || '/images/avatar_default.png'}" alt="" width="100" height="100" class="unitNextMatchPlayer_thumb">
            </section>`;
        if (round === -1 || round === -6) {
            labelRound = labels.tournament.labelRoundFinal;
        } else if (round === -4 || round === -5) {
            labelRound = labels.tournament.labelRoundSemiFinal;
        } else if (round === -3) {
            labelRound = labels.tournament.labelRoundThirdPlaceRound
        } else if (round === 3) {
            labelRound = labels.tournament.labelRound3;
        } else if (round === 2) {
            labelRound = labels.tournament.labelRound2;
        } else if (round === 1) {
            labelRound = labels.tournament.labelRound1;
        }
        this.getElNextMatchTitle().innerHTML = `<small>${labels.tournament.labelNextMatch}</small><strong>${labelRound}</strong>`;
        this.getElNextMatchWrap().classList.add('is-show');
    }

    displayWaiting(title, contents) {
        this.getElWaiting();
        this.getElWaitingTitle().textContent = title;
        this.getElWaitingContent().innerHTML = contents;
        if (!this.elWaiting.classList.contains('is-show')) {
            this.elWaiting.classList.add('is-show');
        }
    }

    hideWaiting() {
        this.getElWaiting();
        if (this.elWaiting.classList.contains('is-show')) {
            this.getElWaitingTitle().textContent = '';
            this.getElWaitingContent().innerHTML = '';
            this.elWaiting.classList.remove('is-show');
        }
        sessionStorage.removeItem('tournament_status');
    }

    destroy() {
        TournamentDetail.instance = null;
        super.destroy();
    }
}

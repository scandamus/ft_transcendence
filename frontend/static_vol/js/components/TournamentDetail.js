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
        this.breadcrumbLinks.push({ href: '/tournament', text: 'tournament' });
    }

    async renderHtml() {
        const tournamentData = await fetchTournamentDetail(this.id, false);
        const result = tournamentData.result ? JSON.parse(tournamentData.result) : '';
        this.title = tournamentData.name;
        this.setTitle(this.title);
        this.generateBreadcrumb(this.title, this.breadcrumbLinks);
        const RoundList = await this.generateRoundList(result, tournamentData.round);
        let detailHtml = ``;
        detailHtml += `
            <div class="wrapTournament">
                <p class="blockTournamentStart">${formatDateToLocal(tournamentData.start)} START</p>`;
        if (tournamentData.winner || tournamentData.second || tournamentData.third) {
            detailHtml += `
                <div class="blockTournamentRanking unitBox">`;
        }
        if (tournamentData.winner) {
            const avatar = tournamentData.winner_avatar ? tournamentData.winner_avatar : `/images/avatar_default.png`;
            detailHtml += `
                <dl class="unitRanker">
                    <dt class="unitRanker_rank unitRanker_rank-1"><span>${labels.tournament.labelWinner}</span></dt>
                    <dd class="unitRanker_user">
                        <img src="${avatar}" alt="" width="50" height="50">
                        ${tournamentData.winner}
                    </dd>
                </dl>`;
        }
        if (tournamentData.second) {
            const avatar = tournamentData.second_avatar ? tournamentData.second_avatar : `/images/avatar_default.png`;
            detailHtml += `
                <dl class="unitRanker">
                    <dt class="unitRanker_rank unitRanker_rank-2"><span>${labels.tournament.labelSecondPlace}</span></dt>
                    <dd class="unitRanker_user">
                        <img src="${avatar}" alt="" width="50" height="50">
                        ${tournamentData.second}
                    </dd>
                </dl>`;
        }
        if (tournamentData.third) {
            const avatar = tournamentData.third_avatar ? tournamentData.third_avatar : `/images/avatar_default.png`;
            detailHtml += `
                <dl class="unitRanker">
                    <dt class="unitRanker_rank unitRanker_rank-3"><span>${labels.tournament.labelThirdPlace}</span></dt>
                    <dd class="unitRanker_user">
                        <img src="${avatar}" alt="" width="50" height="50">
                        ${tournamentData.third}
                    </dd>
                </dl>`;
        }
        if (tournamentData.winner || tournamentData.second || tournamentData.third) {
            detailHtml += `
                </div>`;
        }
        detailHtml += `${RoundList}
            </div>`;

        return `${detailHtml}`;
    }

    async generateRoundList(result, countRound) {
        let resultHtml = ``;
        for (const round of result) {
            let labelRound = '';
            if (round.round === 4 || round.round === countRound) {
                labelRound = labels.tournament.labelRoundFinal;
            } else if (round.round === 3) {
                labelRound = labels.tournament.labelRound3;
            } else if (round.round === 2) {
                labelRound = labels.tournament.labelRound2;
            } else if (round.round === 1) {
                labelRound = labels.tournament.labelRound1;
            }
            resultHtml += `
                <section class="blockTournamentRound">
                    <h3 class="blockTournamentList_title unitTitle1">${labelRound}</h3>
                    <div class="blockTournamentRound_listMatch listLineDivide">`;
            for (const match of round.matches) {
                const avatar1 = match.avatar1 ? match.avatar1 : `/images/avatar_default.png`;
                const avatar2 = match.avatar2 ? match.avatar2 : `/images/avatar_default.png`;
                resultHtml += `
                        <div class="blockMatch">
                            <section class="blockMatch_player unitMatchPlayer">
                                <header class="unitMatchPlayer_header">
                                    <img src="${avatar1}" alt="" width="50" height="50">
                                    <h4 class="unitMatchPlayer_title">${match.player1}</h4>
                                </header>`;
                if (match.winner) {
                    resultHtml += `
                                <p class="unitMatchPlayer_score">${match.score1}</p>`;
                } else {
                    resultHtml += `
                                <p class="unitMatchPlayer_score">?</p>`;
                }
                if (match.winner === match.player1) {
                    resultHtml += `
                                <p class="unitMatchPlayer_result">win</p>`;
                }
                resultHtml += `
                            </section>
                            <p class="blockMatch_vs">VS</p>
                            <section class="blockMatch_player unitMatchPlayer">
                                <header class="unitMatchPlayer_header">
                                    <img src="${avatar2}" alt="" width="50" height="50">
                                    <h4 class="unitMatchPlayer_title">${match.player2}</h4>
                                </header>`;
                if (match.winner) {
                    resultHtml += `
                                <p class="unitMatchPlayer_score">${match.score2}</p>`;
                } else {
                    resultHtml += `
                                <p class="unitMatchPlayer_score">?</p>`;
                }
                if (match.winner === match.player2) {
                    resultHtml += `
                                <p class="unitMatchPlayer_result">win</p>`;
                }
                resultHtml += `
                            </section>
                        </div>`;
            }
            resultHtml += `
                    </div>
                </section>`;
        }
        return resultHtml;
    }

    destroy() {
        TournamentDetail.instance = null;
        super.destroy();
    }
}

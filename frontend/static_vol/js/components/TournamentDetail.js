'use strict';

import PageBase from './PageBase.js';
import { showModalEntryTournament, showModalSendMatchRequest } from "../modules/modal.js";
import { labels } from '../modules/labels.js';
import { fetchTournamentDetail } from "../modules/tounamentApi.js";

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
        const result = JSON.parse(tournamentData.result_json);
        this.title = tournamentData.name;
        this.setTitle(this.title);
        this.generateBreadcrumb(this.title, this.breadcrumbLinks);
        const RoundList = await this.generateRoundList(result);
        return `
            <div class="wrapTournament">
                <p class="blockTournamentStart">${tournamentData.start} START</p>
                <div class="blockTournamentRanking unitBox">
                    <dl class="unitRanker">
                        <dt class="unitRanker_rank unitRanker_rank-1">Rank <strong>1</strong></dt>
                        <dd class="unitRanker_user">
                            <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                            username
                        </dd>
                    </dl>
                    <dl class="unitRanker">
                        <dt class="unitRanker_rank unitRanker_rank-2">Rank <strong>2</strong></dt>
                        <dd class="unitRanker_user">
                            <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                            012
                        </dd>
                    </dl>
                    <dl class="unitRanker">
                        <dt class="unitRanker_rank unitRanker_rank-3">Rank <strong>3</strong></dt>
                        <dd class="unitRanker_user">
                            <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                            01234567890123456789012345678901
                        </dd>
                    </dl>
                </div>
                ${RoundList}
            </div>
        `;
    }

    generateRoundList(result) {
        let resultHtml = ``;
        for (const round of result) {
            resultHtml += `<section class="blockTournamentRound">
                               <h3 class="blockTournamentList_title unitTitle1">${round.round} round</h3>
                               <div class="blockTournamentRound_listMatch listLineDivide">`;
            for (const match of round.matches) {
                const avatar1 = match.avatar1 ? match.avatar1 : `/images/avatar_default.png`;
                const avatar2 = match.avatar2 ? match.avatar2 : `/images/avatar_default.png`;
                resultHtml += `<div class="blockMatch">
                        <section class="blockMatch_player unitMatchPlayer">
                            <header class="unitMatchPlayer_header">
                                <img src="${avatar1}" alt="" width="50" height="50">
                                <h4 class="unitMatchPlayer_title">${match.player1}</h4>
                            </header>
                            <p class="unitMatchPlayer_score">${match.score1}</p>`
                if (match.winner === match.player1) {
                    resultHtml += `<p class="unitMatchPlayer_result">win</p>`;
                }
                resultHtml += `</section>
                        <p class="blockMatch_vs">VS</p>
                        <section class="blockMatch_player unitMatchPlayer">
                            <header class="unitMatchPlayer_header">
                                <img src="${avatar2}" alt="" width="50" height="50">
                                <h4 class="unitMatchPlayer_title">${match.player2}</h4>
                            </header>
                            <p class="unitMatchPlayer_score">${match.score2}</p>`
                if (match.winner === match.player2) {
                    resultHtml += `<p class="unitMatchPlayer_result">win</p>`;
                }
                resultHtml += `</section>
                    </div>`;
            }
            resultHtml += `</div>
                </section>`;
        }

        return resultHtml;
    }

    destroy() {
        TournamentDetail.instance = null;
        super.destroy();
    }
}

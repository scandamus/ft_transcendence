'use strict';

import PageBase from './PageBase.js';
import { showModalEntryTournament, showModalSendMatchRequest } from "../modules/modal.js";
import { labels } from '../modules/labels.js';

export default class TournamentDetail extends PageBase {
    constructor(params) {
        super(params);
        TournamentDetail.instance = this;
        this.title = 'TournamentTitle1';
        this.setTitle(this.title);
        this.breadcrumbLinks.push({ href: '/tournament', text: 'tournament' });
        this.generateBreadcrumb(this.title, this.breadcrumbLinks);
    }

    async renderHtml() {
        return `
            <div class="wrapTournament">
                <p class="blockTournamentStart">2024/07/3 13:00 START</p>
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
                <section class="blockTournamentRound">
                    <h3 class="blockTournamentList_title unitTitle1">final round</h3>
                    <div class="blockTournamentRound_listMatch listLineDivide">
                        <div class="blockTournamentMatch">
                            <section class="blockTournamentMatch_player unitMatchPlayer">
                                <header class="unitMatchPlayer_header">
                                    <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                    <h4 class="unitMatchPlayer_title">username</h4>
                                </header>
                                <p class="unitMatchPlayer_score">10</p>
                                <p class="unitMatchPlayer_result">win</p>
                            </section>
                            <p class="blockTournamentMatch_vs">VS</p>
                            <section class="blockTournamentMatch_player unitMatchPlayer">
                                <header class="unitMatchPlayer_header">
                                    <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                    <h4 class="unitMatchPlayer_title">01234567890123456789012345678901</h4>
                                </header>
                                <p class="unitMatchPlayer_score">3</p>
                            </section>
                        </div>
                        <div class="blockTournamentMatch">
                            <section class="blockTournamentMatch_player unitMatchPlayer">
                                <header class="unitMatchPlayer_header">
                                    <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                    <h4 class="unitMatchPlayer_title">01234567890123456789012345678901</h4>
                                </header>
                                <p class="unitMatchPlayer_score">5</p>
                            </section>
                            <p class="blockTournamentMatch_vs">VS</p>
                            <section class="blockTournamentMatch_player unitMatchPlayer">
                                <header class="unitMatchPlayer_header">
                                    <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                    <h4 class="unitMatchPlayer_title">username</h4>
                                </header>
                                <p class="unitMatchPlayer_score">10</p>
                                <p class="unitMatchPlayer_result">win</p>
                            </section>
                        </div>
                    </div>
                </section>
                <section class="blockTournamentRound">
                    <h3 class="blockTournamentList_title unitTitle1">second round</h3>
                    <div class="blockTournamentRound_listMatch listLineDivide">
                        <div class="blockTournamentMatch">
                            <section class="blockTournamentMatch_player unitMatchPlayer">
                                <header class="unitMatchPlayer_header">
                                    <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                    <h4 class="unitMatchPlayer_title">username</h4>
                                </header>
                                <p class="unitMatchPlayer_score">10</p>
                                <p class="unitMatchPlayer_result">win</p>
                            </section>
                            <p class="blockTournamentMatch_vs">VS</p>
                            <section class="blockTournamentMatch_player unitMatchPlayer">
                                <header class="unitMatchPlayer_header">
                                    <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                    <h4 class="unitMatchPlayer_title">01234567890123456789012345678901</h4>
                                </header>
                                <p class="unitMatchPlayer_score">3</p>
                            </section>
                        </div>
                        <div class="blockTournamentMatch">
                            <section class="blockTournamentMatch_player unitMatchPlayer">
                                <header class="unitMatchPlayer_header">
                                    <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                    <h4 class="unitMatchPlayer_title">01234567890123456789012345678901</h4>
                                </header>
                                <p class="unitMatchPlayer_score">5</p>
                            </section>
                            <p class="blockTournamentMatch_vs">VS</p>
                            <section class="blockTournamentMatch_player unitMatchPlayer">
                                <header class="unitMatchPlayer_header">
                                    <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                    <h4 class="unitMatchPlayer_title">username</h4>
                                </header>
                                <p class="unitMatchPlayer_score">10</p>
                                <p class="unitMatchPlayer_result">win</p>
                            </section>
                        </div>
                        <div class="blockTournamentMatch">
                            <section class="blockTournamentMatch_player unitMatchPlayer">
                                <header class="unitMatchPlayer_header">
                                    <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                    <h4 class="unitMatchPlayer_title">01234567890123456789012345678901</h4>
                                </header>
                                <p class="unitMatchPlayer_score">5</p>
                            </section>
                            <p class="blockTournamentMatch_vs">VS</p>
                            <section class="blockTournamentMatch_player unitMatchPlayer">
                                <header class="unitMatchPlayer_header">
                                    <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                    <h4 class="unitMatchPlayer_title">username</h4>
                                </header>
                                <p class="unitMatchPlayer_score">10</p>
                                <p class="unitMatchPlayer_result">win</p>
                            </section>
                        </div>
                        <div class="blockTournamentMatch">
                            <section class="blockTournamentMatch_player unitMatchPlayer">
                                <header class="unitMatchPlayer_header">
                                    <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                    <h4 class="unitMatchPlayer_title">01234567890123456789012345678901</h4>
                                </header>
                                <p class="unitMatchPlayer_score">5</p>
                            </section>
                            <p class="blockTournamentMatch_vs">VS</p>
                            <section class="blockTournamentMatch_player unitMatchPlayer">
                                <header class="unitMatchPlayer_header">
                                    <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                    <h4 class="unitMatchPlayer_title">username</h4>
                                </header>
                                <p class="unitMatchPlayer_score">10</p>
                                <p class="unitMatchPlayer_result">win</p>
                            </section>
                        </div>
                    </div>
                </section>
                
                <section class="blockTournamentRound">
                    <h3 class="blockTournamentList_title unitTitle1">first round</h3>
                    <div class="blockTournamentRound_listMatch listLineDivide">
                        <div class="blockTournamentMatch">
                            <section class="blockTournamentMatch_player unitMatchPlayer">
                                <header class="unitMatchPlayer_header">
                                    <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                    <h4 class="unitMatchPlayer_title">username</h4>
                                </header>
                                <p class="unitMatchPlayer_score">10</p>
                                <p class="unitMatchPlayer_result">win</p>
                            </section>
                            <p class="blockTournamentMatch_vs">VS</p>
                            <section class="blockTournamentMatch_player unitMatchPlayer">
                                <header class="unitMatchPlayer_header">
                                    <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                    <h4 class="unitMatchPlayer_title">01234567890123456789012345678901</h4>
                                </header>
                                <p class="unitMatchPlayer_score">3</p>
                            </section>
                        </div>
                        <div class="blockTournamentMatch">
                            <section class="blockTournamentMatch_player unitMatchPlayer">
                                <header class="unitMatchPlayer_header">
                                    <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                    <h4 class="unitMatchPlayer_title">01234567890123456789012345678901</h4>
                                </header>
                                <p class="unitMatchPlayer_score">5</p>
                            </section>
                            <p class="blockTournamentMatch_vs">VS</p>
                            <section class="blockTournamentMatch_player unitMatchPlayer">
                                <header class="unitMatchPlayer_header">
                                    <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                    <h4 class="unitMatchPlayer_title">username</h4>
                                </header>
                                <p class="unitMatchPlayer_score">10</p>
                                <p class="unitMatchPlayer_result">win</p>
                            </section>
                        </div>
                        <div class="blockTournamentMatch">
                            <section class="blockTournamentMatch_player unitMatchPlayer">
                                <header class="unitMatchPlayer_header">
                                    <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                    <h4 class="unitMatchPlayer_title">username</h4>
                                </header>
                                <p class="unitMatchPlayer_score">10</p>
                                <p class="unitMatchPlayer_result">win</p>
                            </section>
                            <p class="blockTournamentMatch_vs">VS</p>
                            <section class="blockTournamentMatch_player unitMatchPlayer">
                                <header class="unitMatchPlayer_header">
                                    <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                    <h4 class="unitMatchPlayer_title">01234567890123456789012345678901</h4>
                                </header>
                                <p class="unitMatchPlayer_score">3</p>
                            </section>
                        </div>
                        <div class="blockTournamentMatch">
                            <section class="blockTournamentMatch_player unitMatchPlayer">
                                <header class="unitMatchPlayer_header">
                                    <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                    <h4 class="unitMatchPlayer_title">01234567890123456789012345678901</h4>
                                </header>
                                <p class="unitMatchPlayer_score">5</p>
                            </section>
                            <p class="blockTournamentMatch_vs">VS</p>
                            <section class="blockTournamentMatch_player unitMatchPlayer">
                                <header class="unitMatchPlayer_header">
                                    <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                    <h4 class="unitMatchPlayer_title">username</h4>
                                </header>
                                <p class="unitMatchPlayer_score">10</p>
                                <p class="unitMatchPlayer_result">win</p>
                            </section>
                        </div>
                        <div class="blockTournamentMatch">
                            <section class="blockTournamentMatch_player unitMatchPlayer">
                                <header class="unitMatchPlayer_header">
                                    <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                    <h4 class="unitMatchPlayer_title">username</h4>
                                </header>
                                <p class="unitMatchPlayer_score">10</p>
                                <p class="unitMatchPlayer_result">win</p>
                            </section>
                            <p class="blockTournamentMatch_vs">VS</p>
                            <section class="blockTournamentMatch_player unitMatchPlayer">
                                <header class="unitMatchPlayer_header">
                                    <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                    <h4 class="unitMatchPlayer_title">01234567890123456789012345678901</h4>
                                </header>
                                <p class="unitMatchPlayer_score">3</p>
                            </section>
                        </div>
                        <div class="blockTournamentMatch">
                            <section class="blockTournamentMatch_player unitMatchPlayer">
                                <header class="unitMatchPlayer_header">
                                    <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                    <h4 class="unitMatchPlayer_title">01234567890123456789012345678901</h4>
                                </header>
                                <p class="unitMatchPlayer_score">5</p>
                            </section>
                            <p class="blockTournamentMatch_vs">VS</p>
                            <section class="blockTournamentMatch_player unitMatchPlayer">
                                <header class="unitMatchPlayer_header">
                                    <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                    <h4 class="unitMatchPlayer_title">username</h4>
                                </header>
                                <p class="unitMatchPlayer_score">10</p>
                                <p class="unitMatchPlayer_result">win</p>
                            </section>
                        </div>
                        <div class="blockTournamentMatch">
                            <section class="blockTournamentMatch_player unitMatchPlayer">
                                <header class="unitMatchPlayer_header">
                                    <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                    <h4 class="unitMatchPlayer_title">username</h4>
                                </header>
                                <p class="unitMatchPlayer_score">10</p>
                                <p class="unitMatchPlayer_result">win</p>
                            </section>
                            <p class="blockTournamentMatch_vs">VS</p>
                            <section class="blockTournamentMatch_player unitMatchPlayer">
                                <header class="unitMatchPlayer_header">
                                    <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                    <h4 class="unitMatchPlayer_title">01234567890123456789012345678901</h4>
                                </header>
                                <p class="unitMatchPlayer_score">3</p>
                            </section>
                        </div>
                        <div class="blockTournamentMatch">
                            <section class="blockTournamentMatch_player unitMatchPlayer">
                                <header class="unitMatchPlayer_header">
                                    <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                    <h4 class="unitMatchPlayer_title">01234567890123456789012345678901</h4>
                                </header>
                                <p class="unitMatchPlayer_score">5</p>
                            </section>
                            <p class="blockTournamentMatch_vs">VS</p>
                            <section class="blockTournamentMatch_player unitMatchPlayer">
                                <header class="unitMatchPlayer_header">
                                    <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                    <h4 class="unitMatchPlayer_title">username</h4>
                                </header>
                                <p class="unitMatchPlayer_score">10</p>
                                <p class="unitMatchPlayer_result">win</p>
                            </section>
                        </div>
                        <section class="blockSeededPlayer">
                            <h4 class="blockSeededPlayer_title">Seeded player</h4>
                            <p class="blockSeededPlayer_player">
                                <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                <span>username</span>
                            </p>
                        </section>
                    </div>
                </section>
            </div>
        `;
    }

    destroy() {
        super.destroy();
    }
}

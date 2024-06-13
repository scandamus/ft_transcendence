'use strict';

import PageBase from './PageBase.js';
import { showModalEntryTournament, showModalSendMatchRequest } from "../modules/modal.js";

export default class extends PageBase {
    constructor(params) {
        super(params);
        this.setTitle('TournamentTitle1');
        this.labelTitleRecent = 'Recent';
    }

    async renderHtml() {
        return `
            <div class="wrapTournament">
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
                <li><a href="/" data-link>dashboard</a></li>
                <li><a href="/tournament" data-link>Tournament</a></li>
                <li>unitTournament_title</li>
            </ol>
        `;
    }
}

'use strict';

import PageBase from './PageBase.js';

export default class extends PageBase {
    constructor(params) {
        super(params);
        this.userName = 'user1';
        this.setTitle(`USER: ${this.userName}`);
    }

    async renderHtml() {
        return `
            <div class="blockPlayerDetail">
                <div class="blockPlayerDetail_profile">
                    <p class="blockPlayerDetail_thumb thumb"><img src="//ui-avatars.com/api/?name=Gg Hh&background=872bac&color=ffffff" alt="" width="200" height="200"></p>
                    <p class="blockPlayerDetail_score unitBox">RANK: 4 <br>(70勝20敗)</p>
                </div>
                <ul class="blockPlayerDetail_log logTournament">
                    <li class="logTournament_item"><strong>RANK: 4</strong> <span>(2024/4/2 tournament52)</span></li>
                    <li class="logTournament_item"><strong>RANK: 6</strong> <span>(2024/4/1 tournament45)</span></li>
                    <li class="logTournament_item"><strong>RANK: 4</strong> <span>(2024/3/24 tournament42)</span></li>
                    <li class="logTournament_item"><strong>RANK: 1</strong> <span>(2024/3/10 tournament40)</span></li>
                    <li class="logTournament_item"><strong>RANK: 3</strong> <span>(2024/2/8 tournament36)</span></li>
                    <li class="logTournament_item"><strong>RANK: 4</strong> <span>(2024/2/8 tournament30)</span></li>
                    <li class="logTournament_item"><strong>RANK: 4</strong> <span>(2024/1/26 tournament25)</span></li>
                    <li class="logTournament_item"><strong>RANK: 4</strong> <span>(2024/1/24 tournament22)</span></li>
                    <li class="logTournament_item"><strong>RANK: 4</strong> <span>(2024/1/20 tournament18)</span></li>
                    <li class="logTournament_item"><strong>RANK: 10</strong> <span>(2024/1/16 tournament12)</span></li>
                    <li class="logTournament_item"><strong>RANK: 4</strong> <span>(2024/1/12 tournament7)</span></li>
                    <li class="logTournament_item"><strong>RANK: 1</strong> <span>(2024/1/11 tournament5)</span></li>
                    <li class="logTournament_item"><strong>RANK: 4</strong> <span>(2024/1/10 tournament3)</span></li>
                    <li class="logTournament_item"><strong>RANK: 2</strong> <span>(2024/1/5 tournament2)</span></li>
                    <li class="logTournament_item"><strong>RANK: 4</strong> <span>(2024/1/1 tournament1)</span></li>
                </ul>
            </div>
        `;
    }
}

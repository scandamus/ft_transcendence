'use strict';

import PageBase from './PageBase.js';
import { showModalWaitForOpponent } from "../modules/modal.js";
import { labels } from '../modules/labels.js';

export default class Lounge extends PageBase {
    constructor(params) {
        super(params);
        Lounge.instance = this;
        this.setTitle(labels.lounge.title);
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.listenCreateRoom.bind(this));

        //Instance固有のlistenerList
        this.listListenPongMatchRequest = [];
        this.listListenPong4MatchRequest = [];
    }

    async renderHtml() {
        return `
            <div class="blockMatch">
                <div class="blockMatch_listWrap">
                    <h3 class="blockMatch_title unitTitle1">Lounge</h3>
                    <div class="blockMatch_list listMatch listLineDivide">
                        <div class="unitMatch unitMatch-dual">
                            <ul class="unitMatch_button unitListBtn unitListBtn-horizontal">
                                <li><button type="button" class="unitFriendButton_matchRequest unitButton" id="dualGameButton">2人対戦</button></li>
                            </ul>
                        </div>
                        <div class="unitMatch unitMatch-quad">
                            <ul class="unitMatch_button unitListBtn unitListBtn-horizontal">
                                <li><button type="button" class="unitFriendButton_matchRequest unitButton" id="quadGameButton">4人対戦</button></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <ol class="breadcrumb">
                <li><a href="/">${labels.dashboard.title}</a></li>
                <li>${labels.lounge.title}</li>
            </ol>
        `;
    }

    listenCreateRoom() {
        const dualGameButton = document.getElementById('dualGameButton');
        const quadGameButton = document.getElementById('quadGameButton');
        
        const boundShowModalWaitForOpponent = showModalWaitForOpponent.bind(this);
        
        dualGameButton.addEventListener('click', boundShowModalWaitForOpponent);
        quadGameButton.addEventListener('click', boundShowModalWaitForOpponent);
        
        this.addListListenInInstance(dualGameButton, boundShowModalWaitForOpponent, 'click');
        this.addListListenInInstance(quadGameButton, boundShowModalWaitForOpponent, 'click');
    }

    destroy() {
        super.destroy();
    }
}
'use strict';

import PageBase from './PageBase.js';
import { showModalWaitForOpponent } from "../modules/modal.js";

export default class Lounge extends PageBase {
    constructor(params) {
        super(params);
        Lounge.instance = this;
        this.setTitle('Lounge');
        this.labelMatch = 'ルームに入る';
        this.labelCreateRoom = 'ルーム作成';
        this.labelDualGame = '2人対戦';
        this.labelQuadGame = '4人対戦';
        this.labelCapacity = '定員';
        this.labelAvailable = '募集中';
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.listenCreateRoom.bind(this));
    }

    async renderHtml() {
        return `
            <div class="blockMatch">
                <form class="formCreateRoom blockForm unitBox">
                    <ul class="formCreateRoom_list blockForm_list">
                        <li><input type="radio" id="dualGame" name="gameType" value="dual" checked /><label for="dualGame">${this.labelDualGame}</label></li>
                        <li><input type="radio" id="quadGame" name="gameType" value="quad" /><label for="quadGame">${this.labelQuadGame}</label></li>
                    </ul>
                    <p class="formCreateRoom_button blockForm_button"><button type="button" id="btnCreateRoom" class="unitButton">${this.labelCreateRoom}</button></p>
                </form>
                <div class="blockMatch_listWrap">
                    <h3 class="blockMatch_title unitTitle1">Waiting</h3>
                    <div class="blockMatch_list listMatch listLineDivide">
                    <div class="unitMatch unitMatch-dual">
                        <ul class="unitMatch_capacity unitCapacity">
                            <li class="unitCapacity_numerator">
                                <small>${this.labelAvailable}</small>
                                <span>1</span>
                            </li>
                            <li class="unitCapacity_denominator">
                                <small>${this.labelCapacity}</small>
                                <span>2</span>
                            </li>
                        </ul>
                        <ul class="unitMatch_button unitListBtn unitListBtn-horizontal">
                            <li><button type="button" class="unitFriendButton_matchRequest unitButton">${this.labelMatch}</button></li>
                        </ul>
                    </div>
                    <div class="unitMatch unitMatch-quad">
                        <ul class="unitMatch_capacity unitCapacity">
                            <li class="unitCapacity_numerator">
                                <small>${this.labelAvailable}</small>
                                <span>1</span>
                            </li>
                            <li class="unitCapacity_denominator">
                                <small>${this.labelCapacity}</small>
                                <span>4</span>
                            </li>
                        </ul>
                        <ul class="unitMatch_button unitListBtn unitListBtn-horizontal">
                            <li><button type="button" class="unitFriendButton_matchRequest unitButton">${this.labelMatch}</button></li>
                        </ul>
                    </div>
                    <div class="unitMatch unitMatch-quad">
                        <ul class="unitMatch_capacity unitCapacity">
                            <li class="unitCapacity_numerator">
                                <small>${this.labelAvailable}</small>
                                <span>1</span>
                            </li>
                            <li class="unitCapacity_denominator">
                                <small>${this.labelCapacity}</small>
                                <span>4</span>
                            </li>
                        </ul>
                        <ul class="unitMatch_button unitListBtn unitListBtn-horizontal">
                            <li><button type="button" class="unitFriendButton_matchRequest unitButton">${this.labelMatch}</button></li>
                        </ul>
                    </div>
                    <div class="unitMatch unitMatch-dual">
                        <ul class="unitMatch_capacity unitCapacity">
                            <li class="unitCapacity_numerator">
                                <small>${this.labelAvailable}</small>
                                <span>1</span>
                            </li>
                            <li class="unitCapacity_denominator">
                                <small>${this.labelCapacity}</small>
                                <span>2</span>
                            </li>
                        </ul>
                        <ul class="unitMatch_button unitListBtn unitListBtn-horizontal">
                            <li><button type="button" class="unitFriendButton_matchRequest unitButton">${this.labelMatch}</button></li>
                        </ul>
                    </div>
                </div>
                </div>
            </section>
            <ol class="breadcrumb">
            <li><a href="/">dashboard</a></li>
            <li>Lounge</li>
            </ol>
        `;
    }

    listenCreateRoom() {
        const btnCreateRoom = document.getElementById('btnCreateRoom');
        const boundShowModalWaitForOpponent = showModalWaitForOpponent.bind(this);
        this.addListListenInInstance(btnCreateRoom, boundShowModalWaitForOpponent, 'click');
    }

    destroy() {
        super.destroy();
    }
}

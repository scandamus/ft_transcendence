'use strict';

import PageBase from './PageBase.js';
import { showModalWaitForOpponent } from "../modules/modal.js";
import { labels } from '../modules/labels.js';

export default class extends PageBase {
    constructor(params) {
        super(params);
        this.setTitle(labels.lounge.title);
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.listenCreateRoom.bind(this));
    }

    async renderHtml() {
        return `
            <div class="blockMatch">
                <form class="formCreateRoom blockForm unitBox">
                    <ul class="formCreateRoom_list blockForm_list">
                        <li><input type="radio" id="dualGame" name="gameType" value="dual" checked /><label for="dualGame">${labels.lounge.labelDualGame}</label></li>
                        <li><input type="radio" id="quadGame" name="gameType" value="quad" /><label for="quadGame">${labels.lounge.labelQuadGame}</label></li>
                    </ul>
                    <p class="formCreateRoom_button blockForm_button"><button type="button" id="btnCreateRoom" class="unitButton">${labels.lounge.labelCreateRoom}</button></p>
                </form>
                <div class="blockMatch_listWrap">
                    <h3 class="blockMatch_title unitTitle1">${labels.lounge.labelWaiting}</h3>
                    <div class="blockMatch_list listMatch listLineDivide">
                    <div class="unitMatch unitMatch-dual">
                        <ul class="unitMatch_capacity unitCapacity">
                            <li class="unitCapacity_numerator">
                                <small>${labels.lounge.labelAvailable}</small>
                                <span>${1}</span>
                            </li>
                            <li class="unitCapacity_denominator">
                                <small>${labels.lounge.labelCapacity}</small>
                                <span>${2}</span>
                            </li>
                        </ul>
                        <ul class="unitMatch_button unitListBtn unitListBtn-horizontal">
                            <li><button type="button" class="unitFriendButton_matchRequest unitButton">${labels.lounge.labelMatch}</button></li>
                        </ul>
                    </div>
                    <div class="unitMatch unitMatch-quad">
                        <ul class="unitMatch_capacity unitCapacity">
                            <li class="unitCapacity_numerator">
                                <small>${labels.lounge.labelAvailable}</small>
                                <span>${1}</span>
                            </li>
                            <li class="unitCapacity_denominator">
                                <small>${labels.lounge.labelCapacity}</small>
                                <span>${4}</span>
                            </li>
                        </ul>
                        <ul class="unitMatch_button unitListBtn unitListBtn-horizontal">
                            <li><button type="button" class="unitFriendButton_matchRequest unitButton">${labels.lounge.labelMatch}</button></li>
                        </ul>
                    </div>
                    <div class="unitMatch unitMatch-quad">
                        <ul class="unitMatch_capacity unitCapacity">
                            <li class="unitCapacity_numerator">
                                <small>${labels.lounge.labelAvailable}</small>
                                <span>${1}</span>
                            </li>
                            <li class="unitCapacity_denominator">
                                <small>${labels.lounge.labelCapacity}</small>
                                <span>${4}</span>
                            </li>
                        </ul>
                        <ul class="unitMatch_button unitListBtn unitListBtn-horizontal">
                            <li><button type="button" class="unitFriendButton_matchRequest unitButton">${labels.lounge.labelMatch}</button></li>
                        </ul>
                    </div>
                    <div class="unitMatch unitMatch-dual">
                        <ul class="unitMatch_capacity unitCapacity">
                            <li class="unitCapacity_numerator">
                                <small>${labels.lounge.labelAvailable}</small>
                                <span>${1}</span>
                            </li>
                            <li class="unitCapacity_denominator">
                                <small>${labels.lounge.labelCapacity}</small>
                                <span>${2}</span>
                            </li>
                        </ul>
                        <ul class="unitMatch_button unitListBtn unitListBtn-horizontal">
                            <li><button type="button" class="unitFriendButton_matchRequest unitButton">${labels.lounge.labelMatch}</button></li>
                        </ul>
                    </div>
                </div>
                </div>
            </section>
            <ol class="breadcrumb">
            <li><a href="/">${labels.dashboard.title}</a></li>
            <li>${labels.lounge.title}</li>
            </ol>
        `;
    }

    listenCreateRoom() {
        const btnCreateRoom = document.getElementById('btnCreateRoom');
        btnCreateRoom.addEventListener('click', showModalWaitForOpponent.bind(this));
        this.addListenEvent(btnCreateRoom, showModalWaitForOpponent, 'click');
    }
}

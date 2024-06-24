'use strict';

import PageBase from './PageBase.js';
import { showModalWaitForOpponent } from "../modules/modal.js";

export default class extends PageBase {
    constructor(params) {
        super(params);

        this.title = 'Lounge';
        this.labelMatch = '参加';
        this.labelDualGame = '2人対戦';
        this.labelQuadGame = '4人対戦';

        this.setTitle(this.title);
        this.generateBreadcrumb(this.title, this.breadcrumbLinks);

        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.listenJoinDual.bind(this));
        this.addAfterRenderHandler(this.listenJoinQuad.bind(this));
    }

    async renderHtml() {
        return `
            <div class="blockLounge">
                <section class="blockLoungeRoom">
                    <form class="blockForm unitBox">
                        <h3 class="blockLoungeRoom_title">${this.labelDualGame}</h3>
                        <p class="blockLoungeRoom_button blockForm_button"><button type="button" id="btnJoinDual" class="unitButton unitButton-large">${this.labelMatch}</button></p>
                    </form>
                </section>
                <section class="blockLoungeRoom">
                    <form class="blockForm unitBox">
                        <h3 class="blockLoungeRoom_title">${this.labelQuadGame}</h3>
                        <div class="blockLoungeRoom_body">
                        <p class="blockLoungeRoom_button blockForm_button"><button type="button" id="btnJoinQuad" class="unitButton unitButton-large">${this.labelMatch}</button></p>
                        </div>
                    </form>
                </section>
            </div>
        `;
    }

    listenJoinDual() {
        const btnJoinDual = document.getElementById('btnJoinDual');
        btnJoinDual.addEventListener('click', showModalWaitForOpponent.bind(this));
        this.addListenEvent(btnJoinDual, showModalWaitForOpponent, 'click');
    }

    listenJoinQuad() {
        const btnJoinQuad = document.getElementById('btnJoinQuad');
        btnJoinQuad.addEventListener('click', showModalWaitForOpponent.bind(this));
        this.addListenEvent(btnJoinQuad, showModalWaitForOpponent, 'click');
    }
}

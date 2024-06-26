'use strict';

import PageBase from './PageBase.js';
import { showModalWaitForOpponent } from "../modules/modal.js";
import { labels } from '../modules/labels.js';

export default class Lounge extends PageBase {
    constructor(params) {
        super(params);
        Lounge.instance = this;
        this.title = 'Lounge';
        this.setTitle(labels.lounge.title);
        this.generateBreadcrumb(this.title, this.breadcrumbLinks);

        this.labelMatch = '参加';

        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.listenJoinDual.bind(this));
        this.addAfterRenderHandler(this.listenJoinQuad.bind(this));
    }

    async renderHtml() {
        return `
            <div class="blockLounge">
                <section class="blockLoungeRoom">
                    <form class="blockForm unitBox">
                        <h3 class="blockLoungeRoom_title">${labels.lounge.labelDualGame}</h3>
                        <input type="hidden" name="gameType" value="dual">
                        <p class="blockLoungeRoom_button blockForm_button"><button type="button" id="btnJoinDual" class="unitButton unitButton-large">${this.labelMatch}</button></p>
                    </form>
                </section>
                <section class="blockLoungeRoom">
                    <form class="blockForm unitBox">
                        <h3 class="blockLoungeRoom_title">${labels.lounge.labelQuadGame}</h3>
                        <input type="hidden" name="gameType" value="quad">
                        <p class="blockLoungeRoom_button blockForm_button"><button type="button" id="btnJoinQuad" class="unitButton unitButton-large">${this.labelMatch}</button></p>
                    </form>
                </section>
            </div>
        `;
    }

    listenJoinDual() {
        const btnJoinDual = document.getElementById('btnJoinDual');
        const boundShowModalWaitForOpponent = showModalWaitForOpponent.bind(this);
        this.addListListenInInstance(btnJoinDual, boundShowModalWaitForOpponent, 'click');
    }

    listenJoinQuad() {
        const btnJoinQuad = document.getElementById('btnJoinQuad');
        const boundShowModalWaitForOpponent = showModalWaitForOpponent.bind(this);
        this.addListListenInInstance(btnJoinQuad, boundShowModalWaitForOpponent, 'click');
    }

    destroy() {
        super.destroy();
    }
}

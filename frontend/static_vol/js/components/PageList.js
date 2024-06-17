'use strict';

import PageBase from './PageBase.js';
import { showModalReceiveMatchRequest } from '../modules/modal.js';

export default class extends PageBase {
    constructor(params) {
        super(params);

        this.title = 'PageList';

        this.setTitle(this.title);

        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.listenReceiveReqMatch.bind(this));
    }

    async renderHtml() {
        return `
            <ul style="font-size: 2rem">
                <li><a href="/" data-link>login</a></li>
                <li><a href="/register" data-link>SIGN UP</a></li>
                <li><a href="/register/confirm" data-link>SIGN UP - confirm</a></li>
                <li><a href="/register/complete" data-link>SIGN UP - complete</a></li>
                <li><a href="/dashboard" data-link>dashboard</a></li>
                <li><a href="/friends" data-link>friends</a></li>
                <li><a href="/game/play" data-link>game(play)</a></li>
                <li><a href="/game/match" data-link>game(match)</a></li>
                <li><a href="/tournament" data-link>tournament</a></li>
                <li><a href="/tournament/detail_id" data-link>tournament_detail</a></li>
            </ul>
            <ul>
                <li><button type="submit" class="unitFriendButton_receiveReqMatch unitButton" data-name="username" data-avatar="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff">対戦を受ける</button></li>
            </ul>
        `;
    }


    listenReceiveReqMatch() {
        const btnMatchRequest = document.querySelectorAll('.unitFriendButton_receiveReqMatch');
        btnMatchRequest.forEach((btn) => {
            btn.addEventListener('click', showModalReceiveMatchRequest.bind(this));
            this.addListenEvent(btn, showModalReceiveMatchRequest, 'click');
        });
    }
}

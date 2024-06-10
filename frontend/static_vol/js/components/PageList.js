'use strict';

import PageBase from './PageBase.js';
import { showModalReceiveReqMatch } from '../modules/modal.js';

export default class extends PageBase {
    constructor(params) {
        super(params);
        this.setTitle('PageList');
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.listenReceiveReqMatch.bind(this));
    }

    async renderHtml() {
        return `
            <ul>
                <li><a href="/" data-link>login</a></li>
                <li><a href="/register" data-link>SIGN UP</a></li>
                <li><a href="/register/confirm" data-link>SIGN UP - confirm</a></li>
                <li><a href="/register/complete" data-link>SIGN UP - complete</a></li>
                <li><a href="/dashboard" data-link>dashboard</a></li>
                <li><a href="/friends" data-link>friends</a></li>
                <li><a href="/game/play" data-link>game(play)</a></li>
                <li><a href="/game/match" data-link>game(match)</a></li>
                <li><a href="/tournament" data-link>tournament</a></li>
            </ul>
            <ul>
                <li><button type="submit" class="unitFriendButton_receiveReqMatch unitButton" data-name="username" data-avatar="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff">対戦を受ける</button></li>
            </ul>
        `;
    }


    listenReceiveReqMatch() {
        const btnMatchRequest = document.querySelectorAll('.unitFriendButton_receiveReqMatch');
        btnMatchRequest.forEach((btn) => {
            btn.addEventListener('click', showModalReceiveReqMatch.bind(this));
            this.addListenEvent(btn, showModalReceiveReqMatch, 'click');
        });
    }
}

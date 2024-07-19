'use strict';

import PageBase from './PageBase.js';
import { showModalReceiveMatchRequest } from '../modules/modal.js';
import { labels } from '../modules/labels.js';

export default class PageList extends PageBase {
    static instance = null;

    constructor(params) {
        if (PageList.instance) {
            return PageList.instance;
        }
        super(params);
        PageList.instance = this;
        this.title = 'PageList';
        this.setTitle(this.title);
        this.clearBreadcrumb();

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
                <li><a href="/tournament/detail:1" data-link>tournament_detail</a></li>
            </ul>
            <ul>
                <li><button type="submit" class="unitFriendButton_receiveReqMatch unitButton" data-name="username" data-avatar="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff">${labels.friends.labelReceiveMatch}</button></li>
            </ul>
        `;
    }


    listenReceiveReqMatch() {
        const btnMatchRequest = document.querySelectorAll('.unitFriendButton_receiveReqMatch');
        const boundShowModalReceiveMatchRequest = showModalReceiveMatchRequest.bind(this)
        btnMatchRequest.forEach((btn) => {
            this.addListListenInInstance(btn, boundShowModalReceiveMatchRequest, 'click');
        });
    }

    destroy() {
        PageList.instance = null;
        super.destroy();
    }
}

'use strict';

import PageBase from './PageBase.js';

export default class extends PageBase {
    constructor(params) {
        super(params);
        this.setTitle('PageList');
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
                <li><a href="/tournament/entry" data-link>tournament(entry)</a></li>
<!--            <li><a href="/tournament/entry/input" data-link>tournament(entry-input)</a></li>-->
                <li><a href="/tournament/match" data-link>tournament(match)</a></li>
            </ul>
        `;
    }
}

"use strict";

import PageBase from "./PageBase.js";

export default class extends PageBase {
    constructor(params) {
        super(params);
        this.setTitle("PageList");
    }

    async getHtml() {
        return `
            <ul>
                <li><a href="/" data-link>login</a></li>
                <li><a href="/register" data-link>user(register)</a></li>
                <li><a href="/register/confirm" data-link>user(register - confirm)</a></li>
                <li><a href="/register/complete" data-link>user(register - complete)</a></li>
                <li><a href="/user" data-link>user</a></li>
                <li><a href="/game/play" data-link>game(play)</a></li>
                <li><a href="/game/match" data-link>game(match)</a></li>
                <li><a href="/tournament/entry" data-link>tournament(entry)</a></li>
<!--            <li><a href="/tournament/entry/input" data-link>tournament(entry-input)</a></li>-->
                <li><a href="/tournament/match" data-link>tournament(match)</a></li>
            </ul>
        `;
    }
}
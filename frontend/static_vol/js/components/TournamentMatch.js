"use strict";

import PageBase from "./PageBase.js";

export default class extends PageBase {
    constructor(params) {
        super(params);
        this.setTitle("TournamentMatch");
    }

    async getHtml() {
        return `
            <p>TournamentMatch</p>
        `;
    }
}
"use strict";

export default class {
    constructor(params) {
        this.params = params;
    }

    setTitle(title) {
        document.title = title;
        document.querySelector('.mainContainerHeader_title').innerText = title;
    }

    async getHtml() {
        return "";
    }
}

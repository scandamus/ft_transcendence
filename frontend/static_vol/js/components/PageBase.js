"use strict";

export default class {
    constructor(params) {
        this.params = params;
        this.afterRenderHandlers = [];
    }

    setTitle(title) {
        document.title = title;
        document.querySelector('.mainContainerHeader_title').innerText = title;
    }

    async renderHtml() {
        return "";
    }

    //renderHtml後にafterRenderHandlersに登録されたmethodを実行
    afterRender() {
        this.afterRenderHandlers.forEach(handler => handler());
    }

    //継承クラスでafterRenderHandlersにmethodをpushする際に使う
    addAfterRenderHandler(handler) {
        this.afterRenderHandlers.push(handler);
    }
}

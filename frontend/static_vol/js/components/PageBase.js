'use strict';

import { addNoticeMod, removeNoticeMod } from "../modules/notice.js";

export default class PageBase {
    static instance = null;

    constructor(params) {
        PageBase.instance = this;
        this.params = params;
        this.listAfterRenderHandlers = [];
        this.listEventListeners = [];
    }

    setTitle(title) {
        document.title = title;
        document.getElementById('titlePage').innerText = title;
    }

    async renderHtml() {
        return '';
    }

    //renderHtml後にlistAfterRenderHandlersに登録されたmethodを実行
    afterRender() {
        this.listAfterRenderHandlers.forEach(handler => handler());
    }

    //継承クラスでlistAfterRenderHandlersにmethodをpushする際に使う
    addAfterRenderHandler(handler) {
        this.listAfterRenderHandlers.push(handler);
    }


    //継承クラスでeventListenersにmethodをpushする際に使う
    addListenEvent(el, cb, ev) {
        this.listEventListeners.push({element: el, callback: cb, event: ev});
    }

    // eventListeners解除
    // todo:解除確認
    destroy() {
        this.listEventListeners.forEach(listener => {
            listener.element.removeEventListener(listener.event, listener.callback);
        });
        // if (this.listEventListeners.length === 0)
        //     console.log('Listeners all clear')
        // else
        //     console.log('Listeners' + this.listEventListeners.length + 'left')
    }

    addNotice (message, isError) {
        addNoticeMod(message, isError)
            .then((elNotice) => {
                removeNoticeMod(elNotice);
            })
            .catch(error => {
                console.error('addNotice failed:', error);
            })
    }
}

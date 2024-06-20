'use strict';

import { linkSpa } from "../modules/router.js";

export default class PageBase {
    static instance = null;

    constructor(params) {
        PageBase.instance = this;
        this.params = params;
        this.listAfterRenderHandlers = [];
        this.listListenInInstance = [];
        this.addAfterRenderHandler(this.addListenLinkPages.bind(this));
    }

    setTitle(title) {
        document.title = title;
        document.getElementById('titlePage').innerText = title;
    }

    static isInstance(instance, className) {
        return (instance &&
                instance.constructor.name === className);
    }

    addListenLinkPages() {
        const linkPages = document.querySelectorAll('#app a[data-link]');
        linkPages.forEach((linkPage) => {
            this.addListListenInInstance(linkPage, linkSpa, 'click');
        });
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
    addListListenInInstance(el, cb, ev) {
        el.addEventListener(ev, cb);
        this.listListenInInstance.push({element: el, callback: cb, event: ev});
    }

    destroy() {
        // remove eventListeners
        let countListen = this.listListenInInstance.length;
        console.log(`/*/ destroy:this.listListenInInstance.length: ${countListen}`);
        this.listListenInInstance.forEach(listener => {
            console.log(`/*/*/ removeEventListener ${listener.element} ${listener.event}`)
            listener.element.removeEventListener(listener.event, listener.callback);
            countListen--;
        });
        if (countListen === 0) {
            console.log(`/*/*/*/ destroy:All event listeners have been removed. countListen:${countListen}`);
        } else {
            console.log(`/*/*/!!!!!/*/*/ destroy:Event listeners remain. countListen:${countListen}`);
        }

        // clear ar
        this.listAfterRenderHandlers = [];
        this.listListenInInstance = [];

        // delete instance
        PageBase.instance = null;
    }
}

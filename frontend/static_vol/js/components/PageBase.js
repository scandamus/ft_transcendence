'use strict';

import { addLinkPageEvClick } from "../modules/router.js";

export default class PageBase {
    static instance = null;

    constructor(params) {
        PageBase.instance = this;
        this.params = params;
        this.listAfterRenderHandlers = [];
        this.listEventListeners = [];
        this.title = '';
        this.breadcrumbLinks = [
            { href: '/', text: 'dashboard' }
        ];
    }

    setTitle(title) {
        document.title = title;
        document.getElementById('titlePage').innerText = title;
    }

    generateBreadcrumb(title, breadcrumbLinks) {
        const breadcrumbWrapper = document.getElementById('navBreadcrumb');
        let olHtml = '<ol class="breadcrumb">';
        breadcrumbLinks.forEach((link, index) => {
            olHtml += `<li><a href="${link.href}" data-link>${link.text}</a></li>`;
        });
        olHtml += `<li>${title}</li>`
        olHtml += '</ol>';
        breadcrumbWrapper.innerHTML = olHtml;
        const linkBreadcrumb = document.querySelectorAll('#navBreadcrumb a[data-link]');
        addLinkPageEvClick(linkBreadcrumb);
    }

    clearBreadcrumb() {
        const breadcrumbWrapper = document.getElementById('navBreadcrumb');
        breadcrumbWrapper.innerHTML = '';
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
}

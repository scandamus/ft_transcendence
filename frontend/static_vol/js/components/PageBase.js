'use strict';

import { addLinkPageEvClick } from "../modules/router.js";
import { linkSpa } from "../modules/router.js";

export default class PageBase {
    constructor(params) {
        PageBase.instance = this;
        this.params = params;
        this.title = '';
        this.breadcrumbLinks = [
            { href: '/dashboard', text: 'dashboard' }
        ];
        this.listAfterRenderHandlers = [];
        this.listListenInInstance = [];
        this.addAfterRenderHandler(this.addListenLinkPages.bind(this));
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

    //継承クラスでaddListenerのうえthis.listListenInInstanceにpushする際に使う
    addListListenInInstance(el, cb, ev) {
        el.addEventListener(ev, cb);
        this.listListenInInstance.push({element: el, callback: cb, event: ev});
    }

    addListListenOptOnesInInstance(el, cb, ev) {
        el.addEventListener(ev, cb, { once: true });
        this.listListenInInstance.push({element: el, callback: cb, event: ev});
    }

    destroy() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

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

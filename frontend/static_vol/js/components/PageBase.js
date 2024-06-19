'use strict';

export default class PageBase {
    static instance = null;

    constructor(params) {
        PageBase.instance = this;
        this.params = params;
        this.listAfterRenderHandlers = [];
        this.listListenInInstance = [];
    }

    setTitle(title) {
        document.title = title;
        document.getElementById('titlePage').innerText = title;
    }

    static isInstance(instance, className) {
        return (instance &&
                instance.constructor.name === className);
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
        console.log(`/*/*/ addListListenInInstance: ${this.listListenInInstance.length} `)
    }

    // eventListeners解除
    // todo:解除確認
    destroy() {
        //console.log(`/*/*/ destroy: ${this.listListenInInstance.length} `)
        this.listListenInInstance.forEach(listener => {
            //console.log(`/*/*/ removeEventListener ${listener.element} ${listener.event}`)
            listener.element.removeEventListener(listener.event, listener.callback);
        });
        PageBase.instance = null;
        // if (this.listListenInInstance.length === 0)
        //     console.log('Listeners all clear')
        // else
        //     console.log('Listeners' + this.listListenInInstance.length + 'left')
    }
}

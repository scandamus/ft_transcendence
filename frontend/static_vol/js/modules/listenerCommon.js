'use strict';

//継承クラスでaddListenerのうえthis.listListenInInstance以外のリストにpushする際に使う
const addListenerToList = (list, el, cb, ev) => {
    el.addEventListener(ev, cb);
    list.push({element: el, callback: cb, event: ev});
}

const removeListenerAndClearList = (list) => {
    let countListen = list.length;
    console.log(`/*/ removeListenerAndClearList:list.length: ${countListen}`);
    list.forEach((listener) => {
        console.log(`/*/*/ removeEventListener ${listener.element} ${listener.event}`)
        listener.element.removeEventListener(listener.event, listener.callback);
        countListen--;
    });
    if (countListen === 0) {
        console.log(`/*/*/*/ removeListenerAndClearList:All event listeners have been removed. countListen:${countListen}`);
    } else {
        console.log(`/*/*/!!!!!/*/*/ removeListenerAndClearList:Event listeners remain. countListen:${countListen}`);
    }
    list = [];
}

export { addListenerToList, removeListenerAndClearList }

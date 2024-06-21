'use strict';

const getCallerName = () => {
    const err = new Error();
    const stack = err.stack.split('\n');
    if (stack.length >= 3) {
        const callerLine = stack[3].trim();
        const match = callerLine.match(/at (\w+)/);
        if (match) {
            return match[1];
        }
    }
    return null;
}

//継承クラスでaddListenerのうえthis.listListenInInstance以外のリストにpushする際に使う
const addListenerToList = (list, el, cb, ev) => {
    el.addEventListener(ev, cb);
    list.push({element: el, callback: cb, event: ev});
}

const removeListenerAndClearList = (list) => {
    let countListen = list.length;
    const CallerName = getCallerName();//for debug
    //console.log(`/*/ removeListenerAndClearList:list.length: ${countListen} / Call from ${CallerName}`);
    list.forEach((listener) => {
        //console.log(`/*/*/ removeEventListener ${listener.element} ${listener.event}`)
        listener.element.removeEventListener(listener.event, listener.callback);
        countListen--;

        //put debug log
        // if (CallerName === 'removeListenMatchRequest') {
        //     console.log(`[removeListenerAndClearList]Removed match request listener from ${listener.element.dataset.username}`);
        // } else if (CallerName === 'removeListenAcceptFriendRequest') {
        //     console.log(`[removeListenerAndClearList]Removed accept friend request listener from ${listener.element.dataset.username}`);
        // } else if (CallerName === 'removeListenDeclineFriendRequest') {
        //     console.log(`[removeListenerAndClearList]Removed decline friend request listener from ${listener.element.dataset.username}`);
        // } else if (CallerName === 'removeListenRemoveFriend') {
        //     console.log(`[removeListenerAndClearList]Removed remove friend listener from ${listener.element.dataset.username}`);
        // }
    });
    if (countListen === 0) {
        console.log(`/*/ [${CallerName}]\nremoveListenerAndClearList:All event listeners have been removed.\ncountListen:${countListen}`);
    } else {
        console.log(`/*/*/!!!!!/*/*/  [${CallerName}]\nremoveListenerAndClearList:Event listeners remain.\ncountListen:${countListen}`);
    }
}

export { addListenerToList, removeListenerAndClearList }

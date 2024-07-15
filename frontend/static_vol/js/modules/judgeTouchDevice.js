'use strict';

const isTouchDevice = () => {
    return 'ontouchstart' in window ||
           navigator.maxTouchPoints > 0 ||
           navigator.msMaxTouchPoints > 0 ||
           window.matchMedia("(pointer: coarse)").matches ||
           ('PointerEvent' in window && (navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0));
}

const resetControlSize = (elCanvas, elControl) => {
    const canvasHeight = elCanvas.getBoundingClientRect().height;
    elControl.style.height = `${canvasHeight - 20}px`;
}

let activeIntervals = {};

const handleButtonControl = (ev) => {
    const key = ev.currentTarget.dataset.key;
    if (ev.type === 'touchstart') {
        if (key) {
            simulateKeyEvent(key, true);
            activeIntervals[key] = setInterval(() => {
                simulateKeyEvent(key, true);
            }, 100); // 繰り返し間隔は100msに設定
        }
    } else if (ev.type === 'touchend' || ev.type === 'touchcancel') {
        if (key && activeIntervals[key]) {
            clearInterval(activeIntervals[key]);
            delete activeIntervals[key];
            simulateKeyEvent(key, false);
        }
    }
}

const simulateKeyEvent = (key, is_pressed) => {
    const event = new KeyboardEvent(is_pressed ? 'keydown' : 'keyup', {
        key: key,
        code: key,
        keyCode: key === 'ArrowUp' ? 38
              : key === 'ArrowDown' ? 40
              : key === 'ArrowLeft' ? 37
              : key === 'ArrowRight' ? 39
              : key.charCodeAt(0),
        which: key === 'ArrowUp' ? 38
              : key === 'ArrowDown' ? 40
              : key === 'ArrowLeft' ? 37
              : key === 'ArrowRight' ? 39
              : key.charCodeAt(0),
        bubbles: true,
        cancelable: true
    });
    document.dispatchEvent(event);
}

const listenButtonControl = (elControl, pageInstance) => {
    const elControlTop = elControl.querySelector('.listButtonControl_btn-top');
    const elControlBottom = elControl.querySelector('.listButtonControl_btn-bottom');
    const elControlLeft = elControl.querySelector('.listButtonControl_btn-left');
    const elControlRight = elControl.querySelector('.listButtonControl_btn-right');

    if (elControlTop) {
        elControlTop.dataset.key = 'ArrowUp';
        pageInstance.addListListenInInstance(elControlTop, handleButtonControl.bind(this), 'touchstart');
        pageInstance.addListListenInInstance(elControlTop, handleButtonControl.bind(this), 'touchend');
        pageInstance.addListListenInInstance(elControlTop, handleButtonControl.bind(this), 'touchcancel');
    }

    if (elControlBottom) {
        elControlBottom.dataset.key = 'ArrowDown';
        pageInstance.addListListenInInstance(elControlBottom, handleButtonControl.bind(this), 'touchstart');
        pageInstance.addListListenInInstance(elControlBottom, handleButtonControl.bind(this), 'touchend');
        pageInstance.addListListenInInstance(elControlBottom, handleButtonControl.bind(this), 'touchcancel');
    }

    if (elControlLeft) {
        elControlLeft.dataset.key = 'ArrowLeft';
        pageInstance.addListListenInInstance(elControlLeft, handleButtonControl.bind(this), 'touchstart');
        pageInstance.addListListenInInstance(elControlLeft, handleButtonControl.bind(this), 'touchend');
        pageInstance.addListListenInInstance(elControlLeft, handleButtonControl.bind(this), 'touchcancel');
    }

    if (elControlRight) {
        elControlRight.dataset.key = 'ArrowRight';
        pageInstance.addListListenInInstance(elControlRight, handleButtonControl.bind(this), 'touchstart');
        pageInstance.addListListenInInstance(elControlRight, handleButtonControl.bind(this), 'touchend');
        pageInstance.addListListenInInstance(elControlRight, handleButtonControl.bind(this), 'touchcancel');
    }
}

export { isTouchDevice, resetControlSize, listenButtonControl };
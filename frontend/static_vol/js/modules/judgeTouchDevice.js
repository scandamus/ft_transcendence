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

const handleButtonControl = (ev) => {
    if (ev.type === 'click') {
        const key = ev.currentTarget.dataset.key;
        if (key) {
            simulateKeyEvent(key, true);
            setTimeout(() => simulateKeyEvent(key, false), 100);
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
        pageInstance.addListListenInInstance(elControlTop, handleButtonControl.bind(this), 'click');
    }

    if (elControlBottom) {
        elControlBottom.dataset.key = 'ArrowDown';
        pageInstance.addListListenInInstance(elControlBottom, handleButtonControl.bind(this), 'click');
    }

    if (elControlLeft) {
        elControlLeft.dataset.key = 'ArrowLeft';
        pageInstance.addListListenInInstance(elControlLeft, handleButtonControl.bind(this), 'click');
    }

    if (elControlRight) {
        elControlRight.dataset.key = 'ArrowRight';
        pageInstance.addListListenInInstance(elControlRight, handleButtonControl.bind(this), 'click');
    }
}

export { isTouchDevice, resetControlSize, listenButtonControl };
'use strict';

class ButtonControlManager {
    constructor() {
        this.activeIntervals = {};
    }

    handleButtonControl = (ev) => {
        const key = ev.currentTarget.dataset.key;
        if (ev.type === 'touchstart') {
            if (key) {
                this.simulateKeyEvent(key, true);
                this.activeIntervals[key] = setInterval(() => {
                    this.simulateKeyEvent(key, true);
                }, 100); // 繰り返し間隔は100msに設定
            }
        } else if (ev.type === 'touchend' || ev.type === 'touchcancel') {
            if (key && this.activeIntervals[key]) {
                clearInterval(this.activeIntervals[key]);
                delete this.activeIntervals[key];
                this.simulateKeyEvent(key, false);
            }
        }
    }

    simulateKeyEvent = (key, is_pressed) => {
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

    listenButtonControl = (elControl, pageInstance) => {
        const elControlTop = elControl.querySelector('.listButtonControl_btn-top');
        const elControlBottom = elControl.querySelector('.listButtonControl_btn-bottom');
        const elControlLeft = elControl.querySelector('.listButtonControl_btn-left');
        const elControlRight = elControl.querySelector('.listButtonControl_btn-right');

        if (elControlTop) {
            elControlTop.dataset.key = 'ArrowUp';
            pageInstance.addListListenInInstance(elControlTop, this.handleButtonControl.bind(this), 'touchstart');
            pageInstance.addListListenInInstance(elControlTop, this.handleButtonControl.bind(this), 'touchend');
            pageInstance.addListListenInInstance(elControlTop, this.handleButtonControl.bind(this), 'touchcancel');
        }

        if (elControlBottom) {
            elControlBottom.dataset.key = 'ArrowDown';
            pageInstance.addListListenInInstance(elControlBottom, this.handleButtonControl.bind(this), 'touchstart');
            pageInstance.addListListenInInstance(elControlBottom, this.handleButtonControl.bind(this), 'touchend');
            pageInstance.addListListenInInstance(elControlBottom, this.handleButtonControl.bind(this), 'touchcancel');
        }

        if (elControlLeft) {
            elControlLeft.dataset.key = 'ArrowLeft';
            pageInstance.addListListenInInstance(elControlLeft, this.handleButtonControl.bind(this), 'touchstart');
            pageInstance.addListListenInInstance(elControlLeft, this.handleButtonControl.bind(this), 'touchend');
            pageInstance.addListListenInInstance(elControlLeft, this.handleButtonControl.bind(this), 'touchcancel');
        }

        if (elControlRight) {
            elControlRight.dataset.key = 'ArrowRight';
            pageInstance.addListListenInInstance(elControlRight, this.handleButtonControl.bind(this), 'touchstart');
            pageInstance.addListListenInInstance(elControlRight, this.handleButtonControl.bind(this), 'touchend');
            pageInstance.addListListenInInstance(elControlRight, this.handleButtonControl.bind(this), 'touchcancel');
        }
    }
}

export const buttonControlManager = new ButtonControlManager();
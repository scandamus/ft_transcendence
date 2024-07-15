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

export { isTouchDevice, resetControlSize };
import IMask from "imask";

export const masked = IMask.createMask({
    mask: '+{7}(000)000-00-00',
    // lazy: false,  // make placeholder always visible
});

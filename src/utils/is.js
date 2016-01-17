'use strict';

// -----------------------------------------
// VARS

// -----------------------------------------
// PUBLIC FUNCTIONS

/**
 * Is it ie?
 * @return {boolean}
 */
var isIe = () => {
    if (navigator.userAgent.match(/Trident\/7\./)) {
        return true;
    }
};

/**
 * Is it mobile?
 * @return {boolean}
 */
var isMobile = () => {
    if (/Android|Tablet PC|PalmOS|PalmSource|smartphone|GT-P1000|SGH-T849|SHW-M180S|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows CE|Windows Mobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
        return true;
    }
};

// -----------------------------------------
// PRIVATE FUNCTIONS

// -----------------------------------------
// EXPORT

export default {
    ie: isIe,
    mobile: isMobile
};

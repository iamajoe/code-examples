(function () {
    'use strict';

    let bodyEl = document.getElementById('body');
    let classList = bodyEl.classList;

    // Remove class no-script
    classList.remove('no-script');

    let is = require('is.js');
    is.ie() && classList.add('is-ie');
    is.mobile() && classList.add('is-mobile');

    // Mount the app
    let riot = require('riot');
    require('components/app.js');
    riot.mount('body', 'app');

    // Router
    let route = require('modules/route/actions.js');
    route.init();
})();

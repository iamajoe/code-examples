import { isIe, isMobile } from 'is.js';
import riot from 'riot';
import 'components/app.js';

// Wait for the document to be ready
document.addEventListener('DOMContentLoaded', function () {
    let bodyEl = document.getElementById('body');
    let classList = bodyEl.classList;

    // Remove class no-script
    classList.remove('no-script');

    if (isIe()) {
        classList.add('is-ie');
    }

    if (isMobile()) {
        classList.add('is-mobile');
    }

    // Mount the app
    riot.mount('body', 'app');

    // Router
    require('modules/route/router.js');
});

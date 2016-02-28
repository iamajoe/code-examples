import riot from 'riot';
import { isIe, isMobile } from 'bedrock/is';
import 'containers/app.js';

// Wait for the document to be ready
document.addEventListener('DOMContentLoaded', function () {
    const bodyEl = document.getElementById('body');
    const classList = bodyEl.classList;

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

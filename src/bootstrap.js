(function () {
    'use strict';
    let Router = require('Bedrock/Router.js');
    let config = require('config/config.js');
    let states = require('config/states.js');
    let AppController = require('structure/AppController.js');

    // Initialize
    let router = new Router(states, { trigger: true });
    let app = new AppController(document.body);

    // Router adopts the main controller
    router.on('router#change', state => app.setState(state));

    // Listen for app events
    app.on('bedrockrouter:navigate', route => {
        router.trigger('bedrockrouter:navigate', route);
    });

    // Starts router
    router.start(config);
})();

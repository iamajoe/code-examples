'use strict';
import riot from 'riot';
import './structure/app.js';

let app = riot.mount('app');

// Router
riot.route(() => riot.route('/search/funny'));
riot.route('/search/*', cat => {
    app.forEach(val => val.setNewQuery(cat));
});
riot.route.start(true);

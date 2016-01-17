'use strict';

import riot from 'riot';
import actions from 'modules/posts/actions.js';
import './posts.js';

/**
 * On mount handler
 * @param  {tag} self
 */
let onMount = self => {
    // Mount child
    self.mount('posts');
};

/**
 * Sets a new query
 * @param  {tag} self
 * @param  {event} evt
 * @param  {string} query
 */
let onKeyPress = (self, evt) => {
    // Throttler needed for better performance
    // and there is no need to constantly request
    self.throttler && clearTimeout(self.throttler);
    self.throttler = setTimeout(() => {
        let query = evt.target.value;

        // Request new data
        !!query && actions.changeQuery(query);
    }, 1000);
};

// -----------------------------------------
// Initialize

/**
 * Initialize
 * @param  {object} opts
 */
let init = function (opts) {
    // Set events
    this.on('mount', onMount.bind(null, this));

    // Set DOM events functions
    this.onSubmit = evt => evt.preventDefault();
    this.onKeypress = onKeyPress.bind(null, this);

    // Fetch initial values
    actions.changeQuery();
};

/**
 * Register the tag
 */
riot.tag('app',
    `
    <div class="header-wrapper">
        <div class="header">
            <div class="logo">Reddit</div>
            <form onsubmit={onSubmit}>
                <input onkeyup={onKeypress} class="search-input" type="text" name="search">
            </form>
        </div>
    </div>
    <div class="posts-wrapper">
        <posts></posts>
    </div>
    `,

    init
);

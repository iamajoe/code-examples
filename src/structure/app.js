'use strict';
import riot from 'riot';
import './posts.js';

/**
 * Sets a new query
 * @param  {tag} self
 * @param  {event} evt
 * @param  {string} query
 */
let setNewQuery = (self, evt, query) => {
    // Throttler needed for better performance
    // and there is no need to constantly request
    self.throttler && clearTimeout(self.throttler);
    self.throttler = setTimeout(() => {
        self.opts.query = query || evt.target.value;

        // Update the search input
        if (!!query) {
            self.search.value = query;
        }

        // Force update
        self.update();
    }, !!query ? 1 : 1000);
};

/**
 * On mount handler
 * @param  {tag} self
 */
let onMount = self => {
    // Mount child
    self.mount('posts');
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
        <posts query="{opts.query}"></posts>
    </div>
    `,

    function (opts) {
        // Set events
        this.on('mount', onMount.bind(null, this));

        // Set DOM events functions
        this.onSubmit = evt => evt.preventDefault();
        this.onKeypress = evt => setNewQuery(this, evt);

        // Set public methods
        this.setNewQuery = setNewQuery.bind(this, this, null);
    }
);

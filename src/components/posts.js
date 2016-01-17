'use strict';

import riot from 'riot';
import { onUpdateComp } from 'baseComponent.js';
import actions from 'modules/posts/actions.js';
import './postItem.js';

/**
 * On mount handler
 * @param  {tag} self
 * @param  {*} opts
 */
let onMount = (self, opts) => {
    actions.addView(self);

    // Mount items
    riot.mount('post-item');
};

/**
 * On unmount handler
 */
let onUnmount = (self) => actions.removeView(self);

/**
 * On update handler
 * @param  {object} state
 */
let onUpdate = (self, state) => onUpdateComp(self, state);

// -----------------------------------------
// Initialize

/**
 * Initialize
 * @param  {object} opts
 */
let init = function (opts) {
    // Set events for the view
    this.on('mount', onMount.bind(null, this));
    this.on('unmount', onUnmount.bind(null, this));
    this.on('update', onUpdate.bind(null, this));
};

/**
 * Register the tag
 */
riot.tag('posts',
    `
    <div class="loading {is-loading: this.data.isLoading}"></div>
    <post-item each={this.data.posts}></post-item>
    `,

    init
);

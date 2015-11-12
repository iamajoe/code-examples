'use strict';
import riot from 'riot';
import { addView } from 'stores/postsStore.js';
import { fetchAll } from 'actions/postActions.js';
import 'components/postItem.js';

/**
 * On mount handler
 * @param  {tag} self
 * @param  {*} opts
 */
let onMount = (self, opts) => {
    // Add the view to be updated with the store
    addView(self);

    // Mount items
    riot.mount('post-item');
};

/**
 * On update handler
 * @param  {tag} self
 * @param  {*} opts
 */
let onUpdate = (self, opts) => {
    // Fetch all the posts
    let query = opts ? opts.query : null;
    fetchAll(query);
};

/**
 * Register the tag
 */
riot.tag('posts',
    `
    <div class="loading {is-loading: isLoading}"></div>
    <post-item each={posts}></post-item>
    `,

    function (opts) {
        this.on('mount', onMount.bind(null, this, opts));
        this.on('update', onUpdate.bind(null, this, opts));
    }
);

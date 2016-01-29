import riot from 'riot';
import { onUpdateComp } from 'baseComponent.js';
import actions from 'modules/posts/actions.js';

/**
 * On update handler
 * @param  {tag} self
 * @param  {*} opts
 * @param  {object} state
 */
let onUpdate = (self, opts, state) => onUpdateComp(self, state);

/**
 * On mount handler
 * @param  {tag} self
 * @param  {*} opts
 */
let onMount = (self, opts) => {
    // Set update method
    self.on('update', onUpdate.bind(null, self, opts));

    actions.addView(self);
};

/**
 * On unmount handler
 * @param  {tag} self
 */
let onUnmount = (self) => actions.removeView(self);

// -----------------------------------------
// Initialize

/**
 * Initialize
 * @param  {*} opts
 */
let init = function (opts) {
    // Set events for the view
    this.on('mount', onMount.bind(null, this, opts));
    this.on('unmount', onUnmount.bind(null, this));
};

/**
 * Register the tag
 */
riot.tag('posts',
    `
    <div class="loading {is-loading: data.isLoading }"></div>
    <div class="post-item" each="{ data.posts }">
        <div class="thumb { no-thumb: !thumbnail } post-thumb" style="{ !!thumbnail ? 'background-image:url(' + thumbnail + ')' : '' }"></div>
        <div class="post-info">
            <div class="post-author">{ author }</div>
            <div class="truncate post-desc">{ title }</div>
            <ul class="post-social">
                <li><div class="icon icon-comment"></div>{ num_comments } comments</li>
                <li><div class="icon icon-favorite"></div>{ ups } ups</li>
                <li><div class="icon icon-down"></div>{ downs } downs</li>
            </ul>
        </div>
    </div>
    `,

    init
);

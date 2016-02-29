import riot from 'riot';
import outdatedBrowser from 'bedrock/outdatedbrowser';
import { updateState } from 'bedrock/component';
import actions from 'modules/actions.js';
import 'components/posts/posts.js';

/**
 * Sets a new query
 * @param  {tag} self
 * @param  {event} evt
 */
const onKeyUp = (self, evt) => {
    evt.stopPropagation();

    // Throttler needed for better performance
    // and there is no need to constantly request
    if (self.throttler) {
        clearTimeout(self.throttler);
    }

    self.throttler = setTimeout(() => {
        const query = evt.target.value;

        // Request new data
        (!!query) && actions.setContent({
            type: 'SEARCH',
            params: { query }
        });
    }, 1000);
};

/**
 * On update handler
 * @param  {tag} self
 */
const onUpdate = (self) => {
    const initialState = actions.getInitial();
    const state = actions.getState();
    const oldState = self.state;
    const newState = updateState(oldState, state, initialState);

    // No need to go further if same
    if (!newState) {
        return;
    }

    // Cache values
    self.state = newState;
};

/**
 * On mount handler
 * @param  {tag} self
 */
const onMount = self => {
    const defaultQuery = actions.getState().app.content.params.query;

    // Set outdated browser
    outdatedBrowser({ lowerThan: 'IE11', languagePath: '' });

    // Add for the actions update
    self.unsubscribe = actions.subscribe(self.update);

    // Mount child
    // TODO: Why? Mounting works but won't do the each
    // On other project for some reason works without
    self.mount('posts');

    // Set update method
    self.on('update', () => onUpdate(self));

    // Request first default query
    actions.changeQuery(defaultQuery);
};

/**
 * On unmount handler
 * @param  {tag} self
 */
const onUnmount = (self) => {
    (!!self.throttler) && clearTimeout(self.throttler);

    // Remove events
    self.off('update');

    // Unsubscribe
    self.unsubscribe && self.unsubscribe();
    self.unsubscribe = null;
};

// -----------------------------------------
// Initialize

/**
 * Initialize
 * @param  {*} opts
 */
const init = function (opts) {
    // Set events
    this.on('mount', () => onMount(this, opts));
    this.on('unmount', () => onUnmount(this));

    // Set DOM events functions
    this.onSubmit = evt => evt.preventDefault();
    this.onKeyUp = evt => onKeyUp(this, evt);
};

/**
 * Register the tag
 */
riot.tag('app',
    `
    <div id="outdated">
        <h6>Your browser is out-of-date!</h6>
        <p>Update your browser to view this website correctly. <a id="btnUpdateBrowser" href="http://outdatedbrowser.com/">Update my browser now </a></p>
        <p class="last"><a href="#" id="btnCloseUpdateBrowser" title="Close">&times;</a></p>
    </div>
    <div class="header-wrapper">
        <div class="header">
            <div class="logo">Reddit</div>
            <form onsubmit="{onSubmit}">
                <input onkeyup="{onKeyUp}" class="search-input" type="text" name="search">
            </form>
        </div>
    </div>
    <div class="posts-wrapper">
        <posts err="{state.posts.err}" loading="{state.posts.loading}" list="{state.posts.list}"></posts>
    </div>
    `,

    init
);

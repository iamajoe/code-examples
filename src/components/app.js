import riot from 'riot';
import appActions from 'modules/app/actions.js';
import './posts.js';

/**
 * Sets a new query
 * @param  {tag} self
 * @param  {event} evt
 */
let onKeyUp = (self, evt) => {
    /* eslint-disable no-param-reassign */
    // Throttler needed for better performance
    // and there is no need to constantly request
    if (self.throttler) {
        clearTimeout(self.throttler);
    }

    self.throttler = setTimeout(() => {
        let query = evt.target.value;

        // Request new data
        if (!!query) {
            appActions.setContent({
                type: 'SEARCH',
                params: { query }
            });
        }
    }, 1000);
    /* eslint-enable no-param-reassign*/
};

/**
 * On mount handler
 * @param  {tag} self
 */
let onMount = self => {
    // Mount child
    // TODO: Why? Mounting works but won't do the each
    // On other project for some reason works without
    self.mount('posts');
};

// -----------------------------------------
// Initialize

/**
 * Initialize
 * @param  {*} opts
 */
let init = function () {
    // Set events
    this.on('mount', onMount.bind(null, this));

    // Set DOM events functions
    this.onSubmit = evt => evt.preventDefault();
    this.onKeyUp = onKeyUp.bind(null, this);
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
            <form onsubmit={ onSubmit }>
                <input onkeyup="{ onKeyUp }" class="search-input" type="text" name="search">
            </form>
        </div>
    </div>
    <div class="posts-wrapper">
        <posts></posts>
    </div>
    `,

    init
);

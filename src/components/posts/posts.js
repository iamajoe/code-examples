import riot from 'riot';
import { updateState } from 'bedrock/component';
import { addIcon } from 'bedrock/icon';
import actions from 'modules/posts/actions.js';

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
 * @param  {*} opts
 */
const onMount = (self) => {
    let unsubscribe;

    // Set update method
    self.on('update', () => onUpdate(self));

    // Add for the actions update
    unsubscribe = actions.subscribe(self.update);
    self.actions.push(unsubscribe);
};

/**
 * On unmount handler
 * @param  {tag} self
 */
const onUnmount = (self) => {
    // Remove events
    self.off('update');

    // Unsubscribe everything
    self.actions.map(unsub => unsub());
    self.actions = [];
};

// -----------------------------------------
// Initialize

/**
 * Initialize
 * @param  {*} opts
 */
const init = function (opts) {
    // Set events for the view
    this.on('mount', () => onMount(this, opts));
    this.on('unmount', () => onUnmount(this));

    // Set actions
    this.actions = [];
};

/**
 * Register the tag
 */
riot.tag('posts',
    `
    <div class="loading {is-loading: state.loading }"></div>
    <div class="post-item" each="{ state.posts }">
        <div class="thumb { no-thumb: !thumbnail } post-thumb" style="{ !!thumbnail ? 'background-image:url(' + thumbnail + ')' : '' }">
            <div class="align-middle-wrapper">
                <div class="align-middle">
                    ${ addIcon('camera', false, 'large') }
                </div>
            </div>
        </div>
        <div class="post-info">
            <div class="post-author">{ author }</div>
            <div class="truncate post-desc">{ title }</div>
            <ul class="post-social">
                <li>${ addIcon('comment-o') }{ num_comments } comments</li>
                <li>${ addIcon('thumbs-o-up') }{ ups } ups</li>
                <li>${ addIcon('thumbs-o-down') }{ downs } downs</li>
            </ul>
        </div>
    </div>
    `,

    init
);

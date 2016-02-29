import riot from 'riot';
import { addIcon } from 'bedrock/icon';

// -----------------------------------------
// Initialize

/**
 * On update handler
 * @param  {tag} self
 * @param  {object} opts
 */
const onUpdate = (self, opts) => {
    // Cache values
    self.postsList = opts.list;

    // TODO: Parent isn't passing always this guy!
    // self.isLoading = opts.loading;
};

/**
 * On mount handler
 * @param  {tag} self
 * @param  {object} opts
 */
const onMount = (self, opts) => {
    // Set update method
    self.on('update', () => onUpdate(self, opts));
};

/**
 * On unmount handler
 * @param  {tag} self
 */
const onUnmount = (self) => {
    // Remove events
    self.off('update');
};

/**
 * Initialize
 * @param  {*} opts
 */
const init = function (opts) {
    // Set events
    this.on('mount', () => onMount(this, opts));
    this.on('unmount', () => onUnmount(this));
};

/**
 * Register the tag
 */
riot.tag('posts',
    `
    <div class="loading {is-loading: isLoading }"></div>
    <div class="post-item" each="{ postsList }">
        <div class="thumb { no-thumb: !thumbnail } post-thumb" style="{ !!thumbnail ? 'background-image:url(' + thumbnail + ')' : '' }">
            <div class="align-middle-wrapper">
                <div class="align-middle">
                    ${ addIcon('camera', {
                        size: 'large'
                    }) }
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

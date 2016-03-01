import React from 'react';
import { addIcon } from 'bedrock/iconReact';

// -----------------------------------------
// VARS

const PROP_TYPES = {
    loading: React.PropTypes.bool,
    list: React.PropTypes.array.isRequired
};

// -----------------------------------------
// FUNCTIONS

/**
 * Renders post tag
 * @param  {tag} self
 * @param  {object} post
 * @return {template}
 */
const renderPost = (self, post) => {
    const thumbnail = post.thumbnail;
    const thumbClass = !thumbnail ? 'thumb no-thumb post-thumb' : 'thumb post-thumb';
    const thumbStyle = {
        backgroundImage: !!thumbnail && 'url(' + thumbnail + ')'
    };

    return (
    <div key={post.id} className="post-item">
        <div className={thumbClass} style={thumbStyle}>
            <div className="align-middle-wrapper">
                <div className="align-middle">
                    { addIcon('camera', {
                        isInverse: false,
                        size: 'large'
                    }) }
                </div>
            </div>
        </div>
        <div className="post-info">
            <div className="post-author">{ post.author }</div>
            <div className="truncate post-desc">{ post.title }</div>
            <ul className="post-social">
                <li>{ addIcon('comment-o') }{ post.num_comments } comments</li>
                <li>{ addIcon('thumbs-o-up') }{ post.ups } ups</li>
                <li>{ addIcon('thumbs-o-down') }{ post.downs } downs</li>
            </ul>
        </div>
    </div>
    );
};

/**
 * Renders tag
 * @param  {tag} self
 * @param  {object} props
 */
const render = (self, props) => {
    const tagProps = props || self && self.props;
    const loadingClass = !!tagProps.loading ? 'loading is-loading' : 'loading';
    const list = tagProps.list.map((post) => renderPost(self, post));

    return (
    <div className="posts">
        <div className={loadingClass}></div>
        {list}
    </div>
    );
};

// -----------------------------------------
// The tag

// This would be the general use
// class Posts extends React.Component {
//     render() { return render(this); }
// }

// But only this solution is needed
const Posts = (props) => render(null, props);

// Set prop types
Posts.propTypes = PROP_TYPES;

// -------------------------------------------
// EXPORT

export { Posts };

import React from 'react';
import { addIcon } from 'bedrock/icon';

// -----------------------------------------
// VARS

// -----------------------------------------
// FUNCTIONS

/**
 * Renders post tag
 * @param  {tag} self
 * @param  {object} post
 */
const renderPost = (self, post) => {
    const thumbnail = post.thumbnail;
    const thumbClass = !thumbnail ? 'thumb no-thumb post-thumb' : 'thumb post-thumb';
    const thumbStyle = !!thumbnail && {
        backgroundImage: 'url(' + thumbnail + ')'
    };

    return (
    <div className="post-item">
        <div className={thumbClass} style={thumbStyle}>
            <div className="align-middle-wrapper">
                <div className="align-middle">
                    { addIcon('camera', false, 'large') }
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
 */
const render = (self) => {
    console.log("inside render of posts", self.props);
    const loadingClass = !!self.props.loading ? 'loading is-loading' : 'loading';
    const posts = self.props.list.map((post) => renderPost(self, post));

    return (
    <div className="posts">
        <div className={loadingClass}></div>
        { posts }
    </div>
    );
};

// -----------------------------------------
// The tag

class Posts extends React.Component {
    render() { return render(this); }
}

// -------------------------------------------
// EXPORT

export { Posts };

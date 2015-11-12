'use strict';
import riot from 'riot';

riot.tag('post-item',
    `
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
    `,

    function (opts) {
        // TODO: Add events
    }
);

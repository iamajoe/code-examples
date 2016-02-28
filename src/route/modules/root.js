import actions from '../../modules/actions.js';

// -----------------------------------------
// FUNCTIONS

/**
 * Index
 */
const index = {
    'type': 'INDEX',
    'url': '/',
    /**
     * Route handler
     * @param  {object} route
     * @param  {object} ctx
     * @param  {function} next
     */
    'onRoute': () => {
        actions.setContent({
            type: 'SEARCH',
            params: {
                query: 'funny'
            }
        });
    }
};

/**
 * Search
 */
const search = {
    'type': 'SEARCH',
    'url': '/search/:query',
    /**
     * Url parsing
     * @param  {object} params
     * @return {string}
     */
    'urlParse': (params) => {
        return '/search/' + params.query;
    },
    /**
     * Route handler
     * @param  {object} route
     * @param  {object} ctx
     * @param  {function} next
     */
    'onRoute': (route, ctx) => {
        const params = ctx.params;
        const type = route.type;

        actions.setContent({ type, params });
    }
};

// -----------------------------------------
// EXPORT

export default [index, search];

const path = require('path');
const deepMixIn = require('mout/object/deepMixIn.js');
const bedrock = path.join(__dirname, '../node_modules/bedrock/config/mapping.js');
const env = process.argv[2];

const prodMapping = env === 'prod' ? {
    'react': 'node_modules/react/dist/react.min.js',
    'react-dom': 'node_modules/react-dom/dist/react-dom.min.js'
} : null;

module.exports = deepMixIn(require(bedrock), prodMapping);

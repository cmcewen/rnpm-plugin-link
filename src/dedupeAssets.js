const path = require('path');
const uniq = require('lodash.uniq');

/**
 * Returns unique array of assets by its name
 */
module.exports = function dedupeAssets(assets) {
  return uniq(assets, asset => path.basename(asset));
};

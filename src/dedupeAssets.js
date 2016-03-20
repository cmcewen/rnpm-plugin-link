const path = require('path');

/**
 * Returns unique array of assets by its name
 */
module.exports = function dedupeAssets(assets) {
  return assets.reduce(
    (acc, asset) => {
      const filename = path.basename(asset);
      return acc.ids.indexOf(filename) >= 0
        ? acc
        : { list: acc.list.concat(asset), ids: acc.ids.concat(filename) };
    },
    { list: [], ids: [] }
  ).list;
};

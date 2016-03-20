const log = require('npmlog');

const isEmpty = require('./isEmpty');
const registerDependencyAndroid = require('./android/registerNativeModule');
const registerDependencyIOS = require('./ios/registerNativeModule');
const copyAssetsAndroid = require('./android/copyAssets');
const copyAssetsIOS = require('./ios/copyAssets');
const getProjectDependencies = require('./getProjectDependencies');
const dedupeAssets = require('./dedupeAssets');
const promisify = require('./promisify');

log.heading = 'rnpm-link';

const commandStub = (cb) => cb();

const linkDependency = (project, dependency) => {
  if (project.android && dependency.config.android) {
    log.info(`Linking ${dependency.name} android dependency`);

    const didLinkAndroid = registerDependencyAndroid(
      dependency.name,
      dependency.config.android,
      project.android
    );

    if (didLinkAndroid) {
      log.info(`Android module ${dependency.name} has been successfully linked`);
    } else {
      log.info(`Android module ${dependency.name} is already linked`);
    }
  }

  if (project.ios && dependency.config.ios) {
    log.info(`Linking ${dependency.name} ios dependency`);

    const didLinkIOS = registerDependencyIOS(dependency.config.ios, project.ios);

    if (didLinkIOS) {
      log.info(`iOS module ${dependency.name} has been successfully linked`);
    } else {
      log.info(`iOS module ${dependency.name} is already linked`);
    }
  }
};

const linkAssets = (project, assets) => {
  if (isEmpty(assets)) {
    return;
  }

  if (project.ios) {
    log.info('Linking assets to ios project');
    copyAssetsIOS(assets, project.ios);
  }

  if (project.android) {
    log.info('Linking assets to android project');
    copyAssetsAndroid(assets, project.android.assetsPath);
  }

  log.info(`Assets has been successfully linked to your project`);
};

/**
 * Updates project and linkes all dependencies to it
 *
 * If optional argument [packageName] is provided, it's the only one that's checked
 */
module.exports = function link(config, args) {

  try {
    const project = config.getProjectConfig();
  } catch (err) {
    log.error('ERRPACKAGEJSON', `No package found. Are you sure it's a React Native project?`);
    return Promise.reject(err);
  }

  const packageName = args[0];

  const dependencies =
    (packageName ? [packageName] : getProjectDependencies())
    .map(name => {
      try {
        return {
          config: config.getDependencyConfig(name),
          name,
        };
      } catch (err) {
        log.warn(
          'ERRINVALIDPROJ',
          `Project ${name} is not a react-native library`
        );
      }
    })
    .filter(dependency => dependency);

  const tasks = Promise.all(dependencies.map(dependency => {
    const pre = promisify(dependency.config.commands.prelink || commandStub);
    const post = promisify(dependency.config.commands.postlink || commandStub);

    return pre().then(() => linkDependency(project, dependency)).then(post);
  }));

  const assets = dedupeAssets(dependencies.reduce(
    (assets, dependency) => assets.concat(dependency.config.assets),
    project.assets
  ));

  return tasks.then(() => linkAssets(project, assets));
};

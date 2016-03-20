const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const mock = require('mock-require');
const log = require('npmlog');
const path = require('path');

const link = require('../src/link');

log.level = 'silent';

describe('link', () => {

  beforeEach(() => {
    delete require.cache[require.resolve('../src/link')];
  });

  // that test suite has to be changed in next PR so we have
  // fixed behaviour for `getProjectConfig` that's already in master
  it('should return when run in a folder without package.json', () => {
    const spy = sinon.spy(log, 'error');

    const config = {
      getProjectConfig: () => {
        throw new Error('No package.json found');
      },
    };

    link(config);

    expect(spy.calledWith('ERRPACKAGEJSON')).to.be.true;
  });

  it('should accept a name of a dependency to link', (done) => {
    const config = {
      getProjectConfig: () => ({ assets: [] }),
      getDependencyConfig: sinon.stub().returns({ assets: [], commands: {} }),
    };

    link(config, ['react-native-gradient']).then(() => {
      expect(
        config.getDependencyConfig.calledWith('react-native-gradient')
      ).to.be.true;
      done();
    });
  });

  it('should read dependencies from package.json when name not provided', (done) => {
    const getProjectDependencies = sinon.stub().returns([]);
    const config = {
      getProjectConfig: () => ({ android: {}, ios: {}, assets: [] }),
    };

    mock(
      '../src/getProjectDependencies.js',
      getProjectDependencies
    );

    const link = require('../src/link');

    link(config, []).then(() => {
      expect(getProjectDependencies.calledOnce).to.be.true;
      done();
    }).catch(err => console.log(err.stack));
  });

  it('should register native module when android/ios projects are present', () => {
    const registerNativeModule = sinon.stub();
    const config = {
      getProjectConfig: () => ({ android: {}, ios: {}, assets: [] }),
      getDependencyConfig: () => ({ android: {}, ios: {}, assets: [], commands: {} }),
    };

    mock(
      '../src/android/registerNativeModule.js',
      registerNativeModule
    );

    mock(
      '../src/ios/registerNativeModule.js',
      registerNativeModule
    );

    const link = require('../src/link');

    link(config, ['react-native-blur']).then(() => {
      expect(registerNativeModule.calledTwice).to.be.true;
    });
  });

  it('should copy assets from both project and dependencies projects', (done) => {
    const dependencyAssets = ['Fonts/Font.ttf'];
    const projectAssets = ['Fonts/FontC.ttf'];
    const copyAssets = sinon.stub();

    mock(
      '../src/ios/copyAssets.js',
      copyAssets
    );

    const config = {
      getProjectConfig: () => ({ ios: {}, assets: projectAssets }),
      getDependencyConfig: sinon.stub().returns({ assets: dependencyAssets, commands: {} }),
    };

    const link = require('../src/link');

    link(config, ['react-native-blur']).then(() => {
      expect(copyAssets.calledOnce).to.be.true;
      expect(copyAssets.getCall(0).args[0]).to.deep.equals(
        projectAssets.concat(dependencyAssets)
      );
      done();
    });
  });

  afterEach(() => {
    mock.stopAll();
  });

});

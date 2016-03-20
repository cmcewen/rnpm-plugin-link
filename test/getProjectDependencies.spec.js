const chai = require('chai');
const expect = chai.expect;
const getProjectDependencies = require('../src/getProjectDependencies');
const mock = require('mock-require');
const path = require('path');

describe('getProjectDependencies', () => {

  it.skip('should return project dependencies without `react-native`', () => {
    const baseArray = ['FontB.ttf', 'FontC.ttf', 'FontD.ttf'];
    const toExcludeArray = ['FontC.ttf', 'FontD.ttf'];

    expect(diff(baseArray, toExcludeArray)).to.deep.equals(['FontB.ttf']);
  });

});

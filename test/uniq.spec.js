const chai = require('chai');
const expect = chai.expect;
const uniq = require('../src/uniq');

describe('uniq', () => {

  it('should return unique array', () => {
    const baseArray = ['FontB.ttf', 'FontC.ttf', 'FontC.ttf'];
    expect(uniq(baseArray)).to.deep.equals(['FontB.ttf', 'FontC.ttf']);
  });

  it('should return unique array by a given id', () => {
    const baseArray = [
      { name: 'FontB.ttf'},
      { name: 'FontB.ttf' },
      { name: 'FontC.ttf' },
    ];

    const getId = item => item.name;

    expect(uniq(baseArray, getId)).to.deep.equals([
      { name: 'FontB.ttf' },
      { name: 'FontC.ttf' },
    ]);
  });

});

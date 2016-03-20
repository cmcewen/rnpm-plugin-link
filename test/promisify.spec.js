const chai = require('chai');
const expect = chai.expect;
const promisify = require('../src/promisify');

describe('promisify', () => {

  it('should reject a promise when cb(err)', done => {
    const thrown = new Error();
    const wrapped = promisify(cb => cb(thrown));

    wrapped().catch(err => {
      expect(err).to.equals(thrown);
      done();
    });
  });

  it('should resolve a promise when cb(null, obj)', done => {
    const payload = {};
    const wrapped = promisify(cb => cb(null, payload));

    wrapped().then(data => {
      expect(data).to.equals(payload);
      done();
    });
  });

});

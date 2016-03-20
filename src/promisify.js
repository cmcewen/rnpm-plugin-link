module.exports = function promisify(func) {
  return () => new Promise((resolve, reject) =>
    func((err, res) => err ? reject(err) : resolve(res))
  );
};

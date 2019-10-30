let Consumer;
const {Range} = require('semver');

module.exports =
(Consumer = class Consumer {
  constructor(keyPath, versionRange, callback) {
    this.keyPath = keyPath;
    this.callback = callback;
    this.versionRange = new Range(versionRange);
  }
});

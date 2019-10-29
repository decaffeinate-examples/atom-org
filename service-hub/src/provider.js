/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Provider;
const {CompositeDisposable} = require('event-kit');
const {SemVer} = require('semver');

const {getValueAtKeyPath, setValueAtKeyPath} = require('./helpers');

module.exports =
(Provider = class Provider {
  constructor(keyPath, servicesByVersion) {
    this.consumersDisposable = new CompositeDisposable;
    this.servicesByVersion = {};
    this.versions = [];
    for (let version in servicesByVersion) {
      const service = servicesByVersion[version];
      this.servicesByVersion[version] = {};
      this.versions.push(new SemVer(version));
      setValueAtKeyPath(this.servicesByVersion[version], keyPath, service);
    }

    this.versions.sort((a, b) => b.compare(a));
  }

  provide(consumer) {
    for (let version of Array.from(this.versions)) {
      if (consumer.versionRange.test(version)) {
        var value;
        if (value = getValueAtKeyPath(this.servicesByVersion[version.toString()], consumer.keyPath)) {
          const consumerDisposable = consumer.callback.call(null, value);
          if (typeof (consumerDisposable != null ? consumerDisposable.dispose : undefined) === 'function') {
            this.consumersDisposable.add(consumerDisposable);
          }
          return;
        }
      }
    }
  }

  destroy() {
    return this.consumersDisposable.dispose();
  }
});

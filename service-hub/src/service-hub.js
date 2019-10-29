/** @babel */
/* eslint-disable
    no-return-assign,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ServiceHub
const { Disposable } = require('event-kit')
const Consumer = require('./consumer')
const Provider = require('./provider')

module.exports =
(ServiceHub = class ServiceHub {
  constructor () {
    this.consumers = []
    this.providers = []
  }

  // Public: Provide a service by invoking the callback of all current and future
  // consumers matching the given key path and version range.
  //
  // * `keyPath` A {String} of `.` separated keys indicating the services's
  //   location in the namespace of all services.
  // * `version` A {String} containing a [semantic version](http://semver.org/)
  //   for the service's API.
  // * `service` An object exposing the service API.
  //
  // Returns a {Disposable} on which `.dispose()` can be called to remove the
  // provided service.
  provide (keyPath, version, service) {
    let servicesByVersion
    if (service != null) {
      servicesByVersion = {}
      servicesByVersion[version] = service
    } else {
      servicesByVersion = version
    }

    const provider = new Provider(keyPath, servicesByVersion)
    this.providers.push(provider)

    for (const consumer of Array.from(this.consumers.slice())) {
      if (!consumer.isDestroyed) {
        provider.provide(consumer)
      }
    }

    return new Disposable(() => {
      provider.destroy()
      const index = this.providers.indexOf(provider)
      return this.providers.splice(index, 1)
    })
  }

  // Public: Consume a service by invoking the given callback for all current
  // and future provided services matching the given key path and version range.
  //
  // * `keyPath` A {String} of `.` separated keys indicating the services's
  //   location in the namespace of all services.
  // * `versionRange` A {String} containing a [semantic version range](https://www.npmjs.org/doc/misc/semver.html)
  //   that any provided services for the given key path must satisfy.
  // * `callback` A {Function} to be called with current and future matching
  //   service objects.
  //
  // Returns a {Disposable} on which `.dispose()` can be called to remove the
  // consumer.
  consume (keyPath, versionRange, callback) {
    const consumer = new Consumer(keyPath, versionRange, callback)

    this.consumers.push(consumer)

    for (const provider of Array.from(this.providers.slice())) {
      provider.provide(consumer)
    }

    return new Disposable(() => {
      const index = this.consumers.indexOf(consumer)
      if (index >= 0) { return this.consumers.splice(index, 1) }
    })
  }

  // Public: Clear out all service consumers and providers, disposing of any
  // disposables returned by previous consumers.
  clear () {
    for (const provider of Array.from(this.providers.slice())) {
      provider.destroy()
    }
    this.providers = []
    return this.consumers = []
  }
})

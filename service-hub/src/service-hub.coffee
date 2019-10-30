{Disposable} = require 'event-kit'
Consumer = require './consumer'
Provider = require './provider'

module.exports =
class ServiceHub
  constructor: ->
    @consumers = []
    @providers = []

  # Public: Provide a service by invoking the callback of all current and future
  # consumers matching the given key path and version range.
  #
  # * `keyPath` A {String} of `.` separated keys indicating the services's
  #   location in the namespace of all services.
  # * `version` A {String} containing a [semantic version](http://semver.org/)
  #   for the service's API.
  # * `service` An object exposing the service API.
  #
  # Returns a {Disposable} on which `.dispose()` can be called to remove the
  # provided service.
  provide: (keyPath, version, service) ->
    if service?
      servicesByVersion = {}
      servicesByVersion[version] = service
    else
      servicesByVersion = version

    provider = new Provider(keyPath, servicesByVersion)
    @providers.push(provider)

    for consumer in @consumers.slice()
      unless consumer.isDestroyed
        provider.provide(consumer)

    new Disposable =>
      provider.destroy()
      index = @providers.indexOf(provider)
      @providers.splice(index, 1)

  # Public: Consume a service by invoking the given callback for all current
  # and future provided services matching the given key path and version range.
  #
  # * `keyPath` A {String} of `.` separated keys indicating the services's
  #   location in the namespace of all services.
  # * `versionRange` A {String} containing a [semantic version range](https://www.npmjs.org/doc/misc/semver.html)
  #   that any provided services for the given key path must satisfy.
  # * `callback` A {Function} to be called with current and future matching
  #   service objects.
  #
  # Returns a {Disposable} on which `.dispose()` can be called to remove the
  # consumer.
  consume: (keyPath, versionRange, callback) ->
    consumer = new Consumer(keyPath, versionRange, callback)

    @consumers.push(consumer)

    for provider in @providers.slice()
      provider.provide(consumer)

    new Disposable =>
      index = @consumers.indexOf(consumer)
      @consumers.splice(index, 1) if index >= 0

  # Public: Clear out all service consumers and providers, disposing of any
  # disposables returned by previous consumers.
  clear: ->
    for provider in @providers.slice()
      provider.destroy()
    @providers = []
    @consumers = []

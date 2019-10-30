/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {Disposable} = require('event-kit');
const ServiceHub = require('../src/service-hub');

describe("ServiceHub", function() {
  let hub = null;

  beforeEach(() => hub = new ServiceHub);

  const onNextTick = function(fn) {
    waits(1);
    return runs(fn);
  };

  describe("::consume(keyPath, versionString, callback)", function() {
    it("invokes the callback with each existing service that matches the key path and version range", function() {
      const services = [];

      hub.provide("a", "1.0.0", {w: 1});
      hub.provide("b", "1.0.0", {x: 2});
      hub.consume("a", "^1.0.0", service => services.push(service));
      expect(services).toEqual([{w: 1}]);

      hub.provide("a", "1.1.0", {y: 3});
      hub.provide("b", "1.2.0", {z: 4});
      return expect(services).toEqual([{w: 1}, {y: 3}]);
  });

    it("invokes the callback with the newest version of a service provided in a given batch", function() {
      hub.provide("a", {
        "1.0.0": {w: 1},
        "1.1.0": {x: 2}
      });
      hub.provide("a",
        {"1.2.0": {y: 3}});
      hub.provide("b",
        {"1.0.0": {z: 4}});

      const services = [];
      hub.consume("a", "^1.0.0", service => services.push(service));

      return expect(services).toEqual([{x: 2}, {y: 3}]);
  });

    it("invokes the callback when a new service is provided that matches the key path and version range", function() {
      const services = [];
      hub.consume("a", "^1.0.0", service => services.push(service));
      expect(services).toEqual([]);

      hub.provide("a", "1.0.0", {x: 1});
      hub.provide("a", "1.1.0", {y: 2});
      hub.provide("b", "1.0.0", {z: 3});
      return expect(services).toEqual([{x: 1}, {y: 2}]);
  });

    it("can specify a key path that navigates into the contents of a service", function() {
      hub.provide("a", "1.0.0", {b: {c: 1}});
      hub.provide("a", "1.0.0", {d: {e: 2}});

      const services = [];
      hub.consume("a.b", "^1.0.0", service => services.push(service));
      return expect(services).toEqual([{c: 1}]);
  });

    return it("can specify a key path that's shorter than the key path passed to ::provide", function() {
      hub.provide("a.b", "1.0.0", {c: 1});
      hub.provide("a.d", "1.0.0", {e: 2});

      const services = [];
      hub.consume("a", "^1.0.0", service => services.push(service));
      return expect(services).toEqual([{b: {c: 1}}, {d: {e: 2}}]);
  });
});

  describe("disposing of a consumer", () => it("does not invoke the consumer callback for any newly-added providers", function() {
    const services = [];
    const disposable = hub.consume("a", "^1.0.0", service => services.push(service));

    hub.provide("a", "1.0.0", {x: 1});

    disposable.dispose();

    hub.provide("a", "1.0.1", {y: 2});
    return expect(services).toEqual([{x: 1}]);
}));

  describe("disposing of a provider", function() {
    it("does not invoke the callbacks of any newly-added consumers", function() {
      const disposable1 = hub.provide("a", "1.0.0", {x: 1});
      const disposable2 = hub.provide("a", "1.1.0", {y: 2});

      const services1 = [];
      hub.consume("a", "^1.0.0", service => services1.push(service));

      disposable1.dispose();

      const services2 = [];
      hub.consume("a", "^1.0.0", service => services2.push(service));
      expect(services1).toEqual([{x: 1}, {y: 2}]);
      return expect(services2).toEqual([{y: 2}]);
  });

    return it("disposes of consumer Disposables", function() {
      const provideDisposable = hub.provide("a", "1.0.0", {x: 1});

      const teardownConsumerSpy1 = jasmine.createSpy('teardownConsumer1');
      const teardownConsumerSpy2 = jasmine.createSpy('teardownConsumer2');

      hub.consume("a", "^1.0.0", service => new Disposable(teardownConsumerSpy1));
      hub.consume("a", "^1.0.0", service => new Disposable(teardownConsumerSpy2));
      provideDisposable.dispose();

      expect(teardownConsumerSpy1).toHaveBeenCalled();
      return expect(teardownConsumerSpy2).toHaveBeenCalled();
    });
  });

  return describe("::clear()", () => it("removes all providers and consumers, disposing of consumers' disposables", function() {
    hub.provide("a", "1.0.0", {w: 1});
    hub.provide("b", "1.0.0", {x: 2});

    const consumeSpy = jasmine.createSpy('consume');
    const teardownConsumer1Spy = jasmine.createSpy('teardownConsumer1');
    const teardownConsumer2Spy = jasmine.createSpy('teardownConsumer2');

    hub.consume("a", "^1.0.0", service => new Disposable(teardownConsumer1Spy));
    hub.consume("b", "^1.0.0", service => new Disposable(teardownConsumer2Spy));

    hub.clear();
    expect(teardownConsumer1Spy).toHaveBeenCalled();
    expect(teardownConsumer2Spy).toHaveBeenCalled();

    hub.consume("a", "^1.0.0", consumeSpy);
    return expect(consumeSpy).not.toHaveBeenCalled();
  }));
});

/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const deferredRequire = require('../src/deferred-require');

describe("deferredRequire", function() {
  it("allows requiring of objects to be deferred", function() {
    const module = deferredRequire('./fixtures/object');
    return expect(module.foo).toBe('bar');
  });

  it("allows requiring of constructors to be deferred", function() {
    const Constructor = deferredRequire('./fixtures/constructor');
    const object = new Constructor;
    return expect(object.calledConstructor).toBe(true);
  });

  return it("allows an error handler to be specified in case requiring the module throws an exception", function() {
    const errorHandler = jasmine.createSpy("handler").andReturn({foo: 'baz'});
    const module = deferredRequire('./fixtures/exception-thrower', errorHandler);
    expect(errorHandler).not.toHaveBeenCalled();
    expect(module.foo).toBe('baz');
    return expect(errorHandler).toHaveBeenCalled();
  });
});

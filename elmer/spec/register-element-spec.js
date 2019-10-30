/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const registerElement = require('../src/register-element');

describe("registerElement", function() {
  let registerSpy = null;

  beforeEach(() => registerSpy = spyOn(document, 'registerElement'));

  it("registers an element with the specified tag name extends from HTMLElement", function() {
    registerSpy.andReturn('ok');
    expect(registerElement('my-tag', {one: 'two', three() {}})).toBe('ok');

    const {
      args
    } = registerSpy.mostRecentCall;
    expect(args[0]).toBe('my-tag');
    expect(args[1].prototype.one).toBe('two');
    return expect(args[1].prototype.cloneNode).toBeDefined();
  });

  describe("when the extends key is a string", () => it("uses the extends key in document.registerElement and extends the prototype from HTMLElement", function() {
    registerSpy.andReturn('ok');
    expect(registerElement('my-tag', {one: 'two', extends: 'div'})).toBe('ok');

    const {
      args
    } = registerSpy.mostRecentCall;
    expect(args[0]).toBe('my-tag');
    expect(args[1].extends).toBe('div');
    expect(args[1].prototype.one).toBe('two');
    return expect(args[1].prototype.cloneNode).toBeDefined();
  }));

  describe("when the extends key is an object", () => it("extends from the prototype of the specified object", function() {
    class SomeClass {
      someClassMethod() {}
    }

    registerSpy.andReturn('ok');
    expect(registerElement('my-tag', {one: 'two', extends: SomeClass})).toBe('ok');

    const {
      args
    } = registerSpy.mostRecentCall;
    expect(args[0]).toBe('my-tag');
    expect(args[1].extends).toBeUndefined();
    expect(args[1].prototype.one).toBe('two');
    expect(args[1].prototype.someClassMethod).toBeDefined();
    return expect(args[1].prototype.cloneNode).toBeUndefined();
  }));

  return describe("when a modelConstructor is passed in", function() {
    beforeEach(() => spyOn(atom.views, 'addViewProvider'));

    return it("registers the new element as a view provider on atom.views", function() {
      registerSpy.andReturn('view');
      class Model {
        constructor() {}
      }

      expect(registerElement('my-tag', {one: 'two', modelConstructor: Model})).toBe('view');

      const {
        args
      } = registerSpy.mostRecentCall;
      expect(args[0]).toBe('my-tag');
      expect(args[1].extends).toBeUndefined();
      expect(args[1].prototype.one).toBe('two');
      expect(args[1].prototype.cloneNode).toBeDefined();

      return expect(atom.views.addViewProvider).toHaveBeenCalledWith({
        modelConstructor: Model,
        viewConstructor: 'view'
      });
    });
  });
});

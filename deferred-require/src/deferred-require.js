/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
require('harmony-reflect');
const Module = require('module');

module.exports = function(path, errorHandler) {
  const target = new Function;
  target.path = path;
  target.errorHandler = errorHandler;
  target.__proto__ = RequireProxyTarget;
  return Proxy(target, RequireProxyHandler);
};

var RequireProxyTarget = {
  getModule() {
    return this.module != null ? this.module : (this.module = this.requireModule());
  },

  requireModule() {
    if (this.errorHandler != null) {
      try {
        return Module.prototype.require.call(module.parent, this.path);
      } catch (error) {
        const handlerResult = this.errorHandler(error);
        if (typeof handlerResult === 'object') {
          return handlerResult;
        } else {
          return {};
        }
      }
    } else {
      return Module.prototype.require.call(module.parent, this.path);
    }
  }
};

var RequireProxyHandler = {
  get(target, name, receiver) {
    return Reflect.get(target.getModule(), name, receiver);
  },

  set(target, name, receiver) {
    return Reflect.set(target.getModule(), name, receiver);
  },

  has(target, name) {
    return Reflect.has(target.getModule(), name);
  },

  apply(target, receiver, args) {
    return Reflect.apply(target.getModule(), receiver, args);
  },

  construct(target, args) {
    return Reflect.construct(target.getModule(), args);
  },

  getOwnPropertyDescriptor(target, name, desc) {
    return Reflect.getOwnPropertyDescriptor(target.getModule(), name, desc);
  },

  defineProperty(target, name, desc) {
    return Reflect.defineProperty(target.getModule(), name, desc);
  },

  getPrototypeOf(target, name, desc) {
    return Reflect.getPrototypeOf(target.getModule(), name, desc);
  },

  setPrototypeOf(target, newProto) {
    return Reflect.setPrototypeOf(target.getModule(), newProto);
  },

  deleteProperty(target, name) {
    return Reflect.deleteProperty(target.getModule(), name);
  },

  enumerate(target) {
    return Reflect.enumerate(target.getModule());
  },

  preventExtensions(target) {
    return Reflect.preventExtensions(target.getModule());
  },

  isExtensible(target) {
    return Reflect.isExtensible(target.getModule());
  },

  ownKeys(target) {
    return Reflect.ownKeys(target.getModule());
  },

  hasOwn(target, name) {
    return Reflect.hasOwn(target.getModule(), name);
  },

  getOwnPropertyNames(target) {
    return Reflect.getOwnPropertyNames(target.getModule());
  },

  keys(target) {
    return Reflect.keys(target.getModule());
  },

  freeze(target) {
    return Reflect.freeze(target.getModule());
  },

  seal(target) {
    return Reflect.seal(target.getModule());
  },

  isFrozen(target) {
    return Reflect.isFrozen(target.getModule());
  },

  isSealed(target) {
    return Reflect.isSealed(target.getModule());
  },

  iterate(target) {
    return Reflect.iterate(target.getModule());
  }
};

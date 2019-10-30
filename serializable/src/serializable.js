/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Serializable;
const {extend} = require('underscore-plus');
const Mixin = require('mixto');
const getParameterNames = require('get-parameter-names');

module.exports =
(Serializable = (function() {
  Serializable = class Serializable extends Mixin {
    static initClass() {
      this.prototype.deserializers = null;
    }

    static registerDeserializers(...deserializers) {
      return Array.from(deserializers).map((deserializer) => this.registerDeserializer(deserializer));
    }

    static registerDeserializer(deserializer) {
      if (this.deserializers == null) { this.deserializers = {}; }
      return this.deserializers[deserializer.name] = deserializer;
    }

    static deserialize(state, params) {
      let deserializer;
      if (state == null) { return; }

      if (state.deserializer === this.name) {
        deserializer = this;
      } else {
        deserializer = this.deserializers != null ? this.deserializers[state.deserializer] : undefined;
      }

      if ((deserializer == null) || (deserializer.version !== state.version)) { return; }

      const object = Object.create(deserializer.prototype);
      params = extend({}, state, params);
      delete params.deserializer;

      if (typeof object.deserializeParams === 'function') {
        params = object.deserializeParams(params);
      }

      if (params == null) { return; }

      if (deserializer.parameterNames == null) { deserializer.parameterNames = getParameterNames(deserializer); }
      if ((deserializer.parameterNames.length > 1) || params.hasOwnProperty(deserializer.parameterNames[0])) {
        const orderedParams = deserializer.parameterNames.map(name => params[name]);
        deserializer.call(object, ...Array.from(orderedParams));
      } else {
        deserializer.call(object, params);
      }
      return object;
    }

    serialize() {
      let left;
      const state = (left = (typeof this.serializeParams === 'function' ? this.serializeParams() : undefined)) != null ? left : {};
      state.deserializer = this.constructor.name;
      if (this.constructor.version != null) { state.version = this.constructor.version; }
      return state;
    }

    testSerialization(params) {
      return this.constructor.deserialize(this.serialize(), params);
    }
  };
  Serializable.initClass();
  return Serializable;
})());

/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let PropertySet;
const {deepExtend} = require('underscore-plus');
const {hasKeyPath, getValueAtKeyPath} = require('key-path-helpers');

module.exports =
(PropertySet = class PropertySet {
  constructor(source, selector, properties) {
    this.source = source;
    this.selector = selector;
    this.properties = properties;
    this.name = this.source; // Supports deprecated usage
  }

  matches(scope) {
    return this.selector.matches(scope);
  }

  compare(other) {
    return this.selector.compare(other.selector);
  }

  merge(other) {
    return new PropertySet(this.source, this.selector, deepExtend({}, other.properties, this.properties));
  }

  has(keyPath) {
    return hasKeyPath(this.properties, keyPath);
  }

  get(keyPath) {
    return getValueAtKeyPath(this.properties, keyPath);
  }
});

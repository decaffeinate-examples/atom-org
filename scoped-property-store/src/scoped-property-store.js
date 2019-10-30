/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ScopedPropertyStore;
const slick = require('atom-slick');
const _ = require('underscore-plus');
const {getValueAtKeyPath} = require('key-path-helpers');
const {includeDeprecatedAPIs, deprecate} = require('grim');
const {Disposable, CompositeDisposable} = require('event-kit');
const Selector = require('./selector');
const PropertySet = require('./property-set');
const {isPlainObject, checkValueAtKeyPath, deepDefaults, deepClone} = require('./helpers');

// Public:
module.exports =
(ScopedPropertyStore = class ScopedPropertyStore {
  constructor() {
    this.cache = {};
    this.propertySets = [];
    this.escapeCharacterRegex = /[-!"#$%&'*+,/:;=?@|^~()<>{}[\]]/g;
  }

  // Public: Add scoped properties to be queried with {::get}
  //
  // * `source` A string describing these properties to allow them to be removed
  //   later.
  // * `propertiesBySelector` An {Object} containing CSS-selectors mapping to
  //   {Objects} containing properties. For example: `{'.foo .bar': {x: 1, y: 2}`
  //
  // Returns a {Disposable} on which you can call `.dispose()` to remove the
  // added properties.
  addProperties(source, propertiesBySelector, options) {
    this.bustCache();
    const compositeDisposable = new CompositeDisposable;
    for (let selectorSource in propertiesBySelector) {
      const properties = propertiesBySelector[selectorSource];
      for (let selector of Array.from(Selector.create(selectorSource, options))) {
        compositeDisposable.add(this.addPropertySet(new PropertySet(source, selector, properties)));
      }
    }
    this.propertySets.sort((a, b) => a.compare(b));
    return compositeDisposable;
  }

  // Public: Get the value of a previously stored key-path in a given scope.
  //
  // * `scopeChain` This describes a location in the document. It uses the same
  //   syntax as selectors, with each space-separated component representing one
  //   element.
  // * `keyPath` A `.` separated string of keys to traverse in the properties.
  // * `options` (optional) {Object}
  //   * `sources` (optional) {Array} of {String} source names. If provided, only
  //     values that were associated with these sources during {::addProperties}
  //     will be used.
  //   * `excludeSources` (optional) {Array} of {String} source names. If provided,
  //     values that  were associated with these sources during {::addProperties}
  //     will not be used.
  //
  // Returns the property value or `undefined` if none is found.
  getPropertyValue(scopeChain, keyPath, options) {
    let excludeSources, sources;
    if (options != null) { ({sources, excludeSources} = options); }

    return this.withCaching(`getPropertyValue:${scopeChain}:${keyPath}`, ((sources != null) || (excludeSources != null)), () => {
      const scopes = this.parseScopeChain(scopeChain);
      let mergedValue = undefined;
      let hasMergedValue = false;

      while (scopes.length > 0) {
        for (let set of Array.from(this.propertySets)) {
          if ((excludeSources != null) && (Array.from(excludeSources).includes(set.source))) { continue; }
          if ((sources != null) && !(Array.from(sources).includes(set.source))) { continue; }

          if (set.matches(scopes)) {
            const [value, hasValue] = Array.from(checkValueAtKeyPath(set.properties, keyPath));
            if (hasValue) {
              if (hasMergedValue) {
                deepDefaults(mergedValue, value);
              } else {
                hasMergedValue = true;
                mergedValue = deepClone(value);
              }
              if (!isPlainObject(mergedValue)) { return mergedValue; }
            }
          }
        }

        scopes.pop();
      }
      return mergedValue;
    });
  }

  // Public: Get *all* values for the given key-path in a given scope.
  getAll(scopeChain, keyPath, options) {
    let excludeSources, sources;
    if (options != null) { ({sources, excludeSources} = options); }

    const scopes = this.parseScopeChain(scopeChain);
    const values = [];

    return this.withCaching(`getAll:${scopeChain}:${keyPath}`, ((sources != null) || (excludeSources != null)), () => {
      while (scopes.length > 0) {
        for (let set of Array.from(this.propertySets)) {
          if ((excludeSources != null) && (Array.from(excludeSources).includes(set.source))) { continue; }
          if ((sources != null) && !(Array.from(sources).includes(set.source))) { continue; }

          if (set.matches(scopes)) {
            const [value, hasValue] = Array.from(checkValueAtKeyPath(set.properties, keyPath));
            if (hasValue) {
              values.push({
                scopeSelector: set.selector.toString(),
                value
              });
            }
          }
        }

        scopes.pop();
      }
      return values;
    });
  }

  // Public: Get *all* properties for a given source.
  //
  // ## Examples
  //
  // ```coffee
  // store.addProperties('some-source', {'.source.ruby': {foo: 'bar'}})
  // store.addProperties('some-source', {'.source.ruby': {omg: 'wow'}})
  // store.propertiesForSource('some-source') # => {'.source.ruby': {foo: 'bar', omg: 'wow'}}
  // ```
  //
  // * `source` {String}
  //
  // Returns an {Object} in the format {scope: {property: value}}
  propertiesForSource(source) {
    const propertySets = this.mergeMatchingPropertySets(this.propertySets.filter(set => set.source === source));

    const propertiesBySelector = {};
    for (let selector in propertySets) {
      const propertySet = propertySets[selector];
      propertiesBySelector[selector] = propertySet.properties;
    }
    return propertiesBySelector;
  }

  // Public: Get *all* properties matching the given source and scopeSelector.
  //
  // * `source` {String}
  // * `scopeSelector` {String} `scopeSelector` is matched exactly.
  //
  // Returns an {Object} in the format {property: value}
  propertiesForSourceAndSelector(source, scopeSelector) {
    const propertySets = this.mergeMatchingPropertySets(this.propertySets.filter(set => set.source === source));

    const properties = {};
    for (let selector of Array.from(Selector.create(scopeSelector))) {
      for (let setSelector in propertySets) {
        const propertySet = propertySets[setSelector];
        if (selector.isEqual(setSelector)) { _.extend(properties, propertySet.properties); }
      }
    }
    return properties;
  }

  // Public: Get *all* properties matching the given scopeSelector.
  //
  // * `scopeSelector` {String} `scopeSelector` is matched exactly.
  //
  // Returns an {Object} in the format {property: value}
  propertiesForSelector(scopeSelector) {
    const propertySets = this.mergeMatchingPropertySets(this.propertySets);

    const properties = {};
    for (let selector of Array.from(Selector.create(scopeSelector))) {
      for (let setSelector in propertySets) {
        const propertySet = propertySets[setSelector];
        if (selector.isEqual(setSelector)) { _.extend(properties, propertySet.properties); }
      }
    }
    return properties;
  }

  // Public: Remove all properties for a given source.
  //
  // * `source` {String}
  removePropertiesForSource(source) {
    this.bustCache();
    return this.propertySets = this.propertySets.filter(set => set.source !== source);
  }

  // Public: Remove all properties for a given source.
  //
  // * `source` {String}
  // * `scopeSelector` {String} `scopeSelector` is matched exactly.
  removePropertiesForSourceAndSelector(source, scopeSelector) {
    this.bustCache();
    for (var selector of Array.from(Selector.create(scopeSelector))) {
      this.propertySets = this.propertySets.filter(set => !((set.source === source) && set.selector.isEqual(selector)));
    }
  }

  mergeMatchingPropertySets(propertySets) {
    const merged = {};
    for (let propertySet of Array.from(propertySets)) {
      var matchingPropertySet;
      const selector = propertySet.selector.toString() || '*';
      if ((matchingPropertySet = merged[selector])) {
        merged[selector] = matchingPropertySet.merge(propertySet);
      } else {
        merged[selector] = propertySet;
      }
    }
    return merged;
  }

  bustCache() {
    return this.cache = {};
  }

  withCaching(cacheKey, skipCache, callback) {
    if (skipCache) { return callback(); }
    if (this.cache.hasOwnProperty(cacheKey)) {
      return this.cache[cacheKey];
    } else {
      return this.cache[cacheKey] = callback();
    }
  }

  addPropertySet(propertySet) {
    this.propertySets.push(propertySet);
    return new Disposable(() => {
      const index = this.propertySets.indexOf(propertySet);
      if (index > -1) { this.propertySets.splice(index, 1); }
      return this.bustCache();
    });
  }

  parseScopeChain(scopeChain) {
    let left;
    scopeChain = scopeChain.replace(this.escapeCharacterRegex, match => `\\${match[0]}`);
    return Array.from((left = slick.parse(scopeChain)[0]) != null ? left : []);
  }
});

if (includeDeprecatedAPIs) {
  ScopedPropertyStore.prototype.removeProperties = function(source) {
    deprecate('::addProperties() now returns a disposable. Call .dispose() on that instead.');
    return this.removePropertiesForSource(source);
  };
}

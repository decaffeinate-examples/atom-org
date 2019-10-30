/** @babel */
/* eslint-disable
    no-prototype-builtins,
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
const { splitKeyPath } = require('key-path-helpers')

// Public: Check if `value` is an {Object}
const isPlainObject = value => (value != null ? value.constructor : undefined) === Object

// Public: Get an object's value for a given key-path, and also an indication
// of whether or not the object would affect the key-path in a deep-merge.
//
// Returns an {Array} with two elements:
// * `value` The value at the given key-path, or `undefined` if there isn't one.
// * `hasValue` A {Boolean} value:
//   * `true` if `object` would override the given key-path if deep-merged
//      into another {Object} (see {::deepDefaults}). This means either `object`
//      has a value for the given key-path, `object` is not an {Object}, or one
//      of `object`'s children on the key-path is not an {Object}.
//   * `false` if the object would not alter the given key-path if deep-merged
//     into another {Object}.
const checkValueAtKeyPath = function (object, keyPath) {
  for (const key of Array.from(splitKeyPath(keyPath))) {
    if (isPlainObject(object)) {
      if (object.hasOwnProperty(key)) {
        object = object[key]
      } else {
        return [undefined, false]
      }
    } else {
      return [undefined, true]
    }
  }
  return [object, true]
}

// Public: Fill in missing values in `target` with those from `defaults`,
// recursing into any nested {Objects}
var deepDefaults = function (target, defaults) {
  if (isPlainObject(target) && isPlainObject(defaults)) {
    for (const key of Array.from(Object.keys(defaults))) {
      if (target.hasOwnProperty(key)) {
        deepDefaults(target[key], defaults[key])
      } else {
        target[key] = defaults[key]
      }
    }
  }
}

var deepClone = function (value) {
  if (Array.isArray(value)) {
    return value.map(element => deepClone(element))
  } else if (isPlainObject(value)) {
    const result = {}
    for (const key of Array.from(Object.keys(value))) {
      result[key] = deepClone(value[key])
    }
    return result
  } else {
    return value
  }
}

module.exports = {
  isPlainObject, checkValueAtKeyPath, deepClone, deepDefaults
}

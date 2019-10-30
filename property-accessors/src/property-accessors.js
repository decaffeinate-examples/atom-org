/** @babel */
/* eslint-disable
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let PropertyAccessors
const Mixin = require('mixto')
const {
  WeakMap
} = global

module.exports =
(PropertyAccessors = class PropertyAccessors extends Mixin {
  accessor (name, definition) {
    if (typeof definition === 'function') {
      definition = { get: definition }
    }
    return Object.defineProperty(this, name, definition)
  }

  advisedAccessor (name, definition) {
    let getAdvice, setAdvice
    if (typeof definition === 'function') {
      getAdvice = definition
    } else {
      getAdvice = definition.get
      setAdvice = definition.set
    }

    const values = new WeakMap()
    return this.accessor(name, {
      get () {
        if (getAdvice != null) {
          getAdvice.call(this)
        }
        return values.get(this)
      },
      set (newValue) {
        if (setAdvice != null) {
          setAdvice.call(this, newValue, values.get(this))
        }
        return values.set(this, newValue)
      }
    }
    )
  }

  lazyAccessor (name, definition) {
    const values = new WeakMap()
    return this.accessor(name, {
      get () {
        if (values.has(this)) {
          return values.get(this)
        } else {
          values.set(this, definition.call(this))
          return values.get(this)
        }
      },
      set (value) {
        return values.set(this, value)
      }
    }
    )
  }
})

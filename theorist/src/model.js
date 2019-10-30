/** @babel */
/* eslint-disable
    no-cond-assign,
    no-prototype-builtins,
    no-return-assign,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Model
const { Behavior, Subscriber, Emitter } = require('emissary')
const PropertyAccessors = require('property-accessors')
const Delegator = require('delegato')

let nextInstanceId = 1

module.exports =
(Model = (function () {
  Model = class Model {
    static initClass () {
      Subscriber.includeInto(this)
      Emitter.includeInto(this)
      PropertyAccessors.includeInto(this)
      Delegator.includeInto(this)

      this.prototype.declaredPropertyValues = null
      this.prototype.behaviors = null
      this.prototype.alive = true

      this.prototype.advisedAccessor('id',
        { set (id) { if (id >= nextInstanceId) { return nextInstanceId = id + 1 } } })
    }

    static resetNextInstanceId () { return nextInstanceId = 1 }

    static properties (...args) {
      if (typeof args[0] === 'object') {
        return (() => {
          const result = []
          for (const name in args[0]) {
            const defaultValue = args[0][name]
            result.push(this.property(name, defaultValue))
          }
          return result
        })()
      } else {
        return Array.from(args).map((arg) => this.property(arg))
      }
    }

    static property (name, defaultValue) {
      if (this.declaredProperties == null) { this.declaredProperties = {} }
      this.declaredProperties[name] = defaultValue

      this.prototype.accessor(name, {
        get () { return this.get(name) },
        set (value) { return this.set(name, value) }
      }
      )

      return this.prototype.accessor(`$${name}`,
        { get () { return this.behavior(name) } })
    }

    static behavior (name, definition) {
      if (this.declaredBehaviors == null) { this.declaredBehaviors = {} }
      this.declaredBehaviors[name] = definition

      this.prototype.accessor(name,
        { get () { return this.behavior(name).getValue() } })

      return this.prototype.accessor(`$${name}`,
        { get () { return this.behavior(name) } })
    }

    static hasDeclaredProperty (name) {
      return (this.declaredProperties != null ? this.declaredProperties.hasOwnProperty(name) : undefined)
    }

    static hasDeclaredBehavior (name) {
      return (this.declaredBehaviors != null ? this.declaredBehaviors.hasOwnProperty(name) : undefined)
    }

    static evaluateDeclaredBehavior (name, instance) {
      return this.declaredBehaviors[name].call(instance)
    }

    constructor (params) {
      this.assignId(params != null ? params.id : undefined)
      for (const propertyName in this.constructor.declaredProperties) {
        if (params != null ? params.hasOwnProperty(propertyName) : undefined) {
          this.set(propertyName, params[propertyName])
        } else {
          if (this.get(propertyName, true) == null) { this.setDefault(propertyName) }
        }
      }
    }

    assignId (id) {
      return this.id != null ? this.id : (this.id = id != null ? id : nextInstanceId++)
    }

    setDefault (name) {
      let defaultValue = this.constructor.declaredProperties != null ? this.constructor.declaredProperties[name] : undefined
      if (typeof defaultValue === 'function') { defaultValue = defaultValue.call(this) }
      return this.set(name, defaultValue)
    }

    get (name, suppressDefault) {
      if (this.constructor.hasDeclaredProperty(name)) {
        if (this.declaredPropertyValues == null) { this.declaredPropertyValues = {} }
        if (!suppressDefault && !this.declaredPropertyValues.hasOwnProperty(name)) { this.setDefault(name) }
        return this.declaredPropertyValues[name]
      } else {
        return this[name]
      }
    }

    set (name, value) {
      if (typeof name === 'object') {
        const properties = name
        for (name in properties) { value = properties[name]; this.set(name, value) }
        return properties
      } else {
        if (this.get(name, true) !== value) {
          if (this.constructor.hasDeclaredProperty(name)) {
            if (this.declaredPropertyValues == null) { this.declaredPropertyValues = {} }
            this.declaredPropertyValues[name] = value
          } else {
            this[name] = value
          }
          __guard__(this.behaviors != null ? this.behaviors[name] : undefined, x => x.emitValue(value))
        }
        return value
      }
    }

    behavior (name) {
      let behavior
      if (this.behaviors == null) { this.behaviors = {} }
      if (behavior = this.behaviors[name]) {
        return behavior
      } else {
        if (this.constructor.hasDeclaredProperty(name)) {
          return this.behaviors[name] = new Behavior(this.get(name)).retain()
        } else if (this.constructor.hasDeclaredBehavior(name)) {
          return this.behaviors[name] = this.constructor.evaluateDeclaredBehavior(name, this).retain()
        }
      }
    }

    when (signal, action) {
      return this.subscribe(signal, value => {
        if (value) {
          if (typeof action === 'function') {
            return action.call(this)
          } else {
            return this[action]()
          }
        }
      })
    }

    destroy () {
      if (!this.isAlive()) { return }
      this.alive = false
      if (typeof this.destroyed === 'function') {
        this.destroyed()
      }
      this.unsubscribe()
      for (const name in this.behaviors) { const behavior = this.behaviors[name]; behavior.release() }
      return this.emit('destroyed')
    }

    isAlive () { return this.alive }

    isDestroyed () { return !this.isAlive() }
  }
  Model.initClass()
  return Model
})())

function __guard__ (value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined
}

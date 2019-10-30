/** @babel */
/* eslint-disable
    no-return-assign,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS201: Simplify complex destructure assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Delegator
const Mixin = require('mixto')

module.exports =
(Delegator = class Delegator extends Mixin {
  static delegatesProperties (...args) {
    const adjustedLength = Math.max(args.length, 1); const propertyNames = args.slice(0, adjustedLength - 1); const { toProperty, toMethod } = args[adjustedLength - 1]
    return Array.from(propertyNames).map((propertyName) =>
      (propertyName => {
        return Object.defineProperty(this.prototype, propertyName,
          (() => {
            if (toProperty != null) {
              return {
                get () {
                  return this[toProperty][propertyName]
                },
                set (value) {
                  return this[toProperty][propertyName] = value
                }
              }
            } else if (toMethod != null) {
              return {
                get () {
                  return this[toMethod]()[propertyName]
                },
                set (value) {
                  return this[toMethod]()[propertyName] = value
                }
              }
            } else {
              throw new Error('No delegation target specified')
            }
          })()
        )
      })(propertyName))
  }

  static delegatesMethods (...args) {
    const adjustedLength = Math.max(args.length, 1); const methodNames = args.slice(0, adjustedLength - 1); const { toProperty, toMethod } = args[adjustedLength - 1]
    return Array.from(methodNames).map((methodName) =>
      (methodName => {
        if (toProperty != null) {
          return this.prototype[methodName] = function (...args) { return this[toProperty][methodName](...Array.from(args || [])) }
        } else if (toMethod != null) {
          return this.prototype[methodName] = function (...args) { return this[toMethod]()[methodName](...Array.from(args || [])) }
        } else {
          throw new Error('No delegation target specified')
        }
      })(methodName))
  }

  static delegatesProperty (...args) { return this.delegatesProperties(...Array.from(args || [])) }
  static delegatesMethod (...args) { return this.delegatesMethods(...Array.from(args || [])) }
})

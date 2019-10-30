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
let Mixin
module.exports =
(Mixin = class Mixin {
  static includeInto (constructor) {
    this.extend(constructor.prototype)
    for (const name in this) {
      const value = this[name]
      if (ExcludedClassProperties.indexOf(name) === -1) {
        if (!constructor.hasOwnProperty(name)) { constructor[name] = value }
      }
    }
    return (this.included != null ? this.included.call(constructor) : undefined)
  }

  static extend (object) {
    for (const name of Array.from(Object.getOwnPropertyNames(this.prototype))) {
      if (ExcludedPrototypeProperties.indexOf(name) === -1) {
        if (!object.hasOwnProperty(name)) { object[name] = this.prototype[name] }
      }
    }
    return (this.prototype.extended != null ? this.prototype.extended.call(object) : undefined)
  }

  constructor () {
    if (typeof this.extended === 'function') {
      this.extended()
    }
  }
})

var ExcludedClassProperties = ['__super__']
for (const name in Mixin) { ExcludedClassProperties.push(name) }
var ExcludedPrototypeProperties = ['constructor', 'extended']

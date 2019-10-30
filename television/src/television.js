/** @babel */
/* eslint-disable
    no-cond-assign,
    no-return-assign,
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const buildVirtualNode = require('./build-virtual-node')
const buildTagFunctions = require('./build-tag-functions')
const CustomElementPrototype = require('./custom-element-prototype')

const elementConstructors = {}

const setDOMScheduler = domScheduler => CustomElementPrototype.domScheduler = domScheduler

const registerElement = function (name, prototype) {
  let elementConstructor
  const elementPrototype = Object.create(CustomElementPrototype)
  for (const key in prototype) { const value = prototype[key]; elementPrototype[key] = value }

  if (elementConstructor = elementConstructors[name]) {
    if (Object.getPrototypeOf(elementConstructor.prototype) !== HTMLElement.prototype) {
      throw new Error(`Already registered element '${name}'. Call .unregisterElement() on its constructor first.`)
    }
    Object.setPrototypeOf(elementConstructor.prototype, elementPrototype)
    return elementConstructor
  } else {
    elementConstructor = document.registerElement(name, { prototype: Object.create(elementPrototype) })
    elementConstructor.unregisterElement = function () {
      if (Object.getPrototypeOf(elementConstructor.prototype) === HTMLElement.prototype) {
        throw new Error(`Already unregistered element '${name}'.`)
      }
      return Object.setPrototypeOf(elementConstructor.prototype, HTMLElement.prototype)
    }
    return elementConstructors[name] = elementConstructor
  }
}

module.exports = { setDOMScheduler, buildTagFunctions, registerElement, buildVirtualNode }

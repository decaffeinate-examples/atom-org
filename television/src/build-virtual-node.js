/** @babel */
/* eslint-disable
    no-cond-assign,
    no-return-assign,
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
const VNode = require('virtual-dom/vnode/vnode')
const VText = require('virtual-dom/vnode/vtext')

const refsStack = require('./refs-stack')

class RefHook {
  constructor (refName) {
    this.refName = refName
  }

  hook (node) {
    let refs
    if (refs = refsStack[refsStack.length - 1]) {
      return refs[this.refName] = node
    }
  }

  unhook (node) {
    let refs
    if (refs = refsStack[refsStack.length - 1]) {
      return delete refs[this.refName]
    }
  }
}

module.exports = function () {
  let childrenIndex, properties
  const [tagName] = Array.from(arguments)
  if ((arguments[1] != null ? arguments[1].constructor : undefined) === Object) {
    const attributes = arguments[1]
    properties = { attributes }

    if (attributes.style != null) {
      properties.style = attributes.style
      delete attributes.style
    }

    if (attributes.className != null) {
      properties.className = attributes.className
      delete attributes.className
    }

    if (attributes.ref != null) {
      properties.ref = new RefHook(attributes.ref)
    }

    childrenIndex = 2
  } else {
    childrenIndex = 1
  }

  const children = []
  for (let i = childrenIndex, end = arguments.length; i < end; i++) {
    const child = arguments[i]
    if (typeof child === 'string') {
      children.push(new VText(child))
    } else if (typeof child === 'number') {
      children.push(new VText(child.toString()))
    } else if (child instanceof VNode) {
      children.push(child)
    }
  }

  const node = new VNode(tagName, properties, children)
  return node
}

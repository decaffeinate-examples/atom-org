/** @babel */
/* eslint-disable
    no-return-assign,
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const diff = require('virtual-dom/diff')
const patch = require('virtual-dom/patch')

const buildVirtualNode = require('./build-virtual-node')
const refsStack = require('./refs-stack')

module.exports = Object.create(HTMLElement.prototype, {
  domScheduler: {
    writable: true,
    value: {
      readDocument (fn) { return fn() },
      updateDocument (fn) { return fn() }
    }
  },

  createdCallback: {
    value () {
      this.refs = {}
      return (typeof this.didCreate === 'function' ? this.didCreate() : undefined)
    }
  },

  attachedCallback: {
    value () {
      this.updateSync()
      return (typeof this.didAttach === 'function' ? this.didAttach() : undefined)
    }
  },

  detachedCallback: {
    value () {
      if (typeof this.didDetach === 'function') {
        this.didDetach()
      }
      this.innerHTML = ''
      return this.refs = {}
    }
  },

  update: {
    value () {
      this.domScheduler.updateDocument(this.updateSync.bind(this))
      return this.domScheduler.readDocument(this.readSync.bind(this))
    }
  },

  updateSync: {
    writable: true,
    value () {
      if (this.oldVirtualDOM == null) { this.oldVirtualDOM = buildVirtualNode(this.tagName.toLowerCase()) }
      const newVirtualDOM = this.render()
      refsStack.push(this.refs)
      patch(this, diff(this.oldVirtualDOM, newVirtualDOM))
      refsStack.pop()
      return this.oldVirtualDOM = newVirtualDOM
    }
  },

  readSync: {
    writable: true,
    value () {}
  }
}
)

/** @babel */
/* eslint-disable
    no-unused-vars,
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
let ReferenceSpanSkipList
const { clone } = require('underscore')

// Test-only: This is a simple linear reference implementation of the behavior
// we want from the real skip-list-based implementation.
module.exports =
(ReferenceSpanSkipList = class ReferenceSpanSkipList {
  constructor (...args) {
    [...this.dimensions] = Array.from(args)
    this.nodes = []
  }

  splice (targetDimension, targetIndex, count, ...nodes) {
    return this.spliceArray(targetDimension, targetIndex, count, nodes)
  }

  spliceArray (targetDimension, targetIndex, count, nodes) {
    const index = this.totalTo(targetIndex, targetDimension).elements
    return this.nodes.splice(index, count, ...Array.from(nodes))
  }

  totalTo (targetTotal, targetDimension) {
    const total = this.buildInitialTotal()
    let i = 0
    while (i < this.nodes.length) {
      const current = this.nodes[i]
      if ((total[targetDimension] + (current[targetDimension] != null ? current[targetDimension] : 1)) > targetTotal) { break }
      this.incrementTotal(total, current)
      i++
    }
    return total
  }

  getElements () { return clone(this.nodes) }

  getLength (dimension) {
    return this.totalTo(Infinity, dimension)[dimension]
  }

  buildInitialTotal () {
    const total = { elements: 0 }
    for (const dimension of Array.from(this.dimensions)) { total[dimension] = 0 }
    return total
  }

  incrementTotal (total, node) {
    total.elements++
    return Array.from(this.dimensions).map((dimension) => (total[dimension] += node[dimension]))
  }
})

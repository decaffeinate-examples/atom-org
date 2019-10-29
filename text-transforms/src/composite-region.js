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
let CompositeRegion
const Point = require('./point')

module.exports =
(CompositeRegion = class CompositeRegion {
  constructor (children, sourceSpan, targetSpan) {
    this.children = children
    this.sourceSpan = sourceSpan
    this.targetSpan = targetSpan
  }

  getSourceSpan () {
    return this.sourceSpan != null ? this.sourceSpan : this.computeSourceSpan()
  }

  getTargetSpan () {
    return this.targetSpan != null ? this.targetSpan : this.computeTargetSpan()
  }

  computeSourceSpan () {
    let span = Point(0, 0)
    for (const child of Array.from(this.children)) { span = span.add(child.getSourceSpan()) }
    return span
  }

  computeTargetSpan () {
    let span = Point(0, 0)
    for (const child of Array.from(this.children)) {
      span = span.add(child.getTargetSpan())
    }
    return span
  }

  summarize () {
    return {
      sourceSpan: this.getSourceSpan().summarize(),
      targetSpan: this.getTargetSpan().summarize(),
      children: this.children.map(c => c.summarize())
    }
  }
})

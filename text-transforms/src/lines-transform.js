/** @babel */
/* eslint-disable
    no-cond-assign,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let LinesTransform
const Transform = require('./transform')
const Point = require('./point')

module.exports =
(LinesTransform = class LinesTransform extends Transform {
  getSubregion (sourceStart) {
    let nextNewlineStart
    if (nextNewlineStart = this.source.positionOf('\n', sourceStart)) {
      const region = this.source.slice(sourceStart, nextNewlineStart.add(0, 1))
      region.setTargetSpan(Point(1, 0))
      return region
    } else {
      return this.source.slice(sourceStart)
    }
  }
})

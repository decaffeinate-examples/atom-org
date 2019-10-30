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
let TextRegion
const Point = require('./point')

module.exports =
(TextRegion = class TextRegion {
  constructor (text, sourceSpan, targetSpan) {
    this.text = text
    this.sourceSpan = sourceSpan
    this.targetSpan = targetSpan
    if (this.sourceSpan == null) { this.sourceSpan = Point(0, this.text.length) }
    if (this.targetSpan == null) { this.targetSpan = Point(0, this.text.length) }
  }

  getSourceSpan () { return this.sourceSpan }

  setSourceSpan (sourceSpan) { this.sourceSpan = sourceSpan; return this.sourceSpan }

  getTargetSpan () { return this.targetSpan }

  setTargetSpan (targetSpan) { this.targetSpan = targetSpan; return this.targetSpan }

  positionOf (string, startPosition) {
    const index = this.text.indexOf(string, startPosition.columns)
    if (index !== -1) { return Point(0, index) }
  }

  slice (start, end) {
    return new TextRegion(this.text.slice(start.columns, end != null ? end.columns : undefined))
  }

  summarize () {
    return {
      sourceSpan: this.sourceSpan.summarize(),
      targetSpan: this.targetSpan.summarize(),
      text: this.text
    }
  }
})

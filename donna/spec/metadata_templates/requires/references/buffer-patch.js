/** @babel */
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let TextBuffer
const { getTextOG } = require('./helpers')

module.exports =
(TextBuffer = (function () {
  TextBuffer = class TextBuffer {
    static initClass () {
      this.prototype.getText = getTextOG
    }
  }
  TextBuffer.initClass()
  return TextBuffer
})())

/** @babel */
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let GlobalVimState
module.exports =
(GlobalVimState = (function () {
  GlobalVimState = class GlobalVimState {
    static initClass () {
      this.prototype.registers = {}
      this.prototype.searchHistory = []
      this.prototype.currentSearch = {}
      this.prototype.currentFind = null
    }
  }
  GlobalVimState.initClass()
  return GlobalVimState
})())

/** @babel */
/* eslint-disable
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let EmojiCheatSheet
const Shell = require('shell')

module.exports =
(EmojiCheatSheet = class EmojiCheatSheet {
  static show () {
    return this.openUrlInBrowser('http://www.emoji-cheat-sheet.com/')
  }

  static openUrlInBrowser (url) {
    return Shell.openExternal(url)
  }
})

/** @babel */
/* eslint-disable
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const { Operator } = require('./general-operators')
const { Range } = require('atom')
const settings = require('../settings')

//
// It increases or decreases the next number on the line
//
class Increase extends Operator {
  static initClass () {
    this.prototype.step = 1
  }

  constructor () {
    super(...arguments)
    this.complete = true
    this.numberRegex = new RegExp(settings.numberRegex())
  }

  execute (count) {
    if (count == null) { count = 1 }
    return this.editor.transact(() => {
      let increased = false
      for (const cursor of Array.from(this.editor.getCursors())) {
        if (this.increaseNumber(count, cursor)) { increased = true }
      }
      if (!increased) { return atom.beep() }
    })
  }

  increaseNumber (count, cursor) {
    // find position of current number, adapted from from SearchCurrentWord
    const cursorPosition = cursor.getBufferPosition()
    let numEnd = cursor.getEndOfCurrentWordBufferPosition({ wordRegex: this.numberRegex, allowNext: false })

    if (numEnd.column === cursorPosition.column) {
      // either we don't have a current number, or it ends on cursor, i.e. precedes it, so look for the next one
      numEnd = cursor.getEndOfCurrentWordBufferPosition({ wordRegex: this.numberRegex, allowNext: true })
      if (numEnd.row !== cursorPosition.row) { return } // don't look beyond the current line
      if (numEnd.column === cursorPosition.column) { return } // no number after cursor
    }

    cursor.setBufferPosition(numEnd)
    const numStart = cursor.getBeginningOfCurrentWordBufferPosition({ wordRegex: this.numberRegex, allowPrevious: false })

    const range = new Range(numStart, numEnd)

    // parse number, increase/decrease
    let number = parseInt(this.editor.getTextInBufferRange(range), 10)
    if (isNaN(number)) {
      cursor.setBufferPosition(cursorPosition)
      return
    }

    number += this.step * count

    // replace current number with new
    const newValue = String(number)
    this.editor.setTextInBufferRange(range, newValue, { normalizeLineEndings: false })

    cursor.setBufferPosition({ row: numStart.row, column: (numStart.column - 1) + newValue.length })
    return true
  }
}
Increase.initClass()

class Decrease extends Increase {
  static initClass () {
    this.prototype.step = -1
  }
}
Decrease.initClass()

module.exports = { Increase, Decrease }

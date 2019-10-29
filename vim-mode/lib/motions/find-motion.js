/** @babel */
/* eslint-disable
    constructor-super,
    no-constant-condition,
    no-eval,
    no-this-before-super,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const { MotionWithInput } = require('./general-motions')
const { ViewModel } = require('../view-models/view-model')
const { Point, Range } = require('atom')

class Find extends MotionWithInput {
  static initClass () {
    this.prototype.operatesInclusively = true
  }

  constructor (editor, vimState, opts) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super() }
      const thisFn = (() => { return this }).toString()
      const thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1]
      eval(`${thisName} = this;`)
    }
    this.editor = editor
    this.vimState = vimState
    if (opts == null) { opts = {} }
    super(this.editor, this.vimState)
    this.offset = 0

    if (!opts.repeated) {
      this.viewModel = new ViewModel(this, { class: 'find', singleChar: true, hidden: true })
      this.backwards = false
      this.repeated = false
      this.vimState.globalVimState.currentFind = this
    } else {
      this.repeated = true

      const orig = this.vimState.globalVimState.currentFind
      this.backwards = orig.backwards
      this.complete = orig.complete
      this.input = orig.input

      if (opts.reverse) { this.reverse() }
    }
  }

  match (cursor, count) {
    let i, index
    const currentPosition = cursor.getBufferPosition()
    const line = this.editor.lineTextForBufferRow(currentPosition.row)
    if (this.backwards) {
      let asc, end
      index = currentPosition.column
      for (i = 0, end = count - 1, asc = end >= 0; asc ? i <= end : i >= end; asc ? i++ : i--) {
        if (index <= 0) { return } // we can't move backwards any further, quick return
        index = line.lastIndexOf(this.input.characters, index - 1 - (this.offset * this.repeated))
      }
      if (index >= 0) {
        return new Point(currentPosition.row, index + this.offset)
      }
    } else {
      let asc1, end1
      index = currentPosition.column
      for (i = 0, end1 = count - 1, asc1 = end1 >= 0; asc1 ? i <= end1 : i >= end1; asc1 ? i++ : i--) {
        index = line.indexOf(this.input.characters, index + 1 + (this.offset * this.repeated))
        if (index < 0) { return }
      } // no match found
      if (index >= 0) {
        return new Point(currentPosition.row, index - this.offset)
      }
    }
  }

  reverse () {
    this.backwards = !this.backwards
    return this
  }

  moveCursor (cursor, count) {
    let match
    if (count == null) { count = 1 }
    if ((match = this.match(cursor, count)) != null) {
      return cursor.setBufferPosition(match)
    }
  }
}
Find.initClass()

class Till extends Find {
  constructor (editor, vimState, opts) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super() }
      const thisFn = (() => { return this }).toString()
      const thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1]
      eval(`${thisName} = this;`)
    }
    this.editor = editor
    this.vimState = vimState
    if (opts == null) { opts = {} }
    super(this.editor, this.vimState, opts)
    this.offset = 1
  }

  match () {
    this.selectAtLeastOne = false
    const retval = super.match(...arguments)
    if ((retval != null) && !this.backwards) {
      this.selectAtLeastOne = true
    }
    return retval
  }

  moveSelectionInclusively (selection, count, options) {
    super.moveSelectionInclusively(...arguments)
    if (selection.isEmpty() && this.selectAtLeastOne) {
      return selection.modifySelection(() => selection.cursor.moveRight())
    }
  }
}

module.exports = { Find, Till }

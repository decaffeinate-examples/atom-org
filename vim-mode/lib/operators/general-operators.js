/** @babel */
/* eslint-disable
    constructor-super,
    no-constant-condition,
    no-eval,
    no-return-assign,
    no-self-assign,
    no-this-before-super,
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const _ = require('underscore-plus')
const { Point, Range } = require('atom')
const { ViewModel } = require('../view-models/view-model')
const Utils = require('../utils')
const settings = require('../settings')

class OperatorError {
  constructor (message) {
    this.message = message
    this.name = 'Operator Error'
  }
}

class Operator {
  static initClass () {
    this.prototype.vimState = null
    this.prototype.motion = null
    this.prototype.complete = null
  }

  constructor (editor, vimState) {
    this.editor = editor
    this.vimState = vimState
    this.complete = false
  }

  // Public: Determines when the command can be executed.
  //
  // Returns true if ready to execute and false otherwise.
  isComplete () { return this.complete }

  // Public: Determines if this command should be recorded in the command
  // history for repeats.
  //
  // Returns true if this command should be recorded.
  isRecordable () { return true }

  // Public: Marks this as ready to execute and saves the motion.
  //
  // motion - The motion used to select what to operate on.
  //
  // Returns nothing.
  compose (motion) {
    if (!motion.select) {
      throw new OperatorError('Must compose with a motion')
    }

    this.motion = motion
    return this.complete = true
  }

  canComposeWith (operation) { return (operation.select != null) }

  // Public: Preps text and sets the text register
  //
  // Returns nothing
  setTextRegister (register, text) {
    let type
    if (__guardMethod__(this.motion, 'isLinewise', o => o.isLinewise())) {
      type = 'linewise'
      if (text.slice(-1) !== '\n') {
        text += '\n'
      }
    } else {
      type = Utils.copyType(text)
    }
    if (text !== '') { return this.vimState.setRegister(register, { text, type }) }
  }
}
Operator.initClass()

// Public: Generic class for an operator that requires extra input
class OperatorWithInput extends Operator {
  constructor (editor, vimState) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super() }
      const thisFn = (() => { return this }).toString()
      const thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1]
      eval(`${thisName} = this;`)
    }
    this.editor = editor
    this.vimState = vimState
    this.editor = this.editor
    this.complete = false
  }

  canComposeWith (operation) { return (operation.characters != null) || (operation.select != null) }

  compose (operation) {
    if (operation.select != null) {
      this.motion = operation
    }
    if (operation.characters != null) {
      this.input = operation
      return this.complete = true
    }
  }
}

//
// It deletes everything selected by the following motion.
//
class Delete extends Operator {
  static initClass () {
    this.prototype.register = null
  }

  constructor (editor, vimState) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super() }
      const thisFn = (() => { return this }).toString()
      const thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1]
      eval(`${thisName} = this;`)
    }
    this.editor = editor
    this.vimState = vimState
    this.complete = false
    this.register = settings.defaultRegister()
  }

  // Public: Deletes the text selected by the given motion.
  //
  // count - The number of times to execute.
  //
  // Returns nothing.
  execute (count) {
    if (_.contains(this.motion.select(count), true)) {
      this.setTextRegister(this.register, this.editor.getSelectedText())
      this.editor.transact(() => {
        return Array.from(this.editor.getSelections()).map((selection) =>
          selection.deleteSelectedText())
      })
      for (const cursor of Array.from(this.editor.getCursors())) {
        if (typeof this.motion.isLinewise === 'function' ? this.motion.isLinewise() : undefined) {
          cursor.skipLeadingWhitespace()
        } else {
          if (cursor.isAtEndOfLine() && !cursor.isAtBeginningOfLine()) { cursor.moveLeft() }
        }
      }
    }

    return this.vimState.activateNormalMode()
  }
}
Delete.initClass()

//
// It toggles the case of everything selected by the following motion
//
class ToggleCase extends Operator {
  constructor (editor, vimState, param) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super() }
      const thisFn = (() => { return this }).toString()
      const thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1]
      eval(`${thisName} = this;`)
    }
    this.editor = editor
    this.vimState = vimState
    if (param == null) { param = {} }
    const { complete } = param
    this.complete = complete
  }

  execute (count) {
    if (this.motion != null) {
      if (_.contains(this.motion.select(count), true)) {
        this.editor.replaceSelectedText({}, text => text.split('').map(function (char) {
          const lower = char.toLowerCase()
          if (char === lower) {
            return char.toUpperCase()
          } else {
            return lower
          }
        }).join(''))
      }
    } else {
      this.editor.transact(() => {
        return (() => {
          const result = []
          for (var cursor of Array.from(this.editor.getCursors())) {
            var point = cursor.getBufferPosition()
            var lineLength = this.editor.lineTextForBufferRow(point.row).length
            const cursorCount = Math.min(count != null ? count : 1, lineLength - point.column)

            result.push(_.times(cursorCount, () => {
              point = cursor.getBufferPosition()
              const range = Range.fromPointWithDelta(point, 0, 1)
              const char = this.editor.getTextInBufferRange(range)

              if (char === char.toLowerCase()) {
                this.editor.setTextInBufferRange(range, char.toUpperCase())
              } else {
                this.editor.setTextInBufferRange(range, char.toLowerCase())
              }

              if (!(point.column >= (lineLength - 1))) { return cursor.moveRight() }
            }))
          }
          return result
        })()
      })
    }

    return this.vimState.activateNormalMode()
  }
}

//
// In visual mode or after `g` with a motion, it makes the selection uppercase
//
class UpperCase extends Operator {
  constructor (editor, vimState) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super() }
      const thisFn = (() => { return this }).toString()
      const thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1]
      eval(`${thisName} = this;`)
    }
    this.editor = editor
    this.vimState = vimState
    this.complete = false
  }

  execute (count) {
    if (_.contains(this.motion.select(count), true)) {
      this.editor.replaceSelectedText({}, text => text.toUpperCase())
    }

    return this.vimState.activateNormalMode()
  }
}

//
// In visual mode or after `g` with a motion, it makes the selection lowercase
//
class LowerCase extends Operator {
  constructor (editor, vimState) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super() }
      const thisFn = (() => { return this }).toString()
      const thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1]
      eval(`${thisName} = this;`)
    }
    this.editor = editor
    this.vimState = vimState
    this.complete = false
  }

  execute (count) {
    if (_.contains(this.motion.select(count), true)) {
      this.editor.replaceSelectedText({}, text => text.toLowerCase())
    }

    return this.vimState.activateNormalMode()
  }
}

//
// It copies everything selected by the following motion.
//
class Yank extends Operator {
  static initClass () {
    this.prototype.register = null
  }

  constructor (editor, vimState) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super() }
      const thisFn = (() => { return this }).toString()
      const thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1]
      eval(`${thisName} = this;`)
    }
    this.editor = editor
    this.vimState = vimState
    this.editorElement = atom.views.getView(this.editor)
    this.register = settings.defaultRegister()
  }

  // Public: Copies the text selected by the given motion.
  //
  // count - The number of times to execute.
  //
  // Returns nothing.
  execute (count) {
    let newPositions, text
    const oldTop = this.editorElement.getScrollTop()
    const oldLeft = this.editorElement.getScrollLeft()
    const oldLastCursorPosition = this.editor.getCursorBufferPosition()

    const originalPositions = this.editor.getCursorBufferPositions()
    if (_.contains(this.motion.select(count), true)) {
      text = this.editor.getSelectedText()
      const startPositions = _.pluck(this.editor.getSelectedBufferRanges(), 'start')
      newPositions = (() => {
        const result = []
        for (let i = 0; i < originalPositions.length; i++) {
          const originalPosition = originalPositions[i]
          if (startPositions[i]) {
            let position = Point.min(startPositions[i], originalPositions[i])
            if ((this.vimState.mode !== 'visual') && (typeof this.motion.isLinewise === 'function' ? this.motion.isLinewise() : undefined)) {
              position = new Point(position.row, originalPositions[i].column)
            }
            result.push(position)
          } else {
            result.push(originalPosition)
          }
        }
        return result
      })()
    } else {
      text = ''
      newPositions = originalPositions
    }

    this.setTextRegister(this.register, text)

    this.editor.setSelectedBufferRanges(newPositions.map(p => new Range(p, p)))

    if (oldLastCursorPosition.isEqual(this.editor.getCursorBufferPosition())) {
      this.editorElement.setScrollLeft(oldLeft)
      this.editorElement.setScrollTop(oldTop)
    }

    return this.vimState.activateNormalMode()
  }
}
Yank.initClass()

//
// It combines the current line with the following line.
//
class Join extends Operator {
  constructor (editor, vimState) {
    { // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super() } const thisFn = (() => { return this }).toString(); const thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1]; eval(`${thisName} = this;`) } this.editor = editor; this.vimState = vimState; this.complete = true
  }

  // Public: Combines the current with the following lines
  //
  // count - The number of times to execute.
  //
  // Returns nothing.
  execute (count) {
    if (count == null) { count = 1 }
    this.editor.transact(() => {
      return _.times(count, () => {
        return this.editor.joinLines()
      })
    })
    return this.vimState.activateNormalMode()
  }
}

//
// Repeat the last operation
//
class Repeat extends Operator {
  constructor (editor, vimState) {
    { // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super() } const thisFn = (() => { return this }).toString(); const thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1]; eval(`${thisName} = this;`) } this.editor = editor; this.vimState = vimState; this.complete = true
  }

  isRecordable () { return false }

  execute (count) {
    if (count == null) { count = 1 }
    return this.editor.transact(() => {
      return _.times(count, () => {
        const cmd = this.vimState.history[0]
        return (cmd != null ? cmd.execute() : undefined)
      })
    })
  }
}
//
// It creates a mark at the current cursor position
//
class Mark extends OperatorWithInput {
  constructor (editor, vimState) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super() }
      const thisFn = (() => { return this }).toString()
      const thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1]
      eval(`${thisName} = this;`)
    }
    this.editor = editor
    this.vimState = vimState
    super(this.editor, this.vimState)
    this.viewModel = new ViewModel(this, { class: 'mark', singleChar: true, hidden: true })
  }

  // Public: Creates the mark in the specified mark register (from user input)
  // at the current position
  //
  // Returns nothing.
  execute () {
    this.vimState.setMark(this.input.characters, this.editor.getCursorBufferPosition())
    return this.vimState.activateNormalMode()
  }
}

module.exports = {
  Operator,
  OperatorWithInput,
  OperatorError,
  Delete,
  ToggleCase,
  UpperCase,
  LowerCase,
  Yank,
  Join,
  Repeat,
  Mark
}

function __guardMethod__ (obj, methodName, transform) {
  if (typeof obj !== 'undefined' && obj !== null && typeof obj[methodName] === 'function') {
    return transform(obj, methodName)
  } else {
    return undefined
  }
}

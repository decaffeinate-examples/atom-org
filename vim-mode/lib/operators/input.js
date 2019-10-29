/** @babel */
/* eslint-disable
    constructor-super,
    no-constant-condition,
    no-eval,
    no-return-assign,
    no-this-before-super,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const Motions = require('../motions/index')
const { Operator, Delete } = require('./general-operators')
const _ = require('underscore-plus')
const settings = require('../settings')

// The operation for text entered in input mode. Broadly speaking, input
// operators manage an undo transaction and set a @typingCompleted variable when
// it's done. When the input operation is completed, the typingCompleted variable
// tells the operation to repeat itself instead of enter insert mode.
class Insert extends Operator {
  static initClass () {
    this.prototype.standalone = true
  }

  isComplete () { return this.standalone || super.isComplete(...arguments) }

  confirmChanges (changes) {
    if (changes.length > 0) {
      return this.typedText = changes[0].newText
    } else {
      return this.typedText = ''
    }
  }

  execute () {
    if (this.typingCompleted) {
      if ((this.typedText == null) || !(this.typedText.length > 0)) { return }
      this.editor.insertText(this.typedText, { normalizeLineEndings: true, autoIndent: true })
      for (const cursor of Array.from(this.editor.getCursors())) {
        if (!cursor.isAtBeginningOfLine()) { cursor.moveLeft() }
      }
    } else {
      this.vimState.activateInsertMode()
      this.typingCompleted = true
    }
  }

  inputOperator () { return true }
}
Insert.initClass()

class ReplaceMode extends Insert {
  execute () {
    if (this.typingCompleted) {
      if ((this.typedText == null) || !(this.typedText.length > 0)) { return }
      return this.editor.transact(() => {
        this.editor.insertText(this.typedText, { normalizeLineEndings: true })
        const toDelete = this.typedText.length - this.countChars('\n', this.typedText)
        for (const selection of Array.from(this.editor.getSelections())) {
          let count = toDelete
          while (count-- && !selection.cursor.isAtEndOfLine()) { selection.delete() }
        }
        return (() => {
          const result = []
          for (const cursor of Array.from(this.editor.getCursors())) {
            if (!cursor.isAtBeginningOfLine()) { result.push(cursor.moveLeft()) } else {
              result.push(undefined)
            }
          }
          return result
        })()
      })
    } else {
      this.vimState.activateReplaceMode()
      return this.typingCompleted = true
    }
  }

  countChars (char, string) {
    return string.split(char).length - 1
  }
}

class InsertAfter extends Insert {
  execute () {
    if (!this.editor.getLastCursor().isAtEndOfLine()) { this.editor.moveRight() }
    return super.execute(...arguments)
  }
}

class InsertAfterEndOfLine extends Insert {
  execute () {
    this.editor.moveToEndOfLine()
    return super.execute(...arguments)
  }
}

class InsertAtBeginningOfLine extends Insert {
  execute () {
    this.editor.moveToBeginningOfLine()
    this.editor.moveToFirstCharacterOfLine()
    return super.execute(...arguments)
  }
}

class InsertAboveWithNewline extends Insert {
  execute () {
    if (!this.typingCompleted) { this.vimState.setInsertionCheckpoint() }
    this.editor.insertNewlineAbove()
    this.editor.getLastCursor().skipLeadingWhitespace()

    if (this.typingCompleted) {
      // We'll have captured the inserted newline, but we want to do that
      // over again by hand, or differing indentations will be wrong.
      this.typedText = this.typedText.trimLeft()
      return super.execute(...arguments)
    }

    this.vimState.activateInsertMode()
    return this.typingCompleted = true
  }
}

class InsertBelowWithNewline extends Insert {
  execute () {
    if (!this.typingCompleted) { this.vimState.setInsertionCheckpoint() }
    this.editor.insertNewlineBelow()
    this.editor.getLastCursor().skipLeadingWhitespace()

    if (this.typingCompleted) {
      // We'll have captured the inserted newline, but we want to do that
      // over again by hand, or differing indentations will be wrong.
      this.typedText = this.typedText.trimLeft()
      return super.execute(...arguments)
    }

    this.vimState.activateInsertMode()
    return this.typingCompleted = true
  }
}

//
// Delete the following motion and enter insert mode to replace it.
//
class Change extends Insert {
  static initClass () {
    this.prototype.standalone = false
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
    this.register = settings.defaultRegister()
  }

  // Public: Changes the text selected by the given motion.
  //
  // count - The number of times to execute.
  //
  // Returns nothing.
  execute (count) {
    if (_.contains(this.motion.select(count, { excludeWhitespace: true }), true)) {
      // If we've typed, we're being repeated. If we're being repeated,
      // undo transactions are already handled.
      let selection
      if (!this.typingCompleted) { this.vimState.setInsertionCheckpoint() }

      this.setTextRegister(this.register, this.editor.getSelectedText())
      if ((typeof this.motion.isLinewise === 'function' ? this.motion.isLinewise() : undefined) && !this.typingCompleted) {
        for (selection of Array.from(this.editor.getSelections())) {
          if (selection.getBufferRange().end.row === 0) {
            selection.deleteSelectedText()
          } else {
            selection.insertText('\n', { autoIndent: true })
          }
          selection.cursor.moveLeft()
        }
      } else {
        for (selection of Array.from(this.editor.getSelections())) {
          selection.deleteSelectedText()
        }
      }

      if (this.typingCompleted) { return super.execute(...arguments) }

      this.vimState.activateInsertMode()
      return this.typingCompleted = true
    } else {
      return this.vimState.activateNormalMode()
    }
  }
}
Change.initClass()

module.exports = {
  Insert,
  InsertAfter,
  InsertAfterEndOfLine,
  InsertAtBeginningOfLine,
  InsertAboveWithNewline,
  InsertBelowWithNewline,
  ReplaceMode,
  Change
}

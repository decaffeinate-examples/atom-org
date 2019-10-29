/** @babel */
/* eslint-disable
    constructor-super,
    no-constant-condition,
    no-eval,
    no-this-before-super,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class Scroll {
  isComplete () { return true }
  isRecordable () { return false }
  constructor (editorElement) {
    this.editorElement = editorElement
    this.scrolloff = 2 // atom default
    this.editor = this.editorElement.getModel()
    this.rows = {
      first: this.editorElement.getFirstVisibleScreenRow(),
      last: this.editorElement.getLastVisibleScreenRow(),
      final: this.editor.getLastScreenRow()
    }
  }
}

class ScrollDown extends Scroll {
  execute (count) {
    if (count == null) { count = 1 }
    const oldFirstRow = this.editor.getFirstVisibleScreenRow()
    this.editor.setFirstVisibleScreenRow(oldFirstRow + count)
    const newFirstRow = this.editor.getFirstVisibleScreenRow()

    for (const cursor of Array.from(this.editor.getCursors())) {
      const position = cursor.getScreenPosition()
      if (position.row <= (newFirstRow + this.scrolloff)) {
        cursor.setScreenPosition([(position.row + newFirstRow) - oldFirstRow, position.column], { autoscroll: false })
      }
    }

    // TODO: remove
    // This is a workaround for a bug fixed in atom/atom#10062
    this.editorElement.component.updateSync()
  }
}

class ScrollUp extends Scroll {
  execute (count) {
    if (count == null) { count = 1 }
    const oldFirstRow = this.editor.getFirstVisibleScreenRow()
    const oldLastRow = this.editor.getLastVisibleScreenRow()
    this.editor.setFirstVisibleScreenRow(oldFirstRow - count)
    const newLastRow = this.editor.getLastVisibleScreenRow()

    for (const cursor of Array.from(this.editor.getCursors())) {
      const position = cursor.getScreenPosition()
      if (position.row >= (newLastRow - this.scrolloff)) {
        cursor.setScreenPosition([position.row - (oldLastRow - newLastRow), position.column], { autoscroll: false })
      }
    }

    // TODO: remove
    // This is a workaround for a bug fixed in atom/atom#10062
    this.editorElement.component.updateSync()
  }
}

class ScrollCursor extends Scroll {
  constructor (editorElement, opts) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super() }
      const thisFn = (() => { return this }).toString()
      const thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1]
      eval(`${thisName} = this;`)
    }
    this.editorElement = editorElement
    if (opts == null) { opts = {} }
    this.opts = opts
    super(...arguments)
    const cursor = this.editor.getCursorScreenPosition()
    this.pixel = this.editorElement.pixelPositionForScreenPosition(cursor).top
  }
}

class ScrollCursorToTop extends ScrollCursor {
  execute () {
    if (!this.opts.leaveCursor) { this.moveToFirstNonBlank() }
    return this.scrollUp()
  }

  scrollUp () {
    if (this.rows.last === this.rows.final) { return }
    this.pixel -= (this.editor.getLineHeightInPixels() * this.scrolloff)
    return this.editorElement.setScrollTop(this.pixel)
  }

  moveToFirstNonBlank () {
    return this.editor.moveToFirstCharacterOfLine()
  }
}

class ScrollCursorToMiddle extends ScrollCursor {
  execute () {
    if (!this.opts.leaveCursor) { this.moveToFirstNonBlank() }
    return this.scrollMiddle()
  }

  scrollMiddle () {
    this.pixel -= (this.editorElement.getHeight() / 2)
    return this.editorElement.setScrollTop(this.pixel)
  }

  moveToFirstNonBlank () {
    return this.editor.moveToFirstCharacterOfLine()
  }
}

class ScrollCursorToBottom extends ScrollCursor {
  execute () {
    if (!this.opts.leaveCursor) { this.moveToFirstNonBlank() }
    return this.scrollDown()
  }

  scrollDown () {
    if (this.rows.first === 0) { return }
    const offset = (this.editor.getLineHeightInPixels() * (this.scrolloff + 1))
    this.pixel -= (this.editorElement.getHeight() - offset)
    return this.editorElement.setScrollTop(this.pixel)
  }

  moveToFirstNonBlank () {
    return this.editor.moveToFirstCharacterOfLine()
  }
}

class ScrollHorizontal {
  isComplete () { return true }
  isRecordable () { return false }
  constructor (editorElement) {
    this.editorElement = editorElement
    this.editor = this.editorElement.getModel()
    const cursorPos = this.editor.getCursorScreenPosition()
    this.pixel = this.editorElement.pixelPositionForScreenPosition(cursorPos).left
    this.cursor = this.editor.getLastCursor()
  }

  putCursorOnScreen () {
    return this.editor.scrollToCursorPosition({ center: false })
  }
}

class ScrollCursorToLeft extends ScrollHorizontal {
  execute () {
    this.editorElement.setScrollLeft(this.pixel)
    return this.putCursorOnScreen()
  }
}

class ScrollCursorToRight extends ScrollHorizontal {
  execute () {
    this.editorElement.setScrollRight(this.pixel)
    return this.putCursorOnScreen()
  }
}

module.exports = {
  ScrollDown,
  ScrollUp,
  ScrollCursorToTop,
  ScrollCursorToMiddle,
  ScrollCursorToBottom,
  ScrollCursorToLeft,
  ScrollCursorToRight
}

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
const _ = require('underscore-plus');
const {Point, Range} = require('atom');
const settings = require('../settings');

const WholeWordRegex = /\S+/;
const WholeWordOrEmptyLineRegex = /^\s*$|\S+/;
const AllWhitespace = /^\s$/;

class MotionError {
  constructor(message) {
    this.message = message;
    this.name = 'Motion Error';
  }
}

class Motion {
  static initClass() {
    this.prototype.operatesInclusively = false;
    this.prototype.operatesLinewise = false;
  }

  constructor(editor, vimState) {
    this.editor = editor;
    this.vimState = vimState;
  }

  select(count, options) {
    const value = (() => {
      const result = [];
      for (let selection of Array.from(this.editor.getSelections())) {
        if (this.isLinewise()) {
          this.moveSelectionLinewise(selection, count, options);
        } else if (this.vimState.mode === 'visual') {
          this.moveSelectionVisual(selection, count, options);
        } else if (this.operatesInclusively) {
          this.moveSelectionInclusively(selection, count, options);
        } else {
          this.moveSelection(selection, count, options);
        }
        result.push(!selection.isEmpty());
      }
      return result;
    })();

    this.editor.mergeCursors();
    this.editor.mergeIntersectingSelections();
    return value;
  }

  execute(count) {
    for (let cursor of Array.from(this.editor.getCursors())) {
      this.moveCursor(cursor, count);
    }
    return this.editor.mergeCursors();
  }

  moveSelectionLinewise(selection, count, options) {
    return selection.modifySelection(() => {
      const [oldStartRow, oldEndRow] = Array.from(selection.getBufferRowRange());

      const wasEmpty = selection.isEmpty();
      const wasReversed = selection.isReversed();
      if (!wasEmpty && !wasReversed) {
        selection.cursor.moveLeft();
      }

      this.moveCursor(selection.cursor, count, options);

      const isEmpty = selection.isEmpty();
      const isReversed = selection.isReversed();
      if (!isEmpty && !isReversed) {
        selection.cursor.moveRight();
      }

      let [newStartRow, newEndRow] = Array.from(selection.getBufferRowRange());

      if (isReversed && !wasReversed) {
        newEndRow = Math.max(newEndRow, oldStartRow);
      }
      if (wasReversed && !isReversed) {
        newStartRow = Math.min(newStartRow, oldEndRow);
      }

      return selection.setBufferRange([[newStartRow, 0], [newEndRow + 1, 0]], {autoscroll: false});
    });
  }

  moveSelectionInclusively(selection, count, options) {
    if (!selection.isEmpty()) { return this.moveSelectionVisual(selection, count, options); }

    return selection.modifySelection(() => {
      this.moveCursor(selection.cursor, count, options);
      if (selection.isEmpty()) { return; }

      if (selection.isReversed()) {
        // for backward motion, add the original starting character of the motion
        const {start, end} = selection.getBufferRange();
        return selection.setBufferRange([start, [end.row, end.column + 1]]);
      } else {
        // for forward motion, add the ending character of the motion
        return selection.cursor.moveRight();
      }
    });
  }

  moveSelectionVisual(selection, count, options) {
    return selection.modifySelection(() => {
      let range = selection.getBufferRange();
      const [oldStart, oldEnd] = Array.from([range.start, range.end]);

      // in visual mode, atom cursor is after the last selected character,
      // so here put cursor in the expected place for the following motion
      const wasEmpty = selection.isEmpty();
      const wasReversed = selection.isReversed();
      if (!wasEmpty && !wasReversed) {
        selection.cursor.moveLeft();
      }

      this.moveCursor(selection.cursor, count, options);

      // put cursor back after the last character so it is also selected
      const isEmpty = selection.isEmpty();
      const isReversed = selection.isReversed();
      if (!isEmpty && !isReversed) {
        selection.cursor.moveRight();
      }

      range = selection.getBufferRange();
      let [newStart, newEnd] = Array.from([range.start, range.end]);

      // if we reversed or emptied a normal selection
      // we need to select again the last character deselected above the motion
      if ((isReversed || isEmpty) && !(wasReversed || wasEmpty)) {
        selection.setBufferRange([newStart, [newEnd.row, oldStart.column + 1]]);
      }

      // if we re-reversed a reversed non-empty selection,
      // we need to keep the last character of the old selection selected
      if (wasReversed && !wasEmpty && !isReversed) {
        selection.setBufferRange([[oldEnd.row, oldEnd.column - 1], newEnd]);
      }

      // keep a single-character selection non-reversed
      range = selection.getBufferRange();
      [newStart, newEnd] = Array.from([range.start, range.end]);
      if (selection.isReversed() && (newStart.row === newEnd.row) && ((newStart.column + 1) === newEnd.column)) {
        return selection.setBufferRange(range, {reversed: false});
      }
    });
  }

  moveSelection(selection, count, options) {
    return selection.modifySelection(() => this.moveCursor(selection.cursor, count, options));
  }

  isComplete() { return true; }

  isRecordable() { return false; }

  isLinewise() {
    if ((this.vimState != null ? this.vimState.mode : undefined) === 'visual') {
      return (this.vimState != null ? this.vimState.submode : undefined) === 'linewise';
    } else {
      return this.operatesLinewise;
    }
  }
}
Motion.initClass();

class CurrentSelection extends Motion {
  constructor(editor, vimState) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }
      let thisFn = (() => { return this; }).toString();
      let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
      eval(`${thisName} = this;`);
    }
    this.editor = editor;
    this.vimState = vimState;
    super(this.editor, this.vimState);
    this.lastSelectionRange = this.editor.getSelectedBufferRange();
    this.wasLinewise = this.isLinewise();
  }

  execute(count) {
    if (count == null) { count = 1; }
    return _.times(count, () => true);
  }

  select(count) {
    // in visual mode, the current selections are already there
    // if we're not in visual mode, we are repeating some operation and need to re-do the selections
    if (count == null) { count = 1; }
    if (this.vimState.mode !== 'visual') {
      if (this.wasLinewise) {
        this.selectLines();
      } else {
        this.selectCharacters();
      }
    }

    return _.times(count, () => true);
  }

  selectLines() {
    const lastSelectionExtent = this.lastSelectionRange.getExtent();
    for (let selection of Array.from(this.editor.getSelections())) {
      const cursor = selection.cursor.getBufferPosition();
      selection.setBufferRange([[cursor.row, 0], [cursor.row + lastSelectionExtent.row, 0]]);
    }
  }

  selectCharacters() {
    const lastSelectionExtent = this.lastSelectionRange.getExtent();
    for (let selection of Array.from(this.editor.getSelections())) {
      const {start} = selection.getBufferRange();
      const newEnd = start.traverse(lastSelectionExtent);
      selection.setBufferRange([start, newEnd]);
    }
  }
}

// Public: Generic class for motions that require extra input
class MotionWithInput extends Motion {
  constructor(editor, vimState) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }
      let thisFn = (() => { return this; }).toString();
      let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
      eval(`${thisName} = this;`);
    }
    this.editor = editor;
    this.vimState = vimState;
    super(this.editor, this.vimState);
    this.complete = false;
  }

  isComplete() { return this.complete; }

  canComposeWith(operation) { return (operation.characters != null); }

  compose(input) {
    if (!input.characters) {
      throw new MotionError('Must compose with an Input');
    }
    this.input = input;
    return this.complete = true;
  }
}

class MoveLeft extends Motion {
  moveCursor(cursor, count) {
    if (count == null) { count = 1; }
    return _.times(count, function() {
      if (!cursor.isAtBeginningOfLine() || settings.wrapLeftRightMotion()) { return cursor.moveLeft(); }
    });
  }
}

class MoveRight extends Motion {
  moveCursor(cursor, count) {
    if (count == null) { count = 1; }
    return _.times(count, () => {
      let wrapToNextLine = settings.wrapLeftRightMotion();

      // when the motion is combined with an operator, we will only wrap to the next line
      // if we are already at the end of the line (after the last character)
      if ((this.vimState.mode === 'operator-pending') && !cursor.isAtEndOfLine()) { wrapToNextLine = false; }

      if (!cursor.isAtEndOfLine()) { cursor.moveRight(); }
      if (wrapToNextLine && cursor.isAtEndOfLine()) { return cursor.moveRight(); }
    });
  }
}

class MoveUp extends Motion {
  static initClass() {
    this.prototype.operatesLinewise = true;
  }

  moveCursor(cursor, count) {
    if (count == null) { count = 1; }
    return _.times(count, function() {
      if (cursor.getScreenRow() !== 0) {
        return cursor.moveUp();
      }
    });
  }
}
MoveUp.initClass();

class MoveDown extends Motion {
  static initClass() {
    this.prototype.operatesLinewise = true;
  }

  moveCursor(cursor, count) {
    if (count == null) { count = 1; }
    return _.times(count, () => {
      if (cursor.getScreenRow() !== this.editor.getLastScreenRow()) {
        return cursor.moveDown();
      }
    });
  }
}
MoveDown.initClass();

class MoveToPreviousWord extends Motion {
  moveCursor(cursor, count) {
    if (count == null) { count = 1; }
    return _.times(count, () => cursor.moveToBeginningOfWord());
  }
}

class MoveToPreviousWholeWord extends Motion {
  moveCursor(cursor, count) {
    if (count == null) { count = 1; }
    return _.times(count, () => {
      cursor.moveToBeginningOfWord();
      return (() => {
        const result = [];
        while (!this.isWholeWord(cursor) && !this.isBeginningOfFile(cursor)) {
          result.push(cursor.moveToBeginningOfWord());
        }
        return result;
      })();
    });
  }

  isWholeWord(cursor) {
    const char = cursor.getCurrentWordPrefix().slice(-1);
    return AllWhitespace.test(char);
  }

  isBeginningOfFile(cursor) {
    const cur = cursor.getBufferPosition();
    return !cur.row && !cur.column;
  }
}

class MoveToNextWord extends Motion {
  static initClass() {
    this.prototype.wordRegex = null;
  }

  moveCursor(cursor, count, options) {
    if (count == null) { count = 1; }
    return _.times(count, () => {
      const current = cursor.getBufferPosition();

      const next = (options != null ? options.excludeWhitespace : undefined) ?
        cursor.getEndOfCurrentWordBufferPosition({wordRegex: this.wordRegex})
      :
        cursor.getBeginningOfNextWordBufferPosition({wordRegex: this.wordRegex});

      if (this.isEndOfFile(cursor)) { return; }

      if (cursor.isAtEndOfLine()) {
        cursor.moveDown();
        cursor.moveToBeginningOfLine();
        return cursor.skipLeadingWhitespace();
      } else if ((current.row === next.row) && (current.column === next.column)) {
        return cursor.moveToEndOfWord();
      } else {
        return cursor.setBufferPosition(next);
      }
    });
  }

  isEndOfFile(cursor) {
    const cur = cursor.getBufferPosition();
    const eof = this.editor.getEofBufferPosition();
    return (cur.row === eof.row) && (cur.column === eof.column);
  }
}
MoveToNextWord.initClass();

class MoveToNextWholeWord extends MoveToNextWord {
  static initClass() {
    this.prototype.wordRegex = WholeWordOrEmptyLineRegex;
  }
}
MoveToNextWholeWord.initClass();

class MoveToEndOfWord extends Motion {
  static initClass() {
    this.prototype.operatesInclusively = true;
    this.prototype.wordRegex = null;
  }

  moveCursor(cursor, count) {
    if (count == null) { count = 1; }
    return _.times(count, () => {
      const current = cursor.getBufferPosition();

      let next = cursor.getEndOfCurrentWordBufferPosition({wordRegex: this.wordRegex});
      if (next.column > 0) { next.column--; }

      if (next.isEqual(current)) {
        cursor.moveRight();
        if (cursor.isAtEndOfLine()) {
          cursor.moveDown();
          cursor.moveToBeginningOfLine();
        }

        next = cursor.getEndOfCurrentWordBufferPosition({wordRegex: this.wordRegex});
        if (next.column > 0) { next.column--; }
      }

      return cursor.setBufferPosition(next);
    });
  }
}
MoveToEndOfWord.initClass();

class MoveToEndOfWholeWord extends MoveToEndOfWord {
  static initClass() {
    this.prototype.wordRegex = WholeWordRegex;
  }
}
MoveToEndOfWholeWord.initClass();

class MoveToNextSentence extends Motion {
  moveCursor(cursor, count) {
    if (count == null) { count = 1; }
    return _.times(count, function() {
      const start = cursor.getBufferPosition().translate(new Point(0, 1));
      const eof = cursor.editor.getBuffer().getEndPosition();
      const scanRange = [start, eof];

      return cursor.editor.scanInBufferRange(/(^$)|(([\.!?] )|^[A-Za-z0-9])/, scanRange, function({matchText, range, stop}) {
        let adjustment = new Point(0, 0);
        if (matchText.match(/[\.!?]/)) {
          adjustment = new Point(0, 2);
        }

        cursor.setBufferPosition(range.start.translate(adjustment));
        return stop();
      });
    });
  }
}

class MoveToPreviousSentence extends Motion {
  moveCursor(cursor, count) {
    if (count == null) { count = 1; }
    return _.times(count, function() {
      const end = cursor.getBufferPosition().translate(new Point(0, -1));
      const bof = cursor.editor.getBuffer().getFirstPosition();
      const scanRange = [bof, end];

      return cursor.editor.backwardsScanInBufferRange(/(^$)|(([\.!?] )|^[A-Za-z0-9])/, scanRange, function({matchText, range, stop}) {
        let adjustment = new Point(0, 0);
        if (matchText.match(/[\.!?]/)) {
          adjustment = new Point(0, 2);
        }

        cursor.setBufferPosition(range.start.translate(adjustment));
        return stop();
      });
    });
  }
}

class MoveToNextParagraph extends Motion {
  moveCursor(cursor, count) {
    if (count == null) { count = 1; }
    return _.times(count, () => cursor.moveToBeginningOfNextParagraph());
  }
}

class MoveToPreviousParagraph extends Motion {
  moveCursor(cursor, count) {
    if (count == null) { count = 1; }
    return _.times(count, () => cursor.moveToBeginningOfPreviousParagraph());
  }
}

class MoveToLine extends Motion {
  static initClass() {
    this.prototype.operatesLinewise = true;
  }

  getDestinationRow(count) {
    if (count != null) { return count - 1; } else { return (this.editor.getLineCount() - 1); }
  }
}
MoveToLine.initClass();

class MoveToAbsoluteLine extends MoveToLine {
  moveCursor(cursor, count) {
    cursor.setBufferPosition([this.getDestinationRow(count), Infinity]);
    cursor.moveToFirstCharacterOfLine();
    if (cursor.getBufferColumn() === 0) { return cursor.moveToEndOfLine(); }
  }
}

class MoveToRelativeLine extends MoveToLine {
  moveCursor(cursor, count) {
    if (count == null) { count = 1; }
    const {row, column} = cursor.getBufferPosition();
    return cursor.setBufferPosition([row + (count - 1), 0]);
  }
}

class MoveToScreenLine extends MoveToLine {
  constructor(editorElement, vimState, scrolloff) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }
      let thisFn = (() => { return this; }).toString();
      let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
      eval(`${thisName} = this;`);
    }
    this.editorElement = editorElement;
    this.vimState = vimState;
    this.scrolloff = scrolloff;
    this.scrolloff = 2; // atom default
    super(this.editorElement.getModel(), this.vimState);
  }

  moveCursor(cursor, count) {
    if (count == null) { count = 1; }
    const {row, column} = cursor.getBufferPosition();
    return cursor.setScreenPosition([this.getDestinationRow(count), 0]);
  }
}

class MoveToBeginningOfLine extends Motion {
  moveCursor(cursor, count) {
    if (count == null) { count = 1; }
    return _.times(count, () => cursor.moveToBeginningOfLine());
  }
}

class MoveToFirstCharacterOfLine extends Motion {
  moveCursor(cursor, count) {
    if (count == null) { count = 1; }
    return _.times(count, function() {
      cursor.moveToBeginningOfLine();
      return cursor.moveToFirstCharacterOfLine();
    });
  }
}

class MoveToFirstCharacterOfLineAndDown extends Motion {
  static initClass() {
    this.prototype.operatesLinewise = true;
  }

  moveCursor(cursor, count) {
    if (count == null) { count = 1; }
    _.times(count-1, () => cursor.moveDown());
    cursor.moveToBeginningOfLine();
    return cursor.moveToFirstCharacterOfLine();
  }
}
MoveToFirstCharacterOfLineAndDown.initClass();

class MoveToLastCharacterOfLine extends Motion {
  moveCursor(cursor, count) {
    if (count == null) { count = 1; }
    return _.times(count, function() {
      cursor.moveToEndOfLine();
      return cursor.goalColumn = Infinity;
    });
  }
}

class MoveToLastNonblankCharacterOfLineAndDown extends Motion {
  static initClass() {
    this.prototype.operatesInclusively = true;
  }

  // moves cursor to the last non-whitespace character on the line
  // similar to skipLeadingWhitespace() in atom's cursor.coffee
  skipTrailingWhitespace(cursor) {
    const position = cursor.getBufferPosition();
    const scanRange = cursor.getCurrentLineBufferRange();
    let startOfTrailingWhitespace = [scanRange.end.row, scanRange.end.column - 1];
    this.editor.scanInBufferRange(/[ \t]+$/, scanRange, function({range}) {
      startOfTrailingWhitespace = range.start;
      return startOfTrailingWhitespace.column -= 1;
    });
    return cursor.setBufferPosition(startOfTrailingWhitespace);
  }

  moveCursor(cursor, count) {
    if (count == null) { count = 1; }
    _.times(count-1, () => cursor.moveDown());
    return this.skipTrailingWhitespace(cursor);
  }
}
MoveToLastNonblankCharacterOfLineAndDown.initClass();

class MoveToFirstCharacterOfLineUp extends Motion {
  static initClass() {
    this.prototype.operatesLinewise = true;
  }

  moveCursor(cursor, count) {
    if (count == null) { count = 1; }
    _.times(count, () => cursor.moveUp());
    cursor.moveToBeginningOfLine();
    return cursor.moveToFirstCharacterOfLine();
  }
}
MoveToFirstCharacterOfLineUp.initClass();

class MoveToFirstCharacterOfLineDown extends Motion {
  static initClass() {
    this.prototype.operatesLinewise = true;
  }

  moveCursor(cursor, count) {
    if (count == null) { count = 1; }
    _.times(count, () => cursor.moveDown());
    cursor.moveToBeginningOfLine();
    return cursor.moveToFirstCharacterOfLine();
  }
}
MoveToFirstCharacterOfLineDown.initClass();

class MoveToStartOfFile extends MoveToLine {
  moveCursor(cursor, count) {
    if (count == null) { count = 1; }
    const {row, column} = this.editor.getCursorBufferPosition();
    cursor.setBufferPosition([this.getDestinationRow(count), 0]);
    if (!this.isLinewise()) {
      return cursor.moveToFirstCharacterOfLine();
    }
  }
}

class MoveToTopOfScreen extends MoveToScreenLine {
  getDestinationRow(count) {
    let offset;
    if (count == null) { count = 0; }
    const firstScreenRow = this.editorElement.getFirstVisibleScreenRow();
    if (firstScreenRow > 0) {
      offset = Math.max(count - 1, this.scrolloff);
    } else {
      offset = count > 0 ? count - 1 : count;
    }
    return firstScreenRow + offset;
  }
}

class MoveToBottomOfScreen extends MoveToScreenLine {
  getDestinationRow(count) {
    let offset;
    if (count == null) { count = 0; }
    const lastScreenRow = this.editorElement.getLastVisibleScreenRow();
    const lastRow = this.editor.getBuffer().getLastRow();
    if (lastScreenRow !== lastRow) {
      offset = Math.max(count - 1, this.scrolloff);
    } else {
      offset = count > 0 ? count - 1 : count;
    }
    return lastScreenRow - offset;
  }
}

class MoveToMiddleOfScreen extends MoveToScreenLine {
  getDestinationRow() {
    const firstScreenRow = this.editorElement.getFirstVisibleScreenRow();
    const lastScreenRow = this.editorElement.getLastVisibleScreenRow();
    const height = lastScreenRow - firstScreenRow;
    return Math.floor(firstScreenRow + (height / 2));
  }
}

class ScrollKeepingCursor extends Motion {
  static initClass() {
    this.prototype.operatesLinewise = true;
    this.prototype.cursorRow = null;
  }

  constructor(editorElement, vimState) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }
      let thisFn = (() => { return this; }).toString();
      let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
      eval(`${thisName} = this;`);
    }
    this.editorElement = editorElement;
    this.vimState = vimState;
    super(this.editorElement.getModel(), this.vimState);
  }

  select(count, options) {
    // TODO: remove this conditional once after Atom v1.1.0 is released.
    if (this.editor.setFirstVisibleScreenRow != null) {
      const newTopRow = this.getNewFirstVisibleScreenRow(count);
      super.select(count, options);
      return this.editor.setFirstVisibleScreenRow(newTopRow);
    } else {
      const scrollTop = this.getNewScrollTop(count);
      super.select(count, options);
      return this.editorElement.setScrollTop(scrollTop);
    }
  }

  execute(count) {
    // TODO: remove this conditional once after Atom v1.1.0 is released.
    if (this.editor.setFirstVisibleScreenRow != null) {
      const newTopRow = this.getNewFirstVisibleScreenRow(count);
      super.execute(count);
      return this.editor.setFirstVisibleScreenRow(newTopRow);
    } else {
      const scrollTop = this.getNewScrollTop(count);
      super.execute(count);
      return this.editorElement.setScrollTop(scrollTop);
    }
  }

  moveCursor(cursor) {
    return cursor.setScreenPosition(Point(this.cursorRow, 0), {autoscroll: false});
  }

  // TODO: remove this method once after Atom v1.1.0 is released.
  getNewScrollTop(count) {
    if (count == null) { count = 1; }
    const currentScrollTop = this.editorElement.component.presenter.pendingScrollTop != null ? this.editorElement.component.presenter.pendingScrollTop : this.editorElement.getScrollTop();
    const currentCursorRow = this.editor.getCursorScreenPosition().row;
    const rowsPerPage = this.editor.getRowsPerPage();
    const lineHeight = this.editor.getLineHeightInPixels();
    const scrollRows = Math.floor(this.pageScrollFraction * rowsPerPage * count);
    this.cursorRow = currentCursorRow + scrollRows;
    return currentScrollTop + (scrollRows * lineHeight);
  }

  getNewFirstVisibleScreenRow(count) {
    if (count == null) { count = 1; }
    const currentTopRow = this.editor.getFirstVisibleScreenRow();
    const currentCursorRow = this.editor.getCursorScreenPosition().row;
    const rowsPerPage = this.editor.getRowsPerPage();
    const scrollRows = Math.ceil(this.pageScrollFraction * rowsPerPage * count);
    this.cursorRow = currentCursorRow + scrollRows;
    return currentTopRow + scrollRows;
  }
}
ScrollKeepingCursor.initClass();

class ScrollHalfUpKeepCursor extends ScrollKeepingCursor {
  static initClass() {
    this.prototype.pageScrollFraction = -1 / 2;
  }
}
ScrollHalfUpKeepCursor.initClass();

class ScrollFullUpKeepCursor extends ScrollKeepingCursor {
  static initClass() {
    this.prototype.pageScrollFraction = -1;
  }
}
ScrollFullUpKeepCursor.initClass();

class ScrollHalfDownKeepCursor extends ScrollKeepingCursor {
  static initClass() {
    this.prototype.pageScrollFraction = 1 / 2;
  }
}
ScrollHalfDownKeepCursor.initClass();

class ScrollFullDownKeepCursor extends ScrollKeepingCursor {
  static initClass() {
    this.prototype.pageScrollFraction = 1;
  }
}
ScrollFullDownKeepCursor.initClass();

module.exports = {
  Motion, MotionWithInput, CurrentSelection, MoveLeft, MoveRight, MoveUp, MoveDown,
  MoveToPreviousWord, MoveToPreviousWholeWord, MoveToNextWord, MoveToNextWholeWord,
  MoveToEndOfWord, MoveToNextSentence, MoveToPreviousSentence, MoveToNextParagraph, MoveToPreviousParagraph, MoveToAbsoluteLine, MoveToRelativeLine, MoveToBeginningOfLine,
  MoveToFirstCharacterOfLineUp, MoveToFirstCharacterOfLineDown,
  MoveToFirstCharacterOfLine, MoveToFirstCharacterOfLineAndDown, MoveToLastCharacterOfLine,
  MoveToLastNonblankCharacterOfLineAndDown, MoveToStartOfFile,
  MoveToTopOfScreen, MoveToBottomOfScreen, MoveToMiddleOfScreen, MoveToEndOfWholeWord, MotionError,
  ScrollHalfUpKeepCursor, ScrollFullUpKeepCursor,
  ScrollHalfDownKeepCursor, ScrollFullDownKeepCursor
};

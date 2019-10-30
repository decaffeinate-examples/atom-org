/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {Range} = require('atom');
const AllWhitespace = /^\s$/;
const WholeWordRegex = /\S+/;
const {mergeRanges} = require('./utils');

class TextObject {
  constructor(editor, state) {
    this.editor = editor;
    this.state = state;
  }

  isComplete() { return true; }
  isRecordable() { return false; }

  execute() { return this.select.apply(this, arguments); }
}

class SelectInsideWord extends TextObject {
  select() {
    for (let selection of Array.from(this.editor.getSelections())) {
      if (selection.isEmpty()) {
        selection.selectRight();
      }
      selection.expandOverWord();
    }
    return [true];
  }
}

class SelectInsideWholeWord extends TextObject {
  select() {
    return (() => {
      const result = [];
      for (let selection of Array.from(this.editor.getSelections())) {
        const range = selection.cursor.getCurrentWordBufferRange({wordRegex: WholeWordRegex});
        selection.setBufferRange(mergeRanges(selection.getBufferRange(), range));
        result.push(true);
      }
      return result;
    })();
  }
}

// SelectInsideQuotes and the next class defined (SelectInsideBrackets) are
// almost-but-not-quite-repeated code. They are different because of the depth
// checks in the bracket matcher.

class SelectInsideQuotes extends TextObject {
  constructor(editor, char, includeQuotes) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }
      let thisFn = (() => { return this; }).toString();
      let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
      eval(`${thisName} = this;`);
    }
    this.editor = editor;
    this.char = char;
    this.includeQuotes = includeQuotes;
  }

  findOpeningQuote(pos) {
    const start = pos.copy();
    pos = pos.copy();
    while (pos.row >= 0) {
      const line = this.editor.lineTextForBufferRow(pos.row);
      if (pos.column === -1) { pos.column = line.length - 1; }
      while (pos.column >= 0) {
        if (line[pos.column] === this.char) {
          if ((pos.column === 0) || (line[pos.column - 1] !== '\\')) {
            if (this.isStartQuote(pos)) {
              return pos;
            } else {
              return this.lookForwardOnLine(start);
            }
          }
        }
        -- pos.column;
      }
      pos.column = -1;
      -- pos.row;
    }
    return this.lookForwardOnLine(start);
  }

  isStartQuote(end) {
    const line = this.editor.lineTextForBufferRow(end.row);
    const numQuotes = line.substring(0, end.column + 1).replace( `'${this.char}`, '').split(this.char).length - 1;
    return numQuotes % 2;
  }

  lookForwardOnLine(pos) {
    const line = this.editor.lineTextForBufferRow(pos.row);

    const index = line.substring(pos.column).indexOf(this.char);
    if (index >= 0) {
      pos.column += index;
      return pos;
    }
    return null;
  }

  findClosingQuote(start) {
    const end = start.copy();
    const escaping = false;

    while (end.row < this.editor.getLineCount()) {
      const endLine = this.editor.lineTextForBufferRow(end.row);
      while (end.column < endLine.length) {
        if (endLine[end.column] === '\\') {
          ++ end.column;
        } else if (endLine[end.column] === this.char) {
          if (this.includeQuotes) { -- start.column; }
          if (this.includeQuotes) { ++ end.column; }
          return end;
        }
        ++ end.column;
      }
      end.column = 0;
      ++ end.row;
    }
  }

  select() {
    return (() => {
      const result = [];
      for (let selection of Array.from(this.editor.getSelections())) {
        const start = this.findOpeningQuote(selection.cursor.getBufferPosition());
        if (start != null) {
          ++ start.column; // skip the opening quote
          const end = this.findClosingQuote(start);
          if (end != null) {
            selection.setBufferRange(mergeRanges(selection.getBufferRange(), [start, end]));
          }
        }
        result.push(!selection.isEmpty());
      }
      return result;
    })();
  }
}

// SelectInsideBrackets and the previous class defined (SelectInsideQuotes) are
// almost-but-not-quite-repeated code. They are different because of the depth
// checks in the bracket matcher.

class SelectInsideBrackets extends TextObject {
  constructor(editor, beginChar, endChar, includeBrackets) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }
      let thisFn = (() => { return this; }).toString();
      let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
      eval(`${thisName} = this;`);
    }
    this.editor = editor;
    this.beginChar = beginChar;
    this.endChar = endChar;
    this.includeBrackets = includeBrackets;
  }

  findOpeningBracket(pos) {
    pos = pos.copy();
    let depth = 0;
    while (pos.row >= 0) {
      const line = this.editor.lineTextForBufferRow(pos.row);
      if (pos.column === -1) { pos.column = line.length - 1; }
      while (pos.column >= 0) {
        switch (line[pos.column]) {
          case this.endChar: ++ depth; break;
          case this.beginChar:
            if (-- depth < 0) { return pos; }
            break;
        }
        -- pos.column;
      }
      pos.column = -1;
      -- pos.row;
    }
  }

  findClosingBracket(start) {
    const end = start.copy();
    let depth = 0;
    while (end.row < this.editor.getLineCount()) {
      const endLine = this.editor.lineTextForBufferRow(end.row);
      while (end.column < endLine.length) {
        switch (endLine[end.column]) {
          case this.beginChar: ++ depth; break;
          case this.endChar:
            if (-- depth < 0) {
              if (this.includeBrackets) { -- start.column; }
              if (this.includeBrackets) { ++ end.column; }
              return end;
            }
            break;
        }
        ++ end.column;
      }
      end.column = 0;
      ++ end.row;
    }
  }

  select() {
    return (() => {
      const result = [];
      for (let selection of Array.from(this.editor.getSelections())) {
        const start = this.findOpeningBracket(selection.cursor.getBufferPosition());
        if (start != null) {
          ++ start.column; // skip the opening quote
          const end = this.findClosingBracket(start);
          if (end != null) {
            selection.setBufferRange(mergeRanges(selection.getBufferRange(), [start, end]));
          }
        }
        result.push(!selection.isEmpty());
      }
      return result;
    })();
  }
}

class SelectAWord extends TextObject {
  select() {
    return (() => {
      const result = [];
      for (let selection of Array.from(this.editor.getSelections())) {
        if (selection.isEmpty()) {
          selection.selectRight();
        }
        selection.expandOverWord();
        while (true) {
          const endPoint = selection.getBufferRange().end;
          const char = this.editor.getTextInRange(Range.fromPointWithDelta(endPoint, 0, 1));
          if (!AllWhitespace.test(char)) { break; }
          selection.selectRight();
        }
        result.push(true);
      }
      return result;
    })();
  }
}

class SelectAWholeWord extends TextObject {
  select() {
    return (() => {
      const result = [];
      for (let selection of Array.from(this.editor.getSelections())) {
        const range = selection.cursor.getCurrentWordBufferRange({wordRegex: WholeWordRegex});
        selection.setBufferRange(mergeRanges(selection.getBufferRange(), range));
        while (true) {
          const endPoint = selection.getBufferRange().end;
          const char = this.editor.getTextInRange(Range.fromPointWithDelta(endPoint, 0, 1));
          if (!AllWhitespace.test(char)) { break; }
          selection.selectRight();
        }
        result.push(true);
      }
      return result;
    })();
  }
}

class Paragraph extends TextObject {

  select() {
    return Array.from(this.editor.getSelections()).map((selection) =>
      this.selectParagraph(selection));
  }

  // Return a range delimted by the start or the end of a paragraph
  paragraphDelimitedRange(startPoint) {
    const inParagraph = this.isParagraphLine(this.editor.lineTextForBufferRow(startPoint.row));
    const upperRow = this.searchLines(startPoint.row, -1, inParagraph);
    const lowerRow = this.searchLines(startPoint.row, this.editor.getLineCount(), inParagraph);
    return new Range([upperRow + 1, 0], [lowerRow, 0]);
  }

  searchLines(startRow, rowLimit, startedInParagraph) {
    for (let currentRow = startRow, end = rowLimit, asc = startRow <= end; asc ? currentRow <= end : currentRow >= end; asc ? currentRow++ : currentRow--) {
      const line = this.editor.lineTextForBufferRow(currentRow);
      if (startedInParagraph !== this.isParagraphLine(line)) {
        return currentRow;
      }
    }
    return rowLimit;
  }

  isParagraphLine(line) { return /\S/.test(line); }
}

class SelectInsideParagraph extends Paragraph {
  selectParagraph(selection) {
    const oldRange = selection.getBufferRange();
    const startPoint = selection.cursor.getBufferPosition();
    const newRange = this.paragraphDelimitedRange(startPoint);
    selection.setBufferRange(mergeRanges(oldRange, newRange));
    return true;
  }
}

class SelectAParagraph extends Paragraph {
  selectParagraph(selection) {
    const oldRange = selection.getBufferRange();
    const startPoint = selection.cursor.getBufferPosition();
    const newRange = this.paragraphDelimitedRange(startPoint);
    const nextRange = this.paragraphDelimitedRange(newRange.end);
    selection.setBufferRange(mergeRanges(oldRange, [newRange.start, nextRange.end]));
    return true;
  }
}

module.exports = {TextObject, SelectInsideWord, SelectInsideWholeWord, SelectInsideQuotes,
  SelectInsideBrackets, SelectAWord, SelectAWholeWord, SelectInsideParagraph, SelectAParagraph};

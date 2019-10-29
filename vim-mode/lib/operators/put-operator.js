/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Put;
const _ = require('underscore-plus');
const {Operator} = require('./general-operators');
const settings = require('../settings');

module.exports =
//
// It pastes everything contained within the specifed register
//
(Put = (function() {
  Put = class Put extends Operator {
    static initClass() {
      this.prototype.register = null;
    }

    constructor(editor, vimState, param) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      this.editor = editor;
      this.vimState = vimState;
      if (param == null) { param = {}; }
      const {location} = param;
      this.location = location;
      if (this.location == null) { this.location = 'after'; }
      this.complete = true;
      this.register = settings.defaultRegister();
    }

    // Public: Pastes the text in the given register.
    //
    // count - The number of times to execute.
    //
    // Returns nothing.
    execute(count) {
      let originalPosition;
      if (count == null) { count = 1; }
      const {text, type} = this.vimState.getRegister(this.register) || {};
      if (!text) { return; }

      let textToInsert = _.times(count, () => text).join('');

      const selection = this.editor.getSelectedBufferRange();
      if (selection.isEmpty()) {
        // Clean up some corner cases on the last line of the file
        if (type === 'linewise') {
          textToInsert = textToInsert.replace(/\n$/, '');
          if ((this.location === 'after') && this.onLastRow()) {
            textToInsert = `\n${textToInsert}`;
          } else {
            textToInsert = `${textToInsert}\n`;
          }
        }

        if (this.location === 'after') {
          if (type === 'linewise') {
            if (this.onLastRow()) {
              this.editor.moveToEndOfLine();

              originalPosition = this.editor.getCursorScreenPosition();
              originalPosition.row += 1;
            } else {
              this.editor.moveDown();
            }
          } else {
            if (!this.onLastColumn()) {
              this.editor.moveRight();
            }
          }
        }

        if ((type === 'linewise') && (originalPosition == null)) {
          this.editor.moveToBeginningOfLine();
          originalPosition = this.editor.getCursorScreenPosition();
        }
      }

      this.editor.insertText(textToInsert);

      if (originalPosition != null) {
        this.editor.setCursorScreenPosition(originalPosition);
        this.editor.moveToFirstCharacterOfLine();
      }

      if (type !== 'linewise') {
        this.editor.moveLeft();
      }
      return this.vimState.activateNormalMode();
    }

    // Private: Helper to determine if the editor is currently on the last row.
    //
    // Returns true on the last row and false otherwise.
    onLastRow() {
      const {row, column} = this.editor.getCursorBufferPosition();
      return row === this.editor.getBuffer().getLastRow();
    }

    onLastColumn() {
      return this.editor.getLastCursor().isAtEndOfLine();
    }
  };
  Put.initClass();
  return Put;
})());

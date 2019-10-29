/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Replace;
const _ = require('underscore-plus');
const {OperatorWithInput} = require('./general-operators');
const {ViewModel} = require('../view-models/view-model');
const {Range} = require('atom');

module.exports =
(Replace = class Replace extends OperatorWithInput {
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
    this.viewModel = new ViewModel(this, {class: 'replace', hidden: true, singleChar: true, defaultText: '\n'});
  }

  execute(count) {
    if (count == null) { count = 1; }
    if (this.input.characters === "") {
      // replace canceled

      if (this.vimState.mode === "visual") {
        this.vimState.resetVisualMode();
      } else {
        this.vimState.activateNormalMode();
      }

      return;
    }

    this.editor.transact(() => {
      if (this.motion != null) {
        if (_.contains(this.motion.select(), true)) {
          this.editor.replaceSelectedText(null, text => {
            return text.replace(/./g, this.input.characters);
          });
          return (() => {
            const result = [];
            for (let selection of Array.from(this.editor.getSelections())) {
              const point = selection.getBufferRange().start;
              result.push(selection.setBufferRange(Range.fromPointWithDelta(point, 0, 0)));
            }
            return result;
          })();
        }
      } else {
        for (var cursor of Array.from(this.editor.getCursors())) {
          const pos = cursor.getBufferPosition();
          const currentRowLength = this.editor.lineTextForBufferRow(pos.row).length;
          if (!((currentRowLength - pos.column) >= count)) { continue; }

          _.times(count, () => {
            const point = cursor.getBufferPosition();
            this.editor.setTextInBufferRange(Range.fromPointWithDelta(point, 0, 1), this.input.characters);
            return cursor.moveRight();
          });
          cursor.setBufferPosition(pos);
        }

        // Special case: when replaced with a newline move to the start of the
        // next row.
        if (this.input.characters === "\n") {
          _.times(count, () => {
            return this.editor.moveDown();
          });
          return this.editor.moveToFirstCharacterOfLine();
        }
      }
    });

    return this.vimState.activateNormalMode();
  }
});

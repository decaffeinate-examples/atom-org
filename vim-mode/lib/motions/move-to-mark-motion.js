/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let MoveToMark;
const {MotionWithInput, MoveToFirstCharacterOfLine} = require('./general-motions');
const {ViewModel} = require('../view-models/view-model');
const {Point, Range} = require('atom');

module.exports =
(MoveToMark = class MoveToMark extends MotionWithInput {
  constructor(editor, vimState, linewise) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }
      let thisFn = (() => { return this; }).toString();
      let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
      eval(`${thisName} = this;`);
    }
    this.editor = editor;
    this.vimState = vimState;
    if (linewise == null) { linewise = true; }
    this.linewise = linewise;
    super(this.editor, this.vimState);
    this.operatesLinewise = this.linewise;
    this.viewModel = new ViewModel(this, {class: 'move-to-mark', singleChar: true, hidden: true});
  }

  isLinewise() { return this.linewise; }

  moveCursor(cursor, count) {
    if (count == null) { count = 1; }
    let markPosition = this.vimState.getMark(this.input.characters);

    if (this.input.characters === '`') { // double '`' pressed
      if (markPosition == null) { markPosition = [0, 0]; } // if markPosition not set, go to the beginning of the file
      this.vimState.setMark('`', cursor.getBufferPosition());
    }

    if (markPosition != null) { cursor.setBufferPosition(markPosition); }
    if (this.linewise) {
      return cursor.moveToFirstCharacterOfLine();
    }
  }
});

/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const _ = require('underscore-plus');
const {Operator} = require('./general-operators');

class AdjustIndentation extends Operator {
  execute(count) {
    const {
      mode
    } = this.vimState;
    this.motion.select(count);
    const originalRanges = this.editor.getSelectedBufferRanges();

    if (mode === 'visual') {
      this.editor.transact(() => {
        return _.times(count != null ? count : 1, () => this.indent());
      });
    } else {
      this.indent();
    }

    this.editor.clearSelections();
    this.editor.getLastCursor().setBufferPosition([originalRanges.shift().start.row, 0]);
    for (let range of Array.from(originalRanges)) {
      this.editor.addCursorAtBufferPosition([range.start.row, 0]);
    }
    this.editor.moveToFirstCharacterOfLine();
    return this.vimState.activateNormalMode();
  }
}

class Indent extends AdjustIndentation {
  indent() {
    return this.editor.indentSelectedRows();
  }
}

class Outdent extends AdjustIndentation {
  indent() {
    return this.editor.outdentSelectedRows();
  }
}

class Autoindent extends AdjustIndentation {
  indent() {
    return this.editor.autoIndentSelectedRows();
  }
}

module.exports = {Indent, Outdent, Autoindent};

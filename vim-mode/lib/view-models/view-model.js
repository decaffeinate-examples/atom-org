/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const VimNormalModeInputElement = require('./vim-normal-mode-input-element');

class ViewModel {
  constructor(operation, opts) {
    this.operation = operation;
    if (opts == null) { opts = {}; }
    ({editor: this.editor, vimState: this.vimState} = this.operation);
    this.view = new VimNormalModeInputElement().initialize(this, atom.views.getView(this.editor), opts);
    this.editor.normalModeInputView = this.view;
    this.vimState.onDidFailToCompose(() => this.view.remove());
  }

  confirm(view) {
    return this.vimState.pushOperations(new Input(this.view.value));
  }

  cancel(view) {
    if (this.vimState.isOperatorPending()) {
      this.vimState.pushOperations(new Input(''));
    }
    return delete this.editor.normalModeInputView;
  }
}

class Input {
  constructor(characters) {
    this.characters = characters;
  }
  isComplete() { return true; }
  isRecordable() { return true; }
}

module.exports = {
  ViewModel, Input
};

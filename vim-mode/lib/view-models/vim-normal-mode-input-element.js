/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class VimNormalModeInputElement extends HTMLDivElement {
  createdCallback() {
    return this.className = "normal-mode-input";
  }

  initialize(viewModel, mainEditorElement, opts) {
    this.viewModel = viewModel;
    this.mainEditorElement = mainEditorElement;
    if (opts == null) { opts = {}; }
    if (opts.class != null) {
      this.classList.add(opts.class);
    }

    this.editorElement = document.createElement("atom-text-editor");
    this.editorElement.classList.add('editor');
    this.editorElement.getModel().setMini(true);
    this.editorElement.setAttribute('mini', '');
    this.appendChild(this.editorElement);

    this.singleChar = opts.singleChar;
    this.defaultText = opts.defaultText != null ? opts.defaultText : '';

    if (opts.hidden) {
      this.classList.add('vim-hidden-normal-mode-input');
      this.mainEditorElement.parentNode.appendChild(this);
    } else {
      this.panel = atom.workspace.addBottomPanel({item: this, priority: 100});
    }

    this.focus();
    this.handleEvents();

    return this;
  }

  handleEvents() {
    if (this.singleChar != null) {
      let compositing = false;
      this.editorElement.getModel().getBuffer().onDidChange(e => {
        if (e.newText && !compositing) { return this.confirm(); }
      });
      this.editorElement.addEventListener('compositionstart', () => compositing = true);
      this.editorElement.addEventListener('compositionend', () => compositing = false);
    } else {
      atom.commands.add(this.editorElement, 'editor:newline', this.confirm.bind(this));
    }

    atom.commands.add(this.editorElement, 'core:confirm', this.confirm.bind(this));
    atom.commands.add(this.editorElement, 'core:cancel', this.cancel.bind(this));
    return atom.commands.add(this.editorElement, 'blur', this.cancel.bind(this));
  }

  confirm() {
    this.value = this.editorElement.getModel().getText() || this.defaultText;
    this.viewModel.confirm(this);
    return this.removePanel();
  }

  focus() {
    return this.editorElement.focus();
  }

  cancel(e) {
    this.viewModel.cancel(this);
    return this.removePanel();
  }

  removePanel() {
    atom.workspace.getActivePane().activate();
    if (this.panel != null) {
      return this.panel.destroy();
    } else {
      return this.remove();
    }
  }
}

module.exports =
document.registerElement("vim-normal-mode-input", {
  extends: "div",
  prototype: VimNormalModeInputElement.prototype
}
);

/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {Disposable, CompositeDisposable} = require('event-kit');
const StatusBarManager = require('./status-bar-manager');
const GlobalVimState = require('./global-vim-state');
const VimState = require('./vim-state');
const settings = require('./settings');

module.exports = {
  config: settings.config,

  activate(state) {
    this.disposables = new CompositeDisposable;
    this.globalVimState = new GlobalVimState;
    this.statusBarManager = new StatusBarManager;

    this.vimStates = new Set;
    this.vimStatesByEditor = new WeakMap;

    this.disposables.add(atom.workspace.observeTextEditors(editor => {
      if (editor.isMini() || this.getEditorState(editor)) { return; }

      const vimState = new VimState(
        atom.views.getView(editor),
        this.statusBarManager,
        this.globalVimState
      );

      this.vimStates.add(vimState);
      this.vimStatesByEditor.set(editor, vimState);
      return vimState.onDidDestroy(() => this.vimStates.delete(vimState));
    })
    );

    this.disposables.add(atom.workspace.onDidChangeActivePaneItem(this.updateToPaneItem.bind(this)));

    return this.disposables.add(new Disposable(() => {
      return this.vimStates.forEach(vimState => vimState.destroy());
    })
    );
  },

  deactivate() {
    return this.disposables.dispose();
  },

  getGlobalState() {
    return this.globalVimState;
  },

  getEditorState(editor) {
    return this.vimStatesByEditor.get(editor);
  },

  consumeStatusBar(statusBar) {
    this.statusBarManager.initialize(statusBar);
    this.statusBarManager.attach();
    return this.disposables.add(new Disposable(() => {
      return this.statusBarManager.detach();
    })
    );
  },

  updateToPaneItem(item) {
    let vimState;
    if (item != null) { vimState = this.getEditorState(item); }
    if (vimState != null) {
      return vimState.updateStatusBar();
    } else {
      return this.statusBarManager.hide();
    }
  },

  provideVimMode() {
    return {
      getGlobalState: this.getGlobalState.bind(this),
      getEditorState: this.getEditorState.bind(this)
    };
  }
};

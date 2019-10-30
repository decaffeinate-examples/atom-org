/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let AtomTextEditorExercise;
const AtomTextEditorExerciseView = require('./atom-text-editor-exercise-view');
const {CompositeDisposable} = require('atom');

const URI = "atom://atom-text-editor-exercise";

module.exports = (AtomTextEditorExercise = {
  subscriptions: null,

  activate(state) {
    atom.workspace.addOpener(filePath => {
      if (filePath === URI) { return new AtomTextEditorExerciseView(); }
    });

    this.subscriptions = new CompositeDisposable;
    this.subscriptions.add(atom.commands.add('atom-workspace', {'atom-text-editor-exercise:toggle': () => this.toggle()}));

    // Always show the pane for now. Need to open in a nextTick or things will break
    return process.nextTick(() => this.toggle());
  },

  deactivate() {
    return (this.subscriptions != null ? this.subscriptions.dispose() : undefined);
  },

  toggle() {
    return atom.workspace.open(URI, {split: 'right'});
  }
});

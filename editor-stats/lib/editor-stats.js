/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const StatsTracker = require('./stats-tracker');

module.exports = {
  activate() {
    this.stats = new StatsTracker();
    return atom.commands.add('atom-workspace', 'editor-stats:toggle', () => {
      return this.createView().toggle(this.stats);
    });
  },

  deactivate() {
    this.editorStatsView = null;
    return this.stats = null;
  },

  createView() {
    if (!this.editorStatsView) {
      const EditorStatsView  = require('./editor-stats-view');
      this.editorStatsView = new EditorStatsView();
    }
    return this.editorStatsView;
  }
};

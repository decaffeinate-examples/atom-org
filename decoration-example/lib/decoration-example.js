/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const DecorationExampleView = require('./decoration-example-view');

module.exports = {
  decorationExampleView: null,

  activate(state) {
    this.decorationExampleView = new DecorationExampleView(state.decorationExampleViewState);
    return this.decorationExampleView.attach();
  },

  deactivate() {
    return this.decorationExampleView.destroy();
  },

  serialize() {
    return {decorationExampleViewState: this.decorationExampleView.serialize()};
  }
};

/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS104: Avoid inline assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let CursorPositionView;
const {Disposable} = require('atom');

module.exports =
(CursorPositionView = class CursorPositionView {
  constructor() {
    let left;
    this.viewUpdatePending = false;

    this.element = document.createElement('status-bar-cursor');
    this.element.classList.add('cursor-position', 'inline-block');
    this.goToLineLink = document.createElement('a');
    this.goToLineLink.classList.add('inline-block');
    this.element.appendChild(this.goToLineLink);

    this.formatString = (left = atom.config.get('status-bar.cursorPositionFormat')) != null ? left : '%L:%C';

    this.activeItemSubscription = atom.workspace.onDidChangeActiveTextEditor(activeEditor => this.subscribeToActiveTextEditor());

    this.subscribeToConfig();
    this.subscribeToActiveTextEditor();

    this.tooltip = atom.tooltips.add(this.element, {title: () => `Line ${this.row}, Column ${this.column}`});

    this.handleClick();
  }

  destroy() {
    this.activeItemSubscription.dispose();
    if (this.cursorSubscription != null) {
      this.cursorSubscription.dispose();
    }
    this.tooltip.dispose();
    if (this.configSubscription != null) {
      this.configSubscription.dispose();
    }
    this.clickSubscription.dispose();
    return (this.updateSubscription != null ? this.updateSubscription.dispose() : undefined);
  }

  subscribeToActiveTextEditor() {
    if (this.cursorSubscription != null) {
      this.cursorSubscription.dispose();
    }
    const selectionsMarkerLayer = __guard__(atom.workspace.getActiveTextEditor(), x => x.selectionsMarkerLayer);
    this.cursorSubscription = selectionsMarkerLayer != null ? selectionsMarkerLayer.onDidUpdate(this.scheduleUpdate.bind(this)) : undefined;
    return this.scheduleUpdate();
  }

  subscribeToConfig() {
    if (this.configSubscription != null) {
      this.configSubscription.dispose();
    }
    return this.configSubscription = atom.config.observe('status-bar.cursorPositionFormat', value => {
      this.formatString = value != null ? value : '%L:%C';
      return this.scheduleUpdate();
    });
  }

  handleClick() {
    const clickHandler = () => atom.commands.dispatch(atom.views.getView(atom.workspace.getActiveTextEditor()), 'go-to-line:toggle');
    this.element.addEventListener('click', clickHandler);
    return this.clickSubscription = new Disposable(() => this.element.removeEventListener('click', clickHandler));
  }

  scheduleUpdate() {
    if (this.viewUpdatePending) { return; }

    this.viewUpdatePending = true;
    return this.updateSubscription = atom.views.updateDocument(() => {
      let position;
      this.viewUpdatePending = false;
      if (position = __guard__(atom.workspace.getActiveTextEditor(), x => x.getCursorBufferPosition())) {
        this.row = position.row + 1;
        this.column = position.column + 1;
        this.goToLineLink.textContent = this.formatString.replace('%L', this.row).replace('%C', this.column);
        return this.element.classList.remove('hide');
      } else {
        this.goToLineLink.textContent = '';
        return this.element.classList.add('hide');
      }
    });
  }
});

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
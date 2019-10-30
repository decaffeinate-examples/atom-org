/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let DeprecationCopStatusBarView;
const {CompositeDisposable, Disposable} = require('atom');
const _ = require('underscore-plus');
const Grim = require('grim');

module.exports =
(DeprecationCopStatusBarView = (function() {
  DeprecationCopStatusBarView = class DeprecationCopStatusBarView {
    static initClass() {
      this.prototype.lastLength = null;
      this.prototype.toolTipDisposable = null;
    }

    constructor() {
      this.update = this.update.bind(this);
      this.subscriptions = new CompositeDisposable;

      this.element = document.createElement('div');
      this.element.classList.add('deprecation-cop-status', 'inline-block', 'text-warning');
      this.element.setAttribute('tabindex', -1);

      this.icon = document.createElement('span');
      this.icon.classList.add('icon', 'icon-alert');
      this.element.appendChild(this.icon);

      this.deprecationNumber = document.createElement('span');
      this.deprecationNumber.classList.add('deprecation-number');
      this.deprecationNumber.textContent = '0';
      this.element.appendChild(this.deprecationNumber);

      const clickHandler = function() {
        const workspaceElement = atom.views.getView(atom.workspace);
        return atom.commands.dispatch(workspaceElement, 'deprecation-cop:view');
      };
      this.element.addEventListener('click', clickHandler);
      this.subscriptions.add(new Disposable(() => this.element.removeEventListener('click', clickHandler)));

      this.update();

      const debouncedUpdateDeprecatedSelectorCount = _.debounce(this.update, 1000);

      this.subscriptions.add(Grim.on('updated', this.update));
      // TODO: Remove conditional when the new StyleManager deprecation APIs reach stable.
      if (atom.styles.onDidUpdateDeprecations != null) {
        this.subscriptions.add(atom.styles.onDidUpdateDeprecations(debouncedUpdateDeprecatedSelectorCount));
      }
    }

    destroy() {
      this.subscriptions.dispose();
      return this.element.remove();
    }

    getDeprecatedCallCount() {
      return Grim.getDeprecations().map(d => d.getStackCount()).reduce(((a, b) => a + b), 0);
    }

    getDeprecatedStyleSheetsCount() {
      // TODO: Remove conditional when the new StyleManager deprecation APIs reach stable.
      if (atom.styles.getDeprecations != null) {
        return Object.keys(atom.styles.getDeprecations()).length;
      } else {
        return 0;
      }
    }

    update() {
      const length = this.getDeprecatedCallCount() + this.getDeprecatedStyleSheetsCount();

      if (this.lastLength === length) { return; }

      this.lastLength = length;
      this.deprecationNumber.textContent = `${_.pluralize(length, 'deprecation')}`;
      if (this.toolTipDisposable != null) {
        this.toolTipDisposable.dispose();
      }
      this.toolTipDisposable = atom.tooltips.add(this.element, {title: `${_.pluralize(length, 'call')} to deprecated methods`});

      if (length === 0) {
        return this.element.style.display = 'none';
      } else {
        return this.element.style.display = '';
      }
    }
  };
  DeprecationCopStatusBarView.initClass();
  return DeprecationCopStatusBarView;
})());

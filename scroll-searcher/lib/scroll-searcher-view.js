/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ScrollSearch;
const {CompositeDisposable} = require('event-kit');
module.exports =
(ScrollSearch = class ScrollSearch {

  constructor(main) {
    // This class defines HTML container for scrollbar markers
    this.destroy = this.destroy.bind(this);
    this.main = main;
    this.domNode = document.createElement('div');
    this.domNode.classList.add("scroll-searcher");
    this.subscriptions = new CompositeDisposable;
    // Event subscriptions
    this.subscriptions.add(this.main.onDidDeactivate(this.destroy.bind(this)));
    this.subscriptions.add(this.main.onDidHide(this.hide.bind(this)));
    this.subscriptions.add(this.main.onDidShow(this.show.bind(this)));
  }
  destroy() {
    this.domNode.remove();
    return this.subscriptions.dispose();
  }

  getElement() {
    return this.domNode;
  }

  hide() {
    return this.domNode.style.visibility = "hidden";
  }

  show() {
    return this.domNode.style.visibility = "visible";
  }
});

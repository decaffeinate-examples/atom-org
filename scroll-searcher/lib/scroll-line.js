/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ScrollLine;
const {CompositeDisposable} = require('event-kit');
module.exports =
(ScrollLine = class ScrollLine {

  constructor(margin, markers, marker, scrollMarker) {
    this.destroy = this.destroy.bind(this);
    this.change = this.change.bind(this);
    this.completeDestruction = this.completeDestruction.bind(this);
    this.margin = margin;
    this.markers = markers;
    this.marker = marker;
    this.scrollMarker = scrollMarker;
    this.domNode = document.createElement('div');
    this.domNode.classList.add("scroll-marker");
    // Set the top margin, border color and border width of the scroll-bar markers according to the configuration settings
    this.domNode.style.marginTop = `${this.margin}px`;
    this.domNode.style.borderColor = atom.config.get('scroll-searcher.color').toHexString();
    this.domNode.style.borderTopWidth = `${atom.config.get('scroll-searcher.size') - 1}px`;
    // Add event subscriptions to observe changes in editor window
    this.subscriptions = new CompositeDisposable;
    this.subscriptions.add(this.marker.onDidDestroy(this.destroy.bind(this)));
    this.subscriptions.add(this.marker.onDidChange(this.change.bind(this)));
    this.subscriptions.add(this.scrollMarker.onDidDestroy(this.completeDestruction.bind(this)));
  }

  destroy() {
    // Remove domnode and dispose off subscriptions
    this.domNode.remove();
    this.subscriptions.dispose();
    this.markers[this.margin] = this.markers[this.margin] - 1;
    if (this.markers[this.margin] === 0) {
      return delete this.markers[this.margin];
    }
  }
  change() {
    this.domNode.remove();
    this.subscriptions.dispose();
    this.markers[this.margin] = this.markers[this.margin] - 1;
    if (this.markers[this.margin] === 0) {
      delete this.markers[this.margin];
    }
    if (!this.marker.isDestroyed()) {
      return this.scrollMarker.createMarker(this.marker);
    }
  }

  completeDestruction() {
    this.domNode.remove();
    return this.subscriptions.dispose();
  }
  getElement() {
    return this.domNode;
  }
});

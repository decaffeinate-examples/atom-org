/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const _ = require('underscore-plus');
const {Emitter} = require('atom');

const HISTORY_MAX = 25;

class History {
  constructor(items) {
    if (items == null) { items = []; }
    this.items = items;
    this.emitter = new Emitter;
    this.length = this.items.length;
  }

  onDidAddItem(callback) {
    return this.emitter.on('did-add-item', callback);
  }

  serialize() {
    return this.items.slice(-HISTORY_MAX);
  }

  getLast() {
    return _.last(this.items);
  }

  getAtIndex(index) {
    return this.items[index];
  }

  add(text) {
    this.items.push(text);
    this.length = this.items.length;
    return this.emitter.emit('did-add-item', text);
  }

  clear() {
    this.items = [];
    return this.length = 0;
  }
}

// Adds the ability to cycle through history
class HistoryCycler {

  // * `buffer` an {Editor} instance to attach the cycler to
  // * `history` a {History} object
  constructor(buffer, history) {
    this.buffer = buffer;
    this.history = history;
    this.index = this.history.length;
    this.history.onDidAddItem(text => {
      if (text !== this.buffer.getText()) { return this.buffer.setText(text); }
    });
  }

  addEditorElement(editorElement) {
    return atom.commands.add(editorElement, {
      'core:move-up': () => this.previous(),
      'core:move-down': () => this.next()
    }
    );
  }

  previous() {
    let left;
    if ((this.history.length === 0) || (this.atLastItem() && (this.buffer.getText() !== this.history.getLast()))) {
      this.scratch = this.buffer.getText();
    } else if (this.index > 0) {
      this.index--;
    }

    return this.buffer.setText((left = this.history.getAtIndex(this.index)) != null ? left : '');
  }

  next() {
    let item;
    if (this.index < (this.history.length - 1)) {
      this.index++;
      item = this.history.getAtIndex(this.index);
    } else if (this.scratch) {
      item = this.scratch;
    } else {
      item = '';
    }

    return this.buffer.setText(item);
  }

  atLastItem() {
    return this.index === (this.history.length - 1);
  }

  store() {
    const text = this.buffer.getText();
    if (!text || (text === this.history.getLast())) { return; }
    this.scratch = null;
    this.history.add(text);
    return this.index = this.history.length - 1;
  }
}

module.exports = {History, HistoryCycler};

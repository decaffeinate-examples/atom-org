/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {Emitter} = require('event-kit');
const {ScrollbarStyleObserver} = require('../build/Release/scrollbar-style-observer.node');

const emitter = new Emitter();
const observer = new ScrollbarStyleObserver(() => emitter.emit('did-change-preferred-scrollbar-style', exports.getPreferredScrollbarStyle()));

exports.getPreferredScrollbarStyle = () => observer.getPreferredScrollbarStyle();

exports.onDidChangePreferredScrollbarStyle = callback => emitter.on('did-change-preferred-scrollbar-style', callback);

exports.observePreferredScrollbarStyle = function(callback) {
  callback(exports.getPreferredScrollbarStyle());
  return exports.onDidChangePreferredScrollbarStyle(callback);
};

/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const VimState = require('../lib/vim-state');
const GlobalVimState = require('../lib/global-vim-state');
const VimMode  = require('../lib/vim-mode');
const StatusBarManager = require('../lib/status-bar-manager');

let [globalVimState, statusBarManager] = Array.from([]);

beforeEach(function() {
  if (!atom.workspace) { atom.workspace = {}; }
  statusBarManager = null;
  globalVimState = null;
  return spyOn(atom, 'beep');
});

const getEditorElement = function(callback) {
  let textEditor = null;

  waitsForPromise(() => atom.workspace.open().then(e => textEditor = e));

  return runs(function() {
    const element = atom.views.getView(textEditor);
    element.setUpdatedSynchronously(true);
    element.classList.add('vim-mode');
    if (statusBarManager == null) { statusBarManager = new StatusBarManager; }
    if (globalVimState == null) { globalVimState = new GlobalVimState; }
    element.vimState = new VimState(element, statusBarManager, globalVimState);

    element.addEventListener("keydown", e => atom.keymaps.handleKeyboardEvent(e));

    // mock parent element for the text editor
    document.createElement("html").appendChild(element);

    return callback(element);
  });
};

const mockPlatform = function(editorElement, platform) {
  const wrapper = document.createElement('div');
  wrapper.className = platform;
  return wrapper.appendChild(editorElement);
};

const unmockPlatform = editorElement => editorElement.parentNode.removeChild(editorElement);

const dispatchKeyboardEvent = function(target, ...eventArgs) {
  const e = document.createEvent('KeyboardEvent');
  e.initKeyboardEvent(...Array.from(eventArgs || []));
  // 0 is the default, and it's valid ASCII, but it's wrong.
  if (e.keyCode === 0) { Object.defineProperty(e, 'keyCode', {get() { return undefined; }}); }
  return target.dispatchEvent(e);
};

const dispatchTextEvent = function(target, ...eventArgs) {
  const e = document.createEvent('TextEvent');
  e.initTextEvent(...Array.from(eventArgs || []));
  return target.dispatchEvent(e);
};

const keydown = function(key, param) {
  if (param == null) { param = {}; }
  let {element, ctrl, shift, alt, meta, raw} = param;
  if ((key !== 'escape') && (raw == null)) { key = `U+${key.charCodeAt(0).toString(16)}`; }
  if (!element) { element = document.activeElement; }
  const eventArgs = [
    false, // bubbles
    true, // cancelable
    null, // view
    key,  // key
    0,    // location
    ctrl, alt, shift, meta
  ];

  const canceled = !dispatchKeyboardEvent(element, 'keydown', ...Array.from(eventArgs));
  dispatchKeyboardEvent(element, 'keypress', ...Array.from(eventArgs));
  if (!canceled) {
    if (dispatchTextEvent(element, 'textInput', ...Array.from(eventArgs))) {
      element.value += key;
    }
  }
  return dispatchKeyboardEvent(element, 'keyup', ...Array.from(eventArgs));
};

module.exports = {keydown, getEditorElement, mockPlatform, unmockPlatform};

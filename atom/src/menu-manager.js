/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let MenuManager;
const path = require('path');

const _ = require('underscore-plus');
const {ipcRenderer} = require('electron');
const CSON = require('season');
const fs = require('fs-plus');
const {Disposable} = require('event-kit');

const MenuHelpers = require('./menu-helpers');

const platformMenu = __guard__(__guard__(require('../package.json'), x1 => x1._atomMenu), x => x.menu);

// Extended: Provides a registry for menu items that you'd like to appear in the
// application menu.
//
// An instance of this class is always available as the `atom.menu` global.
//
// ## Menu CSON Format
//
// Here is an example from the [tree-view](https://github.com/atom/tree-view/blob/master/menus/tree-view.cson):
//
// ```coffee
// [
//   {
//     'label': 'View'
//     'submenu': [
//       { 'label': 'Toggle Tree View', 'command': 'tree-view:toggle' }
//     ]
//   }
//   {
//     'label': 'Packages'
//     'submenu': [
//       'label': 'Tree View'
//       'submenu': [
//         { 'label': 'Focus', 'command': 'tree-view:toggle-focus' }
//         { 'label': 'Toggle', 'command': 'tree-view:toggle' }
//         { 'label': 'Reveal Active File', 'command': 'tree-view:reveal-active-file' }
//         { 'label': 'Toggle Tree Side', 'command': 'tree-view:toggle-side' }
//       ]
//     ]
//   }
// ]
// ```
//
// Use in your package's menu `.cson` file requires that you place your menu
// structure under a `menu` key.
//
// ```coffee
// 'menu': [
//   {
//     'label': 'View'
//     'submenu': [
//       { 'label': 'Toggle Tree View', 'command': 'tree-view:toggle' }
//     ]
//   }
// ]
// ```
//
// See {::add} for more info about adding menu's directly.
module.exports =
(MenuManager = class MenuManager {
  constructor({resourcePath, keymapManager, packageManager}) {
    this.resourcePath = resourcePath;
    this.keymapManager = keymapManager;
    this.packageManager = packageManager;
    this.initialized = false;
    this.pendingUpdateOperation = null;
    this.template = [];
    this.keymapManager.onDidLoadBundledKeymaps(() => this.loadPlatformItems());
    this.packageManager.onDidActivateInitialPackages(() => this.sortPackagesMenu());
  }

  initialize({resourcePath}) {
    this.resourcePath = resourcePath;
    this.keymapManager.onDidReloadKeymap(() => this.update());
    this.update();
    return this.initialized = true;
  }

  // Public: Adds the given items to the application menu.
  //
  // ## Examples
  // ```coffee
  //   atom.menu.add [
  //     {
  //       label: 'Hello'
  //       submenu : [{label: 'World!', command: 'hello:world'}]
  //     }
  //   ]
  // ```
  //
  // * `items` An {Array} of menu item {Object}s containing the keys:
  //   * `label` The {String} menu label.
  //   * `submenu` An optional {Array} of sub menu items.
  //   * `command` An optional {String} command to trigger when the item is
  //     clicked.
  //
  // Returns a {Disposable} on which `.dispose()` can be called to remove the
  // added menu items.
  add(items) {
    items = _.deepClone(items);
    for (let item of Array.from(items)) { this.merge(this.template, item); }
    this.update();
    return new Disposable(() => this.remove(items));
  }

  remove(items) {
    for (let item of Array.from(items)) { this.unmerge(this.template, item); }
    return this.update();
  }

  clear() {
    this.template = [];
    return this.update();
  }

  // Should the binding for the given selector be included in the menu
  // commands.
  //
  // * `selector` A {String} selector to check.
  //
  // Returns a {Boolean}, true to include the selector, false otherwise.
  includeSelector(selector) {
    try {
      if (document.body.webkitMatchesSelector(selector)) { return true; }
    } catch (error) {
      // Selector isn't valid
      return false;
    }

    // Simulate an atom-text-editor element attached to a atom-workspace element attached
    // to a body element that has the same classes as the current body element.
    if (this.testEditor == null) {
      // Use new document so that custom elements don't actually get created
      const testDocument = document.implementation.createDocument(document.namespaceURI, 'html');

      const testBody = testDocument.createElement('body');
      testBody.classList.add(...Array.from(this.classesForElement(document.body) || []));

      const testWorkspace = testDocument.createElement('atom-workspace');
      let workspaceClasses = this.classesForElement(document.body.querySelector('atom-workspace'));
      if (workspaceClasses.length === 0) { workspaceClasses = ['workspace']; }
      testWorkspace.classList.add(...Array.from(workspaceClasses || []));

      testBody.appendChild(testWorkspace);

      this.testEditor = testDocument.createElement('atom-text-editor');
      this.testEditor.classList.add('editor');
      testWorkspace.appendChild(this.testEditor);
    }

    let element = this.testEditor;
    while (element) {
      if (element.webkitMatchesSelector(selector)) { return true; }
      element = element.parentElement;
    }

    return false;
  }

  // Public: Refreshes the currently visible menu.
  update() {
    if (!this.initialized) { return; }

    if (this.pendingUpdateOperation != null) { clearImmediate(this.pendingUpdateOperation); }

    return this.pendingUpdateOperation = setImmediate(() => {
      let binding;
      const unsetKeystrokes = new Set;
      for (binding of Array.from(this.keymapManager.getKeyBindings())) {
        if (binding.command === 'unset!') {
          unsetKeystrokes.add(binding.keystrokes);
        }
      }

      const keystrokesByCommand = {};
      for (binding of Array.from(this.keymapManager.getKeyBindings())) {
        if (!this.includeSelector(binding.selector)) { continue; }
        if (unsetKeystrokes.has(binding.keystrokes)) { continue; }
        if (binding.keystrokes.includes(' ')) { continue; }
        if ((process.platform === 'darwin') && /^alt-(shift-)?.$/.test(binding.keystrokes)) { continue; }
        if ((process.platform === 'win32') && /^ctrl-alt-(shift-)?.$/.test(binding.keystrokes)) { continue; }
        if (keystrokesByCommand[binding.command] == null) { keystrokesByCommand[binding.command] = []; }
        keystrokesByCommand[binding.command].unshift(binding.keystrokes);
      }

      return this.sendToBrowserProcess(this.template, keystrokesByCommand);
    });
  }

  loadPlatformItems() {
    if (platformMenu != null) {
      return this.add(platformMenu);
    } else {
      const menusDirPath = path.join(this.resourcePath, 'menus');
      const platformMenuPath = fs.resolve(menusDirPath, process.platform, ['cson', 'json']);
      const {menu} = CSON.readFileSync(platformMenuPath);
      return this.add(menu);
    }
  }

  // Merges an item in a submenu aware way such that new items are always
  // appended to the bottom of existing menus where possible.
  merge(menu, item) {
    return MenuHelpers.merge(menu, item);
  }

  unmerge(menu, item) {
    return MenuHelpers.unmerge(menu, item);
  }

  sendToBrowserProcess(template, keystrokesByCommand) {
    return ipcRenderer.send('update-application-menu', template, keystrokesByCommand);
  }

  // Get an {Array} of {String} classes for the given element.
  classesForElement(element) {
    let classList;
    if ((classList = element != null ? element.classList : undefined)) {
      return Array.prototype.slice.apply(classList);
    } else {
      return [];
    }
  }

  sortPackagesMenu() {
    const packagesMenu = _.find(this.template, ({label}) => MenuHelpers.normalizeLabel(label) === 'Packages');
    if ((packagesMenu != null ? packagesMenu.submenu : undefined) == null) { return; }

    packagesMenu.submenu.sort(function(item1, item2) {
      if (item1.label && item2.label) {
        return MenuHelpers.normalizeLabel(item1.label).localeCompare(MenuHelpers.normalizeLabel(item2.label));
      } else {
        return 0;
      }
    });
    return this.update();
  }
});

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ContextMenuManager;
const path = require('path');
const CSON = require('season');
const fs = require('fs-plus');
const {calculateSpecificity, validateSelector} = require('clear-cut');
const {Disposable} = require('event-kit');
const {remote} = require('electron');
const MenuHelpers = require('./menu-helpers');

const platformContextMenu = __guard__(__guard__(require('../package.json'), x1 => x1._atomMenu), x => x['context-menu']);

// Extended: Provides a registry for commands that you'd like to appear in the
// context menu.
//
// An instance of this class is always available as the `atom.contextMenu`
// global.
//
// ## Context Menu CSON Format
//
// ```coffee
// 'atom-workspace': [{label: 'Help', command: 'application:open-documentation'}]
// 'atom-text-editor': [{
//   label: 'History',
//   submenu: [
//     {label: 'Undo', command:'core:undo'}
//     {label: 'Redo', command:'core:redo'}
//   ]
// }]
// ```
//
// In your package's menu `.cson` file you need to specify it under a
// `context-menu` key:
//
// ```coffee
// 'context-menu':
//   'atom-workspace': [{label: 'Help', command: 'application:open-documentation'}]
//   ...
// ```
//
// The format for use in {::add} is the same minus the `context-menu` key. See
// {::add} for more information.
module.exports =
(ContextMenuManager = class ContextMenuManager {
  constructor({keymapManager}) {
    this.keymapManager = keymapManager;
    this.definitions = {'.overlayer': []}; // TODO: Remove once color picker package stops touching private data
    this.clear();

    this.keymapManager.onDidLoadBundledKeymaps(() => this.loadPlatformItems());
  }

  initialize({resourcePath, devMode}) {
    this.resourcePath = resourcePath;
    this.devMode = devMode;
  }

  loadPlatformItems() {
    if (platformContextMenu != null) {
      return this.add(platformContextMenu, this.devMode != null ? this.devMode : false);
    } else {
      const menusDirPath = path.join(this.resourcePath, 'menus');
      const platformMenuPath = fs.resolve(menusDirPath, process.platform, ['cson', 'json']);
      const map = CSON.readFileSync(platformMenuPath);
      return this.add(map['context-menu']);
    }
  }

  // Public: Add context menu items scoped by CSS selectors.
  //
  // ## Examples
  //
  // To add a context menu, pass a selector matching the elements to which you
  // want the menu to apply as the top level key, followed by a menu descriptor.
  // The invocation below adds a global 'Help' context menu item and a 'History'
  // submenu on the editor supporting undo/redo. This is just for example
  // purposes and not the way the menu is actually configured in Atom by default.
  //
  // ```coffee
  // atom.contextMenu.add {
  //   'atom-workspace': [{label: 'Help', command: 'application:open-documentation'}]
  //   'atom-text-editor': [{
  //     label: 'History',
  //     submenu: [
  //       {label: 'Undo', command:'core:undo'}
  //       {label: 'Redo', command:'core:redo'}
  //     ]
  //   }]
  // }
  // ```
  //
  // ## Arguments
  //
  // * `itemsBySelector` An {Object} whose keys are CSS selectors and whose
  //   values are {Array}s of item {Object}s containing the following keys:
  //   * `label` (optional) A {String} containing the menu item's label.
  //   * `command` (optional) A {String} containing the command to invoke on the
  //     target of the right click that invoked the context menu.
  //   * `enabled` (optional) A {Boolean} indicating whether the menu item
  //     should be clickable. Disabled menu items typically appear grayed out.
  //     Defaults to `true`.
  //   * `submenu` (optional) An {Array} of additional items.
  //   * `type` (optional) If you want to create a separator, provide an item
  //      with `type: 'separator'` and no other keys.
  //   * `visible` (optional) A {Boolean} indicating whether the menu item
  //     should appear in the menu. Defaults to `true`.
  //   * `created` (optional) A {Function} that is called on the item each time a
  //     context menu is created via a right click. You can assign properties to
  //    `this` to dynamically compute the command, label, etc. This method is
  //    actually called on a clone of the original item template to prevent state
  //    from leaking across context menu deployments. Called with the following
  //    argument:
  //     * `event` The click event that deployed the context menu.
  //   * `shouldDisplay` (optional) A {Function} that is called to determine
  //     whether to display this item on a given context menu deployment. Called
  //     with the following argument:
  //     * `event` The click event that deployed the context menu.
  //
  // Returns a {Disposable} on which `.dispose()` can be called to remove the
  // added menu items.
  add(itemsBySelector, throwOnInvalidSelector) {
    let itemSet;
    if (throwOnInvalidSelector == null) { throwOnInvalidSelector = true; }
    const addedItemSets = [];

    for (let selector in itemsBySelector) {
      const items = itemsBySelector[selector];
      if (throwOnInvalidSelector) { validateSelector(selector); }
      itemSet = new ContextMenuItemSet(selector, items);
      addedItemSets.push(itemSet);
      this.itemSets.push(itemSet);
    }

    return new Disposable(() => {
      for (itemSet of Array.from(addedItemSets)) {
        this.itemSets.splice(this.itemSets.indexOf(itemSet), 1);
      }
    });
  }

  templateForElement(target) {
    return this.templateForEvent({target});
  }

  templateForEvent(event) {
    const template = [];
    let currentTarget = event.target;

    while (currentTarget != null) {
      var item;
      const currentTargetItems = [];
      const matchingItemSets =
        this.itemSets.filter(itemSet => currentTarget.webkitMatchesSelector(itemSet.selector));

      for (let itemSet of Array.from(matchingItemSets)) {
        for (item of Array.from(itemSet.items)) {
          const itemForEvent = this.cloneItemForEvent(item, event);
          if (itemForEvent) {
            MenuHelpers.merge(currentTargetItems, itemForEvent, itemSet.specificity);
          }
        }
      }

      for (item of Array.from(currentTargetItems)) {
        MenuHelpers.merge(template, item, false);
      }

      currentTarget = currentTarget.parentElement;
    }

    this.pruneRedundantSeparators(template);

    return template;
  }

  pruneRedundantSeparators(menu) {
    let keepNextItemIfSeparator = false;
    let index = 0;
    return (() => {
      const result = [];
      while (index < menu.length) {
        if (menu[index].type === 'separator') {
          if (!keepNextItemIfSeparator || (index === (menu.length - 1))) {
            result.push(menu.splice(index, 1));
          } else {
            result.push(index++);
          }
        } else {
          keepNextItemIfSeparator = true;
          result.push(index++);
        }
      }
      return result;
    })();
  }

  // Returns an object compatible with `::add()` or `null`.
  cloneItemForEvent(item, event) {
    if (item.devMode && !this.devMode) { return null; }
    item = Object.create(item);
    if (typeof item.shouldDisplay === 'function') {
      if (!item.shouldDisplay(event)) { return null; }
    }
    if (typeof item.created === 'function') {
      item.created(event);
    }
    if (Array.isArray(item.submenu)) {
      item.submenu = item.submenu
        .map(submenuItem => this.cloneItemForEvent(submenuItem, event))
        .filter(submenuItem => submenuItem !== null);
    }
    return item;
  }

  convertLegacyItemsBySelector(legacyItemsBySelector, devMode) {
    const itemsBySelector = {};

    for (let selector in legacyItemsBySelector) {
      const commandsByLabel = legacyItemsBySelector[selector];
      itemsBySelector[selector] = this.convertLegacyItems(commandsByLabel, devMode);
    }

    return itemsBySelector;
  }

  convertLegacyItems(legacyItems, devMode) {
    const items = [];

    for (let label in legacyItems) {
      const commandOrSubmenu = legacyItems[label];
      if (typeof commandOrSubmenu === 'object') {
        items.push({label, submenu: this.convertLegacyItems(commandOrSubmenu, devMode), devMode});
      } else if (commandOrSubmenu === '-') {
        items.push({type: 'separator'});
      } else {
        items.push({label, command: commandOrSubmenu, devMode});
      }
    }

    return items;
  }

  showForEvent(event) {
    this.activeElement = event.target;
    const menuTemplate = this.templateForEvent(event);

    if (!((menuTemplate != null ? menuTemplate.length : undefined) > 0)) { return; }
    remote.getCurrentWindow().emit('context-menu', menuTemplate);
  }

  clear() {
    this.activeElement = null;
    this.itemSets = [];
    const inspectElement = {
      'atom-workspace': [{
        label: 'Inspect Element',
        command: 'application:inspect',
        devMode: true,
        created(event) {
          const {pageX, pageY} = event;
          return this.commandDetail = {x: pageX, y: pageY};
        }
      }]
    };
    return this.add(inspectElement, false);
  }
});

class ContextMenuItemSet {
  constructor(selector, items) {
    this.selector = selector;
    this.items = items;
    this.specificity = calculateSpecificity(this.selector);
  }
}

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
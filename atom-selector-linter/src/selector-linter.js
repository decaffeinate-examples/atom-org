/** @babel */
/* eslint-disable
    no-return-assign,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let SelectorLinter
const _ = require('underscore-plus')
const path = require('path')
const { selectorHasClass, eachSelector, selectorHasPsuedoClass } = require('./helpers')

const CLASS_TO_TAG = {
  workspace: 'atom-workspace',
  pane: 'atom-pane',
  panes: 'atom-pane-container',
  editor: 'atom-text-editor',
  'editor-colors': 'atom-text-editor'
}

const CLASS_TO_SELECTOR = {
  'pane-row': 'atom-pane-axis.horizontal',
  'pane-column': 'atom-pane-axis.vertical'
}

const CLASS_TO_SELECTOR_WITH_BACKWARD_COMPATIBILITY = {
  overlay: 'atom-panel.modal',
  'panel-top': 'atom-panel.top',
  'panel-left': 'atom-panel.left',
  'panel-right': 'atom-panel.right',
  'panel-bottom': 'atom-panel.bottom',
  'tool-panel': 'atom-panel'
}

const EDITOR_DESCENDENT_PATTERN = /(\.text-editor|\.editor|\.editor-colors|atom-text-editor)([:.][^ ]+)?[ >].*\w/

module.exports =
(SelectorLinter = class SelectorLinter {
  constructor () {
    this.deprecations = {}
  }

  checkPackage (pkg) {
    let sourcePath
    let menu
    let keymap
    for ([sourcePath, menu] of Array.from(pkg.menus != null ? pkg.menus : [])) {
      this.checkMenu(menu, this.packageMetadata(pkg, sourcePath))
    }
    for ([sourcePath, keymap] of Array.from(pkg.keymaps != null ? pkg.keymaps : [])) {
      this.checkKeymap(keymap, this.packageMetadata(pkg, sourcePath))
    }
    return (() => {
      let stylesheet
      const result = []
      for ([sourcePath, stylesheet] of Array.from(pkg.stylesheets != null ? pkg.stylesheets : [])) {
        if ((pkg.metadata.theme === 'syntax') || /atom-text-editor\.(less|css)/.test(sourcePath)) {
          result.push(this.checkSyntaxStylesheet(stylesheet, this.packageMetadata(pkg, sourcePath)))
        } else {
          result.push(this.checkUIStylesheet(stylesheet, this.packageMetadata(pkg, sourcePath)))
        }
      }
      return result
    })()
  }

  checkKeymap (keymap, metadata) {
    return (() => {
      const result = []
      for (const selector in keymap) {
        result.push(this.check(selector, metadata))
      }
      return result
    })()
  }

  checkUIStylesheet (css, metadata) {
    let editorDescendentUsed
    let shadowSelectorUsed = (editorDescendentUsed = false)

    const selectorsUsed = {}

    eachSelector(css, selector => {
      this.check(selector, metadata, true)

      for (const klass in CLASS_TO_SELECTOR_WITH_BACKWARD_COMPATIBILITY) {
        const replacementSelector = CLASS_TO_SELECTOR_WITH_BACKWARD_COMPATIBILITY[klass]
        if (!selectorsUsed[klass]) { selectorsUsed[klass] = selectorHasClass(selector, klass) }
        if (!selectorsUsed[replacementSelector]) { selectorsUsed[replacementSelector] = selector.indexOf(replacementSelector) >= 0 }
      }

      if (!editorDescendentUsed) { editorDescendentUsed = EDITOR_DESCENDENT_PATTERN.test(selector) }
      return shadowSelectorUsed || (shadowSelectorUsed = selectorHasPsuedoClass(selector, ':shadow'))
    })

    for (const klass in CLASS_TO_SELECTOR_WITH_BACKWARD_COMPATIBILITY) {
      const replacementSelector = CLASS_TO_SELECTOR_WITH_BACKWARD_COMPATIBILITY[klass]
      if (selectorsUsed[klass] && !selectorsUsed[replacementSelector]) {
        this.addDeprecation(metadata, `Use the selector \`${replacementSelector}\` instead of the \`${klass}\` class.`)
      }
    }

    if (editorDescendentUsed && !shadowSelectorUsed) {
      return this.addDeprecation(metadata, `\
Style elements within text editors using the \`atom-text-editor::shadow\` selector or the \`.atom-text-editor.less\` file extension.
If you want to target overlay elements, target them directly or as descendants of \`atom-overlay\` elements.\
`)
    }
  }

  checkSyntaxStylesheet (css, metadata) {
    let editorClassUsed, editorColorsClassUsed
    let hostSelectorUsed = (editorClassUsed = (editorColorsClassUsed = false))
    eachSelector(css, selector => {
      this.check(selector, metadata)
      if (!editorClassUsed) { editorClassUsed = selectorHasClass(selector, 'editor') }
      if (!editorColorsClassUsed) { editorColorsClassUsed = selectorHasClass(selector, 'editor-colors') }
      return hostSelectorUsed || (hostSelectorUsed = selectorHasPsuedoClass(selector, 'host'))
    })
    if (!hostSelectorUsed) {
      if (editorClassUsed) {
        this.addDeprecation(metadata, 'Target the selector `:host, atom-text-editor` instead of `.editor` for shadow DOM support.')
      }
      if (editorColorsClassUsed) {
        return this.addDeprecation(metadata, 'Target the selector `:host, atom-text-editor` instead of `.editor-colors` for shadow DOM support.')
      }
    }
  }

  checkMenu (menu, metadata) {
    return (() => {
      const result = []
      for (const selector in menu['context-menu']) {
        result.push(this.check(selector, metadata))
      }
      return result
    })()
  }

  check (selector, metadata, skipBackwardCompatible) {
    let klass, replacement
    if (skipBackwardCompatible == null) { skipBackwardCompatible = false }
    for (klass in CLASS_TO_TAG) {
      const tag = CLASS_TO_TAG[klass]
      if (selectorHasClass(selector, klass)) {
        this.addDeprecation(metadata, `Use the \`${tag}\` tag instead of the \`${klass}\` class.`)
      }
    }

    for (klass in CLASS_TO_SELECTOR) {
      replacement = CLASS_TO_SELECTOR[klass]
      if (selectorHasClass(selector, klass)) {
        this.addDeprecation(metadata, `Use the selector \`${replacement}\` instead of the \`${klass}\` class.`)
      }
    }

    if (!skipBackwardCompatible) {
      for (klass in CLASS_TO_SELECTOR_WITH_BACKWARD_COMPATIBILITY) {
        replacement = CLASS_TO_SELECTOR_WITH_BACKWARD_COMPATIBILITY[klass]
        if (selectorHasClass(selector, klass)) {
          this.addDeprecation(metadata, `Use the selector \`${replacement}\` instead of the \`${klass}\` class.`)
        }
      }
    }

    if (selectorHasClass(selector, 'editor') && selectorHasClass(selector, 'mini')) {
      this.addDeprecation(metadata, 'Use the selector `atom-text-editor[mini]` to select mini-editors.')
    }

    if (selectorHasClass(selector, 'bracket-matcher') && !selectorHasClass(selector, 'region')) {
      return this.addDeprecation(metadata, 'Use `.bracket-matcher .region` to select highlighted brackets.')
    }
  }

  clearDeprecations () {
    return this.deprecations = {}
  }

  getDeprecations () {
    return this.deprecations
  }

  // Private

  packageMetadata (pkg, sourcePath) {
    return {
      packageName: pkg.name,
      packagePath: pkg.path,
      sourcePath: path.relative(pkg.path, sourcePath)
    }
  }

  addDeprecation (metadata, message) {
    const { packageName, sourcePath } = metadata
    if (this.deprecations[packageName] == null) { this.deprecations[packageName] = {} }
    const fileDeprecations = this.deprecations[packageName][sourcePath] != null ? this.deprecations[packageName][sourcePath] : (this.deprecations[packageName][sourcePath] = [])
    const deprecation = _.extend(
      _.omit(metadata, 'packageName', 'sourcePath'),
      { message }
    )

    if (!_.any(fileDeprecations, existing => _.isEqual(existing, deprecation))) {
      return fileDeprecations.push(deprecation)
    }
  }
})

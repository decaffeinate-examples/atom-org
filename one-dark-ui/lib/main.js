/** @babel */
/* eslint-disable
    no-return-assign,
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const root = document.documentElement
const themeName = 'one-dark-ui'

module.exports = {
  activate (state) {
    atom.config.observe(`${themeName}.fontSize`, value => setFontSize(value))

    atom.config.observe(`${themeName}.tabSizing`, value => setTabSizing(value))

    atom.config.observe(`${themeName}.tabCloseButton`, value => setTabCloseButton(value))

    atom.config.observe(`${themeName}.hideDockButtons`, value => setHideDockButtons(value))

    atom.config.observe(`${themeName}.stickyHeaders`, value => setStickyHeaders(value))

    // DEPRECATED: This can be removed at some point (added in Atom 1.17/1.18ish)
    // It removes `layoutMode`
    if (atom.config.get(`${themeName}.layoutMode`)) {
      return atom.config.unset(`${themeName}.layoutMode`)
    }
  },

  deactivate () {
    unsetFontSize()
    unsetTabSizing()
    unsetTabCloseButton()
    unsetHideDockButtons()
    return unsetStickyHeaders()
  }
}

// Font Size -----------------------

var setFontSize = currentFontSize => root.style.fontSize = `${currentFontSize}px`

var unsetFontSize = () => root.style.fontSize = ''

// Tab Sizing -----------------------

var setTabSizing = tabSizing => root.setAttribute(`theme-${themeName}-tabsizing`, tabSizing.toLowerCase())

var unsetTabSizing = () => root.removeAttribute(`theme-${themeName}-tabsizing`)

// Tab Close Button -----------------------

var setTabCloseButton = function (tabCloseButton) {
  if (tabCloseButton === 'Left') {
    return root.setAttribute(`theme-${themeName}-tab-close-button`, 'left')
  } else {
    return unsetTabCloseButton()
  }
}

var unsetTabCloseButton = () => root.removeAttribute(`theme-${themeName}-tab-close-button`)

// Dock Buttons -----------------------

var setHideDockButtons = function (hideDockButtons) {
  if (hideDockButtons) {
    return root.setAttribute(`theme-${themeName}-dock-buttons`, 'hidden')
  } else {
    return unsetHideDockButtons()
  }
}

var unsetHideDockButtons = () => root.removeAttribute(`theme-${themeName}-dock-buttons`)

// Sticky Headers -----------------------

var setStickyHeaders = function (stickyHeaders) {
  if (stickyHeaders) {
    return root.setAttribute(`theme-${themeName}-sticky-headers`, 'sticky')
  } else {
    return unsetStickyHeaders()
  }
}

var unsetStickyHeaders = () => root.removeAttribute(`theme-${themeName}-sticky-headers`)

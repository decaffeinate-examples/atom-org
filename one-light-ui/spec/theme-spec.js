/** @babel */
/* eslint-disable
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const themeName = 'one-light-ui'

describe(`${themeName} theme`, function () {
  beforeEach(() => waitsForPromise(() => atom.packages.activatePackage(themeName)))

  it('allows the font size to be set via config', function () {
    expect(document.documentElement.style.fontSize).toBe('12px')

    atom.config.set(`${themeName}.fontSize`, '10')
    return expect(document.documentElement.style.fontSize).toBe('10px')
  })

  it('allows the tab sizing to be set via config', function () {
    atom.config.set(`${themeName}.tabSizing`, 'Maximum')
    return expect(document.documentElement.getAttribute(`theme-${themeName}-tabsizing`)).toBe('maximum')
  })

  it('allows the tab sizing to be set via config', function () {
    atom.config.set(`${themeName}.tabSizing`, 'Minimum')
    return expect(document.documentElement.getAttribute(`theme-${themeName}-tabsizing`)).toBe('minimum')
  })

  it('allows the tab close button to be shown on the left via config', function () {
    atom.config.set(`${themeName}.tabCloseButton`, 'Left')
    return expect(document.documentElement.getAttribute(`theme-${themeName}-tab-close-button`)).toBe('left')
  })

  it('allows the dock toggle buttons to be hidden via config', function () {
    atom.config.set(`${themeName}.hideDockButtons`, true)
    return expect(document.documentElement.getAttribute(`theme-${themeName}-dock-buttons`)).toBe('hidden')
  })

  it('allows the tree-view headers to be sticky via config', function () {
    atom.config.set(`${themeName}.stickyHeaders`, true)
    return expect(document.documentElement.getAttribute(`theme-${themeName}-sticky-headers`)).toBe('sticky')
  })

  return it('allows the tree-view headers to not be sticky via config', function () {
    atom.config.set(`${themeName}.stickyHeaders`, false)
    return expect(document.documentElement.getAttribute(`theme-${themeName}-sticky-headers`)).toBe(null)
  })
})

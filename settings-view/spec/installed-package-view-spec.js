/** @babel */
/* eslint-disable
    no-new,
    no-return-assign,
    no-undef,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const path = require('path')
const PackageDetailView = require('../lib/package-detail-view')
const PackageManager = require('../lib/package-manager')
const SettingsView = require('../lib/settings-view')
const PackageKeymapView = require('../lib/package-keymap-view')
const PackageSnippetsView = require('../lib/package-snippets-view')
const _ = require('underscore-plus')
let SnippetsProvider =
  { getSnippets () { return atom.config.scopedSettingsStore.propertySets } }

describe('InstalledPackageView', function () {
  beforeEach(() => spyOn(PackageManager.prototype, 'loadCompatiblePackageVersion').andCallFake(function () {}))

  it('displays the grammars registered by the package', function () {
    let settingsPanels = null

    waitsForPromise(() => atom.packages.activatePackage(path.join(__dirname, 'fixtures', 'language-test')))

    return runs(function () {
      const pack = atom.packages.getActivePackage('language-test')
      const view = new PackageDetailView(pack, new SettingsView(), new PackageManager(), SnippetsProvider)
      settingsPanels = view.element.querySelectorAll('.package-grammars .settings-panel')

      waitsFor(function () {
        const children = Array.from(settingsPanels).map(s => s.children.length)
        const childrenCount = children.reduce((a, b) => a + b, 0)
        return childrenCount === 2
      })

      expect(settingsPanels[0].querySelector('.grammar-scope').textContent).toBe('Scope: source.a')
      expect(settingsPanels[0].querySelector('.grammar-filetypes').textContent).toBe('File Types: .a, .aa, a')

      expect(settingsPanels[1].querySelector('.grammar-scope').textContent).toBe('Scope: source.b')
      expect(settingsPanels[1].querySelector('.grammar-filetypes').textContent).toBe('File Types: ')

      return expect(settingsPanels[2]).toBeUndefined()
    })
  })

  it('displays the snippets registered by the package', function () {
    let snippetsTable = null
    let snippetsModule = null

    // Relies on behavior not present in the snippets package before 1.33.
    // TODO: These tests should always run once 1.33 is released.
    const shouldRunScopeTest = parseFloat(atom.getVersion()) >= 1.33

    waitsForPromise(() => atom.packages.activatePackage(path.join(__dirname, 'fixtures', 'language-test')))

    waitsForPromise(() => atom.packages.activatePackage('snippets').then(function (p) {
      snippetsModule = p.mainModule
      if (snippetsModule.provideSnippets().getUnparsedSnippets == null) { return }

      return SnippetsProvider =
        { getSnippets () { return snippetsModule.provideSnippets().getUnparsedSnippets() } }
    }))

    waitsFor('snippets to load', () => snippetsModule.provideSnippets().bundledSnippetsLoaded())

    runs(function () {
      const pack = atom.packages.getActivePackage('language-test')
      const view = new PackageDetailView(pack, new SettingsView(), new PackageManager(), SnippetsProvider)
      return snippetsTable = view.element.querySelector('.package-snippets-table tbody')
    })

    waitsFor('snippets table children to contain 2 items', () => snippetsTable.children.length >= 2)

    return runs(function () {
      expect(snippetsTable.querySelector('tr:nth-child(1) td:nth-child(1)').textContent).toBe('b')
      expect(snippetsTable.querySelector('tr:nth-child(1) td:nth-child(2)').textContent).toBe('BAR')
      if (shouldRunScopeTest) { expect(snippetsTable.querySelector('tr:nth-child(1) td.snippet-scope-name').textContent).toBe('.b.source') }

      expect(snippetsTable.querySelector('tr:nth-child(2) td:nth-child(1)').textContent).toBe('f')
      expect(snippetsTable.querySelector('tr:nth-child(2) td:nth-child(2)').textContent).toBe('FOO')
      if (shouldRunScopeTest) { return expect(snippetsTable.querySelector('tr:nth-child(2) td.snippet-scope-name').textContent).toBe('.a.source') }
    })
  })

  describe('when a snippet body is viewed', () => it('shows a tooltip', function () {
    const tooltipCalls = []
    let view = null
    let snippetsTable = null
    let snippetsModule = null

    waitsForPromise(() => atom.packages.activatePackage(path.join(__dirname, 'fixtures', 'language-test')))

    waitsForPromise(() => atom.packages.activatePackage('snippets').then(function (p) {
      snippetsModule = p.mainModule
      if (snippetsModule.provideSnippets().getUnparsedSnippets == null) { return }

      return SnippetsProvider =
        { getSnippets () { return snippetsModule.provideSnippets().getUnparsedSnippets() } }
    }))

    waitsFor('snippets to load', () => snippetsModule.provideSnippets().bundledSnippetsLoaded())

    runs(function () {
      const pack = atom.packages.getActivePackage('language-test')
      view = new PackageDetailView(pack, new SettingsView(), new PackageManager(), SnippetsProvider)
      return snippetsTable = view.element.querySelector('.package-snippets-table tbody')
    })

    waitsFor('snippets table children to contain 2 items', () => snippetsTable.children.length >= 2)

    return runs(function () {
      expect(view.element.ownerDocument.querySelector('.snippet-body-tooltip')).not.toExist()

      view.element.querySelector('.package-snippets-table tbody tr:nth-child(1) td.snippet-body .snippet-view-btn').click()
      return expect(view.element.ownerDocument.querySelector('.snippet-body-tooltip')).toExist()
    })
  }))

  // Relies on behavior not present in the snippets package before 1.33.
  // TODO: These tests should always run once 1.33 is released.
  if (parseFloat(atom.getVersion()) >= 1.33) {
    describe('when a snippet is copied', function () {
      let [pack, card] = Array.from([])
      let snippetsTable = null
      let snippetsModule = null

      beforeEach(function () {
        waitsForPromise(() => atom.packages.activatePackage(path.join(__dirname, 'fixtures', 'language-test')))

        waitsForPromise(() => atom.packages.activatePackage('snippets').then(function (p) {
          snippetsModule = p.mainModule
          if (snippetsModule.provideSnippets().getUnparsedSnippets == null) { return }

          return SnippetsProvider = {
            getSnippets () { return snippetsModule.provideSnippets().getUnparsedSnippets() },
            getUserSnippetsPath: snippetsModule.getUserSnippetsPath()
          }
        }))

        waitsFor('snippets to load', () => snippetsModule.provideSnippets().bundledSnippetsLoaded())

        runs(function () {
          pack = atom.packages.getActivePackage('language-test')
          card = new PackageSnippetsView(pack, SnippetsProvider)
          return snippetsTable = card.element.querySelector('.package-snippets-table tbody')
        })

        return waitsFor('snippets table children to contain 2 items', () => snippetsTable.children.length >= 2)
      })

      describe('when the snippets file ends in .cson', () => it('writes a CSON snippet to the clipboard', function () {
        spyOn(SnippetsProvider, 'getUserSnippetsPath').andReturn('snippets.cson')
        card.element.querySelector('.package-snippets-table tbody tr:nth-child(1) td.snippet-body .snippet-copy-btn').click()
        return expect(atom.clipboard.read()).toBe(`\
\n'.b.source':
'BAR':
  'prefix': 'b'
  'body': 'bar?\\nline two'\n\
`
        )
      }))

      return describe('when the snippets file ends in .json', () => it('writes a JSON snippet to the clipboard', function () {
        spyOn(SnippetsProvider, 'getUserSnippetsPath').andReturn('snippets.json')
        card.element.querySelector('.package-snippets-table tbody tr:nth-child(1) td.snippet-body .btn:nth-child(2)').click()
        return expect(atom.clipboard.read()).toBe(`\
\n  ".b.source": {
  "BAR": {
    "prefix": "b",
    "body": "bar?\\nline two"
  }
}\n\
`
        )
      }))
    })
  }

  describe('when the snippets toggle is clicked', () => it('sets the packagesWithSnippetsDisabled config to include the package name', function () {
    let [pack, card] = Array.from([])
    let snippetsModule = []

    waitsForPromise(() => atom.packages.activatePackage(path.join(__dirname, 'fixtures', 'language-test')))

    waitsForPromise(() => atom.packages.activatePackage('snippets').then(function (p) {
      snippetsModule = p.mainModule
      if (snippetsModule.provideSnippets().getUnparsedSnippets == null) { return }

      return SnippetsProvider =
        { getSnippets () { return snippetsModule.provideSnippets().getUnparsedSnippets() } }
    }))

    waitsFor('snippets to load', () => snippetsModule.provideSnippets().bundledSnippetsLoaded())

    runs(function () {
      let left
      pack = atom.packages.getActivePackage('language-test')
      card = new PackageSnippetsView(pack, SnippetsProvider)
      jasmine.attachToDOM(card.element)

      card.refs.snippetToggle.click()
      expect(card.refs.snippetToggle.checked).toBe(false)
      return expect(_.include((left = atom.config.get('core.packagesWithSnippetsDisabled')) != null ? left : [], 'language-test')).toBe(true)
    })

    waitsFor('snippets table to update', () => card.refs.snippets.classList.contains('text-subtle'))

    runs(function () {
      let left
      card.refs.snippetToggle.click()
      expect(card.refs.snippetToggle.checked).toBe(true)
      return expect(_.include((left = atom.config.get('core.packagesWithSnippetsDisabled')) != null ? left : [], 'language-test')).toBe(false)
    })

    return waitsFor('snippets table to update', () => !card.refs.snippets.classList.contains('text-subtle'))
  }))

  it('does not display keybindings from other platforms', function () {
    let keybindingsTable = null

    waitsForPromise(() => atom.packages.activatePackage(path.join(__dirname, 'fixtures', 'language-test')))

    return runs(function () {
      const pack = atom.packages.getActivePackage('language-test')
      const view = new PackageDetailView(pack, new SettingsView(), new PackageManager(), SnippetsProvider)
      keybindingsTable = view.element.querySelector('.package-keymap-table tbody')
      return expect(keybindingsTable.children.length).toBe(1)
    })
  })

  describe('when the keybindings toggle is clicked', () => it('sets the packagesWithKeymapsDisabled config to include the package name', function () {
    waitsForPromise(() => atom.packages.activatePackage(path.join(__dirname, 'fixtures', 'language-test')))

    return runs(function () {
      let keybindingRows, left, left1
      const pack = atom.packages.getActivePackage('language-test')
      const card = new PackageKeymapView(pack)
      jasmine.attachToDOM(card.element)

      card.refs.keybindingToggle.click()
      expect(card.refs.keybindingToggle.checked).toBe(false)
      expect(_.include((left = atom.config.get('core.packagesWithKeymapsDisabled')) != null ? left : [], 'language-test')).toBe(true)

      if (atom.keymaps.build != null) {
        keybindingRows = card.element.querySelectorAll('.package-keymap-table tbody.text-subtle tr')
        expect(keybindingRows.length).toBe(1)
      }

      card.refs.keybindingToggle.click()
      expect(card.refs.keybindingToggle.checked).toBe(true)
      expect(_.include((left1 = atom.config.get('core.packagesWithKeymapsDisabled')) != null ? left1 : [], 'language-test')).toBe(false)

      if (atom.keymaps.build != null) {
        keybindingRows = card.element.querySelectorAll('.package-keymap-table tbody tr')
        return expect(keybindingRows.length).toBe(1)
      }
    })
  }))

  describe('when a keybinding is copied', function () {
    let [pack, card] = Array.from([])

    beforeEach(function () {
      waitsForPromise(() => atom.packages.activatePackage(path.join(__dirname, 'fixtures', 'language-test')))

      return runs(function () {
        pack = atom.packages.getActivePackage('language-test')
        return card = new PackageKeymapView(pack)
      })
    })

    describe('when the keybinding file ends in .cson', () => it('writes a CSON snippet to the clipboard', function () {
      spyOn(atom.keymaps, 'getUserKeymapPath').andReturn('keymap.cson')
      card.element.querySelector('.copy-icon').click()
      return expect(atom.clipboard.read()).toBe(`\
'test':
'cmd-g': 'language-test:run'\
`
      )
    }))

    return describe('when the keybinding file ends in .json', () => it('writes a JSON snippet to the clipboard', function () {
      spyOn(atom.keymaps, 'getUserKeymapPath').andReturn('keymap.json')
      card.element.querySelector('.copy-icon').click()
      return expect(atom.clipboard.read()).toBe(`\
"test": {
"cmd-g": "language-test:run"
}\
`
      )
    }))
  })

  describe('when the package is active', () => it('displays the correct enablement state', function () {
    let packageCard = null

    waitsForPromise(() => atom.packages.activatePackage('status-bar'))

    runs(function () {
      expect(atom.packages.isPackageActive('status-bar')).toBe(true)
      const pack = atom.packages.getLoadedPackage('status-bar')
      const view = new PackageDetailView(pack, new SettingsView(), new PackageManager(), SnippetsProvider)
      return packageCard = view.element.querySelector('.package-card')
    })

    return runs(function () {
      // Trigger observeDisabledPackages() here
      // because it is not default in specs
      atom.packages.observeDisabledPackages()
      atom.packages.disablePackage('status-bar')
      expect(atom.packages.isPackageDisabled('status-bar')).toBe(true)
      return expect(packageCard.classList.contains('disabled')).toBe(true)
    })
  }))

  describe('when the package is not active', function () {
    it('displays the correct enablement state', function () {
      atom.packages.loadPackage('status-bar')
      expect(atom.packages.isPackageActive('status-bar')).toBe(false)
      const pack = atom.packages.getLoadedPackage('status-bar')
      const view = new PackageDetailView(pack, new SettingsView(), new PackageManager(), SnippetsProvider)
      const packageCard = view.element.querySelector('.package-card')

      // Trigger observeDisabledPackages() here
      // because it is not default in specs
      atom.packages.observeDisabledPackages()
      atom.packages.disablePackage('status-bar')
      expect(atom.packages.isPackageDisabled('status-bar')).toBe(true)
      return expect(packageCard.classList.contains('disabled')).toBe(true)
    })

    return it('still loads the config schema for the package', function () {
      atom.packages.loadPackage(path.join(__dirname, 'fixtures', 'package-with-config'))

      waitsFor(() => atom.packages.isPackageLoaded('package-with-config') === true)

      return runs(function () {
        expect(atom.config.get('package-with-config.setting')).toBe(undefined)

        const pack = atom.packages.getLoadedPackage('package-with-config')
        new PackageDetailView(pack, new SettingsView(), new PackageManager(), SnippetsProvider)

        return expect(atom.config.get('package-with-config.setting')).toBe('something')
      })
    })
  })

  return describe('when the package was not installed from atom.io', function () {
    const normalizePackageDataReadmeError = 'ERROR: No README data found!'

    return it('still displays the Readme', function () {
      atom.packages.loadPackage(path.join(__dirname, 'fixtures', 'package-with-readme'))

      waitsFor(() => atom.packages.isPackageLoaded('package-with-readme') === true)

      return runs(function () {
        const pack = atom.packages.getLoadedPackage('package-with-readme')
        expect(pack.metadata.readme).toBe(normalizePackageDataReadmeError)

        const view = new PackageDetailView(pack, new SettingsView(), new PackageManager(), SnippetsProvider)
        expect(view.refs.sections.querySelector('.package-readme').textContent).not.toBe(normalizePackageDataReadmeError)
        return expect(view.refs.sections.querySelector('.package-readme').textContent.trim()).toContain('I am a Readme!')
      })
    })
  })
})

/** @babel */
/* eslint-disable
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
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const path = require('path')
const main = require('../lib/main')
const PackageManager = require('../lib/package-manager')
const SettingsView = require('../lib/settings-view')
const SnippetsProvider =
  { getSnippets () { return {} } }

describe('SettingsView', function () {
  let settingsView = null
  const packageManager = new PackageManager()

  beforeEach(function () {
    settingsView = main.createSettingsView({ packageManager, snippetsProvider: SnippetsProvider })
    spyOn(settingsView, 'initializePanels').andCallThrough()
    window.advanceClock(10000)
    return waitsFor(() => settingsView.initializePanels.callCount > 0)
  })

  describe('serialization', function () {
    it('remembers which panel was visible', function () {
      settingsView.showPanel('Themes')
      const newSettingsView = main.createSettingsView(settingsView.serialize())
      settingsView.destroy()
      jasmine.attachToDOM(newSettingsView.element)
      newSettingsView.initializePanels()
      return expect(newSettingsView.activePanel).toEqual({ name: 'Themes', options: {} })
    })

    it('shows the previously active panel if it is added after deserialization', function () {
      settingsView.addCorePanel('Panel 1', 'panel-1', function () {
        const div = document.createElement('div')
        div.id = 'panel-1'
        return {
          element: div,
          show () { return div.style.display = '' },
          focus () { return div.focus() },
          destroy () { return div.remove() }
        }
      })
      settingsView.showPanel('Panel 1')
      const newSettingsView = main.createSettingsView(settingsView.serialize())
      newSettingsView.addPanel('Panel 1', function () {
        const div = document.createElement('div')
        div.id = 'panel-1'
        return {
          element: div,
          show () { return div.style.display = '' },
          focus () { return div.focus() },
          destroy () { return div.remove() }
        }
      })
      newSettingsView.initializePanels()
      jasmine.attachToDOM(newSettingsView.element)
      return expect(newSettingsView.activePanel).toEqual({ name: 'Panel 1', options: {} })
    })

    it('shows the Settings panel if the last saved active panel name no longer exists', function () {
      settingsView.addCorePanel('Panel 1', 'panel1', function () {
        const div = document.createElement('div')
        div.id = 'panel-1'
        return {
          element: div,
          show () { return div.style.display = '' },
          focus () { return div.focus() },
          destroy () { return div.remove() }
        }
      })
      settingsView.showPanel('Panel 1')
      const newSettingsView = main.createSettingsView(settingsView.serialize())
      settingsView.destroy()
      jasmine.attachToDOM(newSettingsView.element)
      newSettingsView.initializePanels()
      return expect(newSettingsView.activePanel).toEqual({ name: 'Core', options: {} })
    })

    return it('serializes the active panel name even when the panels were never initialized', function () {
      settingsView.showPanel('Themes')
      const settingsView2 = main.createSettingsView(settingsView.serialize())
      const settingsView3 = main.createSettingsView(settingsView2.serialize())
      jasmine.attachToDOM(settingsView3.element)
      settingsView3.initializePanels()
      return expect(settingsView3.activePanel).toEqual({ name: 'Themes', options: {} })
    })
  })

  describe('.addCorePanel(name, iconName, view)', () => it('adds a menu entry to the left and a panel that can be activated by clicking it', function () {
    settingsView.addCorePanel('Panel 1', 'panel1', function () {
      const div = document.createElement('div')
      div.id = 'panel-1'
      return {
        element: div,
        show () { return div.style.display = '' },
        focus () { return div.focus() },
        destroy () { return div.remove() }
      }
    })
    settingsView.addCorePanel('Panel 2', 'panel2', function () {
      const div = document.createElement('div')
      div.id = 'panel-2'
      return {
        element: div,
        show () { return div.style.display = '' },
        focus () { return div.focus() },
        destroy () { return div.remove() }
      }
    })

    expect(settingsView.refs.panelMenu.querySelector('li[name="Panel 1"]')).toExist()
    expect(settingsView.refs.panelMenu.querySelector('li[name="Panel 2"]')).toExist()
    expect(settingsView.refs.panelMenu.children[0]).toHaveClass('active')

    jasmine.attachToDOM(settingsView.element)
    settingsView.refs.panelMenu.querySelector('li[name="Panel 1"] a').click()
    expect(settingsView.refs.panelMenu.querySelectorAll('.active').length).toBe(1)
    expect(settingsView.refs.panelMenu.querySelector('li[name="Panel 1"]')).toHaveClass('active')
    expect(settingsView.refs.panels.querySelector('#panel-1')).toBeVisible()
    expect(settingsView.refs.panels.querySelector('#panel-2')).not.toExist()
    settingsView.refs.panelMenu.querySelector('li[name="Panel 2"] a').click()
    expect(settingsView.refs.panelMenu.querySelectorAll('.active').length).toBe(1)
    expect(settingsView.refs.panelMenu.querySelector('li[name="Panel 2"]')).toHaveClass('active')
    expect(settingsView.refs.panels.querySelector('#panel-1')).toBeHidden()
    return expect(settingsView.refs.panels.querySelector('#panel-2')).toBeVisible()
  }))

  describe('when the package is activated', function () {
    const openWithCommand = command => waitsFor(function (done) {
      var openSubscription = atom.workspace.onDidOpen(function () {
        openSubscription.dispose()
        return done()
      })
      return atom.commands.dispatch(atom.views.getView(atom.workspace), command)
    })

    beforeEach(function () {
      jasmine.attachToDOM(atom.views.getView(atom.workspace))
      return waitsForPromise(() => atom.packages.activatePackage('settings-view'))
    })

    describe('when the settings view is opened with a settings-view:* command', function () {
      beforeEach(() => settingsView = null)

      describe('settings-view:open', function () {
        it('opens the settings view', function () {
          openWithCommand('settings-view:open')
          return runs(() => expect(atom.workspace.getActivePaneItem().activePanel)
            .toEqual({ name: 'Core', options: {} }))
        })

        return it('always open existing item in workspace', function () {
          const center = atom.workspace.getCenter()
          let [pane1, pane2] = Array.from([])

          waitsForPromise(() => atom.workspace.open(null, { split: 'right' }))
          runs(function () {
            expect(center.getPanes()).toHaveLength(2);
            [pane1, pane2] = Array.from(center.getPanes())
            return expect(atom.workspace.getActivePane()).toBe(pane2)
          })

          openWithCommand('settings-view:open')

          runs(function () {
            expect(atom.workspace.getActivePaneItem().activePanel).toEqual({ name: 'Core', options: {} })
            return expect(atom.workspace.getActivePane()).toBe(pane2)
          })

          runs(() => pane1.activate())

          openWithCommand('settings-view:open')

          return runs(function () {
            expect(atom.workspace.getActivePaneItem().activePanel).toEqual({ name: 'Core', options: {} })
            return expect(atom.workspace.getActivePane()).toBe(pane2)
          })
        })
      })

      describe('settings-view:core', () => it('opens the core settings view', function () {
        openWithCommand('settings-view:editor')
        runs(() => openWithCommand('settings-view:core'))
        return runs(() => expect(atom.workspace.getActivePaneItem().activePanel)
          .toEqual({ name: 'Core', options: { uri: 'atom://config/core' } }))
      }))

      describe('settings-view:editor', () => it('opens the editor settings view', function () {
        openWithCommand('settings-view:editor')
        return runs(() => expect(atom.workspace.getActivePaneItem().activePanel)
          .toEqual({ name: 'Editor', options: { uri: 'atom://config/editor' } }))
      }))

      describe('settings-view:show-keybindings', () => it('opens the settings view to the keybindings page', function () {
        openWithCommand('settings-view:show-keybindings')
        return runs(() => expect(atom.workspace.getActivePaneItem().activePanel)
          .toEqual({ name: 'Keybindings', options: { uri: 'atom://config/keybindings' } }))
      }))

      describe('settings-view:change-themes', () => it('opens the settings view to the themes page', function () {
        openWithCommand('settings-view:change-themes')
        return runs(() => expect(atom.workspace.getActivePaneItem().activePanel)
          .toEqual({ name: 'Themes', options: { uri: 'atom://config/themes' } }))
      }))

      describe('settings-view:uninstall-themes', () => it('opens the settings view to the themes page', function () {
        openWithCommand('settings-view:uninstall-themes')
        return runs(() => expect(atom.workspace.getActivePaneItem().activePanel)
          .toEqual({ name: 'Themes', options: { uri: 'atom://config/themes' } }))
      }))

      describe('settings-view:uninstall-packages', () => it('opens the settings view to the install page', function () {
        openWithCommand('settings-view:uninstall-packages')
        return runs(() => expect(atom.workspace.getActivePaneItem().activePanel)
          .toEqual({ name: 'Packages', options: { uri: 'atom://config/packages' } }))
      }))

      describe('settings-view:install-packages-and-themes', () => it('opens the settings view to the install page', function () {
        openWithCommand('settings-view:install-packages-and-themes')
        return runs(() => expect(atom.workspace.getActivePaneItem().activePanel)
          .toEqual({ name: 'Install', options: { uri: 'atom://config/install' } }))
      }))

      return describe('settings-view:check-for-package-updates', () => it('opens the settings view to the install page', function () {
        openWithCommand('settings-view:check-for-package-updates')
        return runs(() => expect(atom.workspace.getActivePaneItem().activePanel)
          .toEqual({ name: 'Updates', options: { uri: 'atom://config/updates' } }))
      }))
    })

    describe('when atom.workspace.open() is used with a config URI', function () {
      const focusIsWithinActivePanel = function () {
        const activePanel = settingsView.panelsByName[settingsView.activePanel.name]
        return (activePanel.element === document.activeElement) || activePanel.element.contains(document.activeElement)
      }

      const expectActivePanelToBeKeyboardScrollable = function () {
        const activePanel = settingsView.panelsByName[settingsView.activePanel.name]
        spyOn(activePanel, 'pageDown')
        atom.commands.dispatch(activePanel.element, 'core:page-down')
        expect(activePanel.pageDown).toHaveBeenCalled()
        spyOn(activePanel, 'pageUp')
        atom.commands.dispatch(activePanel.element, 'core:page-up')
        return expect(activePanel.pageUp).toHaveBeenCalled()
      }

      beforeEach(() => settingsView = null)

      it('opens the settings to the correct panel with atom://config/<panel-name> and that panel is keyboard-scrollable', function () {
        waitsForPromise(() => atom.workspace.open('atom://config').then(s => settingsView = s))

        waitsFor(done => process.nextTick(done))
        runs(function () {
          expect(settingsView.activePanel)
            .toEqual({ name: 'Core', options: {} })
          expect(focusIsWithinActivePanel()).toBe(true)
          return expectActivePanelToBeKeyboardScrollable()
        })

        waitsForPromise(() => atom.workspace.open('atom://config/editor').then(s => settingsView = s))

        waits(1)
        runs(function () {
          expect(settingsView.activePanel)
            .toEqual({ name: 'Editor', options: { uri: 'atom://config/editor' } })
          expect(focusIsWithinActivePanel()).toBe(true)
          return expectActivePanelToBeKeyboardScrollable()
        })

        waitsForPromise(() => atom.workspace.open('atom://config/keybindings').then(s => settingsView = s))

        waits(1)
        runs(function () {
          expect(settingsView.activePanel)
            .toEqual({ name: 'Keybindings', options: { uri: 'atom://config/keybindings' } })
          expect(focusIsWithinActivePanel()).toBe(true)
          return expectActivePanelToBeKeyboardScrollable()
        })

        waitsForPromise(() => atom.workspace.open('atom://config/packages').then(s => settingsView = s))

        waits(1)
        runs(function () {
          expect(settingsView.activePanel)
            .toEqual({ name: 'Packages', options: { uri: 'atom://config/packages' } })
          expect(focusIsWithinActivePanel()).toBe(true)
          return expectActivePanelToBeKeyboardScrollable()
        })

        waitsForPromise(() => atom.workspace.open('atom://config/themes').then(s => settingsView = s))

        waits(1)
        runs(function () {
          expect(settingsView.activePanel)
            .toEqual({ name: 'Themes', options: { uri: 'atom://config/themes' } })
          expect(focusIsWithinActivePanel()).toBe(true)
          return expectActivePanelToBeKeyboardScrollable()
        })

        waitsForPromise(() => atom.workspace.open('atom://config/updates').then(s => settingsView = s))

        waits(1)
        runs(function () {
          expect(settingsView.activePanel)
            .toEqual({ name: 'Updates', options: { uri: 'atom://config/updates' } })
          expect(focusIsWithinActivePanel()).toBe(true)
          return expectActivePanelToBeKeyboardScrollable()
        })

        waitsForPromise(() => atom.workspace.open('atom://config/install').then(s => settingsView = s))

        let hasSystemPanel = false
        waits(1)
        runs(function () {
          expect(settingsView.activePanel)
            .toEqual({ name: 'Install', options: { uri: 'atom://config/install' } })
          expect(focusIsWithinActivePanel()).toBe(true)
          expectActivePanelToBeKeyboardScrollable()
          return hasSystemPanel = (settingsView.panelsByName.System != null)
        })

        if (hasSystemPanel) {
          waitsForPromise(() => atom.workspace.open('atom://config/system').then(s => settingsView = s))

          waits(1)
          return runs(function () {
            expect(settingsView.activePanel)
              .toEqual({ name: 'System', options: { uri: 'atom://config/system' } })
            expect(focusIsWithinActivePanel()).toBe(true)
            return expectActivePanelToBeKeyboardScrollable()
          })
        }
      })

      it('opens the package settings view with atom://config/packages/<package-name>', function () {
        waitsForPromise(() => atom.packages.activatePackage(path.join(__dirname, 'fixtures', 'package-with-readme')))

        waitsForPromise(() => atom.workspace.open('atom://config/packages/package-with-readme').then(s => settingsView = s))

        waitsFor(done => process.nextTick(done))
        return runs(() => expect(settingsView.activePanel)
          .toEqual({
            name: 'package-with-readme',
            options: {
              uri: 'atom://config/packages/package-with-readme',
              pack: {
                name: 'package-with-readme',
                metadata: {
                  name: 'package-with-readme'
                }
              },
              back: 'Packages'
            }
          }))
      })

      it("doesn't use cached package detail when package re-activated and opnes the package view with atom://config/packages/<package-name>", function () {
        let [detailInitial, detailAfterReactivate] = Array.from([])

        waitsForPromise(function () {
          atom.packages.activate()
          return new Promise(resolve => atom.packages.onDidActivateInitialPackages(resolve))
        })

        waitsForPromise(() => atom.packages.activatePackage(path.join(__dirname, 'fixtures', 'package-with-readme')))

        waitsForPromise(() => atom.workspace.open('atom://config/packages/package-with-readme').then(s => settingsView = s))

        waitsFor(done => process.nextTick(done))

        runs(function () {
          detailInitial = settingsView.getOrCreatePanel('package-with-readme')
          return expect(settingsView.getOrCreatePanel('package-with-readme')).toBe(detailInitial)
        })

        waitsForPromise(() => atom.packages.deactivatePackage('package-with-readme'))

        waitsForPromise(() => atom.packages.activatePackage(path.join(__dirname, 'fixtures', 'package-with-readme')))

        waitsForPromise(() => atom.workspace.open('atom://config/packages/package-with-readme'))

        return runs(function () {
          detailAfterReactivate = settingsView.getOrCreatePanel('package-with-readme')
          expect(settingsView.getOrCreatePanel('package-with-readme')).toBe(detailAfterReactivate)
          expect(detailInitial).toBeTruthy()
          expect(detailAfterReactivate).toBeTruthy()
          return expect(detailInitial).not.toBe(detailAfterReactivate)
        })
      })

      it("passes the URI to a pane's beforeShow() method on settings view initialization", function () {
        const InstallPanel = require('../lib/install-panel')
        spyOn(InstallPanel.prototype, 'beforeShow')

        waitsForPromise(() => atom.workspace.open('atom://config/install/package:something').then(s => settingsView = s))

        waitsFor(() => settingsView.activePanel != null
          , 'The activePanel should be set', 5000)

        return runs(function () {
          expect(settingsView.activePanel)
            .toEqual({ name: 'Install', options: { uri: 'atom://config/install/package:something' } })
          return expect(InstallPanel.prototype.beforeShow).toHaveBeenCalledWith({ uri: 'atom://config/install/package:something' })
        })
      })

      return it("passes the URI to a pane's beforeShow() method after initialization", function () {
        const InstallPanel = require('../lib/install-panel')
        spyOn(InstallPanel.prototype, 'beforeShow')

        waitsForPromise(() => atom.workspace.open('atom://config').then(s => settingsView = s))

        waitsFor(done => process.nextTick(done))

        runs(() => expect(settingsView.activePanel).toEqual({ name: 'Core', options: {} }))

        waitsForPromise(() => atom.workspace.open('atom://config/install/package:something').then(s => settingsView = s))

        waits(1)
        return runs(function () {
          expect(settingsView.activePanel)
            .toEqual({ name: 'Install', options: { uri: 'atom://config/install/package:something' } })
          return expect(InstallPanel.prototype.beforeShow).toHaveBeenCalledWith({ uri: 'atom://config/install/package:something' })
        })
      })
    })

    return describe('when the package is then deactivated', function () {
      beforeEach(() => settingsView = null)

      return it('calls the dispose method on all panels', function () {
        openWithCommand('settings-view:open')

        waitsFor(done => process.nextTick(done))

        return runs(function () {
          let panel
          settingsView = atom.workspace.getActivePaneItem()
          const panels = [
            settingsView.getOrCreatePanel('Core'),
            settingsView.getOrCreatePanel('Editor'),
            settingsView.getOrCreatePanel('Keybindings'),
            settingsView.getOrCreatePanel('Packages'),
            settingsView.getOrCreatePanel('Themes'),
            settingsView.getOrCreatePanel('Updates'),
            settingsView.getOrCreatePanel('Install')
          ]
          const systemPanel = settingsView.getOrCreatePanel('System')
          if (systemPanel != null) {
            panels.push(systemPanel)
          }
          for (panel of Array.from(panels)) {
            if (panel.dispose) {
              spyOn(panel, 'dispose')
            } else {
              spyOn(panel, 'destroy')
            }
          }

          waitsForPromise(() => Promise.resolve(atom.packages.deactivatePackage('settings-view'))) // Ensure works on promise and non-promise versions

          return runs(function () {
            for (panel of Array.from(panels)) {
              if (panel.dispose) {
                expect(panel.dispose).toHaveBeenCalled()
              } else {
                expect(panel.destroy).toHaveBeenCalled()
              }
            }
          })
        })
      })
    })
  })

  describe('when an installed package is clicked from the Install panel', () => it('displays the package details', function () {
    waitsFor(() => atom.packages.activatePackage('settings-view'))

    runs(function () {
      settingsView.packageManager.getClient()
      spyOn(settingsView.packageManager.client, 'featuredPackages').andCallFake(callback => callback(null, [{ name: 'settings-view' }]))
      return settingsView.showPanel('Install')
    })

    waitsFor(() => settingsView.element.querySelectorAll('.package-card:not(.hidden)').length > 0)

    return runs(function () {
      settingsView.element.querySelectorAll('.package-card:not(.hidden)')[0].click()

      const packageDetail = settingsView.element.querySelector('.package-detail .active')
      return expect(packageDetail.textContent).toBe('Settings View')
    })
  }))

  return describe('when the active theme has settings', function () {
    let panel = null

    beforeEach(function () {
      atom.packages.packageDirPaths.push(path.join(__dirname, 'fixtures'))
      atom.packages.loadPackage('ui-theme-with-config')
      atom.packages.loadPackage('syntax-theme-with-config')
      atom.config.set('core.themes', ['ui-theme-with-config', 'syntax-theme-with-config'])

      const reloadedHandler = jasmine.createSpy('reloadedHandler')
      atom.themes.onDidChangeActiveThemes(reloadedHandler)
      atom.themes.activatePackages()

      waitsFor('themes to be reloaded', () => reloadedHandler.callCount === 1)

      return runs(function () {
        settingsView.showPanel('Themes')
        return panel = settingsView.element.querySelector('.themes-panel')
      })
    })

    afterEach(() => atom.themes.unwatchUserStylesheet())

    describe("when the UI theme's settings button is clicked", () => it("navigates to that theme's detail view", function () {
      jasmine.attachToDOM(settingsView.element)
      expect(panel.querySelector('.active-theme-settings')).toBeVisible()

      panel.querySelector('.active-theme-settings').click()
      const packageDetail = settingsView.element.querySelector('.package-detail li.active')
      return expect(packageDetail.textContent).toBe('Ui Theme With Config')
    }))

    return describe("when the syntax theme's settings button is clicked", () => it("navigates to that theme's detail view", function () {
      jasmine.attachToDOM(settingsView.element)
      expect(panel.querySelector('.active-syntax-settings')).toBeVisible()

      panel.querySelector('.active-syntax-settings').click()
      const packageDetail = settingsView.element.querySelector('.package-detail li.active')
      return expect(packageDetail.textContent).toBe('Syntax Theme With Config')
    }))
  })
})

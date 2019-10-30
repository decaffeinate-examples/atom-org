/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS104: Avoid inline assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const path = require('path');
const PackageCard = require('../lib/package-card');
const PackageManager = require('../lib/package-manager');
const SettingsView = require('../lib/settings-view');

describe("PackageCard", function() {
  const setPackageStatusSpies = function(opts) {
    spyOn(PackageCard.prototype, 'isInstalled').andReturn(opts.installed);
    spyOn(PackageCard.prototype, 'isDisabled').andReturn(opts.disabled);
    return spyOn(PackageCard.prototype, 'hasSettings').andReturn(opts.hasSettings);
  };

  let [card, packageManager] = Array.from([]);

  beforeEach(function() {
    packageManager = new PackageManager();
    return spyOn(packageManager, 'runCommand');
  });

  it("doesn't show the disable control for a theme", function() {
    setPackageStatusSpies({installed: true, disabled: false});
    card = new PackageCard({theme: 'syntax', name: 'test-theme'}, new SettingsView(), packageManager);
    jasmine.attachToDOM(card.element);
    return expect(card.refs.enablementButton).not.toBeVisible();
  });

  it("doesn't show the status indicator for a theme", function() {
    setPackageStatusSpies({installed: true, disabled: false});
    card = new PackageCard({theme: 'syntax', name: 'test-theme'}, new SettingsView(), packageManager);
    jasmine.attachToDOM(card.element);
    return expect(card.refs.statusIndicatorButton).not.toBeVisible();
  });

  it("doesn't show the settings button for a theme", function() {
    setPackageStatusSpies({installed: true, disabled: false});
    card = new PackageCard({theme: 'syntax', name: 'test-theme'}, new SettingsView(), packageManager);
    jasmine.attachToDOM(card.element);
    return expect(card.refs.settingsButton).not.toBeVisible();
  });

  it("doesn't show the settings button on the settings view", function() {
    setPackageStatusSpies({installed: true, disabled: false, hasSettings: true});
    card = new PackageCard({name: 'test-package'}, new SettingsView(), packageManager, {onSettingsView: true});
    jasmine.attachToDOM(card.element);
    return expect(card.refs.settingsButton).not.toBeVisible();
  });

  it("removes the settings button if a package has no settings", function() {
    setPackageStatusSpies({installed: true, disabled: false, hasSettings: false});
    card = new PackageCard({name: 'test-package'}, new SettingsView(), packageManager);
    jasmine.attachToDOM(card.element);
    return expect(card.refs.settingsButton).not.toBeVisible();
  });

  it("removes the uninstall button if a package has is a bundled package", function() {
    setPackageStatusSpies({installed: true, disabled: false, hasSettings: true});
    card = new PackageCard({name: 'find-and-replace'}, new SettingsView(), packageManager);
    jasmine.attachToDOM(card.element);
    return expect(card.refs.uninstallButton).not.toBeVisible();
  });

  it("displays the new version in the update button", function() {
    setPackageStatusSpies({installed: true, disabled: false, hasSettings: true});
    card = new PackageCard({name: 'find-and-replace', version: '1.0.0', latestVersion: '1.2.0'}, new SettingsView(), packageManager);
    jasmine.attachToDOM(card.element);
    expect(card.refs.updateButton).toBeVisible();
    return expect(card.refs.updateButton.textContent).toContain('Update to 1.2.0');
  });

  it("displays the new version in the update button when the package is disabled", function() {
    setPackageStatusSpies({installed: true, disabled: true, hasSettings: true});
    card = new PackageCard({name: 'find-and-replace', version: '1.0.0', latestVersion: '1.2.0'}, new SettingsView(), packageManager);
    jasmine.attachToDOM(card.element);
    expect(card.refs.updateButton).toBeVisible();
    return expect(card.refs.updateButton.textContent).toContain('Update to 1.2.0');
  });

  it("shows the author details", function() {
    const authorName = "authorName";
    const pack = {
      name: 'some-package',
      version: '0.1.0',
      repository: `https://github.com/${authorName}/some-package`
    };
    card = new PackageCard(pack, new SettingsView(), packageManager);

    jasmine.attachToDOM(card.element);

    expect(card.refs.loginLink.textContent).toBe(authorName);
    return expect(card.refs.loginLink.href).toBe(`https://atom.io/users/${authorName}`);
  });

  describe("when the package is not installed", function() {
    it("shows the settings, uninstall, and disable buttons", function() {
      const pack = {
        name: 'some-package',
        version: '0.1.0',
        repository: 'http://github.com/omgwow/some-package'
      };
      spyOn(PackageCard.prototype, 'isDeprecated').andReturn(false);
      card = new PackageCard(pack, new SettingsView(), packageManager);

      jasmine.attachToDOM(card.element);

      expect(card.refs.installButtonGroup).toBeVisible();
      expect(card.refs.updateButtonGroup).not.toBeVisible();
      expect(card.refs.installAlternativeButtonGroup).not.toBeVisible();
      return expect(card.refs.packageActionButtonGroup).not.toBeVisible();
    });

    it("can be installed if currently not installed", function() {
      setPackageStatusSpies({installed: false, disabled: false});
      spyOn(packageManager, 'install');

      card = new PackageCard({name: 'test-package'}, new SettingsView(), packageManager);
      expect(card.refs.installButton.style.display).not.toBe('none');
      expect(card.refs.uninstallButton.style.display).toBe('none');
      card.refs.installButton.click();
      return expect(packageManager.install).toHaveBeenCalled();
    });

    it("can be installed if currently not installed and package latest release engine match atom version", function() {
      spyOn(packageManager, 'install');
      spyOn(packageManager, 'loadCompatiblePackageVersion').andCallFake(function(packageName, callback) {
        const pack = {
          name: packageName,
          version: '0.1.0',
          engines: {
            atom: '>0.50.0'
          }
        };

        return callback(null, pack);
      });

      setPackageStatusSpies({installed: false, disabled: false});

      card = new PackageCard({
        name: 'test-package',
        version: '0.1.0',
        engines: {
          atom: '>0.50.0'
        }
      }, new SettingsView(), packageManager);

      // In that case there's no need to make a request to get all the versions
      expect(packageManager.loadCompatiblePackageVersion).not.toHaveBeenCalled();

      expect(card.refs.installButton.style.display).not.toBe('none');
      expect(card.refs.uninstallButton.style.display).toBe('none');
      card.refs.installButton.click();
      expect(packageManager.install).toHaveBeenCalled();
      return expect(packageManager.install.mostRecentCall.args[0]).toEqual({
        name: 'test-package',
        version: '0.1.0',
        engines: {
          atom: '>0.50.0'
        }
      });
    });

    it("can be installed with a previous version whose engine match the current atom version", function() {
      spyOn(packageManager, 'install');
      spyOn(packageManager, 'loadCompatiblePackageVersion').andCallFake(function(packageName, callback) {
        const pack = {
          name: packageName,
          version: '0.0.1',
          engines: {
            atom: '>0.50.0'
          }
        };

        return callback(null, pack);
      });

      setPackageStatusSpies({installed: false, disabled: false});

      card = new PackageCard({
        name: 'test-package',
        version: '0.1.0',
        engines: {
          atom: '>99.0.0'
        }
      }, new SettingsView(), packageManager);

      expect(card.refs.installButton.style.display).not.toBe('none');
      expect(card.refs.uninstallButton.style.display).toBe('none');
      expect(card.refs.versionValue.textContent).toBe('0.0.1');
      expect(card.refs.versionValue).toHaveClass('text-warning');
      expect(card.refs.packageMessage).toHaveClass('text-warning');
      card.refs.installButton.click();
      expect(packageManager.install).toHaveBeenCalled();
      return expect(packageManager.install.mostRecentCall.args[0]).toEqual({
        name: 'test-package',
        version: '0.0.1',
        engines: {
          atom: '>0.50.0'
        }
      });
    });

    return it("can't be installed if there is no version compatible with the current atom version", function() {
      spyOn(packageManager, 'loadCompatiblePackageVersion').andCallFake(function(packageName, callback) {
        const pack =
          {name: packageName};

        return callback(null, pack);
      });

      setPackageStatusSpies({installed: false, disabled: false});

      const pack = {
        name: 'test-package',
        engines: {
          atom: '>=99.0.0'
        }
      };
      card = new PackageCard(pack , new SettingsView(), packageManager);
      jasmine.attachToDOM(card.element);

      expect(card.refs.installButtonGroup).not.toBeVisible();
      expect(card.refs.packageActionButtonGroup).not.toBeVisible();
      expect(card.refs.versionValue).toHaveClass('text-error');
      return expect(card.refs.packageMessage).toHaveClass('text-error');
    });
  });

  describe("when the package is installed", function() {
    beforeEach(function() {
      atom.packages.loadPackage(path.join(__dirname, 'fixtures', 'package-with-config'));
      return waitsFor(() => atom.packages.isPackageLoaded('package-with-config') === true);
    });

    it("can be disabled if installed", function() {
      setPackageStatusSpies({installed: true, disabled: false});
      spyOn(atom.packages, 'disablePackage').andReturn(true);

      card = new PackageCard({name: 'test-package'}, new SettingsView(), packageManager);
      expect(card.refs.enablementButton.querySelector('.disable-text').textContent).toBe('Disable');
      card.refs.enablementButton.click();
      return expect(atom.packages.disablePackage).toHaveBeenCalled();
    });

    it("can be updated", function() {
      const pack = atom.packages.getLoadedPackage('package-with-config');
      pack.latestVersion = '1.1.0';
      let packageUpdated = false;

      packageManager.on('package-updated', () => packageUpdated = true);
      packageManager.runCommand.andCallFake(function(args, callback) {
        callback(0, '', '');
        return {onWillThrowError() {}};
      });

      const originalLoadPackage = atom.packages.loadPackage;
      spyOn(atom.packages, 'loadPackage').andCallFake(() => originalLoadPackage.call(atom.packages, path.join(__dirname, 'fixtures', 'package-with-config')));

      card = new PackageCard(pack, new SettingsView(), packageManager);
      jasmine.attachToDOM(card.element);
      expect(card.refs.updateButton).toBeVisible();

      card.update();

      waitsFor(() => packageUpdated);

      return runs(() => expect(card.refs.updateButton).not.toBeVisible());
    });

    it('keeps the update button visible if the update failed', function() {
      const pack = atom.packages.getLoadedPackage('package-with-config');
      pack.latestVersion = '1.1.0';
      let updateFailed = false;

      packageManager.on('package-update-failed', () => updateFailed = true);
      packageManager.runCommand.andCallFake(function(args, callback) {
        callback(1, '', '');
        return {onWillThrowError() {}};
      });

      const originalLoadPackage = atom.packages.loadPackage;
      spyOn(atom.packages, 'loadPackage').andCallFake(() => originalLoadPackage.call(atom.packages, path.join(__dirname, 'fixtures', 'package-with-config')));

      card = new PackageCard(pack, new SettingsView(), packageManager);
      jasmine.attachToDOM(card.element);
      expect(card.refs.updateButton).toBeVisible();

      card.update();

      waitsFor(() => updateFailed);

      return runs(() => expect(card.refs.updateButton).toBeVisible());
    });

    it('does not error when attempting to update without any update available', function() {
      // While this cannot be done through the package card UI,
      // updates can still be triggered through the Updates panel's Update All button
      // https://github.com/atom/settings-view/issues/879

      const pack = atom.packages.getLoadedPackage('package-with-config');

      const originalLoadPackage = atom.packages.loadPackage;
      spyOn(atom.packages, 'loadPackage').andCallFake(() => originalLoadPackage.call(atom.packages, path.join(__dirname, 'fixtures', 'package-with-config')));

      card = new PackageCard(pack, new SettingsView(), packageManager);
      jasmine.attachToDOM(card.element);
      expect(card.refs.updateButton).not.toBeVisible();

      waitsForPromise(() => card.update());

      return runs(() => expect(card.refs.updateButton).not.toBeVisible());
    });

    it("will stay disabled after an update", function() {
      const pack = atom.packages.getLoadedPackage('package-with-config');
      pack.latestVersion = '1.1.0';
      let packageUpdated = false;

      packageManager.on('package-updated', () => packageUpdated = true);
      packageManager.runCommand.andCallFake(function(args, callback) {
        callback(0, '', '');
        return {onWillThrowError() {}};
      });

      const originalLoadPackage = atom.packages.loadPackage;
      spyOn(atom.packages, 'loadPackage').andCallFake(() => originalLoadPackage.call(atom.packages, path.join(__dirname, 'fixtures', 'package-with-config')));

      pack.disable();
      card = new PackageCard(pack, new SettingsView(), packageManager);
      expect(atom.packages.isPackageDisabled('package-with-config')).toBe(true);
      card.update();

      waitsFor(() => packageUpdated);

      return runs(() => expect(atom.packages.isPackageDisabled('package-with-config')).toBe(true));
    });

    it("is uninstalled when the uninstallButton is clicked", function() {
      setPackageStatusSpies({installed: true, disabled: false});

      let [uninstallCallback] = Array.from([]);
      packageManager.runCommand.andCallFake(function(args, callback) {
        if (args[0] === 'uninstall') {
          uninstallCallback = callback;
        }
        return {onWillThrowError() {}};
      });

      spyOn(packageManager, 'install').andCallThrough();
      spyOn(packageManager, 'uninstall').andCallThrough();

      const pack = atom.packages.getLoadedPackage('package-with-config');
      card = new PackageCard(pack, new SettingsView(), packageManager);
      jasmine.attachToDOM(card.element);

      expect(card.refs.uninstallButton).toBeVisible();
      expect(card.refs.enablementButton).toBeVisible();
      card.refs.uninstallButton.click();

      expect(card.refs.uninstallButton.disabled).toBe(true);
      expect(card.refs.enablementButton.disabled).toBe(true);
      expect(card.refs.uninstallButton).toHaveClass('is-uninstalling');

      expect(packageManager.uninstall).toHaveBeenCalled();
      expect(packageManager.uninstall.mostRecentCall.args[0].name).toEqual('package-with-config');

      jasmine.unspy(PackageCard.prototype, 'isInstalled');
      spyOn(PackageCard.prototype, 'isInstalled').andReturn(false);
      uninstallCallback(0, '', '');

      waits(1);
      return runs(function() {
        expect(card.refs.uninstallButton.disabled).toBe(false);
        expect(card.refs.uninstallButton).not.toHaveClass('is-uninstalling');
        expect(card.refs.installButtonGroup).toBeVisible();
        expect(card.refs.updateButtonGroup).not.toBeVisible();
        expect(card.refs.packageActionButtonGroup).not.toBeVisible();
        return expect(card.refs.installAlternativeButtonGroup).not.toBeVisible();
      });
    });

    it("shows the settings, uninstall, and enable buttons when disabled", function() {
      atom.config.set('package-with-config.setting', 'something');
      const pack = atom.packages.getLoadedPackage('package-with-config');
      spyOn(atom.packages, 'isPackageDisabled').andReturn(true);
      card = new PackageCard(pack, new SettingsView(), packageManager);
      jasmine.attachToDOM(card.element);

      expect(card.refs.updateButtonGroup).not.toBeVisible();
      expect(card.refs.installButtonGroup).not.toBeVisible();
      expect(card.refs.installAlternativeButtonGroup).not.toBeVisible();

      expect(card.refs.settingsButton).toBeVisible();
      expect(card.refs.uninstallButton).toBeVisible();
      expect(card.refs.enablementButton).toBeVisible();
      return expect(card.refs.enablementButton.textContent).toBe('Enable');
    });

    it("shows the settings, uninstall, and disable buttons", function() {
      atom.config.set('package-with-config.setting', 'something');
      const pack = atom.packages.getLoadedPackage('package-with-config');
      spyOn(PackageCard.prototype, 'isDeprecated').andReturn(false);
      card = new PackageCard(pack, new SettingsView(), packageManager);

      jasmine.attachToDOM(card.element);

      expect(card.refs.updateButtonGroup).not.toBeVisible();
      expect(card.refs.installButtonGroup).not.toBeVisible();
      expect(card.refs.installAlternativeButtonGroup).not.toBeVisible();

      expect(card.refs.settingsButton).toBeVisible();
      expect(card.refs.uninstallButton).toBeVisible();
      expect(card.refs.enablementButton).toBeVisible();
      return expect(card.refs.enablementButton.textContent).toBe('Disable');
    });

    return it("does not show the settings button when there are no settings", function() {
      const pack = atom.packages.getLoadedPackage('package-with-config');
      spyOn(PackageCard.prototype, 'isDeprecated').andReturn(false);
      spyOn(PackageCard.prototype, 'hasSettings').andReturn(false);
      card = new PackageCard(pack, new SettingsView(), packageManager);

      jasmine.attachToDOM(card.element);

      expect(card.refs.settingsButton).not.toBeVisible();
      expect(card.refs.uninstallButton).toBeVisible();
      expect(card.refs.enablementButton).toBeVisible();
      return expect(card.refs.enablementButton.textContent).toBe('Disable');
    });
  });

  /*
  hasDeprecations, no update: disabled-settings, uninstall, disable
  hasDeprecations, has update: update, disabled-settings, uninstall, disable
  hasAlternative; core: uninstall
  hasAlternative; package, alt not installed: install new-package
  hasAlternative; package, alt installed: uninstall
  */
  return describe("when the package has deprecations", function() {
    beforeEach(function() {
      atom.packages.loadPackage(path.join(__dirname, 'fixtures', 'package-with-config'));

      waitsFor(() => atom.packages.isPackageLoaded('package-with-config') === true);

      return runs(() => atom.config.set('package-with-config.setting', 'something'));
    });

    describe("when hasDeprecations is true and NO update is available", function() {
      beforeEach(function() {
        spyOn(PackageCard.prototype, 'isDeprecated').andReturn(true);
        spyOn(PackageCard.prototype, 'isInstalled').andReturn(true);
        spyOn(PackageCard.prototype, 'getDeprecatedPackageMetadata').andReturn({
          hasDeprecations: true,
          version: '<=1.0.0'
        });
        const pack = atom.packages.getLoadedPackage('package-with-config');
        pack.version = pack.metadata.version;
        card = new PackageCard(pack, new SettingsView(), packageManager);
        return jasmine.attachToDOM(card.element);
      });

      it("shows the correct state", function() {
        spyOn(atom.packages, 'isPackageDisabled').andReturn(false);
        card.updateInterfaceState();
        expect(card.refs.updateButtonGroup).not.toBeVisible();
        expect(card.refs.installButtonGroup).not.toBeVisible();
        expect(card.refs.installAlternativeButtonGroup).not.toBeVisible();

        expect(card.element).toHaveClass('deprecated');
        expect(card.refs.packageMessage.textContent).toContain('no update available');
        expect(card.refs.packageMessage).toHaveClass('text-warning');
        expect(card.refs.settingsButton.disabled).toBe(true);
        expect(card.refs.uninstallButton).toBeVisible();
        expect(card.refs.enablementButton).toBeVisible();
        expect(card.refs.enablementButton.textContent).toBe('Disable');
        return expect(card.refs.enablementButton.disabled).toBe(false);
      });

      return it("displays a disabled enable button when the package is disabled", function() {
        spyOn(atom.packages, 'isPackageDisabled').andReturn(true);
        card.updateInterfaceState();
        expect(card.refs.updateButtonGroup).not.toBeVisible();
        expect(card.refs.installButtonGroup).not.toBeVisible();
        expect(card.refs.installAlternativeButtonGroup).not.toBeVisible();

        expect(card.element).toHaveClass('deprecated');
        expect(card.refs.packageMessage.textContent).toContain('no update available');
        expect(card.refs.packageMessage).toHaveClass('text-warning');
        expect(card.refs.settingsButton.disabled).toBe(true);
        expect(card.refs.uninstallButton).toBeVisible();
        expect(card.refs.enablementButton).toBeVisible();
        expect(card.refs.enablementButton.textContent).toBe('Enable');
        return expect(card.refs.enablementButton.disabled).toBe(true);
      });
    });

    // NOTE: the mocking here is pretty delicate
    describe("when hasDeprecations is true and there is an update is available", function() {
      beforeEach(function() {
        spyOn(PackageCard.prototype, 'isDeprecated').andCallFake(function(version) {
          let left;
          const semver = require('semver');
          version = (left = version != null ? version : __guard__(card != null ? card.pack : undefined, x => x.version)) != null ? left : '1.0.0';
          return semver.satisfies(version, '<=1.0.1');
        });
        spyOn(PackageCard.prototype, 'getDeprecatedPackageMetadata').andReturn({
          hasDeprecations: true,
          version: '<=1.0.1'
        });
        const pack = atom.packages.getLoadedPackage('package-with-config');
        pack.version = pack.metadata.version;
        card = new PackageCard(pack, new SettingsView(), packageManager);
        return jasmine.attachToDOM(card.element);
      });

      it("explains that the update WILL NOT fix the deprecations when the new version isnt higher than the max version", function() {
        card.displayAvailableUpdate('1.0.1');
        expect(card.refs.packageMessage.textContent).not.toContain('no update available');
        return expect(card.refs.packageMessage.textContent).toContain('still contains deprecations');
      });

      return describe("when the available update fixes deprecations", function() {
        it("explains that the update WILL fix the deprecations when the new version is higher than the max version", function() {
          card.displayAvailableUpdate('1.1.0');
          expect(card.refs.packageMessage.textContent).not.toContain('no update available');
          expect(card.refs.packageMessage.textContent).toContain('without deprecations');

          expect(card.refs.updateButtonGroup).toBeVisible();
          expect(card.refs.installButtonGroup).not.toBeVisible();
          expect(card.refs.packageActionButtonGroup).toBeVisible();
          expect(card.refs.installAlternativeButtonGroup).not.toBeVisible();
          expect(card.refs.uninstallButton).toBeVisible();
          expect(card.refs.enablementButton).toBeVisible();
          return expect(card.refs.enablementButton.textContent).toBe('Disable');
        });

        it("updates the package and shows a restart notification when the update button is clicked", function() {
          expect(atom.packages.getLoadedPackage('package-with-config')).toBeTruthy();

          let [updateCallback] = Array.from([]);
          packageManager.runCommand.andCallFake(function(args, callback) {
            updateCallback = callback;
            return {onWillThrowError() {}};
          });
          spyOn(packageManager, 'update').andCallThrough();

          const originalLoadPackage = atom.packages.loadPackage;
          spyOn(atom.packages, 'loadPackage').andCallFake(function() {
            const pack = originalLoadPackage.call(atom.packages, path.join(__dirname, 'fixtures', 'package-with-config'));
            if (pack != null) { pack.metadata.version = '1.1.0'; }
            return pack;
          });

          card.pack.latestVersion = "1.1.0";
          card.displayAvailableUpdate('1.1.0');
          expect(card.refs.updateButtonGroup).toBeVisible();

          expect(atom.packages.getLoadedPackage('package-with-config')).toBeTruthy();
          card.refs.updateButton.click();

          expect(card.refs.updateButton.disabled).toBe(true);
          expect(card.refs.updateButton).toHaveClass('is-installing');

          expect(packageManager.update).toHaveBeenCalled();
          expect(packageManager.update.mostRecentCall.args[0].name).toEqual('package-with-config');
          expect(packageManager.runCommand).toHaveBeenCalled();
          expect(card.element).toHaveClass('deprecated');

          expect(card.refs.updateButtonGroup).toBeVisible();
          expect(card.refs.installButtonGroup).not.toBeVisible();
          expect(card.refs.installAlternativeButtonGroup).not.toBeVisible();

          updateCallback(0, '', '');

          waits(0); // Wait for PackageCard.update promise to resolve

          return runs(function() {
            expect(card.refs.updateButton.disabled).toBe(false);
            expect(card.refs.updateButton).not.toHaveClass('is-installing');
            expect(card.refs.updateButtonGroup).not.toBeVisible();
            expect(card.refs.installButtonGroup).not.toBeVisible();
            expect(card.refs.packageActionButtonGroup).toBeVisible();
            expect(card.refs.installAlternativeButtonGroup).not.toBeVisible();
            expect(card.refs.versionValue.textContent).toBe('1.0.0'); // Does not update until restart

            const notifications = atom.notifications.getNotifications();
            expect(notifications.length).toBe(1);
            expect(notifications[0].options.detail).toBe("1.0.0 -> 1.1.0");

            spyOn(atom, 'restartApplication');
            notifications[0].options.buttons[0].onDidClick();
            return expect(atom.restartApplication).toHaveBeenCalled();
          });
        });

        return it("shows the sha in the notification when a git url package is updated", function() {
          expect(atom.packages.getLoadedPackage('package-with-config')).toBeTruthy();

          let [updateCallback] = Array.from([]);
          packageManager.runCommand.andCallFake(function(args, callback) {
            updateCallback = callback;
            return {onWillThrowError() {}};
          });
          spyOn(packageManager, 'update').andCallThrough();

          card.pack.apmInstallSource = {type: 'git', sha: 'cf23df2207d99a74fbe169e3eba035e633b65d94'};
          card.pack.latestSha = 'a296114f3d0deec519a41f4c62e7fc56075b7f01';

          card.displayAvailableUpdate('1.1.0');
          expect(card.refs.updateButtonGroup).toBeVisible();

          expect(atom.packages.getLoadedPackage('package-with-config')).toBeTruthy();
          card.refs.updateButton.click();

          updateCallback(0, '', '');

          waits(0); // Wait for PackageCard.update promise to resolve

          return runs(function() {
            const notifications = atom.notifications.getNotifications();
            expect(notifications.length).toBe(1);
            return expect(notifications[0].options.detail).toBe("cf23df22 -> a296114f");
          });
        });
      });
    });

    describe("when hasAlternative is true and alternative is core", function() {
      beforeEach(function() {
        spyOn(atom.packages, 'isDeprecatedPackage').andReturn(true);
        spyOn(atom.packages, 'isPackageLoaded').andReturn(false);
        spyOn(atom.packages, 'isPackageDisabled').andReturn(false);
        spyOn(atom.packages, 'getAvailablePackageNames').andReturn(['package-with-config']);
        spyOn(PackageCard.prototype, 'getDeprecatedPackageMetadata').andReturn({
          hasAlternative: true,
          alternative: 'core'
        });
        const pack = atom.packages.getLoadedPackage('package-with-config');
        card = new PackageCard(pack, new SettingsView(), packageManager);
        return jasmine.attachToDOM(card.element);
      });

      return it("notifies that the package has been replaced, shows uninstallButton", function() {
        expect(card.refs.updateButtonGroup).not.toBeVisible();
        expect(card.refs.installButtonGroup).not.toBeVisible();
        expect(card.refs.installAlternativeButtonGroup).not.toBeVisible();

        expect(card.element).toHaveClass('deprecated');
        expect(card.refs.packageMessage.textContent).toContain('have been added to core');
        expect(card.refs.packageMessage).toHaveClass('text-warning');
        expect(card.refs.settingsButton).not.toBeVisible();
        expect(card.refs.uninstallButton).toBeVisible();
        return expect(card.refs.enablementButton).not.toBeVisible();
      });
    });

    describe("when hasAlternative is true and alternative is a package that has not been installed", function() {
      beforeEach(function() {
        spyOn(PackageCard.prototype, 'isDeprecated').andReturn(true);
        spyOn(PackageCard.prototype, 'getDeprecatedPackageMetadata').andReturn({
          hasAlternative: true,
          alternative: 'not-installed-package'
        });
        const pack = atom.packages.getLoadedPackage('package-with-config');
        card = new PackageCard(pack, new SettingsView(), packageManager);
        return jasmine.attachToDOM(card.element);
      });

      it("shows installAlternativeButton and uninstallButton", function() {
        expect(card.refs.updateButtonGroup).not.toBeVisible();
        expect(card.refs.installButtonGroup).not.toBeVisible();
        expect(card.refs.installAlternativeButtonGroup).toBeVisible();

        expect(card.refs.packageActionButtonGroup).toBeVisible();
        expect(card.refs.settingsButton).not.toBeVisible();
        expect(card.refs.uninstallButton).toBeVisible();
        expect(card.refs.enablementButton).not.toBeVisible();

        expect(card.element).toHaveClass('deprecated');
        expect(card.refs.packageMessage.textContent).toContain('has been replaced by not-installed-package');
        return expect(card.refs.packageMessage).toHaveClass('text-warning');
      });

      return it("uninstalls the old package, and installs the new when the install alternative button is clicked", function() {
        let [installCallback, uninstallCallback] = Array.from([]);
        packageManager.runCommand.andCallFake(function(args, callback) {
          if (args[0] === 'install') {
            installCallback = callback;
          } else if (args[0] === 'uninstall') {
            uninstallCallback = callback;
          }
          return {onWillThrowError() {}};
        });

        spyOn(packageManager, 'install').andCallThrough();
        spyOn(packageManager, 'uninstall').andCallThrough();
        spyOn(atom.packages, 'activatePackage');

        card.refs.installAlternativeButton.click();

        expect(card.refs.installAlternativeButton.disabled).toBe(true);
        expect(card.refs.installAlternativeButton).toHaveClass('is-installing');

        expect(packageManager.uninstall).toHaveBeenCalled();
        expect(packageManager.uninstall.mostRecentCall.args[0].name).toEqual('package-with-config');

        expect(packageManager.install).toHaveBeenCalled();
        expect(packageManager.install.mostRecentCall.args[0]).toEqual({name: 'not-installed-package'});

        uninstallCallback(0, '', '');

        waits(1);
        runs(function() {
          expect(card.refs.installAlternativeButton.disabled).toBe(true);
          expect(card.refs.installAlternativeButton).toHaveClass('is-installing');
          return installCallback(0, '', '');
        });

        waits(1);
        return runs(function() {
          expect(card.refs.installAlternativeButton.disabled).toBe(false);
          expect(card.refs.installAlternativeButton).not.toHaveClass('is-installing');
          expect(card.refs.updateButtonGroup).not.toBeVisible();
          expect(card.refs.installButtonGroup).not.toBeVisible();
          expect(card.refs.packageActionButtonGroup).not.toBeVisible();
          return expect(card.refs.installAlternativeButtonGroup).not.toBeVisible();
        });
      });
    });

    return describe("when hasAlternative is true and alternative is an installed package", function() {
      beforeEach(function() {
        atom.packages.loadPackage(path.join(__dirname, 'fixtures', 'language-test'));
        waitsFor(() => atom.packages.isPackageLoaded('language-test') === true);

        return runs(function() {
          spyOn(PackageCard.prototype, 'isDeprecated').andReturn(true);
          spyOn(PackageCard.prototype, 'getDeprecatedPackageMetadata').andReturn({
            hasAlternative: true,
            alternative: 'language-test'
          });
          const pack = atom.packages.getLoadedPackage('package-with-config');
          card = new PackageCard(pack, new SettingsView(), packageManager);
          return jasmine.attachToDOM(card.element);
        });
      });

      return it("notifies that the package has been replaced, shows uninstallButton", function() {
        expect(card.refs.updateButtonGroup).not.toBeVisible();
        expect(card.refs.installButtonGroup).not.toBeVisible();
        expect(card.refs.installAlternativeButtonGroup).not.toBeVisible();

        expect(card.element).toHaveClass('deprecated');
        expect(card.refs.packageMessage.textContent).toContain('has been replaced by language-test');
        expect(card.refs.packageMessage.textContent).toContain('already installed');
        expect(card.refs.packageMessage.textContent).toContain('Please uninstall');
        expect(card.refs.packageMessage).toHaveClass('text-warning');
        expect(card.refs.settingsButton).not.toBeVisible();
        expect(card.refs.uninstallButton).toBeVisible();
        return expect(card.refs.enablementButton).not.toBeVisible();
      });
    });
  });
});

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
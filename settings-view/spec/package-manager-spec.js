/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const path = require('path');
const process = require('process');
const PackageManager = require('../lib/package-manager');

describe("PackageManager", function() {
  let [packageManager] = Array.from([]);

  beforeEach(function() {
    spyOn(atom.packages, 'getApmPath').andReturn('/an/invalid/apm/command/to/run');
    return packageManager = new PackageManager();
  });

  it("handle errors spawning apm", function() {
    const noSuchCommandError = process.platform === 'win32' ? ' cannot find the path ' : 'ENOENT';
    waitsForPromise({shouldReject: true}, () => packageManager.getInstalled());
    waitsForPromise({shouldReject: true}, () => packageManager.getOutdated());
    waitsForPromise({shouldReject: true}, () => packageManager.getFeatured());
    waitsForPromise({shouldReject: true}, () => packageManager.getPackage('foo'));

    const installCallback = jasmine.createSpy('installCallback');
    const uninstallCallback = jasmine.createSpy('uninstallCallback');
    const updateCallback = jasmine.createSpy('updateCallback');

    runs(() => packageManager.install({name: 'foo', version: '1.0.0'}, installCallback));

    waitsFor(() => installCallback.callCount === 1);

    runs(function() {
      const installArg = installCallback.argsForCall[0][0];
      expect(installArg.message).toBe("Installing \u201Cfoo@1.0.0\u201D failed.");
      expect(installArg.packageInstallError).toBe(true);
      expect(installArg.stderr).toContain(noSuchCommandError);

      return packageManager.uninstall({name: 'foo'}, uninstallCallback);
    });

    waitsFor(() => uninstallCallback.callCount === 1);

    runs(function() {
      const uninstallArg = uninstallCallback.argsForCall[0][0];
      expect(uninstallArg.message).toBe("Uninstalling \u201Cfoo\u201D failed.");
      expect(uninstallArg.stderr).toContain(noSuchCommandError);

      return packageManager.update({name: 'foo'}, '1.0.0', updateCallback);
    });

    waitsFor(() => updateCallback.callCount === 1);

    return runs(function() {
      const updateArg = updateCallback.argsForCall[0][0];
      expect(updateArg.message).toBe("Updating to \u201Cfoo@1.0.0\u201D failed.");
      expect(updateArg.packageInstallError).toBe(true);
      return expect(updateArg.stderr).toContain(noSuchCommandError);
    });
  });

  describe("::isPackageInstalled()", function() {
    it("returns false a package is not installed", () => expect(packageManager.isPackageInstalled('some-package')).toBe(false));

    it("returns true when a package is loaded", function() {
      spyOn(atom.packages, 'isPackageLoaded').andReturn(true);
      return expect(packageManager.isPackageInstalled('some-package')).toBe(true);
    });

    return it("returns true when a package is disabled", function() {
      spyOn(atom.packages, 'getAvailablePackageNames').andReturn(['some-package']);
      return expect(packageManager.isPackageInstalled('some-package')).toBe(true);
    });
  });

  describe("::install()", function() {
    let [runArgs, runCallback] = Array.from([]);

    beforeEach(() => spyOn(packageManager, 'runCommand').andCallFake(function(args, callback) {
      runArgs = args;
      runCallback = callback;
      return {onWillThrowError() {}};
    }));

    it("installs the latest version when a package version is not specified", function() {
      packageManager.install({name: 'something'}, function() {});
      expect(packageManager.runCommand).toHaveBeenCalled();
      return expect(runArgs).toEqual(['install', 'something', '--json']);
  });

    it("installs the package@version when a version is specified", function() {
      packageManager.install({name: 'something', version: '0.2.3'}, function() {});
      expect(packageManager.runCommand).toHaveBeenCalled();
      return expect(runArgs).toEqual(['install', 'something@0.2.3', '--json']);
  });

    return describe("git url installation", function() {
      it('installs https:// urls', function() {
        const url = "https://github.com/user/repo.git";
        packageManager.install({name: url});
        expect(packageManager.runCommand).toHaveBeenCalled();
        return expect(runArgs).toEqual(['install', 'https://github.com/user/repo.git', '--json']);
    });

      it('installs git@ urls', function() {
        const url = "git@github.com:user/repo.git";
        packageManager.install({name: url});
        expect(packageManager.runCommand).toHaveBeenCalled();
        return expect(runArgs).toEqual(['install', 'git@github.com:user/repo.git', '--json']);
    });

      it('installs user/repo url shortcuts', function() {
        const url = "user/repo";
        packageManager.install({name: url});
        expect(packageManager.runCommand).toHaveBeenCalled();
        return expect(runArgs).toEqual(['install', 'user/repo', '--json']);
    });

      it('installs and activates git pacakges with names different from the repo name', function() {
        spyOn(atom.packages, 'activatePackage');
        packageManager.install({name: 'git-repo-name'});
        const json = {
          metadata: {
            name: 'real-package-name'
          }
        };
        runCallback(0, JSON.stringify([json]), '');
        return expect(atom.packages.activatePackage).toHaveBeenCalledWith(json.metadata.name);
      });

      return it('emits an installed event with a copy of the pack including the full package metadata', function() {
        spyOn(packageManager, 'emitPackageEvent');
        const originalPackObject = {name: 'git-repo-name', otherData: {will: 'beCopied'}};
        packageManager.install(originalPackObject);
        const json = {
          metadata: {
            name: 'real-package-name',
            moreInfo: 'yep'
          }
        };
        runCallback(0, JSON.stringify([json]), '');

        let installEmittedCount = 0;
        for (let call of Array.from(packageManager.emitPackageEvent.calls)) {
          if (call.args[0] === "installed") {
            expect(call.args[1]).not.toEqual(originalPackObject);
            expect(call.args[1].moreInfo).toEqual("yep");
            expect(call.args[1].otherData).toBe(originalPackObject.otherData);
            installEmittedCount++;
          }
        }
        return expect(installEmittedCount).toBe(1);
      });
    });
  });

  describe("::uninstall()", function() {
    let [runCallback] = Array.from([]);

    beforeEach(function() {
      spyOn(packageManager, 'unload');
      return spyOn(packageManager, 'runCommand').andCallFake(function(args, callback) {
        runCallback = callback;
        return {onWillThrowError() {}};
      });
    });

    return it("removes the package from the core.disabledPackages list", function() {
      atom.config.set('core.disabledPackages', ['something']);

      packageManager.uninstall({name: 'something'}, function() {});

      expect(atom.config.get('core.disabledPackages')).toContain('something');
      runCallback(0, '', '');
      return expect(atom.config.get('core.disabledPackages')).not.toContain('something');
    });
  });

  describe("::installAlternative", function() {
    beforeEach(function() {
      spyOn(atom.packages, 'activatePackage');
      spyOn(packageManager, 'runCommand').andCallFake(() => ({
        onWillThrowError() {}
      }));
      atom.packages.loadPackage(path.join(__dirname, 'fixtures', 'language-test'));
      return waitsFor(() => atom.packages.isPackageLoaded('language-test') === true);
    });

    return it("installs the latest version when a package version is not specified", function() {
      const installedCallback = jasmine.createSpy();
      const installingEvent = jasmine.createSpy();
      const installedEvent = jasmine.createSpy();

      const eventArg = {
        alternative: 'a-new-package',
        pack: {
          name: 'language-test'
        }
      };

      packageManager.on('package-installing-alternative', installingEvent);
      packageManager.on('package-installed-alternative', installedEvent);

      packageManager.installAlternative({name: 'language-test'}, 'a-new-package', installedCallback);
      expect(packageManager.runCommand).toHaveBeenCalled();
      expect(packageManager.runCommand.calls[0].args[0]).toEqual(['uninstall', '--hard', 'language-test']);
      expect(packageManager.runCommand.calls[1].args[0]).toEqual(['install', 'a-new-package', '--json']);
      expect(atom.packages.isPackageLoaded('language-test')).toBe(true);

      expect(installedEvent).not.toHaveBeenCalled();
      expect(installingEvent).toHaveBeenCalled();
      expect(installingEvent.mostRecentCall.args[0]).toEqual(eventArg);

      packageManager.runCommand.calls[0].args[1](0, '', '');

      waits(1);
      runs(function() {
        expect(atom.packages.activatePackage).not.toHaveBeenCalled();
        expect(atom.packages.isPackageLoaded('language-test')).toBe(false);

        return packageManager.runCommand.calls[1].args[1](0, '', '');
      });

      waits(1);
      return runs(function() {
        expect(atom.packages.activatePackage).toHaveBeenCalledWith('a-new-package');
        expect(atom.packages.isPackageLoaded('language-test')).toBe(false);

        expect(installedEvent).toHaveBeenCalled();
        expect(installedEvent.mostRecentCall.args[0]).toEqual(eventArg);

        expect(installedCallback).toHaveBeenCalled();
        expect(installedCallback.mostRecentCall.args[0]).toEqual(null);
        return expect(installedCallback.mostRecentCall.args[1]).toEqual(eventArg);
      });
    });
  });

  describe("::packageHasSettings", function() {
    it("returns true when the pacakge has config", function() {
      atom.packages.loadPackage(path.join(__dirname, 'fixtures', 'package-with-config'));
      return expect(packageManager.packageHasSettings('package-with-config')).toBe(true);
    });

    it("returns false when the pacakge does not have config and doesn't define language grammars", () => expect(packageManager.packageHasSettings('random-package')).toBe(false));

    return it("returns true when the pacakge does not have config, but does define language grammars", function() {
      const packageName = 'language-test';

      waitsForPromise(() => atom.packages.activatePackage(path.join(__dirname, 'fixtures', packageName)));

      return runs(() => expect(packageManager.packageHasSettings(packageName)).toBe(true));
    });
  });

  return describe("::loadOutdated", function() {
    it("caches results", function() {
      spyOn(packageManager, 'runCommand').andCallFake(function(args, callback) {
        callback(0, '[{"name": "boop"}]', '');
        return {onWillThrowError() {}};
      });

      packageManager.loadOutdated(false, function() {});
      expect(packageManager.apmCache.loadOutdated.value).toMatch([{"name": "boop"}]);

      packageManager.loadOutdated(false, function() {});
      return expect(packageManager.runCommand.calls.length).toBe(1);
    });

    it("expires results after a timeout", function() {
      spyOn(packageManager, 'runCommand').andCallFake(function(args, callback) {
        callback(0, '[{"name": "boop"}]', '');
        return {onWillThrowError() {}};
      });

      packageManager.loadOutdated(false, function() {});
      const now = Date.now();
      if (!Date.now.andReturn) { spyOn(Date, 'now'); }
      Date.now.andReturn(((() => now + packageManager.CACHE_EXPIRY + 1))());
      packageManager.loadOutdated(false, function() {});

      return expect(packageManager.runCommand.calls.length).toBe(2);
    });

    it("expires results after a package updated/installed", function() {
      packageManager.apmCache.loadOutdated = {
        value: ['hi'],
        expiry: Date.now() + 999999999
      };

      spyOn(packageManager, 'runCommand').andCallFake(function(args, callback) {
        callback(0, '[{"name": "boop"}]', '');
        return {onWillThrowError() {}};
      });

      // Just prevent this stuff from calling through, it doesn't matter for this test
      spyOn(atom.packages, 'deactivatePackage').andReturn(true);
      spyOn(atom.packages, 'activatePackage').andReturn(true);
      spyOn(atom.packages, 'unloadPackage').andReturn(true);
      spyOn(atom.packages, 'loadPackage').andReturn(true);

      packageManager.loadOutdated(false, function() {});
      expect(packageManager.runCommand.calls.length).toBe(0);

      packageManager.update({}, {}, function() {}); // +1 runCommand call to update the package
      packageManager.loadOutdated(false, function() {}); // +1 runCommand call to load outdated because the cache should be wiped
      expect(packageManager.runCommand.calls.length).toBe(2);

      packageManager.install({}, function() {}); // +1 runCommand call to install the package
      packageManager.loadOutdated(false, function() {}); // +1 runCommand call to load outdated because the cache should be wiped
      expect(packageManager.runCommand.calls.length).toBe(4);

      packageManager.loadOutdated(false, function() {}); // +0 runCommand call, should be cached
      return expect(packageManager.runCommand.calls.length).toBe(4);
    });

    it("expires results if it is called with clearCache set to true", function() {
      packageManager.apmCache.loadOutdated = {
        value: ['hi'],
        expiry: Date.now() + 999999999
      };

      spyOn(packageManager, 'runCommand').andCallFake(function(args, callback) {
        callback(0, '[{"name": "boop"}]', '');
        return {onWillThrowError() {}};
      });

      packageManager.loadOutdated(true, function() {});
      expect(packageManager.runCommand.calls.length).toBe(1);
      return expect(packageManager.apmCache.loadOutdated.value).toEqual([{"name": "boop"}]);
  });

    return describe("when there is a version pinned package", function() {
      beforeEach(() => atom.config.set('core.versionPinnedPackages', ['beep']));

      it("caches results", function() {
        spyOn(packageManager, 'runCommand').andCallFake(function(args, callback) {
          callback(0, '[{"name": "boop"}, {"name": "beep"}]', '');
          return {onWillThrowError() {}};
        });

        packageManager.loadOutdated(false, function() {});
        expect(packageManager.apmCache.loadOutdated.value).toMatch([{"name": "boop"}]);

        packageManager.loadOutdated(false, function() {});
        return expect(packageManager.runCommand.calls.length).toBe(1);
      });

      it("expires results after a timeout", function() {
        spyOn(packageManager, 'runCommand').andCallFake(function(args, callback) {
          callback(0, '[{"name": "boop"}, {"name": "beep"}]', '');
          return {onWillThrowError() {}};
        });

        packageManager.loadOutdated(false, function() {});
        const now = Date.now();
        if (!Date.now.andReturn) { spyOn(Date, 'now'); }
        Date.now.andReturn(((() => now + packageManager.CACHE_EXPIRY + 1))());
        packageManager.loadOutdated(false, function() {});

        return expect(packageManager.runCommand.calls.length).toBe(2);
      });

      it("expires results after a package updated/installed", function() {
        packageManager.apmCache.loadOutdated = {
          value: ['hi'],
          expiry: Date.now() + 999999999
        };

        spyOn(packageManager, 'runCommand').andCallFake(function(args, callback) {
          callback(0, '[{"name": "boop"}, {"name": "beep"}]', '');
          return {onWillThrowError() {}};
        });

        // Just prevent this stuff from calling through, it doesn't matter for this test
        spyOn(atom.packages, 'deactivatePackage').andReturn(true);
        spyOn(atom.packages, 'activatePackage').andReturn(true);
        spyOn(atom.packages, 'unloadPackage').andReturn(true);
        spyOn(atom.packages, 'loadPackage').andReturn(true);

        packageManager.loadOutdated(false, function() {});
        expect(packageManager.runCommand.calls.length).toBe(0);

        packageManager.update({}, {}, function() {}); // +1 runCommand call to update the package
        packageManager.loadOutdated(false, function() {}); // +1 runCommand call to load outdated because the cache should be wiped
        expect(packageManager.runCommand.calls.length).toBe(2);

        packageManager.install({}, function() {}); // +1 runCommand call to install the package
        packageManager.loadOutdated(false, function() {}); // +1 runCommand call to load outdated because the cache should be wiped
        expect(packageManager.runCommand.calls.length).toBe(4);

        packageManager.loadOutdated(false, function() {}); // +0 runCommand call, should be cached
        return expect(packageManager.runCommand.calls.length).toBe(4);
      });

      return it("expires results if it is called with clearCache set to true", function() {
        packageManager.apmCache.loadOutdated = {
          value: ['hi'],
          expiry: Date.now() + 999999999
        };

        spyOn(packageManager, 'runCommand').andCallFake(function(args, callback) {
          callback(0, '[{"name": "boop"}, {"name": "beep"}]', '');
          return {onWillThrowError() {}};
        });

        packageManager.loadOutdated(true, function() {});
        expect(packageManager.runCommand.calls.length).toBe(1);
        return expect(packageManager.apmCache.loadOutdated.value).toEqual([{"name": "boop"}]);
    });
  });
});
});

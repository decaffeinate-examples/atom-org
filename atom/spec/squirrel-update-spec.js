/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {EventEmitter} = require('events');
const fs = require('fs-plus');
const path = require('path');
const temp = require('temp').track();
const SquirrelUpdate = require('../src/main-process/squirrel-update');
const Spawner = require('../src/main-process/spawner');
const WinShell = require('../src/main-process/win-shell');

// Run passed callback as Spawner.spawn() would do
const invokeCallback = function(callback) {
  const error = null;
  const stdout = '';
  return (typeof callback === 'function' ? callback(error, stdout) : undefined);
};

describe("Windows Squirrel Update", function() {
  let tempHomeDirectory = null;

  beforeEach(function() {
    // Prevent the actual home directory from being manipulated
    tempHomeDirectory = temp.mkdirSync('atom-temp-home-');
    spyOn(fs, 'getHomeDirectory').andReturn(tempHomeDirectory);

    // Prevent any spawned command from actually running and affecting the host
    spyOn(Spawner, 'spawn').andCallFake((command, args, callback) => // do nothing on command, just run passed callback
    invokeCallback(callback));

    // Prevent any actual change to Windows Shell
    class FakeShellOption {
      isRegistered(callback) { return callback(true); }
      register(callback) { return callback(null); }
      deregister(callback) { return callback(null, true); }
      update(callback) { return callback(null); }
    }
    WinShell.fileHandler = new FakeShellOption();
    WinShell.fileContextMenu = new FakeShellOption();
    WinShell.folderContextMenu = new FakeShellOption();
    return WinShell.folderBackgroundContextMenu = new FakeShellOption();
  });

  afterEach(() => temp.cleanupSync());

  it("quits the app on all squirrel events", function() {
    const app = {quit: jasmine.createSpy('quit')};

    expect(SquirrelUpdate.handleStartupEvent(app, '--squirrel-install')).toBe(true);

    waitsFor(() => app.quit.callCount === 1);

    runs(function() {
      app.quit.reset();
      return expect(SquirrelUpdate.handleStartupEvent(app, '--squirrel-updated')).toBe(true);
    });

    waitsFor(() => app.quit.callCount === 1);

    runs(function() {
      app.quit.reset();
      return expect(SquirrelUpdate.handleStartupEvent(app, '--squirrel-uninstall')).toBe(true);
    });

    waitsFor(() => app.quit.callCount === 1);

    runs(function() {
      app.quit.reset();
      return expect(SquirrelUpdate.handleStartupEvent(app, '--squirrel-obsolete')).toBe(true);
    });

    waitsFor(() => app.quit.callCount === 1);

    return runs(() => expect(SquirrelUpdate.handleStartupEvent(app, '--not-squirrel')).toBe(false));
  });

  describe("Desktop shortcut", function() {
    let desktopShortcutPath = '/non/existing/path';

    beforeEach(function() {
      desktopShortcutPath = path.join(tempHomeDirectory, 'Desktop', 'Atom.lnk');

      jasmine.unspy(Spawner, 'spawn');
      return spyOn(Spawner, 'spawn').andCallFake(function(command, args, callback) {
        if ((path.basename(command) === 'Update.exe') && ((args != null ? args[0] : undefined) === '--createShortcut') && (args != null ? args[3].match(/Desktop/i) : undefined)) {
          fs.writeFileSync(desktopShortcutPath, '');
        }
        else {}
          // simply ignore other commands

        return invokeCallback(callback);
      });
    });

    it("does not exist before install", () => expect(fs.existsSync(desktopShortcutPath)).toBe(false));

    return describe("on install", function() {
      beforeEach(function() {
        const app = {quit: jasmine.createSpy('quit')};
        SquirrelUpdate.handleStartupEvent(app, '--squirrel-install');
        return waitsFor(() => app.quit.callCount === 1);
      });

      it("creates desktop shortcut", () => expect(fs.existsSync(desktopShortcutPath)).toBe(true));

      describe("when shortcut is deleted and then app is updated", function() {
        beforeEach(function() {
          fs.removeSync(desktopShortcutPath);
          expect(fs.existsSync(desktopShortcutPath)).toBe(false);

          const app = {quit: jasmine.createSpy('quit')};
          SquirrelUpdate.handleStartupEvent(app, '--squirrel-updated');
          return waitsFor(() => app.quit.callCount === 1);
        });

        return it("does not recreate shortcut", () => expect(fs.existsSync(desktopShortcutPath)).toBe(false));
      });

      return describe("when shortcut is kept and app is updated", function() {
        beforeEach(function() {
          const app = {quit: jasmine.createSpy('quit')};
          SquirrelUpdate.handleStartupEvent(app, '--squirrel-updated');
          return waitsFor(() => app.quit.callCount === 1);
        });

        return it("still has desktop shortcut", () => expect(fs.existsSync(desktopShortcutPath)).toBe(true));
      });
    });
  });

  return describe(".restartAtom", () => it("quits the app and spawns a new one", function() {
    const app = new EventEmitter();
    app.quit = jasmine.createSpy('quit');

    SquirrelUpdate.restartAtom(app);
    expect(app.quit.callCount).toBe(1);

    expect(Spawner.spawn.callCount).toBe(0);
    app.emit('will-quit');
    expect(Spawner.spawn.callCount).toBe(1);
    return expect(path.basename(Spawner.spawn.argsForCall[0][0])).toBe('atom.cmd');
  }));
});

/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const pathWatcher = require('../lib/main');
const fs = require('fs');
const path = require('path');
const temp = require('temp');

temp.track();

describe('PathWatcher', function() {
  const tempDir = temp.mkdirSync('node-pathwatcher-directory');
  const tempFile = path.join(tempDir, 'file');

  beforeEach(() => fs.writeFileSync(tempFile, ''));

  afterEach(() => pathWatcher.closeAllWatchers());

  describe('.getWatchedPaths()', () => it('returns an array of all watched paths', function() {
    expect(pathWatcher.getWatchedPaths()).toEqual([]);
    const watcher1 = pathWatcher.watch(tempFile, function() {});
    expect(pathWatcher.getWatchedPaths()).toEqual([watcher1.handleWatcher.path]);
    const watcher2 = pathWatcher.watch(tempFile, function() {});
    expect(pathWatcher.getWatchedPaths()).toEqual([watcher1.handleWatcher.path]);
    watcher1.close();
    expect(pathWatcher.getWatchedPaths()).toEqual([watcher1.handleWatcher.path]);
    watcher2.close();
    return expect(pathWatcher.getWatchedPaths()).toEqual([]);
}));

  describe('.closeAllWatchers()', () => it('closes all watched paths', function() {
    expect(pathWatcher.getWatchedPaths()).toEqual([]);
    const watcher = pathWatcher.watch(tempFile, function() {});
    expect(pathWatcher.getWatchedPaths()).toEqual([watcher.handleWatcher.path]);
    pathWatcher.closeAllWatchers();
    return expect(pathWatcher.getWatchedPaths()).toEqual([]);
}));

  describe('when a watched path is changed', () => it('fires the callback with the event type and empty path', function() {
    let eventType = null;
    let eventPath = null;
    const watcher = pathWatcher.watch(tempFile, function(type, path) {
      eventType = type;
      return eventPath = path;
    });

    fs.writeFileSync(tempFile, 'changed');
    waitsFor(() => eventType != null);
    return runs(function() {
      expect(eventType).toBe('change');
      return expect(eventPath).toBe('');
    });
  }));

  describe('when a watched path is renamed #darwin #win32', () => it('fires the callback with the event type and new path and watches the new path', function() {
    let eventType = null;
    let eventPath = null;
    const watcher = pathWatcher.watch(tempFile, function(type, path) {
      eventType = type;
      return eventPath = path;
    });

    const tempRenamed = path.join(tempDir, 'renamed');
    fs.renameSync(tempFile, tempRenamed);
    waitsFor(() => eventType != null);
    return runs(function() {
      expect(eventType).toBe('rename');
      expect(fs.realpathSync(eventPath)).toBe(fs.realpathSync(tempRenamed));
      return expect(pathWatcher.getWatchedPaths()).toEqual([watcher.handleWatcher.path]);});
}));

  describe('when a watched path is deleted #win32 #darwin', () => it('fires the callback with the event type and null path', function() {
    let deleted = false;
    const watcher = pathWatcher.watch(tempFile, function(type, path) {
      if ((type === 'delete') && (path === null)) { return deleted = true; }
    });

    fs.unlinkSync(tempFile);
    return waitsFor(() => deleted);
  }));

  describe('when a file under watched directory is deleted', () => it('fires the callback with the change event and empty path', function(done) {
    const fileUnderDir = path.join(tempDir, 'file');
    fs.writeFileSync(fileUnderDir, '');
    const watcher = pathWatcher.watch(tempDir, function(type, path) {
      expect(type).toBe('change');
      expect(path).toBe('');
      return done();
    });
    return fs.unlinkSync(fileUnderDir);
  }));

  describe('when a new file is created under watched directory', () => it('fires the callback with the change event and empty path', function() {
    const newFile = path.join(tempDir, 'file');
    const watcher = pathWatcher.watch(tempDir, function(type, path) {
      fs.unlinkSync(newFile);

      expect(type).toBe('change');
      expect(path).toBe('');
      return done();
    });
    return fs.writeFileSync(newFile, '');
  }));

  describe('when a file under watched directory is moved', () => it('fires the callback with the change event and empty path', function(done) {
    const newName = path.join(tempDir, 'file2');
    const watcher = pathWatcher.watch(tempDir, function(type, path) {
      expect(type).toBe('change');
      expect(path).toBe('');
      return done();
    });
    return fs.renameSync(tempFile, newName);
  }));

  describe('when en exception is thrown in the closed watcher\'s callback', () => it('does not crash', function(done) {
    var watcher = pathWatcher.watch(tempFile, function(type, path) {
      watcher.close();
      try {
        throw new Error('test');
      } catch (e) {
        return done();
      }
    });
    return fs.writeFileSync(tempFile, 'changed');
  }));

  describe('when watching a file that does not exist', () => it('throws an error with a code #darwin #linux', function() {
    const doesNotExist = path.join(tempDir, 'does-not-exist');
    let watcher = null;
    try {
      watcher = pathWatcher.watch(doesNotExist, () => null);
    } catch (error) {
      expect(error.message).toBe('Unable to watch path');
      expect(error.code).toBe('ENOENT');
    }
    return expect(watcher).toBe(null);
  }));  // ensure it threw

  describe('when watching multiple files under the same directory', function() {
    it('fires the callbacks when both of the files are modifiled', function() {
      let called = 0;
      const tempFile2 = path.join(tempDir, 'file2');
      fs.writeFileSync(tempFile2, '');
      pathWatcher.watch(tempFile, (type, path) => called |= 1);
      pathWatcher.watch(tempFile2, (type, path) => called |= 2);
      fs.writeFileSync(tempFile, 'changed');
      fs.writeFileSync(tempFile2, 'changed');
      return waitsFor(() => called === 3);
    });

    return it('shares the same handle watcher between the two files on #win32', function() {
      const tempFile2 = path.join(tempDir, 'file2');
      fs.writeFileSync(tempFile2, '');
      const watcher1 = pathWatcher.watch(tempFile, function(type, path) {});
      const watcher2 = pathWatcher.watch(tempFile2, function(type, path) {});
      return expect(watcher1.handleWatcher).toBe(watcher2.handleWatcher);
    });
  });

  return describe('when a file is unwatched', () => it('it does not lock the filesystem tree', function() {
    const nested1 = path.join(tempDir, 'nested1');
    const nested2 = path.join(nested1, 'nested2');
    const nested3 = path.join(nested2, 'nested3');
    fs.mkdirSync(nested1);
    fs.mkdirSync(nested2);
    fs.writeFileSync(nested3);

    const subscription1 = pathWatcher.watch(nested1, function() {});
    const subscription2 = pathWatcher.watch(nested2, function() {});
    const subscription3 = pathWatcher.watch(nested3, function() {});

    subscription1.close();
    subscription2.close();
    subscription3.close();

    fs.unlinkSync(nested3);
    fs.rmdirSync(nested2);
    return fs.rmdirSync(nested1);
  }));
});

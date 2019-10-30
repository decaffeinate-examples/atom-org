/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const path = require('path');
const fs = require('fs-plus');
const temp = require('temp');
const File = require('../lib/file');
const PathWatcher = require('../lib/main');

describe('File', function() {
  let [filePath, file] = Array.from([]);

  beforeEach(function() {
    filePath = path.join(__dirname, 'fixtures', 'file-test.txt'); // Don't put in /tmp because /tmp symlinks to /private/tmp and screws up the rename test
    fs.removeSync(filePath);
    fs.writeFileSync(filePath, "this is old!");
    return file = new File(filePath);
  });

  afterEach(function() {
    file.unsubscribeFromNativeChangeEvents();
    fs.removeSync(filePath);
    return PathWatcher.closeAllWatchers();
  });

  it("normalizes the specified path", function() {
    expect(new File(__dirname + path.sep + 'fixtures' + path.sep + 'abc' + path.sep + '..' + path.sep + 'file-test.txt').getBaseName()).toBe('file-test.txt');
    return expect(new File(__dirname + path.sep + 'fixtures' + path.sep + 'abc' + path.sep + '..' + path.sep + 'file-test.txt').path.toLowerCase()).toBe(file.path.toLowerCase());
  });

  it('returns true from isFile()', () => expect(file.isFile()).toBe(true));

  it('returns false from isDirectory()', () => expect(file.isDirectory()).toBe(false));

  describe('::isSymbolicLink', function() {
    it('returns false for regular files', () => expect(file.isSymbolicLink()).toBe(false));

    return it('returns true for symlinked files', function() {
      const symbolicFile = new File(filePath, true);
      return expect(symbolicFile.isSymbolicLink()).toBe(true);
    });
  });

  describe("::getDigestSync", () => it("computes and returns the SHA-1 digest and caches it", function() {
    filePath = path.join(temp.mkdirSync('node-pathwatcher-directory'), 'file.txt');
    fs.writeFileSync(filePath, '');

    file = new File(filePath);
    spyOn(file, 'readSync').andCallThrough();

    expect(file.getDigestSync()).toBe('da39a3ee5e6b4b0d3255bfef95601890afd80709');
    expect(file.readSync.callCount).toBe(1);
    expect(file.getDigestSync()).toBe('da39a3ee5e6b4b0d3255bfef95601890afd80709');
    expect(file.readSync.callCount).toBe(1);

    file.writeSync('x');

    expect(file.getDigestSync()).toBe('11f6ad8ec52a2984abaafd7c3b516503785c2072');
    expect(file.readSync.callCount).toBe(1);
    expect(file.getDigestSync()).toBe('11f6ad8ec52a2984abaafd7c3b516503785c2072');
    return expect(file.readSync.callCount).toBe(1);
  }));

  describe('::create()', function() {
    let [callback, nonExistentFile, tempDir] = Array.from([]);

    beforeEach(function() {
      tempDir = temp.mkdirSync('node-pathwatcher-directory');
      return callback = jasmine.createSpy('promiseCallback');
    });

    afterEach(function() {
      nonExistentFile.unsubscribeFromNativeChangeEvents();
      return fs.removeSync(nonExistentFile.getPath());
    });

    it('creates file in directory if file does not exist', function() {
      const fileName = path.join(tempDir, 'file.txt');
      expect(fs.existsSync(fileName)).toBe(false);
      nonExistentFile = new File(fileName);

      waitsForPromise(() => nonExistentFile.create().then(callback));

      return runs(function() {
        expect(callback.argsForCall[0][0]).toBe(true);
        expect(fs.existsSync(fileName)).toBe(true);
        expect(fs.isFileSync(fileName)).toBe(true);
        return expect(fs.readFileSync(fileName).toString()).toBe('');
      });
    });

    it('leaves existing file alone if it exists', function() {
      const fileName = path.join(tempDir, 'file.txt');
      fs.writeFileSync(fileName, 'foo');
      const existingFile = new File(fileName);

      waitsForPromise(() => existingFile.create().then(callback));

      return runs(function() {
        expect(callback.argsForCall[0][0]).toBe(false);
        expect(fs.existsSync(fileName)).toBe(true);
        expect(fs.isFileSync(fileName)).toBe(true);
        return expect(fs.readFileSync(fileName).toString()).toBe('foo');
      });
    });

    return it('creates parent directories and file if they do not exist', function() {
      const fileName = path.join(tempDir, 'foo', 'bar', 'file.txt');
      expect(fs.existsSync(fileName)).toBe(false);
      nonExistentFile = new File(fileName);

      waitsForPromise(() => nonExistentFile.create().then(callback));

      return runs(function() {
        expect(callback.argsForCall[0][0]).toBe(true);
        expect(fs.existsSync(fileName)).toBe(true);
        expect(fs.isFileSync(fileName)).toBe(true);

        const parentName = path.join(tempDir, 'foo' ,'bar');
        expect(fs.existsSync(parentName)).toBe(true);
        return expect(fs.isDirectorySync(parentName)).toBe(true);
      });
    });
  });

  describe("when the file has not been read", function() {
    describe("when the contents of the file change", () => it("notifies ::onDidChange observers", function() {
      let changeHandler;
      file.onDidChange(changeHandler = jasmine.createSpy('changeHandler'));
      fs.writeFileSync(file.getPath(), "this is new!");

      return waitsFor("change event", () => changeHandler.callCount > 0);
    }));

    return describe("when the contents of the file are deleted", () => it("notifies ::onDidChange observers", function() {
      let changeHandler;
      file.onDidChange(changeHandler = jasmine.createSpy('changeHandler'));
      fs.writeFileSync(file.getPath(), "");

      return waitsFor("change event", () => changeHandler.callCount > 0);
    }));
  });

  describe("when the file has already been read #darwin", function() {
    beforeEach(() => file.readSync());

    describe("when the contents of the file change", () => it("notifies ::onDidChange observers", function() {
      let lastText = null;

      file.onDidChange(() => file.read().then(text => lastText = text));

      runs(() => fs.writeFileSync(file.getPath(), 'this is new!'));
      waitsFor('read after first change event', () => lastText === 'this is new!');
      runs(() => expect(file.readSync()).toBe('this is new!'));

      runs(() => fs.writeFileSync(file.getPath(), 'this is newer!'));
      waitsFor('read after second change event', () => lastText === 'this is newer!');
      return runs(() => expect(file.readSync()).toBe('this is newer!'));
    }));

    describe("when the file is deleted", () => it("notifies ::onDidDelete observers", function() {
      const deleteHandler = jasmine.createSpy('deleteHandler');
      file.onDidDelete(deleteHandler);
      fs.removeSync(file.getPath());

      return waitsFor("remove event", () => deleteHandler.callCount > 0);
    }));

    describe("when a file is moved (via the filesystem)", function() {
      let newPath = null;

      beforeEach(() => newPath = path.join(path.dirname(filePath), "file-was-moved-test.txt"));

      afterEach(function() {
        if (fs.existsSync(newPath)) {
          fs.removeSync(newPath);
          const deleteHandler = jasmine.createSpy('deleteHandler');
          file.onDidDelete(deleteHandler);
          return waitsFor("remove event", 30000, () => deleteHandler.callCount > 0);
        }
      });

      it("it updates its path", function() {
        const moveHandler = jasmine.createSpy('moveHandler');
        file.onDidRename(moveHandler);

        fs.moveSync(filePath, newPath);

        waitsFor("move event", 30000, () => moveHandler.callCount > 0);

        return runs(() => expect(file.getPath()).toBe(newPath));
      });

      return it("maintains ::onDidChange observers that were subscribed on the previous path", function() {
        let moveHandler = null;
        moveHandler = jasmine.createSpy('moveHandler');
        file.onDidRename(moveHandler);
        let changeHandler = null;
        changeHandler = jasmine.createSpy('changeHandler');
        file.onDidChange(changeHandler);

        fs.moveSync(filePath, newPath);

        waitsFor("move event", () => moveHandler.callCount > 0);

        runs(function() {
          expect(changeHandler).not.toHaveBeenCalled();
          return fs.writeFileSync(file.getPath(), "this is new!");
        });

        return waitsFor("change event", () => changeHandler.callCount > 0);
      });
    });

    describe("when a file is deleted and the recreated within a small amount of time (git sometimes does this)", () => it("triggers a contents change event if the contents change", function() {
      const changeHandler = jasmine.createSpy("file changed");
      const deleteHandler = jasmine.createSpy("file deleted");
      file.onDidChange(changeHandler);
      file.onDidDelete(deleteHandler);

      expect(changeHandler).not.toHaveBeenCalled();

      fs.removeSync(filePath);

      expect(changeHandler).not.toHaveBeenCalled();
      waits(20);
      runs(function() {
        fs.writeFileSync(filePath, "HE HAS RISEN!");
        return expect(changeHandler).not.toHaveBeenCalled();
      });

      waitsFor("resurrection change event", () => changeHandler.callCount === 1);

      runs(function() {
        expect(deleteHandler).not.toHaveBeenCalled();
        fs.writeFileSync(filePath, "Hallelujah!");
        return changeHandler.reset();
      });

      return waitsFor("post-resurrection change event", () => changeHandler.callCount > 0);
    }));

    describe("when a file is moved to the trash", function() {
      const osxTrashDir = process.env.HOME + "/.Trash";
      const osxTrashPath = path.join(osxTrashDir, "file-was-moved-to-trash.txt");
      return it("triggers a delete event", function() {
        let deleteHandler = null;
        deleteHandler = jasmine.createSpy("deleteHandler");
        file.onDidDelete(deleteHandler);

        fs.moveSync(filePath, osxTrashPath);

        waitsFor("remove event", () => deleteHandler.callCount > 0);

        // Clean up
        if (fs.existsSync(osxTrashPath)) {
          return fs.removeSync(osxTrashPath);
        }
      });
    });

    return describe("when a file cannot be opened after the watch has been applied", function() {
      let errorSpy = null;
      beforeEach(function() {
        errorSpy = jasmine.createSpy();
        errorSpy.andCallFake(({error, handle}) => handle());
        return file.onWillThrowWatchError(errorSpy);
      });

      describe("when the error happens in the promise callback chain", function() {
        beforeEach(() => spyOn(file, 'setDigest').andCallFake(function() {
          const error = new Error('ENOENT open "FUUU"');
          error.code = 'ENOENT';
          throw error;
        }));

        return it("emits an event with the error", function() {
          const changeHandler = jasmine.createSpy('changeHandler');
          file.onDidChange(changeHandler);
          fs.writeFileSync(file.getPath(), "this is new!!");

          waitsFor("change event", () => errorSpy.callCount > 0);

          return runs(function() {
            const args = errorSpy.mostRecentCall.args[0];
            expect(args.error.code).toBe('ENOENT');
            expect(args.error.eventType).toBe('change');
            return expect(args.handle).toBeTruthy();
          });
        });
      });

      return describe("when the error happens in the read method", function() {
        beforeEach(() => spyOn(file, 'read').andCallFake(function() {
          const error = new Error('ENOENT open "FUUU"');
          error.code = 'ENOENT';
          throw error;
        }));

        return it("emits an event with the error", function() {
          const changeHandler = jasmine.createSpy('changeHandler');
          file.onDidChange(changeHandler);
          fs.writeFileSync(file.getPath(), "this is new!!");

          waitsFor("change event", () => errorSpy.callCount > 0);

          return runs(function() {
            const args = errorSpy.mostRecentCall.args[0];
            expect(args.error.code).toBe('ENOENT');
            expect(args.error.eventType).toBe('change');
            return expect(args.handle).toBeTruthy();
          });
        });
      });
    });
  });

  describe("getRealPathSync()", function() {
    let tempDir = null;

    beforeEach(function() {
      tempDir = temp.mkdirSync('node-pathwatcher-directory');
      fs.writeFileSync(path.join(tempDir, 'file'), '');
      return fs.writeFileSync(path.join(tempDir, 'file2'), '');
    });

    it("returns the resolved path to the file", function() {
      const tempFile = new File(path.join(tempDir, 'file'));
      expect(tempFile.getRealPathSync()).toBe(fs.realpathSync(path.join(tempDir, 'file')));
      tempFile.setPath(path.join(tempDir, 'file2'));
      return expect(tempFile.getRealPathSync()).toBe(fs.realpathSync(path.join(tempDir, 'file2')));
    });

    return describe("on #darwin and #linux", () => it("returns the target path for symlinks", function() {
      fs.symlinkSync(path.join(tempDir, 'file2'), path.join(tempDir, 'file3'));
      const tempFile = new File(path.join(tempDir, 'file3'));
      return expect(tempFile.getRealPathSync()).toBe(fs.realpathSync(path.join(tempDir, 'file2')));
    }));
  });

  describe("exists()", function() {
    let tempDir = null;

    beforeEach(function() {
      tempDir = temp.mkdirSync('node-pathwatcher-directory');
      return fs.writeFileSync(path.join(tempDir, 'file'), '');
    });

    it("does actually exist", function() {
      const existingFile = new File(path.join(tempDir, 'file'));
      const existsHandler = jasmine.createSpy('exists handler');
      existingFile.exists().then(existsHandler);
      waitsFor('exists handler', () => existsHandler.callCount > 0);
      return runs(() => expect(existsHandler.argsForCall[0][0]).toBe(true));
    });

    return it("doesn't exist", function() {
      const nonExistingFile = new File(path.join(tempDir, 'not_file'));
      const existsHandler = jasmine.createSpy('exists handler');
      nonExistingFile.exists().then(existsHandler);
      waitsFor('exists handler', () => existsHandler.callCount > 0);
      return runs(() => expect(existsHandler.argsForCall[0][0]).toBe(false));
    });
  });

  describe("getRealPath()", function() {
    let tempDir = null;

    beforeEach(function() {
      tempDir = temp.mkdirSync('node-pathwatcher-directory');
      fs.writeFileSync(path.join(tempDir, 'file'), '');
      return fs.writeFileSync(path.join(tempDir, 'file2'), '');
    });

    it("returns the resolved path to the file", function() {
      const tempFile = new File(path.join(tempDir, 'file'));
      const realpathHandler = jasmine.createSpy('realpath handler');
      tempFile.getRealPath().then(realpathHandler);
      waitsFor('realpath handler', () => realpathHandler.callCount > 0);
      return runs(() => expect(realpathHandler.argsForCall[0][0]).toBe(fs.realpathSync(path.join(tempDir, 'file'))));
    });

    it("returns the resolved path to the file after setPath", function() {
      const tempFile = new File(path.join(tempDir, 'file'));
      tempFile.setPath(path.join(tempDir, 'file2'));
      const realpathHandler = jasmine.createSpy('realpath handler');
      tempFile.getRealPath().then(realpathHandler);
      waitsFor('realpath handler', () => realpathHandler.callCount > 0);
      return runs(() => expect(realpathHandler.argsForCall[0][0]).toBe(fs.realpathSync(path.join(tempDir, 'file2'))));
    });

    return describe("on #darwin and #linux", () => it("returns the target path for symlinks", function() {
      fs.symlinkSync(path.join(tempDir, 'file2'), path.join(tempDir, 'file3'));
      const tempFile = new File(path.join(tempDir, 'file3'));
      const realpathHandler = jasmine.createSpy('realpath handler');
      tempFile.getRealPath().then(realpathHandler);
      waitsFor('realpath handler', () => realpathHandler.callCount > 0);
      return runs(() => expect(realpathHandler.argsForCall[0][0]).toBe(fs.realpathSync(path.join(tempDir, 'file2'))));
    }));
  });

  describe("getParent()", () => it("gets the parent Directory", function() {
    const d = file.getParent();
    const expected = path.join(__dirname, 'fixtures');
    return expect(d.getRealPathSync()).toBe(expected);
  }));

  describe('encoding', function() {
    it("should be 'utf8' by default", () => expect(file.getEncoding()).toBe('utf8'));

    it("should be settable", function() {
      file.setEncoding('cp1252');
      return expect(file.getEncoding()).toBe('cp1252');
    });

    return it("throws an exception when assigning an invalid encoding", () => expect(() => file.setEncoding('utf-8-bom')).toThrow());
  });

  describe('createReadStream()', function() {
    it('returns a stream to read the file', function() {
      const stream = file.createReadStream();
      let ended = false;
      const content = [];

      stream.on('data', chunk => content.push(chunk));
      stream.on('end', () => ended = true);

      waitsFor('stream ended', () => ended);

      return runs(() => expect(content.join('')).toEqual('this is old!'));
    });

    return it('honors the specified encoding', function() {
      const unicodeText = 'ё';
      const unicodeBytes = Buffer.from('\x51\x04'); // 'ё'

      fs.writeFileSync(file.getPath(), unicodeBytes);

      file.setEncoding('utf16le');

      const stream = file.createReadStream();
      let ended = false;
      const content = [];

      stream.on('data', chunk => content.push(chunk));
      stream.on('end', () => ended = true);

      waitsFor('stream ended', () => ended);

      return runs(() => expect(content.join('')).toEqual(unicodeText));
    });
  });

  describe('createWriteStream()', () => it('returns a stream to read the file', function() {
    const unicodeText = 'ё';
    const unicodeBytes = Buffer.from('\x51\x04'); // 'ё'

    file.setEncoding('utf16le');
    const stream = file.createWriteStream();
    let ended = false;

    stream.on('finish', () => ended = true);

    stream.end(unicodeText);

    waitsFor('stream finished', () => ended);

    return runs(function() {
      expect(fs.statSync(file.getPath()).size).toBe(2);
      const content = fs.readFileSync(file.getPath()).toString('ascii');
      return expect(content).toBe(unicodeBytes.toString('ascii'));
    });
  }));

  describe('encoding support', function() {
    let [unicodeText, unicodeBytes] = Array.from([]);

    beforeEach(function() {
      unicodeText = 'ё';
      return unicodeBytes = Buffer.from('\x51\x04');
    }); // 'ё'

    it('should read a file in UTF-16', function() {
      fs.writeFileSync(file.getPath(), unicodeBytes);
      file.setEncoding('utf16le');

      const readHandler = jasmine.createSpy('read handler');
      file.read().then(readHandler);

      waitsFor('read handler', () => readHandler.callCount > 0);

      return runs(() => expect(readHandler.argsForCall[0][0]).toBe(unicodeText));
    });

    it('should readSync a file in UTF-16', function() {
      fs.writeFileSync(file.getPath(), unicodeBytes);
      file.setEncoding('utf16le');
      return expect(file.readSync()).toBe(unicodeText);
    });

    it('should write a file in UTF-16', function() {
      file.setEncoding('utf16le');
      const writeHandler = jasmine.createSpy('write handler');
      file.write(unicodeText).then(writeHandler);
      waitsFor('write handler', () => writeHandler.callCount > 0);
      return runs(function() {
        expect(fs.statSync(file.getPath()).size).toBe(2);
        const content = fs.readFileSync(file.getPath()).toString('ascii');
        return expect(content).toBe(unicodeBytes.toString('ascii'));
      });
    });

    return it('should write a file in UTF-16 synchronously', function() {
      file.setEncoding('utf16le');
      file.writeSync(unicodeText);
      expect(fs.statSync(file.getPath()).size).toBe(2);
      const content = fs.readFileSync(file.getPath()).toString('ascii');
      return expect(content).toBe(unicodeBytes.toString('ascii'));
    });
  });

  return describe('reading a non-existing file', () => it('should return null', function() {
    file = new File('not_existing.txt');
    const readHandler = jasmine.createSpy('read handler');
    file.read().then(readHandler);
    waitsFor('read handler', () => readHandler.callCount > 0);
    return runs(() => expect(readHandler.argsForCall[0][0]).toBe(null));
  }));
});

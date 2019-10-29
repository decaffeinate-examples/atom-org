/** @babel */
/* eslint-disable
    no-return-assign,
    no-undef,
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
const path = require('path')
const fs = require('fs-plus')
const temp = require('temp')
const Directory = require('../lib/directory')
const PathWatcher = require('../lib/main')

describe('Directory', function () {
  let directory = null

  beforeEach(() => directory = new Directory(path.join(__dirname, 'fixtures')))

  afterEach(() => PathWatcher.closeAllWatchers())

  it('normalizes the specified path', function () {
    expect(new Directory(directory.path + path.sep + 'abc' + path.sep + '..').getBaseName()).toBe('fixtures')
    expect(new Directory(directory.path + path.sep + 'abc' + path.sep + '..').path.toLowerCase()).toBe(directory.path.toLowerCase())

    expect(new Directory(directory.path + path.sep).getBaseName()).toBe('fixtures')
    expect(new Directory(directory.path + path.sep).path.toLowerCase()).toBe(directory.path.toLowerCase())

    expect(new Directory(directory.path + path.sep + path.sep).getBaseName()).toBe('fixtures')
    expect(new Directory(directory.path + path.sep + path.sep).path.toLowerCase()).toBe(directory.path.toLowerCase())

    expect(new Directory(path.sep).getBaseName()).toBe('')
    return expect(new Directory(path.sep).path).toBe(path.sep)
  })

  it('returns false from isFile()', () => expect(directory.isFile()).toBe(false))

  it('returns true from isDirectory()', () => expect(directory.isDirectory()).toBe(true))

  describe('::isSymbolicLink()', function () {
    it('returns false for regular directories', () => expect(directory.isSymbolicLink()).toBe(false))

    return it('returns true for symlinked directories', function () {
      const symbolicDirectory = new Directory(path.join(__dirname, 'fixtures'), true)
      return expect(symbolicDirectory.isSymbolicLink()).toBe(true)
    })
  })

  describe('::exists()', function () {
    let [callback, tempDir] = Array.from([])

    beforeEach(function () {
      tempDir = temp.mkdirSync('node-pathwatcher-directory')
      return callback = jasmine.createSpy('promiseCallback')
    })

    it('returns a Promise that resolves to true for an existing directory', function () {
      directory = new Directory(tempDir)

      waitsForPromise(() => directory.exists().then(callback))

      return runs(() => expect(callback.argsForCall[0][0]).toBe(true))
    })

    return it('returns a Promise that resolves to false for a non-existent directory', function () {
      directory = new Directory(path.join(tempDir, 'foo'))

      waitsForPromise(() => directory.exists().then(callback))

      return runs(() => expect(callback.argsForCall[0][0]).toBe(false))
    })
  })

  describe('::existsSync()', function () {
    let [tempDir] = Array.from([])

    beforeEach(() => tempDir = temp.mkdirSync('node-pathwatcher-directory'))

    it('returns true for an existing directory', function () {
      directory = new Directory(tempDir)
      return expect(directory.existsSync()).toBe(true)
    })

    return it('returns false for a non-existent directory', function () {
      directory = new Directory(path.join(tempDir, 'foo'))
      return expect(directory.existsSync()).toBe(false)
    })
  })

  describe('::create()', function () {
    let [callback, tempDir] = Array.from([])

    beforeEach(function () {
      tempDir = temp.mkdirSync('node-pathwatcher-directory')
      return callback = jasmine.createSpy('promiseCallback')
    })

    it('creates directory if directory does not exist', function () {
      const directoryName = path.join(tempDir, 'subdir')
      expect(fs.existsSync(directoryName)).toBe(false)
      const nonExistentDirectory = new Directory(directoryName)

      waitsForPromise(() => nonExistentDirectory.create(0o0600).then(callback))

      return runs(function () {
        expect(callback.argsForCall[0][0]).toBe(true)
        expect(fs.existsSync(directoryName)).toBe(true)
        expect(fs.isDirectorySync(directoryName)).toBe(true)

        if (process.platform === 'win32') { return } // No mode on Windows

        const rawMode = fs.statSync(directoryName).mode
        const mode = rawMode & 0o07777
        return expect(mode.toString(8)).toBe(((0o0600)).toString(8))
      })
    })

    it('leaves existing directory alone if it exists', function () {
      const directoryName = path.join(tempDir, 'subdir')
      fs.mkdirSync(directoryName)
      const existingDirectory = new Directory(directoryName)

      waitsForPromise(() => existingDirectory.create().then(callback))

      return runs(function () {
        expect(callback.argsForCall[0][0]).toBe(false)
        expect(fs.existsSync(directoryName)).toBe(true)
        return expect(fs.isDirectorySync(directoryName)).toBe(true)
      })
    })

    it('creates parent directories if they do not exist', function () {
      const directoryName = path.join(tempDir, 'foo', 'bar', 'baz')
      expect(fs.existsSync(directoryName)).toBe(false)
      const nonExistentDirectory = new Directory(directoryName)

      waitsForPromise(() => nonExistentDirectory.create().then(callback))

      return runs(function () {
        expect(callback.argsForCall[0][0]).toBe(true)

        expect(fs.existsSync(directoryName)).toBe(true)
        expect(fs.isDirectorySync(directoryName)).toBe(true)

        const parentName = path.join(tempDir, 'foo', 'bar')
        expect(fs.existsSync(parentName)).toBe(true)
        return expect(fs.isDirectorySync(parentName)).toBe(true)
      })
    })

    return it('throws an error when called on a root directory that does not exist', function () {
      spyOn(Directory.prototype, 'isRoot').andReturn(true)
      directory = new Directory(path.join(tempDir, 'subdir'))

      waitsForPromise({ shouldReject: true }, () => directory.create())

      return runs(() => expect(fs.existsSync(path.join(tempDir, 'subdir'))).toBe(false))
    })
  })

  describe('when the contents of the directory change on disk', function () {
    let temporaryFilePath = null

    beforeEach(function () {
      temporaryFilePath = path.join(__dirname, 'fixtures', 'temporary')
      return fs.removeSync(temporaryFilePath)
    })

    afterEach(() => fs.removeSync(temporaryFilePath))

    return it('notifies ::onDidChange observers', function () {
      let changeHandler = null

      runs(function () {
        directory.onDidChange(changeHandler = jasmine.createSpy('changeHandler'))
        return fs.writeFileSync(temporaryFilePath, '')
      })

      waitsFor('first change', () => changeHandler.callCount > 0)

      runs(function () {
        changeHandler.reset()
        return fs.removeSync(temporaryFilePath)
      })

      return waitsFor('second change', () => changeHandler.callCount > 0)
    })
  })

  describe('when the directory unsubscribes from events', function () {
    let temporaryFilePath = null

    beforeEach(function () {
      temporaryFilePath = path.join(directory.path, 'temporary')
      if (fs.existsSync(temporaryFilePath)) { return fs.removeSync(temporaryFilePath) }
    })

    afterEach(function () {
      if (fs.existsSync(temporaryFilePath)) { return fs.removeSync(temporaryFilePath) }
    })

    return it('no longer triggers events', function () {
      let [subscription, changeHandler] = Array.from([])

      runs(function () {
        subscription = directory.onDidChange(changeHandler = jasmine.createSpy('changeHandler'))
        return fs.writeFileSync(temporaryFilePath, '')
      })

      waitsFor('change event', () => changeHandler.callCount > 0)

      runs(function () {
        changeHandler.reset()
        return subscription.dispose()
      })
      waits(20)

      runs(() => fs.removeSync(temporaryFilePath))
      waits(20)
      return runs(() => expect(changeHandler.callCount).toBe(0))
    })
  })

  describe('on #darwin or #linux', () => it('includes symlink information about entries', function () {
    let entry, name
    let entries = directory.getEntriesSync()
    for (entry of Array.from(entries)) {
      name = entry.getBaseName()
      if ((name === 'symlink-to-dir') || (name === 'symlink-to-file')) {
        expect(entry.symlink).toBeTruthy()
      } else {
        expect(entry.symlink).toBeFalsy()
      }
    }

    const callback = jasmine.createSpy('getEntries')
    directory.getEntries(callback)

    waitsFor(() => callback.callCount === 1)

    return runs(function () {
      entries = callback.mostRecentCall.args[1]
      return (() => {
        const result = []
        for (entry of Array.from(entries)) {
          name = entry.getBaseName()
          if ((name === 'symlink-to-dir') || (name === 'symlink-to-file')) {
            result.push(expect(entry.isSymbolicLink()).toBe(true))
          } else {
            result.push(expect(entry.isSymbolicLink()).toBe(false))
          }
        }
        return result
      })()
    })
  }))

  describe('.relativize(path)', function () {
    describe('on #darwin or #linux', function () {
      it("returns a relative path based on the directory's path", function () {
        const absolutePath = directory.getPath()
        expect(directory.relativize(absolutePath)).toBe('')
        expect(directory.relativize(path.join(absolutePath, 'b'))).toBe('b')
        expect(directory.relativize(path.join(absolutePath, 'b/file.coffee'))).toBe('b/file.coffee')
        return expect(directory.relativize(path.join(absolutePath, 'file.coffee'))).toBe('file.coffee')
      })

      it("returns a relative path based on the directory's symlinked source path", function () {
        const symlinkPath = path.join(__dirname, 'fixtures', 'symlink-to-dir')
        const symlinkDirectory = new Directory(symlinkPath)
        const realFilePath = require.resolve('./fixtures/dir/a')
        expect(symlinkDirectory.relativize(symlinkPath)).toBe('')
        return expect(symlinkDirectory.relativize(realFilePath)).toBe('a')
      })

      it("returns the full path if the directory's path is not a prefix of the path", () => expect(directory.relativize('/not/relative')).toBe('/not/relative'))

      return it('handled case insensitive filesystems', function () {
        spyOn(fs, 'isCaseInsensitive').andReturn(true)
        const directoryPath = temp.mkdirSync('Mixed-case-directory-')
        directory = new Directory(directoryPath)

        expect(directory.relativize(directoryPath.toUpperCase())).toBe('')
        expect(directory.relativize(path.join(directoryPath.toUpperCase(), 'b'))).toBe('b')
        expect(directory.relativize(path.join(directoryPath.toUpperCase(), 'B'))).toBe('B')
        expect(directory.relativize(path.join(directoryPath.toUpperCase(), 'b/file.coffee'))).toBe('b/file.coffee')
        expect(directory.relativize(path.join(directoryPath.toUpperCase(), 'file.coffee'))).toBe('file.coffee')

        expect(directory.relativize(directoryPath.toLowerCase())).toBe('')
        expect(directory.relativize(path.join(directoryPath.toLowerCase(), 'b'))).toBe('b')
        expect(directory.relativize(path.join(directoryPath.toLowerCase(), 'B'))).toBe('B')
        expect(directory.relativize(path.join(directoryPath.toLowerCase(), 'b/file.coffee'))).toBe('b/file.coffee')
        expect(directory.relativize(path.join(directoryPath.toLowerCase(), 'file.coffee'))).toBe('file.coffee')

        expect(directory.relativize(directoryPath)).toBe('')
        expect(directory.relativize(path.join(directoryPath, 'b'))).toBe('b')
        expect(directory.relativize(path.join(directoryPath, 'B'))).toBe('B')
        expect(directory.relativize(path.join(directoryPath, 'b/file.coffee'))).toBe('b/file.coffee')
        return expect(directory.relativize(path.join(directoryPath, 'file.coffee'))).toBe('file.coffee')
      })
    })

    return describe('on #win32', function () {
      it("returns a relative path based on the directory's path", function () {
        const absolutePath = directory.getPath()
        expect(directory.relativize(absolutePath)).toBe('')
        expect(directory.relativize(path.join(absolutePath, 'b'))).toBe('b')
        expect(directory.relativize(path.join(absolutePath, 'b/file.coffee'))).toBe('b\\file.coffee')
        return expect(directory.relativize(path.join(absolutePath, 'file.coffee'))).toBe('file.coffee')
      })

      return it("returns the full path if the directory's path is not a prefix of the path", () => expect(directory.relativize('/not/relative')).toBe('\\not\\relative'))
    })
  })

  describe('.resolve(uri)', function () {
    describe('when passed an absolute or relative path', () => it("returns an absolute path based on the directory's path", function () {
      const absolutePath = require.resolve('./fixtures/dir/a')
      expect(directory.resolve('dir/a')).toBe(absolutePath)
      expect(directory.resolve(absolutePath + '/../a')).toBe(absolutePath)
      expect(directory.resolve('dir/a/../a')).toBe(absolutePath)
      return expect(directory.resolve()).toBeUndefined()
    }))

    return describe('when passed a uri with a scheme', () => it('does not modify uris that begin with a scheme', () => expect(directory.resolve('http://zombo.com')).toBe('http://zombo.com')))
  })

  return describe('.contains(path)', function () {
    it("returns true if the path is a child of the directory's path", function () {
      const absolutePath = directory.getPath()
      expect(directory.contains(path.join(absolutePath))).toBe(false)
      expect(directory.contains(path.join(absolutePath, 'b'))).toBe(true)
      expect(directory.contains(path.join(absolutePath, 'b', 'file.coffee'))).toBe(true)
      return expect(directory.contains(path.join(absolutePath, 'file.coffee'))).toBe(true)
    })

    it("returns false if the directory's path is not a prefix of the path", () => expect(directory.contains('/not/relative')).toBe(false))

    it('handles case insensitive filesystems', function () {
      spyOn(fs, 'isCaseInsensitive').andReturn(true)
      const directoryPath = temp.mkdirSync('Mixed-case-directory-')
      directory = new Directory(directoryPath)

      expect(directory.contains(directoryPath.toUpperCase())).toBe(false)
      expect(directory.contains(path.join(directoryPath.toUpperCase(), 'b'))).toBe(true)
      expect(directory.contains(path.join(directoryPath.toUpperCase(), 'B'))).toBe(true)
      expect(directory.contains(path.join(directoryPath.toUpperCase(), 'b', 'file.coffee'))).toBe(true)
      expect(directory.contains(path.join(directoryPath.toUpperCase(), 'file.coffee'))).toBe(true)

      expect(directory.contains(directoryPath.toLowerCase())).toBe(false)
      expect(directory.contains(path.join(directoryPath.toLowerCase(), 'b'))).toBe(true)
      expect(directory.contains(path.join(directoryPath.toLowerCase(), 'B'))).toBe(true)
      expect(directory.contains(path.join(directoryPath.toLowerCase(), 'b', 'file.coffee'))).toBe(true)
      expect(directory.contains(path.join(directoryPath.toLowerCase(), 'file.coffee'))).toBe(true)

      expect(directory.contains(directoryPath)).toBe(false)
      expect(directory.contains(path.join(directoryPath, 'b'))).toBe(true)
      expect(directory.contains(path.join(directoryPath, 'B'))).toBe(true)
      expect(directory.contains(path.join(directoryPath, 'b', 'file.coffee'))).toBe(true)
      return expect(directory.contains(path.join(directoryPath, 'file.coffee'))).toBe(true)
    })

    describe('on #darwin or #linux', () => it("returns true if the path is a child of the directory's symlinked source path", function () {
      const symlinkPath = path.join(__dirname, 'fixtures', 'symlink-to-dir')
      const symlinkDirectory = new Directory(symlinkPath)
      const realFilePath = require.resolve('./fixtures/dir/a')
      return expect(symlinkDirectory.contains(realFilePath)).toBe(true)
    }))

    return describe('traversal', function () {
      beforeEach(() => directory = new Directory(path.join(__dirname, 'fixtures', 'dir')))

      const fixturePath = (...parts) => path.join(__dirname, 'fixtures', ...Array.from(parts))

      describe('getFile(filename)', function () {
        it('returns a File within this directory', function () {
          const f = directory.getFile('a')
          expect(f.isFile()).toBe(true)
          return expect(f.getRealPathSync()).toBe(fixturePath('dir', 'a'))
        })

        it('can descend more than one directory at a time', function () {
          const f = directory.getFile('subdir', 'b')
          expect(f.isFile()).toBe(true)
          return expect(f.getRealPathSync()).toBe(fixturePath('dir', 'subdir', 'b'))
        })

        return it("doesn't have to actually exist", function () {
          const f = directory.getFile('the-silver-bullet')
          expect(f.isFile()).toBe(true)
          return expect(f.existsSync()).toBe(false)
        })
      })

      describe('getSubdir(dirname)', function () {
        it('returns a subdirectory within this directory', function () {
          const d = directory.getSubdirectory('subdir')
          expect(d.isDirectory()).toBe(true)
          return expect(d.getRealPathSync()).toBe(fixturePath('dir', 'subdir'))
        })

        it('can descend more than one directory at a time', function () {
          const d = directory.getSubdirectory('subdir', 'subsubdir')
          expect(d.isDirectory()).toBe(true)
          return expect(d.getRealPathSync()).toBe(fixturePath('dir', 'subdir', 'subsubdir'))
        })

        return it("doesn't have to exist", function () {
          const d = directory.getSubdirectory('why-would-you-call-a-directory-this-come-on-now')
          return expect(d.isDirectory()).toBe(true)
        })
      })

      describe('getParent()', () => it('returns the parent Directory', function () {
        const d = directory.getParent()
        expect(d.isDirectory()).toBe(true)
        return expect(d.getRealPathSync()).toBe(fixturePath())
      }))

      return describe('isRoot()', function () {
        it("returns false if the Directory isn't the root", () => expect(directory.isRoot()).toBe(false))

        return it('returns true if the Directory is the root', function () {
          let [current, previous] = Array.from([directory, null])
          while (current.getPath() !== (previous != null ? previous.getPath() : undefined)) {
            previous = current
            current = current.getParent()
          }

          return expect(current.isRoot()).toBe(true)
        })
      })
    })
  })
})

/** @babel */
/* eslint-disable
    handle-callback-err,
    no-return-assign,
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const archive = require('../lib/ls-archive')
const path = require('path')

describe('gzipped tar files', function () {
  let fixturesRoot = null

  beforeEach(() => fixturesRoot = path.join(__dirname, 'fixtures'))

  describe('.list()', function () {
    describe('when the archive file exists', function () {
      it('returns files in the gzipped tar archive', function () {
        let gzipPaths = null
        const callback = (error, paths) => gzipPaths = paths
        archive.list(path.join(fixturesRoot, 'one-file.tar.gz'), callback)
        waitsFor(() => gzipPaths != null)
        return runs(function () {
          expect(gzipPaths.length).toBe(1)
          expect(gzipPaths[0].path).toBe('file.txt')
          expect(gzipPaths[0].isDirectory()).toBe(false)
          expect(gzipPaths[0].isFile()).toBe(true)
          return expect(gzipPaths[0].isSymbolicLink()).toBe(false)
        })
      })

      it('returns files in the gzipped tar archive', function () {
        let gzipPaths = null
        const callback = (error, paths) => gzipPaths = paths
        archive.list(path.join(fixturesRoot, 'one-file.tgz'), callback)
        waitsFor(() => gzipPaths != null)
        return runs(function () {
          expect(gzipPaths.length).toBe(1)
          expect(gzipPaths[0].path).toBe('file.txt')
          expect(gzipPaths[0].isDirectory()).toBe(false)
          expect(gzipPaths[0].isFile()).toBe(true)
          return expect(gzipPaths[0].isSymbolicLink()).toBe(false)
        })
      })

      it('returns folders in the gzipped tar archive', function () {
        let gzipPaths = null
        const callback = (error, paths) => gzipPaths = paths
        archive.list(path.join(fixturesRoot, 'one-folder.tar.gz'), callback)
        waitsFor(() => gzipPaths != null)
        return runs(function () {
          expect(gzipPaths.length).toBe(1)
          expect(gzipPaths[0].path).toBe('folder')
          expect(gzipPaths[0].isDirectory()).toBe(true)
          expect(gzipPaths[0].isFile()).toBe(false)
          return expect(gzipPaths[0].isSymbolicLink()).toBe(false)
        })
      })

      return it('returns folders in the gzipped tar archive', function () {
        let gzipPaths = null
        const callback = (error, paths) => gzipPaths = paths
        archive.list(path.join(fixturesRoot, 'one-folder.tgz'), callback)
        waitsFor(() => gzipPaths != null)
        return runs(function () {
          expect(gzipPaths.length).toBe(1)
          expect(gzipPaths[0].path).toBe('folder')
          expect(gzipPaths[0].isDirectory()).toBe(true)
          expect(gzipPaths[0].isFile()).toBe(false)
          return expect(gzipPaths[0].isSymbolicLink()).toBe(false)
        })
      })
    })

    describe('when the archive path does not exist', () => it('calls back with an error', function () {
      const archivePath = path.join(fixturesRoot, 'not-a-file.tar.gz')
      let pathError = null
      const callback = error => pathError = error
      archive.list(archivePath, callback)
      waitsFor(() => pathError != null)
      return runs(() => expect(pathError.message.length).toBeGreaterThan(0))
    }))

    describe("when the archive path isn't a valid gzipped tar file", () => it('calls back with an error', function () {
      const archivePath = path.join(fixturesRoot, 'invalid.tar.gz')
      let pathError = null
      const callback = error => pathError = error
      archive.list(archivePath, callback)
      waitsFor(() => pathError != null)
      return runs(() => expect(pathError.message.length).toBeGreaterThan(0))
    }))

    return describe("when the second to last extension isn't .tar", () => it('calls back with an error', function () {
      const archivePath = path.join(fixturesRoot, 'invalid.txt.gz')
      let pathError = null
      const callback = (error, contents) => pathError = error
      archive.list(archivePath, callback)
      waitsFor(() => pathError != null)
      return runs(() => expect(pathError.message.length).toBeGreaterThan(0))
    }))
  })

  describe('.readFile()', function () {
    describe('when the path exists in the archive', function () {
      it('calls back with the contents of the given path', function () {
        const archivePath = path.join(fixturesRoot, 'one-file.tar.gz')
        let pathContents = null
        const callback = (error, contents) => pathContents = contents
        archive.readFile(archivePath, 'file.txt', callback)
        waitsFor(() => pathContents != null)
        return runs(() => expect(pathContents.toString()).toBe('hello\n'))
      })

      return it('calls back with the contents of the given path', function () {
        const archivePath = path.join(fixturesRoot, 'one-file.tgz')
        let pathContents = null
        const callback = (error, contents) => pathContents = contents
        archive.readFile(archivePath, 'file.txt', callback)
        waitsFor(() => pathContents != null)
        return runs(() => expect(pathContents.toString()).toBe('hello\n'))
      })
    })

    describe('when the path does not exist in the archive', () => it('calls back with an error', function () {
      const archivePath = path.join(fixturesRoot, 'one-file.tar.gz')
      let pathError = null
      const callback = (error, contents) => pathError = error
      archive.readFile(archivePath, 'not-a-file.txt', callback)
      waitsFor(() => pathError != null)
      return runs(() => expect(pathError.message.length).toBeGreaterThan(0))
    }))

    describe('when the archive path does not exist', () => it('calls back with an error', function () {
      const archivePath = path.join(fixturesRoot, 'not-a-file.tar.gz')
      let pathError = null
      const callback = (error, contents) => pathError = error
      archive.readFile(archivePath, 'not-a-file.txt', callback)
      waitsFor(() => pathError != null)
      return runs(() => expect(pathError.message.length).toBeGreaterThan(0))
    }))

    describe("when the archive path isn't a valid gzipped tar file", () => it('calls back with an error', function () {
      const archivePath = path.join(fixturesRoot, 'invalid.tar.gz')
      let pathError = null
      const callback = (error, contents) => pathError = error
      archive.readFile(archivePath, 'invalid.txt', callback)
      waitsFor(() => pathError != null)
      return runs(() => expect(pathError.message.length).toBeGreaterThan(0))
    }))

    return describe("when the second to last extension isn't .tar", () => it('calls back with an error', function () {
      const archivePath = path.join(fixturesRoot, 'invalid.txt.gz')
      let pathError = null
      const callback = (error, contents) => pathError = error
      archive.readFile(archivePath, 'invalid.txt', callback)
      waitsFor(() => pathError != null)
      return runs(() => expect(pathError.message.length).toBeGreaterThan(0))
    }))
  })

  return describe('.readGzip()', function () {
    it('calls back with the string contents of the archive', function () {
      const archivePath = path.join(fixturesRoot, 'file.txt.gz')
      let archiveContents = null
      const callback = (error, contents) => archiveContents = contents
      archive.readGzip(archivePath, callback)
      waitsFor(() => archiveContents != null)
      return runs(() => expect(archiveContents.toString()).toBe('hello\n'))
    })

    describe("when the archive path isn't a valid gzipped tar file", () => it('calls back with an error', function () {
      const archivePath = path.join(fixturesRoot, 'invalid.tar.gz')
      let readError = null
      const callback = (error, contents) => readError = error
      archive.readGzip(archivePath, callback)
      waitsFor(() => readError != null)
      return runs(() => expect(readError.message.length).toBeGreaterThan(0))
    }))

    return describe('when the archive path does not exist', () => it('calls back with an error', function () {
      const archivePath = path.join(fixturesRoot, 'not-a-file.tar.gz')
      let readError = null
      const callback = (error, contents) => readError = error
      archive.readGzip(archivePath, callback)
      waitsFor(() => readError != null)
      return runs(() => expect(readError.message.length).toBeGreaterThan(0))
    }))
  })
})

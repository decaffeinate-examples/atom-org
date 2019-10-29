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

describe('zip files', function () {
  let fixturesRoot = null

  beforeEach(() => fixturesRoot = path.join(__dirname, 'fixtures'))

  describe('.list()', function () {
    describe('when the archive file exists', function () {
      it('returns files in the zip archive', function () {
        let zipPaths = null
        const callback = (error, paths) => zipPaths = paths
        archive.list(path.join(fixturesRoot, 'one-file.zip'), callback)
        waitsFor(() => zipPaths != null)
        return runs(function () {
          expect(zipPaths.length).toBe(1)
          expect(zipPaths[0].path).toBe('file.txt')
          expect(zipPaths[0].isDirectory()).toBe(false)
          expect(zipPaths[0].isFile()).toBe(true)
          return expect(zipPaths[0].isSymbolicLink()).toBe(false)
        })
      })

      it('returns folders in the zip archive', function () {
        let zipPaths = null
        const callback = (error, paths) => zipPaths = paths
        archive.list(path.join(fixturesRoot, 'one-folder.zip'), callback)
        waitsFor(() => zipPaths != null)
        return runs(function () {
          expect(zipPaths.length).toBe(1)
          expect(zipPaths[0].path).toBe('folder')
          expect(zipPaths[0].isDirectory()).toBe(true)
          expect(zipPaths[0].isFile()).toBe(false)
          return expect(zipPaths[0].isSymbolicLink()).toBe(false)
        })
      })

      return describe('when the tree option is set to true', () => it('returns archive entries nested under their parent directory', function () {
        let tree = null
        archive.list(path.join(__dirname, 'fixtures', 'nested.zip'), { tree: true }, (error, files) => tree = files)
        waitsFor(() => tree != null)
        return runs(function () {
          expect(tree.length).toBe(2)

          expect(tree[0].getPath()).toBe('d1')
          expect(tree[0].children[0].getName()).toBe('d2')
          expect(tree[0].children[0].children[0].getName()).toBe('d3')
          expect(tree[0].children[0].children[1].getName()).toBe('f1.txt')
          expect(tree[0].children[1].getName()).toBe('d4')
          expect(tree[0].children[2].getName()).toBe('f2.txt')

          expect(tree[1].getPath()).toBe('da')
          expect(tree[1].children[0].getName()).toBe('db')
          return expect(tree[1].children[1].getName()).toBe('fa.txt')
        })
      }))
    })

    describe('when the archive path does not exist', () => it('calls back with an error', function () {
      const archivePath = path.join(fixturesRoot, 'not-a-file.zip')
      let pathError = null
      const callback = error => pathError = error
      archive.list(archivePath, callback)
      waitsFor(() => pathError != null)
      return runs(() => expect(pathError.message.length).toBeGreaterThan(0))
    }))

    return describe("when the archive path isn't a valid zip file", () => it('calls back with an error', function () {
      const archivePath = path.join(fixturesRoot, 'invalid.zip')
      let pathError = null
      const callback = error => pathError = error
      archive.list(archivePath, callback)
      waitsFor(() => pathError != null)
      return runs(() => expect(pathError.message.length).toBeGreaterThan(0))
    }))
  })

  return describe('.readFile()', function () {
    describe('when the path exists in the archive', () => it('calls back with the contents of the given path', function () {
      const archivePath = path.join(fixturesRoot, 'one-file.zip')
      let pathContents = null
      const callback = (error, contents) => pathContents = contents
      archive.readFile(archivePath, 'file.txt', callback)
      waitsFor(() => pathContents != null)
      return runs(() => expect(pathContents.toString()).toBe('hello\n'))
    }))

    describe('when the path does not exist in the archive', () => it('calls back with an error', function () {
      const archivePath = path.join(fixturesRoot, 'one-file.zip')
      let pathError = null
      const callback = (error, contents) => pathError = error
      archive.readFile(archivePath, 'not-a-file.txt', callback)
      waitsFor(() => pathError != null)
      return runs(() => expect(pathError.message.length).toBeGreaterThan(0))
    }))

    describe('when the archive path does not exist', () => it('calls back with an error', function () {
      const archivePath = path.join(fixturesRoot, 'not-a-file.zip')
      let pathError = null
      const callback = (error, contents) => pathError = error
      archive.readFile(archivePath, 'not-a-file.txt', callback)
      waitsFor(() => pathError != null)
      return runs(() => expect(pathError.message.length).toBeGreaterThan(0))
    }))

    describe("when the archive path isn't a valid zip file", () => it('calls back with an error', function () {
      const archivePath = path.join(fixturesRoot, 'invalid.zip')
      let pathError = null
      const callback = (error, contents) => pathError = error
      archive.readFile(archivePath, 'invalid.txt', callback)
      waitsFor(() => pathError != null)
      return runs(() => expect(pathError.message.length).toBeGreaterThan(0))
    }))

    describe('when the path is a folder', () => it('calls back with an error', function () {
      const archivePath = path.join(fixturesRoot, 'one-folder.zip')
      let pathError = null
      const callback = (error, contents) => pathError = error
      archive.readFile(archivePath, `folder${path.sep}`, callback)
      waitsFor(() => pathError != null)
      return runs(() => expect(pathError.message.length).toBeGreaterThan(0))
    }))

    return describe('when the archive contains nested directories', () => it('calls back with the contents of the given path', function () {
      const archivePath = path.join(fixturesRoot, 'nested.zip')
      let pathContents = null
      const callback = (error, contents) => pathContents = contents
      archive.readFile(archivePath, `d1${path.sep}d2${path.sep}f1.txt`, callback)
      waitsFor(() => pathContents != null)
      return runs(() => expect(pathContents.toString()).toBe(''))
    }))
  })
})

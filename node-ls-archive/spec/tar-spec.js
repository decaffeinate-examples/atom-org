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

describe('tar files', function () {
  let fixturesRoot = null

  beforeEach(() => fixturesRoot = path.join(__dirname, 'fixtures'))

  describe('.list()', function () {
    describe('when the archive file exists', function () {
      it('returns files in the tar archive', function () {
        let tarPaths = null
        const callback = (error, paths) => tarPaths = paths
        archive.list(path.join(fixturesRoot, 'one-file.tar'), callback)
        waitsFor(() => tarPaths != null)
        return runs(function () {
          expect(tarPaths.length).toBe(1)
          expect(tarPaths[0].path).toBe('file.txt')
          expect(tarPaths[0].isDirectory()).toBe(false)
          expect(tarPaths[0].isFile()).toBe(true)
          return expect(tarPaths[0].isSymbolicLink()).toBe(false)
        })
      })

      it('returns folders in the tar archive', function () {
        let tarPaths = null
        const callback = (error, paths) => tarPaths = paths
        archive.list(path.join(fixturesRoot, 'one-folder.tar'), callback)
        waitsFor(() => tarPaths != null)
        return runs(function () {
          expect(tarPaths.length).toBe(1)
          expect(tarPaths[0].path).toBe('folder')
          expect(tarPaths[0].isDirectory()).toBe(true)
          expect(tarPaths[0].isFile()).toBe(false)
          return expect(tarPaths[0].isSymbolicLink()).toBe(false)
        })
      })

      return describe('when the tree option is set to true', function () {
        describe('when the archive has no directories entries', () => it('returns archive entries nested under their parent directory', function () {
          let tree = null
          archive.list(path.join(__dirname, 'fixtures', 'no-dir-entries.tgz'), { tree: true }, (error, files) => tree = files)
          waitsFor(() => tree != null)
          return runs(function () {
            expect(tree.length).toBe(1)
            expect(tree[0].getName()).toBe('package')
            expect(tree[0].getPath()).toBe('package')
            expect(tree[0].children.length).toBe(5)
            expect(tree[0].children[0].getName()).toBe('package.json')
            expect(tree[0].children[0].getPath()).toBe(path.join('package', 'package.json'))
            expect(tree[0].children[1].getName()).toBe('README.md')
            expect(tree[0].children[1].getPath()).toBe(path.join('package', 'README.md'))
            expect(tree[0].children[2].getName()).toBe('LICENSE.md')
            expect(tree[0].children[2].getPath()).toBe(path.join('package', 'LICENSE.md'))
            expect(tree[0].children[3].getName()).toBe('bin')
            expect(tree[0].children[3].getPath()).toBe(path.join('package', 'bin'))
            expect(tree[0].children[4].children[0].getName()).toBe('lister.js')
            expect(tree[0].children[4].children[0].getPath()).toBe(path.join('package', 'lib', 'lister.js'))
            expect(tree[0].children[4].children[1].getName()).toBe('ls-archive-cli.js')
            expect(tree[0].children[4].children[1].getPath()).toBe(path.join('package', 'lib', 'ls-archive-cli.js'))
            expect(tree[0].children[4].children[2].getName()).toBe('ls-archive.js')
            expect(tree[0].children[4].children[2].getPath()).toBe(path.join('package', 'lib', 'ls-archive.js'))
            expect(tree[0].children[4].children[3].getName()).toBe('reader.js')
            return expect(tree[0].children[4].children[3].getPath()).toBe(path.join('package', 'lib', 'reader.js'))
          })
        }))

        return describe('when the archive has multiple directories at the root', () => it('returns archive entries nested under their parent directory', function () {
          let tree = null
          archive.list(path.join(__dirname, 'fixtures', 'nested.tar'), { tree: true }, (error, files) => tree = files)
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
    })

    describe('when the archive path does not exist', () => it('calls back with an error', function () {
      const archivePath = path.join(fixturesRoot, 'not-a-file.tar')
      let pathError = null
      const callback = error => pathError = error
      archive.list(archivePath, callback)
      waitsFor(() => pathError != null)
      return runs(() => expect(pathError.message.length).toBeGreaterThan(0))
    }))

    return describe("when the archive path isn't a valid tar file", () => it('calls back with an error', function () {
      const archivePath = path.join(fixturesRoot, 'invalid.tar')
      let pathError = null
      const callback = error => pathError = error
      archive.list(archivePath, callback)
      waitsFor(() => pathError != null)
      return runs(() => expect(pathError.message.length).toBeGreaterThan(0))
    }))
  })

  return describe('.readFile()', function () {
    describe('when the path exists in the archive', () => it('calls back with the contents of the given path', function () {
      const archivePath = path.join(fixturesRoot, 'one-file.tar')
      let pathContents = null
      const callback = (error, contents) => pathContents = contents
      archive.readFile(archivePath, 'file.txt', callback)
      waitsFor(() => pathContents != null)
      return runs(() => expect(pathContents.toString()).toBe('hello\n'))
    }))

    describe('when the path does not exist in the archive', () => it('calls back with an error', function () {
      const archivePath = path.join(fixturesRoot, 'one-file.tar')
      let pathError = null
      const callback = (error, contents) => pathError = error
      archive.readFile(archivePath, 'not-a-file.txt', callback)
      waitsFor(() => pathError != null)
      return runs(() => expect(pathError.message.length).toBeGreaterThan(0))
    }))

    describe('when the archive path does not exist', () => it('calls back with an error', function () {
      const archivePath = path.join(fixturesRoot, 'not-a-file.tar')
      let pathError = null
      const callback = (error, contents) => pathError = error
      archive.readFile(archivePath, 'not-a-file.txt', callback)
      waitsFor(() => pathError != null)
      return runs(() => expect(pathError.message.length).toBeGreaterThan(0))
    }))

    describe("when the archive path isn't a valid tar file", () => it('calls back with an error', function () {
      const archivePath = path.join(fixturesRoot, 'invalid.tar')
      let pathError = null
      const callback = (error, contents) => pathError = error
      archive.readFile(archivePath, 'invalid.txt', callback)
      waitsFor(() => pathError != null)
      return runs(() => expect(pathError.message.length).toBeGreaterThan(0))
    }))

    return describe('when the path is a folder', () => it('calls back with an error', function () {
      const archivePath = path.join(fixturesRoot, 'one-folder.tar')
      let pathError = null
      const callback = (error, contents) => pathError = error
      archive.readFile(archivePath, `folder${path.sep}`, callback)
      waitsFor(() => pathError != null)
      return runs(() => expect(pathError.message.length).toBeGreaterThan(0))
    }))
  })
})

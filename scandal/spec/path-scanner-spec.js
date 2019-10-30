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
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require('fs')
const path = require('path')
const wrench = require('wrench')
const PathScanner = require('../src/path-scanner')

describe('PathScanner', function () {
  let rootPath = null
  let paths = null

  const createPathCollector = function () {
    paths = []
    const pathHandler = jasmine.createSpy()
    pathHandler.andCallFake(p => paths.push(p))
    return pathHandler
  }

  describe('a non-git directory with many files', function () {
    beforeEach(() => rootPath = fs.realpathSync(path.join('spec', 'fixtures', 'many-files')))

    it('lists all non-hidden files with symlink follow', function () {
      let finishedHandler, pathHandler
      const scanner = new PathScanner(rootPath, { follow: true })
      scanner.on('path-found', (pathHandler = createPathCollector()))
      scanner.on('finished-scanning', (finishedHandler = jasmine.createSpy()))

      runs(() => scanner.scan())
      waitsFor(() => pathHandler.callCount > 0)
      waitsFor(() => finishedHandler.callCount > 0)
      return runs(function () {
        // symlink-to-file1.txt is a file on windows
        if (process.platform === 'win32') {
          expect(paths.length).toBe(19)
        } else {
          expect(paths.length).toBe(18)
        }

        expect(paths).toContain(path.join(rootPath, 'file1.txt'))
        expect(paths).toContain(path.join(rootPath, 'dir', 'file7_ignorable.rb'))
        expect(paths).not.toContain(path.join(rootPath, 'symlink-to-directory', 'file7_ignorable.rb'))
        return expect(paths).not.toContain(path.join(rootPath, 'symlink-to-file1.txt'))
      })
    })

    describe('including file paths', function () {
      it('lists only paths specified by file pattern', function () {
        let finishedHandler, pathHandler
        const scanner = new PathScanner(rootPath, { inclusions: ['*.js'] })
        scanner.on('path-found', (pathHandler = createPathCollector()))
        scanner.on('finished-scanning', (finishedHandler = jasmine.createSpy()))

        runs(() => scanner.scan())
        waitsFor(() => finishedHandler.callCount > 0)
        return runs(function () {
          expect(paths.length).toBe(5)
          expect(paths).toContain(path.join(rootPath, 'newdir', 'deep_dir.js'))
          return expect(paths).toContain(path.join(rootPath, 'sample.js'))
        })
      })

      it('lists paths in a specified directory that contains dots', function () {
        let finishedHandler, pathHandler
        const scanner = new PathScanner(rootPath, { inclusions: ['dir.with.dots'] })
        scanner.on('path-found', (pathHandler = createPathCollector()))
        scanner.on('finished-scanning', (finishedHandler = jasmine.createSpy()))

        runs(() => scanner.scan())
        waitsFor(() => finishedHandler.callCount > 0)
        return runs(function () {
          expect(paths.length).toBe(1)
          return expect(paths).toContain(path.join(rootPath, 'dir.with.dots', 'parent-has-dots.txt'))
        })
      })

      it('returns nothing when a non-existent directory is passed in', function () {
        let finishedHandler, pathHandler
        const scanner = new PathScanner(rootPath, { inclusions: ['thisdoesntexist'] })
        scanner.on('path-found', (pathHandler = createPathCollector()))
        scanner.on('finished-scanning', (finishedHandler = jasmine.createSpy()))

        runs(() => scanner.scan())
        waitsFor(() => finishedHandler.callCount > 0)
        return runs(() => expect(paths.length).toBe(0))
      })

      it('lists only paths specified by a deep dir', function () {
        let finishedHandler, pathHandler
        const scanner = new PathScanner(rootPath, { inclusions: [path.join('.root', 'subdir') + path.sep], includeHidden: true })
        scanner.on('path-found', (pathHandler = createPathCollector()))
        scanner.on('finished-scanning', (finishedHandler = jasmine.createSpy()))

        runs(() => scanner.scan())
        waitsFor(() => finishedHandler.callCount > 0)
        return runs(function () {
          expect(paths).toContain(path.join(rootPath, '.root', 'subdir', '.realhidden'))
          expect(paths).toContain(path.join(rootPath, '.root', 'subdir', 'file1.txt'))
          return expect(paths).not.toContain(path.join(rootPath, '.root', 'file3.txt'))
        })
      })

      const dirs = ['dir', `dir${path.sep}`, `dir${path.sep}*`, `dir${path.sep}**`]
      return Array.from(dirs).map((dir) =>
        ((dir => it(`lists only paths specified in ${dir}`, function () {
          let finishedHandler, pathHandler
          const scanner = new PathScanner(rootPath, { inclusions: [dir] })
          scanner.on('path-found', (pathHandler = createPathCollector()))
          scanner.on('finished-scanning', (finishedHandler = jasmine.createSpy()))

          runs(() => scanner.scan())

          waitsFor(() => finishedHandler.callCount > 0)

          return runs(function () {
            expect(paths.length).toBe(1)
            return expect(paths).toContain(path.join(rootPath, 'dir', 'file7_ignorable.rb'))
          })
        })))(dir))
    })

    return describe('excluding file paths', function () {
      it('excludes paths matching the globalExclusions paths', function () {
        let finishedHandler, pathHandler
        const scanner = new PathScanner(rootPath, { globalExclusions: ['dir'] })
        scanner.on('path-found', (pathHandler = createPathCollector()))
        scanner.on('finished-scanning', (finishedHandler = jasmine.createSpy()))

        runs(() => scanner.scan())
        waitsFor(() => finishedHandler.callCount > 0)
        return runs(() => expect(paths).not.toContain(path.join(rootPath, 'dir', 'file7_ignorable.rb')))
      })

      it('excludes paths matching negated patterns in `inclusions`', function () {
        let finishedHandler, pathHandler
        const scanner = new PathScanner(rootPath, { inclusions: ['!*.js'] })
        scanner.on('path-found', (pathHandler = createPathCollector()))
        scanner.on('finished-scanning', (finishedHandler = jasmine.createSpy()))

        runs(() => scanner.scan())
        waitsFor(() => finishedHandler.callCount > 0)
        return runs(function () {
          expect(paths).not.toContain(path.join(rootPath, 'newdir', 'deep_dir.js'))
          expect(paths).not.toContain(path.join(rootPath, 'sample.js'))
          return expect(paths).toContain(path.join(rootPath, 'sample.txt'))
        })
      })

      it('allows a local directory inclusion to override a matching global exclusion', function () {
        let finishedHandler, pathHandler
        const scanner = new PathScanner(rootPath, { inclusions: ['dir'], globalExclusions: ['dir'] })
        scanner.on('path-found', (pathHandler = createPathCollector()))
        scanner.on('finished-scanning', (finishedHandler = jasmine.createSpy()))

        runs(() => scanner.scan())
        waitsFor(() => finishedHandler.callCount > 0)
        return runs(() => expect(paths).toContain(path.join(rootPath, 'dir', 'file7_ignorable.rb')))
      })

      it("doesn't allow a local directory inclusion to override a global exclusion of a subdirectory", function () {
        let finishedHandler, pathHandler
        const scanner = new PathScanner(rootPath, { inclusions: ['newdir'], globalExclusions: ['seconddir'] })
        scanner.on('path-found', (pathHandler = createPathCollector()))
        scanner.on('finished-scanning', (finishedHandler = jasmine.createSpy()))

        runs(() => scanner.scan())
        waitsFor(() => finishedHandler.callCount > 0)
        return runs(function () {
          expect(paths).toContain(path.join(rootPath, 'newdir', 'deep_dir.js'))
          return expect(paths).not.toContain(path.join(rootPath, 'newdir', 'seconddir', 'very_deep_dir.js'))
        })
      })

      it('allows a local inclusion of a subdirectory to override a global directory exclusion', function () {
        let finishedHandler, pathHandler
        const scanner = new PathScanner(rootPath, { inclusions: ['newdir/seconddir'], globalExclusions: ['newdir'] })
        scanner.on('path-found', (pathHandler = createPathCollector()))
        scanner.on('finished-scanning', (finishedHandler = jasmine.createSpy()))

        runs(() => scanner.scan())
        waitsFor(() => finishedHandler.callCount > 0)
        return runs(function () {
          expect(paths.length).toBe(1)
          expect(paths).not.toContain(path.join(rootPath, 'newdir', 'deep_dir.js'))
          return expect(paths).toContain(path.join(rootPath, 'newdir', 'seconddir', 'very_deep_dir.js'))
        })
      })

      it('allows a local file inclusion to override a global file exclusion', function () {
        let finishedHandler, pathHandler
        const scanner = new PathScanner(rootPath, { inclusions: ['*.txt'], globalExclusions: ['*.txt', '.root' + path.sep] })
        scanner.on('path-found', (pathHandler = createPathCollector()))
        scanner.on('finished-scanning', (finishedHandler = jasmine.createSpy()))

        runs(() => scanner.scan())
        waitsFor(() => finishedHandler.callCount > 0)
        return runs(function () {
          expect(paths).toContain(path.join(rootPath, 'file1.txt'))
          expect(paths).not.toContain(path.join(rootPath, 'file4_noext'))
          expect(paths).not.toContain(path.join(rootPath, '.root', 'file3.txt'))
          return expect(paths).not.toContain(path.join(rootPath, '.root', 'subdir', 'file1.txt'))
        })
      })

      it('correctly matches local inclusions and exclusions', function () {
        let finishedHandler, pathHandler
        const scanner = new PathScanner(rootPath, { inclusions: ['file*', '!*.txt'] })
        scanner.on('path-found', (pathHandler = createPathCollector()))
        scanner.on('finished-scanning', (finishedHandler = jasmine.createSpy()))

        runs(() => scanner.scan())
        waitsFor(() => finishedHandler.callCount > 0)
        return runs(function () {
          expect(paths).toContain(path.join(rootPath, 'file4_noext'))
          expect(paths).toContain(path.join(rootPath, 'file5_not_really_image.gif'))
          expect(paths).not.toContain(path.join(rootPath, 'file1.txt'))
          expect(paths).not.toContain(path.join(rootPath, 'file2.txt'))
          expect(paths).not.toContain(path.join(rootPath, 'file3.txt'))
          expect(paths).not.toContain(path.join(rootPath, 'file7_multibyte.txt'))
          expect(paths).not.toContain(path.join(rootPath, 'sample.js'))
          return expect(paths).not.toContain(path.join(rootPath, 'sample.txt'))
        })
      })

      it('correctly matches local inclusions and global excluded files', function () {
        let finishedHandler, pathHandler
        const scanner = new PathScanner(rootPath, { inclusions: ['file*'], globalExclusions: ['*.txt'] })
        scanner.on('path-found', (pathHandler = createPathCollector()))
        scanner.on('finished-scanning', (finishedHandler = jasmine.createSpy()))

        runs(() => scanner.scan())
        waitsFor(() => finishedHandler.callCount > 0)
        return runs(function () {
          expect(paths).toContain(path.join(rootPath, 'file4_noext'))
          expect(paths).toContain(path.join(rootPath, 'file5_not_really_image.gif'))
          expect(paths).not.toContain(path.join(rootPath, 'file1.txt'))
          expect(paths).not.toContain(path.join(rootPath, 'file2.txt'))
          expect(paths).not.toContain(path.join(rootPath, 'file3.txt'))
          expect(paths).not.toContain(path.join(rootPath, 'file7_multibyte.txt'))
          expect(paths).not.toContain(path.join(rootPath, 'sample.js'))
          return expect(paths).not.toContain(path.join(rootPath, 'sample.txt'))
        })
      })

      it('correctly matches local included files and global excluded dirs', function () {
        let finishedHandler, pathHandler
        const subdir = path.join('.root', 'subdir') + path.sep
        const scanner = new PathScanner(rootPath, { inclusions: ['file*.txt'], globalExclusions: [subdir] })
        scanner.on('path-found', (pathHandler = createPathCollector()))
        scanner.on('finished-scanning', (finishedHandler = jasmine.createSpy()))

        runs(() => scanner.scan())
        waitsFor(() => finishedHandler.callCount > 0)
        return runs(function () {
          expect(paths).toContain(path.join(rootPath, 'file1.txt'))
          expect(paths).toContain(path.join(rootPath, 'file2.txt'))
          expect(paths).toContain(path.join(rootPath, 'file7_multibyte.txt'))
          expect(paths).not.toContain(path.join(rootPath, 'file4_noext'))
          expect(paths).not.toContain(path.join(rootPath, 'file5_not_really_image.gif'))
          expect(paths).not.toContain(path.join(rootPath, '.root', 'subdir', 'file1.txt'))
          expect(paths).not.toContain(path.join(rootPath, 'sample.js'))
          return expect(paths).not.toContain(path.join(rootPath, 'sample.txt'))
        })
      })

      it('correctly matches local included files and global excluded dirs', function () {
        let finishedHandler, pathHandler
        const subdir = path.join('.root', 'subdir') + path.sep
        const scanner = new PathScanner(rootPath, { inclusions: [subdir], globalExclusions: [subdir, '*.txt'], includeHidden: true })
        scanner.on('path-found', (pathHandler = createPathCollector()))
        scanner.on('finished-scanning', (finishedHandler = jasmine.createSpy()))

        runs(() => scanner.scan())
        waitsFor(() => finishedHandler.callCount > 0)
        return runs(function () {
          expect(paths.length).toBe(1)
          expect(paths).toContain(path.join(rootPath, '.root', 'subdir', '.realhidden'))
          return expect(paths).not.toContain(path.join(rootPath, '.root', 'subdir', 'file1.txt'))
        })
      })

      const dirs = ['!dir', `!dir${path.sep}`, `!dir${path.sep}*`, `!dir${path.sep}**`]
      return Array.from(dirs).map((dir) =>
        ((dir => it(`lists only paths specified in ${dir}`, function () {
          let finishedHandler, pathHandler
          const scanner = new PathScanner(rootPath, { inclusions: [dir] })
          scanner.on('path-found', (pathHandler = createPathCollector()))
          scanner.on('finished-scanning', (finishedHandler = jasmine.createSpy()))

          runs(() => scanner.scan())
          waitsFor(() => finishedHandler.callCount > 0)
          return runs(function () {
            expect(paths.length).toBeGreaterThan(1)
            expect(paths).toContain(path.join(rootPath, 'sample.txt'))
            return expect(paths).not.toContain(path.join(rootPath, 'dir', 'file7_ignorable.rb'))
          })
        })))(dir))
    })
  })

  return describe('with a git repo', function () {
    let subDirPath = null
    beforeEach(function () {
      rootPath = fs.realpathSync(path.join('spec', 'fixtures', 'git'))
      subDirPath = fs.realpathSync(path.join(rootPath, 'src'))
      wrench.copyDirSyncRecursive(path.join(rootPath, 'git.git'), path.join(rootPath, '.git'))
      wrench.rmdirSyncRecursive(path.join(rootPath, 'git.git'))
      fs.writeFileSync(path.join(rootPath, 'ignored.txt'), "This must be added in the spec because the file can't be checked in!")
      return fs.writeFileSync(path.join(rootPath, 'src', 'ignored.txt'), "This must be added in the spec because the file can't be checked in!")
    })

    afterEach(function () {
      wrench.copyDirSyncRecursive(path.join(rootPath, '.git'), path.join(rootPath, 'git.git'))
      return wrench.rmdirSyncRecursive(path.join(rootPath, '.git'))
    })

    it('excludes files specified with .gitignore', function () {
      let finishedHandler, pathHandler
      const scanner = new PathScanner(rootPath, { excludeVcsIgnores: true })
      scanner.on('path-found', (pathHandler = createPathCollector()))
      scanner.on('finished-scanning', (finishedHandler = jasmine.createSpy()))

      runs(() => scanner.scan())
      waitsFor(() => finishedHandler.callCount > 0)
      return runs(function () {
        expect(paths.length).toBe(4)
        return expect(paths).not.toContain(path.join(rootPath, 'ignored.txt'))
      })
    })

    it('includes files matching .gitignore patterns when excludeVcsIgnores is false', function () {
      let finishedHandler, pathHandler
      const scanner = new PathScanner(rootPath, { excludeVcsIgnores: false })
      scanner.on('path-found', (pathHandler = createPathCollector()))
      scanner.on('finished-scanning', (finishedHandler = jasmine.createSpy()))

      runs(() => scanner.scan())
      waitsFor(() => finishedHandler.callCount > 0)
      return runs(function () {
        expect(paths.length).toBe(8)
        return expect(paths).toContain(path.join(rootPath, 'ignored.txt'))
      })
    })

    it('includes files deep in an included dir', function () {
      let finishedHandler, pathHandler
      const scanner = new PathScanner(rootPath, { excludeVcsIgnores: false, inclusions: ['node_modules'] })
      scanner.on('path-found', (pathHandler = createPathCollector()))
      scanner.on('finished-scanning', (finishedHandler = jasmine.createSpy()))

      runs(() => scanner.scan())
      waitsFor(() => finishedHandler.callCount > 0)
      return runs(function () {
        expect(paths.length).toBe(1)
        return expect(paths).toContain(path.join(rootPath, 'node_modules', 'pkg', 'sample.js'))
      })
    })

    it('includes files in a git-excluded dir when overridden by `inclusions` when excludeVcsIgnores is true', function () {
      let finishedHandler, pathHandler
      const scanner = new PathScanner(rootPath, { excludeVcsIgnores: true, inclusions: ['node_modules'] })
      scanner.on('path-found', (pathHandler = createPathCollector()))
      scanner.on('finished-scanning', (finishedHandler = jasmine.createSpy()))

      runs(() => scanner.scan())
      waitsFor(() => finishedHandler.callCount > 0)
      return runs(function () {
        expect(paths.length).toBe(1)
        return expect(paths).toContain(path.join(rootPath, 'node_modules', 'pkg', 'sample.js'))
      })
    })

    it('lists hidden files with showHidden == true', function () {
      let finishedHandler, pathHandler
      const scanner = new PathScanner(rootPath, { excludeVcsIgnores: true, includeHidden: true })
      scanner.on('path-found', (pathHandler = createPathCollector()))
      scanner.on('finished-scanning', (finishedHandler = jasmine.createSpy()))

      runs(() => scanner.scan())
      waitsFor(() => finishedHandler.callCount > 0)
      return runs(function () {
        expect(paths.length).toBe(6)
        return expect(paths).toContain(path.join(rootPath, '.gitignore'))
      })
    })

    it('treats hidden file patterns as directories and wont search in hidden directories', function () {
      let finishedHandler, pathHandler
      const scanner = new PathScanner(rootPath, { exclusions: ['.git'], excludeVcsIgnores: false, includeHidden: true })
      scanner.on('path-found', (pathHandler = createPathCollector()))
      scanner.on('finished-scanning', (finishedHandler = jasmine.createSpy()))

      runs(() => scanner.scan())
      waitsFor(() => finishedHandler.callCount > 0)
      return runs(() => expect(paths).not.toContain(path.join(rootPath, '.git', 'HEAD')))
    })

    it('can ignore hidden files even though it is treated as a directory', function () {
      let finishedHandler, pathHandler
      const scanner = new PathScanner(rootPath, { exclusions: ['.gitignore'], excludeVcsIgnores: false, includeHidden: true })
      scanner.on('path-found', (pathHandler = createPathCollector()))
      scanner.on('finished-scanning', (finishedHandler = jasmine.createSpy()))

      runs(() => scanner.scan())
      waitsFor(() => finishedHandler.callCount > 0)
      return runs(() => expect(paths).not.toContain(path.join(rootPath, '.gitignore')))
    })

    return it('correctly ignores files when searching a subdirectory when excludeVcsIgnores is true', function () {
      let finishedHandler, pathHandler
      const scanner = new PathScanner(subDirPath, { excludeVcsIgnores: true })
      scanner.on('path-found', (pathHandler = createPathCollector()))
      scanner.on('finished-scanning', (finishedHandler = jasmine.createSpy()))

      runs(() => scanner.scan())
      waitsFor(() => finishedHandler.callCount > 0)
      return runs(function () {
        expect(paths.length).toBe(2)
        expect(paths).toContain(path.join(subDirPath, 'file.txt'))
        return expect(paths).toNotContain(path.join(subDirPath, 'ignored.txt'))
      })
    })
  })
})

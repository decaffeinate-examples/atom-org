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
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require('fs')
const os = require('os')
const path = require('path')
const PathReplacer = require('../src/path-replacer')

describe('PathReplacer', function () {
  let [replacer, rootPath] = Array.from([])

  beforeEach(function () {
    replacer = new PathReplacer()
    return rootPath = fs.realpathSync(path.join('spec', 'fixtures', 'many-files'))
  })

  describe('replacePath()', () => describe('when a file doesnt exist', () => it("returns error in the doneCallback and emits an 'error' event when the path does not exist", function () {
    let errorHandler, finishedHandler, replacedHandler
    replacer.on('file-error', (errorHandler = jasmine.createSpy()))
    replacer.on('path-replaced', (replacedHandler = jasmine.createSpy()))
    replacer.replacePath(/nope/gi, 'replacement', '/this-does-not-exist.js', (finishedHandler = jasmine.createSpy()))

    waitsFor(() => finishedHandler.callCount > 0)

    return runs(function () {
      expect(replacedHandler).not.toHaveBeenCalled()
      expect(finishedHandler).toHaveBeenCalled()
      expect(finishedHandler.mostRecentCall.args[1].code).toBe('ENOENT')

      expect(errorHandler).toHaveBeenCalled()
      expect(errorHandler.mostRecentCall.args[0].path).toBe('/this-does-not-exist.js')
      return expect(errorHandler.mostRecentCall.args[0].code).toBe('ENOENT')
    })
  })))

  return describe('replacePaths()', function () {
    let [filePath, sampleContent] = Array.from([])

    beforeEach(function () {
      filePath = path.join(rootPath, 'sample.js')
      return sampleContent = fs.readFileSync(filePath).toString()
    })

    afterEach(() => fs.writeFileSync(filePath, sampleContent))

    it('can make a replacement', function () {
      let errorHandler, finishedHandler, resultsHandler
      replacer.on('file-error', (errorHandler = jasmine.createSpy()))
      replacer.on('path-replaced', (resultsHandler = jasmine.createSpy()))
      replacer.replacePaths(/items/gi, 'omgwow', [filePath], (finishedHandler = jasmine.createSpy()))

      waitsFor(() => finishedHandler.callCount > 0)

      return runs(function () {
        expect(errorHandler).not.toHaveBeenCalled()
        expect(resultsHandler).toHaveBeenCalled()
        expect(resultsHandler.mostRecentCall.args[0]).toEqual({
          filePath,
          replacements: 6
        })

        const replacedFile = fs.readFileSync(filePath).toString()

        const replacedContent = `\
var quicksort = function () {
  var sort = function(omgwow) {  # followed by a pretty long comment which is used to check the maxLineLength feature
    if (omgwow.length <= 1) return omgwow;
    var pivot = omgwow.shift(), current, left = [], right = [];
    while(omgwow.length > 0) {
      current = omgwow.shift();
      current < pivot ? left.push(current) : right.push(current);
    }
    return sort(left).concat(pivot).concat(sort(right));
  };

  return sort(Array.apply(this, arguments));
};\
`.replace(/\n/g, os.EOL)
        expect(replacedFile).toEqual(replacedContent)
        return expect(finishedHandler.mostRecentCall.args[1]).toEqual(null)
      })
    })

    it('makes no replacement when nothing to replace', function () {
      let finishedHandler, resultsHandler
      replacer.on('path-replaced', (resultsHandler = jasmine.createSpy()))
      replacer.replacePaths(/nopenothere/gi, 'omgwow', [filePath], (finishedHandler = jasmine.createSpy()))

      waitsFor(() => finishedHandler.callCount > 0)

      return runs(function () {
        expect(resultsHandler).not.toHaveBeenCalled()
        const replacedFile = fs.readFileSync(filePath).toString()
        return expect(replacedFile).toEqual(sampleContent)
      })
    })

    describe('when the file has different permissions than temp files', function () {
      let [stat, replaceFilePath] = Array.from([])
      beforeEach(function () {
        replaceFilePath = path.join(rootPath, 'replaceme.js')
        fs.writeFileSync(replaceFilePath, 'Some file with content to replace')
        fs.chmodSync(replaceFilePath, '777')
        return stat = fs.statSync(replaceFilePath)
      })

      afterEach(() => fs.unlinkSync(replaceFilePath))

      return it('replaces and keeps the same file modes', function () {
        let finishedHandler
        replacer.replacePaths(/content/gi, 'omgwow', [replaceFilePath], (finishedHandler = jasmine.createSpy()))

        waitsFor(() => finishedHandler.callCount > 0)

        return runs(function () {
          const replacedFile = fs.readFileSync(replaceFilePath).toString()
          expect(replacedFile).toEqual('Some file with omgwow to replace')

          const newStat = fs.statSync(replaceFilePath)
          return expect(newStat.mode).toBe(stat.mode)
        })
      })
    })

    return describe('when a file doesnt exist', () => it('calls the done callback with a list of errors', function () {
      let finishedHandler, resultsHandler
      replacer.on('path-replaced', (resultsHandler = jasmine.createSpy()))
      replacer.replacePaths(/content/gi, 'omgwow', ['/doesnt-exist.js', '/nope.js'], (finishedHandler = jasmine.createSpy()))

      waitsFor(() => finishedHandler.callCount > 0)

      return runs(function () {
        expect(resultsHandler).not.toHaveBeenCalled()
        const errors = finishedHandler.mostRecentCall.args[1]
        expect(errors.length).toBe(2)
        return expect(errors[0].code).toBe('ENOENT')
      })
    }))
  })
})

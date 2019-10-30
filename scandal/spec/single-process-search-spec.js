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
const PathScanner = require('../src/path-scanner')
const PathSearcher = require('../src/path-searcher')
const PathReplacer = require('../src/path-replacer')

const { search, replace, replacePaths } = require('../src/single-process-search')

describe('search', function () {
  let [scanner, searcher, rootPath] = Array.from([])

  beforeEach(function () {
    rootPath = fs.realpathSync(path.join('spec', 'fixtures', 'many-files'))
    scanner = new PathScanner(rootPath)
    return searcher = new PathSearcher()
  })

  describe('when there is no error', () => it('finds matches in a file', function () {
    let finishedHandler, resultsHandler
    searcher.on('results-found', (resultsHandler = jasmine.createSpy()))
    search(/items/gi, scanner, searcher, (finishedHandler = jasmine.createSpy()))

    waitsFor(() => finishedHandler.callCount > 0)

    return runs(function () {
      expect(resultsHandler.callCount).toBe(3)

      const regex = /many-files\/sample(-)?.*\.js/g
      expect(resultsHandler.argsForCall[0][0].filePath).toMatch(regex)
      expect(resultsHandler.argsForCall[1][0].filePath).toMatch(regex)
      return expect(resultsHandler.argsForCall[2][0].filePath).toMatch(regex)
    })
  }))

  return describe('when there is an error', () => it('finishes searching and properly emits the error event', function () {
    let errorHandler, finishedHandler, resultsHandler
    const scanSpy = spyOn(scanner, 'scan')

    searcher.on('file-error', (errorHandler = jasmine.createSpy()))
    searcher.on('results-found', (resultsHandler = jasmine.createSpy()))
    search(/items/gi, scanner, searcher, (finishedHandler = jasmine.createSpy()))

    scanner.emit('path-found', '/this-doesnt-exist.js')
    scanner.emit('path-found', '/nope-not-this-either.js')
    scanner.emit('finished-scanning')

    waitsFor(() => finishedHandler.callCount > 0)

    return runs(function () {
      expect(errorHandler.callCount).toBe(2)
      return expect(resultsHandler).not.toHaveBeenCalled()
    })
  }))
})

describe('replace', function () {
  let [scanner, replacer, rootPath] = Array.from([])

  beforeEach(function () {
    rootPath = fs.realpathSync(path.join('spec', 'fixtures', 'many-files'))
    scanner = new PathScanner(rootPath)
    return replacer = new PathReplacer()
  })

  describe('when a replacement is made', function () {
    let [filePath, sampleContent] = Array.from([])

    beforeEach(function () {
      filePath = path.join(rootPath, 'sample.txt')
      return sampleContent = fs.readFileSync(filePath).toString()
    })

    afterEach(() => fs.writeFileSync(filePath, sampleContent))

    return it('finds matches and replaces said matches', function () {
      let finishedHandler, resultsHandler
      replacer.on('path-replaced', (resultsHandler = jasmine.createSpy()))
      replace(/Some text/gi, 'kittens', scanner, replacer, (finishedHandler = jasmine.createSpy()))

      waitsFor(() => finishedHandler.callCount > 0)

      return runs(function () {
        expect(resultsHandler.callCount).toBe(1)
        return expect(resultsHandler.argsForCall[0][0].filePath).toContain('sample.txt')
      })
    })
  })

  return describe('when there is an error', () => it('emits proper error events', function () {
    let errorHandler, finishedHandler, resultsHandler
    const scanSpy = spyOn(scanner, 'scan')

    replacer.on('file-error', (errorHandler = jasmine.createSpy()))
    replacer.on('path-replaced', (resultsHandler = jasmine.createSpy()))
    replace(/items/gi, 'kittens', scanner, replacer, (finishedHandler = jasmine.createSpy()))

    scanner.emit('path-found', '/this-doesnt-exist.js')
    scanner.emit('path-found', '/nope-not-this-either.js')
    scanner.emit('finished-scanning')

    waitsFor(() => finishedHandler.callCount > 0)

    return runs(function () {
      expect(errorHandler.callCount).toBe(2)
      return expect(resultsHandler).not.toHaveBeenCalled()
    })
  }))
})

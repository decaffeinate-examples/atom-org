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
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require('fs')
const path = require('path')
const ctags = require('../lib/ctags')

describe('ctags', function () {
  let tagsFile = null

  beforeEach(() => tagsFile = path.join(__dirname, 'fixtures', 'line-number-tags'))

  return describe('.createReadStream(tagsFileWithLineNumberPath)', () => it('returns a stream that emits data and end events', function () {
    const stream = ctags.createReadStream(tagsFile)

    let tags = []
    stream.on('data', chunk => tags = tags.concat(chunk))

    const endHandler = jasmine.createSpy('endHandler')
    stream.on('end', endHandler)

    waitsFor(() => endHandler.callCount === 1)

    return runs(function () {
      expect(tags.length).toBe(4)

      expect(tags[0].file).toBe('tagged.js')
      expect(tags[0].name).toBe('callMeMaybe')
      expect(tags[0].pattern).toBe('/^function callMeMaybe() {$/')
      expect(tags[0].kind).toBe('f')
      expect(tags[0].lineNumber).toBe(3)

      expect(tags[1].file).toBe('tagged-duplicate.js')
      expect(tags[1].name).toBe('duplicate')
      expect(tags[1].pattern).toBe('/^function duplicate() {$/')
      expect(tags[1].kind).toBe('f')
      expect(tags[1].lineNumber).toBe(3)

      expect(tags[2].file).toBe('tagged.js')
      expect(tags[2].name).toBe('duplicate')
      expect(tags[2].pattern).toBe('/^function duplicate() {$/')
      expect(tags[2].kind).toBe('f')
      expect(tags[2].lineNumber).toBe(7)

      expect(tags[3].file).toBe('tagged.js')
      expect(tags[3].name).toBe('thisIsCrazy')
      expect(tags[3].pattern).toBe('/^var thisIsCrazy = true;$/')
      expect(tags[3].kind).toBe('v')
      return expect(tags[3].lineNumber).toBe(2)
    })
  }))
})

/** @babel */
/* eslint-disable
    camelcase,
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
const roaster = require('../lib/roaster')
const Path = require('path')
const Fs = require('fs')

const fixtures_dir = Path.join(__dirname, 'fixtures')

describe('roaster', function () {
  describe('options', function () {
    describe('passing options.isFile = true', () => it('returns a rendered file', () => roaster(Path.join(fixtures_dir, 'markdown.md'), { isFile: true }, function (err, contents) {
      expect(err).toBeNull()
      return expect(contents).toContain('<code class="lang-bash">')
    })))
    return describe('not passing options.isFile', () => it('returns a rendered file', function () {
      const contents = Fs.readFileSync(Path.join(fixtures_dir, 'markdown.md'), { encoding: 'utf8' })
      return roaster(contents, function (err, contents) {
        expect(err).toBeNull()
        return expect(contents).toContain('<code class="lang-bash">')
      })
    }))
  })

  describe('emoji', function () {
    it('returns emoji it knows', () => roaster(Path.join(fixtures_dir, 'emoji.md'), { isFile: true }, function (err, contents) {
      expect(err).toBeNull()
      return expect(contents).toMatch('<p><img class="emoji" title=":trollface:" alt="trollface" src="/Users/garentorikian/Development/roaster/node_modules/emoji-images/pngs/trollface.png" height="20"></p>\n<p><img class="emoji" title=":shipit:" alt="shipit" src="/Users/garentorikian/Development/roaster/node_modules/emoji-images/pngs/shipit.png" height="20"></p>\n<p><img class="emoji" title=":smiley:" alt="smiley" src="/Users/garentorikian/Development/roaster/node_modules/emoji-images/pngs/smiley.png" height="20"></p>')
    }))
    return it('does nothing to unknown emoji', () => roaster(':lala:', function (err, contents) {
      expect(err).toBeNull()
      return expect(contents).toMatch(':lala:')
    }))
  })

  return describe('headers', function () {
    let [toc, result, resultShort] = Array.from([])

    beforeEach(function () {
      toc = Fs.readFileSync(Path.join(fixtures_dir, 'toc.md'), { encoding: 'utf8' })
      result = Fs.readFileSync(Path.join(fixtures_dir, 'toc_normal_result.html'), { encoding: 'utf8' })
      return resultShort = Fs.readFileSync(Path.join(fixtures_dir, 'toc_short_result.html'), { encoding: 'utf8' })
    })

    it('adds anchors to all headings', () => roaster(toc, function (err, contents) {
      expect(err).toBeNull()
      return expect(contents.replace(/^\s+|\s+$/g, '')).toContain(result.replace(/\s+$/g, ''))
    }))

    return it('truncates anchors on headings, due to options', () => roaster(toc, { anchorMin: 3, anchorMax: 4 }, function (err, contents) {
      expect(err).toBeNull()
      return expect(contents.replace(/^\s+|\s+$/g, '')).toContain(resultShort.replace(/\s+$/g, ''))
    }))
  })
})

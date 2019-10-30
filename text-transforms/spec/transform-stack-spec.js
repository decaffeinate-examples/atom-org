/** @babel */
/* eslint-disable
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const LinesTransform = require('../src/lines-transform')
const TextRegion = require('../src/text-region')

describe('transforms', () => describe('lines transform', () => it('breaks the source region into individual lines', function () {
  const origin = new TextRegion('the quick brown fox\njumps over\nthe lazy dog.')
  const transform = new LinesTransform(origin)
  return expect(transform.getRegion().summarize()).toEqual({
    sourceSpan: [0, 44],
    targetSpan: [2, 13],
    children: [
      {
        sourceSpan: [0, 20],
        targetSpan: [1, 0],
        text: 'the quick brown fox\n'
      },
      {
        sourceSpan: [0, 11],
        targetSpan: [1, 0],
        text: 'jumps over\n'
      },
      {
        sourceSpan: [0, 13],
        targetSpan: [0, 13],
        text: 'the lazy dog.'
      }
    ]
  })
})))

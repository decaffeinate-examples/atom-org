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
const { score } = require('../src/fuzzaldrin')

describe('score(string, query)', () => it('returns a score', function () {
  expect(score('Hello World', 'he')).toBeLessThan(score('Hello World', 'Hello'))
  expect(score('Hello World', 'Hello World')).toBe(2)
  expect(score('Hello World', '')).toBe(0)
  expect(score('Hello World', null)).toBe(0)
  expect(score('Hello World')).toBe(0)
  expect(score()).toBe(0)
  expect(score(null, 'he')).toBe(0)
  expect(score('', '')).toBe(0)
  return expect(score('', 'abc')).toBe(0)
}))

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
require('../lib/jasmine-tagged')

describe('jasmine-tagged', function () {
  let [env, taggedSpec, multiTaggedSpec, anotherTaggedSpec, untaggedSpec] = Array.from([])

  beforeEach(function () {
    env = jasmine.getEnv()
    taggedSpec =
      { description: '#tag' }
    multiTaggedSpec =
      { description: '#tag #another-tag' }
    anotherTaggedSpec =
      { description: '#another-tag' }
    return untaggedSpec =
      { description: 'no tag' }
  })

  describe('by default', function () {
    it('runs untagged specs', () => expect(env.specFilter(untaggedSpec)).toBeTruthy())

    return it("doesn't run any tagged specs", () => expect(env.specFilter(taggedSpec)).toBeFalsy())
  })

  describe('without untagged specs', function () {
    beforeEach(() => env.includeSpecsWithoutTags(false))

    afterEach(() => env.includeSpecsWithoutTags(true))

    return it("doesn't run untagged specs", () => expect(env.specFilter(taggedSpec)).toBeFalsy())
  })

  describe('with a specific tag specs', function () {
    beforeEach(() => env.setIncludedTags(['tag']))

    afterEach(() => env.setIncludedTags([]))

    it('run specs with a matching tag', function () {
      expect(env.specFilter(taggedSpec)).toBeTruthy()
      return expect(env.specFilter(multiTaggedSpec)).toBeTruthy()
    })

    return it("doesn't run specs with different tags", () => expect(env.specFilter(anotherTaggedSpec)).toBeFalsy())
  })

  describe('with a nested spec', function () {
    let [nestedTaggedSpec, nestedAnotherTaggedSpec] = Array.from([])

    beforeEach(function () {
      env = jasmine.getEnv()
      const suite =
        { description: 'another level' }
      nestedTaggedSpec = {
        description: '#tag',
        parentSuite: suite
      }
      return nestedAnotherTaggedSpec = {
        description: '#another-tag',
        parentSuite: suite
      }
    })

    return describe('with a specific tag specs', function () {
      beforeEach(() => env.setIncludedTags(['tag']))

      afterEach(() => env.setIncludedTags([]))

      it('run specs with a matching tag', () => expect(env.specFilter(nestedTaggedSpec)).toBeTruthy())

      return it("doesn't run specs with different tags", () => expect(env.specFilter(nestedAnotherTaggedSpec)).toBeFalsy())
    })
  })

  return describe('with a tagged suite', function () {
    let [taggedSuiteSpec] = Array.from([])

    beforeEach(function () {
      env = jasmine.getEnv()
      const suite =
        { description: 'another #tag' }
      return taggedSuiteSpec = {
        description: 'no tag',
        suite
      }
    })

    return describe('with a specific tag specs', function () {
      beforeEach(function () {
        env.includeSpecsWithoutTags(false)
        return env.setIncludedTags(['tag'])
      })

      afterEach(function () {
        env.includeSpecsWithoutTags(true)
        return env.setIncludedTags([])
      })

      return it('run specs with a matching tag', () => expect(env.specFilter(taggedSuiteSpec)).toBeTruthy())
    })
  })
})

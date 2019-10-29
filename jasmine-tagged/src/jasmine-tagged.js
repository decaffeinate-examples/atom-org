/** @babel */
/* eslint-disable
    no-return-assign,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const jasmine = require('jasmine-focused')

const env = jasmine.getEnv()

let includeSpecsWithoutTags = true
env.includeSpecsWithoutTags = permit => includeSpecsWithoutTags = permit

let includedTags = []
env.setIncludedTags = tags => includedTags = tags

var findTags = function (spec) {
  let parent
  const words = spec.description.split(' ')
  let tags = ((() => {
    const result = []
    for (const word of Array.from(words)) {
      if (word.indexOf('#') === 0) {
        result.push(word.substring(1))
      }
    }
    return result
  })())
  if (tags == null) { tags = [] }

  if ((parent = spec.parentSuite != null ? spec.parentSuite : spec.suite)) {
    return tags.concat(findTags(parent))
  } else {
    return tags
  }
}

const originalFilter = env.specFilter ? env.specFilter : () => true
env.specFilter = function (spec) {
  if (!originalFilter(spec)) { return false }

  const tags = findTags(spec)
  if (includeSpecsWithoutTags && (tags.length === 0)) { return true }

  if (tags.some(t => includedTags.some(it => it === t))) {
    return true
  } else {
    return false
  }
}

module.exports = jasmine

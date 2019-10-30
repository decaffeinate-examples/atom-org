/** @babel */
/* eslint-disable
    no-useless-escape,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const scorer = require('./scorer')
const filter = require('./filter')
const matcher = require('./matcher')

const PathSeparator = require('path').sep
const SpaceRegex = /\ /g

module.exports = {
  filter (candidates, query, options) {
    let queryHasSlashes
    if (query) {
      queryHasSlashes = query.indexOf(PathSeparator) !== -1
      query = query.replace(SpaceRegex, '')
    }
    return filter(candidates, query, queryHasSlashes, options)
  },

  score (string, query) {
    if (!string) { return 0 }
    if (!query) { return 0 }
    if (string === query) { return 2 }

    const queryHasSlashes = query.indexOf(PathSeparator) !== -1
    query = query.replace(SpaceRegex, '')
    let score = scorer.score(string, query)
    if (!queryHasSlashes) { score = scorer.basenameScore(string, query, score) }
    return score
  },

  match (string, query) {
    if (!string) { return [] }
    if (!query) { return [] }
    if (string === query) { return __range__(0, string.length, false) }

    const queryHasSlashes = query.indexOf(PathSeparator) !== -1
    query = query.replace(SpaceRegex, '')
    let matches = matcher.match(string, query)
    if (!queryHasSlashes) {
      const baseMatches = matcher.basenameMatch(string, query)
      // Combine the results, removing dupicate indexes
      matches = matches.concat(baseMatches).sort((a, b) => a - b)
      let seen = null
      let index = 0
      while (index < matches.length) {
        if (index && (seen === matches[index])) {
          matches.splice(index, 1) // remove duplicate
        } else {
          seen = matches[index]
          index++
        }
      }
    }

    return matches
  }
}

function __range__ (left, right, inclusive) {
  const range = []
  const ascending = left < right
  const end = !inclusive ? right : ascending ? right + 1 : right - 1
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i)
  }
  return range
}

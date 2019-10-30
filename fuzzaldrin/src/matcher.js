/** @babel */
/* eslint-disable
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// A match list is an array of indexes to characters that match.
// This file should closely follow `scorer` except that it returns an array
// of indexes instead of a score.

const PathSeparator = require('path').sep

exports.basenameMatch = function (string, query) {
  let index = string.length - 1
  while (string[index] === PathSeparator) { index-- } // Skip trailing slashes
  let slashCount = 0
  const lastCharacter = index
  let base = null
  while (index >= 0) {
    if (string[index] === PathSeparator) {
      slashCount++
      if (base == null) { base = string.substring(index + 1, lastCharacter + 1) }
    } else if (index === 0) {
      if (lastCharacter < (string.length - 1)) {
        if (base == null) { base = string.substring(0, lastCharacter + 1) }
      } else {
        if (base == null) { base = string }
      }
    }
    index--
  }

  return exports.match(base, query, string.length - base.length)
}

exports.match = function (string, query, stringOffset) {
  if (stringOffset == null) { stringOffset = 0 }
  if (string === query) { return __range__(stringOffset, stringOffset + string.length, false) }

  const queryLength = query.length
  const stringLength = string.length

  let indexInQuery = 0
  let indexInString = 0

  const matches = []

  while (indexInQuery < queryLength) {
    const character = query[indexInQuery++]
    const lowerCaseIndex = string.indexOf(character.toLowerCase())
    const upperCaseIndex = string.indexOf(character.toUpperCase())
    let minIndex = Math.min(lowerCaseIndex, upperCaseIndex)
    if (minIndex === -1) { minIndex = Math.max(lowerCaseIndex, upperCaseIndex) }
    indexInString = minIndex
    if (indexInString === -1) { return [] }

    matches.push(stringOffset + indexInString)

    // Trim string to after current abbreviation match
    stringOffset += indexInString + 1
    string = string.substring(indexInString + 1, stringLength)
  }

  return matches
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

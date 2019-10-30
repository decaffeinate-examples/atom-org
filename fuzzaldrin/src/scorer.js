/** @babel */
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS204: Change includes calls to have a more natural evaluation order
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Original ported from:
//
// string_score.js: String Scoring Algorithm 0.1.10
//
// http://joshaven.com/string_score
// https://github.com/joshaven/string_score
//
// Copyright (C) 2009-2011 Joshaven Potter <yourtech@gmail.com>
// Special thanks to all of the contributors listed here https://github.com/joshaven/string_score
// MIT license: http://www.opensource.org/licenses/mit-license.php
//
// Date: Tue Mar 1 2011

const PathSeparator = require('path').sep

exports.basenameScore = function (string, query, score) {
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

  // Basename matches count for more.
  if (base === string) {
    score *= 2
  } else if (base) {
    score += exports.score(base, query)
  }

  // Shallow files are scored higher
  const segmentCount = slashCount + 1
  const depth = Math.max(1, 10 - segmentCount)
  score *= depth * 0.01
  return score
}

exports.score = function (string, query) {
  if (string === query) { return 1 }

  // Return a perfect score if the file name itself matches the query.
  if (queryIsLastPathSegment(string, query)) { return 1 }

  let totalCharacterScore = 0
  const queryLength = query.length
  const stringLength = string.length

  let indexInQuery = 0
  let indexInString = 0

  while (indexInQuery < queryLength) {
    var needle
    const character = query[indexInQuery++]
    const lowerCaseIndex = string.indexOf(character.toLowerCase())
    const upperCaseIndex = string.indexOf(character.toUpperCase())
    let minIndex = Math.min(lowerCaseIndex, upperCaseIndex)
    if (minIndex === -1) { minIndex = Math.max(lowerCaseIndex, upperCaseIndex) }
    indexInString = minIndex
    if (indexInString === -1) { return 0 }

    let characterScore = 0.1

    // Same case bonus.
    if (string[indexInString] === character) { characterScore += 0.1 }

    if ((indexInString === 0) || (string[indexInString - 1] === PathSeparator)) {
      // Start of string bonus
      characterScore += 0.8
    } else if ((needle = string[indexInString - 1], ['-', '_', ' '].includes(needle))) {
      // Start of word bonus
      characterScore += 0.7
    }

    // Trim string to after current abbreviation match
    string = string.substring(indexInString + 1, stringLength)

    totalCharacterScore += characterScore
  }

  const queryScore = totalCharacterScore / queryLength
  return ((queryScore * (queryLength / stringLength)) + queryScore) / 2
}

var queryIsLastPathSegment = function (string, query) {
  if (string[string.length - query.length - 1] === PathSeparator) {
    return string.lastIndexOf(query) === (string.length - query.length)
  }
}

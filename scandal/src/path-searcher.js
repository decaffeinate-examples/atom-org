/** @babel */
/* eslint-disable
    constructor-super,
    no-constant-condition,
    no-eval,
    no-this-before-super,
    no-unused-vars,
    no-useless-escape,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let PathSearcher
const fs = require('fs')
const os = require('os')
const { EventEmitter } = require('events')
const ChunkedExecutor = require('./chunked-executor')
const ChunkedLineReader = require('./chunked-line-reader')

const MAX_LINE_LENGTH = 100
const LINE_COUNT_BEFORE = 0
const LINE_COUNT_AFTER = 0
const WORD_BREAK_REGEX = /[ \r\n\t;:?=&\/]/
const LINE_END_REGEX = /\r\n|\n|\r/
const TRAILING_LINE_END_REGEX = /\r?\n?$/

// Public: Will search through paths specified for a regex.
//
// Like the {PathScanner} the {PathSearcher} keeps no state. You need to consume
// results via the done callbacks or events.
//
// File reading is fast and memory efficient. It reads in 10k chunks and writes
// over each previous chunk. Small object creation is kept to a minimum during
// the read to make light use of the GC.
//
// ## Examples
//
// ```coffee
// {PathSearcher} = require 'scandal'
// searcher = new PathSearcher({leadingContextLineCount: 2, trailingContextLineCount: 3})
//
// # You can subscribe to a `results-found` event
// searcher.on 'results-found', (result) ->
//   # result will contain all the matches for a single path
//   console.log("Single Path's Results", result)
//
// # Search a list of paths
// searcher.searchPaths /text/gi, ['/Some/path', ...], (results) ->
//   console.log('Done Searching', results)
//
// # Search a single path
// searcher.searchPath /text/gi, '/Some/path', (result) ->
//   console.log('Done Searching', result)
// ```
//
// A results from line 10 (1 based) are in the following format:
//
// ```js
// {
//   "path": "/Some/path",
//   "matches": [{
//     "matchText": "Text",
//     "lineText": "Text in this file!",
//     "lineTextOffset": 0,
//     "range": [[9, 0], [9, 4]],
//     "leadingContextLines": ["line #8", "line #9"],
//     "trailingContextLines": ["line #11", "line #12", "line #13"]
//   }]
// }
// ```
//
// ## Events
//
// ### results-found
//
// Fired when searching for a each path has been completed and matches were found.
//
// * `results` {Object} in the result format:
//   ```js
//   {
//     "path": "/Some/path.txt",
//     "matches": [{
//       "matchText": "Text",
//       "lineText": "Text in this file!",
//       "lineTextOffset": 0,
//       "range": [[9, 0], [9, 4]],
//       "leadingContextLines": ["line #8", "line #9"],
//       "trailingContextLines": ["line #11", "line #12", "line #13"]
//     }]
//   }
//   ```
//
// ### results-not-found
//
// Fired when searching for a path has finished and _no_ matches were found.
//
// * `filePath` path to the file nothing was found in `"/Some/path.txt"`
//
// ### file-error
//
// Fired when an error occurred when searching a file. Happens for example when a file cannot be opened.
//
// * `error` {Error} object
//
module.exports =
(PathSearcher = class PathSearcher extends EventEmitter {
  // Public: Construct a {PathSearcher} object.
  //
  // * `options` {Object}
  //   * `maxLineLength` {Number} default `100`; The max length of the `lineText`
  //      component in a results object. `lineText` is the context around the matched text.
  //   * `leadingContextLineCount` {Number} default `0`; The number of lines before the
  //      matched line to include in the results object. Each line is subject
  //      to the `maxLineLength` limit.
  //   * `trailingContextLineCount` {Number} default `0`; The number of lines after the
  //      matched line to include in the results object. Each line is subject
  //      to the `maxLineLength` limit.
  //   * `wordBreakRegex` {RegExp} default `/[ \r\n\t;:?=&\/]/`;
  //      Used to break on a word when finding the context for a match.
  constructor (param) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super() }
      const thisFn = (() => { return this }).toString()
      const thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1]
      eval(`${thisName} = this;`)
    }
    if (param == null) { param = {} }
    const { maxLineLength, leadingContextLineCount, trailingContextLineCount, wordBreakRegex } = param
    this.maxLineLength = maxLineLength
    this.leadingContextLineCount = leadingContextLineCount
    this.trailingContextLineCount = trailingContextLineCount
    this.wordBreakRegex = wordBreakRegex
    if (this.maxLineLength == null) { this.maxLineLength = MAX_LINE_LENGTH }
    if (this.leadingContextLineCount == null) { this.leadingContextLineCount = LINE_COUNT_BEFORE }
    if (this.trailingContextLineCount == null) { this.trailingContextLineCount = LINE_COUNT_AFTER }
    if (this.wordBreakRegex == null) { this.wordBreakRegex = WORD_BREAK_REGEX }
  }

  /*
  Section: Searching
  */

  // Public: Search an array of paths.
  //
  // Will search with a {ChunkedExecutor} so as not to immediately exhaust all
  // the available file descriptors. The {ChunkedExecutor} will execute 20 paths
  // concurrently.
  //
  // * `regex` {RegExp} search pattern
  // * `paths` {Array} of {String} file paths to search
  // * `doneCallback` called when searching the entire array of paths has finished
  //   * `results` {Array} of Result objects in the format specified above;
  //      null when there are no results
  //   * `errors` {Array} of errors; null when there are no errors. Errors will
  //      be js Error objects with `message`, `stack`, etc.
  searchPaths (regex, paths, doneCallback) {
    let errors = null
    let results = null

    const searchPath = (filePath, pathCallback) => {
      return this.searchPath(regex, filePath, function (pathResult, error) {
        if (pathResult) {
          if (results == null) { results = [] }
          results.push(pathResult)
        }

        if (error) {
          if (errors == null) { errors = [] }
          errors.push(error)
        }

        return pathCallback()
      })
    }

    return new ChunkedExecutor(paths, searchPath).execute(() => doneCallback(results, errors))
  }

  // Public: Search a file path for a regex
  //
  // * `regex` {RegExp} search pattern
  // * `filePath` {String} file path to search
  // * `doneCallback` called when searching the entire array of paths has finished
  //   * `results` {Array} of Result objects in the format specified above;
  //      null when there are no results
  //   * `error` {Error}; null when there is no error
  searchPath (regex, filePath, doneCallback) {
    let matches = null
    let lineNumber = 0
    const reader = new ChunkedLineReader(filePath)
    let error = null

    reader.on('error', e => {
      error = e
      return this.emit('file-error', error)
    })

    // remember @leadingContextLineCount recent lines already truncated to @maxLineLength
    const recentLines = []
    // remember recent matches from the last @trailingContextLineCount lines
    const recentMatches = []

    reader.on('end', () => {
      let output
      if (matches != null ? matches.length : undefined) {
        output = { filePath, matches }
        this.emit('results-found', output)
      } else {
        this.emit('results-not-found', filePath)
      }
      return doneCallback(output, error)
    })

    reader.on('data', chunk => {
      const lines = chunk.toString().replace(TRAILING_LINE_END_REGEX, '').split(LINE_END_REGEX)
      return (() => {
        const result = []
        for (const line of Array.from(lines)) {
        // update trailingContextLines of recent matches
          var match
          if (this.trailingContextLineCount > 0) {
            for (match of Array.from(recentMatches)) {
              match.trailingContextLines.push(line.substr(0, this.maxLineLength))
            }
          }

          var lineMatches = this.searchLine(regex, line, lineNumber++)

          if (lineMatches != null) {
            if (matches == null) { matches = [] }
            for (match of Array.from(lineMatches)) {
              match.leadingContextLines = recentLines.slice(recentLines.length - this.leadingContextLineCount)
              match.trailingContextLines = []
              matches.push(match)
            }
          }

          // remove obsolete lines from recentLines
          if (this.leadingContextLineCount > 0) {
            while (recentLines.length > this.leadingContextLineCount) {
              recentLines.shift()
            }
            recentLines.push(line.substr(0, this.maxLineLength))
          }

          // remove obsolete matches from recentMatches
          if (this.trailingContextLineCount > 0) {
            while ((recentMatches.length > 0) && (recentMatches[0].range[0][0] < (lineNumber - this.trailingContextLineCount))) {
              recentMatches.shift()
            }
            if (lineMatches != null) {
              result.push((() => {
                const result1 = []
                for (match of Array.from(lineMatches)) {
                  result1.push(recentMatches.push(match))
                }
                return result1
              })())
            } else {
              result.push(undefined)
            }
          } else {
            result.push(undefined)
          }
        }
        return result
      })()
    })
  }

  searchLine (regex, line, lineNumber) {
    let matches = null
    let lineTextOffset = 0

    while (regex.test(line)) {
      var lineText
      lineTextOffset = 0
      let lineTextLength = line.length
      const matchText = RegExp.lastMatch
      const matchLength = matchText.length
      const matchIndex = regex.lastIndex - matchLength
      const matchEndIndex = regex.lastIndex

      if (lineTextLength < this.maxLineLength) {
        // The line is already short enough, we dont need to do any trimming
        lineText = line
      } else {
        // TODO: I want to break this into a function, but it needs to return the
        // new text and an offset, or an offset and a length. I am worried about
        // speed and creating a bunch of arrays just for returning from said
        // function.

        // Find the initial context around the match. This will likely break on
        // words or be too short. We will fix in the subsequent lines.
        lineTextOffset = Math.round(matchIndex - ((this.maxLineLength - matchLength) / 2))
        let lineTextEndOffset = lineTextOffset + this.maxLineLength

        if (lineTextOffset <= 0) {
          // The match is near the beginning of the line, so we expand the right
          lineTextOffset = 0
          lineTextEndOffset = this.maxLineLength
        } else if (lineTextEndOffset > (lineTextLength - 2)) {
          // The match is near the end of the line, so we expand to the left
          lineTextEndOffset = lineTextLength - 1
          lineTextOffset = lineTextEndOffset - this.maxLineLength
        }

        // We dont want the line to break a word, so expand to the word boundaries
        lineTextOffset = this.findWordBreak(line, lineTextOffset, -1)
        lineTextEndOffset = this.findWordBreak(line, lineTextEndOffset, 1) + 1

        // Trim the text and give the contexualized line to the user
        lineTextLength = lineTextEndOffset - lineTextOffset
        lineText = line.substr(lineTextOffset, lineTextLength)
      }

      const range = [[lineNumber, matchIndex], [lineNumber, matchEndIndex]]
      if (matches == null) { matches = [] }
      matches.push({ matchText, lineText, lineTextOffset, range })
    }

    regex.lastIndex = 0
    return matches
  }

  findWordBreak (line, offset, increment) {
    let i = offset
    const len = line.length
    const maxIndex = len - 1

    while ((i < len) && (i >= 0)) {
      const checkIndex = i + increment
      if (this.wordBreakRegex.test(line[checkIndex])) { return i }
      i = checkIndex
    }

    if (i < 0) { return 0 }
    if (i > maxIndex) { return maxIndex }
    return i
  }
})

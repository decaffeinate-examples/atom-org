/** @babel */
/* eslint-disable
    no-return-assign,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Scanner
const { OnigScanner } = require('oniguruma')

// Wrapper class for {OnigScanner} that caches them based on the presence of any
// anchor characters that change based on the current position being scanned.
//
// See {Pattern::replaceAnchor} for more details.
module.exports =
(Scanner = class Scanner {
  constructor (patterns) {
    if (patterns == null) { patterns = [] }
    this.patterns = patterns
    this.anchored = false
    for (const pattern of Array.from(this.patterns)) {
      if (pattern.anchored) {
        this.anchored = true
        break
      }
    }

    this.anchoredScanner = null
    this.firstLineAnchoredScanner = null
    this.firstLineScanner = null
    this.scanner = null
  }

  // Create a new {OnigScanner} with the given options.
  createScanner (firstLine, position, anchorPosition) {
    let scanner
    const patterns = this.patterns.map(pattern => pattern.getRegex(firstLine, position, anchorPosition))
    return scanner = new OnigScanner(patterns)
  }

  // Get the {OnigScanner} for the given position and options.
  getScanner (firstLine, position, anchorPosition) {
    if (!this.anchored) {
      if (this.scanner == null) { this.scanner = this.createScanner(firstLine, position, anchorPosition) }
      return this.scanner
    }

    if (firstLine) {
      if (position === anchorPosition) {
        return this.firstLineAnchoredScanner != null ? this.firstLineAnchoredScanner : (this.firstLineAnchoredScanner = this.createScanner(firstLine, position, anchorPosition))
      } else {
        return this.firstLineScanner != null ? this.firstLineScanner : (this.firstLineScanner = this.createScanner(firstLine, position, anchorPosition))
      }
    } else if (position === anchorPosition) {
      return this.anchoredScanner != null ? this.anchoredScanner : (this.anchoredScanner = this.createScanner(firstLine, position, anchorPosition))
    } else {
      return this.scanner != null ? this.scanner : (this.scanner = this.createScanner(firstLine, position, anchorPosition))
    }
  }

  // Public: Find the next match on the line start at the given position
  //
  // line - the string being scanned.
  // firstLine - true if the first line is being scanned.
  // position - numeric position to start scanning at.
  // anchorPosition - numeric position of the last anchored match.
  //
  // Returns an Object with details about the match or null if no match found.
  findNextMatch (line, firstLine, position, anchorPosition) {
    const scanner = this.getScanner(firstLine, position, anchorPosition)
    const match = scanner.findNextMatchSync(line, position)
    if (match != null) {
      match.scanner = this
    }
    return match
  }

  // Public: Handle the given match by calling `handleMatch` on the
  // matched {Pattern}.
  //
  // match - An object returned from a previous call to `findNextMatch`.
  // stack - An array of {Rule} objects.
  // line - The string being scanned.
  // rule - The rule that matched.
  // endPatternMatch - true if the rule's end pattern matched.
  //
  // Returns an array of tokens representing the match.
  handleMatch (match, stack, line, rule, endPatternMatch) {
    const pattern = this.patterns[match.index]
    return pattern.handleMatch(stack, line, match.captureIndices, rule, endPatternMatch)
  }
})

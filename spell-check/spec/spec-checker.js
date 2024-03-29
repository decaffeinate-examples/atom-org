/** @babel */
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// This is functionally identical to the known words checker except that it
// is intended to be immutable while running tests. This means the constructor
// adds the words instead of calling `add` directly.
class SpecChecker {
  static initClass () {
    this.prototype.spelling = null
    this.prototype.checker = null
  }

  constructor (id, isNegative, knownWords) {
    // Set up the spelling manager we'll be using.
    this.id = id
    this.isNegative = isNegative
    const spellingManager = require('spelling-manager')
    this.spelling = new spellingManager.TokenSpellingManager()
    this.checker = new spellingManager.BufferSpellingChecker(this.spelling)

    // Set our known words.
    this.setKnownWords(knownWords)
  }

  deactivate () {
  }

  getId () { return 'spell-check:spec:' + this.id }
  getName () { return 'Spec Checker' }
  getPriority () { return 10 }
  isEnabled () { return true }
  getStatus () { return 'Working correctly.' }
  providesSpelling (args) { return true }
  providesSuggestions (args) { return false }
  providesAdding (args) { return false }

  check (args, text) {
    const ranges = []
    const checked = this.checker.check(text)
    for (const token of Array.from(checked)) {
      if (token.status === 1) {
        ranges.push({ start: token.start, end: token.end })
      }
    }

    if (this.isNegative) {
      return { incorrect: ranges }
    } else {
      return { correct: ranges }
    }
  }

  setKnownWords (knownWords) {
    // Clear out the old list.
    this.spelling.sensitive = {}
    this.spelling.insensitive = {}

    // Add the new ones into the list.
    if (knownWords) {
      return Array.from(knownWords).map((ignore) =>
        this.spelling.add(ignore))
    }
  }
}
SpecChecker.initClass()

module.exports = SpecChecker

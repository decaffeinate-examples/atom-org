/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ScopeSelector;
const ScopeSelectorParser = require('../lib/scope-selector-parser');

module.exports =
(ScopeSelector = class ScopeSelector {
  // Create a new scope selector.
  //
  // source - A {String} to parse as a scope selector.
  constructor(source) { this.matcher = ScopeSelectorParser.parse(source); }

  // Check if this scope selector matches the scopes.
  //
  // scopes - An {Array} of {String}s or a single {String}.
  //
  // Returns a {Boolean}.
  matches(scopes) {
    if (typeof scopes === 'string') { scopes = [scopes]; }
    return this.matcher.matches(scopes);
  }

  // Gets the prefix of this scope selector.
  //
  // scopes - An {Array} of {String}s or a single {String}.
  //
  // Returns a {String} if there is a prefix or undefined otherwise.
  getPrefix(scopes) {
    if (typeof scopes === 'string') { scopes = [scopes]; }
    return this.matcher.getPrefix(scopes);
  }

  // Convert this TextMate scope selector to a CSS selector.
  //
  // Returns a {String}.
  toCssSelector() { return this.matcher.toCssSelector(); }

  // Convert this TextMate scope selector to a CSS selector, prefixing scopes with `syntax--`.
  //
  // Returns a {String}.
  toCssSyntaxSelector() { return this.matcher.toCssSyntaxSelector(); }
});

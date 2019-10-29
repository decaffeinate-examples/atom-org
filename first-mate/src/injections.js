/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Injections;
const _ = require('underscore-plus');

const Scanner = require('./scanner');
const ScopeSelector = require('./scope-selector');

module.exports =
(Injections = class Injections {
  constructor(grammar, injections) {
    this.grammar = grammar;
    if (injections == null) { injections = {}; }
    this.injections = [];
    this.scanners = {};
    for (let selector in injections) {
      const values = injections[selector];
      if (!(__guard__(values != null ? values.patterns : undefined, x => x.length) > 0)) { continue; }
      const patterns = [];
      for (let regex of Array.from(values.patterns)) {
        const pattern = this.grammar.createPattern(regex);
        patterns.push(...Array.from(pattern.getIncludedPatterns(this.grammar, patterns) || []));
      }
      this.injections.push({
        selector: new ScopeSelector(selector),
        patterns
      });
    }
  }

  getScanner(injection) {
    if (injection.scanner != null) { return injection.scanner; }

    const scanner = new Scanner(injection.patterns);
    injection.scanner = scanner;
    return scanner;
  }

  getScanners(ruleStack) {
    if (this.injections.length === 0) { return []; }

    const scanners = [];
    const scopes = this.grammar.scopesFromStack(ruleStack);
    for (let injection of Array.from(this.injections)) {
      if (injection.selector.matches(scopes)) {
        const scanner = this.getScanner(injection);
        scanners.push(scanner);
      }
    }
    return scanners;
  }
});

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
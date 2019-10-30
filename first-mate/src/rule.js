/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Rule;
const _ = require('underscore-plus');

const Scanner = require('./scanner');

module.exports =
(Rule = class Rule {
  constructor(grammar, registry, param) {
    this.grammar = grammar;
    this.registry = registry;
    if (param == null) { param = {}; }
    const {scopeName, contentScopeName, patterns, endPattern, applyEndPatternLast} = param;
    this.scopeName = scopeName;
    this.contentScopeName = contentScopeName;
    this.endPattern = endPattern;
    this.applyEndPatternLast = applyEndPatternLast;
    this.patterns = [];
    for (let pattern of Array.from(patterns != null ? patterns : [])) {
      if (!pattern.disabled) { this.patterns.push(this.grammar.createPattern(pattern)); }
    }

    if (this.endPattern && !this.endPattern.hasBackReferences) {
      if (this.applyEndPatternLast) {
        this.patterns.push(this.endPattern);
      } else {
        this.patterns.unshift(this.endPattern);
      }
    }

    this.scannersByBaseGrammarName = {};
    this.createEndPattern = null;
    this.anchorPosition = -1;
  }

  getIncludedPatterns(baseGrammar, included) {
    if (included == null) { included = []; }
    if (_.include(included, this)) { return []; }

    included = included.concat([this]);
    const allPatterns = [];
    for (let pattern of Array.from(this.patterns)) {
      allPatterns.push(...Array.from(pattern.getIncludedPatterns(baseGrammar, included) || []));
    }
    return allPatterns;
  }

  clearAnchorPosition() { return this.anchorPosition = -1; }

  getScanner(baseGrammar) {
    let scanner;
    if (scanner = this.scannersByBaseGrammarName[baseGrammar.name]) { return scanner; }

    const patterns = this.getIncludedPatterns(baseGrammar);
    scanner = new Scanner(patterns);
    this.scannersByBaseGrammarName[baseGrammar.name] = scanner;
    return scanner;
  }

  scanInjections(ruleStack, line, position, firstLine) {
    let injections;
    const baseGrammar = ruleStack[0].rule.grammar;
    if (injections = baseGrammar.injections) {
      for (let scanner of Array.from(injections.getScanners(ruleStack))) {
        const result = scanner.findNextMatch(line, firstLine, position, this.anchorPosition);
        if (result != null) { return result; }
      }
    }
  }

  normalizeCaptureIndices(line, captureIndices) {
    const lineLength = line.length;
    for (let capture of Array.from(captureIndices)) {
      capture.end = Math.min(capture.end, lineLength);
      capture.start = Math.min(capture.start, lineLength);
    }
  }

  findNextMatch(ruleStack, lineWithNewline, position, firstLine) {
    let result;
    const baseGrammar = ruleStack[0].rule.grammar;
    const results = [];

    let scanner = this.getScanner(baseGrammar);
    if (result = scanner.findNextMatch(lineWithNewline, firstLine, position, this.anchorPosition)) {
      results.push(result);
    }

    if (result = this.scanInjections(ruleStack, lineWithNewline, position, firstLine)) {
      for (let injection of Array.from(baseGrammar.injections.injections)) {
        if (injection.scanner === result.scanner) {
          if (injection.selector.getPrefix(this.grammar.scopesFromStack(ruleStack)) === 'L') {
            results.unshift(result);
          } else {
            // TODO: Prefixes can either be L, B, or R.
            // R is assumed to mean "right", which is the default (add to end of stack).
            // There's no documentation on B, however.
            results.push(result);
          }
        }
      }
    }

    let scopes = null;
    for (let injectionGrammar of Array.from(this.registry.injectionGrammars)) {
      if (injectionGrammar === this.grammar) { continue; }
      if (injectionGrammar === baseGrammar) { continue; }
      if (scopes == null) { scopes = this.grammar.scopesFromStack(ruleStack); }
      if (injectionGrammar.injectionSelector.matches(scopes)) {
        scanner = injectionGrammar.getInitialRule().getScanner(injectionGrammar, position, firstLine);
        if (result = scanner.findNextMatch(lineWithNewline, firstLine, position, this.anchorPosition)) {
          if (injectionGrammar.injectionSelector.getPrefix(scopes) === 'L') {
            results.unshift(result);
          } else {
            // TODO: Prefixes can either be L, B, or R.
            // R is assumed to mean "right", which is the default (add to end of stack).
            // There's no documentation on B, however.
            results.push(result);
          }
        }
      }
    }

    if (results.length > 1) {
      return _.min(results, result => {
        this.normalizeCaptureIndices(lineWithNewline, result.captureIndices);
        return result.captureIndices[0].start;
      });
    } else if (results.length === 1) {
      [result] = Array.from(results);
      this.normalizeCaptureIndices(lineWithNewline, result.captureIndices);
      return result;
    }
  }

  getNextTags(ruleStack, line, lineWithNewline, position, firstLine) {
    let nextTags;
    const result = this.findNextMatch(ruleStack, lineWithNewline, position, firstLine);
    if (result == null) { return null; }

    const {index, captureIndices, scanner} = result;
    const [firstCapture] = Array.from(captureIndices);
    const endPatternMatch = this.endPattern === scanner.patterns[index];
    if (nextTags = scanner.handleMatch(result, ruleStack, line, this, endPatternMatch)) {
      return {nextTags, tagsStart: firstCapture.start, tagsEnd: firstCapture.end};
    }
  }

  getRuleToPush(line, beginPatternCaptureIndices) {
    if (this.endPattern.hasBackReferences) {
      const rule = this.grammar.createRule({scopeName: this.scopeName, contentScopeName: this.contentScopeName});
      rule.endPattern = this.endPattern.resolveBackReferences(line, beginPatternCaptureIndices);
      rule.patterns = [rule.endPattern, ...Array.from(this.patterns)];
      return rule;
    } else {
      return this;
    }
  }
});

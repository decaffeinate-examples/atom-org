_ = require 'underscore-plus'

Scanner = require './scanner'
ScopeSelector = require './scope-selector'

module.exports =
class Injections
  constructor: (@grammar, injections={}) ->
    @injections = []
    @scanners = {}
    for selector, values of injections
      continue unless values?.patterns?.length > 0
      patterns = []
      for regex in values.patterns
        pattern = @grammar.createPattern(regex)
        patterns.push(pattern.getIncludedPatterns(@grammar, patterns)...)
      @injections.push
        selector: new ScopeSelector(selector)
        patterns: patterns

  getScanner: (injection) ->
    return injection.scanner if injection.scanner?

    scanner = new Scanner(injection.patterns)
    injection.scanner = scanner
    scanner

  getScanners: (ruleStack) ->
    return [] if @injections.length is 0

    scanners = []
    scopes = @grammar.scopesFromStack(ruleStack)
    for injection in @injections when injection.selector.matches(scopes)
      scanner = @getScanner(injection)
      scanners.push(scanner)
    scanners

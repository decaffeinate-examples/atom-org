_ = require 'underscore-plus'

Scanner = require './scanner'

module.exports =
class Rule
  constructor: (@grammar, @registry, {@scopeName, @contentScopeName, patterns, @endPattern, @applyEndPatternLast}={}) ->
    @patterns = []
    for pattern in patterns ? []
      @patterns.push(@grammar.createPattern(pattern)) unless pattern.disabled

    if @endPattern and not @endPattern.hasBackReferences
      if @applyEndPatternLast
        @patterns.push(@endPattern)
      else
        @patterns.unshift(@endPattern)

    @scannersByBaseGrammarName = {}
    @createEndPattern = null
    @anchorPosition = -1

  getIncludedPatterns: (baseGrammar, included=[]) ->
    return [] if _.include(included, this)

    included = included.concat([this])
    allPatterns = []
    for pattern in @patterns
      allPatterns.push(pattern.getIncludedPatterns(baseGrammar, included)...)
    allPatterns

  clearAnchorPosition: -> @anchorPosition = -1

  getScanner: (baseGrammar) ->
    return scanner if scanner = @scannersByBaseGrammarName[baseGrammar.name]

    patterns = @getIncludedPatterns(baseGrammar)
    scanner = new Scanner(patterns)
    @scannersByBaseGrammarName[baseGrammar.name] = scanner
    scanner

  scanInjections: (ruleStack, line, position, firstLine) ->
    baseGrammar = ruleStack[0].rule.grammar
    if injections = baseGrammar.injections
      for scanner in injections.getScanners(ruleStack)
        result = scanner.findNextMatch(line, firstLine, position, @anchorPosition)
        return result if result?

  normalizeCaptureIndices: (line, captureIndices) ->
    lineLength = line.length
    for capture in captureIndices
      capture.end = Math.min(capture.end, lineLength)
      capture.start = Math.min(capture.start, lineLength)
    return

  findNextMatch: (ruleStack, lineWithNewline, position, firstLine) ->
    baseGrammar = ruleStack[0].rule.grammar
    results = []

    scanner = @getScanner(baseGrammar)
    if result = scanner.findNextMatch(lineWithNewline, firstLine, position, @anchorPosition)
      results.push(result)

    if result = @scanInjections(ruleStack, lineWithNewline, position, firstLine)
      for injection in baseGrammar.injections.injections
        if injection.scanner is result.scanner
          if injection.selector.getPrefix(@grammar.scopesFromStack(ruleStack)) is 'L'
            results.unshift(result)
          else
            # TODO: Prefixes can either be L, B, or R.
            # R is assumed to mean "right", which is the default (add to end of stack).
            # There's no documentation on B, however.
            results.push(result)

    scopes = null
    for injectionGrammar in @registry.injectionGrammars
      continue if injectionGrammar is @grammar
      continue if injectionGrammar is baseGrammar
      scopes ?= @grammar.scopesFromStack(ruleStack)
      if injectionGrammar.injectionSelector.matches(scopes)
        scanner = injectionGrammar.getInitialRule().getScanner(injectionGrammar, position, firstLine)
        if result = scanner.findNextMatch(lineWithNewline, firstLine, position, @anchorPosition)
          if injectionGrammar.injectionSelector.getPrefix(scopes) is 'L'
            results.unshift(result)
          else
            # TODO: Prefixes can either be L, B, or R.
            # R is assumed to mean "right", which is the default (add to end of stack).
            # There's no documentation on B, however.
            results.push(result)

    if results.length > 1
      _.min results, (result) =>
        @normalizeCaptureIndices(lineWithNewline, result.captureIndices)
        result.captureIndices[0].start
    else if results.length is 1
      [result] = results
      @normalizeCaptureIndices(lineWithNewline, result.captureIndices)
      result

  getNextTags: (ruleStack, line, lineWithNewline, position, firstLine) ->
    result = @findNextMatch(ruleStack, lineWithNewline, position, firstLine)
    return null unless result?

    {index, captureIndices, scanner} = result
    [firstCapture] = captureIndices
    endPatternMatch = @endPattern is scanner.patterns[index]
    if nextTags = scanner.handleMatch(result, ruleStack, line, this, endPatternMatch)
      {nextTags, tagsStart: firstCapture.start, tagsEnd: firstCapture.end}

  getRuleToPush: (line, beginPatternCaptureIndices) ->
    if @endPattern.hasBackReferences
      rule = @grammar.createRule({@scopeName, @contentScopeName})
      rule.endPattern = @endPattern.resolveBackReferences(line, beginPatternCaptureIndices)
      rule.patterns = [rule.endPattern, @patterns...]
      rule
    else
      this

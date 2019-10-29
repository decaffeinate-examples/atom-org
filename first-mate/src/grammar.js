/** @babel */
/* eslint-disable
    no-cond-assign,
    no-return-assign,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Grammar
const path = require('path')

const _ = require('underscore-plus')
const fs = require('fs-plus')
const { OnigRegExp, OnigString } = require('oniguruma')
const { Emitter } = require('event-kit')
const Grim = require('grim')

const Injections = require('./injections')
const Pattern = require('./pattern')
const Rule = require('./rule')
const ScopeSelector = require('./scope-selector')

// Extended: Grammar that tokenizes lines of text.
//
// This class should not be instantiated directly but instead obtained from
// a {GrammarRegistry} by calling {GrammarRegistry::loadGrammar}.
module.exports =
(Grammar = (function () {
  Grammar = class Grammar {
    static initClass () {
      this.prototype.registration = null
    }

    constructor (registry, options) {
      this.registry = registry
      if (options == null) { options = {} }
      ({ name: this.name, fileTypes: this.fileTypes, scopeName: this.scopeName, foldingStopMarker: this.foldingStopMarker, maxTokensPerLine: this.maxTokensPerLine, maxLineLength: this.maxLineLength } = options)
      const { injections, injectionSelector, patterns, repository, firstLineMatch, contentRegex } = options

      this.emitter = new Emitter()
      this.repository = null
      this.initialRule = null

      if (injectionSelector != null) {
        this.injectionSelector = new ScopeSelector(injectionSelector)
      } else {
        this.injectionSelector = null
      }

      if (firstLineMatch) {
        this.firstLineRegex = new OnigRegExp(firstLineMatch)
      } else {
        this.firstLineRegex = null
      }

      if (contentRegex) {
        this.contentRegex = new OnigRegExp(contentRegex)
      } else {
        this.contentRegex = null
      }

      if (this.fileTypes == null) { this.fileTypes = [] }
      this.includedGrammarScopes = []

      this.rawPatterns = patterns
      this.rawRepository = repository
      this.rawInjections = injections

      this.updateRules()
    }

    /*
    Section: Event Subscription
    */

    // Public: Invoke the given callback when this grammar is updated due to a
    // grammar it depends on being added or removed from the registry.
    //
    // * `callback` {Function} to call when this grammar is updated.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
    onDidUpdate (callback) {
      return this.emitter.on('did-update', callback)
    }

    /*
    Section: Tokenizing
    */

    // Public: Tokenize all lines in the given text.
    //
    // * `text` A {String} containing one or more lines.
    //
    // Returns an {Array} of token arrays for each line tokenized.
    tokenizeLines (text, compatibilityMode) {
      if (compatibilityMode == null) { compatibilityMode = true }
      const lines = text.split('\n')
      const lastLine = lines.length - 1
      let ruleStack = null

      const scopes = []
      return (() => {
        const result = []
        for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
          let tags
          const line = lines[lineNumber];
          ({ tags, ruleStack } = this.tokenizeLine(line, ruleStack, lineNumber === 0, compatibilityMode, lineNumber !== lastLine))
          result.push(this.registry.decodeTokens(line, tags, scopes))
        }
        return result
      })()
    }

    // Public: Tokenize the line of text.
    //
    // * `line` A {String} of text to tokenize.
    // * `ruleStack` An optional {Array} of rules previously returned from this
    //   method. This should be null when tokenizing the first line in the file.
    // * `firstLine` A optional {Boolean} denoting whether this is the first line
    //   in the file which defaults to `false`. This should be `true`
    //   when tokenizing the first line in the file.
    //
    // Returns an {Object} containing the following properties:
    // * `line` The {String} of text that was tokenized.
    // * `tags` An {Array} of integer scope ids and strings. Positive ids
    //   indicate the beginning of a scope, and negative tags indicate the end.
    //   To resolve ids to scope names, call {GrammarRegistry::scopeForId} with the
    //   absolute value of the id.
    // * `tokens` This is a dynamic property. Invoking it will incur additional
    //   overhead, but will automatically translate the `tags` into token objects
    //   with `value` and `scopes` properties.
    // * `ruleStack` An {Array} of rules representing the tokenized state at the
    //   end of the line. These should be passed back into this method when
    //   tokenizing the next line in the file.
    tokenizeLine (inputLine, ruleStack, firstLine, compatibilityMode, appendNewLine) {
      let contentScopeName, line, openScopeTags, scopeName
      if (firstLine == null) { firstLine = false }
      if (compatibilityMode == null) { compatibilityMode = true }
      if (appendNewLine == null) { appendNewLine = true }
      const tags = []

      let truncatedLine = false
      if (inputLine.length > this.maxLineLength) {
        line = inputLine.slice(0, this.maxLineLength)
        truncatedLine = true
      } else {
        line = inputLine
      }

      const string = new OnigString(line)
      const stringWithNewLine = appendNewLine ? new OnigString(line + '\n') : string

      if (ruleStack != null) {
        ruleStack = ruleStack.slice()
        if (compatibilityMode) {
          openScopeTags = []
          for ({ scopeName, contentScopeName } of Array.from(ruleStack)) {
            if (scopeName) { openScopeTags.push(this.registry.startIdForScope(scopeName)) }
            if (contentScopeName) { openScopeTags.push(this.registry.startIdForScope(contentScopeName)) }
          }
        }
      } else {
        if (compatibilityMode) { openScopeTags = [] }
        ({ scopeName, contentScopeName } = this.initialRule)
        ruleStack = [{ rule: this.initialRule, scopeName, contentScopeName }]
        if (scopeName) { tags.push(this.startIdForScope(this.initialRule.scopeName)) }
        if (contentScopeName) { tags.push(this.startIdForScope(this.initialRule.contentScopeName)) }
      }

      const initialRuleStackLength = ruleStack.length
      let position = 0
      let tokenCount = 0

      while (true) {
        var match
        const previousRuleStackLength = ruleStack.length
        const previousPosition = position

        if (position > line.length) { break }

        if (tokenCount >= (this.getMaxTokensPerLine() - 1)) {
          truncatedLine = true
          break
        }

        if (match = _.last(ruleStack).rule.getNextTags(ruleStack, string, stringWithNewLine, position, firstLine)) {
          const { nextTags, tagsStart, tagsEnd } = match

          // Unmatched text before next tags
          if (position < tagsStart) {
            tags.push(tagsStart - position)
            tokenCount++
          }

          tags.push(...Array.from(nextTags || []))
          for (const tag of Array.from(nextTags)) { if (tag >= 0) { tokenCount++ } }
          position = tagsEnd
        } else {
          // Push filler token for unmatched text at end of line
          if ((position < line.length) || (line.length === 0)) {
            tags.push(line.length - position)
          }
          break
        }

        if (position === previousPosition) {
          if (ruleStack.length === previousRuleStackLength) {
            console.error(`Popping rule because it loops at column ${position} of line '${line}'`, _.clone(ruleStack))
            if (ruleStack.length > 1) {
              ({ scopeName, contentScopeName } = ruleStack.pop())
              if (contentScopeName) { tags.push(this.endIdForScope(contentScopeName)) }
              if (scopeName) { tags.push(this.endIdForScope(scopeName)) }
            } else {
              if ((position < line.length) || ((line.length === 0) && (tags.length === 0))) {
                tags.push(line.length - position)
              }
              break
            }
          } else if (ruleStack.length > previousRuleStackLength) { // Stack size increased with zero length match
            var popStack
            const [{ rule: penultimateRule }, { rule: lastRule }] = Array.from(ruleStack.slice(-2))

            // Same exact rule was pushed but position wasn't advanced
            if ((lastRule != null) && (lastRule === penultimateRule)) {
              popStack = true
            }

            // Rule with same scope name as previous rule was pushed but position wasn't advanced
            if (((lastRule != null ? lastRule.scopeName : undefined) != null) && (penultimateRule.scopeName === lastRule.scopeName)) {
              popStack = true
            }

            if (popStack) {
              ruleStack.pop()
              const lastSymbol = _.last(tags)
              if ((lastSymbol < 0) && (lastSymbol === this.startIdForScope(lastRule.scopeName))) {
                tags.pop() // also pop the duplicated start scope if it was pushed
              }
              tags.push(line.length - position)
              break
            }
          }
        }
      }

      if (truncatedLine) {
        const tagCount = tags.length
        if (tags[tagCount - 1] > 0) {
          tags[tagCount - 1] += inputLine.length - position
        } else {
          tags.push(inputLine.length - position)
        }
        while (ruleStack.length > initialRuleStackLength) {
          ({ scopeName, contentScopeName } = ruleStack.pop())
          if (contentScopeName) { tags.push(this.endIdForScope(contentScopeName)) }
          if (scopeName) { tags.push(this.endIdForScope(scopeName)) }
        }
      }

      for (const { rule } of Array.from(ruleStack)) { rule.clearAnchorPosition() }

      if (compatibilityMode) {
        return new TokenizeLineResult(inputLine, openScopeTags, tags, ruleStack, this.registry)
      } else {
        return { line: inputLine, tags, ruleStack }
      }
    }

    activate () {
      return this.registration = this.registry.addGrammar(this)
    }

    deactivate () {
      this.emitter = new Emitter()
      if (this.registration != null) {
        this.registration.dispose()
      }
      return this.registration = null
    }

    updateRules () {
      this.initialRule = this.createRule({ scopeName: this.scopeName, patterns: this.rawPatterns })
      this.repository = this.createRepository()
      return this.injections = new Injections(this, this.rawInjections)
    }

    getInitialRule () { return this.initialRule }

    getRepository () { return this.repository }

    createRepository () {
      const repository = {}
      for (const name in this.rawRepository) {
        let data = this.rawRepository[name]
        if ((data.begin != null) || (data.match != null)) { data = { patterns: [data], tempName: name } }
        repository[name] = this.createRule(data)
      }
      return repository
    }

    addIncludedGrammarScope (scope) {
      if (!_.include(this.includedGrammarScopes, scope)) { return this.includedGrammarScopes.push(scope) }
    }

    grammarUpdated (scopeName) {
      if (!_.include(this.includedGrammarScopes, scopeName)) { return false }
      this.updateRules()
      this.registry.grammarUpdated(this.scopeName)
      if (Grim.includeDeprecatedAPIs) { this.emit('grammar-updated') }
      this.emitter.emit('did-update')
      return true
    }

    startIdForScope (scope) { return this.registry.startIdForScope(scope) }

    endIdForScope (scope) { return this.registry.endIdForScope(scope) }

    scopeForId (id) { return this.registry.scopeForId(id) }

    createRule (options) { return new Rule(this, this.registry, options) }

    createPattern (options) { return new Pattern(this, this.registry, options) }

    getMaxTokensPerLine () {
      return this.maxTokensPerLine
    }

    scopesFromStack (stack, rule, endPatternMatch) {
      let scopeName
      let contentScopeName
      const scopes = []
      for ({ scopeName, contentScopeName } of Array.from(stack)) {
        if (scopeName) { scopes.push(scopeName) }
        if (contentScopeName) { scopes.push(contentScopeName) }
      }

      // Pop the last content name scope if the end pattern at the top of the stack
      // was matched since only text between the begin/end patterns should have the
      // content name scope
      if (endPatternMatch && (rule != null ? rule.contentScopeName : undefined) && (rule === stack[stack.length - 1])) {
        scopes.pop()
      }

      return scopes
    }
  }
  Grammar.initClass()
  return Grammar
})())

if (Grim.includeDeprecatedAPIs) {
  const EmitterMixin = require('emissary').Emitter
  EmitterMixin.includeInto(Grammar)

  Grammar.prototype.on = function (eventName) {
    if (eventName === 'did-update') {
      Grim.deprecate('Call Grammar::onDidUpdate instead')
    } else {
      Grim.deprecate('Call explicit event subscription methods instead')
    }

    return EmitterMixin.prototype.on.apply(this, arguments)
  }
}

class TokenizeLineResult {
  static initClass () {
    Object.defineProperty(this.prototype, 'tokens', {
      get () {
        return this.registry.decodeTokens(this.line, this.tags, this.openScopeTags)
      }
    }
    )
  }

  constructor (line, openScopeTags, tags, ruleStack, registry) {
    this.line = line
    this.openScopeTags = openScopeTags
    this.tags = tags
    this.ruleStack = ruleStack
    this.registry = registry
  }
}
TokenizeLineResult.initClass()

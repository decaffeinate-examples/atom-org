slick = require 'atom-slick'

indexCounter = 0

module.exports =
class Selector
  # Public: Creates one or more {Selector} objects.
  #
  # This method will return more than one `Selector` object when the string
  # selector describes more than one object. e.g. `.foo.bar, .omg.wow`
  #
  # * `selectorString` {String} CSS selector. e.g. `.foo .bar`
  # * `options` {Object} (optional)
  #   * `priority` {Number} (optional)
  #
  # Returns an {Array} or {Selector} objects.
  @create: (selectorString, options) ->
    for selectorAst in slick.parse(selectorString)
      @parsePseudoSelectors(selectorComponent) for selectorComponent in selectorAst
      new this(selectorAst, options)

  @parsePseudoSelectors: (selectorComponent) ->
    return unless selectorComponent.pseudos?
    for pseudoClass in selectorComponent.pseudos
      if pseudoClass.name is 'not'
        selectorComponent.notSelectors ?= []
        selectorComponent.notSelectors.push(@create(pseudoClass.value)...)
      else
        console.warn "Unsupported pseudo-selector: #{pseudoClass.name}"

  constructor: (@selector, options) ->
    priority = options?.priority ? 0
    @specificity = @calculateSpecificity()
    @index = priority + indexCounter++

  # Public: Returns a {Boolean} indcating whether or not this `Selector` matches
  # the given scope chain.
  #
  # * `scopeChain` {String} e.g. `.parent .child`
  matches: (scopeChain) ->
    if typeof scopeChain is 'string'
      [scopeChain] = slick.parse(scopeChain)
      return false unless scopeChain?

    selectorIndex = @selector.length - 1
    scopeIndex = scopeChain.length - 1

    requireMatch = true
    while selectorIndex >= 0 and scopeIndex >= 0
      if @selectorComponentMatchesScope(@selector[selectorIndex], scopeChain[scopeIndex])
        requireMatch = @selector[selectorIndex].combinator is '>'
        selectorIndex--
      else if requireMatch
        return false

      scopeIndex--

    selectorIndex < 0

  # Public: Compare specificity to another {Selector} object
  #
  # * `other` {Selector} object
  #
  # Returns a {Number}
  compare: (other) ->
    if other.specificity is @specificity
      other.index - @index
    else
      other.specificity - @specificity

  # Public: Returns {Boolean} if the selectors are equal.
  #
  # * `other` {Selector} object
  isEqual: (other) ->
    @toString() is other.toString()

  # Public: Returns a {String} representation of the object
  toString: ->
    @selector.toString().replace(/\*\./g, '.')

  # Public: Returns {Number} specificity
  getSpecificity: ->
    @specificity

  ###
  Section: Private Member Methods
  ###

  selectorComponentMatchesScope: (selectorComponent, scope) ->
    if selectorComponent.classList?
      for className in selectorComponent.classList
        return false unless scope.classes?[className]?

    if selectorComponent.tag?
      return false unless selectorComponent.tag is scope.tag or selectorComponent.tag is '*'

    if selectorComponent.attributes?
      scopeAttributes = {}
      for attribute in scope.attributes ? []
        scopeAttributes[attribute.name] = attribute
      for attribute in selectorComponent.attributes
        return false unless scopeAttributes[attribute.name]?.value is attribute.value

    if selectorComponent.notSelectors?
      for selector in selectorComponent.notSelectors
        return false if selector.matches([scope])

    true

  calculateSpecificity: ->
    a = 0
    b = 0
    c = 0

    for selectorComponent in @selector
      if selectorComponent.classList?
        b += selectorComponent.classList.length

      if selectorComponent.attributes?
        b += selectorComponent.attributes.length

      if selectorComponent.tag?
        c += 1

    (a * 100) + (b * 10) + (c * 1)

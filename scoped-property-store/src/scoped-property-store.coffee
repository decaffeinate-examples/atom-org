slick = require 'atom-slick'
_ = require 'underscore-plus'
{getValueAtKeyPath} = require 'key-path-helpers'
{includeDeprecatedAPIs, deprecate} = require 'grim'
{Disposable, CompositeDisposable} = require 'event-kit'
Selector = require './selector'
PropertySet = require './property-set'
{isPlainObject, checkValueAtKeyPath, deepDefaults, deepClone} = require './helpers'

# Public:
module.exports =
class ScopedPropertyStore
  constructor: ->
    @cache = {}
    @propertySets = []
    @escapeCharacterRegex = /[-!"#$%&'*+,/:;=?@|^~()<>{}[\]]/g

  # Public: Add scoped properties to be queried with {::get}
  #
  # * `source` A string describing these properties to allow them to be removed
  #   later.
  # * `propertiesBySelector` An {Object} containing CSS-selectors mapping to
  #   {Objects} containing properties. For example: `{'.foo .bar': {x: 1, y: 2}`
  #
  # Returns a {Disposable} on which you can call `.dispose()` to remove the
  # added properties.
  addProperties: (source, propertiesBySelector, options) ->
    @bustCache()
    compositeDisposable = new CompositeDisposable
    for selectorSource, properties of propertiesBySelector
      for selector in Selector.create(selectorSource, options)
        compositeDisposable.add @addPropertySet(new PropertySet(source, selector, properties))
    @propertySets.sort (a, b) -> a.compare(b)
    compositeDisposable

  # Public: Get the value of a previously stored key-path in a given scope.
  #
  # * `scopeChain` This describes a location in the document. It uses the same
  #   syntax as selectors, with each space-separated component representing one
  #   element.
  # * `keyPath` A `.` separated string of keys to traverse in the properties.
  # * `options` (optional) {Object}
  #   * `sources` (optional) {Array} of {String} source names. If provided, only
  #     values that were associated with these sources during {::addProperties}
  #     will be used.
  #   * `excludeSources` (optional) {Array} of {String} source names. If provided,
  #     values that  were associated with these sources during {::addProperties}
  #     will not be used.
  #
  # Returns the property value or `undefined` if none is found.
  getPropertyValue: (scopeChain, keyPath, options) ->
    {sources, excludeSources} = options if options?

    @withCaching "getPropertyValue:#{scopeChain}:#{keyPath}", (sources? or excludeSources?), =>
      scopes = @parseScopeChain(scopeChain)
      mergedValue = undefined
      hasMergedValue = false

      while scopes.length > 0
        for set in @propertySets
          continue if excludeSources? and (set.source in excludeSources)
          continue if sources? and not (set.source in sources)

          if set.matches(scopes)
            [value, hasValue] = checkValueAtKeyPath(set.properties, keyPath)
            if hasValue
              if hasMergedValue
                deepDefaults(mergedValue, value)
              else
                hasMergedValue = true
                mergedValue = deepClone(value)
              return mergedValue unless isPlainObject(mergedValue)

        scopes.pop()
      mergedValue

  # Public: Get *all* values for the given key-path in a given scope.
  getAll: (scopeChain, keyPath, options) ->
    {sources, excludeSources} = options if options?

    scopes = @parseScopeChain(scopeChain)
    values = []

    @withCaching "getAll:#{scopeChain}:#{keyPath}", (sources? or excludeSources?), =>
      while scopes.length > 0
        for set in @propertySets
          continue if excludeSources? and (set.source in excludeSources)
          continue if sources? and not (set.source in sources)

          if set.matches(scopes)
            [value, hasValue] = checkValueAtKeyPath(set.properties, keyPath)
            if hasValue
              values.push(
                scopeSelector: set.selector.toString(),
                value: value
              )

        scopes.pop()
      values

  # Public: Get *all* properties for a given source.
  #
  # ## Examples
  #
  # ```coffee
  # store.addProperties('some-source', {'.source.ruby': {foo: 'bar'}})
  # store.addProperties('some-source', {'.source.ruby': {omg: 'wow'}})
  # store.propertiesForSource('some-source') # => {'.source.ruby': {foo: 'bar', omg: 'wow'}}
  # ```
  #
  # * `source` {String}
  #
  # Returns an {Object} in the format {scope: {property: value}}
  propertiesForSource: (source) ->
    propertySets = @mergeMatchingPropertySets(@propertySets.filter (set) -> set.source is source)

    propertiesBySelector = {}
    for selector, propertySet of propertySets
      propertiesBySelector[selector] = propertySet.properties
    propertiesBySelector

  # Public: Get *all* properties matching the given source and scopeSelector.
  #
  # * `source` {String}
  # * `scopeSelector` {String} `scopeSelector` is matched exactly.
  #
  # Returns an {Object} in the format {property: value}
  propertiesForSourceAndSelector: (source, scopeSelector) ->
    propertySets = @mergeMatchingPropertySets(@propertySets.filter (set) -> set.source is source)

    properties = {}
    for selector in Selector.create(scopeSelector)
      for setSelector, propertySet of propertySets
        _.extend(properties, propertySet.properties) if selector.isEqual(setSelector)
    properties

  # Public: Get *all* properties matching the given scopeSelector.
  #
  # * `scopeSelector` {String} `scopeSelector` is matched exactly.
  #
  # Returns an {Object} in the format {property: value}
  propertiesForSelector: (scopeSelector) ->
    propertySets = @mergeMatchingPropertySets(@propertySets)

    properties = {}
    for selector in Selector.create(scopeSelector)
      for setSelector, propertySet of propertySets
        _.extend(properties, propertySet.properties) if selector.isEqual(setSelector)
    properties

  # Public: Remove all properties for a given source.
  #
  # * `source` {String}
  removePropertiesForSource: (source) ->
    @bustCache()
    @propertySets = @propertySets.filter (set) -> set.source isnt source

  # Public: Remove all properties for a given source.
  #
  # * `source` {String}
  # * `scopeSelector` {String} `scopeSelector` is matched exactly.
  removePropertiesForSourceAndSelector: (source, scopeSelector) ->
    @bustCache()
    for selector in Selector.create(scopeSelector)
      @propertySets = @propertySets.filter (set) -> not (set.source is source and set.selector.isEqual(selector))
    return

  mergeMatchingPropertySets: (propertySets) ->
    merged = {}
    for propertySet in propertySets
      selector = propertySet.selector.toString() or '*'
      if matchingPropertySet = merged[selector]
        merged[selector] = matchingPropertySet.merge(propertySet)
      else
        merged[selector] = propertySet
    merged

  bustCache: ->
    @cache = {}

  withCaching: (cacheKey, skipCache, callback) ->
    return callback() if skipCache
    if @cache.hasOwnProperty(cacheKey)
      @cache[cacheKey]
    else
      @cache[cacheKey] = callback()

  addPropertySet: (propertySet) ->
    @propertySets.push(propertySet)
    new Disposable =>
      index = @propertySets.indexOf(propertySet)
      @propertySets.splice(index, 1) if index > -1
      @bustCache()

  parseScopeChain: (scopeChain) ->
    scopeChain = scopeChain.replace @escapeCharacterRegex, (match) -> "\\#{match[0]}"
    scope for scope in slick.parse(scopeChain)[0] ? []

if includeDeprecatedAPIs
  ScopedPropertyStore::removeProperties = (source) ->
    deprecate '::addProperties() now returns a disposable. Call .dispose() on that instead.'
    @removePropertiesForSource(source)

/** @babel */
/* eslint-disable
    no-cond-assign,
    no-constant-condition,
    no-prototype-builtins,
    no-return-assign,
    operator-linebreak,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS104: Avoid inline assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Config
const _ = require('underscore-plus')
const fs = require('fs-plus')
const { Emitter } = require('event-kit')
const CSON = require('season')
const path = require('path')
const async = require('async')
const pathWatcher = require('pathwatcher')
const {
  getValueAtKeyPath, setValueAtKeyPath, deleteValueAtKeyPath,
  pushKeyPath, splitKeyPath
} = require('key-path-helpers')

const Color = require('./color')
const ScopedPropertyStore = require('scoped-property-store')
const ScopeDescriptor = require('./scope-descriptor')

// Essential: Used to access all of Atom's configuration details.
//
// An instance of this class is always available as the `atom.config` global.
//
// ## Getting and setting config settings.
//
// ```coffee
// # Note that with no value set, ::get returns the setting's default value.
// atom.config.get('my-package.myKey') # -> 'defaultValue'
//
// atom.config.set('my-package.myKey', 'value')
// atom.config.get('my-package.myKey') # -> 'value'
// ```
//
// You may want to watch for changes. Use {::observe} to catch changes to the setting.
//
// ```coffee
// atom.config.set('my-package.myKey', 'value')
// atom.config.observe 'my-package.myKey', (newValue) ->
//   # `observe` calls immediately and every time the value is changed
//   console.log 'My configuration changed:', newValue
// ```
//
// If you want a notification only when the value changes, use {::onDidChange}.
//
// ```coffee
// atom.config.onDidChange 'my-package.myKey', ({newValue, oldValue}) ->
//   console.log 'My configuration changed:', newValue, oldValue
// ```
//
// ### Value Coercion
//
// Config settings each have a type specified by way of a
// [schema](json-schema.org). For example we might an integer setting that only
// allows integers greater than `0`:
//
// ```coffee
// # When no value has been set, `::get` returns the setting's default value
// atom.config.get('my-package.anInt') # -> 12
//
// # The string will be coerced to the integer 123
// atom.config.set('my-package.anInt', '123')
// atom.config.get('my-package.anInt') # -> 123
//
// # The string will be coerced to an integer, but it must be greater than 0, so is set to 1
// atom.config.set('my-package.anInt', '-20')
// atom.config.get('my-package.anInt') # -> 1
// ```
//
// ## Defining settings for your package
//
// Define a schema under a `config` key in your package main.
//
// ```coffee
// module.exports =
//   # Your config schema
//   config:
//     someInt:
//       type: 'integer'
//       default: 23
//       minimum: 1
//
//   activate: (state) -> # ...
//   # ...
// ```
//
// See [package docs](http://flight-manual.atom.io/hacking-atom/sections/package-word-count/) for
// more info.
//
// ## Config Schemas
//
// We use [json schema](http://json-schema.org) which allows you to define your value's
// default, the type it should be, etc. A simple example:
//
// ```coffee
// # We want to provide an `enableThing`, and a `thingVolume`
// config:
//   enableThing:
//     type: 'boolean'
//     default: false
//   thingVolume:
//     type: 'integer'
//     default: 5
//     minimum: 1
//     maximum: 11
// ```
//
// The type keyword allows for type coercion and validation. If a `thingVolume` is
// set to a string `'10'`, it will be coerced into an integer.
//
// ```coffee
// atom.config.set('my-package.thingVolume', '10')
// atom.config.get('my-package.thingVolume') # -> 10
//
// # It respects the min / max
// atom.config.set('my-package.thingVolume', '400')
// atom.config.get('my-package.thingVolume') # -> 11
//
// # If it cannot be coerced, the value will not be set
// atom.config.set('my-package.thingVolume', 'cats')
// atom.config.get('my-package.thingVolume') # -> 11
// ```
//
// ### Supported Types
//
// The `type` keyword can be a string with any one of the following. You can also
// chain them by specifying multiple in an an array. For example
//
// ```coffee
// config:
//   someSetting:
//     type: ['boolean', 'integer']
//     default: 5
//
// # Then
// atom.config.set('my-package.someSetting', 'true')
// atom.config.get('my-package.someSetting') # -> true
//
// atom.config.set('my-package.someSetting', '12')
// atom.config.get('my-package.someSetting') # -> 12
// ```
//
// #### string
//
// Values must be a string.
//
// ```coffee
// config:
//   someSetting:
//     type: 'string'
//     default: 'hello'
// ```
//
// #### integer
//
// Values will be coerced into integer. Supports the (optional) `minimum` and
// `maximum` keys.
//
//   ```coffee
//   config:
//     someSetting:
//       type: 'integer'
//       default: 5
//       minimum: 1
//       maximum: 11
//   ```
//
// #### number
//
// Values will be coerced into a number, including real numbers. Supports the
// (optional) `minimum` and `maximum` keys.
//
// ```coffee
// config:
//   someSetting:
//     type: 'number'
//     default: 5.3
//     minimum: 1.5
//     maximum: 11.5
// ```
//
// #### boolean
//
// Values will be coerced into a Boolean. `'true'` and `'false'` will be coerced into
// a boolean. Numbers, arrays, objects, and anything else will not be coerced.
//
// ```coffee
// config:
//   someSetting:
//     type: 'boolean'
//     default: false
// ```
//
// #### array
//
// Value must be an Array. The types of the values can be specified by a
// subschema in the `items` key.
//
// ```coffee
// config:
//   someSetting:
//     type: 'array'
//     default: [1, 2, 3]
//     items:
//       type: 'integer'
//       minimum: 1.5
//       maximum: 11.5
// ```
//
// #### color
//
// Values will be coerced into a {Color} with `red`, `green`, `blue`, and `alpha`
// properties that all have numeric values. `red`, `green`, `blue` will be in
// the range 0 to 255 and `value` will be in the range 0 to 1. Values can be any
// valid CSS color format such as `#abc`, `#abcdef`, `white`,
// `rgb(50, 100, 150)`, and `rgba(25, 75, 125, .75)`.
//
// ```coffee
// config:
//   someSetting:
//     type: 'color'
//     default: 'white'
// ```
//
// #### object / Grouping other types
//
// A config setting with the type `object` allows grouping a set of config
// settings. The group will be visualy separated and has its own group headline.
// The sub options must be listed under a `properties` key.
//
// ```coffee
// config:
//   someSetting:
//     type: 'object'
//     properties:
//       myChildIntOption:
//         type: 'integer'
//         minimum: 1.5
//         maximum: 11.5
// ```
//
// ### Other Supported Keys
//
// #### enum
//
// All types support an `enum` key, which lets you specify all the values the
// setting can take. `enum` may be an array of allowed values (of the specified
// type), or an array of objects with `value` and `description` properties, where
// the `value` is an allowed value, and the `description` is a descriptive string
// used in the settings view.
//
// In this example, the setting must be one of the 4 integers:
//
// ```coffee
// config:
//   someSetting:
//     type: 'integer'
//     default: 4
//     enum: [2, 4, 6, 8]
// ```
//
// In this example, the setting must be either 'foo' or 'bar', which are
// presented using the provided descriptions in the settings pane:
//
// ```coffee
// config:
//   someSetting:
//     type: 'string'
//     default: 'foo'
//     enum: [
//       {value: 'foo', description: 'Foo mode. You want this.'}
//       {value: 'bar', description: 'Bar mode. Nobody wants that!'}
//     ]
// ```
//
// Usage:
//
// ```coffee
// atom.config.set('my-package.someSetting', '2')
// atom.config.get('my-package.someSetting') # -> 2
//
// # will not set values outside of the enum values
// atom.config.set('my-package.someSetting', '3')
// atom.config.get('my-package.someSetting') # -> 2
//
// # If it cannot be coerced, the value will not be set
// atom.config.set('my-package.someSetting', '4')
// atom.config.get('my-package.someSetting') # -> 4
// ```
//
// #### title and description
//
// The settings view will use the `title` and `description` keys to display your
// config setting in a readable way. By default the settings view humanizes your
// config key, so `someSetting` becomes `Some Setting`. In some cases, this is
// confusing for users, and a more descriptive title is useful.
//
// Descriptions will be displayed below the title in the settings view.
//
// For a group of config settings the humanized key or the title and the
// description are used for the group headline.
//
// ```coffee
// config:
//   someSetting:
//     title: 'Setting Magnitude'
//     description: 'This will affect the blah and the other blah'
//     type: 'integer'
//     default: 4
// ```
//
// __Note__: You should strive to be so clear in your naming of the setting that
// you do not need to specify a title or description!
//
// Descriptions allow a subset of
// [Markdown formatting](https://help.github.com/articles/github-flavored-markdown/).
// Specifically, you may use the following in configuration setting descriptions:
//
// * **bold** - `**bold**`
// * *italics* - `*italics*`
// * [links](https://atom.io) - `[links](https://atom.io)`
// * `code spans` - `\`code spans\``
// * line breaks - `line breaks<br/>`
// * ~~strikethrough~~ - `~~strikethrough~~`
//
// #### order
//
// The settings view orders your settings alphabetically. You can override this
// ordering with the order key.
//
// ```coffee
// config:
//   zSetting:
//     type: 'integer'
//     default: 4
//     order: 1
//   aSetting:
//     type: 'integer'
//     default: 4
//     order: 2
// ```
//
// ## Manipulating values outside your configuration schema
//
// It is possible to manipulate(`get`, `set`, `observe` etc) values that do not
// appear in your configuration schema. For example, if the config schema of the
// package 'some-package' is
//
// ```coffee
// config:
// someSetting:
//   type: 'boolean'
//   default: false
// ```
//
// You can still do the following
//
// ```coffee
// let otherSetting  = atom.config.get('some-package.otherSetting')
// atom.config.set('some-package.stillAnotherSetting', otherSetting * 5)
// ```
//
// In other words, if a function asks for a `key-path`, that path doesn't have to
// be described in the config schema for the package or any package. However, as
// highlighted in the best practices section, you are advised against doing the
// above.
//
// ## Best practices
//
// * Don't depend on (or write to) configuration keys outside of your keypath.
//
module.exports =
(Config = (function () {
  Config = class Config {
    static initClass () {
      this.schemaEnforcers = {}
    }

    static addSchemaEnforcer (typeName, enforcerFunction) {
      if (this.schemaEnforcers[typeName] == null) { this.schemaEnforcers[typeName] = [] }
      return this.schemaEnforcers[typeName].push(enforcerFunction)
    }

    static addSchemaEnforcers (filters) {
      for (const typeName in filters) {
        const functions = filters[typeName]
        for (const name in functions) {
          const enforcerFunction = functions[name]
          this.addSchemaEnforcer(typeName, enforcerFunction)
        }
      }
    }

    static executeSchemaEnforcers (keyPath, value, schema) {
      let error = null
      let types = schema.type
      if (!Array.isArray(types)) { types = [types] }
      for (const type of Array.from(types)) {
        try {
          const enforcerFunctions = this.schemaEnforcers[type].concat(this.schemaEnforcers['*'])
          for (const enforcer of Array.from(enforcerFunctions)) {
            // At some point in one's life, one must call upon an enforcer.
            value = enforcer.call(this, keyPath, value, schema)
          }
          error = null
          break
        } catch (e) {
          error = e
        }
      }

      if (error != null) { throw error }
      return value
    }

    // Created during initialization, available as `atom.config`
    constructor (param) {
      if (param == null) { param = {} }
      const { notificationManager, enablePersistence } = param
      this.notificationManager = notificationManager
      this.enablePersistence = enablePersistence
      this.clear()
    }

    initialize ({ configDirPath, resourcePath, projectHomeSchema }) {
      this.configDirPath = configDirPath
      this.resourcePath = resourcePath
      if (this.enablePersistence != null) {
        this.configFilePath = fs.resolve(this.configDirPath, 'config', ['json', 'cson'])
        if (this.configFilePath == null) { this.configFilePath = path.join(this.configDirPath, 'config.cson') }
      }

      this.schema.properties.core.properties.projectHome = projectHomeSchema
      return this.defaultSettings.core.projectHome = projectHomeSchema.default
    }

    clear () {
      let debouncedSave
      this.emitter = new Emitter()
      this.schema = {
        type: 'object',
        properties: {}
      }
      this.defaultSettings = {}
      this.settings = {}
      this.scopedSettingsStore = new ScopedPropertyStore()
      this.configFileHasErrors = false
      this.transactDepth = 0
      this.savePending = false
      this.requestLoad = _.debounce(this.loadUserConfig, 100)
      this.requestSave = () => {
        this.savePending = true
        return debouncedSave.call(this)
      }
      const save = () => {
        this.savePending = false
        return this.save()
      }
      return debouncedSave = _.debounce(save, 100)
    }

    shouldNotAccessFileSystem () { return !this.enablePersistence }

    /*
    Section: Config Subscription
    */

    // Essential: Add a listener for changes to a given key path. This is different
    // than {::onDidChange} in that it will immediately call your callback with the
    // current value of the config entry.
    //
    // ### Examples
    //
    // You might want to be notified when the themes change. We'll watch
    // `core.themes` for changes
    //
    // ```coffee
    // atom.config.observe 'core.themes', (value) ->
    //   # do stuff with value
    // ```
    //
    // * `keyPath` {String} name of the key to observe
    // * `options` (optional) {Object}
    //   * `scope` (optional) {ScopeDescriptor} describing a path from
    //     the root of the syntax tree to a token. Get one by calling
    //     {editor.getLastCursor().getScopeDescriptor()}. See {::get} for examples.
    //     See [the scopes docs](http://flight-manual.atom.io/behind-atom/sections/scoped-settings-scopes-and-scope-descriptors/)
    //     for more information.
    // * `callback` {Function} to call when the value of the key changes.
    //   * `value` the new value of the key
    //
    // Returns a {Disposable} with the following keys on which you can call
    // `.dispose()` to unsubscribe.
    observe () {
      let callback, keyPath, options, scopeDescriptor
      if (arguments.length === 2) {
        [keyPath, callback] = Array.from(arguments)
      } else if ((arguments.length === 3) && (_.isString(arguments[0]) && _.isObject(arguments[1]))) {
        [keyPath, options, callback] = Array.from(arguments)
        scopeDescriptor = options.scope
      } else {
        console.error('An unsupported form of Config::observe is being used. See https://atom.io/docs/api/latest/Config for details')
        return
      }

      if (scopeDescriptor != null) {
        return this.observeScopedKeyPath(scopeDescriptor, keyPath, callback)
      } else {
        return this.observeKeyPath(keyPath, options != null ? options : {}, callback)
      }
    }

    // Essential: Add a listener for changes to a given key path. If `keyPath` is
    // not specified, your callback will be called on changes to any key.
    //
    // * `keyPath` (optional) {String} name of the key to observe. Must be
    //   specified if `scopeDescriptor` is specified.
    // * `options` (optional) {Object}
    //   * `scope` (optional) {ScopeDescriptor} describing a path from
    //     the root of the syntax tree to a token. Get one by calling
    //     {editor.getLastCursor().getScopeDescriptor()}. See {::get} for examples.
    //     See [the scopes docs](http://flight-manual.atom.io/behind-atom/sections/scoped-settings-scopes-and-scope-descriptors/)
    //     for more information.
    // * `callback` {Function} to call when the value of the key changes.
    //   * `event` {Object}
    //     * `newValue` the new value of the key
    //     * `oldValue` the prior value of the key.
    //
    // Returns a {Disposable} with the following keys on which you can call
    // `.dispose()` to unsubscribe.
    onDidChange () {
      let callback, keyPath, scopeDescriptor
      if (arguments.length === 1) {
        [callback] = Array.from(arguments)
      } else if (arguments.length === 2) {
        [keyPath, callback] = Array.from(arguments)
      } else {
        let options;
        [keyPath, options, callback] = Array.from(arguments)
        scopeDescriptor = options.scope
      }

      if (scopeDescriptor != null) {
        return this.onDidChangeScopedKeyPath(scopeDescriptor, keyPath, callback)
      } else {
        return this.onDidChangeKeyPath(keyPath, callback)
      }
    }

    /*
    Section: Managing Settings
    */

    // Essential: Retrieves the setting for the given key.
    //
    // ### Examples
    //
    // You might want to know what themes are enabled, so check `core.themes`
    //
    // ```coffee
    // atom.config.get('core.themes')
    // ```
    //
    // With scope descriptors you can get settings within a specific editor
    // scope. For example, you might want to know `editor.tabLength` for ruby
    // files.
    //
    // ```coffee
    // atom.config.get('editor.tabLength', scope: ['source.ruby']) # => 2
    // ```
    //
    // This setting in ruby files might be different than the global tabLength setting
    //
    // ```coffee
    // atom.config.get('editor.tabLength') # => 4
    // atom.config.get('editor.tabLength', scope: ['source.ruby']) # => 2
    // ```
    //
    // You can get the language scope descriptor via
    // {TextEditor::getRootScopeDescriptor}. This will get the setting specifically
    // for the editor's language.
    //
    // ```coffee
    // atom.config.get('editor.tabLength', scope: @editor.getRootScopeDescriptor()) # => 2
    // ```
    //
    // Additionally, you can get the setting at the specific cursor position.
    //
    // ```coffee
    // scopeDescriptor = @editor.getLastCursor().getScopeDescriptor()
    // atom.config.get('editor.tabLength', scope: scopeDescriptor) # => 2
    // ```
    //
    // * `keyPath` The {String} name of the key to retrieve.
    // * `options` (optional) {Object}
    //   * `sources` (optional) {Array} of {String} source names. If provided, only
    //     values that were associated with these sources during {::set} will be used.
    //   * `excludeSources` (optional) {Array} of {String} source names. If provided,
    //     values that  were associated with these sources during {::set} will not
    //     be used.
    //   * `scope` (optional) {ScopeDescriptor} describing a path from
    //     the root of the syntax tree to a token. Get one by calling
    //     {editor.getLastCursor().getScopeDescriptor()}
    //     See [the scopes docs](http://flight-manual.atom.io/behind-atom/sections/scoped-settings-scopes-and-scope-descriptors/)
    //     for more information.
    //
    // Returns the value from Atom's default settings, the user's configuration
    // file in the type specified by the configuration schema.
    get () {
      let keyPath, options, scope
      if (arguments.length > 1) {
        if ((typeof arguments[0] === 'string') || (arguments[0] == null)) {
          [keyPath, options] = Array.from(arguments);
          ({ scope } = options)
        }
      } else {
        [keyPath] = Array.from(arguments)
      }

      if (scope != null) {
        const value = this.getRawScopedValue(scope, keyPath, options)
        return value != null ? value : this.getRawValue(keyPath, options)
      } else {
        return this.getRawValue(keyPath, options)
      }
    }

    // Extended: Get all of the values for the given key-path, along with their
    // associated scope selector.
    //
    // * `keyPath` The {String} name of the key to retrieve
    // * `options` (optional) {Object} see the `options` argument to {::get}
    //
    // Returns an {Array} of {Object}s with the following keys:
    //  * `scopeDescriptor` The {ScopeDescriptor} with which the value is associated
    //  * `value` The value for the key-path
    getAll (keyPath, options) {
      let globalValue, scope
      if (options != null) { ({ scope } = options) }
      let result = []

      if (scope != null) {
        const scopeDescriptor = ScopeDescriptor.fromObject(scope)
        result = result.concat(this.scopedSettingsStore.getAll(scopeDescriptor.getScopeChain(), keyPath, options))
      }

      if (globalValue = this.getRawValue(keyPath, options)) {
        result.push({ scopeSelector: '*', value: globalValue })
      }

      return result
    }

    // Essential: Sets the value for a configuration setting.
    //
    // This value is stored in Atom's internal configuration file.
    //
    // ### Examples
    //
    // You might want to change the themes programmatically:
    //
    // ```coffee
    // atom.config.set('core.themes', ['atom-light-ui', 'atom-light-syntax'])
    // ```
    //
    // You can also set scoped settings. For example, you might want change the
    // `editor.tabLength` only for ruby files.
    //
    // ```coffee
    // atom.config.get('editor.tabLength') # => 4
    // atom.config.get('editor.tabLength', scope: ['source.ruby']) # => 4
    // atom.config.get('editor.tabLength', scope: ['source.js']) # => 4
    //
    // # Set ruby to 2
    // atom.config.set('editor.tabLength', 2, scopeSelector: '.source.ruby') # => true
    //
    // # Notice it's only set to 2 in the case of ruby
    // atom.config.get('editor.tabLength') # => 4
    // atom.config.get('editor.tabLength', scope: ['source.ruby']) # => 2
    // atom.config.get('editor.tabLength', scope: ['source.js']) # => 4
    // ```
    //
    // * `keyPath` The {String} name of the key.
    // * `value` The value of the setting. Passing `undefined` will revert the
    //   setting to the default value.
    // * `options` (optional) {Object}
    //   * `scopeSelector` (optional) {String}. eg. '.source.ruby'
    //     See [the scopes docs](http://flight-manual.atom.io/behind-atom/sections/scoped-settings-scopes-and-scope-descriptors/)
    //     for more information.
    //   * `source` (optional) {String} The name of a file with which the setting
    //     is associated. Defaults to the user's config file.
    //
    // Returns a {Boolean}
    // * `true` if the value was set.
    // * `false` if the value was not able to be coerced to the type specified in the setting's schema.
    set () {
      let [keyPath, value, options] = Array.from(arguments)
      const scopeSelector = options != null ? options.scopeSelector : undefined
      let source = options != null ? options.source : undefined
      const shouldSave = (options != null ? options.save : undefined) != null ? (options != null ? options.save : undefined) : true

      if (source && !scopeSelector) {
        throw new Error("::set with a 'source' and no 'sourceSelector' is not yet implemented!")
      }

      if (source == null) { source = this.getUserConfigPath() }

      if (value !== undefined) {
        try {
          value = this.makeValueConformToSchema(keyPath, value)
        } catch (e) {
          return false
        }
      }

      if (scopeSelector != null) {
        this.setRawScopedValue(keyPath, value, source, scopeSelector)
      } else {
        this.setRawValue(keyPath, value)
      }

      if ((source === this.getUserConfigPath()) && shouldSave && !this.configFileHasErrors) { this.requestSave() }
      return true
    }

    // Essential: Restore the setting at `keyPath` to its default value.
    //
    // * `keyPath` The {String} name of the key.
    // * `options` (optional) {Object}
    //   * `scopeSelector` (optional) {String}. See {::set}
    //   * `source` (optional) {String}. See {::set}
    unset (keyPath, options) {
      let { scopeSelector, source } = options != null ? options : {}
      if (source == null) { source = this.getUserConfigPath() }

      if (scopeSelector != null) {
        if (keyPath != null) {
          let settings = this.scopedSettingsStore.propertiesForSourceAndSelector(source, scopeSelector)
          if (getValueAtKeyPath(settings, keyPath) != null) {
            this.scopedSettingsStore.removePropertiesForSourceAndSelector(source, scopeSelector)
            setValueAtKeyPath(settings, keyPath, undefined)
            settings = withoutEmptyObjects(settings)
            if (settings != null) { this.set(null, settings, { scopeSelector, source, priority: this.priorityForSource(source) }) }
            return this.requestSave()
          }
        } else {
          this.scopedSettingsStore.removePropertiesForSourceAndSelector(source, scopeSelector)
          return this.emitChangeEvent()
        }
      } else {
        for (scopeSelector in this.scopedSettingsStore.propertiesForSource(source)) {
          this.unset(keyPath, { scopeSelector, source })
        }
        if ((keyPath != null) && (source === this.getUserConfigPath())) {
          return this.set(keyPath, getValueAtKeyPath(this.defaultSettings, keyPath))
        }
      }
    }

    // Extended: Get an {Array} of all of the `source` {String}s with which
    // settings have been added via {::set}.
    getSources () {
      return _.uniq(_.pluck(this.scopedSettingsStore.propertySets, 'source')).sort()
    }

    // Extended: Retrieve the schema for a specific key path. The schema will tell
    // you what type the keyPath expects, and other metadata about the config
    // option.
    //
    // * `keyPath` The {String} name of the key.
    //
    // Returns an {Object} eg. `{type: 'integer', default: 23, minimum: 1}`.
    // Returns `null` when the keyPath has no schema specified, but is accessible
    // from the root schema.
    getSchema (keyPath) {
      const keys = splitKeyPath(keyPath)
      let {
        schema
      } = this
      for (const key of Array.from(keys)) {
        var childSchema
        if (schema.type === 'object') {
          childSchema = schema.properties != null ? schema.properties[key] : undefined
          if (childSchema == null) {
            if (isPlainObject(schema.additionalProperties)) {
              childSchema = schema.additionalProperties
            } else if (schema.additionalProperties === false) {
              return null
            } else {
              return { type: 'any' }
            }
          }
        } else {
          return null
        }
        schema = childSchema
      }
      return schema
    }

    // Extended: Get the {String} path to the config file being used.
    getUserConfigPath () {
      return this.configFilePath
    }

    // Extended: Suppress calls to handler functions registered with {::onDidChange}
    // and {::observe} for the duration of `callback`. After `callback` executes,
    // handlers will be called once if the value for their key-path has changed.
    //
    // * `callback` {Function} to execute while suppressing calls to handlers.
    transact (callback) {
      this.beginTransaction()
      try {
        return callback()
      } finally {
        this.endTransaction()
      }
    }

    /*
    Section: Internal methods used by core
    */

    // Private: Suppress calls to handler functions registered with {::onDidChange}
    // and {::observe} for the duration of the {Promise} returned by `callback`.
    // After the {Promise} is either resolved or rejected, handlers will be called
    // once if the value for their key-path has changed.
    //
    // * `callback` {Function} that returns a {Promise}, which will be executed
    //   while suppressing calls to handlers.
    //
    // Returns a {Promise} that is either resolved or rejected according to the
    // `{Promise}` returned by `callback`. If `callback` throws an error, a
    // rejected {Promise} will be returned instead.
    transactAsync (callback) {
      let endTransaction
      this.beginTransaction()
      try {
        endTransaction = fn => (...args) => {
          this.endTransaction()
          return fn(...Array.from(args || []))
        }
        const result = callback()
        return new Promise((resolve, reject) => result.then(endTransaction(resolve)).catch(endTransaction(reject)))
      } catch (error) {
        this.endTransaction()
        return Promise.reject(error)
      }
    }

    beginTransaction () {
      return this.transactDepth++
    }

    endTransaction () {
      this.transactDepth--
      return this.emitChangeEvent()
    }

    pushAtKeyPath (keyPath, value) {
      let left
      const arrayValue = (left = this.get(keyPath)) != null ? left : []
      const result = arrayValue.push(value)
      this.set(keyPath, arrayValue)
      return result
    }

    unshiftAtKeyPath (keyPath, value) {
      let left
      const arrayValue = (left = this.get(keyPath)) != null ? left : []
      const result = arrayValue.unshift(value)
      this.set(keyPath, arrayValue)
      return result
    }

    removeAtKeyPath (keyPath, value) {
      let left
      const arrayValue = (left = this.get(keyPath)) != null ? left : []
      const result = _.remove(arrayValue, value)
      this.set(keyPath, arrayValue)
      return result
    }

    setSchema (keyPath, schema) {
      if (!isPlainObject(schema)) {
        throw new Error(`Error loading schema for ${keyPath}: schemas can only be objects!`)
      }

      if (!typeof (schema.type != null)) {
        throw new Error(`Error loading schema for ${keyPath}: schema objects must have a type attribute`)
      }

      let rootSchema = this.schema
      if (keyPath) {
        for (const key of Array.from(splitKeyPath(keyPath))) {
          rootSchema.type = 'object'
          if (rootSchema.properties == null) { rootSchema.properties = {} }
          const {
            properties
          } = rootSchema
          if (properties[key] == null) { properties[key] = {} }
          rootSchema = properties[key]
        }
      }

      Object.assign(rootSchema, schema)
      return this.transact(() => {
        this.setDefaults(keyPath, this.extractDefaultsFromSchema(schema))
        this.setScopedDefaultsFromSchema(keyPath, schema)
        return this.resetSettingsForSchemaChange()
      })
    }

    load () {
      this.initializeConfigDirectory()
      this.loadUserConfig()
      return this.observeUserConfig()
    }

    /*
    Section: Private methods managing the user's config file
    */

    initializeConfigDirectory (done) {
      if (fs.existsSync(this.configDirPath) || this.shouldNotAccessFileSystem()) { return }

      fs.makeTreeSync(this.configDirPath)

      const queue = async.queue(({ sourcePath, destinationPath }, callback) => fs.copy(sourcePath, destinationPath, callback))
      queue.drain = done

      const templateConfigDirPath = fs.resolve(this.resourcePath, 'dot-atom')
      const onConfigDirFile = sourcePath => {
        const relativePath = sourcePath.substring(templateConfigDirPath.length + 1)
        const destinationPath = path.join(this.configDirPath, relativePath)
        return queue.push({ sourcePath, destinationPath })
      }
      return fs.traverseTree(templateConfigDirPath, onConfigDirFile, path => true, function () {})
    }

    loadUserConfig () {
      let error
      if (this.shouldNotAccessFileSystem()) { return }

      try {
        if (!fs.existsSync(this.configFilePath)) {
          fs.makeTreeSync(path.dirname(this.configFilePath))
          CSON.writeFileSync(this.configFilePath, {})
        }
      } catch (error1) {
        error = error1
        this.configFileHasErrors = true
        this.notifyFailure(`Failed to initialize \`${path.basename(this.configFilePath)}\``, error.stack)
        return
      }

      try {
        if (!this.savePending) {
          const userConfig = CSON.readFileSync(this.configFilePath)
          this.resetUserSettings(userConfig)
          return this.configFileHasErrors = false
        }
      } catch (error2) {
        error = error2
        this.configFileHasErrors = true
        const message = `Failed to load \`${path.basename(this.configFilePath)}\``

        const detail = (error.location != null)
          // stack is the output from CSON in this case
          ? error.stack
          :
          // message will be EACCES permission denied, et al
          error.message

        return this.notifyFailure(message, detail)
      }
    }

    observeUserConfig () {
      if (this.shouldNotAccessFileSystem()) { return }

      try {
        return this.watchSubscription != null ? this.watchSubscription : (this.watchSubscription = pathWatcher.watch(this.configFilePath, eventType => {
          if ((eventType === 'change') && (this.watchSubscription != null)) { return this.requestLoad() }
        }))
      } catch (error) {
        return this.notifyFailure(`\
Unable to watch path: \`${path.basename(this.configFilePath)}\`. Make sure you have permissions to
\`${this.configFilePath}\`. On linux there are currently problems with watch
sizes. See [this document][watches] for more info.
[watches]:https://github.com/atom/atom/blob/master/docs/build-instructions/linux.md#typeerror-unable-to-watch-path\
`
        )
      }
    }

    unobserveUserConfig () {
      if (this.watchSubscription != null) {
        this.watchSubscription.close()
      }
      return this.watchSubscription = null
    }

    notifyFailure (errorMessage, detail) {
      return (this.notificationManager != null ? this.notificationManager.addError(errorMessage, { detail, dismissable: true }) : undefined)
    }

    save () {
      if (this.shouldNotAccessFileSystem()) { return }

      let allSettings = { '*': this.settings }
      allSettings = Object.assign(allSettings, this.scopedSettingsStore.propertiesForSource(this.getUserConfigPath()))
      allSettings = sortObject(allSettings)
      try {
        return CSON.writeFileSync(this.configFilePath, allSettings)
      } catch (error) {
        const message = `Failed to save \`${path.basename(this.configFilePath)}\``
        const detail = error.message
        return this.notifyFailure(message, detail)
      }
    }

    /*
    Section: Private methods managing global settings
    */

    resetUserSettings (newSettings) {
      if (!isPlainObject(newSettings)) {
        this.settings = {}
        this.emitChangeEvent()
        return
      }

      if (newSettings.global != null) {
        newSettings['*'] = newSettings.global
        delete newSettings.global
      }

      if (newSettings['*'] != null) {
        const scopedSettings = newSettings
        newSettings = newSettings['*']
        delete scopedSettings['*']
        this.resetUserScopedSettings(scopedSettings)
      }

      return this.transact(() => {
        this.settings = {}
        for (const key in newSettings) { const value = newSettings[key]; this.set(key, value, { save: false }) }
      })
    }

    getRawValue (keyPath, options) {
      let defaultValue, value
      if (!(__guard__(options != null ? options.excludeSources : undefined, x => x.indexOf(this.getUserConfigPath())) >= 0)) {
        value = getValueAtKeyPath(this.settings, keyPath)
      }
      if (!(__guard__(options != null ? options.sources : undefined, x1 => x1.length) > 0)) {
        defaultValue = getValueAtKeyPath(this.defaultSettings, keyPath)
      }

      if (value != null) {
        value = this.deepClone(value)
        if (isPlainObject(value) && isPlainObject(defaultValue)) { this.deepDefaults(value, defaultValue) }
      } else {
        value = this.deepClone(defaultValue)
      }

      return value
    }

    setRawValue (keyPath, value) {
      const defaultValue = getValueAtKeyPath(this.defaultSettings, keyPath)
      if (_.isEqual(defaultValue, value)) {
        if (keyPath != null) {
          deleteValueAtKeyPath(this.settings, keyPath)
        } else {
          this.settings = null
        }
      } else {
        if (keyPath != null) {
          setValueAtKeyPath(this.settings, keyPath, value)
        } else {
          this.settings = value
        }
      }
      return this.emitChangeEvent()
    }

    observeKeyPath (keyPath, options, callback) {
      callback(this.get(keyPath))
      return this.onDidChangeKeyPath(keyPath, event => callback(event.newValue))
    }

    onDidChangeKeyPath (keyPath, callback) {
      let oldValue = this.get(keyPath)
      return this.emitter.on('did-change', () => {
        const newValue = this.get(keyPath)
        if (!_.isEqual(oldValue, newValue)) {
          const event = { oldValue, newValue }
          oldValue = newValue
          return callback(event)
        }
      })
    }

    isSubKeyPath (keyPath, subKeyPath) {
      if ((keyPath == null) || (subKeyPath == null)) { return false }
      const pathSubTokens = splitKeyPath(subKeyPath)
      const pathTokens = splitKeyPath(keyPath).slice(0, pathSubTokens.length)
      return _.isEqual(pathTokens, pathSubTokens)
    }

    setRawDefault (keyPath, value) {
      setValueAtKeyPath(this.defaultSettings, keyPath, value)
      return this.emitChangeEvent()
    }

    setDefaults (keyPath, defaults) {
      if ((defaults != null) && isPlainObject(defaults)) {
        const keys = splitKeyPath(keyPath)
        this.transact(() => {
          return (() => {
            const result = []
            for (const key in defaults) {
              const childValue = defaults[key]
              if (!defaults.hasOwnProperty(key)) { continue }
              result.push(this.setDefaults(keys.concat([key]).join('.'), childValue))
            }
            return result
          })()
        })
      } else {
        try {
          defaults = this.makeValueConformToSchema(keyPath, defaults)
          this.setRawDefault(keyPath, defaults)
        } catch (e) {
          console.warn(`'${keyPath}' could not set the default. Attempted default: ${JSON.stringify(defaults)}; Schema: ${JSON.stringify(this.getSchema(keyPath))}`)
        }
      }
    }

    deepClone (object) {
      if (object instanceof Color) {
        return object.clone()
      } else if (_.isArray(object)) {
        return object.map(value => this.deepClone(value))
      } else if (isPlainObject(object)) {
        return _.mapObject(object, (key, value) => [key, this.deepClone(value)])
      } else {
        return object
      }
    }

    deepDefaults (target) {
      let result = target
      let i = 0
      while (++i < arguments.length) {
        const object = arguments[i]
        if (isPlainObject(result) && isPlainObject(object)) {
          for (const key of Array.from(Object.keys(object))) {
            result[key] = this.deepDefaults(result[key], object[key])
          }
        } else {
          if ((result == null)) {
            result = this.deepClone(object)
          }
        }
      }
      return result
    }

    // `schema` will look something like this
    //
    // ```coffee
    // type: 'string'
    // default: 'ok'
    // scopes:
    //   '.source.js':
    //     default: 'omg'
    // ```
    setScopedDefaultsFromSchema (keyPath, schema) {
      if ((schema.scopes != null) && isPlainObject(schema.scopes)) {
        const scopedDefaults = {}
        for (const scope in schema.scopes) {
          const scopeSchema = schema.scopes[scope]
          if (!scopeSchema.hasOwnProperty('default')) { continue }
          scopedDefaults[scope] = {}
          setValueAtKeyPath(scopedDefaults[scope], keyPath, scopeSchema.default)
        }
        this.scopedSettingsStore.addProperties('schema-default', scopedDefaults)
      }

      if ((schema.type === 'object') && (schema.properties != null) && isPlainObject(schema.properties)) {
        const keys = splitKeyPath(keyPath)
        for (const key in schema.properties) {
          const childValue = schema.properties[key]
          if (!schema.properties.hasOwnProperty(key)) { continue }
          this.setScopedDefaultsFromSchema(keys.concat([key]).join('.'), childValue)
        }
      }
    }

    extractDefaultsFromSchema (schema) {
      if (schema.default != null) {
        return schema.default
      } else if ((schema.type === 'object') && (schema.properties != null) && isPlainObject(schema.properties)) {
        const defaults = {}
        const properties = schema.properties || {}
        for (const key in properties) { const value = properties[key]; defaults[key] = this.extractDefaultsFromSchema(value) }
        return defaults
      }
    }

    makeValueConformToSchema (keyPath, value, options) {
      if (options != null ? options.suppressException : undefined) {
        try {
          return this.makeValueConformToSchema(keyPath, value)
        } catch (e) {
          return undefined
        }
      } else {
        let schema
        if ((schema = this.getSchema(keyPath)) == null) {
          if (schema === false) { throw new Error(`Illegal key path ${keyPath}`) }
        }
        return this.constructor.executeSchemaEnforcers(keyPath, value, schema)
      }
    }

    // When the schema is changed / added, there may be values set in the config
    // that do not conform to the schema. This will reset make them conform.
    resetSettingsForSchemaChange (source) {
      if (source == null) { source = this.getUserConfigPath() }
      return this.transact(() => {
        this.settings = this.makeValueConformToSchema(null, this.settings, { suppressException: true })
        const selectorsAndSettings = this.scopedSettingsStore.propertiesForSource(source)
        this.scopedSettingsStore.removePropertiesForSource(source)
        for (const scopeSelector in selectorsAndSettings) {
          let settings = selectorsAndSettings[scopeSelector]
          settings = this.makeValueConformToSchema(null, settings, { suppressException: true })
          this.setRawScopedValue(null, settings, source, scopeSelector)
        }
      })
    }

    /*
    Section: Private Scoped Settings
    */

    priorityForSource (source) {
      if (source === this.getUserConfigPath()) {
        return 1000
      } else {
        return 0
      }
    }

    emitChangeEvent () {
      if (!(this.transactDepth > 0)) { return this.emitter.emit('did-change') }
    }

    resetUserScopedSettings (newScopedSettings) {
      const source = this.getUserConfigPath()
      const priority = this.priorityForSource(source)
      this.scopedSettingsStore.removePropertiesForSource(source)

      for (const scopeSelector in newScopedSettings) {
        let settings = newScopedSettings[scopeSelector]
        settings = this.makeValueConformToSchema(null, settings, { suppressException: true })
        const validatedSettings = {}
        validatedSettings[scopeSelector] = withoutEmptyObjects(settings)
        if (validatedSettings[scopeSelector] != null) { this.scopedSettingsStore.addProperties(source, validatedSettings, { priority }) }
      }

      return this.emitChangeEvent()
    }

    setRawScopedValue (keyPath, value, source, selector, options) {
      if (keyPath != null) {
        const newValue = {}
        setValueAtKeyPath(newValue, keyPath, value)
        value = newValue
      }

      const settingsBySelector = {}
      settingsBySelector[selector] = value
      this.scopedSettingsStore.addProperties(source, settingsBySelector, { priority: this.priorityForSource(source) })
      return this.emitChangeEvent()
    }

    getRawScopedValue (scopeDescriptor, keyPath, options) {
      scopeDescriptor = ScopeDescriptor.fromObject(scopeDescriptor)
      return this.scopedSettingsStore.getPropertyValue(scopeDescriptor.getScopeChain(), keyPath, options)
    }

    observeScopedKeyPath (scope, keyPath, callback) {
      callback(this.get(keyPath, { scope }))
      return this.onDidChangeScopedKeyPath(scope, keyPath, event => callback(event.newValue))
    }

    onDidChangeScopedKeyPath (scope, keyPath, callback) {
      let oldValue = this.get(keyPath, { scope })
      return this.emitter.on('did-change', () => {
        const newValue = this.get(keyPath, { scope })
        if (!_.isEqual(oldValue, newValue)) {
          const event = { oldValue, newValue }
          oldValue = newValue
          return callback(event)
        }
      })
    }
  }
  Config.initClass()
  return Config
})())

// Base schema enforcers. These will coerce raw input into the specified type,
// and will throw an error when the value cannot be coerced. Throwing the error
// will indicate that the value should not be set.
//
// Enforcers are run from most specific to least. For a schema with type
// `integer`, all the enforcers for the `integer` type will be run first, in
// order of specification. Then the `*` enforcers will be run, in order of
// specification.
Config.addSchemaEnforcers({
  any: {
    coerce (keyPath, value, schema) {
      return value
    }
  },

  integer: {
    coerce (keyPath, value, schema) {
      value = parseInt(value)
      if (isNaN(value) || !isFinite(value)) { throw new Error(`Validation failed at ${keyPath}, ${JSON.stringify(value)} cannot be coerced into an int`) }
      return value
    }
  },

  number: {
    coerce (keyPath, value, schema) {
      value = parseFloat(value)
      if (isNaN(value) || !isFinite(value)) { throw new Error(`Validation failed at ${keyPath}, ${JSON.stringify(value)} cannot be coerced into a number`) }
      return value
    }
  },

  boolean: {
    coerce (keyPath, value, schema) {
      switch (typeof value) {
        case 'string':
          if (value.toLowerCase() === 'true') {
            return true
          } else if (value.toLowerCase() === 'false') {
            return false
          } else {
            throw new Error(`Validation failed at ${keyPath}, ${JSON.stringify(value)} must be a boolean or the string 'true' or 'false'`)
          }
        case 'boolean':
          return value
        default:
          throw new Error(`Validation failed at ${keyPath}, ${JSON.stringify(value)} must be a boolean or the string 'true' or 'false'`)
      }
    }
  },

  string: {
    validate (keyPath, value, schema) {
      if (typeof value !== 'string') {
        throw new Error(`Validation failed at ${keyPath}, ${JSON.stringify(value)} must be a string`)
      }
      return value
    },

    validateMaximumLength (keyPath, value, schema) {
      if ((typeof schema.maximumLength === 'number') && (value.length > schema.maximumLength)) {
        return value.slice(0, schema.maximumLength)
      } else {
        return value
      }
    }
  },

  null: {
    // null sort of isnt supported. It will just unset in this case
    coerce (keyPath, value, schema) {
      if (![undefined, null].includes(value)) { throw new Error(`Validation failed at ${keyPath}, ${JSON.stringify(value)} must be null`) }
      return value
    }
  },

  object: {
    coerce (keyPath, value, schema) {
      if (!isPlainObject(value)) { throw new Error(`Validation failed at ${keyPath}, ${JSON.stringify(value)} must be an object`) }
      if (schema.properties == null) { return value }

      let defaultChildSchema = null
      let allowsAdditionalProperties = true
      if (isPlainObject(schema.additionalProperties)) {
        defaultChildSchema = schema.additionalProperties
      }
      if (schema.additionalProperties === false) {
        allowsAdditionalProperties = false
      }

      const newValue = {}
      for (const prop in value) {
        const propValue = value[prop]
        const childSchema = schema.properties[prop] != null ? schema.properties[prop] : defaultChildSchema
        if (childSchema != null) {
          try {
            newValue[prop] = this.executeSchemaEnforcers(pushKeyPath(keyPath, prop), propValue, childSchema)
          } catch (error) {
            console.warn(`Error setting item in object: ${error.message}`)
          }
        } else if (allowsAdditionalProperties) {
          // Just pass through un-schema'd values
          newValue[prop] = propValue
        } else {
          console.warn(`Illegal object key: ${keyPath}.${prop}`)
        }
      }

      return newValue
    }
  },

  array: {
    coerce (keyPath, value, schema) {
      if (!Array.isArray(value)) { throw new Error(`Validation failed at ${keyPath}, ${JSON.stringify(value)} must be an array`) }
      const itemSchema = schema.items
      if (itemSchema != null) {
        const newValue = []
        for (const item of Array.from(value)) {
          try {
            newValue.push(this.executeSchemaEnforcers(keyPath, item, itemSchema))
          } catch (error) {
            console.warn(`Error setting item in array: ${error.message}`)
          }
        }
        return newValue
      } else {
        return value
      }
    }
  },

  color: {
    coerce (keyPath, value, schema) {
      const color = Color.parse(value)
      if (color == null) {
        throw new Error(`Validation failed at ${keyPath}, ${JSON.stringify(value)} cannot be coerced into a color`)
      }
      return color
    }
  },

  '*': {
    coerceMinimumAndMaximum (keyPath, value, schema) {
      if (typeof value !== 'number') { return value }
      if ((schema.minimum != null) && (typeof schema.minimum === 'number')) {
        value = Math.max(value, schema.minimum)
      }
      if ((schema.maximum != null) && (typeof schema.maximum === 'number')) {
        value = Math.min(value, schema.maximum)
      }
      return value
    },

    validateEnum (keyPath, value, schema) {
      let possibleValues = schema.enum

      if (Array.isArray(possibleValues)) {
        possibleValues = possibleValues.map(function (value) {
          if (value.hasOwnProperty('value')) { return value.value } else { return value }
        })
      }

      if ((possibleValues == null) || !Array.isArray(possibleValues) || !possibleValues.length) { return value }

      for (const possibleValue of Array.from(possibleValues)) {
        // Using `isEqual` for possibility of placing enums on array and object schemas
        if (_.isEqual(possibleValue, value)) { return value }
      }

      throw new Error(`Validation failed at ${keyPath}, ${JSON.stringify(value)} is not one of ${JSON.stringify(possibleValues)}`)
    }
  }
})

var isPlainObject = value => _.isObject(value) && !_.isArray(value) && !_.isFunction(value) && !_.isString(value) && !(value instanceof Color)

var sortObject = function (value) {
  if (!isPlainObject(value)) { return value }
  const result = {}
  for (const key of Array.from(Object.keys(value).sort())) {
    result[key] = sortObject(value[key])
  }
  return result
}

var withoutEmptyObjects = function (object) {
  let resultObject
  if (isPlainObject(object)) {
    for (const key in object) {
      const value = object[key]
      const newValue = withoutEmptyObjects(value)
      if (newValue != null) {
        if (resultObject == null) { resultObject = {} }
        resultObject[key] = newValue
      }
    }
  } else {
    resultObject = object
  }
  return resultObject
}

function __guard__ (value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined
}

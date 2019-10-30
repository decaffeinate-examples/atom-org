/** @babel */
/* eslint-disable
    no-cond-assign,
    no-return-assign,
    no-unused-vars,
    no-useless-escape,
    standard/no-callback-literal,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Highlights
const path = require('path')
const _ = require('underscore-plus')
const fs = require('fs-plus')
const CSON = require('season')
const once = require('once')
const { GrammarRegistry } = require('first-mate')
const Selector = require('first-mate-select-grammar')
const selector = Selector()

module.exports =
(Highlights = class Highlights {
  // Public: Create a new highlighter.
  //
  // options - An Object with the following keys:
  //   :includePath - An optional String path to a file or folder of grammars to
  //                  register.
  //   :registry    - An optional GrammarRegistry instance.
  constructor (param) {
    if (param == null) { param = {} }
    const { includePath, registry, scopePrefix } = param
    this.includePath = includePath
    this.registry = registry
    this.scopePrefix = scopePrefix
    if (this.registry == null) { this.registry = new GrammarRegistry({ maxTokensPerLine: Infinity }) }
    this._loadingGrammars = false
    if (this.scopePrefix == null) { this.scopePrefix = '' }
  }

  // Public: Syntax highlight the given file synchronously.
  //
  // options - An Object with the following keys:
  //   :fileContents - The optional String contents of the file. The file will
  //                   be read from disk if this is unspecified
  //   :filePath     - The String path to the file.
  //   :scopeName    - An optional String scope name of a grammar. The best match
  //                   grammar will be used if this is unspecified.
  //
  // Returns a String of HTML. The HTML will contains one <pre> with one <div>
  // per line and each line will contain one or more <span> elements for the
  // tokens in the line.
  highlightSync (param) {
    if (param == null) { param = {} }
    let { filePath, fileContents, scopeName } = param
    this.loadGrammarsSync()

    if (filePath) { if (fileContents == null) { fileContents = fs.readFileSync(filePath, 'utf8') } }

    return this._highlightCommon({ filePath, fileContents, scopeName })
  }

  // Public: Syntax highlight the given file asyncronously
  //
  // options - An Object with the following keys:
  //   :fileContents - The optional String contents of the file. The file will
  //                   be read from disk if this is unspecified
  //   :filePath     - The String path to the file.
  //   :scopeName    - An optional String scope name of a grammar. The best match
  //                   grammar will be used if this is unspecified.
  //
  // cb - A callback with the highlighted html or error
  //
  // Calls back with a string of HTML. The HTML will contains one <pre> with one <div>
  // per line and each line will contain one or more <span> elements for the
  // tokens in the line. All grammar loading and fs operations are async so you can use this module in a server or busy process.
  highlight (param, cb) {
    if (param == null) { param = {} }
    const { filePath, fileContents, scopeName } = param
    return this.loadGrammars(err => {
      if (err) { return cb(err) }

      if (filePath && !fileContents) {
        return fs.readFile(filePath, 'utf8', (err, fileContents) => {
          if (err) { return cb(err) }
          return cb(false, this._highlightCommon({ filePath, fileContents, scopeName }))
        })
      } else {
        return cb(false, this._highlightCommon({ filePath, fileContents, scopeName }))
      }
    })
  }

  // Public: Require all the grammars from the grammars folder at the root of an
  //   npm module.
  //
  // modulePath - the String path to the module to require grammars from. If the
  //              given path is a file then the grammars folder from the parent
  //              directory will be used.
  requireGrammarsSync (param) {
    let packageDir
    if (param == null) { param = {} }
    const { modulePath } = param
    this.loadGrammarsSync()

    if (fs.isFileSync(modulePath)) {
      packageDir = path.dirname(modulePath)
    } else {
      packageDir = modulePath
    }

    const grammarsDir = path.resolve(packageDir, 'grammars')

    if (!fs.isDirectorySync(grammarsDir)) { return }

    for (const file of Array.from(fs.readdirSync(grammarsDir))) {
      var grammarPath
      if (grammarPath = CSON.resolve(path.join(grammarsDir, file))) {
        this.registry.loadGrammarSync(grammarPath)
      }
    }
  }

  // Public: Require all the grammars from the grammars folder at the root of an
  //   npm module asyncronously.
  //
  // {modulePath} - the String path to the module to require grammars from. If the
  //              given path is a file then the grammars folder from the parent
  //              directory will be used.
  // cb(err) - The callback so you know when it's done
  //
  requireGrammars (param, cb) {
    if (param == null) { param = {} }
    const { modulePath } = param
    return this.loadGrammars(err => {
      if (err) { return cb(err) }

      return fs.stat(modulePath, (err, stat) => {
        let packageDir
        if (err) { return cb(err) }

        if (stat.isFile()) {
          packageDir = path.dirname(modulePath)
        } else if (stat.isDirectory()) {
          packageDir = modulePath
        } else {
          // return with no error at all if i cant find the module dir.
          return cb()
        }

        const grammarsDir = path.resolve(packageDir, 'grammars')
        return this._registryLoadGrammarsDir(grammarsDir, cb)
      })
    })
  }

  _registryLoadGrammarsDir (dir, cb) {
    cb = once(cb)
    let todo = false
    const done = function (err) {
      if (err) { return cb(err) }
      if (!--todo) { return cb() }
    }

    return fs.readdir(dir, (err, files) => {
      if (err) {
        return cb(err)
      }

      todo = files.length
      if (!todo) { return cb(false, []) }

      return (() => {
        const result = []
        while (files.length) {
          const file = files.shift()
          const grammarPath = path.join(dir, file)
          // CSON.resolve uses fs.isFileSync we'll have to check it in the next step but only on valid files.
          if (CSON.isObjectPath(grammarPath)) {
            result.push(this._registryLoadGrammar(grammarPath, err => done(err)))
          } else {
            result.push(undefined)
          }
        }
        return result
      })()
    })
  }

  _registryLoadGrammar (grammarPath, cb) {
    return fs.stat(grammarPath, (err, stat) => {
      if (err) { return cb(err) }

      // does not error out at this stage if the file is named like a grammar but is not a file.
      if (!stat.isFile()) { return cb() }

      return this.registry.loadGrammar(grammarPath, cb)
    })
  }

  _highlightCommon (param) {
    if (param == null) { param = {} }
    const { filePath, fileContents, scopeName } = param
    let grammar = this.registry.grammarForScopeName(scopeName)
    if (grammar == null) { grammar = selector.selectGrammar(this.registry, filePath, fileContents) }

    const lineTokens = grammar.tokenizeLines(fileContents)

    // Remove trailing newline
    if (lineTokens.length > 0) {
      const lastLineTokens = lineTokens[lineTokens.length - 1]

      if ((lastLineTokens.length === 1) && (lastLineTokens[0].value === '')) {
        lineTokens.pop()
      }
    }

    let html = '<pre class="editor editor-colors">'
    for (const tokens of Array.from(lineTokens)) {
      const scopeStack = []
      html += '<div class="line">'
      for (let { value, scopes } of Array.from(tokens)) {
        if (!value) { value = ' ' }
        html = this.updateScopeStack(scopeStack, scopes, html)
        html += `<span>${this.escapeString(value)}</span>`
      }
      while (scopeStack.length > 0) { html = this.popScope(scopeStack, html) }
      html += '</div>'
    }
    html += '</pre>'
    return html
  }

  loadGrammarsSync () {
    if (this.registry.grammars.length > 1) { return }

    if (typeof this.includePath === 'string') {
      if (fs.isFileSync(this.includePath)) {
        this.registry.loadGrammarSync(this.includePath)
      } else if (fs.isDirectorySync(this.includePath)) {
        for (const filePath of Array.from(fs.listSync(this.includePath, ['cson', 'json']))) {
          this.registry.loadGrammarSync(filePath)
        }
      }
    }

    const grammarsPath = path.join(__dirname, '..', 'gen', 'grammars.json')
    const object = JSON.parse(fs.readFileSync(grammarsPath))
    for (const grammarPath in object) {
      let grammar = object[grammarPath]
      if (this.registry.grammarForScopeName(grammar.scopeName) != null) { continue }
      grammar = this.registry.createGrammar(grammarPath, grammar)
      this.registry.addGrammar(grammar)
    }
  }

  loadGrammars (cb) {
    cb = once(cb)

    if ((this._loadingGrammars === true) || (this.registry.grammars.length > 1)) {
      return setImmediate(cb)
    } else if (Array.isArray(this._loadingGrammars)) {
      return this._loadingGrammars.push(cb)
    }

    this._loadingGrammars = [cb]
    const callbacks = err => {
      const cbs = this._loadingGrammars
      this._loadingGrammars = true
      return (() => {
        const result = []
        while (cbs.length) {
          result.push(cbs.shift()(err))
        }
        return result
      })()
    }

    let pendingAsyncCalls = 2
    let grammarsFromJSON = null
    let grammarsArray = null

    const done = (err, paths) => {
      if (err) { return callbacks(err) }
      if (!--pendingAsyncCalls) {
        return this._populateGrammars(grammarsFromJSON, grammarsArray, callbacks)
      }
    }

    this._findGrammars(function (err, arr) {
      grammarsArray = arr
      return done(err)
    })

    return this._loadGrammarsJSON(function (err, fromJSON) {
      grammarsFromJSON = fromJSON
      return done(err)
    })
  }

  _populateGrammars (grammarsFromJSON, grammarsArray, cb) {
    let toLoad = (grammarsArray || []).length
    const grammars = []

    const done = (err, grammar) => {
      if (err) { return cb(err) }

      if (grammar) { grammars.push(grammar) }

      if (!--toLoad) {
        // complete loading from grammars.json
        for (const grammarPath in grammarsFromJSON) {
          grammar = grammarsFromJSON[grammarPath]
          if (this.registry.grammarForScopeName(grammar.scopeName) != null) { continue }
          grammar = this.registry.createGrammar(grammarPath, grammar)
          this.registry.addGrammar(grammar)
        }

        return cb(false, true)
      }
    }

    if (!toLoad) {
      toLoad = 1
      return done()
    }

    return (() => {
      const result = []
      while (grammarsArray.length) {
        result.push(this.registry.loadGrammar(grammarsArray.shift(), done))
      }
      return result
    })()
  }

  _findGrammars (cb) {
    if (typeof this.includePath === 'string') {
      return fs.stat(this.includePath, (err, stat) => {
        if (err) { return cb(err) }
        if (stat.isFile()) {
          return cb(false, [this.includePath])
        } else if (stat.isDirectory()) {
          return fs.list(this.includePath, ['cson', 'json'], function (err, list) { if (list == null) { list = [] } return cb(err, list) })
        } else {
          return cb(new Error('unsupported file type.'))
        }
      })
    } else {
      return setImmediate(cb)
    }
  }

  _loadGrammarsJSON (cb) {
    const grammarsPath = path.join(__dirname, '..', 'gen', 'grammars.json')
    return fs.readFile(grammarsPath, function (err, contents) {
      try {
        return cb(false, JSON.parse(contents))
      } catch (error) {
        err = error
        return cb(err)
      }
    })
  }

  escapeString (string) {
    return string.replace(/[&"'<> ]/g, function (match) {
      switch (match) {
        case '&': return '&amp;'
        case '"': return '&quot;'
        case "'": return '&#39;'
        case '<': return '&lt;'
        case '>': return '&gt;'
        case ' ': return '&nbsp;'
        default: return match
      }
    })
  }

  updateScopeStack (scopeStack, desiredScopes, html) {
    let i
    let asc
    let excessScopes = scopeStack.length - desiredScopes.length
    if (excessScopes > 0) {
      while (excessScopes--) { html = this.popScope(scopeStack, html) }
    }

    // pop until common prefix
    for (i = scopeStack.length, asc = scopeStack.length <= 0; asc ? i <= 0 : i >= 0; asc ? i++ : i--) {
      if (_.isEqual(scopeStack.slice(0, i), desiredScopes.slice(0, i))) { break }
      html = this.popScope(scopeStack, html)
    }

    // push on top of common prefix until scopeStack is desiredScopes
    for (let j = i, end = desiredScopes.length, asc1 = i <= end; asc1 ? j < end : j > end; asc1 ? j++ : j--) {
      html = this.pushScope(scopeStack, desiredScopes[j], html)
    }

    return html
  }

  pushScope (scopeStack, scope, html) {
    scopeStack.push(scope)
    if (scope) {
      const className = this.scopePrefix + scope.replace(/\.+/g, ` ${this.scopePrefix}`)
      return html += `<span class=\"${className}\">`
    } else {
      return html += '<span>'
    }
  }

  popScope (scopeStack, html) {
    scopeStack.pop()
    return html += '</span>'
  }
})

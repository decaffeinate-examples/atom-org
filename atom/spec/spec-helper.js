/** @babel */
/* eslint-disable
    handle-callback-err,
    no-cond-assign,
    no-extend-native,
    no-prototype-builtins,
    no-return-assign,
    no-undef,
    no-unused-expressions,
    no-unused-vars,
    no-useless-call,
    prefer-const,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS201: Simplify complex destructure assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let specDirectory, specPackageName, specPackagePath, specProjectPath
require('jasmine-json')
require('../src/window')
require('../vendor/jasmine-jquery')
const path = require('path')
const _ = require('underscore-plus')
const fs = require('fs-plus')
const Grim = require('grim')
const pathwatcher = require('pathwatcher')
const FindParentDir = require('find-parent-dir')

const TextEditor = require('../src/text-editor')
const TextEditorElement = require('../src/text-editor-element')
const TokenizedBuffer = require('../src/tokenized-buffer')
const clipboard = require('../src/safe-clipboard')

const jasmineStyle = document.createElement('style')
jasmineStyle.textContent = atom.themes.loadStylesheet(atom.themes.resolveStylesheet('../static/jasmine'))
document.head.appendChild(jasmineStyle)

const fixturePackagesPath = path.resolve(__dirname, './fixtures/packages')
atom.packages.packageDirPaths.unshift(fixturePackagesPath)

document.querySelector('html').style.overflow = 'auto'
document.body.style.overflow = 'auto'

Set.prototype.jasmineToString = function () {
  let result = 'Set {'
  let first = true
  this.forEach(function (element) {
    if (!first) { result += ', ' }
    return result += element.toString()
  })
  first = false
  return result + '}'
}

Set.prototype.isEqual = function (other) {
  if (other instanceof Set) {
    let next
    if (this.size !== other.size) { return false }
    const values = this.values()
    while (!(next = values.next()).done) {
      if (!other.has(next.value)) { return false }
    }
    return true
  } else {
    return false
  }
}

jasmine.getEnv().addEqualityTester(_.isEqual) // Use underscore's definition of equality for toEqual assertions

if (process.env.CI) {
  jasmine.getEnv().defaultTimeoutInterval = 60000
} else {
  jasmine.getEnv().defaultTimeoutInterval = 5000
}

const { testPaths } = atom.getLoadSettings()

if (specPackagePath = FindParentDir.sync(testPaths[0], 'package.json')) {
  const packageMetadata = require(path.join(specPackagePath, 'package.json'))
  specPackageName = packageMetadata.name
}

if ((specDirectory = FindParentDir.sync(testPaths[0], 'fixtures'))) {
  specProjectPath = path.join(specDirectory, 'fixtures')
} else {
  specProjectPath = path.join(__dirname, 'fixtures')
}

beforeEach(function () {
  atom.project.setPaths([specProjectPath])

  window.resetTimeouts()
  spyOn(_._, 'now').andCallFake(() => window.now)
  spyOn(Date, 'now').andCallFake(() => window.now)
  spyOn(window, 'setTimeout').andCallFake(window.fakeSetTimeout)
  spyOn(window, 'clearTimeout').andCallFake(window.fakeClearTimeout)

  const spy = spyOn(atom.packages, 'resolvePackagePath').andCallFake(function (packageName) {
    if (specPackageName && (packageName === specPackageName)) {
      return resolvePackagePath(specPackagePath)
    } else {
      return resolvePackagePath(packageName)
    }
  })
  var resolvePackagePath = _.bind(spy.originalValue, atom.packages)

  // prevent specs from modifying Atom's menus
  spyOn(atom.menu, 'sendToBrowserProcess')

  // reset config before each spec
  atom.config.set('core.destroyEmptyPanes', false)
  atom.config.set('editor.fontFamily', 'Courier')
  atom.config.set('editor.fontSize', 16)
  atom.config.set('editor.autoIndent', false)
  atom.config.set('core.disabledPackages', ['package-that-throws-an-exception',
    'package-with-broken-package-json', 'package-with-broken-keymap'])
  advanceClock(1000)
  window.setTimeout.reset()

  // make editor display updates synchronous
  TextEditorElement.prototype.setUpdatedSynchronously(true)

  spyOn(pathwatcher.File.prototype, 'detectResurrectionAfterDelay').andCallFake(function () { return this.detectResurrection() })
  spyOn(TextEditor.prototype, 'shouldPromptToSave').andReturn(false)

  // make tokenization synchronous
  TokenizedBuffer.prototype.chunkSize = Infinity
  spyOn(TokenizedBuffer.prototype, 'tokenizeInBackground').andCallFake(function () { return this.tokenizeNextChunk() })

  let clipboardContent = 'initial clipboard content'
  spyOn(clipboard, 'writeText').andCallFake(text => clipboardContent = text)
  spyOn(clipboard, 'readText').andCallFake(() => clipboardContent)

  return addCustomMatchers(this)
})

afterEach(function () {
  ensureNoDeprecatedFunctionCalls()
  ensureNoDeprecatedStylesheets()
  atom.reset()
  if (!window.debugContent) { document.getElementById('jasmine-content').innerHTML = '' }
  warnIfLeakingPathSubscriptions()
  return waits(0)
}) // yield to ui thread to make screen update more frequently

var warnIfLeakingPathSubscriptions = function () {
  const watchedPaths = pathwatcher.getWatchedPaths()
  if (watchedPaths.length > 0) {
    console.error('WARNING: Leaking subscriptions for paths: ' + watchedPaths.join(', '))
  }
  return pathwatcher.closeAllWatchers()
}

var ensureNoDeprecatedFunctionCalls = function () {
  const deprecations = _.clone(Grim.getDeprecations())
  Grim.clearDeprecations()
  if (deprecations.length > 0) {
    const originalPrepareStackTrace = Error.prepareStackTrace
    Error.prepareStackTrace = function (error, stack) {
      const output = []
      for (const deprecation of Array.from(deprecations)) {
        output.push(`${deprecation.originName} is deprecated. ${deprecation.message}`)
        output.push(_.multiplyString('-', output[output.length - 1].length))
        for (stack of Array.from(deprecation.getStacks())) {
          for (const { functionName, location } of Array.from(stack)) {
            output.push(`${functionName} -- ${location}`)
          }
        }
        output.push('')
      }
      return output.join('\n')
    }

    const error = new Error(`Deprecated function(s) ${deprecations.map(({ originName }) => originName).join(', ')}) were called.`)
    error.stack
    Error.prepareStackTrace = originalPrepareStackTrace
    throw error
  }
}

var ensureNoDeprecatedStylesheets = function () {
  const deprecations = _.clone(atom.styles.getDeprecations())
  atom.styles.clearDeprecations()
  return (() => {
    const result = []
    for (const sourcePath in deprecations) {
      const deprecation = deprecations[sourcePath]
      const title =
        sourcePath !== 'undefined'
          ? `Deprecated stylesheet at '${sourcePath}':`
          : 'Deprecated stylesheet:'
      throw new Error(`${title}\n${deprecation.message}`)
    }
    return result
  })()
}

const {
  emitObject
} = jasmine.StringPrettyPrinter.prototype
jasmine.StringPrettyPrinter.prototype.emitObject = function (obj) {
  if (obj.inspect) {
    return this.append(obj.inspect())
  } else {
    return emitObject.call(this, obj)
  }
}

jasmine.unspy = function (object, methodName) {
  if (!object[methodName].hasOwnProperty('originalValue')) { throw new Error('Not a spy') }
  return object[methodName] = object[methodName].originalValue
}

jasmine.attachToDOM = function (element) {
  const jasmineContent = document.querySelector('#jasmine-content')
  if (!jasmineContent.contains(element)) { return jasmineContent.appendChild(element) }
}

let grimDeprecationsSnapshot = null
let stylesDeprecationsSnapshot = null
jasmine.snapshotDeprecations = function () {
  grimDeprecationsSnapshot = _.clone(Grim.deprecations)
  return stylesDeprecationsSnapshot = _.clone(atom.styles.deprecationsBySourcePath)
}

jasmine.restoreDeprecationsSnapshot = function () {
  Grim.deprecations = grimDeprecationsSnapshot
  return atom.styles.deprecationsBySourcePath = stylesDeprecationsSnapshot
}

jasmine.useRealClock = function () {
  jasmine.unspy(window, 'setTimeout')
  jasmine.unspy(window, 'clearTimeout')
  jasmine.unspy(_._, 'now')
  return jasmine.unspy(Date, 'now')
}

// The clock is halfway mocked now in a sad and terrible way... only setTimeout
// and clearTimeout are included. This method will also include setInterval. We
// would do this everywhere if didn't cause us to break a bunch of package tests.
jasmine.useMockClock = function () {
  spyOn(window, 'setInterval').andCallFake(fakeSetInterval)
  return spyOn(window, 'clearInterval').andCallFake(fakeClearInterval)
}

var addCustomMatchers = function (spec) {
  return spec.addMatchers({
    toBeInstanceOf (expected) {
      const beOrNotBe = this.isNot ? 'not be' : 'be'
      this.message = () => `Expected ${jasmine.pp(this.actual)} to ${beOrNotBe} instance of ${expected.name} class`
      return this.actual instanceof expected
    },

    toHaveLength (expected) {
      if ((this.actual == null)) {
        this.message = () => `Expected object ${this.actual} has no length method`
        return false
      } else {
        const haveOrNotHave = this.isNot ? 'not have' : 'have'
        this.message = () => `Expected object with length ${this.actual.length} to ${haveOrNotHave} length ${expected}`
        return this.actual.length === expected
      }
    },

    toExistOnDisk (expected) {
      const toOrNotTo = (this.isNot && 'not to') || 'to'
      this.message = function () { return `Expected path '${this.actual}' ${toOrNotTo} exist.` }
      return fs.existsSync(this.actual)
    },

    toHaveFocus () {
      const toOrNotTo = (this.isNot && 'not to') || 'to'
      if (!document.hasFocus()) {
        console.error('Specs will fail because the Dev Tools have focus. To fix this close the Dev Tools or click the spec runner.')
      }

      this.message = function () { return `Expected element '${this.actual}' or its descendants ${toOrNotTo} have focus.` }
      let element = this.actual
      if (element.jquery) { element = element.get(0) }
      return (element === document.activeElement) || element.contains(document.activeElement)
    },

    toShow () {
      const toOrNotTo = (this.isNot && 'not to') || 'to'
      let element = this.actual
      if (element.jquery) { element = element.get(0) }
      this.message = () => `Expected element '${element}' or its descendants ${toOrNotTo} show.`
      return ['block', 'inline-block', 'static', 'fixed'].includes(element.style.display)
    },

    toEqualPath (expected) {
      const actualPath = path.normalize(this.actual)
      const expectedPath = path.normalize(expected)
      this.message = () => `Expected path '${actualPath}' to be equal to '${expectedPath}'.`
      return actualPath === expectedPath
    }
  })
}

window.waitsForPromise = function (...args) {
  let shouldReject, timeout
  let label = null
  if (args.length > 1) {
    ({ shouldReject, timeout, label } = args[0])
  } else {
    shouldReject = false
  }
  if (label == null) { label = 'promise to be resolved or rejected' }
  const fn = _.last(args)

  return window.waitsFor(label, timeout, function (moveOn) {
    const promise = fn()
    if (shouldReject) {
      promise.catch.call(promise, moveOn)
      return promise.then(function () {
        jasmine.getEnv().currentSpec.fail('Expected promise to be rejected, but it was resolved')
        return moveOn()
      })
    } else {
      promise.then(moveOn)
      return promise.catch.call(promise, function (error) {
        jasmine.getEnv().currentSpec.fail(`Expected promise to be resolved, but it was rejected with: ${(error != null ? error.message : undefined)} ${jasmine.pp(error)}`)
        return moveOn()
      })
    }
  })
}

window.resetTimeouts = function () {
  window.now = 0
  window.timeoutCount = 0
  window.intervalCount = 0
  window.timeouts = []
  return window.intervalTimeouts = {}
}

window.fakeSetTimeout = function (callback, ms) {
  if (ms == null) { ms = 0 }
  const id = ++window.timeoutCount
  window.timeouts.push([id, window.now + ms, callback])
  return id
}

window.fakeClearTimeout = idToClear => window.timeouts = window.timeouts.filter(function (...args) { const [id] = Array.from(args[0]); return id !== idToClear })

window.fakeSetInterval = function (callback, ms) {
  const id = ++window.intervalCount
  var action = function () {
    callback()
    return window.intervalTimeouts[id] = window.fakeSetTimeout(action, ms)
  }
  window.intervalTimeouts[id] = window.fakeSetTimeout(action, ms)
  return id
}

window.fakeClearInterval = function (idToClear) {
  return window.fakeClearTimeout(this.intervalTimeouts[idToClear])
}

window.advanceClock = function (delta) {
  if (delta == null) { delta = 1 }
  window.now += delta
  const callbacks = []

  window.timeouts = window.timeouts.filter(function (...args) {
    let id, strikeTime
    let callback;
    [id, strikeTime, callback] = Array.from(args[0])
    if (strikeTime <= window.now) {
      callbacks.push(callback)
      return false
    } else {
      return true
    }
  })

  return (() => {
    const result = []
    for (const callback of Array.from(callbacks)) {
      result.push(callback())
    }
    return result
  })()
}

exports.mockLocalStorage = function () {
  const items = {}
  spyOn(global.localStorage, 'setItem').andCallFake(function (key, item) { items[key] = item.toString(); return undefined })
  spyOn(global.localStorage, 'getItem').andCallFake(key => items[key] != null ? items[key] : null)
  return spyOn(global.localStorage, 'removeItem').andCallFake(function (key) { delete items[key]; return undefined })
}

/** @babel */
/* eslint-disable
    handle-callback-err,
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS104: Avoid inline assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require('fs')
const path = require('path')

const CLASSES = require('../completions.json')

const propertyPrefixPattern = /(?:^|\[|\(|,|=|:|\s)\s*(atom\.(?:[a-zA-Z]+\.?){0,2})$/

module.exports = {
  selector: '.source.coffee, .source.js',
  filterSuggestions: true,

  getSuggestions ({ bufferPosition, editor }) {
    if (!this.isEditingAnAtomPackageFile(editor)) { return }
    const line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition])
    return this.getCompletions(line)
  },

  load () {
    this.loadCompletions()
    atom.project.onDidChangePaths(() => this.scanProjectDirectories())
    return this.scanProjectDirectories()
  },

  scanProjectDirectories () {
    this.packageDirectories = []
    return atom.project.getDirectories().forEach(directory => {
      if (directory == null) { return }
      return this.readMetadata(directory, (error, metadata) => {
        if (this.isAtomPackage(metadata) || this.isAtomCore(metadata)) {
          return this.packageDirectories.push(directory)
        }
      })
    })
  },

  readMetadata (directory, callback) {
    return fs.readFile(path.join(directory.getPath(), 'package.json'), function (error, contents) {
      let metadata
      if (error == null) {
        try {
          metadata = JSON.parse(contents)
        } catch (parseError) {
          error = parseError
        }
      }
      return callback(error, metadata)
    })
  },

  isAtomPackage (metadata) {
    return __guard__(__guard__(metadata != null ? metadata.engines : undefined, x1 => x1.atom), x => x.length) > 0
  },

  isAtomCore (metadata) {
    return (metadata != null ? metadata.name : undefined) === 'atom'
  },

  isEditingAnAtomPackageFile (editor) {
    const editorPath = editor.getPath()
    if (editorPath != null) {
      const parsedPath = path.parse(editorPath)
      if (path.basename(parsedPath.dir) === '.atom') {
        if ((parsedPath.base === 'init.coffee') || (parsedPath.base === 'init.js')) {
          return true
        }
      }
    }
    for (const directory of Array.from(this.packageDirectories != null ? this.packageDirectories : [])) {
      if (directory.contains(editorPath)) { return true }
    }
    return false
  },

  loadCompletions () {
    if (this.completions == null) { this.completions = {} }
    return this.loadProperty('atom', 'AtomEnvironment', CLASSES)
  },

  getCompletions (line) {
    let left
    const completions = []
    const match = __guard__(propertyPrefixPattern.exec(line), x => x[1])
    if (!match) { return completions }

    let segments = match.split('.')
    const prefix = (left = segments.pop()) != null ? left : ''
    segments = segments.filter(segment => segment)
    const property = segments[segments.length - 1]
    const propertyCompletions = (this.completions[property] != null ? this.completions[property].completions : undefined) != null ? (this.completions[property] != null ? this.completions[property].completions : undefined) : []
    for (const completion of Array.from(propertyCompletions)) {
      if (!prefix || firstCharsEqual(completion.name, prefix)) {
        completions.push(clone(completion))
      }
    }
    return completions
  },

  getPropertyClass (name) {
    return __guard__(atom[name] != null ? atom[name].constructor : undefined, x => x.name)
  },

  loadProperty (propertyName, className, classes, parent) {
    const classCompletions = classes[className]
    if (classCompletions == null) { return }

    this.completions[propertyName] = { completions: [] }

    for (const completion of Array.from(classCompletions)) {
      this.completions[propertyName].completions.push(completion)
      if (completion.type === 'property') {
        const propertyClass = this.getPropertyClass(completion.name)
        this.loadProperty(completion.name, propertyClass, classes)
      }
    }
  }
}

var clone = function (obj) {
  const newObj = {}
  for (const k in obj) { const v = obj[k]; newObj[k] = v }
  return newObj
}

var firstCharsEqual = (str1, str2) => str1[0].toLowerCase() === str2[0].toLowerCase()

function __guard__ (value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined
}

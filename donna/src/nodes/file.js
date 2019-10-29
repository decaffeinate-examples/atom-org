/** @babel */
/* eslint-disable
    constructor-super,
    no-constant-condition,
    no-eval,
    no-this-before-super,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let File
const Path = require('path')
const Class = require('./class')
const Method = require('./method')
const Variable = require('./variable')
const Doc = require('./doc')

// Public: The file class is a `fake` class that wraps the
// file body to capture top-level assigned methods.
//
module.exports = (File = class File extends Class {
  // Public: Construct a `File` object.
  //
  // node - The class node (a {Object})
  // filename - A {String} representing the current filename
  // lineMapping - An object mapping the actual position of a member to its Donna one
  // options - Any additional parser options
  constructor (node, fileName, lineMapping, options) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super() }
      const thisFn = (() => { return this }).toString()
      const thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1]
      eval(`${thisName} = this;`)
    }
    this.node = node
    this.fileName = fileName
    this.lineMapping = lineMapping
    this.options = options
    try {
      this.methods = []
      this.variables = []

      let previousExp = null

      for (const exp of Array.from(this.node.expressions)) {
        var doc
        switch (exp.constructor.name) {
          case 'Assign':
            if ((previousExp != null ? previousExp.constructor.name : undefined) === 'Comment') { doc = previousExp }

            switch ((exp.value != null ? exp.value.constructor.name : undefined)) {
              case 'Code':
                this.methods.push(new Method(this, exp, this.lineMapping, this.options, doc))
                break
              case 'Value':
                if (exp.value.base.value) {
                  this.variables.push(new Variable(this, exp, this.lineMapping, this.options, true, doc))
                }
                break
            }

            doc = null
            break

          case 'Value':
            var previousProp = null

            for (const prop of Array.from(exp.base.properties)) {
              if ((previousProp != null ? previousProp.constructor.name : undefined) === 'Comment') { doc = previousProp }

              if ((prop.value != null ? prop.value.constructor.name : undefined) === 'Code') {
                this.methods.push(new Method(this, prop, this.lineMapping, this.options, doc))
              }

              doc = null
              previousProp = prop
            }
            break
        }
        previousExp = exp
      }
    } catch (error) {
      if (this.options.verbose) { console.warn('File class error:', this.node, error) }
    }
  }

  // Public: Get the full file name with path
  //
  // Returns the file name with path as a {String}.
  getFullName () {
    let fullName = this.fileName

    for (let input of Array.from(this.options.inputs)) {
      input = input.replace(new RegExp('^\\.[\\/]'), '') // Clean leading `./`
      if (!new RegExp(`${Path.sep}$`).test(input)) { input = input + Path.sep } // Append trailing `/`
      input = input.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1') // Escape String
      fullName = fullName.replace(new RegExp(input), '')
    }

    return fullName.replace(Path.sep, '/')
  }

  // Public: Returns the file class name.
  //
  // Returns the file name without path as a {String}.
  getFileName () {
    return Path.basename(this.getFullName())
  }

  // Public: Get the file path
  //
  // Returns the file path as a {String}.
  getPath () {
    let path = Path.dirname(this.getFullName())
    if (path === '.') { path = '' }
    return path
  }
})

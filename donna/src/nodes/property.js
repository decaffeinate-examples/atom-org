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
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Property
const Node = require('./node')
const Doc = require('./doc')

const _ = require('underscore')
_.str = require('underscore.string')

// Public: A class property that is defined by custom property set/get methods.
//
// Examples
//
//   class Test
//
//    get = (props) => @::__defineGetter__ name, getter for name, getter of props
//    set = (props) => @::__defineSetter__ name, setter for name, setter of props
//
//    get name: -> @name
//    set name: (@name) ->
//
module.exports = (Property = class Property extends Node {
  // Public: Construct a new property node.
  //
  // entity - The property's {Class}
  // node - The property node (a {Object})
  // lineMapping - An object mapping the actual position of a member to its Donna one
  // options - The parser options (a {Object})
  // name - The filename (a {String})
  // comment - The comment node (a {Object})
  constructor (entity, node, lineMapping, options, name, comment) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super() }
      const thisFn = (() => { return this }).toString()
      const thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1]
      eval(`${thisName} = this;`)
    }
    this.entity = entity
    this.node = node
    this.lineMapping = lineMapping
    this.options = options
    this.name = name
    this.doc = new Doc(comment, this.options)

    this.setter = false
    this.getter = false
  }

  // Public: Get the source line number
  //
  // Returns a {Number}.
  getLocation () {
    try {
      if (!this.location) {
        const { locationData } = this.node.variable
        const firstLine = locationData.first_line
        this.location = { line: (firstLine - this.lineMapping[firstLine]) + 1 }
      }

      return this.location
    } catch (error) {
      if (this.options.verbose) { return console.warn(`Get location error at ${this.fileName}:`, this.node, error) }
    }
  }

  // Public: Get the property signature.
  //
  // Returns the signature (a {String})
  getSignature () {
    try {
      if (!this.signature) {
        this.signature = ''

        if (this.doc) {
          this.signature += this.doc.property ? `(${_.str.escapeHTML(this.doc.property)}) ` : '(?) '
        }

        this.signature += `<strong>${this.name}</strong>`
      }

      return this.signature
    } catch (error) {
      if (this.options.verbose) { return console.warn('Get property signature error:', this.node, error) }
    }
  }
})

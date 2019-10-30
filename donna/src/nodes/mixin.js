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
let Mixin
const Node = require('./node')
const Method = require('./method')
const Variable = require('./variable')
const Doc = require('./doc')

// Public: The Node representation of a CoffeeScript mixins
//
module.exports = (Mixin = class Mixin extends Node {
  // Public: Construct a mixin
  //
  // node - The mixin node (a {Object})
  // fileName - The filename (a {String})
  // options - The parser options (a {Object})
  // comment - The comment node (a {Object})
  constructor (node, fileName, options, comment) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super() }
      const thisFn = (() => { return this }).toString()
      const thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1]
      eval(`${thisName} = this;`)
    }
    this.node = node
    this.fileName = fileName
    this.options = options
    try {
      this.methods = []
      this.variables = []

      this.doc = new Doc(comment, this.options)

      let previousExp = null

      for (const exp of Array.from(this.node.value.base.properties)) {
        // Recognize assigned code on the mixin
        var doc
        if (exp.constructor.name === 'Assign') {
          if ((previousExp != null ? previousExp.constructor.name : undefined) === 'Comment') { doc = previousExp }

          if ((exp.value != null ? exp.value.constructor.name : undefined) === 'Code') {
            this.methods.push(new Method(this, exp, this.options, doc))
          }

          // Recognize concerns as inner mixins
          if ((exp.value != null ? exp.value.constructor.name : undefined) === 'Value') {
            switch (exp.variable.base.value) {
              case 'ClassMethods':
                this.classMixin = new Mixin(exp, this.filename, this.options, doc)
                break

              case 'InstanceMethods':
                this.instanceMixin = new Mixin(exp, this.filename, options, doc)
                break
            }
          }
        }

        doc = null
        previousExp = exp
      }

      if ((this.classMixin != null) && (this.instanceMixin != null)) {
        let method
        this.concern = true

        for (method of Array.from(this.classMixin.getMethods())) {
          method.type = 'class'
          this.methods.push(method)
        }

        for (method of Array.from(this.instanceMixin.getMethods())) {
          method.type = 'instance'
          this.methods.push(method)
        }
      } else {
        this.concern = false
      }
    } catch (error) {
      if (this.options.verbose) { console.warn('Create mixin error:', this.node, error) }
    }
  }

  // Public: Get the source file name.
  //
  // Returns the filename of the mixin (a {String}).
  getFileName () { return this.fileName }

  // Public: Get the mixin doc
  //
  // Returns the mixin doc (a [Doc])
  getDoc () { return this.doc }

  // Public: Get the full mixin name
  //
  // Returns full mixin name (a {String}).
  getMixinName () {
    try {
      if (!this.mixinName) {
        let name = []
        if (this.node.variable.base.value !== 'this') { name = [this.node.variable.base.value] }
        for (const p of Array.from(this.node.variable.properties)) { name.push(p.name.value) }
        this.mixinName = name.join('.')
      }

      return this.mixinName
    } catch (error) {
      if (this.options.verbose) { return console.warn('Get mixin full name error:', this.node, error) }
    }
  }

  // Public: Alias for {::getMixinName}
  getFullName () {
    return this.getMixinName()
  }

  // Public: Gets the mixin name
  //
  // Returns the name (a {String}).
  getName () {
    try {
      if (!this.name) {
        this.name = this.getMixinName().split('.').pop()
      }

      return this.name
    } catch (error) {
      if (this.options.verbose) { return console.warn('Get mixin name error:', this.node, error) }
    }
  }

  // Public: Get the mixin namespace
  //
  // Returns the namespace (a {String}).
  getNamespace () {
    try {
      if (!this.namespace) {
        this.namespace = this.getMixinName().split('.')
        this.namespace.pop()

        this.namespace = this.namespace.join('.')
      }

      return this.namespace
    } catch (error) {
      if (this.options.verbose) { return console.warn('Get mixin namespace error:', this.node, error) }
    }
  }

  // Public: Get all methods.
  //
  // Returns an {Array} of all the {Method}s.
  getMethods () { return this.methods }

  // Get all variables.
  //
  // Returns an {Array} of all the {Variable}s.
  getVariables () { return this.variables }
})

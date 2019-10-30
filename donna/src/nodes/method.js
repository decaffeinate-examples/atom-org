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
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Method
const Node = require('./node')
const Parameter = require('./parameter')
const Doc = require('./doc')

const _ = require('underscore')
_.str = require('underscore.string')

// Public: The Node representation of a CoffeeScript method.
module.exports = (Method = class Method extends Node {
  // Public: Constructs the documentation node.
  //
  // entity - The method's {Class}
  // node - The method node (a {Object})
  // fileName - The filename (a {String})
  // lineMapping - An object mapping the actual position of a member to its Donna one
  // options - The parser options (a {Object})
  // comment - The comment node (a {Object})
  constructor (entity, node, lineMapping, options, comment) {
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
    try {
      this.parameters = []

      this.doc = new Doc(comment, this.options)

      for (const param of Array.from(this.node.value.params)) {
        if ((param.name.properties != null) && (param.name.properties[0].base != null)) {
          for (const property of Array.from(param.name.properties)) {
            this.parameters.push(new Parameter(param, this.options, true))
          }
        } else {
          this.parameters.push(new Parameter(param, this.options))
        }
      }

      this.getName()
    } catch (error) {
      if (this.options.verbose) { console.warn('Create method error:', this.node, error) }
    }
  }

  // Get the method type, either `class` or `instance`
  //
  // @return {String} the method type
  //
  getType () {
    if (!this.type) {
      switch (this.entity.constructor.name) {
        case 'Class':
          this.type = 'instance'
          break
        case 'Mixin':
          this.type = 'mixin'
          break
        case 'File':
          this.type = 'file'
          break
      }
    }

    return this.type
  }

  // Gets the original location of a method. This is only used for prototypical methods defined in Files
  getOriginalFilename () {
    if (!this.originalFilename) {
      this.originalFilename = this.getDoc().originalFilename
    }

    return this.originalFilename
  }

  // Gets the original name of a method. This is only used for prototypical methods defined in Files
  getOriginalName () {
    if (!this.originalName) {
      this.originalName = this.getDoc().originalName
    }

    return this.originalName
  }

  // Gets the original type of a method. This is only used for prototypical methods defined in Files
  getOriginalType () {
    if (!this.originalType) {
      this.originalType = this.getDoc().originalType
    }

    return this.originalType
  }

  // Get the class doc
  //
  // @return [Doc] the class doc
  //
  getDoc () { return this.doc }

  // Get the full method signature.
  //
  // @return {String} the signature
  //
  getSignature () {
    try {
      if (!this.signature) {
        let optionizedDefaults, paramValue
        this.signature = (() => {
          switch (this.getType()) {
            case 'class':
              return '.'
            case 'instance':
              return '::'
            default:
              if (this.getOriginalFilename() != null) { return '::' } else { return '? ' }
          }
        })()

        const doc = this.getDoc()

        // this adds a superfluous space if there's no type defined
        if (doc.returnValue && doc.returnValue[0].type) {
          const retVals = []
          for (const retVal of Array.from(doc.returnValue)) {
            retVals.push(`${_.str.escapeHTML(retVal.type)}`)
          }
          this.signature = retVals.join('|') + ` ${this.signature}`
        }

        this.signature += `<strong>${this.getOriginalName() || this.getName()}</strong>`
        this.signature += '('

        const params = []
        let paramOptionized = []

        const iterable = this.getParameters()
        for (let i = 0; i < iterable.length; i++) {
          const param = iterable[i]
          if (param.optionized) {
            this.inParamOption = true
            optionizedDefaults = param.getOptionizedDefaults()
            paramOptionized.push(param.getName(i))
          } else {
            if (this.inParamOption) {
              this.inParamOption = false
              paramValue = `{${paramOptionized.join(', ')}}`
              if (optionizedDefaults) { paramValue += `=${optionizedDefaults}` }
              params.push(paramValue)
              paramOptionized = []
            } else {
              params.push(param.getSignature())
            }
          }
        }

        // that means there was only one argument, a param'ed one
        if (paramOptionized.length > 0) {
          paramValue = `{${paramOptionized.join(', ')}}`
          if (optionizedDefaults) { paramValue += `=${optionizedDefaults}` }
          params.push(paramValue)
        }

        this.signature += params.join(', ')
        this.signature += ')'
      }

      return this.signature
    } catch (error) {
      if (this.options.verbose) { return console.warn('Get method signature error:', this.node, error) }
    }
  }

  // Get the short method signature.
  //
  // @return {String} the short signature
  //
  getShortSignature () {
    try {
      if (!this.shortSignature) {
        this.shortSignature = (() => {
          switch (this.getType()) {
            case 'class':
              return '@'
            case 'instance':
              return '.'
            default:
              return ''
          }
        })()
        this.shortSignature += this.getName()
      }

      return this.shortSignature
    } catch (error) {
      if (this.options.verbose) { return console.warn('Get method short signature error:', this.node, error) }
    }
  }

  // Get the method name
  //
  // @return {String} the method name
  //
  getName () {
    try {
      if (!this.name) {
        this.name = this.node.variable.base.value

        // Reserved names will result in a name with a reserved: true property. No Bueno.
        if (this.name.reserved === true) { this.name = this.name.slice(0) }

        for (const prop of Array.from(this.node.variable.properties)) {
          this.name += `.${prop.name.value}`
        }

        if (/^this\./.test(this.name)) {
          this.name = this.name.substring(5)
          this.type = 'class'
        }

        if (/^module.exports\./.test(this.name)) {
          this.name = this.name.substring(15)
          this.type = 'class'
        }

        if (/^exports\./.test(this.name)) {
          this.name = this.name.substring(8)
          this.type = 'class'
        }
      }

      return this.name
    } catch (error) {
      if (this.options.verbose) { return console.warn('Get method name error:', this.node, error) }
    }
  }

  // Public: Get the source line number
  //
  // Returns a {Number}
  //
  getLocation () {
    try {
      if (!this.location) {
        const { locationData } = this.node.variable
        const firstLine = locationData.first_line + 1
        if ((this.lineMapping[firstLine] == null)) {
          this.lineMapping[firstLine] = this.lineMapping[firstLine - 1]
        }

        this.location = { line: this.lineMapping[firstLine] }
      }

      return this.location
    } catch (error) {
      if (this.options.verbose) { return console.warn(`Get location error at ${this.fileName}:`, this.node, error) }
    }
  }

  // Get the method parameters
  //
  // @param [Array<Parameter>] the method parameters
  //
  getParameters () { return this.parameters }
})

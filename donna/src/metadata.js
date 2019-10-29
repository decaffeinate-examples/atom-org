/** @babel */
/* eslint-disable
    no-cond-assign,
    no-fallthrough,
    no-return-assign,
    no-unreachable,
    no-unused-expressions,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Metadata
const fs = require('fs')
const path = require('path')

const _ = require('underscore')
const builtins = require('builtins')

module.exports = (Metadata = class Metadata {
  constructor (dependencies, parser) {
    this.dependencies = dependencies
    this.parser = parser
  }

  generate (root) {
    this.root = root
    this.defs = {} // Local variable definitions
    this.exports = {}
    this.bindingTypes = {}
    this.modules = {}
    this.classes = this.parser.classes
    this.files = this.parser.files

    return this.root.traverseChildren(false, exp => this.visit(exp)) // `no` means Stop at scope boundaries
  }

  visit (exp) {
    return (typeof this[`visit${exp.constructor.name}`] === 'function' ? this[`visit${exp.constructor.name}`](exp) : undefined)
  }

  eval (exp) {
    return this[`eval${exp.constructor.name}`](exp)
  }

  visitComment (exp) {
    // Skip the 1st comment which is added by donna
    if (exp.comment === '~Private~') { }
  }

  visitClass (exp) {
    if (exp.variable == null) { return }
    this.defs[exp.variable.base.value] = this.evalClass(exp)
    return false // Do not traverse into the class methods
  }

  visitAssign (exp) {
    let firstProp
    let key
    const variable = this.eval(exp.variable)
    const value = this.eval(exp.value)

    let baseName = exp.variable.base.value
    switch (baseName) {
      case 'module':
        if (exp.variable.properties.length === 0) { return } // Ignore `module = ...` (atom/src/browser/main.coffee)
        if (__guard__(__guard__(exp.variable.properties != null ? exp.variable.properties[0] : undefined, x1 => x1.name), x => x.value) !== 'exports') {
          throw new Error('BUG: Does not support module.somthingOtherThanExports')
        }
        baseName = 'exports'
        firstProp = exp.variable.properties[1]
        break
      case 'exports':
        firstProp = exp.variable.properties[0]
        break
    }

    switch (baseName) {
      case 'exports':
        // Handle 3 cases:
        //
        // - `exports.foo = SomeClass`
        // - `exports.foo = 42`
        // - `exports = bar`
        if (firstProp) {
          if ((value.base != null) && this.defs[value.base.value]) {
            // case `exports.foo = SomeClass`
            return this.exports[firstProp.name.value] = this.defs[value.base.value]
          } else {
            // case `exports.foo = 42`
            if (firstProp.name.value !== value.name) {
              this.defs[firstProp.name.value] = {
                name: firstProp.name.value,
                bindingType: 'exportsProperty',
                type: value.type,
                range: [[exp.variable.base.locationData.first_line, exp.variable.base.locationData.first_column], [exp.variable.base.locationData.last_line, exp.variable.base.locationData.last_column]]
              }
            }
            return this.exports[firstProp.name.value] =
              { startLineNumber: exp.variable.base.locationData.first_line }
          }
        } else {
          // case `exports = bar`
          this.exports = { _default: value }
          switch (value.type) {
            case 'class':
              return this.bindingTypes[value.name] = 'exports'
          }
        }
        break

      // case left-hand-side is anything other than `exports...`
      default:
        // Handle 5 common cases:
        //
        // X     = ...
        // {X}   = ...
        // {X:Y} = ...
        // X.y   = ...
        // [X]   = ...
        switch (exp.variable.base.constructor.name) {
          case 'Literal':
            // Something we dont care about is on the right side of the `=`.
            // This could be some garbage like an if statement.
            if (!(value != null ? value.range : undefined)) { return }

            // case _.str = ...
            if (exp.variable.properties.length > 0) {
              let keyPath = exp.variable.base.value
              for (const prop of Array.from(exp.variable.properties)) {
                if (prop.name != null) {
                  keyPath += `.${prop.name.value}`
                } else {
                  keyPath += `[${prop.index.base.value}]`
                }
              }
              return this.defs[keyPath] = _.extend({ name: keyPath }, value)
            } else { // case X = ...
              this.defs[exp.variable.base.value] = _.extend({ name: exp.variable.base.value }, value)

              // satisfies the case of npm module requires (like Grim in our tests)
              if (this.defs[exp.variable.base.value].type === 'import') {
                key = this.defs[exp.variable.base.value].path || this.defs[exp.variable.base.value].module
                if (_.isUndefined(this.modules[key])) {
                  this.modules[key] = []
                }

                this.modules[key].push({ name: this.defs[exp.variable.base.value].name, range: this.defs[exp.variable.base.value].range })
              }

              switch (this.defs[exp.variable.base.value].type) {
                case 'function':
                  // FIXME: Ugh. This is so fucked. We shouldnt match on name in all the files in the entire project.
                  return Array.from(this.files).map((file) =>
                    (() => {
                      const result = []
                      for (const method of Array.from(file.methods)) {
                        if (this.defs[exp.variable.base.value].name === method.name) {
                          this.defs[exp.variable.base.value].doc = method.doc.comment
                          break
                        } else {
                          result.push(undefined)
                        }
                      }
                      return result
                    })())
              }
            }
            break

          case 'Obj': case 'Arr':
            for (key of Array.from(exp.variable.base.objects)) {
              switch (key.constructor.name) {
                case 'Value':
                  // case {X} = ...
                  this.defs[key.base.value] = _.extend({}, value, {
                    name: key.base.value,
                    exportsProperty: key.base.value,
                    range: [[key.base.locationData.first_line, key.base.locationData.first_column], [key.base.locationData.last_line, key.base.locationData.last_column]]
                  })

                  // Store the name of the exported property to the module name
                  if (this.defs[key.base.value].type === 'import') { // I *think* this will always be true
                    if (_.isUndefined(this.modules[this.defs[key.base.value].path])) {
                      this.modules[this.defs[key.base.value].path] = []
                    }
                    this.modules[this.defs[key.base.value].path].push({ name: this.defs[key.base.value].name, range: this.defs[key.base.value].range })
                  }
                  break
                case 'Assign':
                  // case {X:Y} = ...
                  this.defs[key.value.base.value] = _.extend({}, value, {
                    name: key.value.base.value,
                    exportsProperty: key.variable.base.value
                  }
                  )
                  return false // Do not continue visiting X
                  break

                default: throw new Error(`BUG: Unsupported require Obj structure: ${key.constructor.name}`)
              }
            }
          default: throw new Error(`BUG: Unsupported require structure: ${exp.variable.base.constructor.name}`)
        }
    }
  }

  visitCode (exp) {}

  visitValue (exp) {}

  visitCall (exp) {}

  visitLiteral (exp) {}

  visitObj (exp) {}

  visitAccess (exp) {}

  visitBlock (exp) {}

  visitTry (exp) {}

  visitIn (exp) {}

  visitExistence (exp) {}

  evalComment (exp) {
    return {
      type: 'comment',
      doc: exp.comment,
      range: [[exp.locationData.first_line, exp.locationData.first_column], [exp.locationData.last_line, exp.locationData.last_column]]
    }
  }

  evalClass (exp) {
    let name
    const className = exp.variable.base.value
    const superClassName = exp.parent != null ? exp.parent.base.value : undefined
    const classProperties = []
    const prototypeProperties = []

    const classNode = _.find(this.classes, clazz => clazz.getFullName() === className)

    for (const subExp of Array.from(exp.body.expressions)) {
      switch (subExp.constructor.name) {
        // case Prototype-level methods (this.foo = (foo) -> ...)
        case 'Assign':
          var value = this.eval(subExp.value)
          this.defs[`${className}.${value.name}`] = value
          classProperties.push(value)
          break
        case 'Value':
          // case Prototype-level properties (@foo: "foo")
          for (const prototypeExp of Array.from(subExp.base.properties)) {
            var reference
            switch (prototypeExp.constructor.name) {
              case 'Comment':
                value = this.eval(prototypeExp)
                this.defs[`${value.range[0][0]}_line_comment`] = value
                break
              default:
                var isClassLevel = prototypeExp.variable.this

                if (isClassLevel) {
                  name = prototypeExp.variable.properties[0].name.value
                } else {
                  name = prototypeExp.variable.base.value
                }

                // The reserved words are a string with a property: {reserved: true}
                // We dont care about the reserved-ness in the name. It is
                // detrimental as comparisons fail.
                if (name.reserved) { name = name.slice(0) }

                value = this.eval(prototypeExp.value)

                if ((value.constructor != null ? value.constructor.name : undefined) === 'Value') {
                  const lookedUpVar = this.defs[value.base.value]
                  if (lookedUpVar) {
                    if (lookedUpVar.type === 'import') {
                      value = {
                        name,
                        range: [[value.locationData.first_line, value.locationData.first_column], [value.locationData.last_line, value.locationData.last_column]],
                        reference: lookedUpVar
                      }
                    } else {
                      value = _.extend({ name }, lookedUpVar)
                    }
                  } else {
                    // Assigning a simple var
                    value = {
                      type: 'primitive',
                      name,
                      range: [[value.locationData.first_line, value.locationData.first_column], [value.locationData.last_line, value.locationData.last_column]]
                    }
                  }
                } else {
                  value = _.extend({ name }, value)
                }

                // TODO: `value = @eval(prototypeExp.value)` is messing this up
                // interferes also with evalValue
                if (isClassLevel) {
                  value.name = name
                  value.bindingType = 'classProperty'
                  this.defs[`${className}.${name}`] = value
                  classProperties.push(value)

                  if (reference = this.applyReference(prototypeExp)) {
                    this.defs[`${className}.${name}`].reference =
                      { position: reference.range[0] }
                  }
                } else {
                  value.name = name
                  value.bindingType = 'prototypeProperty'
                  this.defs[`${className}::${name}`] = value
                  prototypeProperties.push(value)

                  if (reference = this.applyReference(prototypeExp)) {
                    this.defs[`${className}::${name}`].reference =
                      { position: reference.range[0] }
                  }
                }

                // apply the reference (if one exists)
                if (value.type === 'primitive') {
                  const variable = _.find(classNode != null ? classNode.getVariables() : undefined, variable => variable.name === value.name)
                  value.doc = variable != null ? variable.doc.comment : undefined
                } else if (value.type === 'function') {
                  // find the matching method from the parsed files
                  const func = _.find(classNode != null ? classNode.getMethods() : undefined, method => method.name === value.name)
                  value.doc = func != null ? func.doc.comment : undefined
                }
            }
          }
          true
          break
      }
    }

    return {
      type: 'class',
      name: className,
      superClass: superClassName,
      bindingType: (!_.isUndefined(this.bindingTypes[className]) ? this.bindingTypes[className] : undefined),
      classProperties,
      prototypeProperties,
      doc: (classNode != null ? classNode.doc.comment : undefined),
      range: [[exp.locationData.first_line, exp.locationData.first_column], [exp.locationData.last_line, exp.locationData.last_column]]
    }
  }

  evalCode (exp) {
    return {
      bindingType: 'variable',
      type: 'function',
      paramNames: _.map(exp.params, param => param.name.value),
      range: [[exp.locationData.first_line, exp.locationData.first_column], [exp.locationData.last_line, exp.locationData.last_column]],
      doc: null
    }
  }

  evalValue (exp) {
    if (exp.base) {
      return {
        type: 'primitive',
        name: (exp.base != null ? exp.base.value : undefined),
        range: [[exp.locationData.first_line, exp.locationData.first_column], [exp.locationData.last_line, exp.locationData.last_column]]
      }
    } else {
      throw new Error('BUG? Not sure how to evaluate this value if it does not have .base')
    }
  }

  evalCall (exp) {
    // The only interesting call is `require('foo')`
    if ((exp.variable.base != null ? exp.variable.base.value : undefined) === 'require') {
      let moduleName
      if (exp.args[0].base == null) { return }

      if (!(moduleName = exp.args[0].base != null ? exp.args[0].base.value : undefined)) { return }
      moduleName = moduleName.substring(1, moduleName.length - 1)

      // For npm modules include the version number
      const ver = this.dependencies[moduleName]
      if (ver) { moduleName = `${moduleName}@${ver}` }

      const ret = {
        type: 'import',
        range: [[exp.locationData.first_line, exp.locationData.first_column], [exp.locationData.last_line, exp.locationData.last_column]],
        bindingType: 'variable'
      }

      if (/^\./.test(moduleName)) {
        // Local module
        ret.path = moduleName
      } else {
        ret.module = moduleName
      }
      // Tag builtin NodeJS modules
      if (builtins.indexOf(moduleName) >= 0) { ret.builtin = true }

      return ret
    } else {
      return {
        type: 'function',
        range: [[exp.locationData.first_line, exp.locationData.first_column], [exp.locationData.last_line, exp.locationData.last_column]]
      }
    }
  }

  evalError (str, exp) {
    throw new Error(`BUG: Not implemented yet: ${str}. Line ${exp.locationData.first_line}`)
  }

  evalAssign (exp) { return this.eval(exp.value) } // Support x = y = z

  evalLiteral (exp) { return this.evalError('evalLiteral', exp) }

  evalObj (exp) { return this.evalError('evalObj', exp) }

  evalAccess (exp) { return this.evalError('evalAccess', exp) }

  evalUnknown (exp) { return exp }
  evalIf () { return this.evalUnknown(arguments) }
  visitIf () {}
  visitFor () {}
  visitParam () {}
  visitOp () {}
  visitArr () {}
  visitNull () {}
  visitBool () {}
  visitIndex () {}
  visitParens () {}
  visitReturn () {}
  visitUndefined () {}

  evalOp (exp) { return exp }

  applyReference (prototypeExp) {
    for (const module in this.modules) {
      const references = this.modules[module]
      for (const reference of Array.from(references)) {
        // non-npm module case (local file ref)
        var ref
        if ((prototypeExp.value.base != null ? prototypeExp.value.base.value : undefined)) {
          ref = prototypeExp.value.base.value
        } else {
          ref = prototypeExp.value.base
        }

        if (reference.name === ref) {
          return reference
        }
      }
    }
  }
})

function __guard__ (value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined
}

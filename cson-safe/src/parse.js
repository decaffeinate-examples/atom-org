/** @babel */
/* eslint-disable
    no-eval,
    no-undef,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/*
Copyright (c) 2014, Groupon, Inc.
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:

Redistributions of source code must retain the above copyright notice,
this list of conditions and the following disclaimer.

Redistributions in binary form must reproduce the above copyright
notice, this list of conditions and the following disclaimer in the
documentation and/or other materials provided with the distribution.

Neither the name of GROUPON nor the names of its contributors may be
used to endorse or promote products derived from this software without
specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

const { nodes } = require('coffee-script')

const defaultReviver = (key, value) => value

const nodeTypeString = csNode => csNode.constructor.name

const syntaxErrorMessage = function (csNode, msg) {
  let column, line
  const {
    first_line: lineIdx,
    first_column: columnIdx
  } = csNode.locationData
  if (lineIdx != null) { line = lineIdx + 1 }
  if (columnIdx != null) { column = columnIdx + 1 }
  return `Syntax error on line ${line}, column ${column}: ${msg}`
}

// See:
// http://www.ecma-international.org/ecma-262/5.1/#sec-15.12.2
const parse = function (source, reviver) {
  if (reviver == null) { reviver = defaultReviver }
  const nodeTransforms = {
    Block (node) {
      const { expressions } = node
      if (!expressions || (expressions.length !== 1)) {
        throw new SyntaxError(syntaxErrorMessage(node, 'One top level value expected'))
      }

      return transformNode(expressions[0])
    },

    Value (node) {
      return transformNode(node.base)
    },

    Bool (node) {
      return node.val === 'true'
    },

    Null () { return null },

    Literal (node) {
      const { value } = node
      try {
        if (value[0] === "'") {
          return eval(value) // we trust the lexer here
        } else {
          return JSON.parse(value)
        }
      } catch (err) {
        throw new SyntaxError(syntaxErrorMessage(node, err.message))
      }
    },

    Arr (node) {
      return node.objects.map(transformNode)
    },

    Obj (node) {
      return node.properties.reduce(
        function (outObject, property) {
          let { variable, value } = property
          if (!variable) { return outObject }
          const keyName = transformKey(variable)
          value = transformNode(value)
          outObject[keyName] =
            reviver.call(outObject, keyName, value)
          return outObject
        },
        {}
      )
    },

    Op (node) {
      if (node.second != null) {
        const left = transformNode(node.first)
        const right = transformNode(node.second)
        switch (node.operator) {
          case '-': return left - right
          case '+': return left + right
          case '*': return left * right
          case '/': return left / right
          case '%': return left % right
          case '&': return left & right
          case '|': return left | right
          case '^': return left ^ right
          case '<<': return left << right
          case '>>>': return left >>> right
          case '>>': return left >> right
          default:
            throw new SyntaxError(syntaxErrorMessage(
              node, `Unknown binary operator ${node.operator}`
            )
            )
        }
      } else {
        switch (node.operator) {
          case '-': return -transformNode(node.first)
          case '~': return ~transformNode(node.first)
          default:
            throw new SyntaxError(syntaxErrorMessage(
              node, `Unknown unary operator ${node.operator}`
            )
            )
        }
      }
    },

    Parens (node) {
      const { expressions } = node.body
      if (!expressions || (expressions.length !== 1)) {
        throw new SyntaxError(syntaxErrorMessage(
          node, 'Parenthesis may only contain one expression'
        )
        )
      }

      return transformNode(expressions[0])
    }
  }

  const isLiteral = csNode => LiteralTypes.some(LiteralType => csNode instanceof LiteralType)

  var transformKey = function (csNode) {
    const type = nodeTypeString(csNode)
    switch (type) {
      case 'Value':
        var { value } = csNode.base
        switch (value[0]) {
          case '\'': return eval(value) // we trust the lexer here
          case '"': return JSON.parse(value)
          default: return value
        }

      default:
        throw new SyntaxError(syntaxErrorMessage(csNode, `${type} used as key`))
    }
  }

  var transformNode = function (csNode) {
    const type = nodeTypeString(csNode)
    const transform = nodeTransforms[type]

    if (!transform) {
      throw new SyntaxError(syntaxErrorMessage(csNode, `Unexpected ${type}`))
    }

    return transform(csNode)
  }

  if (typeof reviver !== 'function') {
    throw new TypeError('reviver has to be a function')
  }

  const coffeeAst = nodes(source.toString('utf8'))
  const parsed = transformNode(coffeeAst)
  if (reviver === defaultReviver) { return parsed }
  const contextObj = {}
  contextObj[''] = parsed
  return reviver.call(contextObj, '', parsed)
}

module.exports = parse

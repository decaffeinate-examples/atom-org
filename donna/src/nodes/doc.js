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
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Doc
const _ = require('underscore')
const Node = require('./node')

// Public: A documentation node is responsible for parsing
// the comments for known tags.
//
module.exports = (Doc = class Doc extends Node {
  // Public: Construct a documentation node.
  //
  // node - The comment node (a {Object})
  // options - The parser options (a {Object})
  constructor (node, options) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super() }
      const thisFn = (() => { return this }).toString()
      const thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1]
      eval(`${thisName} = this;`)
    }
    this.node = node
    this.options = options
    try {
      if (this.node) {
        const trimmedComment = this.leftTrimBlock(this.node.comment.replace(/\u0091/gm, '').split('\n'))
        this.comment = trimmedComment.join('\n')
      }
    } catch (error) {
      if (this.options.verbose) { console.warn('Create doc error:', this.node, error) }
    }
  }

  leftTrimBlock (lines) {
    // Detect minimal left trim amount
    let line
    const trimMap = _.map(lines, function (line) {
      if (line.length === 0) {
        return undefined
      } else {
        return line.length - _.str.ltrim(line).length
      }
    })

    const minimalTrim = _.min(_.without(trimMap, undefined))

    // If we have a common amount of left trim
    if ((minimalTrim > 0) && (minimalTrim < Infinity)) {
      // Trim same amount of left space on each line
      lines = (() => {
        const result = []
        for (line of Array.from(lines)) {
          line = line.substring(minimalTrim, line.length)
          result.push(line)
        }
        return result
      })()
    }

    return lines
  }
})

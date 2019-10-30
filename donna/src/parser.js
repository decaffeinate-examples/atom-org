/** @babel */
/* eslint-disable
    no-cond-assign,
    no-multi-str,
    no-prototype-builtins,
    no-return-assign,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Parser
const fs = require('fs')
const path = require('path')
const _ = require('underscore')
_.str = require('underscore.string')
const CoffeeScript = require('coffee-script')

const File = require('./nodes/file')
const Class = require('./nodes/class')
const Mixin = require('./nodes/mixin')
const VirtualMethod = require('./nodes/virtual_method')

const { SourceMapConsumer } = require('source-map')

// FIXME: The only reason we use the parser right now is for comment conversion.
// We need to convert the comments to block comments so they show up in the AST.
// This could be done by the {Metadata} class, but just isnt at this point.

// Public: This parser is responsible for converting each file into the intermediate /
// AST representation as a JSON node.
module.exports = (Parser = class Parser {
  // Public: Construct the parser
  //
  // options - An {Object} of options
  constructor (options) {
    if (options == null) { options = {} }
    this.options = options
    this.files = []
    this.classes = []
    this.mixins = []
    this.iteratedFiles = {}
    this.fileCount = 0
    this.globalStatus = 'Private'
  }

  // Public: Parse the given CoffeeScript file.
  //
  // filePath - {String} absolute path name
  parseFile (filePath, relativeTo) {
    const content = fs.readFileSync(filePath, 'utf8')
    const relativePath = path.normalize(filePath.replace(relativeTo, `.${path.sep}`))
    this.parseContent(content, relativePath)
    this.iteratedFiles[relativePath] = content
    return this.fileCount += 1
  }

  // Public: Parse the given CoffeeScript content.
  //
  // content - A {String} representing the CoffeeScript file content
  // file - A {String} representing the CoffeeScript file name
  //
  parseContent (content, file) {
    let root
    this.content = content
    if (file == null) { file = '' }
    this.previousNodes = []
    this.globalStatus = 'Private'

    // Defines typical conditions for entities we are looking through nodes
    const entities = {
      clazz (node) { return (node.constructor.name === 'Class') && (__guard__(node.variable != null ? node.variable.base : undefined, x => x.value) != null) },
      mixin (node) { return (node.constructor.name === 'Assign') && (__guard__(node.value != null ? node.value.base : undefined, x => x.properties) != null) }
    }

    const [convertedContent, lineMapping] = Array.from(this.convertComments(this.content))

    const sourceMap = CoffeeScript.compile(convertedContent, { sourceMap: true }).v3SourceMap
    this.smc = new SourceMapConsumer(sourceMap)

    try {
      root = CoffeeScript.nodes(convertedContent)
    } catch (error) {
      if (this.options.debug) { console.log('Parsed CoffeeScript source:\n%s', convertedContent) }
      throw error
    }

    // Find top-level methods and constants that aren't within a class
    const fileClass = new File(root, file, lineMapping, this.options)
    this.files.push(fileClass)

    this.linkAncestors(root)

    root.traverseChildren(true, child => {
      let entity = false

      for (const type in entities) {
        const condition = entities[type]
        if (entities.hasOwnProperty(type)) {
          if (condition(child)) { entity = type }
        }
      }

      if (entity) {
        // Check the previous tokens for comment nodes
        let doc
        const previous = this.previousNodes[this.previousNodes.length - 1]
        switch ((previous != null ? previous.constructor.name : undefined)) {
          // A comment is preceding the class declaration
          case 'Comment':
            doc = previous
            break
          case 'Literal':
            // The class is exported `module.exports = class Class`, take the comment before `module`
            if (previous.value === 'exports') {
              const node = this.previousNodes[this.previousNodes.length - 6]
              if ((node != null ? node.constructor.name : undefined) === 'Comment') { doc = node }
            }
            break
        }

        if (entity === 'mixin') {
          const name = [child.variable.base.value]

          // If p.name is empty value is going to be assigned to index...
          for (const p of Array.from(child.variable.properties)) { name.push(p.name != null ? p.name.value : undefined) }

          // ... and therefore should be just skipped.
          if (name.indexOf(undefined) === -1) {
            const mixin = new Mixin(child, file, this.options, doc)

            if ((mixin.doc.mixin != null) && (this.options.private || !mixin.doc.private)) {
              this.mixins.push(mixin)
            }
          }
        }

        if (entity === 'clazz') {
          const clazz = new Class(child, file, lineMapping, this.options, doc)
          this.classes.push(clazz)
        }
      }

      this.previousNodes.push(child)
      return true
    })

    return root
  }

  // Public: Converts the comments to block comments, so they appear in the node structure.
  // Only block comments are considered by Donna.
  //
  // content - A {String} representing the CoffeeScript file content
  convertComments (content) {
    const result = []
    let comment = []
    let inComment = false
    let inBlockComment = false
    let indentComment = 0
    let globalCount = 0
    const lineMapping = {}

    const iterable = content.split('\n')
    for (let l = 0; l < iterable.length; l++) {
      const line = iterable[l]
      let globalStatusBlock = false

      // key: the translated line number; value: the original number
      lineMapping[(l + 1) + globalCount] = l + 1

      if (globalStatusBlock = /^\s*#{3} (\w+).+?#{3}/.exec(line)) {
        result.push('')
        this.globalStatus = globalStatusBlock[1]
      }

      const blockComment = /^\s*#{3,}/.exec(line) && !/^\s*#{3,}.+#{3,}/.exec(line)

      if (blockComment || inBlockComment) {
        if (blockComment) { inBlockComment = !inBlockComment }
        result.push(line)
      } else {
        const commentLine = /^(\s*#)\s?(\s*.*)/.exec(line)
        if (commentLine) {
          let commentText = commentLine[2] != null ? commentLine[2].replace(/#/g, '\u0091#') : undefined
          if (!inComment) {
            // append current global status flag if needed
            if (!/^\s*\w+:/.test(commentText)) {
              commentText = this.globalStatus + ': ' + commentText
            }
            inComment = true
            indentComment = commentLine[1].length - 1
            commentText = `### ${commentText}`
          }

          comment.push(whitespace(indentComment) + commentText)
        } else {
          if (inComment) {
            inComment = false
            const lastComment = _.last(comment)

            // slight fix for an empty line as the last item
            if (_.str.isBlank(lastComment)) {
              globalCount++
              comment[comment.length] = lastComment + ' ###'
            } else {
              comment[comment.length - 1] = lastComment + ' ###'
            }

            // Push here comments only before certain lines
            if (new RegExp('\
(\
class\\s*[$A-Za-z_\\x7f-\\uffff][$\\w\\x7f-\\uffff]*\
|\
^\\s*[$A-Za-z_\\x7f-\\uffff][$\\w\\x7f-\\uffff.]*\\s+\\=\
|\
[$A-Za-z_\\x7f-\\uffff][$\\w\\x7f-\\uffff]*\\s*:\\s*(\\(.*\\)\\s*)?[-=]>\
|\
@[A-Za-z_\\x7f-\\uffff][$\\w\\x7f-\\uffff]*\\s*=\\s*(\\(.*\\)\\s*)?[-=]>\
|\
[$A-Za-z_\\x7f-\\uffff][\\.$\\w\\x7f-\\uffff]*\\s*=\\s*(\\(.*\\)\\s*)?[-=]>\
|\
^\\s*@[$A-Z_][A-Z_]*)\
|\
^\\s*[$A-Za-z_\\x7f-\\uffff][$\\w\\x7f-\\uffff]*:\\s*\\S+\
').exec(line)) {
              for (const c of Array.from(comment)) { result.push(c) }
            }
            comment = []
          }
          // A member with no preceding description; apply the global status
          const member = new RegExp('\
(\
class\\s*[$A-Za-z_\\x7f-\\uffff][$\\w\\x7f-\\uffff]*\
|\
^\\s*[$A-Za-z_\\x7f-\\uffff][$\\w\\x7f-\\uffff.]*\\s+\\=\
|\
[$A-Za-z_\\x7f-\\uffff][$\\w\\x7f-\\uffff]*\\s*:\\s*(\\(.*\\)\\s*)?[-=]>\
|\
@[A-Za-z_\\x7f-\\uffff][$\\w\\x7f-\\uffff]*\\s*=\\s*(\\(.*\\)\\s*)?[-=]>\
|\
[$A-Za-z_\\x7f-\\uffff][\\.$\\w\\x7f-\\uffff]*\\s*=\\s*(\\(.*\\)\\s*)?[-=]>\
|\
^\\s*@[$A-Z_][A-Z_]*)\
|\
^\\s*[$A-Za-z_\\x7f-\\uffff][$\\w\\x7f-\\uffff]*:\\s*\\S+\
').exec(line)

          if (member && _.str.isBlank(_.last(result))) {
            indentComment = /^(\s*)/.exec(line)
            if (indentComment) {
              indentComment = indentComment[1]
            } else {
              indentComment = ''
            }

            globalCount++
          }

          result.push(line)
        }
      }
    }

    return [result.join('\n'), lineMapping]
  }

  // Public: Attach each parent to its children, so we are able
  // to traverse the ancestor parse tree. Since the
  // parent attribute is already used in the class node,
  // the parent is stored as `ancestor`.
  //
  // nodes - A {Base} representing the CoffeeScript nodes
  //
  linkAncestors (node) {
    return node.eachChild(child => {
      child.ancestor = node
      return this.linkAncestors(child)
    })
  }
})

var whitespace = function (n) {
  const a = []
  while (a.length < n) {
    a.push(' ')
  }
  return a.join('')
}

function __guard__ (value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined
}

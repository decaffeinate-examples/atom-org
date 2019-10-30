/** @babel */
/* eslint-disable
    node/no-deprecated-api,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const moduleCompilation = require('./module-compilation')
const serialization = require('./serialization')
const fs = require('fs')

const readModuleContent = function (module) {
  const content = fs.readFileSync(module.filename)
  const header = new Buffer('(function (exports, require, module, __filename, __dirname) {')
  const footer = new Buffer('\n});')
  return Buffer.concat([header, content, footer])
}

const serializeModule = function (module) {
  // Prevent duplicate cache.
  if (module.serialized) {
    return null
  } else {
    module.serialized = true
  }

  return {
    id: module.id,
    filename: module.filename,
    paths: module.paths,
    children: []
  }
}

var dumpModuleTree = function (parent, predicate) {
  // The user wants to skip this tree.
  if (!predicate(parent.filename)) { return null }

  const root = serializeModule(parent)
  if (root == null) { return null }

  for (const module of Array.from(parent.children)) {
    const serialized = dumpModuleTree(module, predicate)

    // Skip this module.
    if (serialized == null) { continue }

    // Only cache content of .js file.
    if (moduleCompilation.getExtension(module) === '.js') {
      serialized.content = readModuleContent(module)
    }

    root.children.push(serialized)
  }
  return root
}

const snapshot = (parent, predicate) => serialization.serialize(dumpModuleTree(parent, predicate))

exports.snapshot = snapshot

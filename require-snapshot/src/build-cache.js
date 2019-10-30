/** @babel */
/* eslint-disable
    no-return-assign,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const moduleCompilation = require('./module-compilation')
const serialization = require('./serialization')

const buildCacheFromLeaf = function (cache, parent, leaf) {
  // Do not override existing cache.
  if (cache[leaf.filename]) { return cache[leaf.filename] }

  const module = {
    id: leaf.id,
    parent,
    exports: {},
    filename: leaf.filename,
    loaded: true,
    children: [],
    paths: leaf.paths
  }

  console.log('Adding module', module.filename)
  buildCacheFromLeaves(cache, module, leaf.children)

  // Compile after all the children have been compiled, otherwise the cache would
  // not be hit.
  console.log('Compiling module', module.filename)
  moduleCompilation.compileModule(module, leaf.content)

  // Add parent's children array (it's not used by node actually).
  parent.children.push(module)
  // Add to cache.
  return cache[leaf.filename] = module
}

var buildCacheFromLeaves = (cache, parent, leaves) => Array.from(leaves).map((module) => buildCacheFromLeaf(cache, parent, module))

const buildCacheFromTree = function (cache, root, tree) {
  if (root.filename !== tree.filename) {
    console.error(`Cache file is for ${tree.filename}`)
    return
  }

  return buildCacheFromLeaves(cache, root, tree.children)
}

const buildCache = (cache, root, str) => buildCacheFromTree(cache, root, serialization.deserialize(str))

exports.buildCache = buildCache

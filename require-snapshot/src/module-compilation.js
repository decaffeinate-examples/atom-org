/** @babel */
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const path = require('path')
const vm = require('vm')
const Module = require('module')

const getExtension = function (module) {
  let left
  let extension = (left = path.extname(module.filename)) != null ? left : '.js'
  if (Module._extensions[extension] == null) { extension = '.js' }
  return extension
}

const compileJSModule = function (module, content) {
  const require = path => Module._load(path, module)
  require.resolve = request => Module._resolveFilename(request, module)
  require.main = process.mainModule
  require.extensions = Module._extensions
  require.cache = Module._cache

  const {
    exports
  } = module
  const {
    filename
  } = module
  const dirname = path.dirname(filename)

  const compiled = vm.runInThisContext(content, { filename })
  return compiled.apply(exports, [exports, require, module, filename, dirname])
}

const compileOtherModule = function (module) {
  module.require = path => Module._load(path, module)
  module._compile = Module.prototype._compile.bind(module)

  return Module._extensions[getExtension(module)](module, module.filename)
}

const compileModule = function (module, content) {
  if (content != null) {
    return compileJSModule(module, content)
  } else {
    return compileOtherModule(module)
  }
}

exports.getExtension = getExtension
exports.compileModule = compileModule

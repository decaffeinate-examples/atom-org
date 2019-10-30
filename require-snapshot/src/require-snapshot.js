/** @babel */
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {
  snapshot
} = require('./snapshot')
const {
  buildCache
} = require('./build-cache')

exports.save = function (module, filter) {
  if (filter == null) { filter = () => true }
  if (module == null) { throw new TypeError('Bad argument') }
  return snapshot(module, filter)
}

exports.restore = function (module, cacheContent) {
  if ((module == null) || (cacheContent == null)) { throw new TypeError('Bad argument') }
  return buildCache(require.cache, module, cacheContent)
}

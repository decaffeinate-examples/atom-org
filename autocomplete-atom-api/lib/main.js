/** @babel */
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
const provider = require('./provider')

module.exports = {
  activate () { return provider.load() },

  getProvider () { return provider }
}

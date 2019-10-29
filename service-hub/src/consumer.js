/** @babel */
/* eslint-disable
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
let Consumer
const { Range } = require('semver')

module.exports =
(Consumer = class Consumer {
  constructor (keyPath, versionRange, callback) {
    this.keyPath = keyPath
    this.callback = callback
    this.versionRange = new Range(versionRange)
  }
})

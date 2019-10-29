/** @babel */
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
const SpecChecker = require('./spec-checker')

class KnownUnicodeSpecChecker extends SpecChecker {
  constructor () {
    super('known-unicode', false, ['абырг'])
  }
}

const checker = new KnownUnicodeSpecChecker()
module.exports = checker

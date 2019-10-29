/** @babel */
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
const SpecChecker = require('./spec-checker')

class EndOfTestSpecChecker extends SpecChecker {
  constructor () {
    super('eot', true, ['eot'])
  }
}

const checker = new EndOfTestSpecChecker()
module.exports = checker

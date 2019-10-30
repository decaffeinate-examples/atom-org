/** @babel */
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
const SpecChecker = require('./spec-checker')

class Known4SpecChecker extends SpecChecker {
  constructor () {
    super('known-4', true, ['k4a', 'k0c', 'k0a'])
  }
}

const checker = new Known4SpecChecker()
module.exports = checker

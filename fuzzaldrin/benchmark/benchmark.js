/** @babel */
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require('fs')
const path = require('path')

const { filter, match } = require('../src/fuzzaldrin')

const lines = fs.readFileSync(path.join(__dirname, 'data.txt'), 'utf8').trim().split('\n')

let startTime = Date.now()
const results = filter(lines, 'index')
console.log(`Filtering ${lines.length} entries for 'index' took ${Date.now() - startTime}ms for ${results.length} results`)

startTime = Date.now()
for (const line of Array.from(lines)) { match(line, 'index') }
console.log(`Matching ${lines.length} entries for 'index' took ${Date.now() - startTime}ms for ${results.length} results`)

if (results.length !== 6168) {
  console.error(`Results count changed! ${results.length} instead of 6168`)
  process.exit(1)
}

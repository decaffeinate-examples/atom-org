/** @babel */
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
const Builder = require('./builder')
const builder = new Builder()

exports.$$ = fn => builder.buildElement(fn)

/** @babel */
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const path = require('path')
const donna = require('donna')
const tello = require('tello')

module.exports = grunt => grunt.registerTask('atomdoc', 'Generate an atomdoc api.json file', function () {
  const rootPath = path.resolve('.')
  const outputPath = path.resolve('api.json')

  const metadata = donna.generateMetadata([rootPath])
  const digestedMetadata = tello.digest(metadata)
  const api = JSON.stringify(digestedMetadata, null, 2)
  return grunt.file.write(outputPath, api)
})

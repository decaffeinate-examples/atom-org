/** @babel */
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
module.exports = grunt => grunt.registerTask('pack', function () {
  const cpack = grunt.config('cpack')
  const done = this.async()
  return grunt.util.spawn(cpack, function (error, output, code) {
    if (error) { grunt.log.error(error) }
    if (output) { grunt.log.writeln(output) }
    return done(error)
  })
})

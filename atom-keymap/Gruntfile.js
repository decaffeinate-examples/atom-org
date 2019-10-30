/** @babel */
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
module.exports = function (grunt) {
  grunt.initConfig({
    shell: {
      'update-atomdoc': {
        command: 'npm update grunt-atomdoc donna tello atomdoc',
        options: {
          stdout: true,
          stderr: true,
          failOnError: true
        }
      }
    }
  })

  grunt.loadNpmTasks('grunt-shell')
  return grunt.loadNpmTasks('grunt-atomdoc')
}

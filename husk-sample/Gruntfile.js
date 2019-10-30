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
    pkg: grunt.file.readJSON('package.json'),

    coffeelint: {
      options: {
        no_empty_param_list: {
          level: 'error'
        },
        max_line_length: {
          level: 'ignore'
        }
      },

      src: ['src/*.coffee'],
      test: ['spec/*.coffee']
    }
  })

  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.loadNpmTasks('grunt-coffeelint')

  grunt.registerTask('clean', () => require('rimraf').sync('lib'))
  grunt.registerTask('lint', ['coffeelint:src', 'coffeelint:test'])
  return grunt.registerTask('default', ['lint'])
}

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

    coffee: {
      glob_to_multiple: {
        expand: true,
        cwd: 'src',
        src: ['*.coffee'],
        dest: 'lib',
        ext: '.js'
      }
    },

    coffeelint: {
      options: {
        max_line_length: {
          level: 'ignore'
        }
      },

      src: ['src/**/*.coffee'],
      test: ['spec/**/*.coffee']
    },

    shell: {
      test: {
        command: 'node node_modules/jasmine-focused/bin/jasmine-focused --captureExceptions --coffee spec/',
        options: {
          stdout: true,
          stderr: true,
          failOnError: true
        }
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.loadNpmTasks('grunt-shell')
  grunt.loadNpmTasks('grunt-coffeelint')
  grunt.registerTask('default', ['coffee', 'coffeelint'])
  grunt.registerTask('test', ['default', 'shell:test'])
  return grunt.registerTask('clean', function () {
    const rm = require('rimraf').sync
    return rm('lib')
  })
}

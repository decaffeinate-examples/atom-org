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
        no_empty_param_list: {
          level: 'error'
        }
      },

      src: ['src/**/*.coffee'],
      spec: ['spec/**/*.coffee']
    },

    shell: {
      test: {
        command: 'node node_modules/jasmine-node/bin/jasmine-node --captureExceptions --coffee spec/',
        options: {
          stdout: true,
          stderr: true,
          failOnError: true
        }
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.loadNpmTasks('grunt-coffeelint')
  grunt.loadNpmTasks('grunt-shell')
  grunt.registerTask('clean', () => require('rimraf').sync('lib'))
  grunt.registerTask('lint', ['coffeelint'])
  grunt.registerTask('test', ['default', 'shell:test'])
  return grunt.registerTask('default', ['lint', 'coffee'])
}

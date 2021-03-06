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

    shell: {
      rebuild: {
        command: 'npm build .',
        options: {
          stdout: true,
          stderr: true,
          failOnError: true
        }
      },

      clean: {
        command: 'rm -fr build lib',
        options: {
          stdout: true,
          stderr: true,
          failOnError: true
        }
      },

      test: {
        command: 'npm test',
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
  grunt.registerTask('default', ['coffee', 'shell:rebuild'])
  grunt.registerTask('test', ['default', 'shell:test'])
  return grunt.registerTask('clean', ['shell:clean'])
}

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
        configFile: 'coffeelint.json'
      },

      gruntfile: ['Gruntfile.coffee'],
      src: ['src/*.coffee'],
      test: ['spec/*.coffee']
    },

    shell: {
      test: {
        command: 'node node_modules/.bin/jasmine-focused --captureExceptions --coffee spec',
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
  grunt.loadTasks('tasks')

  grunt.registerTask('clean', function () {
    if (grunt.file.exists('lib')) { grunt.file.delete('lib') }
    if (grunt.file.exists('gen')) { return grunt.file.delete('gen') }
  })

  grunt.registerTask('lint', ['coffeelint'])
  grunt.registerTask('default', ['coffeelint', 'coffee', 'build-grammars'])
  grunt.registerTask('test', ['default', 'lint', 'shell:test'])
  return grunt.registerTask('prepublish', ['clean', 'build-grammars', 'test'])
}

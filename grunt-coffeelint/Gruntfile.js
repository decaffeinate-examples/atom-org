/** @babel */
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({

    coffeelint: {
      // global options
      options: {
        indentation: {
          value: 4,
          level: 'warn'
        }
      },

      // a target that overrides default options
      one: {
        files: {
          src: ['test/fixtures/*.coffee']
        },
        options: {
          indentation: {
            value: 2,
            level: 'warn'
          },
          no_trailing_semicolons: {
            level: 'warn'
          }
        }
      },

      // a simple target
      two: ['test/fixtures/correct.coffee', 'test/fixtures/some.coffee']
    },

    bump: {
      options: {
        pushTo: 'upstream'
      }
    }
  })

  // Load local tasks.
  grunt.loadTasks('tasks')

  grunt.loadNpmTasks('grunt-npm')
  grunt.loadNpmTasks('grunt-bump')
  grunt.loadNpmTasks('grunt-auto-release')

  // Default task.
  grunt.registerTask('default', 'coffeelint')

  grunt.registerTask('test', 'coffeelint')

  return grunt.registerTask('release', 'Bump version, push to NPM.', type => grunt.task.run([
    `bump:${type || 'patch'}`,
    'npm-publish'
  ]))
}

module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')

    coffee:
      glob_to_multiple:
        expand: true
        cwd: '.'
        src: ['index.coffee']
        dest: 'tasks'
        ext: '.js'

    coffeelint:
      options:
        no_empty_param_list:
          level: 'error'
        max_line_length:
          level: 'ignore'
      src: ['*.coffee']

  grunt.loadNpmTasks('grunt-coffeelint')
  grunt.loadNpmTasks('grunt-contrib-coffee')

  grunt.registerTask 'clean', ->
    grunt.file.delete('tasks') if grunt.file.exists('tasks')
  grunt.registerTask('lint', ['coffeelint'])
  grunt.registerTask('default', ['lint', 'coffee'])

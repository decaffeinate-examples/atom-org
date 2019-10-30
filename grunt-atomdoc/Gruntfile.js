/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    coffee: {
      glob_to_multiple: {
        expand: true,
        cwd: '.',
        src: ['index.coffee'],
        dest: 'tasks',
        ext: '.js'
      }
    },

    coffeelint: {
      options: {
        no_empty_param_list: {
          level: 'error'
        },
        max_line_length: {
          level: 'ignore'
        }
      },
      src: ['*.coffee']
    }});

  grunt.loadNpmTasks('grunt-coffeelint');
  grunt.loadNpmTasks('grunt-contrib-coffee');

  grunt.registerTask('clean', function() {
    if (grunt.file.exists('tasks')) { return grunt.file.delete('tasks'); }
  });
  grunt.registerTask('lint', ['coffeelint']);
  return grunt.registerTask('default', ['lint', 'coffee']);
};

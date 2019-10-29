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
        },
        max_line_length: {
          level: 'ignore'
        }
      },

      src: ['src/*.coffee'],
      test: ['spec/*.coffee'],
      gruntfile: ['Gruntfile.coffee']
    },

    shell: {
      test: {
        command: 'node node_modules/jasmine-focused/bin/jasmine-focused --coffee --captureExceptions spec',
        options: {
          stdout: true,
          stderr: true,
          failOnError: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-coffeelint');

  grunt.registerTask('clean', function() {
    const rm = function(pathToDelete) {
      if (grunt.file.exists(pathToDelete)) { return grunt.file.delete(pathToDelete); }
    };
    return rm('lib');
  });

  grunt.registerTask('lint', ['coffeelint']);
  grunt.registerTask('test', ['default', 'shell:test']);
  grunt.registerTask('prepublish', ['clean', 'test']);
  return grunt.registerTask('default', ['coffee', 'lint']);
};

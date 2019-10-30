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
        src: ['**/*.coffee'],
        dest: 'lib',
        ext: '.js'
      }
    },

    coffeelint: {
      options: {
        configFile: 'coffeelint.json'
      },
      src: ['src/**/*.coffee'],
      test: ['spec/*.coffee'],
      gruntfile: ['Gruntfile.coffee']
    },

    shell: {
      test: {
        command: 'node node_modules/jasmine-focused/bin/jasmine-focused --captureExceptions --coffee spec',
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
    if (grunt.file.exists('lib')) { grunt.file.delete('lib'); }
    if (grunt.file.exists('bin/node_darwin_x64')) { return grunt.file.delete('bin/node_darwin_x64'); }
  });

  grunt.registerTask('lint', ['coffeelint']);
  grunt.registerTask('default', ['coffee', 'lint']);
  grunt.registerTask('test', ['clean', 'default', 'shell:test']);
  return grunt.registerTask('prepublish', ['clean', 'coffee', 'lint']);
};

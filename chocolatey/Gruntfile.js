/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
module.exports = function(grunt) {
  grunt.loadTasks('tasks');
  grunt.initConfig({
    releaseUrl: {
      hostname: 'api.github.com',
      path: '/repos/atom/atom/releases?per_page=25',
      headers: {
        'User-Agent': 'node.js/' + process.version
      }
    },
    cpack: {
      cmd: 'cpack',
      args: ['chocolatey/atom.nuspec']
    },
    cinst: {
      cmd: 'cinst',
      args: ['Atom', '-source', __dirname]
    },
    cuninst: {
      cmd: 'cuninst',
      args: ['Atom']
    }});

  grunt.registerTask('update', ['get-release', 'update-nuspec', 'update-install']);
  grunt.registerTask('reinstall', ['pack', 'uninstall', 'install']);
  return grunt.registerTask('default', ['update', 'pack']);
};

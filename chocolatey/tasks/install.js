/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
module.exports = grunt => grunt.registerTask('install', function() {
  const cinst = grunt.config('cinst');
  const done = this.async();
  return grunt.util.spawn(cinst, function(error, output, code) {
    if (error) { grunt.log.error(error); }
    if (output) { grunt.log.writeln(output); }
    return done(error);
  });
});

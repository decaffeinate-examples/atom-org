/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const https = require('https');

module.exports = grunt => grunt.registerTask('get-release', function() {
  const releaseUrl = grunt.config('releaseUrl');
  const done = this.async();
  let json = '';
  return https.get(releaseUrl, function(response) {
    response.on('data', chunk => json += chunk);
    return response.on('end', function() {
      let left;
      for (let release of Array.from((left = JSON.parse(json)) != null ? left : [])) {
        for (let asset of Array.from(release.assets != null ? release.assets : [])) {
          if (asset.name === 'atom-windows.zip') {
            grunt.config('release', release);
            done();
            return;
          }
        }
      }
      return done(new Error('No release found with an atom-windows.zip asset'));
    });
  });
});

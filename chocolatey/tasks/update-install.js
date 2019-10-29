/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
module.exports = grunt => grunt.registerTask('update-install', 'Updates the nuspec for chocolatey', function() {
  const release = grunt.config('release');
  const installScriptPath = 'chocolatey/tools/chocolateyInstall.ps1';
  const versionExp = /(download\/)v[.0-9]*\//i;
  let installScript = grunt.file.read(installScriptPath);
  installScript = installScript.replace(versionExp, '$1' + release.tag_name + '/');
  return grunt.file.write(installScriptPath, installScript);
});

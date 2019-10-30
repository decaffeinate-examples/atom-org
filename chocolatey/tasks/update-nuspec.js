/** @babel */
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const cheerio = require('cheerio')

module.exports = grunt => grunt.registerTask('update-nuspec', 'Updates the nuspec for chocolatey', function () {
  const release = grunt.config('release')
  const nuspecPath = 'chocolatey/atom.nuspec'
  const nuspec = grunt.file.read(nuspecPath)
  const $ = cheerio.load(nuspec,
    { xmlMode: true })
  $('version').text(release.tag_name.replace('v', ''))
  return grunt.file.write(nuspecPath, $.xml())
})

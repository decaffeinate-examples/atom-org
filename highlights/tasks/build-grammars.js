/** @babel */
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const path = require('path')
const fs = require('fs-plus')
const CSON = require('season')

module.exports = grunt => grunt.registerTask('build-grammars', 'Build a single file with included grammars', function () {
  let file
  const grammars = {}
  const depsDir = path.resolve(__dirname, '..', 'deps')
  for (const packageDir of Array.from(fs.readdirSync(depsDir))) {
    const grammarsDir = path.join(depsDir, packageDir, 'grammars')
    if (!fs.isDirectorySync(grammarsDir)) { continue }

    for (file of Array.from(fs.readdirSync(grammarsDir))) {
      const grammarPath = path.join(grammarsDir, file)
      if (!CSON.resolve(grammarPath)) { continue }
      const grammar = CSON.readFileSync(grammarPath)
      grammars[grammarPath] = grammar
    }
  }

  grunt.file.write(path.join('gen', 'grammars.json'), JSON.stringify(grammars))
  return grunt.log.ok(`Wrote ${Object.keys(grammars).length} grammars to gen/grammars.json`)
})

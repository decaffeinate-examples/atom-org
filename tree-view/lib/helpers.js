/** @babel */
/* eslint-disable
    no-undef,
    no-useless-escape,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const path = require('path')

module.exports = {
  repoForPath (goalPath) {
    const iterable = atom.project.getPaths()
    for (let i = 0; i < iterable.length; i++) {
      const projectPath = iterable[i]
      if ((goalPath === projectPath) || (goalPath.indexOf(projectPath + path.sep) === 0)) {
        return atom.project.getRepositories()[i]
      }
    }
    return null
  },

  getStyleObject (el) {
    const styleProperties = window.getComputedStyle(el)
    const styleObject = {}
    for (const property in styleProperties) {
      const value = styleProperties.getPropertyValue(property)
      const camelizedAttr = property.replace(/\-([a-z])/g, (a, b) => b.toUpperCase())
      styleObject[camelizedAttr] = value
    }
    return styleObject
  },

  getFullExtension (filePath) {
    const basename = path.basename(filePath)
    const position = basename.indexOf('.')
    if (position > 0) { return basename.slice(position) } else { return '' }
  }
}

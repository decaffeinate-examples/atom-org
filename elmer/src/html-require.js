/** @babel */
/* eslint-disable
    no-return-assign,
    no-unused-vars,
    node/no-deprecated-api,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let HTMLRequire
const fs = require('fs')

// Public:
module.exports =
(HTMLRequire = class HTMLRequire {
  static register () {
    return require.extensions['.html'] != null ? require.extensions['.html'] : (require.extensions['.html'] = function (module, filePath) {
      const html = fs.readFileSync(filePath, 'utf8')
      const template = document.createElement('template')
      template.innerHTML = html
      const docFragment = template.content
      return module.exports = new HTMLRequire(template.content)
    })
  }

  constructor (documentFragment) {
    this.documentFragment = documentFragment
  }

  getDocumentFragment () { return this.documentFragment }

  clone () {
    return this.documentFragment.cloneNode(true)
  }
})

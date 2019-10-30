/** @babel */
/* eslint-disable
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
exports.registerElement = require('./register-element')

require('./html-require').register()

// Include all the global polymer stuff. DIRTY.
if (HTMLTemplateElement.prototype.bindingDelegate == null) {
  // This is required by the polymer stuff. It can be noop'd because
  // Object.observe is built into chrome.
  global.Platform =
    { performMicrotaskCheckpoint () {} }

  require('Node-bind/src/NodeBind')
  require('TemplateBinding/src/TemplateBinding')
  require('observe-js')
  global.esprima = require('polymer-expressions/third_party/esprima/esprima').esprima
  const { PolymerExpressions } = require('polymer-expressions/src/polymer-expressions')

  HTMLTemplateElement.prototype.bindingDelegate = new PolymerExpressions()
}

/** @babel */
/* eslint-disable
    no-undef,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

// Public:
let registerElement
module.exports =
(registerElement = function (elementName, elementPrototype) {
  let tagToExtend = null
  let classToExtend = null

  if (typeof elementPrototype.extends === 'string') {
    tagToExtend = elementPrototype.extends
  } else if (elementPrototype.extends != null) {
    classToExtend = elementPrototype.extends
  }

  if (classToExtend == null) { classToExtend = HTMLElement }

  const prototype = Object.create(classToExtend.prototype)
  for (const key in elementPrototype) { const value = elementPrototype[key]; prototype[key] = value }
  const registerArgs = { prototype }
  if (tagToExtend != null) { registerArgs.extends = tagToExtend }

  const viewClass = document.registerElement(elementName, registerArgs)

  if ((elementPrototype.modelConstructor != null) && (__guard__(typeof atom !== 'undefined' && atom !== null ? atom.views : undefined, x => x.addViewProvider) != null)) {
    atom.views.addViewProvider({
      modelConstructor: elementPrototype.modelConstructor,
      viewConstructor: viewClass
    })
  }

  return viewClass
})

function __guard__ (value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined
}

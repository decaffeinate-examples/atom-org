/** @babel */
/* eslint-disable
    no-return-assign,
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const DeprecationCopView = require('../lib/deprecation-cop-view')

describe('DeprecationCop', function () {
  let [activationPromise, workspaceElement] = Array.from([])

  beforeEach(function () {
    workspaceElement = atom.views.getView(atom.workspace)
    activationPromise = atom.packages.activatePackage('deprecation-cop')
    return expect(atom.workspace.getActivePane().getActiveItem()).not.toExist()
  })

  describe('when the deprecation-cop:view event is triggered', () => it('displays the deprecation cop pane', function () {
    atom.commands.dispatch(workspaceElement, 'deprecation-cop:view')

    waitsForPromise(() => activationPromise)

    let deprecationCopView = null
    waitsFor(() => deprecationCopView = atom.workspace.getActivePane().getActiveItem())

    return runs(() => expect(deprecationCopView instanceof DeprecationCopView).toBeTruthy())
  }))

  return describe('deactivating the package', () => it('removes the deprecation cop pane item', function () {
    atom.commands.dispatch(workspaceElement, 'deprecation-cop:view')

    waitsForPromise(() => activationPromise)

    waitsForPromise(() => Promise.resolve(atom.packages.deactivatePackage('deprecation-cop'))) // Wrapped for Promise & non-Promise deactivate

    return runs(() => expect(atom.workspace.getActivePane().getActiveItem()).not.toExist())
  }))
})

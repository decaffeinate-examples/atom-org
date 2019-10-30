/** @babel */
/* eslint-disable
    no-undef,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const TreeViewFinder = require('../lib/tree-view-finder')

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('TreeViewFinder', function () {
  let [workspaceElement, activationPromise] = Array.from([])

  beforeEach(function () {
    workspaceElement = atom.views.getView(atom.workspace)
    activationPromise = atom.packages.activatePackage('tree-view-finder')
    return waitsForPromise(() => atom.packages.activatePackage('tree-view'))
  })

  return describe('when the tree-view-finder:toggle event is triggered', () => it('hides and shows the tool bar', function () {
    // Before the activation event the view is not on the DOM, and no panel
    // has been created
    expect(workspaceElement.querySelector('.tree-view-finder-tool')).not.toExist()

    // This is an activation event, triggering it will cause the package to be
    // activated.
    atom.commands.dispatch(workspaceElement, 'tree-view-finder:toggle')

    waitsForPromise(() => activationPromise)

    return runs(function () {
      expect(workspaceElement.querySelector('.tree-view-finder-tool')).toExist()

      const finderTool = workspaceElement.querySelector('tree-view-finder-tool')
      expect(finderTool).toExist()
      const {
        treeViewFinder
      } = finderTool
      expect(treeViewFinder).not.toBe(null)

      expect(treeViewFinder.visible).toBe(true)
      atom.commands.dispatch(workspaceElement, 'tree-view-finder:toggle')
      return expect(treeViewFinder.visible).toBe(false)
    })
  }))
})

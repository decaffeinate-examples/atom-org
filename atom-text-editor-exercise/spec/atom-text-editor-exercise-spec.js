/** @babel */
/* eslint-disable
    no-return-assign,
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
const AtomTextEditorExercise = require('../lib/atom-text-editor-exercise')

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('AtomTextEditorExercise', function () {
  let [workspaceElement, activationPromise] = Array.from([])

  beforeEach(function () {
    workspaceElement = atom.views.getView(atom.workspace)
    return activationPromise = atom.packages.activatePackage('atom-text-editor-exercise')
  })

  return describe('when the atom-text-editor-exercise:toggle event is triggered', function () {
    it('hides and shows the modal panel', function () {
      // Before the activation event the view is not on the DOM, and no panel
      // has been created
      expect(workspaceElement.querySelector('.atom-text-editor-exercise')).not.toExist()

      // This is an activation event, triggering it will cause the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'atom-text-editor-exercise:toggle')

      waitsForPromise(() => activationPromise)

      return runs(function () {
        expect(workspaceElement.querySelector('.atom-text-editor-exercise')).toExist()

        const atomTextEditorExerciseElement = workspaceElement.querySelector('.atom-text-editor-exercise')
        expect(atomTextEditorExerciseElement).toExist()

        const atomTextEditorExercisePanel = atom.workspace.panelForItem(atomTextEditorExerciseElement)
        expect(atomTextEditorExercisePanel.isVisible()).toBe(true)
        atom.commands.dispatch(workspaceElement, 'atom-text-editor-exercise:toggle')
        return expect(atomTextEditorExercisePanel.isVisible()).toBe(false)
      })
    })

    return it('hides and shows the view', function () {
      // This test shows you an integration test testing at the view level.

      // Attaching the workspaceElement to the DOM is required to allow the
      // `toBeVisible()` matchers to work. Anything testing visibility or focus
      // requires that the workspaceElement is on the DOM. Tests that attach the
      // workspaceElement to the DOM are generally slower than those off DOM.
      jasmine.attachToDOM(workspaceElement)

      expect(workspaceElement.querySelector('.atom-text-editor-exercise')).not.toExist()

      // This is an activation event, triggering it causes the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'atom-text-editor-exercise:toggle')

      waitsForPromise(() => activationPromise)

      return runs(function () {
        // Now we can test for view visibility
        const atomTextEditorExerciseElement = workspaceElement.querySelector('.atom-text-editor-exercise')
        expect(atomTextEditorExerciseElement).toBeVisible()
        atom.commands.dispatch(workspaceElement, 'atom-text-editor-exercise:toggle')
        return expect(atomTextEditorExerciseElement).not.toBeVisible()
      })
    })
  })
})

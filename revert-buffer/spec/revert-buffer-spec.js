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
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require('fs')
const temp = require('temp')

const RevertBuffer = require('../lib/revert-buffer')

describe('RevertBuffer', function () {
  beforeEach(() => waitsForPromise(() => atom.packages.activatePackage('revert-buffer')))

  describe('revert-buffer:revert', () => it('reverts the buffer to the disk contents', function () {
    let editor = null
    const filePath = temp.openSync('revert-buffer').path
    fs.writeFileSync(filePath, 'Original Recipe')

    waitsForPromise(() => atom.workspace.open(filePath))

    runs(function () {
      editor = atom.workspace.getActiveTextEditor()
      editor.setText('Extra Crispy')
      return atom.commands.dispatch(atom.views.getView(editor), 'revert-buffer:revert')
    })

    return waitsFor(() => editor.getText() === 'Original Recipe')
  }))

  return describe('revert-buffer:revert-all', () => it('reverts the buffer (from all editors) to the disk contents', function () {
    let editor1 = null
    let editor2 = null
    const filePath1 = temp.openSync('revert-buffer-1').path
    fs.writeFileSync(filePath1, 'Original Recipe 1')
    const filePath2 = temp.openSync('revert-buffer-2').path
    fs.writeFileSync(filePath2, 'Original Recipe 2')

    waitsForPromise(() => atom.workspace.open(filePath1))

    waitsForPromise(() => atom.workspace.open(filePath2))

    runs(function () {
      editor1 = atom.workspace.getTextEditors()[0]
      editor1.setText('Extra Crispy 1')
      editor2 = atom.workspace.getTextEditors()[1]
      editor2.setText('Extra Crispy 2')
      return atom.commands.dispatch(atom.views.getView(editor1), 'revert-buffer:revert-all')
    })

    waitsFor(() => editor1.getText() === 'Original Recipe 1')

    return waitsFor(() => editor2.getText() === 'Original Recipe 2')
  }))
})

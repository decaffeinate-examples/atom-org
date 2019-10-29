/** @babel */
/* eslint-disable
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
module.exports = {
  activate () {
    atom.commands.add('atom-text-editor', 'revert-buffer:revert', function () {
      const editor = atom.workspace.getActiveTextEditor()
      if (!(editor != null ? editor.getPath() : undefined)) { return }

      const fs = require('fs')
      return fs.readFile(editor.getPath(), function (error, contents) {
        if (!error) { return editor.setText(contents.toString()) }
      })
    })

    return atom.commands.add('atom-text-editor', 'revert-buffer:revert-all', function () {
      const fs = require('fs')
      return atom.workspace.getTextEditors().forEach(function (editor) {
        if (editor != null ? editor.getPath() : undefined) {
          return fs.readFile(editor.getPath(), function (error, contents) {
            if (!error) { return editor.setText(contents.toString()) }
          })
        }
      })
    })
  }
}

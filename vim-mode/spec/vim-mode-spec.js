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
describe('VimMode', function () {
  let [editor, editorElement, workspaceElement] = Array.from([])

  beforeEach(function () {
    workspaceElement = atom.views.getView(atom.workspace)

    waitsForPromise(() => atom.workspace.open())

    waitsForPromise(() => atom.packages.activatePackage('vim-mode'))

    waitsForPromise(() => atom.packages.activatePackage('status-bar'))

    return runs(function () {
      editor = atom.workspace.getActiveTextEditor()
      return editorElement = atom.views.getView(editor)
    })
  })

  describe('.activate', function () {
    it('puts the editor in normal-mode initially by default', function () {
      expect(editorElement.classList.contains('vim-mode')).toBe(true)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    it('shows the current vim mode in the status bar', function () {
      let statusBarTile = null

      waitsFor(() => statusBarTile = workspaceElement.querySelector('#status-bar-vim-mode'))

      return runs(function () {
        expect(statusBarTile.textContent).toBe('Normal')
        atom.commands.dispatch(editorElement, 'vim-mode:activate-insert-mode')
        return expect(statusBarTile.textContent).toBe('Insert')
      })
    })

    return it("doesn't register duplicate command listeners for editors", function () {
      editor.setText('12345')
      editor.setCursorBufferPosition([0, 0])

      const pane = atom.workspace.getActivePane()
      const newPane = pane.splitRight()
      pane.removeItem(editor)
      newPane.addItem(editor)

      atom.commands.dispatch(editorElement, 'vim-mode:move-right')
      return expect(editor.getCursorBufferPosition()).toEqual([0, 1])
    })
  })

  return describe('.deactivate', function () {
    it('removes the vim classes from the editor', function () {
      atom.packages.deactivatePackage('vim-mode')
      expect(editorElement.classList.contains('vim-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(false)
    })

    return it('removes the vim commands from the editor element', function () {
      const vimCommands = () => atom.commands.findCommands({ target: editorElement }).filter(cmd => cmd.name.startsWith('vim-mode:'))

      expect(vimCommands().length).toBeGreaterThan(0)
      atom.packages.deactivatePackage('vim-mode')
      return expect(vimCommands().length).toBe(0)
    })
  })
})

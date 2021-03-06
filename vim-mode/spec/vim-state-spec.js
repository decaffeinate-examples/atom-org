/** @babel */
/* eslint-disable
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const _ = require('underscore-plus')
const helpers = require('./spec-helper')
const VimState = require('../lib/vim-state')
const StatusBarManager = require('../lib/status-bar-manager')

describe('VimState', function () {
  let [editor, editorElement, vimState] = Array.from([])

  beforeEach(function () {
    const vimMode = atom.packages.loadPackage('vim-mode')
    vimMode.activateResources()

    return helpers.getEditorElement(function (element) {
      editorElement = element
      editor = editorElement.getModel();
      ({
        vimState
      } = editorElement)
      vimState.activateNormalMode()
      return vimState.resetNormalMode()
    })
  })

  const keydown = function (key, options) {
    if (options == null) { options = {} }
    if (options.element == null) { options.element = editorElement }
    return helpers.keydown(key, options)
  }

  const normalModeInputKeydown = function (key, opts) {
    if (opts == null) { opts = {} }
    return editor.normalModeInputView.editorElement.getModel().setText(key)
  }

  describe('initialization', function () {
    it('puts the editor in normal-mode initially by default', function () {
      expect(editorElement.classList.contains('vim-mode')).toBe(true)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    return it('puts the editor in insert-mode if startInInsertMode is true', function () {
      atom.config.set('vim-mode.startInInsertMode', true)
      editor.vimState = new VimState(editorElement, new StatusBarManager())
      return expect(editorElement.classList.contains('insert-mode')).toBe(true)
    })
  })

  describe('::destroy', function () {
    it('re-enables text input on the editor', function () {
      expect(editorElement.component.isInputEnabled()).toBeFalsy()
      vimState.destroy()
      return expect(editorElement.component.isInputEnabled()).toBeTruthy()
    })

    it('removes the mode classes from the editor', function () {
      expect(editorElement.classList.contains('normal-mode')).toBeTruthy()
      vimState.destroy()
      return expect(editorElement.classList.contains('normal-mode')).toBeFalsy()
    })

    return it('is a noop when the editor is already destroyed', function () {
      editorElement.getModel().destroy()
      return vimState.destroy()
    })
  })

  describe('normal-mode', function () {
    describe('when entering an insertable character', function () {
      beforeEach(() => keydown('\\'))

      return it('stops propagation', () => expect(editor.getText()).toEqual(''))
    })

    describe('when entering an operator', function () {
      beforeEach(() => keydown('d'))

      describe("with an operator that can't be composed", function () {
        beforeEach(() => keydown('x'))

        return it('clears the operator stack', () => expect(vimState.opStack.length).toBe(0))
      })

      describe('the escape keybinding', function () {
        beforeEach(() => keydown('escape'))

        return it('clears the operator stack', () => expect(vimState.opStack.length).toBe(0))
      })

      return describe('the ctrl-c keybinding', function () {
        beforeEach(() => keydown('c', { ctrl: true }))

        return it('clears the operator stack', () => expect(vimState.opStack.length).toBe(0))
      })
    })

    describe('the escape keybinding', () => it('clears any extra cursors', function () {
      editor.setText('one-two-three')
      editor.addCursorAtBufferPosition([0, 3])
      expect(editor.getCursors().length).toBe(2)
      keydown('escape')
      return expect(editor.getCursors().length).toBe(1)
    }))

    describe('the v keybinding', function () {
      beforeEach(function () {
        editor.setText('012345\nabcdef')
        editor.setCursorScreenPosition([0, 0])
        return keydown('v')
      })

      it('puts the editor into visual characterwise mode', function () {
        expect(editorElement.classList.contains('visual-mode')).toBe(true)
        expect(vimState.submode).toEqual('characterwise')
        return expect(editorElement.classList.contains('normal-mode')).toBe(false)
      })

      return it('selects the current character', () => expect(editor.getLastSelection().getText()).toEqual('0'))
    })

    describe('the V keybinding', function () {
      beforeEach(function () {
        editor.setText('012345\nabcdef')
        editor.setCursorScreenPosition([0, 0])
        return keydown('V', { shift: true })
      })

      it('puts the editor into visual linewise mode', function () {
        expect(editorElement.classList.contains('visual-mode')).toBe(true)
        expect(vimState.submode).toEqual('linewise')
        return expect(editorElement.classList.contains('normal-mode')).toBe(false)
      })

      return it('selects the current line', () => expect(editor.getLastSelection().getText()).toEqual('012345\n'))
    })

    describe('the ctrl-v keybinding', function () {
      beforeEach(function () {
        editor.setText('012345\nabcdef')
        editor.setCursorScreenPosition([0, 0])
        return keydown('v', { ctrl: true })
      })

      return it('puts the editor into visual blockwise mode', function () {
        expect(editorElement.classList.contains('visual-mode')).toBe(true)
        expect(vimState.submode).toEqual('blockwise')
        return expect(editorElement.classList.contains('normal-mode')).toBe(false)
      })
    })

    describe('selecting text', function () {
      beforeEach(function () {
        editor.setText('abc def')
        return editor.setCursorScreenPosition([0, 0])
      })

      it('puts the editor into visual mode', function () {
        expect(vimState.mode).toEqual('normal')
        atom.commands.dispatch(editorElement, 'core:select-right')

        expect(vimState.mode).toEqual('visual')
        expect(vimState.submode).toEqual('characterwise')
        return expect(editor.getSelectedBufferRanges()).toEqual([[[0, 0], [0, 1]]])
      })

      it('handles the editor being destroyed shortly after selecting text', function () {
        editor.setSelectedBufferRanges([[[0, 0], [0, 3]]])
        editor.destroy()
        vimState.destroy()
        return advanceClock(100)
      })

      return it('handles native selection such as core:select-all', function () {
        atom.commands.dispatch(editorElement, 'core:select-all')
        return expect(editor.getSelectedBufferRanges()).toEqual([[[0, 0], [0, 7]]])
      })
    })

    describe('the i keybinding', function () {
      beforeEach(() => keydown('i'))

      return it('puts the editor into insert mode', function () {
        expect(editorElement.classList.contains('insert-mode')).toBe(true)
        return expect(editorElement.classList.contains('normal-mode')).toBe(false)
      })
    })

    describe('the R keybinding', function () {
      beforeEach(() => keydown('R', { shift: true }))

      return it('puts the editor into replace mode', function () {
        expect(editorElement.classList.contains('insert-mode')).toBe(true)
        expect(editorElement.classList.contains('replace-mode')).toBe(true)
        return expect(editorElement.classList.contains('normal-mode')).toBe(false)
      })
    })

    describe('with content', function () {
      beforeEach(function () {
        editor.setText('012345\n\nabcdef')
        return editor.setCursorScreenPosition([0, 0])
      })

      describe('on a line with content', () => it('does not allow atom commands to place the cursor on the \\n character', function () {
        atom.commands.dispatch(editorElement, 'editor:move-to-end-of-line')
        return expect(editor.getCursorScreenPosition()).toEqual([0, 5])
      }))

      return describe('on an empty line', function () {
        beforeEach(function () {
          editor.setCursorScreenPosition([1, 0])
          return atom.commands.dispatch(editorElement, 'editor:move-to-end-of-line')
        })

        return it('allows the cursor to be placed on the \\n character', () => expect(editor.getCursorScreenPosition()).toEqual([1, 0]))
      })
    })

    return describe('with character-input operations', function () {
      beforeEach(() => editor.setText('012345\nabcdef'))

      return it('properly clears the opStack', function () {
        keydown('d')
        keydown('r')
        expect(vimState.mode).toBe('normal')
        expect(vimState.opStack.length).toBe(0)
        atom.commands.dispatch(editor.normalModeInputView.editorElement, 'core:cancel')
        keydown('d')
        return expect(editor.getText()).toBe('012345\nabcdef')
      })
    })
  })

  describe('insert-mode', function () {
    beforeEach(() => keydown('i'))

    describe('with content', function () {
      beforeEach(() => editor.setText('012345\n\nabcdef'))

      describe('when cursor is in the middle of the line', function () {
        beforeEach(() => editor.setCursorScreenPosition([0, 3]))

        return it('moves the cursor to the left when exiting insert mode', function () {
          keydown('escape')
          return expect(editor.getCursorScreenPosition()).toEqual([0, 2])
        })
      })

      describe('when cursor is at the beginning of line', function () {
        beforeEach(() => editor.setCursorScreenPosition([1, 0]))

        return it('leaves the cursor at the beginning of line', function () {
          keydown('escape')
          return expect(editor.getCursorScreenPosition()).toEqual([1, 0])
        })
      })

      return describe('on a line with content', function () {
        beforeEach(function () {
          editor.setCursorScreenPosition([0, 0])
          return atom.commands.dispatch(editorElement, 'editor:move-to-end-of-line')
        })

        return it('allows the cursor to be placed on the \\n character', () => expect(editor.getCursorScreenPosition()).toEqual([0, 6]))
      })
    })

    it('puts the editor into normal mode when <escape> is pressed', function () {
      keydown('escape')

      expect(editorElement.classList.contains('normal-mode')).toBe(true)
      expect(editorElement.classList.contains('insert-mode')).toBe(false)
      return expect(editorElement.classList.contains('visual-mode')).toBe(false)
    })

    return it('puts the editor into normal mode when <ctrl-c> is pressed', function () {
      helpers.mockPlatform(editorElement, 'platform-darwin')
      keydown('c', { ctrl: true })
      helpers.unmockPlatform(editorElement)

      expect(editorElement.classList.contains('normal-mode')).toBe(true)
      expect(editorElement.classList.contains('insert-mode')).toBe(false)
      return expect(editorElement.classList.contains('visual-mode')).toBe(false)
    })
  })

  describe('replace-mode', function () {
    describe('with content', function () {
      beforeEach(() => editor.setText('012345\n\nabcdef'))

      describe('when cursor is in the middle of the line', function () {
        beforeEach(function () {
          editor.setCursorScreenPosition([0, 3])
          return keydown('R', { shift: true })
        })

        return it('moves the cursor to the left when exiting replace mode', function () {
          keydown('escape')
          return expect(editor.getCursorScreenPosition()).toEqual([0, 2])
        })
      })

      describe('when cursor is at the beginning of line', function () {
        beforeEach(function () {
          editor.setCursorScreenPosition([1, 0])
          return keydown('R', { shift: true })
        })

        return it('leaves the cursor at the beginning of line', function () {
          keydown('escape')
          return expect(editor.getCursorScreenPosition()).toEqual([1, 0])
        })
      })

      return describe('on a line with content', function () {
        beforeEach(function () {
          keydown('R', { shift: true })
          editor.setCursorScreenPosition([0, 0])
          return atom.commands.dispatch(editorElement, 'editor:move-to-end-of-line')
        })

        return it('allows the cursor to be placed on the \\n character', () => expect(editor.getCursorScreenPosition()).toEqual([0, 6]))
      })
    })

    it('puts the editor into normal mode when <escape> is pressed', function () {
      keydown('R', { shift: true })
      keydown('escape')

      expect(editorElement.classList.contains('normal-mode')).toBe(true)
      expect(editorElement.classList.contains('insert-mode')).toBe(false)
      expect(editorElement.classList.contains('replace-mode')).toBe(false)
      return expect(editorElement.classList.contains('visual-mode')).toBe(false)
    })

    return it('puts the editor into normal mode when <ctrl-c> is pressed', function () {
      keydown('R', { shift: true })
      helpers.mockPlatform(editorElement, 'platform-darwin')
      keydown('c', { ctrl: true })
      helpers.unmockPlatform(editorElement)

      expect(editorElement.classList.contains('normal-mode')).toBe(true)
      expect(editorElement.classList.contains('insert-mode')).toBe(false)
      expect(editorElement.classList.contains('replace-mode')).toBe(false)
      return expect(editorElement.classList.contains('visual-mode')).toBe(false)
    })
  })

  describe('visual-mode', function () {
    beforeEach(function () {
      editor.setText('one two three')
      editor.setCursorBufferPosition([0, 4])
      return keydown('v')
    })

    it('selects the character under the cursor', function () {
      expect(editor.getSelectedBufferRanges()).toEqual([[[0, 4], [0, 5]]])
      return expect(editor.getSelectedText()).toBe('t')
    })

    it('puts the editor into normal mode when <escape> is pressed', function () {
      keydown('escape')

      expect(editor.getCursorBufferPositions()).toEqual([[0, 4]])
      expect(editorElement.classList.contains('normal-mode')).toBe(true)
      return expect(editorElement.classList.contains('visual-mode')).toBe(false)
    })

    it('puts the editor into normal mode when <escape> is pressed on selection is reversed', function () {
      expect(editor.getSelectedText()).toBe('t')
      keydown('h')
      keydown('h')
      expect(editor.getSelectedText()).toBe('e t')
      expect(editor.getLastSelection().isReversed()).toBe(true)
      keydown('escape')
      expect(editorElement.classList.contains('normal-mode')).toBe(true)
      return expect(editor.getCursorBufferPositions()).toEqual([[0, 2]])
    })

    describe('motions', function () {
      it('transforms the selection', function () {
        keydown('w')
        return expect(editor.getLastSelection().getText()).toEqual('two t')
      })

      return it('always leaves the initially selected character selected', function () {
        keydown('h')
        expect(editor.getSelectedText()).toBe(' t')

        keydown('l')
        expect(editor.getSelectedText()).toBe('t')

        keydown('l')
        return expect(editor.getSelectedText()).toBe('tw')
      })
    })

    describe('operators', function () {
      beforeEach(function () {
        editor.setText('012345\n\nabcdef')
        editor.setCursorScreenPosition([0, 0])
        editor.selectLinesContainingCursors()
        return keydown('d')
      })

      return it('operate on the current selection', () => expect(editor.getText()).toEqual('\nabcdef'))
    })

    describe('returning to normal-mode', function () {
      beforeEach(function () {
        editor.setText('012345\n\nabcdef')
        editor.selectLinesContainingCursors()
        return keydown('escape')
      })

      return it('operate on the current selection', () => expect(editor.getLastSelection().getText()).toEqual(''))
    })

    describe('the o keybinding', function () {
      it('reversed each selection', function () {
        editor.addCursorAtBufferPosition([0, Infinity])
        keydown('i')
        keydown('w')

        expect(editor.getSelectedBufferRanges()).toEqual([
          [[0, 4], [0, 7]],
          [[0, 8], [0, 13]]
        ])
        expect(editor.getCursorBufferPositions()).toEqual([
          [0, 7],
          [0, 13]
        ])

        keydown('o')

        expect(editor.getSelectedBufferRanges()).toEqual([
          [[0, 4], [0, 7]],
          [[0, 8], [0, 13]]
        ])
        return expect(editor.getCursorBufferPositions()).toEqual([
          [0, 4],
          [0, 8]
        ])
      })

      return it('harmonizes selection directions', function () {
        keydown('e')
        editor.addCursorAtBufferPosition([0, Infinity])
        keydown('h')
        keydown('h')

        expect(editor.getSelectedBufferRanges()).toEqual([
          [[0, 4], [0, 5]],
          [[0, 11], [0, 13]]
        ])
        expect(editor.getCursorBufferPositions()).toEqual([
          [0, 5],
          [0, 11]
        ])

        keydown('o')

        expect(editor.getSelectedBufferRanges()).toEqual([
          [[0, 4], [0, 5]],
          [[0, 11], [0, 13]]
        ])
        return expect(editor.getCursorBufferPositions()).toEqual([
          [0, 5],
          [0, 13]
        ])
      })
    })

    return describe('activate visualmode witin visualmode', function () {
      beforeEach(function () {
        keydown('escape')
        expect(vimState.mode).toEqual('normal')
        return expect(editorElement.classList.contains('normal-mode')).toBe(true)
      })

      it('activateVisualMode with same type puts the editor into normal mode', function () {
        keydown('v')
        expect(editorElement.classList.contains('visual-mode')).toBe(true)
        expect(vimState.submode).toEqual('characterwise')
        expect(editorElement.classList.contains('normal-mode')).toBe(false)

        keydown('v')
        expect(vimState.mode).toEqual('normal')
        expect(editorElement.classList.contains('normal-mode')).toBe(true)

        keydown('V', { shift: true })
        expect(editorElement.classList.contains('visual-mode')).toBe(true)
        expect(vimState.submode).toEqual('linewise')
        expect(editorElement.classList.contains('normal-mode')).toBe(false)

        keydown('V', { shift: true })
        expect(vimState.mode).toEqual('normal')
        expect(editorElement.classList.contains('normal-mode')).toBe(true)

        keydown('v', { ctrl: true })
        expect(editorElement.classList.contains('visual-mode')).toBe(true)
        expect(vimState.submode).toEqual('blockwise')
        expect(editorElement.classList.contains('normal-mode')).toBe(false)

        keydown('v', { ctrl: true })
        expect(vimState.mode).toEqual('normal')
        return expect(editorElement.classList.contains('normal-mode')).toBe(true)
      })

      return describe('change submode within visualmode', function () {
        beforeEach(function () {
          editor.setText('line one\nline two\nline three\n')
          editor.setCursorBufferPosition([0, 5])
          return editor.addCursorAtBufferPosition([2, 5])
        })

        it('can change submode within visual mode', function () {
          keydown('v')
          expect(editorElement.classList.contains('visual-mode')).toBe(true)
          expect(vimState.submode).toEqual('characterwise')
          expect(editorElement.classList.contains('normal-mode')).toBe(false)

          keydown('V', { shift: true })
          expect(editorElement.classList.contains('visual-mode')).toBe(true)
          expect(vimState.submode).toEqual('linewise')
          expect(editorElement.classList.contains('normal-mode')).toBe(false)

          keydown('v', { ctrl: true })
          expect(editorElement.classList.contains('visual-mode')).toBe(true)
          expect(vimState.submode).toEqual('blockwise')
          expect(editorElement.classList.contains('normal-mode')).toBe(false)

          keydown('v')
          expect(editorElement.classList.contains('visual-mode')).toBe(true)
          expect(vimState.submode).toEqual('characterwise')
          return expect(editorElement.classList.contains('normal-mode')).toBe(false)
        })

        return it('recover original range when shift from linewse to characterwise', function () {
          keydown('v')
          keydown('i')
          keydown('w')

          expect(_.map(editor.getSelections(), selection => selection.getText())
          ).toEqual(['one', 'three'])

          keydown('V', { shift: true })
          expect(_.map(editor.getSelections(), selection => selection.getText())
          ).toEqual(['line one\n', 'line three\n'])

          keydown('v', { ctrl: true })
          return expect(_.map(editor.getSelections(), selection => selection.getText())
          ).toEqual(['one', 'three'])
        })
      })
    })
  })

  return describe('marks', function () {
    beforeEach(() => editor.setText('text in line 1\ntext in line 2\ntext in line 3'))

    it('basic marking functionality', function () {
      editor.setCursorScreenPosition([1, 1])
      keydown('m')
      normalModeInputKeydown('t')
      expect(editor.getText()).toEqual('text in line 1\ntext in line 2\ntext in line 3')
      editor.setCursorScreenPosition([2, 2])
      keydown('`')
      normalModeInputKeydown('t')
      return expect(editor.getCursorScreenPosition()).toEqual([1, 1])
    })

    it('real (tracking) marking functionality', function () {
      editor.setCursorScreenPosition([2, 2])
      keydown('m')
      normalModeInputKeydown('q')
      editor.setCursorScreenPosition([1, 2])
      keydown('o')
      keydown('escape')
      keydown('`')
      normalModeInputKeydown('q')
      return expect(editor.getCursorScreenPosition()).toEqual([3, 2])
    })

    return it('real (tracking) marking functionality', function () {
      editor.setCursorScreenPosition([2, 2])
      keydown('m')
      normalModeInputKeydown('q')
      editor.setCursorScreenPosition([1, 2])
      keydown('d')
      keydown('d')
      keydown('escape')
      keydown('`')
      normalModeInputKeydown('q')
      return expect(editor.getCursorScreenPosition()).toEqual([1, 2])
    })
  })
})

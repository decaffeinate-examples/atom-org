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
const helpers = require('./spec-helper')
const settings = require('../lib/settings')

describe('Operators', function () {
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

  describe('cancelling operations', function () {
    it('throws an error when no operation is pending', () => // cancel operation pushes an empty input operation
    // doing this without a pending operation would throw an exception
      expect(() => vimState.pushOperations(new Input(''))).toThrow())

    return it('cancels and cleans up properly', function () {
      // make sure normalModeInputView is created
      keydown('/')
      expect(vimState.isOperatorPending()).toBe(true)
      editor.normalModeInputView.viewModel.cancel()

      expect(vimState.isOperatorPending()).toBe(false)
      return expect(editor.normalModeInputView).toBe(undefined)
    })
  })

  describe('the x keybinding', function () {
    describe('on a line with content', function () {
      describe('without vim-mode.wrapLeftRightMotion', function () {
        beforeEach(function () {
          editor.setText('abc\n012345\n\nxyz')
          return editor.setCursorScreenPosition([1, 4])
        })

        it('deletes a character', function () {
          keydown('x')
          expect(editor.getText()).toBe('abc\n01235\n\nxyz')
          expect(editor.getCursorScreenPosition()).toEqual([1, 4])
          expect(vimState.getRegister('"').text).toBe('4')

          keydown('x')
          expect(editor.getText()).toBe('abc\n0123\n\nxyz')
          expect(editor.getCursorScreenPosition()).toEqual([1, 3])
          expect(vimState.getRegister('"').text).toBe('5')

          keydown('x')
          expect(editor.getText()).toBe('abc\n012\n\nxyz')
          expect(editor.getCursorScreenPosition()).toEqual([1, 2])
          expect(vimState.getRegister('"').text).toBe('3')

          keydown('x')
          expect(editor.getText()).toBe('abc\n01\n\nxyz')
          expect(editor.getCursorScreenPosition()).toEqual([1, 1])
          expect(vimState.getRegister('"').text).toBe('2')

          keydown('x')
          expect(editor.getText()).toBe('abc\n0\n\nxyz')
          expect(editor.getCursorScreenPosition()).toEqual([1, 0])
          expect(vimState.getRegister('"').text).toBe('1')

          keydown('x')
          expect(editor.getText()).toBe('abc\n\n\nxyz')
          expect(editor.getCursorScreenPosition()).toEqual([1, 0])
          return expect(vimState.getRegister('"').text).toBe('0')
        })

        return it('deletes multiple characters with a count', function () {
          keydown('2')
          keydown('x')
          expect(editor.getText()).toBe('abc\n0123\n\nxyz')
          expect(editor.getCursorScreenPosition()).toEqual([1, 3])
          expect(vimState.getRegister('"').text).toBe('45')

          editor.setCursorScreenPosition([0, 1])
          keydown('3')
          keydown('x')
          expect(editor.getText()).toBe('a\n0123\n\nxyz')
          expect(editor.getCursorScreenPosition()).toEqual([0, 0])
          return expect(vimState.getRegister('"').text).toBe('bc')
        })
      })

      describe('with multiple cursors', function () {
        beforeEach(function () {
          editor.setText('abc\n012345\n\nxyz')
          editor.setCursorScreenPosition([1, 4])
          return editor.addCursorAtBufferPosition([0, 1])
        })

        return it('is undone as one operation', function () {
          keydown('x')
          expect(editor.getText()).toBe('ac\n01235\n\nxyz')
          keydown('u')
          return expect(editor.getText()).toBe('abc\n012345\n\nxyz')
        })
      })

      return describe('with vim-mode.wrapLeftRightMotion', function () {
        beforeEach(function () {
          editor.setText('abc\n012345\n\nxyz')
          editor.setCursorScreenPosition([1, 4])
          return atom.config.set('vim-mode.wrapLeftRightMotion', true)
        })

        it('deletes a character', function () {
          // copy of the earlier test because wrapLeftRightMotion should not affect it
          keydown('x')
          expect(editor.getText()).toBe('abc\n01235\n\nxyz')
          expect(editor.getCursorScreenPosition()).toEqual([1, 4])
          expect(vimState.getRegister('"').text).toBe('4')

          keydown('x')
          expect(editor.getText()).toBe('abc\n0123\n\nxyz')
          expect(editor.getCursorScreenPosition()).toEqual([1, 3])
          expect(vimState.getRegister('"').text).toBe('5')

          keydown('x')
          expect(editor.getText()).toBe('abc\n012\n\nxyz')
          expect(editor.getCursorScreenPosition()).toEqual([1, 2])
          expect(vimState.getRegister('"').text).toBe('3')

          keydown('x')
          expect(editor.getText()).toBe('abc\n01\n\nxyz')
          expect(editor.getCursorScreenPosition()).toEqual([1, 1])
          expect(vimState.getRegister('"').text).toBe('2')

          keydown('x')
          expect(editor.getText()).toBe('abc\n0\n\nxyz')
          expect(editor.getCursorScreenPosition()).toEqual([1, 0])
          expect(vimState.getRegister('"').text).toBe('1')

          keydown('x')
          expect(editor.getText()).toBe('abc\n\n\nxyz')
          expect(editor.getCursorScreenPosition()).toEqual([1, 0])
          return expect(vimState.getRegister('"').text).toBe('0')
        })

        return it('deletes multiple characters and newlines with a count', function () {
          atom.config.set('vim-mode.wrapLeftRightMotion', true)
          keydown('2')
          keydown('x')
          expect(editor.getText()).toBe('abc\n0123\n\nxyz')
          expect(editor.getCursorScreenPosition()).toEqual([1, 3])
          expect(vimState.getRegister('"').text).toBe('45')

          editor.setCursorScreenPosition([0, 1])
          keydown('3')
          keydown('x')
          expect(editor.getText()).toBe('a0123\n\nxyz')
          expect(editor.getCursorScreenPosition()).toEqual([0, 1])
          expect(vimState.getRegister('"').text).toBe('bc\n')

          keydown('7')
          keydown('x')
          expect(editor.getText()).toBe('ayz')
          expect(editor.getCursorScreenPosition()).toEqual([0, 1])
          return expect(vimState.getRegister('"').text).toBe('0123\n\nx')
        })
      })
    })

    return describe('on an empty line', function () {
      beforeEach(function () {
        editor.setText('abc\n012345\n\nxyz')
        return editor.setCursorScreenPosition([2, 0])
      })

      it('deletes nothing on an empty line when vim-mode.wrapLeftRightMotion is false', function () {
        atom.config.set('vim-mode.wrapLeftRightMotion', false)
        keydown('x')
        expect(editor.getText()).toBe('abc\n012345\n\nxyz')
        return expect(editor.getCursorScreenPosition()).toEqual([2, 0])
      })

      return it('deletes an empty line when vim-mode.wrapLeftRightMotion is true', function () {
        atom.config.set('vim-mode.wrapLeftRightMotion', true)
        keydown('x')
        expect(editor.getText()).toBe('abc\n012345\nxyz')
        return expect(editor.getCursorScreenPosition()).toEqual([2, 0])
      })
    })
  })

  describe('the X keybinding', function () {
    describe('on a line with content', function () {
      beforeEach(function () {
        editor.setText('ab\n012345')
        return editor.setCursorScreenPosition([1, 2])
      })

      return it('deletes a character', function () {
        keydown('X', { shift: true })
        expect(editor.getText()).toBe('ab\n02345')
        expect(editor.getCursorScreenPosition()).toEqual([1, 1])
        expect(vimState.getRegister('"').text).toBe('1')

        keydown('X', { shift: true })
        expect(editor.getText()).toBe('ab\n2345')
        expect(editor.getCursorScreenPosition()).toEqual([1, 0])
        expect(vimState.getRegister('"').text).toBe('0')

        keydown('X', { shift: true })
        expect(editor.getText()).toBe('ab\n2345')
        expect(editor.getCursorScreenPosition()).toEqual([1, 0])
        expect(vimState.getRegister('"').text).toBe('0')

        atom.config.set('vim-mode.wrapLeftRightMotion', true)
        keydown('X', { shift: true })
        expect(editor.getText()).toBe('ab2345')
        expect(editor.getCursorScreenPosition()).toEqual([0, 2])
        return expect(vimState.getRegister('"').text).toBe('\n')
      })
    })

    return describe('on an empty line', function () {
      beforeEach(function () {
        editor.setText('012345\n\nabcdef')
        return editor.setCursorScreenPosition([1, 0])
      })

      it('deletes nothing when vim-mode.wrapLeftRightMotion is false', function () {
        atom.config.set('vim-mode.wrapLeftRightMotion', false)
        keydown('X', { shift: true })
        expect(editor.getText()).toBe('012345\n\nabcdef')
        return expect(editor.getCursorScreenPosition()).toEqual([1, 0])
      })

      return it('deletes the newline when wrapLeftRightMotion is true', function () {
        atom.config.set('vim-mode.wrapLeftRightMotion', true)
        keydown('X', { shift: true })
        expect(editor.getText()).toBe('012345\nabcdef')
        return expect(editor.getCursorScreenPosition()).toEqual([0, 5])
      })
    })
  })

  describe('the s keybinding', function () {
    beforeEach(function () {
      editor.setText('012345')
      return editor.setCursorScreenPosition([0, 1])
    })

    it('deletes the character to the right and enters insert mode', function () {
      keydown('s')
      expect(editorElement.classList.contains('insert-mode')).toBe(true)
      expect(editor.getText()).toBe('02345')
      expect(editor.getCursorScreenPosition()).toEqual([0, 1])
      return expect(vimState.getRegister('"').text).toBe('1')
    })

    it('is repeatable', function () {
      editor.setCursorScreenPosition([0, 0])
      keydown('3')
      keydown('s')
      editor.insertText('ab')
      keydown('escape')
      expect(editor.getText()).toBe('ab345')
      editor.setCursorScreenPosition([0, 2])
      keydown('.')
      return expect(editor.getText()).toBe('abab')
    })

    it('is undoable', function () {
      editor.setCursorScreenPosition([0, 0])
      keydown('3')
      keydown('s')
      editor.insertText('ab')
      keydown('escape')
      expect(editor.getText()).toBe('ab345')
      keydown('u')
      expect(editor.getText()).toBe('012345')
      return expect(editor.getSelectedText()).toBe('')
    })

    return describe('in visual mode', function () {
      beforeEach(function () {
        keydown('v')
        editor.selectRight()
        return keydown('s')
      })

      return it('deletes the selected characters and enters insert mode', function () {
        expect(editorElement.classList.contains('insert-mode')).toBe(true)
        expect(editor.getText()).toBe('0345')
        expect(editor.getCursorScreenPosition()).toEqual([0, 1])
        return expect(vimState.getRegister('"').text).toBe('12')
      })
    })
  })

  describe('the S keybinding', function () {
    beforeEach(function () {
      editor.setText('12345\nabcde\nABCDE')
      return editor.setCursorScreenPosition([1, 3])
    })

    it('deletes the entire line and enters insert mode', function () {
      keydown('S', { shift: true })
      expect(editorElement.classList.contains('insert-mode')).toBe(true)
      expect(editor.getText()).toBe('12345\n\nABCDE')
      expect(editor.getCursorScreenPosition()).toEqual([1, 0])
      expect(vimState.getRegister('"').text).toBe('abcde\n')
      return expect(vimState.getRegister('"').type).toBe('linewise')
    })

    it('is repeatable', function () {
      keydown('S', { shift: true })
      editor.insertText('abc')
      keydown('escape')
      expect(editor.getText()).toBe('12345\nabc\nABCDE')
      editor.setCursorScreenPosition([2, 3])
      keydown('.')
      return expect(editor.getText()).toBe('12345\nabc\nabc\n')
    })

    it('is undoable', function () {
      keydown('S', { shift: true })
      editor.insertText('abc')
      keydown('escape')
      expect(editor.getText()).toBe('12345\nabc\nABCDE')
      keydown('u')
      expect(editor.getText()).toBe('12345\nabcde\nABCDE')
      return expect(editor.getSelectedText()).toBe('')
    })

    it("works when the cursor's goal column is greater than its current column", function () {
      editor.setText('\n12345')
      editor.setCursorBufferPosition([1, Infinity])
      editor.moveUp()
      keydown('S', { shift: true })
      return expect(editor.getText()).toBe('\n12345')
    })

    // Can't be tested without setting grammar of test buffer
    return xit('respects indentation', function () {})
  })

  describe('the d keybinding', function () {
    it('enters operator-pending mode', function () {
      keydown('d')
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(true)
      return expect(editorElement.classList.contains('normal-mode')).toBe(false)
    })

    describe('when followed by a d', function () {
      it('deletes the current line and exits operator-pending mode', function () {
        editor.setText('12345\nabcde\n\nABCDE')
        editor.setCursorScreenPosition([1, 1])

        keydown('d')
        keydown('d')

        expect(editor.getText()).toBe('12345\n\nABCDE')
        expect(editor.getCursorScreenPosition()).toEqual([1, 0])
        expect(vimState.getRegister('"').text).toBe('abcde\n')
        expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
        return expect(editorElement.classList.contains('normal-mode')).toBe(true)
      })

      it('deletes the last line', function () {
        editor.setText('12345\nabcde\nABCDE')
        editor.setCursorScreenPosition([2, 1])

        keydown('d')
        keydown('d')

        expect(editor.getText()).toBe('12345\nabcde\n')
        return expect(editor.getCursorScreenPosition()).toEqual([2, 0])
      })

      return it('leaves the cursor on the first nonblank character', function () {
        editor.setText('12345\n  abcde\n')
        editor.setCursorScreenPosition([0, 4])

        keydown('d')
        keydown('d')

        expect(editor.getText()).toBe('  abcde\n')
        return expect(editor.getCursorScreenPosition()).toEqual([0, 2])
      })
    })

    describe('undo behavior', function () {
      beforeEach(function () {
        editor.setText('12345\nabcde\nABCDE\nQWERT')
        return editor.setCursorScreenPosition([1, 1])
      })

      it('undoes both lines', function () {
        keydown('d')
        keydown('2')
        keydown('d')

        keydown('u')

        expect(editor.getText()).toBe('12345\nabcde\nABCDE\nQWERT')
        return expect(editor.getSelectedText()).toBe('')
      })

      return describe('with multiple cursors', function () {
        beforeEach(function () {
          editor.setCursorBufferPosition([1, 1])
          return editor.addCursorAtBufferPosition([0, 0])
        })

        return it('is undone as one operation', function () {
          keydown('d')
          keydown('l')

          keydown('u')

          expect(editor.getText()).toBe('12345\nabcde\nABCDE\nQWERT')
          return expect(editor.getSelectedText()).toBe('')
        })
      })
    })

    describe('when followed by a w', function () {
      it('deletes the next word until the end of the line and exits operator-pending mode', function () {
        editor.setText('abcd efg\nabc')
        editor.setCursorScreenPosition([0, 5])

        keydown('d')
        keydown('w')

        // Incompatibility with VIM. In vim, `w` behaves differently as an
        // operator than as a motion; it stops at the end of a line.expect(editor.getText()).toBe "abcd abc"
        expect(editor.getText()).toBe('abcd abc')
        expect(editor.getCursorScreenPosition()).toEqual([0, 5])

        expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
        return expect(editorElement.classList.contains('normal-mode')).toBe(true)
      })

      return it('deletes to the beginning of the next word', function () {
        editor.setText('abcd efg')
        editor.setCursorScreenPosition([0, 2])

        keydown('d')
        keydown('w')

        expect(editor.getText()).toBe('abefg')
        expect(editor.getCursorScreenPosition()).toEqual([0, 2])

        editor.setText('one two three four')
        editor.setCursorScreenPosition([0, 0])

        keydown('d')
        keydown('3')
        keydown('w')

        expect(editor.getText()).toBe('four')
        return expect(editor.getCursorScreenPosition()).toEqual([0, 0])
      })
    })

    describe('when followed by an iw', () => it('deletes the containing word', function () {
      editor.setText('12345 abcde ABCDE')
      editor.setCursorScreenPosition([0, 9])

      keydown('d')
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(true)
      keydown('i')
      keydown('w')

      expect(editor.getText()).toBe('12345  ABCDE')
      expect(editor.getCursorScreenPosition()).toEqual([0, 6])
      expect(vimState.getRegister('"').text).toBe('abcde')
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    }))

    describe('when followed by a j', function () {
      const originalText = '12345\nabcde\nABCDE\n'

      beforeEach(() => editor.setText(originalText))

      describe('on the beginning of the file', () => it('deletes the next two lines', function () {
        editor.setCursorScreenPosition([0, 0])
        keydown('d')
        keydown('j')
        return expect(editor.getText()).toBe('ABCDE\n')
      }))

      describe('on the end of the file', () => it('deletes nothing', function () {
        editor.setCursorScreenPosition([4, 0])
        keydown('d')
        keydown('j')
        return expect(editor.getText()).toBe(originalText)
      }))

      return describe('on the middle of second line', () => it('deletes the last two lines', function () {
        editor.setCursorScreenPosition([1, 2])
        keydown('d')
        keydown('j')
        return expect(editor.getText()).toBe('12345\n')
      }))
    })

    describe('when followed by an k', function () {
      const originalText = '12345\nabcde\nABCDE'

      beforeEach(() => editor.setText(originalText))

      describe('on the end of the file', () => it('deletes the bottom two lines', function () {
        editor.setCursorScreenPosition([2, 4])
        keydown('d')
        keydown('k')
        return expect(editor.getText()).toBe('12345\n')
      }))

      describe('on the beginning of the file', () => xit('deletes nothing', function () {
        editor.setCursorScreenPosition([0, 0])
        keydown('d')
        keydown('k')
        return expect(editor.getText()).toBe(originalText)
      }))

      return describe('when on the middle of second line', () => it('deletes the first two lines', function () {
        editor.setCursorScreenPosition([1, 2])
        keydown('d')
        keydown('k')
        return expect(editor.getText()).toBe('ABCDE')
      }))
    })

    describe('when followed by a G', function () {
      beforeEach(function () {
        const originalText = '12345\nabcde\nABCDE'
        return editor.setText(originalText)
      })

      describe('on the beginning of the second line', () => it('deletes the bottom two lines', function () {
        editor.setCursorScreenPosition([1, 0])
        keydown('d')
        keydown('G', { shift: true })
        return expect(editor.getText()).toBe('12345\n')
      }))

      return describe('on the middle of the second line', () => it('deletes the bottom two lines', function () {
        editor.setCursorScreenPosition([1, 2])
        keydown('d')
        keydown('G', { shift: true })
        return expect(editor.getText()).toBe('12345\n')
      }))
    })

    describe('when followed by a goto line G', function () {
      beforeEach(function () {
        const originalText = '12345\nabcde\nABCDE'
        return editor.setText(originalText)
      })

      describe('on the beginning of the second line', () => it('deletes the bottom two lines', function () {
        editor.setCursorScreenPosition([1, 0])
        keydown('d')
        keydown('2')
        keydown('G', { shift: true })
        return expect(editor.getText()).toBe('12345\nABCDE')
      }))

      return describe('on the middle of the second line', () => it('deletes the bottom two lines', function () {
        editor.setCursorScreenPosition([1, 2])
        keydown('d')
        keydown('2')
        keydown('G', { shift: true })
        return expect(editor.getText()).toBe('12345\nABCDE')
      }))
    })

    describe('when followed by a t)', () => describe('with the entire line yanked before', function () {
      beforeEach(function () {
        editor.setText('test (xyz)')
        return editor.setCursorScreenPosition([0, 6])
      })

      return it('deletes until the closing parenthesis', function () {
        keydown('y')
        keydown('y')
        keydown('d')
        keydown('t')
        normalModeInputKeydown(')')
        expect(editor.getText()).toBe('test ()')
        return expect(editor.getCursorScreenPosition()).toEqual([0, 6])
      })
    }))

    return describe('with multiple cursors', function () {
      it('deletes each selection', function () {
        editor.setText('abcd\n1234\nABCD\n')
        editor.setCursorBufferPosition([0, 1])
        editor.addCursorAtBufferPosition([1, 2])
        editor.addCursorAtBufferPosition([2, 3])

        keydown('d')
        keydown('e')

        expect(editor.getText()).toBe('a\n12\nABC')
        return expect(editor.getCursorBufferPositions()).toEqual([
          [0, 0],
          [1, 1],
          [2, 2]
        ])
      })

      return it("doesn't delete empty selections", function () {
        editor.setText('abcd\nabc\nabd')
        editor.setCursorBufferPosition([0, 0])
        editor.addCursorAtBufferPosition([1, 0])
        editor.addCursorAtBufferPosition([2, 0])

        keydown('d')
        keydown('t')
        normalModeInputKeydown('d')

        expect(editor.getText()).toBe('d\nabc\nd')
        return expect(editor.getCursorBufferPositions()).toEqual([
          [0, 0],
          [1, 0],
          [2, 0]
        ])
      })
    })
  })

  describe('the D keybinding', function () {
    beforeEach(function () {
      editor.getBuffer().setText('012\n')
      editor.setCursorScreenPosition([0, 1])
      return keydown('D', { shift: true })
    })

    return it('deletes the contents until the end of the line', () => expect(editor.getText()).toBe('0\n'))
  })

  describe('the c keybinding', function () {
    beforeEach(() => editor.setText('12345\nabcde\nABCDE'))

    describe('when followed by a c', function () {
      describe('with autoindent', function () {
        beforeEach(function () {
          editor.setText('12345\n  abcde\nABCDE')
          editor.setCursorScreenPosition([1, 1])
          spyOn(editor, 'shouldAutoIndent').andReturn(true)
          spyOn(editor, 'autoIndentBufferRow').andCallFake(line => editor.indent())
          return spyOn(editor.languageMode, 'suggestedIndentForLineAtBufferRow').andCallFake(() => 1)
        })

        it('deletes the current line and enters insert mode', function () {
          editor.setCursorScreenPosition([1, 1])

          keydown('c')
          keydown('c')

          expect(editor.getText()).toBe('12345\n  \nABCDE')
          expect(editor.getCursorScreenPosition()).toEqual([1, 2])
          expect(editorElement.classList.contains('normal-mode')).toBe(false)
          return expect(editorElement.classList.contains('insert-mode')).toBe(true)
        })

        it('is repeatable', function () {
          keydown('c')
          keydown('c')
          editor.insertText('abc')
          keydown('escape')
          expect(editor.getText()).toBe('12345\n  abc\nABCDE')
          editor.setCursorScreenPosition([2, 3])
          keydown('.')
          return expect(editor.getText()).toBe('12345\n  abc\n  abc\n')
        })

        return it('is undoable', function () {
          keydown('c')
          keydown('c')
          editor.insertText('abc')
          keydown('escape')
          expect(editor.getText()).toBe('12345\n  abc\nABCDE')
          keydown('u')
          expect(editor.getText()).toBe('12345\n  abcde\nABCDE')
          return expect(editor.getSelectedText()).toBe('')
        })
      })

      describe('when the cursor is on the last line', () => it("deletes the line's content and enters insert mode on the last line", function () {
        editor.setCursorScreenPosition([2, 1])

        keydown('c')
        keydown('c')

        expect(editor.getText()).toBe('12345\nabcde\n\n')
        expect(editor.getCursorScreenPosition()).toEqual([2, 0])
        expect(editorElement.classList.contains('normal-mode')).toBe(false)
        return expect(editorElement.classList.contains('insert-mode')).toBe(true)
      }))

      return describe('when the cursor is on the only line', () => it("deletes the line's content and enters insert mode", function () {
        editor.setText('12345')
        editor.setCursorScreenPosition([0, 2])

        keydown('c')
        keydown('c')

        expect(editor.getText()).toBe('')
        expect(editor.getCursorScreenPosition()).toEqual([0, 0])
        expect(editorElement.classList.contains('normal-mode')).toBe(false)
        return expect(editorElement.classList.contains('insert-mode')).toBe(true)
      }))
    })

    describe('when followed by i w', () => it("undo's and redo's completely", function () {
      editor.setCursorScreenPosition([1, 1])

      keydown('c')
      keydown('i')
      keydown('w')
      expect(editor.getText()).toBe('12345\n\nABCDE')
      expect(editor.getCursorScreenPosition()).toEqual([1, 0])
      expect(editorElement.classList.contains('insert-mode')).toBe(true)

      // Just cannot get "typing" to work correctly in test.
      editor.setText('12345\nfg\nABCDE')
      keydown('escape')
      expect(editorElement.classList.contains('normal-mode')).toBe(true)
      expect(editor.getText()).toBe('12345\nfg\nABCDE')

      keydown('u')
      expect(editor.getText()).toBe('12345\nabcde\nABCDE')
      keydown('r', { ctrl: true })
      return expect(editor.getText()).toBe('12345\nfg\nABCDE')
    }))

    describe('when followed by a w', () => it('changes the word', function () {
      editor.setText('word1 word2 word3')
      editor.setCursorBufferPosition([0, 'word1 w'.length])

      keydown('c')
      keydown('w')
      keydown('escape')

      return expect(editor.getText()).toBe('word1 w word3')
    }))

    describe('when followed by a G', function () {
      beforeEach(function () {
        const originalText = '12345\nabcde\nABCDE'
        return editor.setText(originalText)
      })

      describe('on the beginning of the second line', () => it('deletes the bottom two lines', function () {
        editor.setCursorScreenPosition([1, 0])
        keydown('c')
        keydown('G', { shift: true })
        keydown('escape')
        return expect(editor.getText()).toBe('12345\n\n')
      }))

      return describe('on the middle of the second line', () => it('deletes the bottom two lines', function () {
        editor.setCursorScreenPosition([1, 2])
        keydown('c')
        keydown('G', { shift: true })
        keydown('escape')
        return expect(editor.getText()).toBe('12345\n\n')
      }))
    })

    describe('when followed by a %', function () {
      beforeEach(() => editor.setText('12345(67)8\nabc(d)e\nA()BCDE'))

      describe('before brackets or on the first one', function () {
        beforeEach(function () {
          editor.setCursorScreenPosition([0, 1])
          editor.addCursorAtScreenPosition([1, 1])
          editor.addCursorAtScreenPosition([2, 1])
          keydown('c')
          keydown('%')
          return editor.insertText('x')
        })

        it('replaces inclusively until matching bracket', function () {
          expect(editor.getText()).toBe('1x8\naxe\nAxBCDE')
          return expect(vimState.mode).toBe('insert')
        })

        return it('undoes correctly with u', function () {
          keydown('escape')
          expect(vimState.mode).toBe('normal')
          keydown('u')
          return expect(editor.getText()).toBe('12345(67)8\nabc(d)e\nA()BCDE')
        })
      })

      describe('inside brackets or on the ending one', () => it('replaces inclusively backwards until matching bracket', function () {
        editor.setCursorScreenPosition([0, 6])
        editor.addCursorAtScreenPosition([1, 5])
        editor.addCursorAtScreenPosition([2, 2])
        keydown('c')
        keydown('%')
        editor.insertText('x')
        expect(editor.getText()).toBe('12345x7)8\nabcxe\nAxBCDE')
        return expect(vimState.mode).toBe('insert')
      }))

      describe('after or without brackets', () => it('deletes nothing', function () {
        editor.setText('12345(67)8\nabc(d)e\nABCDE')
        editor.setCursorScreenPosition([0, 9])
        editor.addCursorAtScreenPosition([2, 2])
        keydown('c')
        keydown('%')
        expect(editor.getText()).toBe('12345(67)8\nabc(d)e\nABCDE')
        return expect(vimState.mode).toBe('normal')
      }))

      return describe('repetition with .', function () {
        beforeEach(function () {
          editor.setCursorScreenPosition([0, 1])
          keydown('c')
          keydown('%')
          editor.insertText('x')
          return keydown('escape')
        })

        it('repeats correctly before a bracket', function () {
          editor.setCursorScreenPosition([1, 0])
          keydown('.')
          expect(editor.getText()).toBe('1x8\nxe\nA()BCDE')
          return expect(vimState.mode).toBe('normal')
        })

        it('repeats correctly on the opening bracket', function () {
          editor.setCursorScreenPosition([1, 3])
          keydown('.')
          expect(editor.getText()).toBe('1x8\nabcxe\nA()BCDE')
          return expect(vimState.mode).toBe('normal')
        })

        it('repeats correctly inside brackets', function () {
          editor.setCursorScreenPosition([1, 4])
          keydown('.')
          expect(editor.getText()).toBe('1x8\nabcx)e\nA()BCDE')
          return expect(vimState.mode).toBe('normal')
        })

        it('repeats correctly on the closing bracket', function () {
          editor.setCursorScreenPosition([1, 5])
          keydown('.')
          expect(editor.getText()).toBe('1x8\nabcxe\nA()BCDE')
          return expect(vimState.mode).toBe('normal')
        })

        return it('does nothing when repeated after a bracket', function () {
          editor.setCursorScreenPosition([2, 3])
          keydown('.')
          expect(editor.getText()).toBe('1x8\nabc(d)e\nA()BCDE')
          return expect(vimState.mode).toBe('normal')
        })
      })
    })

    describe('when followed by a goto line G', function () {
      beforeEach(() => editor.setText('12345\nabcde\nABCDE'))

      describe('on the beginning of the second line', () => it('deletes all the text on the line', function () {
        editor.setCursorScreenPosition([1, 0])
        keydown('c')
        keydown('2')
        keydown('G', { shift: true })
        keydown('escape')
        return expect(editor.getText()).toBe('12345\n\nABCDE')
      }))

      return describe('on the middle of the second line', () => it('deletes all the text on the line', function () {
        editor.setCursorScreenPosition([1, 2])
        keydown('c')
        keydown('2')
        keydown('G', { shift: true })
        keydown('escape')
        return expect(editor.getText()).toBe('12345\n\nABCDE')
      }))
    })

    return describe('in visual mode', function () {
      beforeEach(function () {
        editor.setText('123456789\nabcde\nfghijklmnopq\nuvwxyz')
        return editor.setCursorScreenPosition([1, 1])
      })

      describe('with characterwise selection on a single line', function () {
        it('repeats with .', function () {
          keydown('v')
          keydown('2')
          keydown('l')
          keydown('c')
          editor.insertText('ab')
          keydown('escape')
          expect(editor.getText()).toBe('123456789\naabe\nfghijklmnopq\nuvwxyz')

          editor.setCursorScreenPosition([0, 1])
          keydown('.')
          return expect(editor.getText()).toBe('1ab56789\naabe\nfghijklmnopq\nuvwxyz')
        })

        it('repeats shortened with . near the end of the line', function () {
          editor.setCursorScreenPosition([0, 2])
          keydown('v')
          keydown('4')
          keydown('l')
          keydown('c')
          editor.insertText('ab')
          keydown('escape')
          expect(editor.getText()).toBe('12ab89\nabcde\nfghijklmnopq\nuvwxyz')

          editor.setCursorScreenPosition([1, 3])
          keydown('.')
          return expect(editor.getText()).toBe('12ab89\nabcab\nfghijklmnopq\nuvwxyz')
        })

        return it('repeats shortened with . near the end of the line regardless of whether motion wrapping is enabled', function () {
          atom.config.set('vim-mode.wrapLeftRightMotion', true)
          editor.setCursorScreenPosition([0, 2])
          keydown('v')
          keydown('4')
          keydown('l')
          keydown('c')
          editor.insertText('ab')
          keydown('escape')
          expect(editor.getText()).toBe('12ab89\nabcde\nfghijklmnopq\nuvwxyz')

          editor.setCursorScreenPosition([1, 3])
          keydown('.')
          // this differs from VIM, which would eat the \n before fghij...
          return expect(editor.getText()).toBe('12ab89\nabcab\nfghijklmnopq\nuvwxyz')
        })
      })

      describe('is repeatable with characterwise selection over multiple lines', function () {
        it('repeats with .', function () {
          keydown('v')
          keydown('j')
          keydown('3')
          keydown('l')
          keydown('c')
          editor.insertText('x')
          keydown('escape')
          expect(editor.getText()).toBe('123456789\naxklmnopq\nuvwxyz')

          editor.setCursorScreenPosition([0, 1])
          keydown('.')
          return expect(editor.getText()).toBe('1xnopq\nuvwxyz')
        })

        return it('repeats shortened with . near the end of the line', function () {
          // this behaviour is unlike VIM, see #737
          keydown('v')
          keydown('j')
          keydown('6')
          keydown('l')
          keydown('c')
          editor.insertText('x')
          keydown('escape')
          expect(editor.getText()).toBe('123456789\naxnopq\nuvwxyz')

          editor.setCursorScreenPosition([0, 1])
          keydown('.')
          return expect(editor.getText()).toBe('1x\nuvwxyz')
        })
      })

      describe('is repeatable with linewise selection', function () {
        describe('with one line selected', () => it('repeats with .', function () {
          keydown('V', { shift: true })
          keydown('c')
          editor.insertText('x')
          keydown('escape')
          expect(editor.getText()).toBe('123456789\nx\nfghijklmnopq\nuvwxyz')

          editor.setCursorScreenPosition([0, 7])
          keydown('.')
          expect(editor.getText()).toBe('x\nx\nfghijklmnopq\nuvwxyz')

          editor.setCursorScreenPosition([2, 0])
          keydown('.')
          return expect(editor.getText()).toBe('x\nx\nx\nuvwxyz')
        }))

        return describe('with multiple lines selected', function () {
          it('repeats with .', function () {
            keydown('V', { shift: true })
            keydown('j')
            keydown('c')
            editor.insertText('x')
            keydown('escape')
            expect(editor.getText()).toBe('123456789\nx\nuvwxyz')

            editor.setCursorScreenPosition([0, 7])
            keydown('.')
            return expect(editor.getText()).toBe('x\nuvwxyz')
          })

          return it('repeats shortened with . near the end of the file', function () {
            keydown('V', { shift: true })
            keydown('j')
            keydown('c')
            editor.insertText('x')
            keydown('escape')
            expect(editor.getText()).toBe('123456789\nx\nuvwxyz')

            editor.setCursorScreenPosition([1, 7])
            keydown('.')
            return expect(editor.getText()).toBe('123456789\nx\n')
          })
        })
      })

      return xdescribe('is repeatable with block selection', function () {})
    })
  })
  // there is no block selection yet

  describe('the C keybinding', function () {
    beforeEach(function () {
      editor.getBuffer().setText('012\n')
      editor.setCursorScreenPosition([0, 1])
      return keydown('C', { shift: true })
    })

    return it('deletes the contents until the end of the line and enters insert mode', function () {
      expect(editor.getText()).toBe('0\n')
      expect(editor.getCursorScreenPosition()).toEqual([0, 1])
      expect(editorElement.classList.contains('normal-mode')).toBe(false)
      return expect(editorElement.classList.contains('insert-mode')).toBe(true)
    })
  })

  describe('the y keybinding', function () {
    beforeEach(function () {
      editor.getBuffer().setText('012 345\nabc\ndefg\n')
      editor.setCursorScreenPosition([0, 4])
      return vimState.setRegister('"', { text: '345' })
    })

    describe('when selected lines in visual linewise mode', function () {
      beforeEach(function () {
        keydown('V', { shift: true })
        keydown('j')
        return keydown('y')
      })

      it('is in linewise motion', () => expect(vimState.getRegister('"').type).toEqual('linewise'))

      it('saves the lines to the default register', () => expect(vimState.getRegister('"').text).toBe('012 345\nabc\n'))

      return it('places the cursor at the beginning of the selection', () => expect(editor.getCursorBufferPositions()).toEqual([[0, 0]]))
    })

    describe('when followed by a second y ', function () {
      beforeEach(function () {
        keydown('y')
        return keydown('y')
      })

      it('saves the line to the default register', () => expect(vimState.getRegister('"').text).toBe('012 345\n'))

      return it('leaves the cursor at the starting position', () => expect(editor.getCursorScreenPosition()).toEqual([0, 4]))
    })

    describe('when useClipboardAsDefaultRegister enabled', () => it('writes to clipboard', function () {
      atom.config.set('vim-mode.useClipboardAsDefaultRegister', true)
      keydown('y')
      keydown('y')
      return expect(atom.clipboard.read()).toBe('012 345\n')
    }))

    describe('when followed with a repeated y', function () {
      beforeEach(function () {
        keydown('y')
        keydown('2')
        return keydown('y')
      })

      it('copies n lines, starting from the current', () => expect(vimState.getRegister('"').text).toBe('012 345\nabc\n'))

      return it('leaves the cursor at the starting position', () => expect(editor.getCursorScreenPosition()).toEqual([0, 4]))
    })

    describe('with a register', function () {
      beforeEach(function () {
        keydown('"')
        keydown('a')
        keydown('y')
        return keydown('y')
      })

      it('saves the line to the a register', () => expect(vimState.getRegister('a').text).toBe('012 345\n'))

      return it('appends the line to the A register', function () {
        keydown('"')
        keydown('A', { shift: true })
        keydown('y')
        keydown('y')
        return expect(vimState.getRegister('a').text).toBe('012 345\n012 345\n')
      })
    })

    describe('with a forward motion', function () {
      beforeEach(function () {
        keydown('y')
        return keydown('e')
      })

      it('saves the selected text to the default register', () => expect(vimState.getRegister('"').text).toBe('345'))

      it('leaves the cursor at the starting position', () => expect(editor.getCursorScreenPosition()).toEqual([0, 4]))

      return it('does not yank when motion fails', function () {
        keydown('y')
        keydown('t')
        normalModeInputKeydown('x')
        return expect(vimState.getRegister('"').text).toBe('345')
      })
    })

    describe('with a text object', () => it('moves the cursor to the beginning of the text object', function () {
      editor.setCursorBufferPosition([0, 5])
      keydown('y')
      keydown('i')
      keydown('w')
      return expect(editor.getCursorBufferPositions()).toEqual([[0, 4]])
    }))

    describe('with a left motion', function () {
      beforeEach(function () {
        keydown('y')
        return keydown('h')
      })

      it('saves the left letter to the default register', () => expect(vimState.getRegister('"').text).toBe(' '))

      return it('moves the cursor position to the left', () => expect(editor.getCursorScreenPosition()).toEqual([0, 3]))
    })

    describe('with a down motion', function () {
      beforeEach(function () {
        keydown('y')
        return keydown('j')
      })

      it('saves both full lines to the default register', () => expect(vimState.getRegister('"').text).toBe('012 345\nabc\n'))

      return it('leaves the cursor at the starting position', () => expect(editor.getCursorScreenPosition()).toEqual([0, 4]))
    })

    describe('with an up motion', function () {
      beforeEach(function () {
        editor.setCursorScreenPosition([2, 2])
        keydown('y')
        return keydown('k')
      })

      it('saves both full lines to the default register', () => expect(vimState.getRegister('"').text).toBe('abc\ndefg\n'))

      return it('puts the cursor on the first line and the original column', () => expect(editor.getCursorScreenPosition()).toEqual([1, 2]))
    })

    describe('when followed by a G', function () {
      beforeEach(function () {
        const originalText = '12345\nabcde\nABCDE'
        return editor.setText(originalText)
      })

      describe('on the beginning of the second line', () => it('deletes the bottom two lines', function () {
        editor.setCursorScreenPosition([1, 0])
        keydown('y')
        keydown('G', { shift: true })
        keydown('P', { shift: true })
        return expect(editor.getText()).toBe('12345\nabcde\nABCDE\nabcde\nABCDE')
      }))

      return describe('on the middle of the second line', () => it('deletes the bottom two lines', function () {
        editor.setCursorScreenPosition([1, 2])
        keydown('y')
        keydown('G', { shift: true })
        keydown('P', { shift: true })
        return expect(editor.getText()).toBe('12345\nabcde\nABCDE\nabcde\nABCDE')
      }))
    })

    describe('when followed by a goto line G', function () {
      beforeEach(function () {
        const originalText = '12345\nabcde\nABCDE'
        return editor.setText(originalText)
      })

      describe('on the beginning of the second line', () => it('deletes the bottom two lines', function () {
        editor.setCursorScreenPosition([1, 0])
        keydown('y')
        keydown('2')
        keydown('G', { shift: true })
        keydown('P', { shift: true })
        return expect(editor.getText()).toBe('12345\nabcde\nabcde\nABCDE')
      }))

      return describe('on the middle of the second line', () => it('deletes the bottom two lines', function () {
        editor.setCursorScreenPosition([1, 2])
        keydown('y')
        keydown('2')
        keydown('G', { shift: true })
        keydown('P', { shift: true })
        return expect(editor.getText()).toBe('12345\nabcde\nabcde\nABCDE')
      }))
    })

    describe('with multiple cursors', () => it("moves each cursor and copies the last selection's text", function () {
      editor.setText('  abcd\n  1234')
      editor.setCursorBufferPosition([0, 0])
      editor.addCursorAtBufferPosition([1, 5])

      keydown('y')
      keydown('^')

      expect(vimState.getRegister('"').text).toBe('123')
      return expect(editor.getCursorBufferPositions()).toEqual([[0, 0], [1, 2]])
    }))

    return describe('in a long file', function () {
      beforeEach(function () {
        jasmine.attachToDOM(editorElement)
        editorElement.setHeight(400)
        editorElement.style.lineHeight = '10px'
        editorElement.style.font = '16px monospace'
        atom.views.performDocumentPoll()

        let text = ''
        for (let i = 1; i <= 200; i++) {
          text += `${i}\n`
        }
        return editor.setText(text)
      })

      describe('yanking many lines forward', () => it('does not scroll the window', function () {
        editor.setCursorBufferPosition([40, 1])
        const previousScrollTop = editorElement.getScrollTop()

        // yank many lines
        keydown('y')
        keydown('1')
        keydown('6')
        keydown('0')
        keydown('G', { shift: true })

        expect(editorElement.getScrollTop()).toEqual(previousScrollTop)
        expect(editor.getCursorBufferPosition()).toEqual([40, 1])
        return expect(vimState.getRegister('"').text.split('\n').length).toBe(121)
      }))

      return describe('yanking many lines backwards', () => it('scrolls the window', function () {
        editor.setCursorBufferPosition([140, 1])
        const previousScrollTop = editorElement.getScrollTop()

        // yank many lines
        keydown('y')
        keydown('6')
        keydown('0')
        keydown('G', { shift: true })

        expect(editorElement.getScrollTop()).toNotEqual(previousScrollTop)
        expect(editor.getCursorBufferPosition()).toEqual([59, 1])
        return expect(vimState.getRegister('"').text.split('\n').length).toBe(83)
      }))
    })
  })

  describe('the yy keybinding', function () {
    describe('on a single line file', function () {
      beforeEach(function () {
        editor.getBuffer().setText('exclamation!\n')
        return editor.setCursorScreenPosition([0, 0])
      })

      return it('copies the entire line and pastes it correctly', function () {
        keydown('y')
        keydown('y')
        keydown('p')

        expect(vimState.getRegister('"').text).toBe('exclamation!\n')
        return expect(editor.getText()).toBe('exclamation!\nexclamation!\n')
      })
    })

    return describe('on a single line file with no newline', function () {
      beforeEach(function () {
        editor.getBuffer().setText('no newline!')
        return editor.setCursorScreenPosition([0, 0])
      })

      it('copies the entire line and pastes it correctly', function () {
        keydown('y')
        keydown('y')
        keydown('p')

        expect(vimState.getRegister('"').text).toBe('no newline!\n')
        return expect(editor.getText()).toBe('no newline!\nno newline!')
      })

      return it('copies the entire line and pastes it respecting count and new lines', function () {
        keydown('y')
        keydown('y')
        keydown('2')
        keydown('p')

        expect(vimState.getRegister('"').text).toBe('no newline!\n')
        return expect(editor.getText()).toBe('no newline!\nno newline!\nno newline!')
      })
    })
  })

  describe('the Y keybinding', function () {
    beforeEach(function () {
      editor.getBuffer().setText('012 345\nabc\n')
      return editor.setCursorScreenPosition([0, 4])
    })

    return it('saves the line to the default register', function () {
      keydown('Y', { shift: true })

      expect(vimState.getRegister('"').text).toBe('012 345\n')
      return expect(editor.getCursorScreenPosition()).toEqual([0, 4])
    })
  })

  describe('the p keybinding', function () {
    describe('with character contents', function () {
      beforeEach(function () {
        editor.getBuffer().setText('012\n')
        editor.setCursorScreenPosition([0, 0])
        vimState.setRegister('"', { text: '345' })
        vimState.setRegister('a', { text: 'a' })
        return atom.clipboard.write('clip')
      })

      describe('from the default register', function () {
        beforeEach(() => keydown('p'))

        return it('inserts the contents', function () {
          expect(editor.getText()).toBe('034512\n')
          return expect(editor.getCursorScreenPosition()).toEqual([0, 3])
        })
      })

      describe('at the end of a line', function () {
        beforeEach(function () {
          editor.setCursorScreenPosition([0, 2])
          return keydown('p')
        })

        return it('positions cursor correctly', function () {
          expect(editor.getText()).toBe('012345\n')
          return expect(editor.getCursorScreenPosition()).toEqual([0, 5])
        })
      })

      describe('when useClipboardAsDefaultRegister enabled', () => it('inserts contents from clipboard', function () {
        atom.config.set('vim-mode.useClipboardAsDefaultRegister', true)
        keydown('p')
        return expect(editor.getText()).toBe('0clip12\n')
      }))

      describe('from a specified register', function () {
        beforeEach(function () {
          keydown('"')
          keydown('a')
          return keydown('p')
        })

        return it("inserts the contents of the 'a' register", function () {
          expect(editor.getText()).toBe('0a12\n')
          return expect(editor.getCursorScreenPosition()).toEqual([0, 1])
        })
      })

      describe('at the end of a line', () => it("inserts before the current line's newline", function () {
        editor.setText('abcde\none two three')
        editor.setCursorScreenPosition([1, 4])

        keydown('d')
        keydown('$')
        keydown('k')
        keydown('$')
        keydown('p')

        return expect(editor.getText()).toBe('abcdetwo three\none ')
      }))

      return describe('with a selection', function () {
        beforeEach(function () {
          editor.selectRight()
          return keydown('p')
        })

        return it('replaces the current selection', function () {
          expect(editor.getText()).toBe('34512\n')
          return expect(editor.getCursorScreenPosition()).toEqual([0, 2])
        })
      })
    })

    describe('with linewise contents', function () {
      describe('on a single line', function () {
        beforeEach(function () {
          editor.getBuffer().setText('012')
          editor.setCursorScreenPosition([0, 1])
          return vimState.setRegister('"', { text: ' 345\n', type: 'linewise' })
        })

        it('inserts the contents of the default register', function () {
          keydown('p')

          expect(editor.getText()).toBe('012\n 345')
          return expect(editor.getCursorScreenPosition()).toEqual([1, 1])
        })

        return it('replaces the current selection', function () {
          editor.selectRight()
          keydown('p')

          expect(editor.getText()).toBe('0 345\n2')
          return expect(editor.getCursorScreenPosition()).toEqual([1, 0])
        })
      })

      return describe('on multiple lines', function () {
        beforeEach(function () {
          editor.getBuffer().setText('012\n 345')
          return vimState.setRegister('"', { text: ' 456\n', type: 'linewise' })
        })

        it('inserts the contents of the default register at middle line', function () {
          editor.setCursorScreenPosition([0, 1])
          keydown('p')

          expect(editor.getText()).toBe('012\n 456\n 345')
          return expect(editor.getCursorScreenPosition()).toEqual([1, 1])
        })

        return it('inserts the contents of the default register at end of line', function () {
          editor.setCursorScreenPosition([1, 1])
          keydown('p')

          expect(editor.getText()).toBe('012\n 345\n 456')
          return expect(editor.getCursorScreenPosition()).toEqual([2, 1])
        })
      })
    })

    describe('with multiple linewise contents', function () {
      beforeEach(function () {
        editor.getBuffer().setText('012\nabc')
        editor.setCursorScreenPosition([1, 0])
        vimState.setRegister('"', { text: ' 345\n 678\n', type: 'linewise' })
        return keydown('p')
      })

      return it('inserts the contents of the default register', function () {
        expect(editor.getText()).toBe('012\nabc\n 345\n 678')
        return expect(editor.getCursorScreenPosition()).toEqual([2, 1])
      })
    })

    return describe('pasting twice', function () {
      beforeEach(function () {
        editor.setText('12345\nabcde\nABCDE\nQWERT')
        editor.setCursorScreenPosition([1, 1])
        vimState.setRegister('"', { text: '123' })
        keydown('2')
        return keydown('p')
      })

      it('inserts the same line twice', () => expect(editor.getText()).toBe('12345\nab123123cde\nABCDE\nQWERT'))

      return describe('when undone', function () {
        beforeEach(() => keydown('u'))

        return it('removes both lines', () => expect(editor.getText()).toBe('12345\nabcde\nABCDE\nQWERT'))
      })
    })
  })

  describe('the P keybinding', () => describe('with character contents', function () {
    beforeEach(function () {
      editor.getBuffer().setText('012\n')
      editor.setCursorScreenPosition([0, 0])
      vimState.setRegister('"', { text: '345' })
      vimState.setRegister('a', { text: 'a' })
      return keydown('P', { shift: true })
    })

    return it('inserts the contents of the default register above', function () {
      expect(editor.getText()).toBe('345012\n')
      return expect(editor.getCursorScreenPosition()).toEqual([0, 2])
    })
  }))

  describe('the O keybinding', function () {
    beforeEach(function () {
      spyOn(editor, 'shouldAutoIndent').andReturn(true)
      spyOn(editor, 'autoIndentBufferRow').andCallFake(line => editor.indent())

      editor.getBuffer().setText('  abc\n  012\n')
      return editor.setCursorScreenPosition([1, 1])
    })

    it('switches to insert and adds a newline above the current one', function () {
      keydown('O', { shift: true })
      expect(editor.getText()).toBe('  abc\n  \n  012\n')
      expect(editor.getCursorScreenPosition()).toEqual([1, 2])
      return expect(editorElement.classList.contains('insert-mode')).toBe(true)
    })

    it('is repeatable', function () {
      editor.getBuffer().setText('  abc\n  012\n    4spaces\n')
      editor.setCursorScreenPosition([1, 1])
      keydown('O', { shift: true })
      editor.insertText('def')
      keydown('escape')
      expect(editor.getText()).toBe('  abc\n  def\n  012\n    4spaces\n')
      editor.setCursorScreenPosition([1, 1])
      keydown('.')
      expect(editor.getText()).toBe('  abc\n  def\n  def\n  012\n    4spaces\n')
      editor.setCursorScreenPosition([4, 1])
      keydown('.')
      return expect(editor.getText()).toBe('  abc\n  def\n  def\n  012\n    def\n    4spaces\n')
    })

    return it('is undoable', function () {
      keydown('O', { shift: true })
      editor.insertText('def')
      keydown('escape')
      expect(editor.getText()).toBe('  abc\n  def\n  012\n')
      keydown('u')
      return expect(editor.getText()).toBe('  abc\n  012\n')
    })
  })

  describe('the o keybinding', function () {
    beforeEach(function () {
      spyOn(editor, 'shouldAutoIndent').andReturn(true)
      spyOn(editor, 'autoIndentBufferRow').andCallFake(line => editor.indent())

      editor.getBuffer().setText('abc\n  012\n')
      return editor.setCursorScreenPosition([1, 2])
    })

    it('switches to insert and adds a newline above the current one', function () {
      keydown('o')
      expect(editor.getText()).toBe('abc\n  012\n  \n')
      expect(editorElement.classList.contains('insert-mode')).toBe(true)
      return expect(editor.getCursorScreenPosition()).toEqual([2, 2])
    })

    // This works in practice, but the editor doesn't respect the indentation
    // rules without a syntax grammar. Need to set the editor's grammar
    // to fix it.
    xit('is repeatable', function () {
      editor.getBuffer().setText('  abc\n  012\n    4spaces\n')
      editor.setCursorScreenPosition([1, 1])
      keydown('o')
      editor.insertText('def')
      keydown('escape')
      expect(editor.getText()).toBe('  abc\n  012\n  def\n    4spaces\n')
      keydown('.')
      expect(editor.getText()).toBe('  abc\n  012\n  def\n  def\n    4spaces\n')
      editor.setCursorScreenPosition([4, 1])
      keydown('.')
      return expect(editor.getText()).toBe('  abc\n  def\n  def\n  012\n    4spaces\n    def\n')
    })

    return it('is undoable', function () {
      keydown('o')
      editor.insertText('def')
      keydown('escape')
      expect(editor.getText()).toBe('abc\n  012\n  def\n')
      keydown('u')
      return expect(editor.getText()).toBe('abc\n  012\n')
    })
  })

  describe('the a keybinding', function () {
    beforeEach(() => editor.getBuffer().setText('012\n'))

    describe('at the beginning of the line', function () {
      beforeEach(function () {
        editor.setCursorScreenPosition([0, 0])
        return keydown('a')
      })

      return it('switches to insert mode and shifts to the right', function () {
        expect(editor.getCursorScreenPosition()).toEqual([0, 1])
        return expect(editorElement.classList.contains('insert-mode')).toBe(true)
      })
    })

    return describe('at the end of the line', function () {
      beforeEach(function () {
        editor.setCursorScreenPosition([0, 3])
        return keydown('a')
      })

      return it("doesn't linewrap", () => expect(editor.getCursorScreenPosition()).toEqual([0, 3]))
    })
  })

  describe('the A keybinding', function () {
    beforeEach(() => editor.getBuffer().setText('11\n22\n'))

    return describe('at the beginning of a line', function () {
      it('switches to insert mode at the end of the line', function () {
        editor.setCursorScreenPosition([0, 0])
        keydown('A', { shift: true })

        expect(editorElement.classList.contains('insert-mode')).toBe(true)
        return expect(editor.getCursorScreenPosition()).toEqual([0, 2])
      })

      return it('repeats always as insert at the end of the line', function () {
        editor.setCursorScreenPosition([0, 0])
        keydown('A', { shift: true })
        editor.insertText('abc')
        keydown('escape')
        editor.setCursorScreenPosition([1, 0])
        keydown('.')

        expect(editor.getText()).toBe('11abc\n22abc\n')
        expect(editorElement.classList.contains('insert-mode')).toBe(false)
        return expect(editor.getCursorScreenPosition()).toEqual([1, 4])
      })
    })
  })

  describe('the I keybinding', function () {
    beforeEach(() => editor.getBuffer().setText('11\n  22\n'))

    return describe('at the end of a line', function () {
      it('switches to insert mode at the beginning of the line', function () {
        editor.setCursorScreenPosition([0, 2])
        keydown('I', { shift: true })

        expect(editorElement.classList.contains('insert-mode')).toBe(true)
        return expect(editor.getCursorScreenPosition()).toEqual([0, 0])
      })

      it('switches to insert mode after leading whitespace', function () {
        editor.setCursorScreenPosition([1, 4])
        keydown('I', { shift: true })

        expect(editorElement.classList.contains('insert-mode')).toBe(true)
        return expect(editor.getCursorScreenPosition()).toEqual([1, 2])
      })

      return it('repeats always as insert at the first character of the line', function () {
        editor.setCursorScreenPosition([0, 2])
        keydown('I', { shift: true })
        editor.insertText('abc')
        keydown('escape')
        expect(editor.getCursorScreenPosition()).toEqual([0, 2])
        editor.setCursorScreenPosition([1, 4])
        keydown('.')

        expect(editor.getText()).toBe('abc11\n  abc22\n')
        expect(editorElement.classList.contains('insert-mode')).toBe(false)
        return expect(editor.getCursorScreenPosition()).toEqual([1, 4])
      })
    })
  })

  describe('the J keybinding', function () {
    beforeEach(function () {
      editor.getBuffer().setText('012\n    456\n')
      return editor.setCursorScreenPosition([0, 1])
    })

    describe('without repeating', function () {
      beforeEach(() => keydown('J', { shift: true }))

      return it('joins the contents of the current line with the one below it', () => expect(editor.getText()).toBe('012 456\n'))
    })

    return describe('with repeating', function () {
      beforeEach(function () {
        editor.setText('12345\nabcde\nABCDE\nQWERT')
        editor.setCursorScreenPosition([1, 1])
        keydown('2')
        return keydown('J', { shift: true })
      })

      return describe('undo behavior', function () {
        beforeEach(() => keydown('u'))

        return it('handles repeats', () => expect(editor.getText()).toBe('12345\nabcde\nABCDE\nQWERT'))
      })
    })
  })

  describe('the > keybinding', function () {
    beforeEach(() => editor.setText('12345\nabcde\nABCDE'))

    describe('on the last line', function () {
      beforeEach(() => editor.setCursorScreenPosition([2, 0]))

      return describe('when followed by a >', function () {
        beforeEach(function () {
          keydown('>')
          return keydown('>')
        })

        return it('indents the current line', function () {
          expect(editor.getText()).toBe('12345\nabcde\n  ABCDE')
          return expect(editor.getCursorScreenPosition()).toEqual([2, 2])
        })
      })
    })

    describe('on the first line', function () {
      beforeEach(() => editor.setCursorScreenPosition([0, 0]))

      describe('when followed by a >', function () {
        beforeEach(function () {
          keydown('>')
          return keydown('>')
        })

        return it('indents the current line', function () {
          expect(editor.getText()).toBe('  12345\nabcde\nABCDE')
          return expect(editor.getCursorScreenPosition()).toEqual([0, 2])
        })
      })

      return describe('when followed by a repeating >', function () {
        beforeEach(function () {
          keydown('3')
          keydown('>')
          return keydown('>')
        })

        it('indents multiple lines at once', function () {
          expect(editor.getText()).toBe('  12345\n  abcde\n  ABCDE')
          return expect(editor.getCursorScreenPosition()).toEqual([0, 2])
        })

        return describe('undo behavior', function () {
          beforeEach(() => keydown('u'))

          return it('outdents all three lines', () => expect(editor.getText()).toBe('12345\nabcde\nABCDE'))
        })
      })
    })

    describe('in visual mode linewise', function () {
      beforeEach(function () {
        editor.setCursorScreenPosition([0, 0])
        keydown('v', { shift: true })
        return keydown('j')
      })

      describe('single indent multiple lines', function () {
        beforeEach(() => keydown('>'))

        it('indents both lines once and exits visual mode', function () {
          expect(editorElement.classList.contains('normal-mode')).toBe(true)
          expect(editor.getText()).toBe('  12345\n  abcde\nABCDE')
          return expect(editor.getSelectedBufferRanges()).toEqual([[[0, 2], [0, 2]]])
        })

        return it('allows repeating the operation', function () {
          keydown('.')
          return expect(editor.getText()).toBe('    12345\n    abcde\nABCDE')
        })
      })

      return describe('multiple indent multiple lines', function () {
        beforeEach(function () {
          keydown('2')
          return keydown('>')
        })

        return it('indents both lines twice and exits visual mode', function () {
          expect(editorElement.classList.contains('normal-mode')).toBe(true)
          expect(editor.getText()).toBe('    12345\n    abcde\nABCDE')
          return expect(editor.getSelectedBufferRanges()).toEqual([[[0, 4], [0, 4]]])
        })
      })
    })

    return describe('with multiple selections', function () {
      beforeEach(function () {
        editor.setCursorScreenPosition([1, 3])
        keydown('v')
        keydown('j')
        return editor.addCursorAtScreenPosition([0, 0])
      })

      return it('indents the lines and keeps the cursors', function () {
        keydown('>')
        expect(editor.getText()).toBe('  12345\n  abcde\n  ABCDE')
        return expect(editor.getCursorScreenPositions()).toEqual([[1, 2], [0, 2]])
      })
    })
  })

  describe('the < keybinding', function () {
    beforeEach(function () {
      editor.setText('    12345\n    abcde\nABCDE')
      return editor.setCursorScreenPosition([0, 0])
    })

    describe('when followed by a <', function () {
      beforeEach(function () {
        keydown('<')
        return keydown('<')
      })

      return it('outdents the current line', function () {
        expect(editor.getText()).toBe('  12345\n    abcde\nABCDE')
        return expect(editor.getCursorScreenPosition()).toEqual([0, 2])
      })
    })

    describe('when followed by a repeating <', function () {
      beforeEach(function () {
        keydown('2')
        keydown('<')
        return keydown('<')
      })

      it('outdents multiple lines at once', function () {
        expect(editor.getText()).toBe('  12345\n  abcde\nABCDE')
        return expect(editor.getCursorScreenPosition()).toEqual([0, 2])
      })

      return describe('undo behavior', function () {
        beforeEach(() => keydown('u'))

        return it('indents both lines', () => expect(editor.getText()).toBe('    12345\n    abcde\nABCDE'))
      })
    })

    return describe('in visual mode linewise', function () {
      beforeEach(function () {
        keydown('v', { shift: true })
        return keydown('j')
      })

      describe('single outdent multiple lines', function () {
        beforeEach(() => keydown('<'))

        it('outdents the current line and exits visual mode', function () {
          expect(editorElement.classList.contains('normal-mode')).toBe(true)
          expect(editor.getText()).toBe('  12345\n  abcde\nABCDE')
          return expect(editor.getSelectedBufferRanges()).toEqual([[[0, 2], [0, 2]]])
        })

        return it('allows repeating the operation', function () {
          keydown('.')
          return expect(editor.getText()).toBe('12345\nabcde\nABCDE')
        })
      })

      return describe('multiple outdent multiple lines', function () {
        beforeEach(function () {
          keydown('2')
          return keydown('<')
        })

        return it('outdents both lines twice and exits visual mode', function () {
          expect(editorElement.classList.contains('normal-mode')).toBe(true)
          expect(editor.getText()).toBe('12345\nabcde\nABCDE')
          return expect(editor.getSelectedBufferRanges()).toEqual([[[0, 0], [0, 0]]])
        })
      })
    })
  })

  describe('the = keybinding', function () {
    let oldGrammar = []

    beforeEach(function () {
      waitsForPromise(() => atom.packages.activatePackage('language-javascript'))

      oldGrammar = editor.getGrammar()
      editor.setText('foo\n  bar\n  baz')
      return editor.setCursorScreenPosition([1, 0])
    })

    return describe('when used in a scope that supports auto-indent', function () {
      beforeEach(function () {
        const jsGrammar = atom.grammars.grammarForScopeName('source.js')
        return editor.setGrammar(jsGrammar)
      })

      afterEach(() => editor.setGrammar(oldGrammar))

      describe('when followed by a =', function () {
        beforeEach(function () {
          keydown('=')
          return keydown('=')
        })

        return it('indents the current line', () => expect(editor.indentationForBufferRow(1)).toBe(0))
      })

      describe('when followed by a G', function () {
        beforeEach(function () {
          editor.setCursorScreenPosition([0, 0])
          keydown('=')
          return keydown('G', { shift: true })
        })

        return it('uses the default count', function () {
          expect(editor.indentationForBufferRow(1)).toBe(0)
          return expect(editor.indentationForBufferRow(2)).toBe(0)
        })
      })

      return describe('when followed by a repeating =', function () {
        beforeEach(function () {
          keydown('2')
          keydown('=')
          return keydown('=')
        })

        it('autoindents multiple lines at once', function () {
          expect(editor.getText()).toBe('foo\nbar\nbaz')
          return expect(editor.getCursorScreenPosition()).toEqual([1, 0])
        })

        return describe('undo behavior', function () {
          beforeEach(() => keydown('u'))

          return it('indents both lines', () => expect(editor.getText()).toBe('foo\n  bar\n  baz'))
        })
      })
    })
  })

  describe('the . keybinding', function () {
    beforeEach(function () {
      editor.setText('12\n34\n56\n78')
      return editor.setCursorScreenPosition([0, 0])
    })

    it('repeats the last operation', function () {
      keydown('2')
      keydown('d')
      keydown('d')
      keydown('.')

      return expect(editor.getText()).toBe('')
    })

    return it('composes with motions', function () {
      keydown('d')
      keydown('d')
      keydown('2')
      keydown('.')

      return expect(editor.getText()).toBe('78')
    })
  })

  describe('the r keybinding', function () {
    beforeEach(function () {
      editor.setText('12\n34\n\n')
      editor.setCursorBufferPosition([0, 0])
      return editor.addCursorAtBufferPosition([1, 0])
    })

    it('replaces a single character', function () {
      keydown('r')
      normalModeInputKeydown('x')
      return expect(editor.getText()).toBe('x2\nx4\n\n')
    })

    it('does nothing when cancelled', function () {
      keydown('r')
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(true)
      keydown('escape')
      expect(editor.getText()).toBe('12\n34\n\n')
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    it('replaces a single character with a line break', function () {
      keydown('r')
      atom.commands.dispatch(editor.normalModeInputView.editorElement, 'core:confirm')
      expect(editor.getText()).toBe('\n2\n\n4\n\n')
      return expect(editor.getCursorBufferPositions()).toEqual([[1, 0], [3, 0]])
    })

    it('composes properly with motions', function () {
      keydown('2')
      keydown('r')
      normalModeInputKeydown('x')
      return expect(editor.getText()).toBe('xx\nxx\n\n')
    })

    it('does nothing on an empty line', function () {
      editor.setCursorBufferPosition([2, 0])
      keydown('r')
      normalModeInputKeydown('x')
      return expect(editor.getText()).toBe('12\n34\n\n')
    })

    it('does nothing if asked to replace more characters than there are on a line', function () {
      keydown('3')
      keydown('r')
      normalModeInputKeydown('x')
      return expect(editor.getText()).toBe('12\n34\n\n')
    })

    describe('when in visual mode', function () {
      beforeEach(function () {
        keydown('v')
        return keydown('e')
      })

      it('replaces the entire selection with the given character', function () {
        keydown('r')
        normalModeInputKeydown('x')
        return expect(editor.getText()).toBe('xx\nxx\n\n')
      })

      return it('leaves the cursor at the beginning of the selection', function () {
        keydown('r')
        normalModeInputKeydown('x')
        return expect(editor.getCursorBufferPositions()).toEqual([[0, 0], [1, 0]])
      })
    })

    return describe('with accented characters', function () {
      const buildIMECompositionEvent = function (event, param) {
        if (param == null) { param = {} }
        const { data, target } = param
        event = new Event(event)
        event.data = data
        Object.defineProperty(event, 'target', { get () { return target } })
        return event
      }

      const buildTextInputEvent = function ({ data, target }) {
        const event = new Event('textInput')
        event.data = data
        Object.defineProperty(event, 'target', { get () { return target } })
        return event
      }

      return it('works with IME composition', function () {
        keydown('r')
        const normalModeEditor = editor.normalModeInputView.editorElement
        jasmine.attachToDOM(normalModeEditor)
        const {
          domNode
        } = normalModeEditor.component
        const inputNode = domNode.querySelector('.hidden-input')
        domNode.dispatchEvent(buildIMECompositionEvent('compositionstart', { target: inputNode }))
        domNode.dispatchEvent(buildIMECompositionEvent('compositionupdate', { data: 's', target: inputNode }))
        expect(normalModeEditor.getModel().getText()).toEqual('s')
        domNode.dispatchEvent(buildIMECompositionEvent('compositionupdate', { data: 'sd', target: inputNode }))
        expect(normalModeEditor.getModel().getText()).toEqual('sd')
        domNode.dispatchEvent(buildIMECompositionEvent('compositionend', { target: inputNode }))
        domNode.dispatchEvent(buildTextInputEvent({ data: '速度', target: inputNode }))
        return expect(editor.getText()).toBe('速度2\n速度4\n\n')
      })
    })
  })

  describe('the m keybinding', function () {
    beforeEach(function () {
      editor.setText('12\n34\n56\n')
      return editor.setCursorBufferPosition([0, 1])
    })

    return it('marks a position', function () {
      keydown('m')
      normalModeInputKeydown('a')
      return expect(vimState.getMark('a')).toEqual([0, 1])
    })
  })

  describe('the ~ keybinding', function () {
    beforeEach(function () {
      editor.setText('aBc\nXyZ')
      editor.setCursorBufferPosition([0, 0])
      return editor.addCursorAtBufferPosition([1, 0])
    })

    it('toggles the case and moves right', function () {
      keydown('~')
      expect(editor.getText()).toBe('ABc\nxyZ')
      expect(editor.getCursorScreenPositions()).toEqual([[0, 1], [1, 1]])

      keydown('~')
      expect(editor.getText()).toBe('Abc\nxYZ')
      expect(editor.getCursorScreenPositions()).toEqual([[0, 2], [1, 2]])

      keydown('~')
      expect(editor.getText()).toBe('AbC\nxYz')
      return expect(editor.getCursorScreenPositions()).toEqual([[0, 2], [1, 2]])
    })

    it('takes a count', function () {
      keydown('4')
      keydown('~')

      expect(editor.getText()).toBe('AbC\nxYz')
      return expect(editor.getCursorScreenPositions()).toEqual([[0, 2], [1, 2]])
    })

    describe('in visual mode', () => it('toggles the case of the selected text', function () {
      editor.setCursorBufferPosition([0, 0])
      keydown('V', { shift: true })
      keydown('~')
      return expect(editor.getText()).toBe('AbC\nXyZ')
    }))

    return describe('with g and motion', function () {
      it('toggles the case of text', function () {
        editor.setCursorBufferPosition([0, 0])
        keydown('g')
        keydown('~')
        keydown('2')
        keydown('l')
        return expect(editor.getText()).toBe('Abc\nXyZ')
      })

      return it('uses default count', function () {
        editor.setCursorBufferPosition([0, 0])
        keydown('g')
        keydown('~')
        keydown('G', { shift: true })
        return expect(editor.getText()).toBe('AbC\nxYz')
      })
    })
  })

  describe('the U keybinding', function () {
    beforeEach(function () {
      editor.setText('aBc\nXyZ')
      return editor.setCursorBufferPosition([0, 0])
    })

    it('makes text uppercase with g and motion', function () {
      keydown('g')
      keydown('U', { shift: true })
      keydown('l')
      expect(editor.getText()).toBe('ABc\nXyZ')

      keydown('g')
      keydown('U', { shift: true })
      keydown('e')
      expect(editor.getText()).toBe('ABC\nXyZ')

      editor.setCursorBufferPosition([1, 0])
      keydown('g')
      keydown('U', { shift: true })
      keydown('$')
      expect(editor.getText()).toBe('ABC\nXYZ')
      return expect(editor.getCursorScreenPosition()).toEqual([1, 2])
    })

    it('uses default count', function () {
      editor.setCursorBufferPosition([0, 0])
      keydown('g')
      keydown('U', { shift: true })
      keydown('G', { shift: true })
      return expect(editor.getText()).toBe('ABC\nXYZ')
    })

    return it('makes the selected text uppercase in visual mode', function () {
      keydown('V', { shift: true })
      keydown('U', { shift: true })
      return expect(editor.getText()).toBe('ABC\nXyZ')
    })
  })

  describe('the u keybinding', function () {
    beforeEach(function () {
      editor.setText('aBc\nXyZ')
      return editor.setCursorBufferPosition([0, 0])
    })

    it('makes text lowercase with g and motion', function () {
      keydown('g')
      keydown('u')
      keydown('$')
      expect(editor.getText()).toBe('abc\nXyZ')
      return expect(editor.getCursorScreenPosition()).toEqual([0, 2])
    })

    it('uses default count', function () {
      editor.setCursorBufferPosition([0, 0])
      keydown('g')
      keydown('u')
      keydown('G', { shift: true })
      return expect(editor.getText()).toBe('abc\nxyz')
    })

    return it('makes the selected text lowercase in visual mode', function () {
      keydown('V', { shift: true })
      keydown('u')
      return expect(editor.getText()).toBe('abc\nXyZ')
    })
  })

  describe('the i keybinding', function () {
    beforeEach(function () {
      editor.setText('123\n4567')
      editor.setCursorBufferPosition([0, 0])
      return editor.addCursorAtBufferPosition([1, 0])
    })

    it('allows undoing an entire batch of typing', function () {
      keydown('i')
      editor.insertText('abcXX')
      editor.backspace()
      editor.backspace()
      keydown('escape')
      expect(editor.getText()).toBe('abc123\nabc4567')

      keydown('i')
      editor.insertText('d')
      editor.insertText('e')
      editor.insertText('f')
      keydown('escape')
      expect(editor.getText()).toBe('abdefc123\nabdefc4567')

      keydown('u')
      expect(editor.getText()).toBe('abc123\nabc4567')

      keydown('u')
      return expect(editor.getText()).toBe('123\n4567')
    })

    it('allows repeating typing', function () {
      keydown('i')
      editor.insertText('abcXX')
      editor.backspace()
      editor.backspace()
      keydown('escape')
      expect(editor.getText()).toBe('abc123\nabc4567')

      keydown('.')
      expect(editor.getText()).toBe('ababcc123\nababcc4567')

      keydown('.')
      return expect(editor.getText()).toBe('abababccc123\nabababccc4567')
    })

    return describe('with nonlinear input', function () {
      beforeEach(function () {
        editor.setText('')
        return editor.setCursorBufferPosition([0, 0])
      })

      it('deals with auto-matched brackets', function () {
        keydown('i')
        // this sequence simulates what the bracket-matcher package does
        // when the user types (a)b<enter>
        editor.insertText('()')
        editor.moveLeft()
        editor.insertText('a')
        editor.moveRight()
        editor.insertText('b\n')
        keydown('escape')
        expect(editor.getCursorScreenPosition()).toEqual([1, 0])

        keydown('.')
        expect(editor.getText()).toBe('(a)b\n(a)b\n')
        return expect(editor.getCursorScreenPosition()).toEqual([2, 0])
      })

      return it('deals with autocomplete', function () {
        keydown('i')
        // this sequence simulates autocompletion of 'add' to 'addFoo'
        editor.insertText('a')
        editor.insertText('d')
        editor.insertText('d')
        editor.setTextInBufferRange([[0, 0], [0, 3]], 'addFoo')
        keydown('escape')
        expect(editor.getCursorScreenPosition()).toEqual([0, 5])
        expect(editor.getText()).toBe('addFoo')

        keydown('.')
        expect(editor.getText()).toBe('addFoaddFooo')
        return expect(editor.getCursorScreenPosition()).toEqual([0, 10])
      })
    })
  })

  describe('the a keybinding', function () {
    beforeEach(function () {
      editor.setText('')
      return editor.setCursorBufferPosition([0, 0])
    })

    it('can be undone in one go', function () {
      keydown('a')
      editor.insertText('abc')
      keydown('escape')
      expect(editor.getText()).toBe('abc')
      keydown('u')
      return expect(editor.getText()).toBe('')
    })

    return it('repeats correctly', function () {
      keydown('a')
      editor.insertText('abc')
      keydown('escape')
      expect(editor.getText()).toBe('abc')
      expect(editor.getCursorScreenPosition()).toEqual([0, 2])
      keydown('.')
      expect(editor.getText()).toBe('abcabc')
      return expect(editor.getCursorScreenPosition()).toEqual([0, 5])
    })
  })

  describe('the ctrl-a/ctrl-x keybindings', function () {
    beforeEach(function () {
      atom.config.set('vim-mode.numberRegex', settings.config.numberRegex.default)
      editor.setText('123\nab45\ncd-67ef\nab-5\na-bcdef')
      editor.setCursorBufferPosition([0, 0])
      editor.addCursorAtBufferPosition([1, 0])
      editor.addCursorAtBufferPosition([2, 0])
      editor.addCursorAtBufferPosition([3, 3])
      return editor.addCursorAtBufferPosition([4, 0])
    })

    describe('increasing numbers', function () {
      it('increases the next number', function () {
        keydown('a', { ctrl: true })
        expect(editor.getCursorBufferPositions()).toEqual([[0, 2], [1, 3], [2, 4], [3, 3], [4, 0]])
        expect(editor.getText()).toBe('124\nab46\ncd-66ef\nab-4\na-bcdef')
        return expect(atom.beep).not.toHaveBeenCalled()
      })

      it('repeats with .', function () {
        keydown('a', { ctrl: true })
        keydown('.')
        expect(editor.getCursorBufferPositions()).toEqual([[0, 2], [1, 3], [2, 4], [3, 3], [4, 0]])
        expect(editor.getText()).toBe('125\nab47\ncd-65ef\nab-3\na-bcdef')
        return expect(atom.beep).not.toHaveBeenCalled()
      })

      it('can have a count', function () {
        keydown('5')
        keydown('a', { ctrl: true })
        expect(editor.getCursorBufferPositions()).toEqual([[0, 2], [1, 3], [2, 4], [3, 2], [4, 0]])
        expect(editor.getText()).toBe('128\nab50\ncd-62ef\nab0\na-bcdef')
        return expect(atom.beep).not.toHaveBeenCalled()
      })

      it('can make a negative number positive, change number of digits', function () {
        keydown('9')
        keydown('9')
        keydown('a', { ctrl: true })
        expect(editor.getCursorBufferPositions()).toEqual([[0, 2], [1, 4], [2, 3], [3, 3], [4, 0]])
        expect(editor.getText()).toBe('222\nab144\ncd32ef\nab94\na-bcdef')
        return expect(atom.beep).not.toHaveBeenCalled()
      })

      it('does nothing when cursor is after the number', function () {
        editor.setCursorBufferPosition([2, 5])
        keydown('a', { ctrl: true })
        expect(editor.getCursorBufferPositions()).toEqual([[2, 5]])
        expect(editor.getText()).toBe('123\nab45\ncd-67ef\nab-5\na-bcdef')
        return expect(atom.beep).toHaveBeenCalled()
      })

      it('does nothing on an empty line', function () {
        editor.setText('\n')
        editor.setCursorBufferPosition([0, 0])
        editor.addCursorAtBufferPosition([1, 0])
        keydown('a', { ctrl: true })
        expect(editor.getCursorBufferPositions()).toEqual([[0, 0], [1, 0]])
        expect(editor.getText()).toBe('\n')
        return expect(atom.beep).toHaveBeenCalled()
      })

      return it('honours the vim-mode:numberRegex setting', function () {
        editor.setText('123\nab45\ncd -67ef\nab-5\na-bcdef')
        editor.setCursorBufferPosition([0, 0])
        editor.addCursorAtBufferPosition([1, 0])
        editor.addCursorAtBufferPosition([2, 0])
        editor.addCursorAtBufferPosition([3, 3])
        editor.addCursorAtBufferPosition([4, 0])
        atom.config.set('vim-mode.numberRegex', '(?:\\B-)?[0-9]+')
        keydown('a', { ctrl: true })
        expect(editor.getCursorBufferPositions()).toEqual([[0, 2], [1, 3], [2, 5], [3, 3], [4, 0]])
        expect(editor.getText()).toBe('124\nab46\ncd -66ef\nab-6\na-bcdef')
        return expect(atom.beep).not.toHaveBeenCalled()
      })
    })

    return describe('decreasing numbers', function () {
      it('decreases the next number', function () {
        keydown('x', { ctrl: true })
        expect(editor.getCursorBufferPositions()).toEqual([[0, 2], [1, 3], [2, 4], [3, 3], [4, 0]])
        expect(editor.getText()).toBe('122\nab44\ncd-68ef\nab-6\na-bcdef')
        return expect(atom.beep).not.toHaveBeenCalled()
      })

      it('repeats with .', function () {
        keydown('x', { ctrl: true })
        keydown('.')
        expect(editor.getCursorBufferPositions()).toEqual([[0, 2], [1, 3], [2, 4], [3, 3], [4, 0]])
        expect(editor.getText()).toBe('121\nab43\ncd-69ef\nab-7\na-bcdef')
        return expect(atom.beep).not.toHaveBeenCalled()
      })

      it('can have a count', function () {
        keydown('5')
        keydown('x', { ctrl: true })
        expect(editor.getCursorBufferPositions()).toEqual([[0, 2], [1, 3], [2, 4], [3, 4], [4, 0]])
        expect(editor.getText()).toBe('118\nab40\ncd-72ef\nab-10\na-bcdef')
        return expect(atom.beep).not.toHaveBeenCalled()
      })

      it('can make a positive number negative, change number of digits', function () {
        keydown('9')
        keydown('9')
        keydown('x', { ctrl: true })
        expect(editor.getCursorBufferPositions()).toEqual([[0, 1], [1, 4], [2, 5], [3, 5], [4, 0]])
        expect(editor.getText()).toBe('24\nab-54\ncd-166ef\nab-104\na-bcdef')
        return expect(atom.beep).not.toHaveBeenCalled()
      })

      it('does nothing when cursor is after the number', function () {
        editor.setCursorBufferPosition([2, 5])
        keydown('x', { ctrl: true })
        expect(editor.getCursorBufferPositions()).toEqual([[2, 5]])
        expect(editor.getText()).toBe('123\nab45\ncd-67ef\nab-5\na-bcdef')
        return expect(atom.beep).toHaveBeenCalled()
      })

      it('does nothing on an empty line', function () {
        editor.setText('\n')
        editor.setCursorBufferPosition([0, 0])
        editor.addCursorAtBufferPosition([1, 0])
        keydown('x', { ctrl: true })
        expect(editor.getCursorBufferPositions()).toEqual([[0, 0], [1, 0]])
        expect(editor.getText()).toBe('\n')
        return expect(atom.beep).toHaveBeenCalled()
      })

      return it('honours the vim-mode:numberRegex setting', function () {
        editor.setText('123\nab45\ncd -67ef\nab-5\na-bcdef')
        editor.setCursorBufferPosition([0, 0])
        editor.addCursorAtBufferPosition([1, 0])
        editor.addCursorAtBufferPosition([2, 0])
        editor.addCursorAtBufferPosition([3, 3])
        editor.addCursorAtBufferPosition([4, 0])
        atom.config.set('vim-mode.numberRegex', '(?:\\B-)?[0-9]+')
        keydown('x', { ctrl: true })
        expect(editor.getCursorBufferPositions()).toEqual([[0, 2], [1, 3], [2, 5], [3, 3], [4, 0]])
        expect(editor.getText()).toBe('122\nab44\ncd -68ef\nab-4\na-bcdef')
        return expect(atom.beep).not.toHaveBeenCalled()
      })
    })
  })

  return describe('the R keybinding', function () {
    beforeEach(function () {
      editor.setText('12345\n67890')
      return editor.setCursorBufferPosition([0, 2])
    })

    it('enters replace mode and replaces characters', function () {
      keydown('R', { shift: true })
      expect(editorElement.classList.contains('insert-mode')).toBe(true)
      expect(editorElement.classList.contains('replace-mode')).toBe(true)

      editor.insertText('ab')
      keydown('escape')

      expect(editor.getText()).toBe('12ab5\n67890')
      expect(editor.getCursorScreenPosition()).toEqual([0, 3])
      expect(editorElement.classList.contains('insert-mode')).toBe(false)
      expect(editorElement.classList.contains('replace-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    it('continues beyond end of line as insert', function () {
      keydown('R', { shift: true })
      expect(editorElement.classList.contains('insert-mode')).toBe(true)
      expect(editorElement.classList.contains('replace-mode')).toBe(true)

      editor.insertText('abcde')
      keydown('escape')

      return expect(editor.getText()).toBe('12abcde\n67890')
    })

    it('treats backspace as undo', function () {
      editor.insertText('foo')
      keydown('R', { shift: true })

      editor.insertText('a')
      editor.insertText('b')
      expect(editor.getText()).toBe('12fooab5\n67890')

      keydown('backspace', { raw: true })
      expect(editor.getText()).toBe('12fooa45\n67890')

      editor.insertText('c')

      expect(editor.getText()).toBe('12fooac5\n67890')

      keydown('backspace', { raw: true })
      keydown('backspace', { raw: true })

      expect(editor.getText()).toBe('12foo345\n67890')
      expect(editor.getSelectedText()).toBe('')

      keydown('backspace', { raw: true })
      expect(editor.getText()).toBe('12foo345\n67890')
      return expect(editor.getSelectedText()).toBe('')
    })

    it('can be repeated', function () {
      keydown('R', { shift: true })
      editor.insertText('ab')
      keydown('escape')
      editor.setCursorBufferPosition([1, 2])
      keydown('.')
      expect(editor.getText()).toBe('12ab5\n67ab0')
      expect(editor.getCursorScreenPosition()).toEqual([1, 3])

      editor.setCursorBufferPosition([0, 4])
      keydown('.')
      expect(editor.getText()).toBe('12abab\n67ab0')
      return expect(editor.getCursorScreenPosition()).toEqual([0, 5])
    })

    it('can be interrupted by arrow keys and behave as insert for repeat', function () {})
    // FIXME don't know how to test this (also, depends on PR #568)

    it('repeats correctly when backspace was used in the text', function () {
      keydown('R', { shift: true })
      editor.insertText('a')
      keydown('backspace', { raw: true })
      editor.insertText('b')
      keydown('escape')
      editor.setCursorBufferPosition([1, 2])
      keydown('.')
      expect(editor.getText()).toBe('12b45\n67b90')
      expect(editor.getCursorScreenPosition()).toEqual([1, 2])

      editor.setCursorBufferPosition([0, 4])
      keydown('.')
      expect(editor.getText()).toBe('12b4b\n67b90')
      return expect(editor.getCursorScreenPosition()).toEqual([0, 4])
    })

    return it("doesn't replace a character if newline is entered", function () {
      keydown('R', { shift: true })
      expect(editorElement.classList.contains('insert-mode')).toBe(true)
      expect(editorElement.classList.contains('replace-mode')).toBe(true)

      editor.insertText('\n')
      keydown('escape')

      return expect(editor.getText()).toBe('12\n345\n67890')
    })
  })
})

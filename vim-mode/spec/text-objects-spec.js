/** @babel */
/* eslint-disable
    no-undef,
    no-useless-escape,
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

describe('TextObjects', function () {
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

  describe('Text Object commands in normal mode not preceded by an operator', function () {
    beforeEach(() => vimState.activateNormalMode())

    return it('selects the appropriate text', function () {
      editor.setText('<html> text </html>')
      editor.setCursorScreenPosition([0, 7])
      // Users could dispatch it via the command palette
      atom.commands.dispatch(editorElement, 'vim-mode:select-inside-tags')
      return expect(editor.getSelectedScreenRange()).toEqual([[0, 6], [0, 12]])
    })
  })

  describe("the 'iw' text object", function () {
    beforeEach(function () {
      editor.setText('12345 abcde (ABCDE)')
      return editor.setCursorScreenPosition([0, 9])
    })

    it('applies operators inside the current word in operator-pending mode', function () {
      keydown('d')
      keydown('i')
      keydown('w')

      expect(editor.getText()).toBe('12345  (ABCDE)')
      expect(editor.getCursorScreenPosition()).toEqual([0, 6])
      expect(vimState.getRegister('"').text).toBe('abcde')
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    it('selects inside the current word in visual mode', function () {
      keydown('v')
      keydown('i')
      keydown('w')

      return expect(editor.getSelectedScreenRange()).toEqual([[0, 6], [0, 11]])
    })

    it('expands an existing selection in visual mode', function () {
      keydown('v')
      keydown('l')
      keydown('l')
      keydown('l')
      keydown('i')
      keydown('w')

      return expect(editor.getSelectedScreenRange()).toEqual([[0, 9], [0, 18]])
    })

    it('works with multiple cursors', function () {
      editor.addCursorAtBufferPosition([0, 1])
      keydown('v')
      keydown('i')
      keydown('w')
      return expect(editor.getSelectedBufferRanges()).toEqual([
        [[0, 6], [0, 11]],
        [[0, 0], [0, 5]]
      ])
    })

    return it("doesn't expand to include delimeters", function () {
      editor.setCursorScreenPosition([0, 13])
      keydown('d')
      keydown('i')
      keydown('w')
      return expect(editor.getText()).toBe('12345 abcde ()')
    })
  })

  describe("the 'iW' text object", function () {
    beforeEach(function () {
      editor.setText("12(45 ab'de ABCDE")
      return editor.setCursorScreenPosition([0, 9])
    })

    it('applies operators inside the current whole word in operator-pending mode', function () {
      keydown('d')
      keydown('i')
      keydown('W', { shift: true })

      expect(editor.getText()).toBe('12(45  ABCDE')
      expect(editor.getCursorScreenPosition()).toEqual([0, 6])
      expect(vimState.getRegister('"').text).toBe("ab'de")
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    it('selects inside the current whole word in visual mode', function () {
      keydown('v')
      keydown('i')
      keydown('W', { shift: true })

      return expect(editor.getSelectedScreenRange()).toEqual([[0, 6], [0, 11]])
    })

    return it('expands an existing selection in visual mode', function () {
      keydown('v')
      keydown('l')
      keydown('l')
      keydown('l')
      keydown('i')
      keydown('W', { shift: true })

      return expect(editor.getSelectedScreenRange()).toEqual([[0, 9], [0, 17]])
    })
  })

  describe("the 'i(' text object", function () {
    beforeEach(function () {
      editor.setText('( something in here and in (here) )')
      return editor.setCursorScreenPosition([0, 9])
    })

    it('applies operators inside the current word in operator-pending mode', function () {
      keydown('d')
      keydown('i')
      keydown('(')
      expect(editor.getText()).toBe('()')
      expect(editor.getCursorScreenPosition()).toEqual([0, 1])
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    it('applies operators inside the current word in operator-pending mode (second test)', function () {
      editor.setCursorScreenPosition([0, 29])
      keydown('d')
      keydown('i')
      keydown('(')
      expect(editor.getText()).toBe('( something in here and in () )')
      expect(editor.getCursorScreenPosition()).toEqual([0, 28])
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    it('works with multiple cursors', function () {
      editor.setText('( a b ) cde ( f g h ) ijk')
      editor.setCursorBufferPosition([0, 2])
      editor.addCursorAtBufferPosition([0, 18])

      keydown('v')
      keydown('i')
      keydown('(')

      return expect(editor.getSelectedBufferRanges()).toEqual([
        [[0, 1], [0, 6]],
        [[0, 13], [0, 20]]
      ])
    })

    return it('expands an existing selection in visual mode', function () {
      editor.setCursorScreenPosition([0, 25])
      keydown('v')
      keydown('l')
      keydown('l')
      keydown('l')
      keydown('l')
      keydown('i')
      keydown('(')

      return expect(editor.getSelectedScreenRange()).toEqual([[0, 25], [0, 32]])
    })
  })

  describe("the 'i{' text object", function () {
    beforeEach(function () {
      editor.setText('{ something in here and in {here} }')
      return editor.setCursorScreenPosition([0, 9])
    })

    it('applies operators inside the current word in operator-pending mode', function () {
      keydown('d')
      keydown('i')
      keydown('{')
      expect(editor.getText()).toBe('{}')
      expect(editor.getCursorScreenPosition()).toEqual([0, 1])
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    it('applies operators inside the current word in operator-pending mode (second test)', function () {
      editor.setCursorScreenPosition([0, 29])
      keydown('d')
      keydown('i')
      keydown('{')
      expect(editor.getText()).toBe('{ something in here and in {} }')
      expect(editor.getCursorScreenPosition()).toEqual([0, 28])
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    return it('expands an existing selection in visual mode', function () {
      editor.setCursorScreenPosition([0, 25])
      keydown('v')
      keydown('l')
      keydown('l')
      keydown('l')
      keydown('l')
      keydown('i')
      keydown('{')

      return expect(editor.getSelectedScreenRange()).toEqual([[0, 25], [0, 32]])
    })
  })

  describe("the 'i<' text object", function () {
    beforeEach(function () {
      editor.setText('< something in here and in <here> >')
      return editor.setCursorScreenPosition([0, 9])
    })

    it('applies operators inside the current word in operator-pending mode', function () {
      keydown('d')
      keydown('i')
      keydown('<')
      expect(editor.getText()).toBe('<>')
      expect(editor.getCursorScreenPosition()).toEqual([0, 1])
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    it('applies operators inside the current word in operator-pending mode (second test)', function () {
      editor.setCursorScreenPosition([0, 29])
      keydown('d')
      keydown('i')
      keydown('<')
      expect(editor.getText()).toBe('< something in here and in <> >')
      expect(editor.getCursorScreenPosition()).toEqual([0, 28])
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    return it('expands an existing selection in visual mode', function () {
      editor.setCursorScreenPosition([0, 25])
      keydown('v')
      keydown('l')
      keydown('l')
      keydown('l')
      keydown('l')
      keydown('i')
      keydown('<')

      return expect(editor.getSelectedScreenRange()).toEqual([[0, 25], [0, 32]])
    })
  })

  describe("the 'it' text object", function () {
    beforeEach(function () {
      editor.setText('<something>here</something><again>')
      return editor.setCursorScreenPosition([0, 5])
    })

    it('applies only if in the value of a tag', function () {
      keydown('d')
      keydown('i')
      keydown('t')
      expect(editor.getText()).toBe('<something>here</something><again>')
      expect(editor.getCursorScreenPosition()).toEqual([0, 5])
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    it('applies operators inside the current word in operator-pending mode', function () {
      editor.setCursorScreenPosition([0, 13])
      keydown('d')
      keydown('i')
      keydown('t')
      expect(editor.getText()).toBe('<something></something><again>')
      expect(editor.getCursorScreenPosition()).toEqual([0, 11])
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    return it('expands an existing selection in visual mode', function () {
      editor.setCursorScreenPosition([0, 7])
      keydown('v')
      keydown('6')
      keydown('l')
      keydown('i')
      keydown('t')

      return expect(editor.getSelectedScreenRange()).toEqual([[0, 7], [0, 15]])
    })
  })

  describe("the 'ip' text object", function () {
    beforeEach(function () {
      editor.setText('\nParagraph-1\nParagraph-1\nParagraph-1\n\n')
      return editor.setCursorBufferPosition([2, 2])
    })

    it('applies operators inside the current paragraph in operator-pending mode', function () {
      keydown('y')
      keydown('i')
      keydown('p')

      expect(editor.getText()).toBe('\nParagraph-1\nParagraph-1\nParagraph-1\n\n')
      expect(editor.getCursorScreenPosition()).toEqual([1, 0])
      expect(vimState.getRegister('"').text).toBe('Paragraph-1\nParagraph-1\nParagraph-1\n')
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    it('selects inside the current paragraph in visual mode', function () {
      keydown('v')
      keydown('i')
      keydown('p')

      return expect(editor.getSelectedScreenRange()).toEqual([[1, 0], [4, 0]])
    })

    it('selects between paragraphs in visual mode if invoked on a empty line', function () {
      editor.setText('text\n\n\n\ntext\n')
      editor.setCursorBufferPosition([1, 0])

      keydown('v')
      keydown('i')
      keydown('p')

      return expect(editor.getSelectedScreenRange()).toEqual([[1, 0], [4, 0]])
    })

    it('selects all the lines', function () {
      editor.setText('text\ntext\ntext\n')
      editor.setCursorBufferPosition([0, 0])

      keydown('v')
      keydown('i')
      keydown('p')

      return expect(editor.getSelectedScreenRange()).toEqual([[0, 0], [3, 0]])
    })

    return it('expands an existing selection in visual mode', function () {
      editor.setText('\nParagraph-1\nParagraph-1\nParagraph-1\n\n\nParagraph-2\nParagraph-2\nParagraph-2\n')
      editor.setCursorBufferPosition([2, 2])

      keydown('v')
      keydown('i')
      keydown('p')

      keydown('j')
      keydown('j')
      keydown('j')
      keydown('i')
      keydown('p')

      return expect(editor.getSelectedScreenRange()).toEqual([[1, 0], [9, 0]])
    })
  })

  describe("the 'ap' text object", function () {
    beforeEach(function () {
      editor.setText('text\n\nParagraph-1\nParagraph-1\nParagraph-1\n\n\nmoretext')
      return editor.setCursorScreenPosition([3, 2])
    })

    it('applies operators around the current paragraph in operator-pending mode', function () {
      keydown('y')
      keydown('a')
      keydown('p')

      expect(editor.getText()).toBe('text\n\nParagraph-1\nParagraph-1\nParagraph-1\n\n\nmoretext')
      expect(editor.getCursorScreenPosition()).toEqual([2, 0])
      expect(vimState.getRegister('"').text).toBe('Paragraph-1\nParagraph-1\nParagraph-1\n\n\n')
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    it('selects around the current paragraph in visual mode', function () {
      keydown('v')
      keydown('a')
      keydown('p')

      return expect(editor.getSelectedScreenRange()).toEqual([[2, 0], [7, 0]])
    })

    it('applies operators around the next paragraph in operator-pending mode when started from a blank/only-whitespace line', function () {
      editor.setText('text\n\n\n\nParagraph-1\nParagraph-1\nParagraph-1\n\n\nmoretext')
      editor.setCursorBufferPosition([1, 0])

      keydown('y')
      keydown('a')
      keydown('p')

      expect(editor.getText()).toBe('text\n\n\n\nParagraph-1\nParagraph-1\nParagraph-1\n\n\nmoretext')
      expect(editor.getCursorScreenPosition()).toEqual([1, 0])
      expect(vimState.getRegister('"').text).toBe('\n\n\nParagraph-1\nParagraph-1\nParagraph-1\n')
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    it('selects around the next paragraph in visual mode when started from a blank/only-whitespace line', function () {
      editor.setText('text\n\n\n\nparagraph-1\nparagraph-1\nparagraph-1\n\n\nmoretext')
      editor.setCursorBufferPosition([1, 0])

      keydown('v')
      keydown('a')
      keydown('p')

      return expect(editor.getSelectedScreenRange()).toEqual([[1, 0], [7, 0]])
    })

    return it('expands an existing selection in visual mode', function () {
      editor.setText('text\n\n\n\nparagraph-1\nparagraph-1\nparagraph-1\n\n\n\nparagraph-2\nparagraph-2\nparagraph-2\n\n\nmoretext')
      editor.setCursorBufferPosition([5, 0])

      keydown('v')
      keydown('a')
      keydown('p')

      keydown('j')
      keydown('j')
      keydown('j')
      keydown('i')
      keydown('p')

      return expect(editor.getSelectedScreenRange()).toEqual([[4, 0], [13, 0]])
    })
  })

  describe("the 'i[' text object", function () {
    beforeEach(function () {
      editor.setText('[ something in here and in [here] ]')
      return editor.setCursorScreenPosition([0, 9])
    })

    it('applies operators inside the current word in operator-pending mode', function () {
      keydown('d')
      keydown('i')
      keydown('[')
      expect(editor.getText()).toBe('[]')
      expect(editor.getCursorScreenPosition()).toEqual([0, 1])
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    it('applies operators inside the current word in operator-pending mode (second test)', function () {
      editor.setCursorScreenPosition([0, 29])
      keydown('d')
      keydown('i')
      keydown('[')
      expect(editor.getText()).toBe('[ something in here and in [] ]')
      expect(editor.getCursorScreenPosition()).toEqual([0, 28])
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    return it('expands an existing selection in visual mode', function () {
      editor.setCursorScreenPosition([0, 25])
      keydown('v')
      keydown('l')
      keydown('l')
      keydown('l')
      keydown('l')
      keydown('i')
      keydown('[')

      return expect(editor.getSelectedScreenRange()).toEqual([[0, 25], [0, 32]])
    })
  })

  describe("the 'i\'' text object", function () {
    beforeEach(function () {
      editor.setText("' something in here and in 'here' ' and over here")
      return editor.setCursorScreenPosition([0, 9])
    })

    it('applies operators inside the current string in operator-pending mode', function () {
      keydown('d')
      keydown('i')
      keydown('\'')
      expect(editor.getText()).toBe("''here' ' and over here")
      expect(editor.getCursorScreenPosition()).toEqual([0, 1])
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    it('applies operators inside the next string in operator-pending mode (if not in a string)', function () {
      editor.setCursorScreenPosition([0, 29])
      keydown('d')
      keydown('i')
      keydown('\'')
      expect(editor.getText()).toBe("' something in here and in 'here'' and over here")
      expect(editor.getCursorScreenPosition()).toEqual([0, 33])
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    it('makes no change if past the last string on a line', function () {
      editor.setCursorScreenPosition([0, 39])
      keydown('d')
      keydown('i')
      keydown('\'')
      expect(editor.getText()).toBe("' something in here and in 'here' ' and over here")
      expect(editor.getCursorScreenPosition()).toEqual([0, 39])
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    return it('expands an existing selection in visual mode', function () {
      editor.setCursorScreenPosition([0, 25])
      keydown('v')
      keydown('l')
      keydown('l')
      keydown('l')
      keydown('l')
      keydown('i')
      keydown('\'')

      return expect(editor.getSelectedScreenRange()).toEqual([[0, 25], [0, 34]])
    })
  })

  describe("the 'i\"' text object", function () {
    beforeEach(function () {
      editor.setText('" something in here and in "here" " and over here')
      return editor.setCursorScreenPosition([0, 9])
    })

    it('applies operators inside the current string in operator-pending mode', function () {
      keydown('d')
      keydown('i')
      keydown('"')
      expect(editor.getText()).toBe('""here" " and over here')
      expect(editor.getCursorScreenPosition()).toEqual([0, 1])
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    it('applies operators inside the next string in operator-pending mode (if not in a string)', function () {
      editor.setCursorScreenPosition([0, 29])
      keydown('d')
      keydown('i')
      keydown('"')
      expect(editor.getText()).toBe('" something in here and in "here"" and over here')
      expect(editor.getCursorScreenPosition()).toEqual([0, 33])
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    it('makes no change if past the last string on a line', function () {
      editor.setCursorScreenPosition([0, 39])
      keydown('d')
      keydown('i')
      keydown('"')
      expect(editor.getText()).toBe('" something in here and in "here" " and over here')
      expect(editor.getCursorScreenPosition()).toEqual([0, 39])
      return expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
    })

    return it('expands an existing selection in visual mode', function () {
      editor.setCursorScreenPosition([0, 25])
      keydown('v')
      keydown('l')
      keydown('l')
      keydown('l')
      keydown('l')
      keydown('i')
      keydown('"')

      return expect(editor.getSelectedScreenRange()).toEqual([[0, 25], [0, 34]])
    })
  })

  describe("the 'aw' text object", function () {
    beforeEach(function () {
      editor.setText('12345 abcde ABCDE')
      return editor.setCursorScreenPosition([0, 9])
    })

    it('applies operators from the start of the current word to the start of the next word in operator-pending mode', function () {
      keydown('d')
      keydown('a')
      keydown('w')

      expect(editor.getText()).toBe('12345 ABCDE')
      expect(editor.getCursorScreenPosition()).toEqual([0, 6])
      expect(vimState.getRegister('"').text).toBe('abcde ')
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    it('selects from the start of the current word to the start of the next word in visual mode', function () {
      keydown('v')
      keydown('a')
      keydown('w')

      return expect(editor.getSelectedScreenRange()).toEqual([[0, 6], [0, 12]])
    })

    it('expands an existing selection in visual mode', function () {
      editor.setCursorScreenPosition([0, 2])
      keydown('v')
      keydown('l')
      keydown('l')
      keydown('l')
      keydown('a')
      keydown('w')

      return expect(editor.getSelectedScreenRange()).toEqual([[0, 2], [0, 12]])
    })

    it("doesn't span newlines", function () {
      editor.setText('12345\nabcde ABCDE')
      editor.setCursorBufferPosition([0, 3])

      keydown('v')
      keydown('a')
      keydown('w')

      return expect(editor.getSelectedBufferRanges()).toEqual([[[0, 0], [0, 5]]])
    })

    return it("doesn't span special characters", function () {
      editor.setText('1(345\nabcde ABCDE')
      editor.setCursorBufferPosition([0, 3])

      keydown('v')
      keydown('a')
      keydown('w')

      return expect(editor.getSelectedBufferRanges()).toEqual([[[0, 2], [0, 5]]])
    })
  })

  describe("the 'aW' text object", function () {
    beforeEach(function () {
      editor.setText("12(45 ab'de ABCDE")
      return editor.setCursorScreenPosition([0, 9])
    })

    it('applies operators from the start of the current whole word to the start of the next whole word in operator-pending mode', function () {
      keydown('d')
      keydown('a')
      keydown('W', { shift: true })

      expect(editor.getText()).toBe('12(45 ABCDE')
      expect(editor.getCursorScreenPosition()).toEqual([0, 6])
      expect(vimState.getRegister('"').text).toBe("ab'de ")
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    it('selects from the start of the current whole word to the start of the next whole word in visual mode', function () {
      keydown('v')
      keydown('a')
      keydown('W', { shift: true })

      return expect(editor.getSelectedScreenRange()).toEqual([[0, 6], [0, 12]])
    })

    it('expands an existing selection in visual mode', function () {
      editor.setCursorScreenPosition([0, 2])
      keydown('v')
      keydown('l')
      keydown('l')
      keydown('l')
      keydown('a')
      keydown('W', { shift: true })

      return expect(editor.getSelectedScreenRange()).toEqual([[0, 2], [0, 12]])
    })

    return it("doesn't span newlines", function () {
      editor.setText("12(45\nab'de ABCDE")
      editor.setCursorBufferPosition([0, 4])

      keydown('v')
      keydown('a')
      keydown('W', { shift: true })

      return expect(editor.getSelectedBufferRanges()).toEqual([[[0, 0], [0, 5]]])
    })
  })

  describe("the 'a(' text object", function () {
    beforeEach(function () {
      editor.setText('( something in here and in (here) )')
      return editor.setCursorScreenPosition([0, 9])
    })

    it('applies operators around the current parentheses in operator-pending mode', function () {
      keydown('d')
      keydown('a')
      keydown('(')
      expect(editor.getText()).toBe('')
      expect(editor.getCursorScreenPosition()).toEqual([0, 0])
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    it('applies operators around the current parentheses in operator-pending mode (second test)', function () {
      editor.setCursorScreenPosition([0, 29])
      keydown('d')
      keydown('a')
      keydown('(')
      expect(editor.getText()).toBe('( something in here and in  )')
      expect(editor.getCursorScreenPosition()).toEqual([0, 27])
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    return it('expands an existing selection in visual mode', function () {
      editor.setCursorScreenPosition([0, 25])
      keydown('v')
      keydown('l')
      keydown('l')
      keydown('l')
      keydown('l')
      keydown('a')
      keydown('(')

      return expect(editor.getSelectedScreenRange()).toEqual([[0, 25], [0, 33]])
    })
  })

  describe("the 'a{' text object", function () {
    beforeEach(function () {
      editor.setText('{ something in here and in {here} }')
      return editor.setCursorScreenPosition([0, 9])
    })

    it('applies operators around the current curly brackets in operator-pending mode', function () {
      keydown('d')
      keydown('a')
      keydown('{')
      expect(editor.getText()).toBe('')
      expect(editor.getCursorScreenPosition()).toEqual([0, 0])
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    it('applies operators around the current curly brackets in operator-pending mode (second test)', function () {
      editor.setCursorScreenPosition([0, 29])
      keydown('d')
      keydown('a')
      keydown('{')
      expect(editor.getText()).toBe('{ something in here and in  }')
      expect(editor.getCursorScreenPosition()).toEqual([0, 27])
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    return it('expands an existing selection in visual mode', function () {
      editor.setCursorScreenPosition([0, 25])
      keydown('v')
      keydown('l')
      keydown('l')
      keydown('l')
      keydown('l')
      keydown('a')
      keydown('{')

      return expect(editor.getSelectedScreenRange()).toEqual([[0, 25], [0, 33]])
    })
  })

  describe("the 'a<' text object", function () {
    beforeEach(function () {
      editor.setText('< something in here and in <here> >')
      return editor.setCursorScreenPosition([0, 9])
    })

    it('applies operators around the current angle brackets in operator-pending mode', function () {
      keydown('d')
      keydown('a')
      keydown('<')
      expect(editor.getText()).toBe('')
      expect(editor.getCursorScreenPosition()).toEqual([0, 0])
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    it('applies operators around the current angle brackets in operator-pending mode (second test)', function () {
      editor.setCursorScreenPosition([0, 29])
      keydown('d')
      keydown('a')
      keydown('<')
      expect(editor.getText()).toBe('< something in here and in  >')
      expect(editor.getCursorScreenPosition()).toEqual([0, 27])
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    return it('expands an existing selection in visual mode', function () {
      editor.setCursorScreenPosition([0, 25])
      keydown('v')
      keydown('l')
      keydown('l')
      keydown('l')
      keydown('l')
      keydown('a')
      keydown('<')

      return expect(editor.getSelectedScreenRange()).toEqual([[0, 25], [0, 33]])
    })
  })

  describe("the 'a[' text object", function () {
    beforeEach(function () {
      editor.setText('[ something in here and in [here] ]')
      return editor.setCursorScreenPosition([0, 9])
    })

    it('applies operators around the current square brackets in operator-pending mode', function () {
      keydown('d')
      keydown('a')
      keydown('[')
      expect(editor.getText()).toBe('')
      expect(editor.getCursorScreenPosition()).toEqual([0, 0])
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    it('applies operators around the current square brackets in operator-pending mode (second test)', function () {
      editor.setCursorScreenPosition([0, 29])
      keydown('d')
      keydown('a')
      keydown('[')
      expect(editor.getText()).toBe('[ something in here and in  ]')
      expect(editor.getCursorScreenPosition()).toEqual([0, 27])
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    return it('expands an existing selection in visual mode', function () {
      editor.setCursorScreenPosition([0, 25])
      keydown('v')
      keydown('l')
      keydown('l')
      keydown('l')
      keydown('l')
      keydown('a')
      keydown('[')

      return expect(editor.getSelectedScreenRange()).toEqual([[0, 25], [0, 33]])
    })
  })

  describe("the 'a\'' text object", function () {
    beforeEach(function () {
      editor.setText("' something in here and in 'here' '")
      return editor.setCursorScreenPosition([0, 9])
    })

    it('applies operators around the current single quotes in operator-pending mode', function () {
      keydown('d')
      keydown('a')
      keydown('\'')
      expect(editor.getText()).toBe("here' '")
      expect(editor.getCursorScreenPosition()).toEqual([0, 0])
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    it('applies operators around the current single quotes in operator-pending mode (second test)', function () {
      editor.setCursorScreenPosition([0, 29])
      keydown('d')
      keydown('a')
      keydown('\'')
      expect(editor.getText()).toBe("' something in here and in 'here")
      expect(editor.getCursorScreenPosition()).toEqual([0, 31])
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    return it('expands an existing selection in visual mode', function () {
      editor.setCursorScreenPosition([0, 25])
      keydown('v')
      keydown('l')
      keydown('l')
      keydown('l')
      keydown('l')
      keydown('a')
      keydown('\'')

      return expect(editor.getSelectedScreenRange()).toEqual([[0, 25], [0, 35]])
    })
  })

  return describe("the 'a\"' text object", function () {
    beforeEach(function () {
      editor.setText('" something in here and in "here" "')
      return editor.setCursorScreenPosition([0, 9])
    })

    it('applies operators around the current double quotes in operator-pending mode', function () {
      keydown('d')
      keydown('a')
      keydown('""')
      expect(editor.getText()).toBe('here" "')
      expect(editor.getCursorScreenPosition()).toEqual([0, 0])
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    it('applies operators around the current double quotes in operator-pending mode (second test)', function () {
      editor.setCursorScreenPosition([0, 29])
      keydown('d')
      keydown('a')
      keydown('"')
      expect(editor.getText()).toBe('" something in here and in "here')
      expect(editor.getCursorScreenPosition()).toEqual([0, 31])
      expect(editorElement.classList.contains('operator-pending-mode')).toBe(false)
      return expect(editorElement.classList.contains('normal-mode')).toBe(true)
    })

    return it('expands an existing selection in visual mode', function () {
      editor.setCursorScreenPosition([0, 25])
      keydown('v')
      keydown('l')
      keydown('l')
      keydown('l')
      keydown('l')
      keydown('a')
      keydown('"')

      return expect(editor.getSelectedScreenRange()).toEqual([[0, 25], [0, 35]])
    })
  })
})

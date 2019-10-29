/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const helpers = require('./spec-helper');

describe("Motions", function() {
  let [editor, editorElement, parentElement, vimState] = Array.from([]);

  beforeEach(function() {
    const vimMode = atom.packages.loadPackage('vim-mode');
    vimMode.activateResources();

    return helpers.getEditorElement(function(element) {
      editorElement = element;
      editor = editorElement.getModel();
      ({
        vimState
      } = editorElement);
      vimState.activateNormalMode();
      return vimState.resetNormalMode();
    });
  });

  const keydown = function(key, options) {
    if (options == null) { options = {}; }
    if (options.element == null) { options.element = editorElement; }
    return helpers.keydown(key, options);
  };

  const normalModeInputKeydown = function(key, opts) {
    if (opts == null) { opts = {}; }
    const theEditor = opts.editor || editor;
    return theEditor.normalModeInputView.editorElement.getModel().setText(key);
  };

  const submitNormalModeInputText = function(text) {
    const inputEditor = editor.normalModeInputView.editorElement;
    inputEditor.getModel().setText(text);
    return atom.commands.dispatch(inputEditor, "core:confirm");
  };

  describe("simple motions", function() {
    beforeEach(function() {
      editor.setText("12345\nabcd\nABCDE");
      return editor.setCursorScreenPosition([1, 1]);
    });

    describe("the h keybinding", function() {
      describe("as a motion", function() {
        it("moves the cursor left, but not to the previous line", function() {
          keydown('h');
          expect(editor.getCursorScreenPosition()).toEqual([1, 0]);

          keydown('h');
          return expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
      });

        return it("moves the cursor to the previous line if wrapLeftRightMotion is true", function() {
          atom.config.set('vim-mode.wrapLeftRightMotion', true);
          keydown('h');
          keydown('h');
          return expect(editor.getCursorScreenPosition()).toEqual([0, 4]);
      });
    });

      return describe("as a selection", () => it("selects the character to the left", function() {
        keydown('y');
        keydown('h');

        expect(vimState.getRegister('"').text).toBe('a');
        return expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
    }));
  });

    describe("the j keybinding", function() {
      it("moves the cursor down, but not to the end of the last line", function() {
        keydown('j');
        expect(editor.getCursorScreenPosition()).toEqual([2, 1]);

        keydown('j');
        return expect(editor.getCursorScreenPosition()).toEqual([2, 1]);
    });

      it("moves the cursor to the end of the line, not past it", function() {
        editor.setCursorScreenPosition([0, 4]);

        keydown('j');
        return expect(editor.getCursorScreenPosition()).toEqual([1, 3]);
    });

      it("remembers the position it column it was in after moving to shorter line", function() {
        editor.setCursorScreenPosition([0, 4]);

        keydown('j');
        expect(editor.getCursorScreenPosition()).toEqual([1, 3]);

        keydown('j');
        return expect(editor.getCursorScreenPosition()).toEqual([2, 4]);
    });

      return describe("when visual mode", function() {
        beforeEach(function() {
          keydown('v');
          return expect(editor.getCursorScreenPosition()).toEqual([1, 2]);});

        it("moves the cursor down", function() {
          keydown('j');
          return expect(editor.getCursorScreenPosition()).toEqual([2, 2]);
      });

        it("doesn't go over after the last line", function() {
          keydown('j');
          return expect(editor.getCursorScreenPosition()).toEqual([2, 2]);
      });

        return it("selects the text while moving", function() {
          keydown('j');
          return expect(editor.getSelectedText()).toBe("bcd\nAB");
        });
      });
    });

    describe("the k keybinding", () => it("moves the cursor up, but not to the beginning of the first line", function() {
      keydown('k');
      expect(editor.getCursorScreenPosition()).toEqual([0, 1]);

      keydown('k');
      return expect(editor.getCursorScreenPosition()).toEqual([0, 1]);
  }));

    return describe("the l keybinding", function() {
      beforeEach(() => editor.setCursorScreenPosition([1, 2]));

      it("moves the cursor right, but not to the next line", function() {
        keydown('l');
        expect(editor.getCursorScreenPosition()).toEqual([1, 3]);

        keydown('l');
        return expect(editor.getCursorScreenPosition()).toEqual([1, 3]);
    });

      it("moves the cursor to the next line if wrapLeftRightMotion is true", function() {
        atom.config.set('vim-mode.wrapLeftRightMotion', true);
        keydown('l');
        keydown('l');
        return expect(editor.getCursorScreenPosition()).toEqual([2, 0]);
    });

      return describe("on a blank line", () => it("doesn't move the cursor", function() {
        editor.setText("\n\n\n");
        editor.setCursorBufferPosition([1, 0]);
        keydown('l');
        return expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
    }));
  });
});

  describe("the w keybinding", function() {
    beforeEach(() => editor.setText("ab cde1+- \n xyz\n\nzip"));

    describe("as a motion", function() {
      beforeEach(() => editor.setCursorScreenPosition([0, 0]));

      it("moves the cursor to the beginning of the next word", function() {
        keydown('w');
        expect(editor.getCursorScreenPosition()).toEqual([0, 3]);

        keydown('w');
        expect(editor.getCursorScreenPosition()).toEqual([0, 7]);

        keydown('w');
        expect(editor.getCursorScreenPosition()).toEqual([1, 1]);

        keydown('w');
        expect(editor.getCursorScreenPosition()).toEqual([2, 0]);

        keydown('w');
        expect(editor.getCursorScreenPosition()).toEqual([3, 0]);

        keydown('w');
        expect(editor.getCursorScreenPosition()).toEqual([3, 2]);

        // When the cursor gets to the EOF, it should stay there.
        keydown('w');
        return expect(editor.getCursorScreenPosition()).toEqual([3, 2]);
    });

      return it("moves the cursor to the end of the word if last word in file", function() {
        editor.setText("abc");
        editor.setCursorScreenPosition([0, 0]);
        keydown('w');
        return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
      });
    });

    return describe("as a selection", function() {
      describe("within a word", function() {
        beforeEach(function() {
          editor.setCursorScreenPosition([0, 0]);
          keydown('y');
          return keydown('w');
        });

        return it("selects to the end of the word", () => expect(vimState.getRegister('"').text).toBe('ab '));
      });

      return describe("between words", function() {
        beforeEach(function() {
          editor.setCursorScreenPosition([0, 2]);
          keydown('y');
          return keydown('w');
        });

        return it("selects the whitespace", () => expect(vimState.getRegister('"').text).toBe(' '));
      });
    });
  });

  describe("the W keybinding", function() {
    beforeEach(() => editor.setText("cde1+- ab \n xyz\n\nzip"));

    describe("as a motion", function() {
      beforeEach(() => editor.setCursorScreenPosition([0, 0]));

      return it("moves the cursor to the beginning of the next word", function() {
        keydown('W', {shift: true});
        expect(editor.getCursorScreenPosition()).toEqual([0, 7]);

        keydown('W', {shift: true});
        expect(editor.getCursorScreenPosition()).toEqual([1, 1]);

        keydown('W', {shift: true});
        expect(editor.getCursorScreenPosition()).toEqual([2, 0]);

        keydown('W', {shift: true});
        return expect(editor.getCursorScreenPosition()).toEqual([3, 0]);
    });
  });

    return describe("as a selection", function() {
      describe("within a word", () => it("selects to the end of the whole word", function() {
        editor.setCursorScreenPosition([0, 0]);
        keydown('y');
        keydown('W', {shift: true});
        return expect(vimState.getRegister('"').text).toBe('cde1+- ');
      }));

      it("continues past blank lines", function() {
        editor.setCursorScreenPosition([2, 0]);

        keydown('d');
        keydown('W', {shift: true});
        expect(editor.getText()).toBe("cde1+- ab \n xyz\nzip");
        return expect(vimState.getRegister('"').text).toBe('\n');
      });

      return it("doesn't go past the end of the file", function() {
        editor.setCursorScreenPosition([3, 0]);

        keydown('d');
        keydown('W', {shift: true});
        expect(editor.getText()).toBe("cde1+- ab \n xyz\n\n");
        return expect(vimState.getRegister('"').text).toBe('zip');
      });
    });
  });

  describe("the e keybinding", function() {
    beforeEach(() => editor.setText("ab cde1+- \n xyz\n\nzip"));

    describe("as a motion", function() {
      beforeEach(() => editor.setCursorScreenPosition([0, 0]));

      return it("moves the cursor to the end of the current word", function() {
        keydown('e');
        expect(editor.getCursorScreenPosition()).toEqual([0, 1]);

        keydown('e');
        expect(editor.getCursorScreenPosition()).toEqual([0, 6]);

        keydown('e');
        expect(editor.getCursorScreenPosition()).toEqual([0, 8]);

        keydown('e');
        expect(editor.getCursorScreenPosition()).toEqual([1, 3]);

        keydown('e');
        return expect(editor.getCursorScreenPosition()).toEqual([3, 2]);
    });
  });

    return describe("as selection", function() {
      describe("within a word", function() {
        beforeEach(function() {
          editor.setCursorScreenPosition([0, 0]);
          keydown('y');
          return keydown('e');
        });

        return it("selects to the end of the current word", () => expect(vimState.getRegister('"').text).toBe('ab'));
      });

      return describe("between words", function() {
        beforeEach(function() {
          editor.setCursorScreenPosition([0, 2]);
          keydown('y');
          return keydown('e');
        });

        return it("selects to the end of the next word", () => expect(vimState.getRegister('"').text).toBe(' cde1'));
      });
    });
  });

  describe("the E keybinding", function() {
    beforeEach(() => editor.setText("ab  cde1+- \n xyz \n\nzip\n"));

    describe("as a motion", function() {
      beforeEach(() => editor.setCursorScreenPosition([0, 0]));

      return it("moves the cursor to the end of the current word", function() {
        keydown('E', {shift: true});
        expect(editor.getCursorScreenPosition()).toEqual([0, 1]);

        keydown('E', {shift: true});
        expect(editor.getCursorScreenPosition()).toEqual([0, 9]);

        keydown('E', {shift: true});
        expect(editor.getCursorScreenPosition()).toEqual([1, 3]);

        keydown('E', {shift: true});
        expect(editor.getCursorScreenPosition()).toEqual([3, 2]);

        keydown('E', {shift: true});
        return expect(editor.getCursorScreenPosition()).toEqual([4, 0]);
    });
  });

    return describe("as selection", function() {
      describe("within a word", function() {
        beforeEach(function() {
          editor.setCursorScreenPosition([0, 0]);
          keydown('y');
          return keydown('E', {shift: true});
        });

        return it("selects to the end of the current word", () => expect(vimState.getRegister('"').text).toBe('ab'));
      });

      describe("between words", function() {
        beforeEach(function() {
          editor.setCursorScreenPosition([0, 2]);
          keydown('y');
          return keydown('E', {shift: true});
        });

        return it("selects to the end of the next word", () => expect(vimState.getRegister('"').text).toBe('  cde1+-'));
      });

      return describe("press more than once", function() {
        beforeEach(function() {
          editor.setCursorScreenPosition([0, 0]);
          keydown('v');
          keydown('E', {shift: true});
          keydown('E', {shift: true});
          return keydown('y');
        });

        return it("selects to the end of the current word", () => expect(vimState.getRegister('"').text).toBe('ab  cde1+-'));
      });
    });
  });

  describe("the ) keybinding", function() {
    beforeEach(function() {
      editor.setText("This is a sentence. This is a second sentence.\nThis is a third sentence.\n\nThis sentence is past the paragraph boundary.");
      return editor.setCursorBufferPosition([0, 0]);});

    describe("as a motion", () => it("moves the cursor to the beginning of the next sentence", function() {
      keydown(')');
      expect(editor.getCursorBufferPosition()).toEqual([0, 20]);

      keydown(')');
      expect(editor.getCursorBufferPosition()).toEqual([1, 0]);

      keydown(')');
      return expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
  }));

    return describe("as a selection", function() {
      beforeEach(function() {
        keydown('y');
        return keydown(')');
      });

      return it('selects to the start of the next sentence', () => expect(vimState.getRegister('"').text).toBe("This is a sentence. "));
    });
  });

  describe("the ( keybinding", function() {
    beforeEach(function() {
      editor.setText("This first sentence is in its own paragraph.\n\nThis is a sentence. This is a second sentence.\nThis is a third sentence");
      return editor.setCursorBufferPosition([3, 0]);});

    describe("as a motion", () => it("moves the cursor to the beginning of the previous sentence", function() {
      keydown('(');
      expect(editor.getCursorBufferPosition()).toEqual([2, 20]);

      keydown('(');
      expect(editor.getCursorBufferPosition()).toEqual([2, 0]);

      keydown('(');
      return expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
  }));

    return describe("as a selection", function() {
      beforeEach(function() {
        keydown('y');
        return keydown('(');
      });

      return it('selects to the end of the previous sentence', () => expect(vimState.getRegister('"').text).toBe("This is a second sentence.\n"));
    });
  });

  describe("the } keybinding", function() {
    beforeEach(function() {
      editor.setText("abcde\n\nfghij\nhijk\n  xyz  \n\nzip\n\n  \nthe end");
      return editor.setCursorScreenPosition([0, 0]);
    });

    describe("as a motion", () => it("moves the cursor to the end of the paragraph", function() {
      keydown('}');
      expect(editor.getCursorScreenPosition()).toEqual([1, 0]);

      keydown('}');
      expect(editor.getCursorScreenPosition()).toEqual([5, 0]);

      keydown('}');
      expect(editor.getCursorScreenPosition()).toEqual([7, 0]);

      keydown('}');
      return expect(editor.getCursorScreenPosition()).toEqual([9, 6]);
  }));

    return describe("as a selection", function() {
      beforeEach(function() {
        keydown('y');
        return keydown('}');
      });

      return it('selects to the end of the current paragraph', () => expect(vimState.getRegister('"').text).toBe("abcde\n"));
    });
  });

  describe("the { keybinding", function() {
    beforeEach(function() {
      editor.setText("abcde\n\nfghij\nhijk\n  xyz  \n\nzip\n\n  \nthe end");
      return editor.setCursorScreenPosition([9, 0]);
    });

    describe("as a motion", () => it("moves the cursor to the beginning of the paragraph", function() {
      keydown('{');
      expect(editor.getCursorScreenPosition()).toEqual([7, 0]);

      keydown('{');
      expect(editor.getCursorScreenPosition()).toEqual([5, 0]);

      keydown('{');
      expect(editor.getCursorScreenPosition()).toEqual([1, 0]);

      keydown('{');
      return expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
  }));

    return describe("as a selection", function() {
      beforeEach(function() {
        editor.setCursorScreenPosition([7, 0]);
        keydown('y');
        return keydown('{');
      });

      return it('selects to the beginning of the current paragraph', () => expect(vimState.getRegister('"').text).toBe("\nzip\n"));
    });
  });

  describe("the b keybinding", function() {
    beforeEach(() => editor.setText(" ab cde1+- \n xyz\n\nzip }\n last"));

    describe("as a motion", function() {
      beforeEach(() => editor.setCursorScreenPosition([4, 1]));

      return it("moves the cursor to the beginning of the previous word", function() {
        keydown('b');
        expect(editor.getCursorScreenPosition()).toEqual([3, 4]);

        keydown('b');
        expect(editor.getCursorScreenPosition()).toEqual([3, 0]);

        keydown('b');
        expect(editor.getCursorScreenPosition()).toEqual([2, 0]);

        keydown('b');
        expect(editor.getCursorScreenPosition()).toEqual([1, 1]);

        keydown('b');
        expect(editor.getCursorScreenPosition()).toEqual([0, 8]);

        keydown('b');
        expect(editor.getCursorScreenPosition()).toEqual([0, 4]);

        keydown('b');
        expect(editor.getCursorScreenPosition()).toEqual([0, 1]);

        // Go to start of the file, after moving past the first word
        keydown('b');
        expect(editor.getCursorScreenPosition()).toEqual([0, 0]);

        // Stay at the start of the file
        keydown('b');
        return expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
    });
  });

    return describe("as a selection", function() {
      describe("within a word", function() {
        beforeEach(function() {
          editor.setCursorScreenPosition([0, 2]);
          keydown('y');
          return keydown('b');
        });

        return it("selects to the beginning of the current word", function() {
          expect(vimState.getRegister('"').text).toBe('a');
          return expect(editor.getCursorScreenPosition()).toEqual([0, 1]);
      });
    });

      return describe("between words", function() {
        beforeEach(function() {
          editor.setCursorScreenPosition([0, 4]);
          keydown('y');
          return keydown('b');
        });

        return it("selects to the beginning of the last word", function() {
          expect(vimState.getRegister('"').text).toBe('ab ');
          return expect(editor.getCursorScreenPosition()).toEqual([0, 1]);
      });
    });
  });
});

  describe("the B keybinding", function() {
    beforeEach(() => editor.setText("cde1+- ab \n\t xyz-123\n\n zip"));

    describe("as a motion", function() {
      beforeEach(() => editor.setCursorScreenPosition([4, 1]));

      return it("moves the cursor to the beginning of the previous word", function() {
        keydown('B', {shift: true});
        expect(editor.getCursorScreenPosition()).toEqual([3, 1]);

        keydown('B', {shift: true});
        expect(editor.getCursorScreenPosition()).toEqual([2, 0]);

        keydown('B', {shift: true});
        expect(editor.getCursorScreenPosition()).toEqual([1, 3]);

        keydown('B', {shift: true});
        expect(editor.getCursorScreenPosition()).toEqual([0, 7]);

        keydown('B', {shift: true});
        return expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
    });
  });

    return describe("as a selection", function() {
      it("selects to the beginning of the whole word", function() {
        editor.setCursorScreenPosition([1, 9]);
        keydown('y');
        keydown('B', {shift: true});
        return expect(vimState.getRegister('"').text).toBe('xyz-12');
      });

      return it("doesn't go past the beginning of the file", function() {
        editor.setCursorScreenPosition([0, 0]);
        vimState.setRegister('"', {text: 'abc'});
        keydown('y');
        keydown('B', {shift: true});
        return expect(vimState.getRegister('"').text).toBe('abc');
      });
    });
  });

  describe("the ^ keybinding", function() {
    beforeEach(() => editor.setText("  abcde"));

    describe("from the beginning of the line", function() {
      beforeEach(() => editor.setCursorScreenPosition([0, 0]));

      describe("as a motion", function() {
        beforeEach(() => keydown('^'));

        return it("moves the cursor to the first character of the line", () => expect(editor.getCursorScreenPosition()).toEqual([0, 2]));
    });

      return describe("as a selection", function() {
        beforeEach(function() {
          keydown('d');
          return keydown('^');
        });

        return it('selects to the first character of the line', function() {
          expect(editor.getText()).toBe('abcde');
          return expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
      });
    });
  });

    describe("from the first character of the line", function() {
      beforeEach(() => editor.setCursorScreenPosition([0, 2]));

      describe("as a motion", function() {
        beforeEach(() => keydown('^'));

        return it("stays put", () => expect(editor.getCursorScreenPosition()).toEqual([0, 2]));
    });

      return describe("as a selection", function() {
        beforeEach(function() {
          keydown('d');
          return keydown('^');
        });

        return it("does nothing", function() {
          expect(editor.getText()).toBe('  abcde');
          return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
      });
    });
  });

    return describe("from the middle of a word", function() {
      beforeEach(() => editor.setCursorScreenPosition([0, 4]));

      describe("as a motion", function() {
        beforeEach(() => keydown('^'));

        return it("moves the cursor to the first character of the line", () => expect(editor.getCursorScreenPosition()).toEqual([0, 2]));
    });

      return describe("as a selection", function() {
        beforeEach(function() {
          keydown('d');
          return keydown('^');
        });

        return it('selects to the first character of the line', function() {
          expect(editor.getText()).toBe('  cde');
          return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
      });
    });
  });
});

  describe("the 0 keybinding", function() {
    beforeEach(function() {
      editor.setText("  abcde");
      return editor.setCursorScreenPosition([0, 4]);
    });

    describe("as a motion", function() {
      beforeEach(() => keydown('0'));

      return it("moves the cursor to the first column", () => expect(editor.getCursorScreenPosition()).toEqual([0, 0]));
  });

    return describe("as a selection", function() {
      beforeEach(function() {
        keydown('d');
        return keydown('0');
      });

      return it('selects to the first column of the line', function() {
        expect(editor.getText()).toBe('cde');
        return expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
    });
  });
});

  describe("the $ keybinding", function() {
    beforeEach(function() {
      editor.setText("  abcde\n\n1234567890");
      return editor.setCursorScreenPosition([0, 4]);
    });

    describe("as a motion from empty line", function() {
      beforeEach(() => editor.setCursorScreenPosition([1, 0]));

      return it("moves the cursor to the end of the line", () => expect(editor.getCursorScreenPosition()).toEqual([1, 0]));
  });

    describe("as a motion", function() {
      beforeEach(() => keydown('$'));

      // FIXME: See atom/vim-mode#2
      it("moves the cursor to the end of the line", () => expect(editor.getCursorScreenPosition()).toEqual([0, 6]));

      return it("should remain in the last column when moving down", function() {
        keydown('j');
        expect(editor.getCursorScreenPosition()).toEqual([1, 0]);

        keydown('j');
        return expect(editor.getCursorScreenPosition()).toEqual([2, 9]);
    });
  });

    return describe("as a selection", function() {
      beforeEach(function() {
        keydown('d');
        return keydown('$');
      });

      return it("selects to the beginning of the lines", function() {
        expect(editor.getText()).toBe("  ab\n\n1234567890");
        return expect(editor.getCursorScreenPosition()).toEqual([0, 3]);
    });
  });
});

  describe("the 0 keybinding", function() {
    beforeEach(function() {
      editor.setText("  a\n");
      return editor.setCursorScreenPosition([0, 2]);
    });

    return describe("as a motion", function() {
      beforeEach(() => keydown('0'));

      return it("moves the cursor to the beginning of the line", () => expect(editor.getCursorScreenPosition()).toEqual([0, 0]));
  });
});

  describe("the - keybinding", function() {
    beforeEach(() => editor.setText("abcdefg\n  abc\n  abc\n"));

    describe("from the middle of a line", function() {
      beforeEach(() => editor.setCursorScreenPosition([1, 3]));

      describe("as a motion", function() {
        beforeEach(() => keydown('-'));

        return it("moves the cursor to the first character of the previous line", () => expect(editor.getCursorScreenPosition()).toEqual([0, 0]));
    });

      return describe("as a selection", function() {
        beforeEach(function() {
          keydown('d');
          return keydown('-');
        });

        return it("deletes the current and previous line", () => expect(editor.getText()).toBe("  abc\n"));
      });
    });
          // commented out because the column is wrong due to a bug in `k`; re-enable when `k` is fixed
          //expect(editor.getCursorScreenPosition()).toEqual [0, 3]

    describe("from the first character of a line indented the same as the previous one", function() {
      beforeEach(() => editor.setCursorScreenPosition([2, 2]));

      describe("as a motion", function() {
        beforeEach(() => keydown('-'));

        return it("moves to the first character of the previous line (directly above)", () => expect(editor.getCursorScreenPosition()).toEqual([1, 2]));
    });

      return describe("as a selection", function() {
        beforeEach(function() {
          keydown('d');
          return keydown('-');
        });

        return it("selects to the first character of the previous line (directly above)", () => expect(editor.getText()).toBe("abcdefg\n"));
      });
    });
          // commented out because the column is wrong due to a bug in `k`; re-enable when `k` is fixed
          //expect(editor.getCursorScreenPosition()).toEqual [0, 2]

    describe("from the beginning of a line preceded by an indented line", function() {
      beforeEach(() => editor.setCursorScreenPosition([2, 0]));

      describe("as a motion", function() {
        beforeEach(() => keydown('-'));

        return it("moves the cursor to the first character of the previous line", () => expect(editor.getCursorScreenPosition()).toEqual([1, 2]));
    });

      return describe("as a selection", function() {
        beforeEach(function() {
          keydown('d');
          return keydown('-');
        });

        return it("selects to the first character of the previous line", () => expect(editor.getText()).toBe("abcdefg\n"));
      });
    });
          // commented out because the column is wrong due to a bug in `k`; re-enable when `k` is fixed
          //expect(editor.getCursorScreenPosition()).toEqual [0, 0]

    return describe("with a count", function() {
      beforeEach(function() {
        editor.setText("1\n2\n3\n4\n5\n6\n");
        return editor.setCursorScreenPosition([4, 0]);
      });

      describe("as a motion", function() {
        beforeEach(function() {
          keydown('3');
          return keydown('-');
        });

        return it("moves the cursor to the first character of that many lines previous", () => expect(editor.getCursorScreenPosition()).toEqual([1, 0]));
    });

      return describe("as a selection", function() {
        beforeEach(function() {
          keydown('d');
          keydown('3');
          return keydown('-');
        });

        return it("deletes the current line plus that many previous lines", function() {
          expect(editor.getText()).toBe("1\n6\n");
          return expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
      });
    });
  });
});

  describe("the + keybinding", function() {
    beforeEach(() => editor.setText("  abc\n  abc\nabcdefg\n"));

    describe("from the middle of a line", function() {
      beforeEach(() => editor.setCursorScreenPosition([1, 3]));

      describe("as a motion", function() {
        beforeEach(() => keydown('+'));

        return it("moves the cursor to the first character of the next line", () => expect(editor.getCursorScreenPosition()).toEqual([2, 0]));
    });

      return describe("as a selection", function() {
        beforeEach(function() {
          keydown('d');
          return keydown('+');
        });

        return it("deletes the current and next line", () => expect(editor.getText()).toBe("  abc\n"));
      });
    });
          // commented out because the column is wrong due to a bug in `j`; re-enable when `j` is fixed
          //expect(editor.getCursorScreenPosition()).toEqual [0, 3]

    describe("from the first character of a line indented the same as the next one", function() {
      beforeEach(() => editor.setCursorScreenPosition([0, 2]));

      describe("as a motion", function() {
        beforeEach(() => keydown('+'));

        return it("moves to the first character of the next line (directly below)", () => expect(editor.getCursorScreenPosition()).toEqual([1, 2]));
    });

      return describe("as a selection", function() {
        beforeEach(function() {
          keydown('d');
          return keydown('+');
        });

        return it("selects to the first character of the next line (directly below)", () => expect(editor.getText()).toBe("abcdefg\n"));
      });
    });
          // commented out because the column is wrong due to a bug in `j`; re-enable when `j` is fixed
          //expect(editor.getCursorScreenPosition()).toEqual [0, 2]

    describe("from the beginning of a line followed by an indented line", function() {
      beforeEach(() => editor.setCursorScreenPosition([0, 0]));

      describe("as a motion", function() {
        beforeEach(() => keydown('+'));

        return it("moves the cursor to the first character of the next line", () => expect(editor.getCursorScreenPosition()).toEqual([1, 2]));
    });

      return describe("as a selection", function() {
        beforeEach(function() {
          keydown('d');
          return keydown('+');
        });

        return it("selects to the first character of the next line", function() {
          expect(editor.getText()).toBe("abcdefg\n");
          return expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
      });
    });
  });

    return describe("with a count", function() {
      beforeEach(function() {
        editor.setText("1\n2\n3\n4\n5\n6\n");
        return editor.setCursorScreenPosition([1, 0]);
      });

      describe("as a motion", function() {
        beforeEach(function() {
          keydown('3');
          return keydown('+');
        });

        return it("moves the cursor to the first character of that many lines following", () => expect(editor.getCursorScreenPosition()).toEqual([4, 0]));
    });

      return describe("as a selection", function() {
        beforeEach(function() {
          keydown('d');
          keydown('3');
          return keydown('+');
        });

        return it("deletes the current line plus that many following lines", function() {
          expect(editor.getText()).toBe("1\n6\n");
          return expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
      });
    });
  });
});

  describe("the _ keybinding", function() {
    beforeEach(() => editor.setText("  abc\n  abc\nabcdefg\n"));

    describe("from the middle of a line", function() {
      beforeEach(() => editor.setCursorScreenPosition([1, 3]));

      describe("as a motion", function() {
        beforeEach(() => keydown('_'));

        return it("moves the cursor to the first character of the current line", () => expect(editor.getCursorScreenPosition()).toEqual([1, 2]));
    });

      return describe("as a selection", function() {
        beforeEach(function() {
          keydown('d');
          return keydown('_');
        });

        return it("deletes the current line", function() {
          expect(editor.getText()).toBe("  abc\nabcdefg\n");
          return expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
      });
    });
  });

    return describe("with a count", function() {
      beforeEach(function() {
        editor.setText("1\n2\n3\n4\n5\n6\n");
        return editor.setCursorScreenPosition([1, 0]);
      });

      describe("as a motion", function() {
        beforeEach(function() {
          keydown('3');
          return keydown('_');
        });

        return it("moves the cursor to the first character of that many lines following", () => expect(editor.getCursorScreenPosition()).toEqual([3, 0]));
    });

      return describe("as a selection", function() {
        beforeEach(function() {
          keydown('d');
          keydown('3');
          return keydown('_');
        });

        return it("deletes the current line plus that many following lines", function() {
          expect(editor.getText()).toBe("1\n5\n6\n");
          return expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
      });
    });
  });
});

  describe("the enter keybinding", function() {
    const keydownCodeForEnter = '\r'; // 'enter' does not work
    const startingText = "  abc\n  abc\nabcdefg\n";

    return describe("from the middle of a line", function() {
      const startingCursorPosition = [1, 3];

      describe("as a motion", () => it("acts the same as the + keybinding", function() {
        // do it with + and save the results
        editor.setText(startingText);
        editor.setCursorScreenPosition(startingCursorPosition);
        keydown('+');
        const referenceCursorPosition = editor.getCursorScreenPosition();
        // do it again with enter and compare the results
        editor.setText(startingText);
        editor.setCursorScreenPosition(startingCursorPosition);
        keydown(keydownCodeForEnter);
        return expect(editor.getCursorScreenPosition()).toEqual(referenceCursorPosition);
      }));

      return describe("as a selection", () => it("acts the same as the + keybinding", function() {
        // do it with + and save the results
        editor.setText(startingText);
        editor.setCursorScreenPosition(startingCursorPosition);
        keydown('d');
        keydown('+');
        const referenceText = editor.getText();
        const referenceCursorPosition = editor.getCursorScreenPosition();
        // do it again with enter and compare the results
        editor.setText(startingText);
        editor.setCursorScreenPosition(startingCursorPosition);
        keydown('d');
        keydown(keydownCodeForEnter);
        expect(editor.getText()).toEqual(referenceText);
        return expect(editor.getCursorScreenPosition()).toEqual(referenceCursorPosition);
      }));
    });
  });

  describe("the gg keybinding", function() {
    beforeEach(function() {
      editor.setText(" 1abc\n 2\n3\n");
      return editor.setCursorScreenPosition([0, 2]);
    });

    describe("as a motion", function() {
      describe("in normal mode", function() {
        beforeEach(function() {
          keydown('g');
          return keydown('g');
        });

        return it("moves the cursor to the beginning of the first line", () => expect(editor.getCursorScreenPosition()).toEqual([0, 0]));
    });

      describe("in linewise visual mode", function() {
        beforeEach(function() {
          editor.setCursorScreenPosition([1, 0]);
          vimState.activateVisualMode('linewise');
          keydown('g');
          return keydown('g');
        });

        it("selects to the first line in the file", () => expect(editor.getSelectedText()).toBe(" 1abc\n 2\n"));

        return it("moves the cursor to a specified line", () => expect(editor.getCursorScreenPosition()).toEqual([0, 0]));
    });

      return describe("in characterwise visual mode", function() {
        beforeEach(function() {
          editor.setCursorScreenPosition([1, 1]);
          vimState.activateVisualMode();
          keydown('g');
          return keydown('g');
        });

        it("selects to the first line in the file", () => expect(editor.getSelectedText()).toBe("1abc\n 2"));

        return it("moves the cursor to a specified line", () => expect(editor.getCursorScreenPosition()).toEqual([0, 1]));
    });
  });

    return describe("as a repeated motion", function() {
      describe("in normal mode", function() {
        beforeEach(function() {
          keydown('2');
          keydown('g');
          return keydown('g');
        });

        return it("moves the cursor to a specified line", () => expect(editor.getCursorScreenPosition()).toEqual([1, 0]));
    });

      describe("in linewise visual motion", function() {
        beforeEach(function() {
          editor.setCursorScreenPosition([2, 0]);
          vimState.activateVisualMode('linewise');
          keydown('2');
          keydown('g');
          return keydown('g');
        });

        it("selects to a specified line", () => expect(editor.getSelectedText()).toBe(" 2\n3\n"));

        return it("moves the cursor to a specified line", () => expect(editor.getCursorScreenPosition()).toEqual([1, 0]));
    });

      return describe("in characterwise visual motion", function() {
        beforeEach(function() {
          editor.setCursorScreenPosition([2, 0]);
          vimState.activateVisualMode();
          keydown('2');
          keydown('g');
          return keydown('g');
        });

        it("selects to a first character of specified line", () => expect(editor.getSelectedText()).toBe("2\n3"));

        return it("moves the cursor to a specified line", () => expect(editor.getCursorScreenPosition()).toEqual([1, 1]));
    });
  });
});

  describe("the g_ keybinding", function() {
    beforeEach(() => editor.setText("1  \n    2  \n 3abc\n "));

    describe("as a motion", function() {
      it("moves the cursor to the last nonblank character", function() {
        editor.setCursorScreenPosition([1, 0]);
        keydown('g');
        keydown('_');
        return expect(editor.getCursorScreenPosition()).toEqual([1, 4]);
    });

      return it("will move the cursor to the beginning of the line if necessary", function() {
        editor.setCursorScreenPosition([0, 2]);
        keydown('g');
        keydown('_');
        return expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
    });
  });

    describe("as a repeated motion", () => it("moves the cursor downward and outward", function() {
      editor.setCursorScreenPosition([0, 0]);
      keydown('2');
      keydown('g');
      keydown('_');
      return expect(editor.getCursorScreenPosition()).toEqual([1, 4]);
  }));

    return describe("as a selection", () => it("selects the current line excluding whitespace", function() {
      editor.setCursorScreenPosition([1, 2]);
      vimState.activateVisualMode();
      keydown('2');
      keydown('g');
      keydown('_');
      return expect(editor.getSelectedText()).toEqual("  2  \n 3abc");
    }));
  });

  describe("the G keybinding", function() {
    beforeEach(function() {
      editor.setText("1\n    2\n 3abc\n ");
      return editor.setCursorScreenPosition([0, 2]);
    });

    describe("as a motion", function() {
      beforeEach(() => keydown('G', {shift: true}));

      return it("moves the cursor to the last line after whitespace", () => expect(editor.getCursorScreenPosition()).toEqual([3, 0]));
  });

    describe("as a repeated motion", function() {
      beforeEach(function() {
        keydown('2');
        return keydown('G', {shift: true});
      });

      return it("moves the cursor to a specified line", () => expect(editor.getCursorScreenPosition()).toEqual([1, 4]));
  });

    return describe("as a selection", function() {
      beforeEach(function() {
        editor.setCursorScreenPosition([1, 0]);
        vimState.activateVisualMode();
        return keydown('G', {shift: true});
      });

      it("selects to the last line in the file", () => expect(editor.getSelectedText()).toBe("    2\n 3abc\n "));

      return it("moves the cursor to the last line after whitespace", () => expect(editor.getCursorScreenPosition()).toEqual([3, 1]));
  });
});

  describe("the / keybinding", function() {
    let pane = null;

    beforeEach(function() {
      pane = {activate: jasmine.createSpy("activate")};
      spyOn(atom.workspace, 'getActivePane').andReturn(pane);

      editor.setText("abc\ndef\nabc\ndef\n");
      editor.setCursorBufferPosition([0, 0]);

      // clear search history
      vimState.globalVimState.searchHistory = [];
      return vimState.globalVimState.currentSearch = {};});

    describe("as a motion", function() {
      it("beeps when repeating nonexistent last search", function() {
        keydown('/');
        submitNormalModeInputText('');
        expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
        return expect(atom.beep).toHaveBeenCalled();
      });

      it("moves the cursor to the specified search pattern", function() {
        keydown('/');

        submitNormalModeInputText('def');

        expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
        expect(pane.activate).toHaveBeenCalled();
        return expect(atom.beep).not.toHaveBeenCalled();
      });

      it("loops back around", function() {
        editor.setCursorBufferPosition([3, 0]);
        keydown('/');
        submitNormalModeInputText('def');

        expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
        return expect(atom.beep).not.toHaveBeenCalled();
      });

      it("uses a valid regex as a regex", function() {
        keydown('/');
        // Cycle through the 'abc' on the first line with a character pattern
        submitNormalModeInputText('[abc]');
        expect(editor.getCursorBufferPosition()).toEqual([0, 1]);
        keydown('n');
        expect(editor.getCursorBufferPosition()).toEqual([0, 2]);
        return expect(atom.beep).not.toHaveBeenCalled();
      });

      it("uses an invalid regex as a literal string", function() {
        // Go straight to the literal [abc
        editor.setText("abc\n[abc]\n");
        keydown('/');
        submitNormalModeInputText('[abc');
        expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
        keydown('n');
        expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
        return expect(atom.beep).not.toHaveBeenCalled();
      });

      it("uses ? as a literal string", function() {
        editor.setText("abc\n[a?c?\n");
        keydown('/');
        submitNormalModeInputText('?');
        expect(editor.getCursorBufferPosition()).toEqual([1, 2]);
        keydown('n');
        expect(editor.getCursorBufferPosition()).toEqual([1, 4]);
        return expect(atom.beep).not.toHaveBeenCalled();
      });

      it('works with selection in visual mode', function() {
        editor.setText('one two three');
        keydown('v');
        keydown('/');
        submitNormalModeInputText('th');
        expect(editor.getCursorBufferPosition()).toEqual([0, 9]);
        keydown('d');
        expect(editor.getText()).toBe('hree');
        return expect(atom.beep).not.toHaveBeenCalled();
      });

      it('extends selection when repeating search in visual mode', function() {
        editor.setText('line1\nline2\nline3');
        keydown('v');
        keydown('/');
        submitNormalModeInputText('line');
        let {start, end} = editor.getSelectedBufferRange();
        expect(start.row).toEqual(0);
        expect(end.row).toEqual(1);
        keydown('n');
        ({start, end} = editor.getSelectedBufferRange());
        expect(start.row).toEqual(0);
        expect(end.row).toEqual(2);
        return expect(atom.beep).not.toHaveBeenCalled();
      });

      describe("case sensitivity", function() {
        beforeEach(function() {
          editor.setText("\nabc\nABC\n");
          editor.setCursorBufferPosition([0, 0]);
          return keydown('/');
        });

        it("works in case sensitive mode", function() {
          submitNormalModeInputText('ABC');
          expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
          keydown('n');
          expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
          return expect(atom.beep).not.toHaveBeenCalled();
        });

        it("works in case insensitive mode", function() {
          submitNormalModeInputText('\\cAbC');
          expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
          keydown('n');
          expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
          return expect(atom.beep).not.toHaveBeenCalled();
        });

        it("works in case insensitive mode wherever \\c is", function() {
          submitNormalModeInputText('AbC\\c');
          expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
          keydown('n');
          expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
          return expect(atom.beep).not.toHaveBeenCalled();
        });

        it("uses case insensitive search if useSmartcaseForSearch is true and searching lowercase", function() {
          atom.config.set('vim-mode.useSmartcaseForSearch', true);
          submitNormalModeInputText('abc');
          expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
          keydown('n');
          expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
          return expect(atom.beep).not.toHaveBeenCalled();
        });

        return it("uses case sensitive search if useSmartcaseForSearch is true and searching uppercase", function() {
          atom.config.set('vim-mode.useSmartcaseForSearch', true);
          submitNormalModeInputText('ABC');
          expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
          keydown('n');
          expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
          return expect(atom.beep).not.toHaveBeenCalled();
        });
      });

      describe("repeating", () => it("does nothing with no search history", function() {
        editor.setCursorBufferPosition([0, 0]);
        keydown('n');
        expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
        expect(atom.beep).toHaveBeenCalled();

        editor.setCursorBufferPosition([1, 1]);
        keydown('n');
        expect(editor.getCursorBufferPosition()).toEqual([1, 1]);
        return expect(atom.beep.callCount).toBe(2);
      }));

      describe("repeating with search history", function() {
        beforeEach(function() {
          keydown('/');
          return submitNormalModeInputText('def');
        });

        it("repeats previous search with /<enter>", function() {
          keydown('/');
          submitNormalModeInputText('');
          expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
          return expect(atom.beep).not.toHaveBeenCalled();
        });

        it("repeats previous search with //", function() {
          keydown('/');
          submitNormalModeInputText('/');
          expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
          return expect(atom.beep).not.toHaveBeenCalled();
        });

        describe("the n keybinding", () => it("repeats the last search", function() {
          keydown('n');
          expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
          return expect(atom.beep).not.toHaveBeenCalled();
        }));

        return describe("the N keybinding", () => it("repeats the last search backwards", function() {
          editor.setCursorBufferPosition([0, 0]);
          keydown('N', {shift: true});
          expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
          keydown('N', {shift: true});
          expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
          return expect(atom.beep).not.toHaveBeenCalled();
        }));
      });

      return describe("composing", function() {
        it("composes with operators", function() {
          keydown('d');
          keydown('/');
          submitNormalModeInputText('def');
          expect(editor.getText()).toEqual("def\nabc\ndef\n");
          return expect(atom.beep).not.toHaveBeenCalled();
        });

        return it("repeats correctly with operators", function() {
          keydown('d');
          keydown('/');
          submitNormalModeInputText('def');

          keydown('.');
          expect(editor.getText()).toEqual("def\n");
          return expect(atom.beep).not.toHaveBeenCalled();
        });
      });
    });

    describe("when reversed as ?", function() {
      it("moves the cursor backwards to the specified search pattern", function() {
        keydown('?');
        submitNormalModeInputText('def');
        expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
        return expect(atom.beep).not.toHaveBeenCalled();
      });

      it("accepts / as a literal search pattern", function() {
        editor.setText("abc\nd/f\nabc\nd/f\n");
        editor.setCursorBufferPosition([0, 0]);
        keydown('?');
        submitNormalModeInputText('/');
        expect(editor.getCursorBufferPosition()).toEqual([3, 1]);
        keydown('?');
        submitNormalModeInputText('/');
        expect(editor.getCursorBufferPosition()).toEqual([1, 1]);
        return expect(atom.beep).not.toHaveBeenCalled();
      });

      return describe("repeating", function() {
        beforeEach(function() {
          keydown('?');
          return submitNormalModeInputText('def');
        });

        it("repeats previous search as reversed with ?<enter>", function() {
          keydown('?');
          submitNormalModeInputText('');
          expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
          return expect(atom.beep).not.toHaveBeenCalled();
        });

        it("repeats previous search as reversed with ??", function() {
          keydown('?');
          submitNormalModeInputText('?');
          expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
          return expect(atom.beep).not.toHaveBeenCalled();
        });

        describe('the n keybinding', () => it("repeats the last search backwards", function() {
          editor.setCursorBufferPosition([0, 0]);
          keydown('n');
          expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
          return expect(atom.beep).not.toHaveBeenCalled();
        }));

        return describe('the N keybinding', () => it("repeats the last search forwards", function() {
          editor.setCursorBufferPosition([0, 0]);
          keydown('N', {shift: true});
          expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
          return expect(atom.beep).not.toHaveBeenCalled();
        }));
      });
    });

    return describe("using search history", function() {
      let inputEditor = null;

      beforeEach(function() {
        keydown('/');
        submitNormalModeInputText('def');
        expect(editor.getCursorBufferPosition()).toEqual([1, 0]);

        keydown('/');
        submitNormalModeInputText('abc');
        expect(editor.getCursorBufferPosition()).toEqual([2, 0]);

        return inputEditor = editor.normalModeInputView.editorElement;
      });

      it("allows searching history in the search field", function() {
        keydown('/');
        atom.commands.dispatch(inputEditor, 'core:move-up');
        expect(inputEditor.getModel().getText()).toEqual('abc');
        atom.commands.dispatch(inputEditor, 'core:move-up');
        expect(inputEditor.getModel().getText()).toEqual('def');
        atom.commands.dispatch(inputEditor, 'core:move-up');
        expect(inputEditor.getModel().getText()).toEqual('def');
        return expect(atom.beep).not.toHaveBeenCalled();
      });

      return it("resets the search field to empty when scrolling back", function() {
        keydown('/');
        atom.commands.dispatch(inputEditor, 'core:move-up');
        expect(inputEditor.getModel().getText()).toEqual('abc');
        atom.commands.dispatch(inputEditor, 'core:move-up');
        expect(inputEditor.getModel().getText()).toEqual('def');
        atom.commands.dispatch(inputEditor, 'core:move-down');
        expect(inputEditor.getModel().getText()).toEqual('abc');
        atom.commands.dispatch(inputEditor, 'core:move-down');
        expect(inputEditor.getModel().getText()).toEqual('');
        return expect(atom.beep).not.toHaveBeenCalled();
      });
    });
  });

  describe("the * keybinding", function() {
    beforeEach(function() {
      editor.setText("abd\n@def\nabd\ndef\n");
      return editor.setCursorBufferPosition([0, 0]);
    });

    return describe("as a motion", function() {
      it("moves cursor to next occurence of word under cursor", function() {
        keydown("*");
        return expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
    });

      it("repeats with the n key", function() {
        keydown("*");
        expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
        keydown("n");
        return expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
    });

      it("doesn't move cursor unless next occurence is the exact word (no partial matches)", function() {
        editor.setText("abc\ndef\nghiabc\njkl\nabcdef");
        editor.setCursorBufferPosition([0, 0]);
        keydown("*");
        return expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
    });

      describe("with words that contain 'non-word' characters", function() {
        it("moves cursor to next occurence of word under cursor", function() {
          editor.setText("abc\n@def\nabc\n@def\n");
          editor.setCursorBufferPosition([1, 0]);
          keydown("*");
          return expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
      });

        it("doesn't move cursor unless next match has exact word ending", function() {
          editor.setText("abc\n@def\nabc\n@def1\n");
          editor.setCursorBufferPosition([1, 1]);
          keydown("*");
          // this is because of the default isKeyword value of vim-mode that includes @
          return expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
      });

        // FIXME: This behavior is different from the one found in
        // vim. This is because the word boundary match in Javascript
        // ignores starting 'non-word' characters.
        // e.g.
        // in Vim:        /\<def\>/.test("@def") => false
        // in Javascript: /\bdef\b/.test("@def") => true
        return it("moves cursor to the start of valid word char", function() {
          editor.setText("abc\ndef\nabc\n@def\n");
          editor.setCursorBufferPosition([1, 0]);
          keydown("*");
          return expect(editor.getCursorBufferPosition()).toEqual([3, 1]);
      });
    });

      describe("when cursor is on non-word char column", () => it("matches only the non-word char", function() {
        editor.setText("abc\n@def\nabc\n@def\n");
        editor.setCursorBufferPosition([1, 0]);
        keydown("*");
        return expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
    }));

      describe("when cursor is not on a word", () => it("does a match with the next word", function() {
        editor.setText("abc\na  @def\n abc\n @def");
        editor.setCursorBufferPosition([1, 1]);
        keydown("*");
        return expect(editor.getCursorBufferPosition()).toEqual([3, 1]);
    }));

      return describe("when cursor is at EOF", () => it("doesn't try to do any match", function() {
        editor.setText("abc\n@def\nabc\n ");
        editor.setCursorBufferPosition([3, 0]);
        keydown("*");
        return expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
    }));
  });
});

  describe("the hash keybinding", () => describe("as a motion", function() {
    it("moves cursor to previous occurence of word under cursor", function() {
      editor.setText("abc\n@def\nabc\ndef\n");
      editor.setCursorBufferPosition([2, 1]);
      keydown("#");
      return expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
  });

    it("repeats with n", function() {
      editor.setText("abc\n@def\nabc\ndef\nabc\n");
      editor.setCursorBufferPosition([2, 1]);
      keydown("#");
      expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
      keydown("n");
      expect(editor.getCursorBufferPosition()).toEqual([4, 0]);
      keydown("n");
      return expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
  });

    it("doesn't move cursor unless next occurence is the exact word (no partial matches)", function() {
      editor.setText("abc\ndef\nghiabc\njkl\nabcdef");
      editor.setCursorBufferPosition([0, 0]);
      keydown("#");
      return expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
  });

    describe("with words that containt 'non-word' characters", function() {
      it("moves cursor to next occurence of word under cursor", function() {
        editor.setText("abc\n@def\nabc\n@def\n");
        editor.setCursorBufferPosition([3, 0]);
        keydown("#");
        return expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
    });

      return it("moves cursor to the start of valid word char", function() {
        editor.setText("abc\n@def\nabc\ndef\n");
        editor.setCursorBufferPosition([3, 0]);
        keydown("#");
        return expect(editor.getCursorBufferPosition()).toEqual([1, 1]);
    });
  });

    return describe("when cursor is on non-word char column", () => it("matches only the non-word char", function() {
      editor.setText("abc\n@def\nabc\n@def\n");
      editor.setCursorBufferPosition([1, 0]);
      keydown("*");
      return expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
  }));
}));

  describe("the H keybinding", function() {
    beforeEach(function() {
      editor.setText("1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n");
      editor.setCursorScreenPosition([8, 0]);
      return spyOn(editor.getLastCursor(), 'setScreenPosition');
    });

    it("moves the cursor to the first row if visible", function() {
      spyOn(editorElement, 'getFirstVisibleScreenRow').andReturn(0);
      keydown('H', {shift: true});
      return expect(editor.getLastCursor().setScreenPosition).toHaveBeenCalledWith([0, 0]);
    });

    it("moves the cursor to the first visible row plus offset", function() {
      spyOn(editorElement, 'getFirstVisibleScreenRow').andReturn(2);
      keydown('H', {shift: true});
      return expect(editor.getLastCursor().setScreenPosition).toHaveBeenCalledWith([4, 0]);
    });

    return it("respects counts", function() {
      spyOn(editorElement, 'getFirstVisibleScreenRow').andReturn(0);
      keydown('3');
      keydown('H', {shift: true});
      return expect(editor.getLastCursor().setScreenPosition).toHaveBeenCalledWith([2, 0]);
    });
  });

  describe("the L keybinding", function() {
    beforeEach(function() {
      editor.setText("1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n");
      editor.setCursorScreenPosition([8, 0]);
      return spyOn(editor.getLastCursor(), 'setScreenPosition');
    });

    it("moves the cursor to the first row if visible", function() {
      spyOn(editorElement, 'getLastVisibleScreenRow').andReturn(10);
      keydown('L', {shift: true});
      return expect(editor.getLastCursor().setScreenPosition).toHaveBeenCalledWith([10, 0]);
    });

    it("moves the cursor to the first visible row plus offset", function() {
      spyOn(editorElement, 'getLastVisibleScreenRow').andReturn(6);
      keydown('L', {shift: true});
      return expect(editor.getLastCursor().setScreenPosition).toHaveBeenCalledWith([4, 0]);
    });

    return it("respects counts", function() {
      spyOn(editorElement, 'getLastVisibleScreenRow').andReturn(10);
      keydown('3');
      keydown('L', {shift: true});
      return expect(editor.getLastCursor().setScreenPosition).toHaveBeenCalledWith([8, 0]);
    });
  });

  describe("the M keybinding", function() {
    beforeEach(function() {
      editor.setText("1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n");
      editor.setCursorScreenPosition([8, 0]);
      spyOn(editor.getLastCursor(), 'setScreenPosition');
      spyOn(editorElement, 'getLastVisibleScreenRow').andReturn(10);
      return spyOn(editorElement, 'getFirstVisibleScreenRow').andReturn(0);
    });

    return it("moves the cursor to the first row if visible", function() {
      keydown('M', {shift: true});
      return expect(editor.getLastCursor().setScreenPosition).toHaveBeenCalledWith([5, 0]);
    });
  });

  describe('the mark keybindings', function() {
    beforeEach(function() {
      editor.setText('  12\n    34\n56\n');
      return editor.setCursorBufferPosition([0, 1]);
    });

    it('moves to the beginning of the line of a mark', function() {
      editor.setCursorBufferPosition([1, 1]);
      keydown('m');
      normalModeInputKeydown('a');
      editor.setCursorBufferPosition([0, 0]);
      keydown('\'');
      normalModeInputKeydown('a');
      return expect(editor.getCursorBufferPosition()).toEqual([1, 4]);
  });

    it('moves literally to a mark', function() {
      editor.setCursorBufferPosition([1, 1]);
      keydown('m');
      normalModeInputKeydown('a');
      editor.setCursorBufferPosition([0, 0]);
      keydown('`');
      normalModeInputKeydown('a');
      return expect(editor.getCursorBufferPosition()).toEqual([1, 1]);
  });

    it('deletes to a mark by line', function() {
      editor.setCursorBufferPosition([1, 5]);
      keydown('m');
      normalModeInputKeydown('a');
      editor.setCursorBufferPosition([0, 0]);
      keydown('d');
      keydown('\'');
      normalModeInputKeydown('a');
      return expect(editor.getText()).toEqual('56\n');
    });

    it('deletes before to a mark literally', function() {
      editor.setCursorBufferPosition([1, 5]);
      keydown('m');
      normalModeInputKeydown('a');
      editor.setCursorBufferPosition([0, 1]);
      keydown('d');
      keydown('`');
      normalModeInputKeydown('a');
      return expect(editor.getText()).toEqual(' 4\n56\n');
    });

    it('deletes after to a mark literally', function() {
      editor.setCursorBufferPosition([1, 5]);
      keydown('m');
      normalModeInputKeydown('a');
      editor.setCursorBufferPosition([2, 1]);
      keydown('d');
      keydown('`');
      normalModeInputKeydown('a');
      return expect(editor.getText()).toEqual('  12\n    36\n');
    });

    return it('moves back to previous', function() {
      editor.setCursorBufferPosition([1, 5]);
      keydown('`');
      normalModeInputKeydown('`');
      editor.setCursorBufferPosition([2, 1]);
      keydown('`');
      normalModeInputKeydown('`');
      return expect(editor.getCursorBufferPosition()).toEqual([1, 5]);
  });
});

  describe('the f/F keybindings', function() {
    beforeEach(function() {
      editor.setText("abcabcabcabc\n");
      return editor.setCursorScreenPosition([0, 0]);
    });

    it('moves to the first specified character it finds', function() {
      keydown('f');
      normalModeInputKeydown('c');
      return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
  });

    it('moves backwards to the first specified character it finds', function() {
      editor.setCursorScreenPosition([0, 2]);
      keydown('F', {shift: true});
      normalModeInputKeydown('a');
      return expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
  });

    it('respects count forward', function() {
      keydown('2');
      keydown('f');
      normalModeInputKeydown('a');
      return expect(editor.getCursorScreenPosition()).toEqual([0, 6]);
  });

    it('respects count backward', function() {
      editor.setCursorScreenPosition([0, 6]);
      keydown('2');
      keydown('F', {shift: true});
      normalModeInputKeydown('a');
      return expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
  });

    it("doesn't move if the character specified isn't found", function() {
      keydown('f');
      normalModeInputKeydown('d');
      expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
      return expect(atom.beep).not.toHaveBeenCalled();
    });

    it("doesn't move if there aren't the specified count of the specified character", function() {
      keydown('1');
      keydown('0');
      keydown('f');
      normalModeInputKeydown('a');
      expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
      // a bug was making this behaviour depend on the count
      keydown('1');
      keydown('1');
      keydown('f');
      normalModeInputKeydown('a');
      expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
      // and backwards now
      editor.setCursorScreenPosition([0, 6]);
      keydown('1');
      keydown('0');
      keydown('F', {shift: true});
      normalModeInputKeydown('a');
      expect(editor.getCursorScreenPosition()).toEqual([0, 6]);
      keydown('1');
      keydown('1');
      keydown('F', {shift: true});
      normalModeInputKeydown('a');
      return expect(editor.getCursorScreenPosition()).toEqual([0, 6]);
  });

    it("composes with d", function() {
      editor.setCursorScreenPosition([0, 3]);
      keydown('d');
      keydown('2');
      keydown('f');
      normalModeInputKeydown('a');
      return expect(editor.getText()).toEqual('abcbc\n');
    });

    it("cancels c when no match found", function() {
      keydown('c');
      keydown('f');
      normalModeInputKeydown('d');
      expect(editor.getText()).toBe("abcabcabcabc\n");
      expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
      return expect(vimState.mode).toBe("normal");
    });

    return describe('with accented characters', function() {
      const buildIMECompositionEvent = function(event, param) {
        if (param == null) { param = {}; }
        const {data, target} = param;
        event = new Event(event);
        event.data = data;
        Object.defineProperty(event, 'target', {get() { return target; }});
        return event;
      };

      const buildTextInputEvent = function({data, target}) {
        const event = new Event('textInput');
        event.data = data;
        Object.defineProperty(event, 'target', {get() { return target; }});
        return event;
      };

      beforeEach(function() {
        editor.setText("abcébcabcébc\n");
        return editor.setCursorScreenPosition([0, 0]);
      });

      return it('works with IME composition', function() {
        keydown('f');
        const normalModeEditor = editor.normalModeInputView.editorElement;
        jasmine.attachToDOM(normalModeEditor);
        const {
          domNode
        } = normalModeEditor.component;
        const inputNode = domNode.querySelector('.hidden-input');
        domNode.dispatchEvent(buildIMECompositionEvent('compositionstart', {target: inputNode}));
        domNode.dispatchEvent(buildIMECompositionEvent('compositionupdate', {data: "´", target: inputNode}));
        expect(normalModeEditor.getModel().getText()).toEqual('´');
        domNode.dispatchEvent(buildIMECompositionEvent('compositionend', {data: "é", target: inputNode}));
        domNode.dispatchEvent(buildTextInputEvent({data: 'é', target: inputNode}));
        return expect(editor.getCursorScreenPosition()).toEqual([0, 3]);
    });
  });
});

  describe('the t/T keybindings', function() {
    beforeEach(function() {
      editor.setText("abcabcabcabc\n");
      return editor.setCursorScreenPosition([0, 0]);
    });

    it('moves to the character previous to the first specified character it finds', function() {
      keydown('t');
      normalModeInputKeydown('a');
      expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
      // or stays put when it's already there
      keydown('t');
      normalModeInputKeydown('a');
      return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
  });

    it('moves backwards to the character after the first specified character it finds', function() {
      editor.setCursorScreenPosition([0, 2]);
      keydown('T', {shift: true});
      normalModeInputKeydown('a');
      return expect(editor.getCursorScreenPosition()).toEqual([0, 1]);
  });

    it('respects count forward', function() {
      keydown('2');
      keydown('t');
      normalModeInputKeydown('a');
      return expect(editor.getCursorScreenPosition()).toEqual([0, 5]);
  });

    it('respects count backward', function() {
      editor.setCursorScreenPosition([0, 6]);
      keydown('2');
      keydown('T', {shift: true});
      normalModeInputKeydown('a');
      return expect(editor.getCursorScreenPosition()).toEqual([0, 1]);
  });

    it("doesn't move if the character specified isn't found", function() {
      keydown('t');
      normalModeInputKeydown('d');
      expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
      return expect(atom.beep).not.toHaveBeenCalled();
    });

    it("doesn't move if there aren't the specified count of the specified character", function() {
      keydown('1');
      keydown('0');
      keydown('t');
      normalModeInputKeydown('a');
      expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
      // a bug was making this behaviour depend on the count
      keydown('1');
      keydown('1');
      keydown('t');
      normalModeInputKeydown('a');
      expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
      // and backwards now
      editor.setCursorScreenPosition([0, 6]);
      keydown('1');
      keydown('0');
      keydown('T', {shift: true});
      normalModeInputKeydown('a');
      expect(editor.getCursorScreenPosition()).toEqual([0, 6]);
      keydown('1');
      keydown('1');
      keydown('T', {shift: true});
      normalModeInputKeydown('a');
      return expect(editor.getCursorScreenPosition()).toEqual([0, 6]);
  });

    it("composes with d", function() {
      editor.setCursorScreenPosition([0, 3]);
      keydown('d');
      keydown('2');
      keydown('t');
      normalModeInputKeydown('b');
      return expect(editor.getText()).toBe('abcbcabc\n');
    });

    return it("selects character under cursor even when no movement happens", function() {
      editor.setCursorBufferPosition([0, 0]);
      keydown('d');
      keydown('t');
      normalModeInputKeydown('b');
      return expect(editor.getText()).toBe('bcabcabcabc\n');
    });
  });

  describe('the v keybinding', function() {
    beforeEach(function() {
      editor.setText("01\n002\n0003\n00004\n000005\n");
      return editor.setCursorScreenPosition([1, 1]);
    });

    it("selects down a line", function() {
      keydown('v');
      keydown('j');
      keydown('j');
      expect(editor.getSelectedText()).toBe("02\n0003\n00");
      return expect(editor.getSelectedBufferRange().isSingleLine()).toBeFalsy();
    });

    return it("selects right", function() {
      keydown('v');
      keydown('l');
      expect(editor.getSelectedText()).toBe("02");
      return expect(editor.getSelectedBufferRange().isSingleLine()).toBeTruthy();
    });
  });

  describe('the V keybinding', function() {
    beforeEach(function() {
      editor.setText("01\n002\n0003\n00004\n000005\n");
      return editor.setCursorScreenPosition([1, 1]);
    });

    it("selects down a line", function() {
      keydown('V', {shift: true});
      expect(editor.getSelectedBufferRange().isSingleLine()).toBeFalsy();
      keydown('j');
      keydown('j');
      expect(editor.getSelectedText()).toBe("002\n0003\n00004\n");
      return expect(editor.getSelectedBufferRange().isSingleLine()).toBeFalsy();
    });

    return it("selects up a line", function() {
      keydown('V', {shift: true});
      keydown('k');
      return expect(editor.getSelectedText()).toBe("01\n002\n");
    });
  });

  describe('the ; and , keybindings', function() {
    beforeEach(function() {
      editor.setText("abcabcabcabc\n");
      return editor.setCursorScreenPosition([0, 0]);
    });

    it("repeat f in same direction", function() {
      keydown('f');
      normalModeInputKeydown('c');
      expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
      keydown(';');
      expect(editor.getCursorScreenPosition()).toEqual([0, 5]);
      keydown(';');
      return expect(editor.getCursorScreenPosition()).toEqual([0, 8]);
  });

    it("repeat F in same direction", function() {
      editor.setCursorScreenPosition([0, 10]);
      keydown('F', {shift: true});
      normalModeInputKeydown('c');
      expect(editor.getCursorScreenPosition()).toEqual([0, 8]);
      keydown(';');
      expect(editor.getCursorScreenPosition()).toEqual([0, 5]);
      keydown(';');
      return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
  });

    it("repeat f in opposite direction", function() {
      editor.setCursorScreenPosition([0, 6]);
      keydown('f');
      normalModeInputKeydown('c');
      expect(editor.getCursorScreenPosition()).toEqual([0, 8]);
      keydown(',');
      expect(editor.getCursorScreenPosition()).toEqual([0, 5]);
      keydown(',');
      return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
  });

    it("repeat F in opposite direction", function() {
      editor.setCursorScreenPosition([0, 4]);
      keydown('F', {shift: true});
      normalModeInputKeydown('c');
      expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
      keydown(',');
      expect(editor.getCursorScreenPosition()).toEqual([0, 5]);
      keydown(',');
      return expect(editor.getCursorScreenPosition()).toEqual([0, 8]);
  });

    it("alternate repeat f in same direction and reverse", function() {
      keydown('f');
      normalModeInputKeydown('c');
      expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
      keydown(';');
      expect(editor.getCursorScreenPosition()).toEqual([0, 5]);
      keydown(',');
      return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
  });

    it("alternate repeat F in same direction and reverse", function() {
      editor.setCursorScreenPosition([0, 10]);
      keydown('F', {shift: true});
      normalModeInputKeydown('c');
      expect(editor.getCursorScreenPosition()).toEqual([0, 8]);
      keydown(';');
      expect(editor.getCursorScreenPosition()).toEqual([0, 5]);
      keydown(',');
      return expect(editor.getCursorScreenPosition()).toEqual([0, 8]);
  });

    it("repeat t in same direction", function() {
      keydown('t');
      normalModeInputKeydown('c');
      expect(editor.getCursorScreenPosition()).toEqual([0, 1]);
      keydown(';');
      return expect(editor.getCursorScreenPosition()).toEqual([0, 4]);
  });

    it("repeat T in same direction", function() {
      editor.setCursorScreenPosition([0, 10]);
      keydown('T', {shift: true});
      normalModeInputKeydown('c');
      expect(editor.getCursorScreenPosition()).toEqual([0, 9]);
      keydown(';');
      return expect(editor.getCursorScreenPosition()).toEqual([0, 6]);
  });

    it("repeat t in opposite direction first, and then reverse", function() {
      editor.setCursorScreenPosition([0, 3]);
      keydown('t');
      normalModeInputKeydown('c');
      expect(editor.getCursorScreenPosition()).toEqual([0, 4]);
      keydown(',');
      expect(editor.getCursorScreenPosition()).toEqual([0, 3]);
      keydown(';');
      return expect(editor.getCursorScreenPosition()).toEqual([0, 4]);
  });

    it("repeat T in opposite direction first, and then reverse", function() {
      editor.setCursorScreenPosition([0, 4]);
      keydown('T', {shift: true});
      normalModeInputKeydown('c');
      expect(editor.getCursorScreenPosition()).toEqual([0, 3]);
      keydown(',');
      expect(editor.getCursorScreenPosition()).toEqual([0, 4]);
      keydown(';');
      return expect(editor.getCursorScreenPosition()).toEqual([0, 3]);
  });

    it("repeat with count in same direction", function() {
      editor.setCursorScreenPosition([0, 0]);
      keydown('f');
      normalModeInputKeydown('c');
      expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
      keydown('2');
      keydown(';');
      return expect(editor.getCursorScreenPosition()).toEqual([0, 8]);
  });

    it("repeat with count in reverse direction", function() {
      editor.setCursorScreenPosition([0, 6]);
      keydown('f');
      normalModeInputKeydown('c');
      expect(editor.getCursorScreenPosition()).toEqual([0, 8]);
      keydown('2');
      keydown(',');
      return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
  });

    return it("shares the most recent find/till command with other editors", () => helpers.getEditorElement(function(otherEditorElement) {
      const otherEditor = otherEditorElement.getModel();

      editor.setText("a baz bar\n");
      editor.setCursorScreenPosition([0, 0]);

      otherEditor.setText("foo bar baz");
      otherEditor.setCursorScreenPosition([0, 0]);

      // by default keyDown and such go in the usual editor
      keydown('f');
      normalModeInputKeydown('b');
      expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
      expect(otherEditor.getCursorScreenPosition()).toEqual([0, 0]);

      // replay same find in the other editor
      keydown(';', {element: otherEditorElement});
      expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
      expect(otherEditor.getCursorScreenPosition()).toEqual([0, 4]);

      // do a till in the other editor
      keydown('t', {element: otherEditorElement});
      normalModeInputKeydown('r', {editor: otherEditor});
      expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
      expect(otherEditor.getCursorScreenPosition()).toEqual([0, 5]);

      // and replay in the normal editor
      keydown(';');
      expect(editor.getCursorScreenPosition()).toEqual([0, 7]);
      expect(otherEditor.getCursorScreenPosition()).toEqual([0, 5]);
      return expect(atom.beep).not.toHaveBeenCalled();
    }));
  });

  describe('the % motion', function() {
    beforeEach(function() {
      editor.setText("( ( ) )--{ text in here; and a function call(with parameters) }\n");
      return editor.setCursorScreenPosition([0, 0]);
    });

    it('matches the correct parenthesis', function() {
      keydown('%');
      return expect(editor.getCursorScreenPosition()).toEqual([0, 6]);
  });

    it('matches the correct brace', function() {
      editor.setCursorScreenPosition([0, 9]);
      keydown('%');
      return expect(editor.getCursorScreenPosition()).toEqual([0, 62]);
  });

    it('composes correctly with d', function() {
      editor.setCursorScreenPosition([0, 9]);
      keydown('d');
      keydown('%');
      return expect(editor.getText()).toEqual("( ( ) )--\n");
    });

    it('moves correctly when composed with v going forward', function() {
      keydown('v');
      keydown('h');
      keydown('%');
      return expect(editor.getCursorScreenPosition()).toEqual([0, 7]);
  });

    it('moves correctly when composed with v going backward', function() {
      editor.setCursorScreenPosition([0, 5]);
      keydown('v');
      keydown('%');
      return expect(editor.getCursorScreenPosition()).toEqual([0, 0]);
  });

    it('it moves appropriately to find the nearest matching action', function() {
      editor.setCursorScreenPosition([0, 3]);
      keydown('%');
      expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
      return expect(editor.getText()).toEqual("( ( ) )--{ text in here; and a function call(with parameters) }\n");
    });

    it('it moves appropriately to find the nearest matching action', function() {
      editor.setCursorScreenPosition([0, 26]);
      keydown('%');
      expect(editor.getCursorScreenPosition()).toEqual([0, 60]);
      return expect(editor.getText()).toEqual("( ( ) )--{ text in here; and a function call(with parameters) }\n");
    });

    it("finds matches across multiple lines", function() {
      editor.setText("...(\n...)");
      editor.setCursorScreenPosition([0, 0]);
      keydown("%");
      return expect(editor.getCursorScreenPosition()).toEqual([1, 3]);
    });

    return it("does not affect search history", function() {
      keydown('/');
      submitNormalModeInputText('func');
      expect(editor.getCursorBufferPosition()).toEqual([0, 31]);
      keydown('%');
      expect(editor.getCursorBufferPosition()).toEqual([0, 60]);
      keydown('n');
      return expect(editor.getCursorBufferPosition()).toEqual([0, 31]);
  });
});

  return describe("scrolling screen and keeping cursor in the same screen position", function() {
    beforeEach(function() {
      jasmine.attachToDOM(editorElement);

      editor.setText(__range__(0, 100, false).join("\n"));

      editorElement.setHeight(20 * 10);
      editorElement.style.lineHeight = "10px";
      atom.views.performDocumentPoll();

      editorElement.setScrollTop(40 * 10);
      return editor.setCursorBufferPosition([42, 0]);
    });

    describe("the ctrl-u keybinding", function() {
      it("moves the screen up by half screen size and keeps cursor onscreen", function() {
        keydown('u', {ctrl: true});
        expect(editorElement.getScrollTop()).toEqual(300);
        return expect(editor.getCursorBufferPosition()).toEqual([32, 0]);
    });

      it("selects on visual mode", function() {
        editor.setCursorBufferPosition([42, 1]);
        vimState.activateVisualMode();
        keydown('u', {ctrl: true});
        return expect(editor.getSelectedText()).toEqual([32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42].join("\n"));
      });

      return it("selects in linewise mode", function() {
        vimState.activateVisualMode('linewise');
        keydown('u', {ctrl: true});
        return expect(editor.getSelectedText()).toEqual([33, 34, 35, 36, 37, 38, 39, 40, 41, 42].join("\n").concat("\n"));
      });
    });

    describe("the ctrl-b keybinding", function() {
      it("moves screen up one page", function() {
        keydown('b', {ctrl: true});
        expect(editorElement.getScrollTop()).toEqual(200);
        return expect(editor.getCursorScreenPosition()).toEqual([22, 0]);
    });

      it("selects on visual mode", function() {
        editor.setCursorBufferPosition([42, 1]);
        vimState.activateVisualMode();
        keydown('b', {ctrl: true});
        return expect(editor.getSelectedText()).toEqual([22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42].join("\n"));
      });

      return it("selects in linewise mode", function() {
        vimState.activateVisualMode('linewise');
        keydown('b', {ctrl: true});
        return expect(editor.getSelectedText()).toEqual([23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42].join("\n").concat("\n"));
      });
    });

    describe("the ctrl-d keybinding", function() {
      it("moves the screen down by half screen size and keeps cursor onscreen", function() {
        keydown('d', {ctrl: true});
        expect(editorElement.getScrollTop()).toEqual(500);
        return expect(editor.getCursorBufferPosition()).toEqual([52, 0]);
    });

      it("selects on visual mode", function() {
        editor.setCursorBufferPosition([42, 1]);
        vimState.activateVisualMode();
        keydown('d', {ctrl: true});
        return expect(editor.getSelectedText()).toEqual([42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52].join("\n").slice(1, -1));
      });

      return it("selects in linewise mode", function() {
        vimState.activateVisualMode('linewise');
        keydown('d', {ctrl: true});
        return expect(editor.getSelectedText()).toEqual([42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53].join("\n").concat("\n"));
      });
    });

    return describe("the ctrl-f keybinding", function() {
      it("moves screen down one page", function() {
        keydown('f', {ctrl: true});
        expect(editorElement.getScrollTop()).toEqual(600);
        return expect(editor.getCursorScreenPosition()).toEqual([62, 0]);
    });

      it("selects on visual mode", function() {
        editor.setCursorBufferPosition([42, 1]);
        vimState.activateVisualMode();
        keydown('f', {ctrl: true});
        return expect(editor.getSelectedText()).toEqual([42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62].join("\n").slice(1, -1));
      });

      return it("selects in linewise mode", function() {
        vimState.activateVisualMode('linewise');
        keydown('f', {ctrl: true});
        return expect(editor.getSelectedText()).toEqual(__range__(42, 63, true).join("\n").concat("\n"));
      });
    });
  });
});

function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}
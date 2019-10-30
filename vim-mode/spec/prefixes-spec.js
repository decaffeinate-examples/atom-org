/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const helpers = require('./spec-helper');

describe("Prefixes", function() {
  let [editor, editorElement, vimState] = Array.from([]);

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

  describe("Repeat", function() {
    describe("with operations", function() {
      beforeEach(function() {
        editor.setText("123456789abc");
        return editor.setCursorScreenPosition([0, 0]);
      });

      it("repeats N times", function() {
        keydown('3');
        keydown('x');

        return expect(editor.getText()).toBe('456789abc');
      });

      return it("repeats NN times", function() {
        keydown('1');
        keydown('0');
        keydown('x');

        return expect(editor.getText()).toBe('bc');
      });
    });

    describe("with motions", function() {
      beforeEach(function() {
        editor.setText('one two three');
        return editor.setCursorScreenPosition([0, 0]);
      });

      return it("repeats N times", function() {
        keydown('d');
        keydown('2');
        keydown('w');

        return expect(editor.getText()).toBe('three');
      });
    });

    return describe("in visual mode", function() {
      beforeEach(function() {
        editor.setText('one two three');
        return editor.setCursorScreenPosition([0, 0]);
      });

      return it("repeats movements in visual mode", function() {
        keydown("v");
        keydown("2");
        keydown("w");

        return expect(editor.getCursorScreenPosition()).toEqual([0, 9]);
    });
  });
});

  return describe("Register", function() {
    describe("the a register", function() {
      it("saves a value for future reading", function() {
        vimState.setRegister('a', {text: 'new content'});
        return expect(vimState.getRegister("a").text).toEqual('new content');
      });

      return it("overwrites a value previously in the register", function() {
        vimState.setRegister('a', {text: 'content'});
        vimState.setRegister('a', {text: 'new content'});
        return expect(vimState.getRegister("a").text).toEqual('new content');
      });
    });

    describe("the B register", function() {
      it("saves a value for future reading", function() {
        vimState.setRegister('B', {text: 'new content'});
        expect(vimState.getRegister("b").text).toEqual('new content');
        return expect(vimState.getRegister("B").text).toEqual('new content');
      });

      it("appends to a value previously in the register", function() {
        vimState.setRegister('b', {text: 'content'});
        vimState.setRegister('B', {text: 'new content'});
        return expect(vimState.getRegister("b").text).toEqual('contentnew content');
      });

      it("appends linewise to a linewise value previously in the register", function() {
        vimState.setRegister('b', {type: 'linewise', text: 'content\n'});
        vimState.setRegister('B', {text: 'new content'});
        return expect(vimState.getRegister("b").text).toEqual('content\nnew content\n');
      });

      return it("appends linewise to a character value previously in the register", function() {
        vimState.setRegister('b', {text: 'content'});
        vimState.setRegister('B', {type: 'linewise', text: 'new content\n'});
        return expect(vimState.getRegister("b").text).toEqual('content\nnew content\n');
      });
    });


    describe("the * register", function() {
      describe("reading", () => it("is the same the system clipboard", function() {
        expect(vimState.getRegister('*').text).toEqual('initial clipboard content');
        return expect(vimState.getRegister('*').type).toEqual('character');
      }));

      return describe("writing", function() {
        beforeEach(() => vimState.setRegister('*', {text: 'new content'}));

        return it("overwrites the contents of the system clipboard", () => expect(atom.clipboard.read()).toEqual('new content'));
      });
    });

    // FIXME: once linux support comes out, this needs to read from
    // the correct clipboard. For now it behaves just like the * register
    // See :help x11-cut-buffer and :help registers for more details on how these
    // registers work on an X11 based system.
    describe("the + register", function() {
      describe("reading", () => it("is the same the system clipboard", function() {
        expect(vimState.getRegister('*').text).toEqual('initial clipboard content');
        return expect(vimState.getRegister('*').type).toEqual('character');
      }));

      return describe("writing", function() {
        beforeEach(() => vimState.setRegister('*', {text: 'new content'}));

        return it("overwrites the contents of the system clipboard", () => expect(atom.clipboard.read()).toEqual('new content'));
      });
    });

    describe("the _ register", function() {
      describe("reading", () => it("is always the empty string", () => expect(vimState.getRegister("_").text).toEqual('')));

      return describe("writing", () => it("throws away anything written to it", function() {
        vimState.setRegister('_', {text: 'new content'});
        return expect(vimState.getRegister("_").text).toEqual('');
      }));
    });

    describe("the % register", function() {
      beforeEach(() => spyOn(editor, 'getURI').andReturn('/Users/atom/known_value.txt'));

      describe("reading", () => it("returns the filename of the current editor", () => expect(vimState.getRegister('%').text).toEqual('/Users/atom/known_value.txt')));

      return describe("writing", () => it("throws away anything written to it", function() {
        vimState.setRegister('%', "new content");
        return expect(vimState.getRegister('%').text).toEqual('/Users/atom/known_value.txt');
      }));
    });

    return describe("the ctrl-r command in insert mode", function() {
      beforeEach(function() {
        editor.setText("02\n");
        editor.setCursorScreenPosition([0, 0]);
        vimState.setRegister('"', {text: '345'});
        vimState.setRegister('a', {text: 'abc'});
        atom.clipboard.write("clip");
        keydown('a');
        return editor.insertText('1');
      });

      it("inserts contents of the unnamed register with \"", function() {
        keydown('r', {ctrl: true});
        keydown('"');
        return expect(editor.getText()).toBe('013452\n');
      });

      describe("when useClipboardAsDefaultRegister enabled", () => it("inserts contents from clipboard with \"", function() {
        atom.config.set('vim-mode.useClipboardAsDefaultRegister', true);
        keydown('r', {ctrl: true});
        keydown('"');
        return expect(editor.getText()).toBe('01clip2\n');
      }));

      it("inserts contents of the 'a' register", function() {
        keydown('r', {ctrl: true});
        keydown('a');
        return expect(editor.getText()).toBe('01abc2\n');
      });

      return it("is cancelled with the escape key", function() {
        keydown('r', {ctrl: true});
        keydown('escape');
        expect(editor.getText()).toBe('012\n');
        expect(vimState.mode).toBe("insert");
        return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
    });
  });
});
});

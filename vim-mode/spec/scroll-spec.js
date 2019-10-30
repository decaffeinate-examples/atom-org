/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const helpers = require('./spec-helper');

describe("Scrolling", function() {
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
      vimState.resetNormalMode();
      return jasmine.attachToDOM(element);
    });
  });

  const keydown = function(key, options) {
    if (options == null) { options = {}; }
    if (options.element == null) { options.element = editorElement; }
    return helpers.keydown(key, options);
  };

  describe("scrolling keybindings", function() {
    beforeEach(function() {
      editor.setText(`\
100
200
300
400
500
600
700
800
900
1000\
`
      );

      editor.setCursorBufferPosition([1, 2]);
      editorElement.setHeight((editorElement.getHeight() * 4) / 10);
      return expect(editor.getVisibleRowRange()).toEqual([0, 4]);});

    return describe("the ctrl-e and ctrl-y keybindings", () => it("moves the screen up and down by one and keeps cursor onscreen", function() {
      keydown('e', {ctrl: true});
      expect(editor.getFirstVisibleScreenRow()).toBe(1);
      expect(editor.getLastVisibleScreenRow()).toBe(5);
      expect(editor.getCursorScreenPosition()).toEqual([2, 2]);

      keydown('2');
      keydown('e', {ctrl: true});
      expect(editor.getFirstVisibleScreenRow()).toBe(3);
      expect(editor.getLastVisibleScreenRow()).toBe(7);
      expect(editor.getCursorScreenPosition()).toEqual([4, 2]);

      keydown('2');
      keydown('y', {ctrl: true});
      expect(editor.getFirstVisibleScreenRow()).toBe(1);
      expect(editor.getLastVisibleScreenRow()).toBe(5);
      return expect(editor.getCursorScreenPosition()).toEqual([2, 2]);
  }));
});

  describe("scroll cursor keybindings", function() {
    beforeEach(function() {
      let text = "";
      for (let i = 1; i <= 200; i++) {
        text += `${i}\n`;
      }
      editor.setText(text);

      spyOn(editor, 'moveToFirstCharacterOfLine');

      spyOn(editorElement, 'setScrollTop');
      editorElement.style.lineHeight = "20px";
      editorElement.component.sampleFontStyling();
      editorElement.setHeight(200);
      spyOn(editorElement, 'getFirstVisibleScreenRow').andReturn(90);
      return spyOn(editorElement, 'getLastVisibleScreenRow').andReturn(110);
    });

    describe("the z<CR> keybinding", function() {
      const keydownCodeForEnter = '\r';

      beforeEach(() => spyOn(editorElement, 'pixelPositionForScreenPosition').andReturn({top: 1000, left: 0}));

      return it("moves the screen to position cursor at the top of the window and moves cursor to first non-blank in the line", function() {
        keydown('z');
        keydown(keydownCodeForEnter);
        expect(editorElement.setScrollTop).toHaveBeenCalledWith(960);
        return expect(editor.moveToFirstCharacterOfLine).toHaveBeenCalled();
      });
    });

    describe("the zt keybinding", function() {
      beforeEach(() => spyOn(editorElement, 'pixelPositionForScreenPosition').andReturn({top: 1000, left: 0}));

      return it("moves the screen to position cursor at the top of the window and leave cursor in the same column", function() {
        keydown('z');
        keydown('t');
        expect(editorElement.setScrollTop).toHaveBeenCalledWith(960);
        return expect(editor.moveToFirstCharacterOfLine).not.toHaveBeenCalled();
      });
    });

    describe("the z. keybinding", function() {
      beforeEach(() => spyOn(editorElement, 'pixelPositionForScreenPosition').andReturn({top: 1000, left: 0}));

      return it("moves the screen to position cursor at the center of the window and moves cursor to first non-blank in the line", function() {
        keydown('z');
        keydown('.');
        expect(editorElement.setScrollTop).toHaveBeenCalledWith(900);
        return expect(editor.moveToFirstCharacterOfLine).toHaveBeenCalled();
      });
    });

    describe("the zz keybinding", function() {
      beforeEach(() => spyOn(editorElement, 'pixelPositionForScreenPosition').andReturn({top: 1000, left: 0}));

      return it("moves the screen to position cursor at the center of the window and leave cursor in the same column", function() {
        keydown('z');
        keydown('z');
        expect(editorElement.setScrollTop).toHaveBeenCalledWith(900);
        return expect(editor.moveToFirstCharacterOfLine).not.toHaveBeenCalled();
      });
    });

    describe("the z- keybinding", function() {
      beforeEach(() => spyOn(editorElement, 'pixelPositionForScreenPosition').andReturn({top: 1000, left: 0}));

      return it("moves the screen to position cursor at the bottom of the window and moves cursor to first non-blank in the line", function() {
        keydown('z');
        keydown('-');
        expect(editorElement.setScrollTop).toHaveBeenCalledWith(860);
        return expect(editor.moveToFirstCharacterOfLine).toHaveBeenCalled();
      });
    });

    return describe("the zb keybinding", function() {
      beforeEach(() => spyOn(editorElement, 'pixelPositionForScreenPosition').andReturn({top: 1000, left: 0}));

      return it("moves the screen to position cursor at the bottom of the window and leave cursor in the same column", function() {
        keydown('z');
        keydown('b');
        expect(editorElement.setScrollTop).toHaveBeenCalledWith(860);
        return expect(editor.moveToFirstCharacterOfLine).not.toHaveBeenCalled();
      });
    });
  });

  return describe("horizontal scroll cursor keybindings", function() {
    beforeEach(function() {
      editorElement.setWidth(600);
      editorElement.setHeight(600);
      editorElement.style.lineHeight = "10px";
      editorElement.style.font = "16px monospace";
      atom.views.performDocumentPoll();
      let text = "";
      for (let i = 100; i <= 199; i++) {
        text += `${i} `;
      }
      editor.setText(text);
      return editor.setCursorBufferPosition([0, 0]);
    });

    describe("the zs keybinding", function() {
      const zsPos = function(pos) {
        editor.setCursorBufferPosition([0, pos]);
        keydown('z');
        keydown('s');
        return editorElement.getScrollLeft();
      };

      let startPosition = NaN;

      beforeEach(() => startPosition = editorElement.getScrollLeft());

      it("does nothing near the start of the line", function() {
        const pos1 = zsPos(1);
        return expect(pos1).toEqual(startPosition);
      });

      it("moves the cursor the nearest it can to the left edge of the editor", function() {
        const pos10 = zsPos(10);
        expect(pos10).toBeGreaterThan(startPosition);

        const pos11 = zsPos(11);
        return expect(pos11 - pos10).toEqual(10);
      });

      it("does nothing near the end of the line", function() {
        const posEnd = zsPos(399);
        expect(editor.getCursorBufferPosition()).toEqual([0, 399]);

        const pos390 = zsPos(390);
        expect(pos390).toEqual(posEnd);
        expect(editor.getCursorBufferPosition()).toEqual([0, 390]);

        const pos340 = zsPos(340);
        expect(pos340).toBeLessThan(posEnd);
        const pos342 = zsPos(342);
        return expect(pos342 - pos340).toEqual(19);
      });

      return it("does nothing if all lines are short", function() {
        editor.setText('short');
        startPosition = editorElement.getScrollLeft();
        const pos1 = zsPos(1);
        expect(pos1).toEqual(startPosition);
        expect(editor.getCursorBufferPosition()).toEqual([0, 1]);
        const pos10 = zsPos(10);
        expect(pos10).toEqual(startPosition);
        return expect(editor.getCursorBufferPosition()).toEqual([0, 4]);
    });
  });


    return describe("the ze keybinding", function() {
      const zePos = function(pos) {
        editor.setCursorBufferPosition([0, pos]);
        keydown('z');
        keydown('e');
        return editorElement.getScrollLeft();
      };

      let startPosition = NaN;

      beforeEach(() => startPosition = editorElement.getScrollLeft());

      it("does nothing near the start of the line", function() {
        const pos1 = zePos(1);
        expect(pos1).toEqual(startPosition);

        const pos40 = zePos(40);
        return expect(pos40).toEqual(startPosition);
      });

      it("moves the cursor the nearest it can to the right edge of the editor", function() {
        const pos110 = zePos(110);
        expect(pos110).toBeGreaterThan(startPosition);

        const pos109 = zePos(109);
        return expect(pos110 - pos109).toEqual(10);
      });

      it("does nothing when very near the end of the line", function() {
        const posEnd = zePos(399);
        expect(editor.getCursorBufferPosition()).toEqual([0, 399]);

        const pos397 = zePos(397);
        expect(pos397).toEqual(posEnd);
        expect(editor.getCursorBufferPosition()).toEqual([0, 397]);

        const pos380 = zePos(380);
        expect(pos380).toBeLessThan(posEnd);

        const pos382 = zePos(382);
        return expect(pos382 - pos380).toEqual(19);
      });

      return it("does nothing if all lines are short", function() {
        editor.setText('short');
        startPosition = editorElement.getScrollLeft();
        const pos1 = zePos(1);
        expect(pos1).toEqual(startPosition);
        expect(editor.getCursorBufferPosition()).toEqual([0, 1]);
        const pos10 = zePos(10);
        expect(pos10).toEqual(startPosition);
        return expect(editor.getCursorBufferPosition()).toEqual([0, 4]);
    });
  });
});
});

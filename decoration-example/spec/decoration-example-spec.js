/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const path = require('path');
const {WorkspaceView} = require('atom');
const DecorationExample = require('../lib/decoration-example');

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.

describe("DecorationExample", function() {
  let [activationPromise, editor, editorView, decorationExampleView] = Array.from([]);

  beforeEach(function() {
    atom.workspaceView = new WorkspaceView;
    atom.project.setPath(path.join(__dirname, 'fixtures'));

    waitsForPromise(() => atom.workspace.open('sample.js'));

    runs(function() {
      atom.workspaceView.attachToDom();
      editorView = atom.workspaceView.getActiveView();
      editor = editorView.getEditor();

      return activationPromise = atom.packages.activatePackage('decoration-example').then(function({mainModule}) {
        ({decorationExampleView} = mainModule);
        return decorationExampleView.randomizeColors = false;
      });
    });

    return waitsForPromise(() => activationPromise);
  });

  describe("when the view is loaded", () => it("attaches the view", () => expect(atom.workspaceView.find('.decoration-example')).toExist()));

  describe("when the toggle buttons are clicked", function() {
    beforeEach(() => editor.setSelectedBufferRange([[5, 8], [6, 10]]));

    describe("when the gutter toggle button is clicked", () => it("adds a decoration to the gutter and removes it", function() {
      expect(editorView.find('.gutter .line-number-green')).toHaveLength(0);

      decorationExampleView.gutterToggle.click();
      expect(editorView.find('.gutter .line-number-green')).toHaveLength(2);

      decorationExampleView.gutterToggle.click();
      return expect(editorView.find('.gutter .line-number-green')).toHaveLength(0);
    }));

    describe("when the line toggle button is clicked", () => it("adds a decoration to the lines and removes it", function() {
      expect(editorView.find('.line.line-green')).toHaveLength(0);

      decorationExampleView.lineToggle.click();
      expect(editorView.find('.line.line-green')).toHaveLength(2);

      decorationExampleView.lineToggle.click();
      return expect(editorView.find('.line.line-green')).toHaveLength(0);
    }));

    return describe("when the highlight toggle button is clicked", () => it("adds a decoration for the highlight and removes it", function() {
      expect(editorView.find('.highlight-green .region')).toHaveLength(0);

      decorationExampleView.highlightToggle.click();
      expect(editorView.find('.highlight-green .region')).toHaveLength(2);

      decorationExampleView.highlightToggle.click();
      return expect(editorView.find('.highlight-green .region')).toHaveLength(0);
    }));
  });

  return describe("when the color cycle buttons are clicked", function() {
    beforeEach(() => editor.setSelectedBufferRange([[5, 8], [6, 10]]));

    describe("when the gutter color cycle button is clicked", () => it("cycles through the gutter decoration's colors", function() {
      decorationExampleView.gutterToggle.click();
      expect(editorView.find('.gutter .line-number-green')).toHaveLength(2);

      decorationExampleView.gutterColorCycle.click();
      expect(editorView.find('.gutter .line-number-green')).toHaveLength(0);
      expect(editorView.find('.gutter .line-number-blue')).toHaveLength(2);

      decorationExampleView.gutterColorCycle.click();
      expect(editorView.find('.gutter .line-number-blue')).toHaveLength(0);
      expect(editorView.find('.gutter .line-number-red')).toHaveLength(2);

      decorationExampleView.gutterColorCycle.click();
      expect(editorView.find('.gutter .line-number-red')).toHaveLength(0);
      return expect(editorView.find('.gutter .line-number-green')).toHaveLength(2);
    }));

    describe("when the line color cycle button is clicked", () => it("cycles through the line decoration's colors", function() {
      decorationExampleView.lineToggle.click();
      expect(editorView.find('.line.line-green')).toHaveLength(2);

      decorationExampleView.lineColorCycle.click();
      expect(editorView.find('.line.line-green')).toHaveLength(0);
      expect(editorView.find('.line.line-blue')).toHaveLength(2);

      decorationExampleView.lineColorCycle.click();
      expect(editorView.find('.line.line-blue')).toHaveLength(0);
      expect(editorView.find('.line.line-red')).toHaveLength(2);

      decorationExampleView.lineColorCycle.click();
      expect(editorView.find('.line.line-red')).toHaveLength(0);
      return expect(editorView.find('.line.line-green')).toHaveLength(2);
    }));

    return describe("when the highlight color cycle button is clicked", () => it("cycles through the highlight decoration's colors", function() {
      decorationExampleView.highlightToggle.click();
      expect(editorView.find('.highlight-green .region')).toHaveLength(2);

      decorationExampleView.highlightColorCycle.click();
      expect(editorView.find('.highlight-green .region')).toHaveLength(0);
      expect(editorView.find('.highlight-blue .region')).toHaveLength(2);

      decorationExampleView.highlightColorCycle.click();
      expect(editorView.find('.highlight-blue .region')).toHaveLength(0);
      expect(editorView.find('.highlight-red .region')).toHaveLength(2);

      decorationExampleView.highlightColorCycle.click();
      expect(editorView.find('.highlight-red .region')).toHaveLength(0);
      return expect(editorView.find('.highlight-green .region')).toHaveLength(2);
    }));
  });
});

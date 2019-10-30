/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const _ = require('underscore-plus');
const {$} = require('atom-space-pen-views');

describe("EditorStats", function() {
  let editorStats = null;
  let workspaceElement = null;

  const simulateKeyUp = function(key) {
    const e = $.Event("keydown", {keyCode: key.charCodeAt(0)});
    return $(workspaceElement).trigger(e);
  };

  const simulateClick = function() {
    const e = $.Event("mouseup");
    return $(workspaceElement).trigger(e);
  };

  beforeEach(function() {
    workspaceElement = atom.views.getView(atom.workspace);

    waitsForPromise(() => atom.workspace.open('sample.js'));

    return waitsForPromise(() => atom.packages.activatePackage('editor-stats').then(pack => editorStats = pack.mainModule.stats));
  });

  describe("when a keyup event is triggered", function() {
    beforeEach(function() {
      expect(_.values(editorStats.eventLog)).not.toContain(1);
      return expect(_.values(editorStats.eventLog)).not.toContain(2);
    });

    return it("records the number of times a keyup is triggered", function() {
      simulateKeyUp('a');
      expect(_.values(editorStats.eventLog)).toContain(1);
      simulateKeyUp('b');
      return expect(_.values(editorStats.eventLog)).toContain(2);
    });
  });

  return describe("when a mouseup event is triggered", () => it("records the number of times a mouseup is triggered", function() {
    simulateClick();
    expect(_.values(editorStats.eventLog)).toContain(1);
    simulateClick();
    return expect(_.values(editorStats.eventLog)).toContain(2);
  }));
});

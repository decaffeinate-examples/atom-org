/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const scrollbarStyle = require('../src/scrollbar-style');

describe("scrollbar-style", function() {
  describe("getPreferredScrollbarStyle()", () => it("returns the preferred scrollbar style", function() {
    const style = scrollbarStyle.getPreferredScrollbarStyle();
    return expect(['legacy', 'overlay'].includes(style)).toBe(true);
  }));

  describe("onDidChangePreferredScrollbarStyle(callback)", () => it("returns a disposable", function() {
    const disposable = scrollbarStyle.onDidChangePreferredScrollbarStyle(function() {});
    return disposable.dispose();
  }));

  return describe("observePreferredScrollbarStyle(callback)", () => it("calls back immediately with the style", function() {
    const callback = jasmine.createSpy('callback');
    const disposable = scrollbarStyle.observePreferredScrollbarStyle(callback);
    disposable.dispose();

    expect(callback.callCount).toBe(1);
    const [style] = Array.from(callback.argsForCall[0]);
    return expect(['legacy', 'overlay'].includes(style)).toBe(true);
  }));
});

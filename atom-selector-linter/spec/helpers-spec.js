/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const helpers = require("../src/helpers");

describe("Helpers", function() {
  describe(".eachSelector(css, callback)", function() {
    let [selectorsYielded, callback] = Array.from([]);

    beforeEach(function() {
      selectorsYielded= [];
      return callback = selector => selectorsYielded.push(selector);
    });

    it("calls the callback with each selector in the stylesheet", function() {
      helpers.eachSelector(`\
.class1 {
  color: red;
  font-size: 12px;
}
.class2 > .class3,
.class4 .class5 {
  color: blue;
}
\
`, callback);

      return expect(selectorsYielded).toEqual([
        ".class1",
        ".class2 > .class3",
        ".class4 .class5"
      ]);
    });

    return it("works if there are no linebreaks", function() {
      helpers.eachSelector(
        ".class1 { color: red; } .class2 { color: blue; }",
        callback
      );

      return expect(selectorsYielded).toEqual([".class1", ".class2"]);
    });
  });

  describe(".selectorHasClass(selector, klass)", function() {
    it("returns true when the selector uses the class", function() {
      expect(helpers.selectorHasClass(
        "div.the-class:first-child",
        "the-class"
      )).toBeTruthy();

      expect(helpers.selectorHasClass(
        "span.the-class",
        "the-class"
      )).toBeTruthy();

      return expect(helpers.selectorHasClass(
        "span.the-class>other-tag",
        "the-class"
      )).toBeTruthy();
    });

    return it("returns false when the selector doesn't use the class", () => expect(helpers.selectorHasClass(
      "div.the-class-something",
      "the-class"
    )).toBeFalsy());
  });

  return describe(".selectorHasPsuedoClass(selector, klass)", function() {
    it("returns true when the selector uses the psuedo-class", function() {
      expect(helpers.selectorHasPsuedoClass(
        "div.the-class:the-psuedo-class",
        "the-psuedo-class"
      )).toBeTruthy();

      expect(helpers.selectorHasPsuedoClass(
        ":the-psuedo-class other-tag",
        "the-psuedo-class"
      )).toBeTruthy();

      return expect(helpers.selectorHasPsuedoClass(
        ":the-psuedo-class>other-tag",
        "the-psuedo-class"
      )).toBeTruthy();
    });

    return it("returns false when the selector doesn't use the psuedo-class", () => expect(helpers.selectorHasPsuedoClass(
      "div:the-psuedo-class-something",
      "the-class"
    )).toBeFalsy());
  });
});

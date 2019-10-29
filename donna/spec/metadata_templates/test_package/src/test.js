/*
 * decaffeinate suggestions:
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let TestClass;
const Point = require('./point');
const Range = require('./range');

// Public: A mutable text container with undo/redo support and the ability to
// annotate logical regions in the text.
module.exports =
(TestClass = (function() {
  TestClass = class TestClass {
    static initClass() {
      this.Range = Range;
      this.newlineRegex = newlineRegex;
    }
  };
  TestClass.initClass();
  return TestClass;
})());

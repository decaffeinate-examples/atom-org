/*
 * decaffeinate suggestions:
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Public: A mutable text container with undo/redo support and the ability to
// annotate logical regions in the text.
//
class TextBuffer {
  static initClass() {
    this.prototype.prop2 = "bar";
  }

  /*
  Section: Something
  */

  // Public: Takes an argument and does some stuff.
  //
  // a - A {String}
  //
  // Returns {Boolean}.
  method2(a) {}
}
TextBuffer.initClass();

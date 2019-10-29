/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {Range} = require('atom');

module.exports = {
  // Public: Determines if a string should be considered linewise or character
  //
  // text - The string to consider
  //
  // Returns 'linewise' if the string ends with a line return and 'character'
  //  otherwise.
  copyType(text) {
    if (text.lastIndexOf("\n") === (text.length - 1)) {
      return 'linewise';
    } else if (text.lastIndexOf("\r") === (text.length - 1)) {
      return 'linewise';
    } else {
      return 'character';
    }
  },

  // Public: return a union of two ranges, or simply the newRange if the oldRange is empty.
  //
  // Returns a Range
  mergeRanges(oldRange, newRange) {
    oldRange = Range.fromObject(oldRange);
    newRange = Range.fromObject(newRange);
    if (oldRange.isEmpty()) {
      return newRange;
    } else {
      return oldRange.union(newRange);
    }
  }
};

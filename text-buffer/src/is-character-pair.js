/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
module.exports = function(character1, character2) {
  const charCodeA = character1.charCodeAt(0);
  const charCodeB = character2.charCodeAt(0);
  return isSurrogatePair(charCodeA, charCodeB) ||
    isVariationSequence(charCodeA, charCodeB) ||
    isCombinedCharacter(charCodeA, charCodeB);
};

var isCombinedCharacter = (charCodeA, charCodeB) => !isCombiningCharacter(charCodeA) && isCombiningCharacter(charCodeB);

var isSurrogatePair = (charCodeA, charCodeB) => isHighSurrogate(charCodeA) && isLowSurrogate(charCodeB);

var isVariationSequence = (charCodeA, charCodeB) => !isVariationSelector(charCodeA) && isVariationSelector(charCodeB);

var isHighSurrogate = charCode => 0xD800 <= charCode && charCode <= 0xDBFF;

var isLowSurrogate = charCode => 0xDC00 <= charCode && charCode <= 0xDFFF;

var isVariationSelector = charCode => 0xFE00 <= charCode && charCode <= 0xFE0F;

var isCombiningCharacter = charCode => (0x0300 <= charCode && charCode <= 0x036F) ||
(0x1AB0 <= charCode && charCode <= 0x1AFF) ||
(0x1DC0 <= charCode && charCode <= 0x1DFF) ||
(0x20D0 <= charCode && charCode <= 0x20FF) ||
(0xFE20 <= charCode && charCode <= 0xFE2F);

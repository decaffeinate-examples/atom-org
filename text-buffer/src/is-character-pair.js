/** @babel */
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
module.exports = function (character1, character2) {
  const charCodeA = character1.charCodeAt(0)
  const charCodeB = character2.charCodeAt(0)
  return isSurrogatePair(charCodeA, charCodeB) ||
    isVariationSequence(charCodeA, charCodeB) ||
    isCombinedCharacter(charCodeA, charCodeB)
}

var isCombinedCharacter = (charCodeA, charCodeB) => !isCombiningCharacter(charCodeA) && isCombiningCharacter(charCodeB)

var isSurrogatePair = (charCodeA, charCodeB) => isHighSurrogate(charCodeA) && isLowSurrogate(charCodeB)

var isVariationSequence = (charCodeA, charCodeB) => !isVariationSelector(charCodeA) && isVariationSelector(charCodeB)

var isHighSurrogate = charCode => charCode >= 0xD800 && charCode <= 0xDBFF

var isLowSurrogate = charCode => charCode >= 0xDC00 && charCode <= 0xDFFF

var isVariationSelector = charCode => charCode >= 0xFE00 && charCode <= 0xFE0F

var isCombiningCharacter = charCode => (charCode >= 0x0300 && charCode <= 0x036F) ||
(charCode >= 0x1AB0 && charCode <= 0x1AFF) ||
(charCode >= 0x1DC0 && charCode <= 0x1DFF) ||
(charCode >= 0x20D0 && charCode <= 0x20FF) ||
(charCode >= 0xFE20 && charCode <= 0xFE2F)

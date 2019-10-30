/** @babel */
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
module.exports = {
  unescapeEscapeSequence (string) {
    return string.replace(/\\(.)/gm, function (match, char) {
      if (char === 't') {
        return '\t'
      } else if (char === 'n') {
        return '\n'
      } else if (char === 'r') {
        return '\r'
      } else if (char === '\\') {
        return '\\'
      } else {
        return match
      }
    })
  }
}

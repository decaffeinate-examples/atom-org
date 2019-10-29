/** @babel */
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const copyCharacterFromAbove = (editor, vimState) => editor.transact(() => (() => {
  const result = []
  for (const cursor of Array.from(editor.getCursors())) {
    const { row, column } = cursor.getScreenPosition()
    if (row === 0) { continue }
    const range = [[row - 1, column], [row - 1, column + 1]]
    result.push(cursor.selection.insertText(editor.getTextInBufferRange(editor.bufferRangeForScreenRange(range))))
  }
  return result
})())

const copyCharacterFromBelow = (editor, vimState) => editor.transact(() => (() => {
  const result = []
  for (const cursor of Array.from(editor.getCursors())) {
    const { row, column } = cursor.getScreenPosition()
    const range = [[row + 1, column], [row + 1, column + 1]]
    result.push(cursor.selection.insertText(editor.getTextInBufferRange(editor.bufferRangeForScreenRange(range))))
  }
  return result
})())

module.exports = {
  copyCharacterFromAbove,
  copyCharacterFromBelow
}

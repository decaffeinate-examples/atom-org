/** @babel */
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const setEqual = function (a, b) {
  let next
  if (a.size !== b.size) { return false }
  const iterator = a.values()
  while (!(next = iterator.next()).done) {
    if (!b.has(next.value)) { return false }
  }
  return true
}

const subtractSet = function (set, valuesToRemove) {
  if (set.size > valuesToRemove.size) {
    return valuesToRemove.forEach(value => set.delete(value))
  } else {
    return set.forEach(function (value) { if (valuesToRemove.has(value)) { return set.delete(value) } })
  }
}

const addSet = (set, valuesToAdd) => valuesToAdd.forEach(value => set.add(value))

const intersectSet = (set, other) => set.forEach(function (value) { if (!other.has(value)) { return set.delete(value) } })

module.exports = { setEqual, subtractSet, addSet, intersectSet }

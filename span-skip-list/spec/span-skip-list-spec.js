/** @babel */
/* eslint-disable
    no-undef,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const { times, random } = require('underscore')
const SpanSkipList = require('../src/span-skip-list')
const ReferenceSpanSkipList = require('./reference-span-skip-list')

const counter = 1

describe('SpanSkipList', function () {
  const dimensions = ['x', 'y', 'z']
  const buildRandomElement = () => ({
    x: random(10),
    y: random(10),
    z: random(10)
  })

  const buildRandomElements = function (count) {
    if (count == null) { count = random(10) }
    const elements = []
    times(count, () => elements.push(buildRandomElement()))
    return elements
  }

  const spliceRandomElements = function (...lists) {
    const length = lists[0].getLength('elements')
    const index = random(0, length)
    const count = random(0, Math.floor((length - index - 1) / 2))
    const elements = buildRandomElements()
    const dimension = 'elements' // getRandomDimension()
    return Array.from(lists).map((list) =>
      list.spliceArray(dimension, index, count, elements))
  }

  const getRandomDimension = () => dimensions[random(dimensions.length - 1)]

  describe('::totalTo', () => it('returns total for all dimensions up to a target total in one dimension', () => times(10, function () {
    const list = new SpanSkipList(...Array.from(dimensions || []))
    const referenceList = new ReferenceSpanSkipList(...Array.from(dimensions || []))
    times(20, () => spliceRandomElements(list, referenceList))

    expect(list.getElements()).toEqual(referenceList.getElements())

    list.verifyDistanceInvariant()

    return times(10, function () {
      const dimension = getRandomDimension()
      const target = referenceList.getLength(dimension)
      const referenceTotal = referenceList.totalTo(target, dimension)
      const realTotal = list.totalTo(target, dimension)
      return expect(realTotal).toEqual(referenceTotal)
    })
  })))

  return describe('::splice(dimension, index, count, elements...)', function () {
    it('maintains the distance invariant when removing / inserting elements', () => times(10, function () {
      const list = new SpanSkipList(...Array.from(dimensions || []))
      return times(10, function () {
        spliceRandomElements(list)
        return list.verifyDistanceInvariant()
      })
    }))

    it('returns an array of removed elements', function () {
      const list = new SpanSkipList(...Array.from(dimensions || []))
      const elements = buildRandomElements(10)
      list.spliceArray('elements', 0, 0, elements)
      return expect(list.splice('elements', 3, 2)).toEqual(elements.slice(3, 5))
    })

    return it('does not attempt to remove beyond the end of the list', function () {
      const list = new SpanSkipList(...Array.from(dimensions || []))
      const elements = buildRandomElements(10)
      list.spliceArray('elements', 0, 0, elements)
      return expect(list.splice('elements', 9, 3)).toEqual(elements.slice(9, 10))
    })
  })
})

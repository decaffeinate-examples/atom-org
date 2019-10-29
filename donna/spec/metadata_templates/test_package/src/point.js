/** @babel */
/* eslint-disable
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
// Public: Represents a point in a buffer in row/column coordinates.
//
// Every public method that takes a point also accepts a *point-compatible*
// {Array}. This means a 2-element array containing {Number}s representing the
// row and column. So the following are equivalent:
//
// ```coffee
// new Point(1, 2)
// [1, 2]
// ```
let Point
module.exports =
(Point = class Point {
  // Public: Convert any point-compatible object to a {Point}.
  //
  // * object:
  //     This can be an object that's already a {Point}, in which case it's
  //     simply returned, or an array containing two {Number}s representing the
  //     row and column.
  //
  // * copy:
  //     An optional boolean indicating whether to force the copying of objects
  //     that are already points.
  //
  // Returns: A {Point} based on the given object.
  static fromObject (object, copy) {
    if (object instanceof Point) {
      if (copy) { return object.copy() } else { return object }
    } else {
      let column, row
      if (Array.isArray(object)) {
        [row, column] = Array.from(object)
      } else {
        ({ row, column } = object)
      }

      return new Point(row, column)
    }
  }

  // Public: Returns the given point that is earlier in the buffer.
  static min (point1, point2) {
    point1 = this.fromObject(point1)
    point2 = this.fromObject(point2)
    if (point1.isLessThanOrEqual(point2)) {
      return point1
    } else {
      return point2
    }
  }

  constructor (row, column) {
    if (row == null) { row = 0 }
    this.row = row
    if (column == null) { column = 0 }
    this.column = column
  }

  // Public: Returns a new {Point} with the same row and column.
  copy () {
    return new Point(this.row, this.column)
  }

  // Public: Makes this point immutable and returns itself.
  freeze () {
    return Object.freeze(this)
  }

  // Public: Return a new {Point} based on shifting this point by the given delta,
  // which is represented by another {Point}.
  translate (delta) {
    const { row, column } = Point.fromObject(delta)
    return new Point(this.row + row, this.column + column)
  }

  add (other) {
    let column
    other = Point.fromObject(other)
    const row = this.row + other.row
    if (other.row === 0) {
      column = this.column + other.column
    } else {
      ({
        column
      } = other)
    }

    return new Point(row, column)
  }

  splitAt (column) {
    let rightColumn
    if (this.row === 0) {
      rightColumn = this.column - column
    } else {
      rightColumn = this.column
    }

    return [new Point(0, column), new Point(this.row, rightColumn)]
  }

  // Public:
  //
  // * other: A {Point} or point-compatible {Array}.
  //
  // Returns:
  //  * -1 if this point precedes the argument.
  //  * 0 if this point is equivalent to the argument.
  //  * 1 if this point follows the argument.
  compare (other) {
    if (this.row > other.row) {
      return 1
    } else if (this.row < other.row) {
      return -1
    } else {
      if (this.column > other.column) {
        return 1
      } else if (this.column < other.column) {
        return -1
      } else {
        return 0
      }
    }
  }
})

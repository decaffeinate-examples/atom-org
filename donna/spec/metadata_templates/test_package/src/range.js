/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Range;
const Grim = require('grim');
const Point = require('./point');
const {newlineRegex} = require('./helpers');
const Fs = require('fs');

// Public: Represents a region in a buffer in row/column coordinates.
//
// Every public method that takes a range also accepts a *range-compatible*
// {Array}. This means a 2-element array containing {Point}s or point-compatible
// arrays. So the following are equivalent:
//
// ```coffee
// new Range(new Point(0, 1), new Point(2, 3))
// new Range([0, 1], [2, 3])
// [[0, 1], [2, 3]]
// ```
module.exports =
(Range = (function() {
  Range = class Range {
    static initClass() {
      this.prototype.grim = Grim;
    }

    // Public: Call this with the result of {Range::serialize} to construct a new Range.
    static deserialize(array) {
      return new (this)(...Array.from(array || []));
    }

    // Public: Convert any range-compatible object to a {Range}.
    //
    // * object:
    //     This can be an object that's already a {Range}, in which case it's
    //     simply returned, or an array containing two {Point}s or point-compatible
    //     arrays.
    // * copy:
    //     An optional boolean indicating whether to force the copying of objects
    //     that are already ranges.
    //
    // Returns: A {Range} based on the given object.
    static fromObject(object, copy) {
      if (Array.isArray(object)) {
        return new (this)(...Array.from(object || []));
      } else if (object instanceof this) {
        if (copy) { return object.copy(); } else { return object; }
      } else {
        return new (this)(object.start, object.end);
      }
    }
    // Public: Returns a {Range} that starts at the given point and ends at the
    // start point plus the given row and column deltas.
    //
    // * startPoint:
    //     A {Point} or point-compatible {Array}
    // * rowDelta:
    //     A {Number} indicating how many rows to add to the start point to get the
    //     end point.
    // * columnDelta:
    //     A {Number} indicating how many rows to columns to the start point to get
    //     the end point.
    //
    // Returns a {Range}
    static fromPointWithDelta(startPoint, rowDelta, columnDelta) {
      startPoint = Point.fromObject(startPoint);
      const endPoint = new Point(startPoint.row + rowDelta, startPoint.column + columnDelta);
      return new (this)(startPoint, endPoint);
    }

    constructor(pointA, pointB) {
      if (pointA == null) { pointA = new Point(0, 0); }
      if (pointB == null) { pointB = new Point(0, 0); }
      pointA = Point.fromObject(pointA);
      pointB = Point.fromObject(pointB);

      if (pointA.isLessThanOrEqual(pointB)) {
        this.start = pointA;
        this.end = pointB;
      } else {
        this.start = pointB;
        this.end = pointA;
      }
    }

    // Public: Returns a {Boolean} indicating whether this range has the same start
    // and end points as the given {Range} or range-compatible {Array}.
    isEqual(other) {
      if (other == null) { return false; }
      other = this.constructor.fromObject(other);
      return other.start.isEqual(this.start) && other.end.isEqual(this.end);
    }
  };
  Range.initClass();
  return Range;
})());

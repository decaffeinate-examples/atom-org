/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Point;
module.exports =
(Point = class Point {
  constructor(rows, columns) {
    if (this instanceof Point) {
      this.rows = rows;
      this.columns = columns;
    } else {
      return new Point(rows, columns);
    }
  }

  add(rows, columns) {
    if (rows instanceof Point) {
      return this.add(rows.rows, rows.columns);
    }

    if (Math.abs(rows) > 0) {
      return new Point(this.rows + rows, columns);
    } else {
      return new Point(this.rows, this.columns + columns);
    }
  }

  isEqual(other) {
    return (this.rows === other.rows) && (this.columns === other.columns);
  }

  summarize() { return [this.rows, this.columns]; }
});

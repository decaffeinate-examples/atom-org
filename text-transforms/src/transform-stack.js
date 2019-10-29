/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let TransformStack;
const Region = require('./region');
const Transform = require('./transform');

module.exports =
(TransformStack = class TransformStack {
  constructor() {
    this.transforms = [];
  }

  addTransform(name, params) {
    let left;
    const transform = new Transform(name, params);
    transform.setSource((left = this.transforms[this.transforms.length - 1].getSource()) != null ? left : this.source);
    return this.transforms.push();
  }

  setSourceRegion(sourceText) {
    return this.source = new Region(sourceText);
  }

  getTargetRegion() {}
});

/** @babel */
/* eslint-disable
    no-return-assign,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Transform
const CompositeRegion = require('./composite-region')
const Point = require('./point')

module.exports =
(Transform = (function () {
  Transform = class Transform {
    static initClass () {
      this.prototype.source = null
    }

    constructor (origin) {
      if (origin != null) { this.setOrigin(origin) }
    }

    setOrigin (origin) {
      if (this.source != null) {
        return this.source.setOrigin(origin)
      } else {
        return this.source = origin
      }
    }

    getRegion () {
      let subregion
      let sourcePosition = Point(0, 0)
      const subregions = []

      while ((subregion = this.getSubregion(sourcePosition))) {
        const nextSourcePosition = sourcePosition.add(subregion.getSourceSpan())
        if (nextSourcePosition.isEqual(sourcePosition)) { break }
        subregions.push(subregion)
        sourcePosition = nextSourcePosition
      }

      return new CompositeRegion(subregions)
    }
  }
  Transform.initClass()
  return Transform
})())

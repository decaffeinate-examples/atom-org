/** @babel */
/* eslint-disable
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const Delegator = require('../src/delegator')

describe('Delegator', function () {
  let [TestClass, TestSubclass] = Array.from([])

  beforeEach(function () {
    TestClass = class TestClass {
      static initClass () {
        Delegator.includeInto(this)
      }
    }
    TestClass.initClass()

    return (TestSubclass = class TestSubclass extends TestClass {})
  })

  describe('.delegatesProperties', function () {
    it('can delegate a property to the value of a property on the current object', function () {
      TestClass.delegatesProperties('a', { toProperty: 'b' })

      const object1 = new TestClass()
      object1.b = { a: 1 }
      expect(object1.a).toBe(1)

      const object2 = new TestSubclass()
      object2.b = { a: 2 }
      return expect(object2.a).toBe(2)
    })

    return it('can delegate a property to the result of a method on the current object', function () {
      TestClass.delegatesProperties('a', { toMethod: 'getB' })
      TestClass.prototype.getB = function () { return this.b }

      const object1 = new TestClass()
      object1.b = { a: 1 }
      expect(object1.a).toBe(1)

      const object2 = new TestSubclass()
      object2.b = { a: 2 }
      return expect(object2.a).toBe(2)
    })
  })

  return describe('.delegatesMethods', function () {
    it('can delegate a method to the value of a property on the current object ', function () {
      TestClass.delegatesMethods('a', { toProperty: 'b' })

      const object1 = new TestClass()
      object1.b = { a (v) { return 1 + v } }
      expect(object1.a(1)).toBe(2)

      const object2 = new TestSubclass()
      object2.b = { a (v) { return 1 + 2 } }
      return expect(object2.a(1)).toBe(3)
    })

    return it('can delegate a method to the result of a method on the current object ', function () {
      TestClass.delegatesMethods('a', { toMethod: 'getB' })
      TestClass.prototype.getB = function () { return this.b }

      const object1 = new TestClass()
      object1.b = { a (v) { return 1 + v } }
      expect(object1.a(1)).toBe(2)

      const object2 = new TestSubclass()
      object2.b = { a (v) { return 1 + 2 } }
      return expect(object2.a(1)).toBe(3)
    })
  })
})

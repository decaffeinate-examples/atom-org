/** @babel */
/* eslint-disable
    no-return-assign,
    no-undef,
    no-unused-vars,
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
const PropertyAccessors = require('../src/property-accessors')

describe('PropertyAccessors', function () {
  let [TestClass, instance] = Array.from([])

  beforeEach(() => TestClass = (function () {
    TestClass = class TestClass {
      static initClass () {
        PropertyAccessors.includeInto(this)
      }
    }
    TestClass.initClass()
    return TestClass
  })())

  describe('.advisedAccessor', () => it('can run advice before setting/getting a property on a per-instance basis', function () {
    let getAdvice, setAdvice
    TestClass.prototype.advisedAccessor('foo', {
      set: (setAdvice = jasmine.createSpy('setAdvice')),
      get: (getAdvice = jasmine.createSpy('getAdvice'))
    }
    )

    const instance1 = new TestClass()
    const instance2 = new TestClass()

    instance1.foo = 3
    expect(setAdvice).toHaveBeenCalledWith(3, undefined)

    setAdvice.reset()
    instance2.foo = 5
    expect(setAdvice).toHaveBeenCalledWith(5, undefined)

    expect(instance1.foo).toBe(3)
    expect(instance2.foo).toBe(5)
    expect(getAdvice.callCount).toBe(2)

    setAdvice.reset()
    instance1.foo = 6
    return expect(setAdvice).toHaveBeenCalledWith(6, 3)
  }))

  return describe('.lazyAccessor', () => it('computes its value lazily on a per-instance basis', function () {
    let id = 1
    TestClass.prototype.lazyAccessor('foo', function () { return { id: id++, instance: this } })

    const instance1 = new TestClass()
    const instance2 = new TestClass()

    expect(instance1.foo).toEqual({ id: 1, instance: instance1 })
    expect(instance1.foo).toEqual({ id: 1, instance: instance1 })
    expect(instance2.foo).toEqual({ id: 2, instance: instance2 })
    expect(instance2.foo).toEqual({ id: 2, instance: instance2 })

    instance1.foo = 4
    return expect(instance1.foo).toBe(4)
  }))
})

/** @babel */
/* eslint-disable
    no-return-assign,
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const ScopedPropertyStore = require('../src/scoped-property-store')

describe('ScopedPropertyStore', function () {
  let store = null

  beforeEach(() => store = new ScopedPropertyStore())

  describe('::getPropertyValue(scopeChain, keyPath)', function () {
    it('returns the property with the most specific scope selector for the given scope chain', function () {
      store.addProperties('test', {
        '.c': { x: { y: 3 } },
        '.b .c': { x: { y: 2 } },
        '.a .b .c': { x: { y: 1 } },
        '.a .b .c.d': { x: { y: 0 } }
      })

      expect(store.getPropertyValue('.a .b .c.d', 'x.y')).toBe(0)
      expect(store.getPropertyValue('.a .b .c', 'x.y')).toBe(1)
      expect(store.getPropertyValue('.other .b .c', 'x.y')).toBe(2)
      return expect(store.getPropertyValue('.other .stuff .c', 'x.y')).toBe(3)
    })

    it('returns properties that match parent scopes if none match the exact scope', function () {
      store.addProperties('test', {
        '.a .b.c': { x: { y: 3 } },
        '.d.e': { x: { y: 2 } },
        '.f': { x: { y: 1 } }
      })

      expect(store.getPropertyValue('.a .b.c .d.e .f', 'x.y')).toBe(1)
      expect(store.getPropertyValue('.a .b.c .d.e .g', 'x.y')).toBe(2)
      expect(store.getPropertyValue('.a .b.c .d.x .g', 'x.y')).toBe(3)
      return expect(store.getPropertyValue('.y', 'x.y')).toBeUndefined()
    })

    it('deep-merges all values for the given key path', function () {
      store.addProperties('test1', { '.a': { t: { u: { v: 1 } } } })
      store.addProperties('test2', { '.a .b': { t: { u: { w: 2 } } } })
      store.addProperties('test3', { '.a .b .c': { t: { x: 3 } } })
      expect(store.getPropertyValue('.a .b .c', 't.u')).toEqual({ v: 1, w: 2 })
      expect(store.getPropertyValue('.a .b .c', 't')).toEqual({ u: { v: 1, w: 2 }, x: 3 })
      expect(store.getPropertyValue('.a .b .c', null)).toEqual({ t: { u: { v: 1, w: 2 }, x: 3 } })

      store.addProperties('test4', { '.a .b .c': { t: { u: false } } })
      expect(store.getPropertyValue('.a .b .c', 't.u')).toBe(false)
      expect(store.getPropertyValue('.a .b .c', 't')).toEqual({ u: false, x: 3 })
      expect(store.getPropertyValue('.a .b .c', null)).toEqual({ t: { u: false, x: 3 } })

      store.removePropertiesForSource('test3')
      expect(store.getPropertyValue('.a .b .c', 't')).toEqual({ u: false })

      store.addProperties('test5', { '.a .b .c': { t: null } })
      expect(store.getPropertyValue('.a .b .c', 't.u')).toEqual(undefined)
      expect(store.getPropertyValue('.a .b .c', 't')).toEqual(null)
      return expect(store.getPropertyValue('.a .b .c', null)).toEqual({ t: null })
    })

    it('favors the most recently added properties in the event of a specificity tie', function () {
      store.addProperties('test', { '.a.b .c': { x: 1 } })
      store.addProperties('test', { '.a .c.d': { x: 2 } })

      expect(store.getPropertyValue('.a.b .c.d', 'x')).toBe(2)
      return expect(store.getPropertyValue('.a.b .c', 'x')).toBe(1)
    })

    it('escapes non-whitespace combinators in the scope chain', function () {
      store.addProperties('test', {
        '.c\\+\\+': { a: 1 },
        '.c\\>': { a: 2 },
        '.c\\~': { a: 3 },
        '.c\\-': { a: 4 },
        '.c\\!': { a: 5 },
        '.c\\"': { a: 6 },
        '.c\\#': { a: 7 },
        '.c\\$': { a: 8 },
        '.c\\%': { a: 9 },
        '.c\\&': { a: 10 },
        '.c\\\'': { a: 11 },
        '.c\\*': { a: 12 },
        '.c\\,': { a: 13 },
        '.c\\/': { a: 14 },
        '.c\\:': { a: 15 },
        '.c\\;': { a: 16 },
        '.c\\=': { a: 17 },
        '.c\\?': { a: 18 },
        '.c\\@': { a: 19 },
        '.c\\|': { a: 20 },
        '.c\\^': { a: 21 },
        '.c\\(': { a: 22 },
        '.c\\)': { a: 23 },
        '.c\\<': { a: 24 },
        '.c\\{': { a: 25 },
        '.c\\}': { a: 26 },
        '.c\\[': { a: 27 },
        '.c\\]': { a: 28 }
      }
      )

      expect(store.getPropertyValue('.c++', 'a')).toBe(1)
      expect(store.getPropertyValue('.c>', 'a')).toBe(2)
      expect(store.getPropertyValue('.c~', 'a')).toBe(3)
      expect(store.getPropertyValue('.c-', 'a')).toBe(4)
      expect(store.getPropertyValue('.c!', 'a')).toBe(5)
      expect(store.getPropertyValue('.c"', 'a')).toBe(6)
      expect(store.getPropertyValue('.c#', 'a')).toBe(7)
      expect(store.getPropertyValue('.c$', 'a')).toBe(8)
      expect(store.getPropertyValue('.c%', 'a')).toBe(9)
      expect(store.getPropertyValue('.c&', 'a')).toBe(10)
      expect(store.getPropertyValue('.c\'', 'a')).toBe(11)
      expect(store.getPropertyValue('.c*', 'a')).toBe(12)
      expect(store.getPropertyValue('.c,', 'a')).toBe(13)
      expect(store.getPropertyValue('.c/', 'a')).toBe(14)
      expect(store.getPropertyValue('.c:', 'a')).toBe(15)
      expect(store.getPropertyValue('.c;', 'a')).toBe(16)
      expect(store.getPropertyValue('.c=', 'a')).toBe(17)
      expect(store.getPropertyValue('.c?', 'a')).toBe(18)
      expect(store.getPropertyValue('.c@', 'a')).toBe(19)
      expect(store.getPropertyValue('.c|', 'a')).toBe(20)
      expect(store.getPropertyValue('.c^', 'a')).toBe(21)
      expect(store.getPropertyValue('.c(', 'a')).toBe(22)
      expect(store.getPropertyValue('.c)', 'a')).toBe(23)
      expect(store.getPropertyValue('.c<', 'a')).toBe(24)
      expect(store.getPropertyValue('.c{', 'a')).toBe(25)
      expect(store.getPropertyValue('.c}', 'a')).toBe(26)
      expect(store.getPropertyValue('.c[', 'a')).toBe(27)
      expect(store.getPropertyValue('.c]', 'a')).toBe(28)
      return expect(store.getPropertyValue('()', 'a')).toBeUndefined()
    })

    describe('when priority option is used to add properties', () => it('returns the property with the highest priority', function () {
      store.addProperties('test1', { '.a.b': { x: { y: 1 } } }, { priority: 100 })
      store.addProperties('test2', { '.a.b': { x: { y: 2 } } })
      store.addProperties('test3', { '.a.b': { x: { y: 3 } } })

      return expect(store.getPropertyValue('.a.b', 'x.y')).toBe(1)
    }))

    describe("when the 'sources' option is provided", () => it('returns property values from the specified source', function () {
      store.addProperties('test1', { '.a.b': { x: { y: 1 } } })
      store.addProperties('test2', { '.a.b': { x: { y: 2 } } })
      store.addProperties('test3', { '.a.b': { x: { y: 3 } } })

      expect(store.getPropertyValue('.a.b', 'x.y', { sources: ['test1'] })).toBe(1)
      return expect(store.getPropertyValue('.a.b', 'x.y')).toBe(3)
    })) // shouldn't cache the previous call

    return describe("when the 'excludeSources' options is used", () => it('returns properties set on sources excluding the source secified', function () {
      store.addProperties('test1', { '.a.b': { x: { y: 1 } } })
      store.addProperties('test2', { '.a.b': { x: { y: 2 } } })
      store.addProperties('test3', { '.a.b': { x: { y: 3 } } })

      expect(store.getPropertyValue('.a.b', 'x.y', { excludeSources: ['test3'] })).toBe(2)
      return expect(store.getPropertyValue('.a.b', 'x.y')).toBe(3)
    }))
  }) // shouldn't cache the previous call

  describe('::getAll(scopeChain, keyPath, {sources, excludeSources})', function () {
    it('returns all of the values for the key-path, together with their scope selector', function () {
      store.addProperties('test', {
        '.c.d.e': { x: { y: 100 } },
        '.c': { x: { y: 3 } },
        '.b .c': { x: { y: 2 } },
        '.a .b .c': { x: { y: 1 } },
        '.a .b .c.d': { x: { y: 0 } },
        '.a': { x: { y: 5 } },
        '.b': { x: { y: 4 } }
      })

      return expect(store.getAll('.a .b .c.d', 'x.y')).toEqual([
        { scopeSelector: '.a .b .c.d', value: 0 },
        { scopeSelector: '.a .b .c', value: 1 },
        { scopeSelector: '.b .c', value: 2 },
        { scopeSelector: '.c', value: 3 },
        { scopeSelector: '.b', value: 4 },
        { scopeSelector: '.a', value: 5 }
      ])
    })

    return it("respects the 'sources' and 'excludeSources' options", function () {
      store.addProperties('test1', {
        '.c.d.e': { x: { y: 100 } },
        '.c': { x: { y: 3 } },
        '.b .c': { x: { y: 2 } }
      })

      store.addProperties('test2', {
        '.a .b .c': { x: { y: 1 } },
        '.a .b .c.d': { x: { y: 0 } },
        '.a': { x: { y: 5 } },
        '.b': { x: { y: 4 } }
      })

      expect(store.getAll('.a .b .c.d', 'x.y', { sources: ['test1'] })).toEqual([
        { scopeSelector: '.b .c', value: 2 },
        { scopeSelector: '.c', value: 3 }
      ])
      return expect(store.getAll('.a .b .c.d', 'x.y', { excludeSources: ['test2'] })).toEqual([
        { scopeSelector: '.b .c', value: 2 },
        { scopeSelector: '.c', value: 3 }
      ])
    })
  })

  describe('removing properties', function () {
    describe('when ::removePropertiesForSource(source, selector) is used', () => it('removes properties previously added with ::addProperties', function () {
      store.addProperties('test1', { '.a.b': { x: 1 } })
      store.addProperties('test2', { '.a': { x: 2 } })

      expect(store.getPropertyValue('.a.b', 'x')).toBe(1)
      store.removePropertiesForSource('test1')
      return expect(store.getPropertyValue('.a.b', 'x')).toBe(2)
    }))

    describe('when ::removePropertiesForSourceAndSelector(source, selector) is used', () => it('removes properties previously added with ::addProperties', function () {
      store.addProperties('default', { '.a.b': { x: 1 } })
      store.addProperties('default', { '.a.b': { x: 2 } })
      store.addProperties('override', { '.a': { x: 3 } })
      store.addProperties('override', { '.a.b': { x: 4 } })

      expect(store.getPropertyValue('.a', 'x')).toBe(3)
      expect(store.getPropertyValue('.a.b', 'x')).toBe(4)
      store.removePropertiesForSourceAndSelector('override', '.b.a')
      expect(store.getPropertyValue('.a', 'x')).toBe(3)
      return expect(store.getPropertyValue('.a.b', 'x')).toBe(2)
    }))

    return describe('when Disposable::dispose() is used', () => it('removes properties previously added with ::addProperties', function () {
      const disposable1 = store.addProperties('test1', { '.a.b': { x: 1 } })
      const disposable2 = store.addProperties('test2', { '.a': { x: 2 } })

      expect(store.getPropertyValue('.a.b', 'x')).toBe(1)
      disposable1.dispose()
      expect(store.getPropertyValue('.a.b', 'x')).toBe(2)
      disposable2.dispose()
      return expect(store.getPropertyValue('.a.b', 'x')).toBeUndefined()
    }))
  })

  describe('::propertiesForSource(source)', function () {
    it('returns all the properties for a given source', function () {
      store.addProperties('a', { '.a.b': { x: 1 } })
      store.addProperties('b', { '.a': { x: 2 } })
      store.addProperties('b', { '.a.b': { y: 1 } })

      const properties = store.propertiesForSource('b')
      return expect(properties).toEqual({
        '.a': {
          x: 2
        },
        '.a.b': {
          y: 1
        }
      })
    })

    it('can compose properties when they have nested properties', function () {
      store.addProperties('b', { '.a.b': { foo: { bar: 'ruby' } } })
      store.addProperties('b', { '.a.b': { foo: { omg: 'wow' } } })

      return expect(store.propertiesForSource('b')).toEqual({
        '.a.b': {
          foo: {
            bar: 'ruby',
            omg: 'wow'
          }
        }
      })
    })

    it('can compose properties added at different times for matching keys', function () {
      store.addProperties('b', { '.a': { x: 2 } })
      store.addProperties('b', { '.a.b': { y: 1 } })
      store.addProperties('b', { '.a.b': { z: 3, y: 5 } })
      store.addProperties('b', { '.o.k': { y: 10 } })

      return expect(store.propertiesForSource('b')).toEqual({
        '.a': {
          x: 2
        },
        '.a.b': {
          y: 5,
          z: 3
        },
        '.k.o': {
          y: 10
        }
      })
    })

    return it('will break out composite selectors', function () {
      store.addProperties('b', { '.a, .a.b, .a.b.c': { x: 2 } })

      return expect(store.propertiesForSource('b')).toEqual({
        '.a': {
          x: 2
        },
        '.a.b': {
          x: 2
        },
        '.a.b.c': {
          x: 2
        }
      })
    })
  })

  describe('::propertiesForSourceAndSelector(source, selector)', function () {
    it('returns all the properties for a given source', function () {
      store.addProperties('a', { '.a.b': { x: 1 } })
      store.addProperties('b', { '.a': { x: 2 } })
      store.addProperties('b', { '.a.b': { y: 1 } })

      const properties = store.propertiesForSourceAndSelector('b', '.b.a')
      return expect(properties).toEqual({ y: 1 })
    })

    return it('can compose properties added at different times for matching keys', function () {
      store.addProperties('b', { '.a': { x: 2 } })
      store.addProperties('b', { '.o.k': { y: 1 } })
      store.addProperties('b', { '.o.k': { z: 3, y: 5 } })
      store.addProperties('b', { '.a.b': { y: 10 } })

      return expect(store.propertiesForSourceAndSelector('b', '.o.k')).toEqual({ y: 5, z: 3 })
    })
  })

  return describe('::propertiesForSourceAndSelector(source, selector)', function () {
    it('returns all the properties for a given source', function () {
      store.addProperties('a', { '.a.b': { x: 1 } })
      store.addProperties('b', { '.a': { x: 2 } })
      store.addProperties('b', { '.a.b': { y: 1 } })

      const properties = store.propertiesForSelector('.b.a')
      return expect(properties).toEqual({ x: 1, y: 1 })
    })

    return it('can compose properties added at different times for matching keys', function () {
      store.addProperties('b', { '.a': { x: 2 } })
      store.addProperties('b', { '.o.k': { y: 1 } })
      store.addProperties('a', { '.o.k': { z: 3, y: 5 } })
      store.addProperties('b', { '.a.b': { y: 10 } })

      return expect(store.propertiesForSelector('.o.k')).toEqual({ y: 5, z: 3 })
    })
  })
})

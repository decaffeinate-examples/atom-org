/** @babel */
/* eslint-disable
    no-return-assign,
    no-undef,
    no-unused-vars,
    prefer-promise-reject-errors,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const path = require('path')
const temp = require('temp').track()
let CSON = require('season')
const fs = require('fs-plus')

describe('Config', function () {
  let dotAtomPath = null

  beforeEach(function () {
    spyOn(atom.config, 'load')
    spyOn(atom.config, 'save')
    spyOn(console, 'warn')
    dotAtomPath = temp.path('atom-spec-config')
    atom.config.configDirPath = dotAtomPath
    atom.config.enablePersistence = true
    return atom.config.configFilePath = path.join(atom.config.configDirPath, 'atom.config.cson')
  })

  afterEach(function () {
    atom.config.enablePersistence = false
    return fs.removeSync(dotAtomPath)
  })

  describe('.get(keyPath, {scope, sources, excludeSources})', function () {
    it("allows a key path's value to be read", function () {
      expect(atom.config.set('foo.bar.baz', 42)).toBe(true)
      expect(atom.config.get('foo.bar.baz')).toBe(42)
      return expect(atom.config.get('foo.quux')).toBeUndefined()
    })

    it("returns a deep clone of the key path's value", function () {
      atom.config.set('value', { array: [1, { b: 2 }, 3] })
      const retrievedValue = atom.config.get('value')
      retrievedValue.array[0] = 4
      retrievedValue.array[1].b = 2.1
      return expect(atom.config.get('value')).toEqual({ array: [1, { b: 2 }, 3] })
    })

    it('merges defaults into the returned value if both the assigned value and the default value are objects', function () {
      atom.config.setDefaults('foo.bar', { baz: 1, ok: 2 })
      atom.config.set('foo.bar', { baz: 3 })
      expect(atom.config.get('foo.bar')).toEqual({ baz: 3, ok: 2 })

      atom.config.setDefaults('other', { baz: 1 })
      atom.config.set('other', 7)
      expect(atom.config.get('other')).toBe(7)

      atom.config.set('bar.baz', { a: 3 })
      atom.config.setDefaults('bar', { baz: 7 })
      return expect(atom.config.get('bar.baz')).toEqual({ a: 3 })
    })

    describe("when a 'sources' option is specified", () => it('only retrieves values from the specified sources', function () {
      atom.config.set('x.y', 1, { scopeSelector: '.foo', source: 'a' })
      atom.config.set('x.y', 2, { scopeSelector: '.foo', source: 'b' })
      atom.config.set('x.y', 3, { scopeSelector: '.foo', source: 'c' })
      atom.config.setSchema('x.y', { type: 'integer', default: 4 })

      expect(atom.config.get('x.y', { sources: ['a'], scope: ['.foo'] })).toBe(1)
      expect(atom.config.get('x.y', { sources: ['b'], scope: ['.foo'] })).toBe(2)
      expect(atom.config.get('x.y', { sources: ['c'], scope: ['.foo'] })).toBe(3)
      // Schema defaults never match a specific source. We could potentially add a special "schema" source.
      expect(atom.config.get('x.y', { sources: ['x'], scope: ['.foo'] })).toBeUndefined()

      return expect(atom.config.get(null, { sources: ['a'], scope: ['.foo'] }).x.y).toBe(1)
    }))

    describe("when an 'excludeSources' option is specified", () => it('only retrieves values from the specified sources', function () {
      atom.config.set('x.y', 0)
      atom.config.set('x.y', 1, { scopeSelector: '.foo', source: 'a' })
      atom.config.set('x.y', 2, { scopeSelector: '.foo', source: 'b' })
      atom.config.set('x.y', 3, { scopeSelector: '.foo', source: 'c' })
      atom.config.setSchema('x.y', { type: 'integer', default: 4 })

      expect(atom.config.get('x.y', { excludeSources: ['a'], scope: ['.foo'] })).toBe(3)
      expect(atom.config.get('x.y', { excludeSources: ['c'], scope: ['.foo'] })).toBe(2)
      expect(atom.config.get('x.y', { excludeSources: ['b', 'c'], scope: ['.foo'] })).toBe(1)
      expect(atom.config.get('x.y', { excludeSources: ['b', 'c', 'a'], scope: ['.foo'] })).toBe(0)
      expect(atom.config.get('x.y', { excludeSources: ['b', 'c', 'a', atom.config.getUserConfigPath()], scope: ['.foo'] })).toBe(4)
      return expect(atom.config.get('x.y', { excludeSources: [atom.config.getUserConfigPath()] })).toBe(4)
    }))

    return describe("when a 'scope' option is given", function () {
      it('returns the property with the most specific scope selector', function () {
        atom.config.set('foo.bar.baz', 42, { scopeSelector: '.source.coffee .string.quoted.double.coffee' })
        atom.config.set('foo.bar.baz', 22, { scopeSelector: '.source .string.quoted.double' })
        atom.config.set('foo.bar.baz', 11, { scopeSelector: '.source' })

        expect(atom.config.get('foo.bar.baz', { scope: ['.source.coffee', '.string.quoted.double.coffee'] })).toBe(42)
        expect(atom.config.get('foo.bar.baz', { scope: ['.source.js', '.string.quoted.double.js'] })).toBe(22)
        expect(atom.config.get('foo.bar.baz', { scope: ['.source.js', '.variable.assignment.js'] })).toBe(11)
        return expect(atom.config.get('foo.bar.baz', { scope: ['.text'] })).toBeUndefined()
      })

      it('favors the most recently added properties in the event of a specificity tie', function () {
        atom.config.set('foo.bar.baz', 42, { scopeSelector: '.source.coffee .string.quoted.single' })
        atom.config.set('foo.bar.baz', 22, { scopeSelector: '.source.coffee .string.quoted.double' })

        expect(atom.config.get('foo.bar.baz', { scope: ['.source.coffee', '.string.quoted.single'] })).toBe(42)
        return expect(atom.config.get('foo.bar.baz', { scope: ['.source.coffee', '.string.quoted.single.double'] })).toBe(22)
      })

      describe('when there are global defaults', () => it('falls back to the global when there is no scoped property specified', function () {
        atom.config.setDefaults('foo', { hasDefault: 'ok' })
        return expect(atom.config.get('foo.hasDefault', { scope: ['.source.coffee', '.string.quoted.single'] })).toBe('ok')
      }))

      return describe('when package settings are added after user settings', () => it("returns the user's setting because the user's setting has higher priority", function () {
        atom.config.set('foo.bar.baz', 100, { scopeSelector: '.source.coffee' })
        atom.config.set('foo.bar.baz', 1, { scopeSelector: '.source.coffee', source: 'some-package' })
        return expect(atom.config.get('foo.bar.baz', { scope: ['.source.coffee'] })).toBe(100)
      }))
    })
  })

  describe('.getAll(keyPath, {scope, sources, excludeSources})', function () {
    it('reads all of the values for a given key-path', function () {
      expect(atom.config.set('foo', 41)).toBe(true)
      expect(atom.config.set('foo', 43, { scopeSelector: '.a .b' })).toBe(true)
      expect(atom.config.set('foo', 42, { scopeSelector: '.a' })).toBe(true)
      expect(atom.config.set('foo', 44, { scopeSelector: '.a .b.c' })).toBe(true)

      expect(atom.config.set('foo', -44, { scopeSelector: '.d' })).toBe(true)

      return expect(atom.config.getAll('foo', { scope: ['.a', '.b.c'] })).toEqual([
        { scopeSelector: '.a .b.c', value: 44 },
        { scopeSelector: '.a .b', value: 43 },
        { scopeSelector: '.a', value: 42 },
        { scopeSelector: '*', value: 41 }
      ])
    })

    return it("includes the schema's default value", function () {
      atom.config.setSchema('foo', { type: 'number', default: 40 })
      expect(atom.config.set('foo', 43, { scopeSelector: '.a .b' })).toBe(true)
      return expect(atom.config.getAll('foo', { scope: ['.a', '.b.c'] })).toEqual([
        { scopeSelector: '.a .b', value: 43 },
        { scopeSelector: '*', value: 40 }
      ])
    })
  })

  describe('.set(keyPath, value, {source, scopeSelector})', function () {
    it("allows a key path's value to be written", function () {
      expect(atom.config.set('foo.bar.baz', 42)).toBe(true)
      return expect(atom.config.get('foo.bar.baz')).toBe(42)
    })

    it("saves the user's config to disk after it stops changing", function () {
      atom.config.set('foo.bar.baz', 42)
      advanceClock(50)
      expect(atom.config.save).not.toHaveBeenCalled()
      atom.config.set('foo.bar.baz', 43)
      advanceClock(50)
      expect(atom.config.save).not.toHaveBeenCalled()
      atom.config.set('foo.bar.baz', 44)
      advanceClock(150)
      return expect(atom.config.save).toHaveBeenCalled()
    })

    it("does not save when a non-default 'source' is given", function () {
      atom.config.set('foo.bar.baz', 42, { source: 'some-other-source', scopeSelector: '.a' })
      advanceClock(500)
      return expect(atom.config.save).not.toHaveBeenCalled()
    })

    it("does not allow a 'source' option without a 'scopeSelector'", () => expect(() => atom.config.set('foo', 1, { source: ['.source.ruby'] })).toThrow())

    describe('when the key-path is null', () => it('sets the root object', function () {
      expect(atom.config.set(null, { editor: { tabLength: 6 } })).toBe(true)
      expect(atom.config.get('editor.tabLength')).toBe(6)
      expect(atom.config.set(null, { editor: { tabLength: 8, scopeSelector: ['.source.js'] } })).toBe(true)
      return expect(atom.config.get('editor.tabLength', { scope: ['.source.js'] })).toBe(8)
    }))

    describe('when the value equals the default value', () => it("does not store the value in the user's config", function () {
      atom.config.setSchema('foo', {
        type: 'object',
        properties: {
          same: {
            type: 'number',
            default: 1
          },
          changes: {
            type: 'number',
            default: 1
          },
          sameArray: {
            type: 'array',
            default: [1, 2, 3]
          },
          sameObject: {
            type: 'object',
            default: { a: 1, b: 2 }
          },
          null: {
            type: '*',
            default: null
          },
          undefined: {
            type: '*',
            default: undefined
          }
        }
      }
      )
      expect(atom.config.settings.foo).toBeUndefined()

      atom.config.set('foo.same', 1)
      atom.config.set('foo.changes', 2)
      atom.config.set('foo.sameArray', [1, 2, 3])
      atom.config.set('foo.null', undefined)
      atom.config.set('foo.undefined', null)
      atom.config.set('foo.sameObject', { b: 2, a: 1 })

      const userConfigPath = atom.config.getUserConfigPath()

      expect(atom.config.get('foo.same', { sources: [userConfigPath] })).toBeUndefined()

      expect(atom.config.get('foo.changes')).toBe(2)
      expect(atom.config.get('foo.changes', { sources: [userConfigPath] })).toBe(2)

      atom.config.set('foo.changes', 1)
      return expect(atom.config.get('foo.changes', { sources: [userConfigPath] })).toBeUndefined()
    }))

    return describe("when a 'scopeSelector' is given", () => it('sets the value and overrides the others', function () {
      atom.config.set('foo.bar.baz', 42, { scopeSelector: '.source.coffee .string.quoted.double.coffee' })
      atom.config.set('foo.bar.baz', 22, { scopeSelector: '.source .string.quoted.double' })
      atom.config.set('foo.bar.baz', 11, { scopeSelector: '.source' })

      expect(atom.config.get('foo.bar.baz', { scope: ['.source.coffee', '.string.quoted.double.coffee'] })).toBe(42)

      expect(atom.config.set('foo.bar.baz', 100, { scopeSelector: '.source.coffee .string.quoted.double.coffee' })).toBe(true)
      return expect(atom.config.get('foo.bar.baz', { scope: ['.source.coffee', '.string.quoted.double.coffee'] })).toBe(100)
    }))
  })

  describe('.unset(keyPath, {source, scopeSelector})', function () {
    beforeEach(() => atom.config.setSchema('foo', {
      type: 'object',
      properties: {
        bar: {
          type: 'object',
          properties: {
            baz: {
              type: 'integer',
              default: 0
            },
            ok: {
              type: 'integer',
              default: 0
            }
          }
        },
        quux: {
          type: 'integer',
          default: 0
        }
      }
    }
    ))

    it('sets the value of the key path to its default', function () {
      atom.config.setDefaults('a', { b: 3 })
      atom.config.set('a.b', 4)
      expect(atom.config.get('a.b')).toBe(4)
      atom.config.unset('a.b')
      expect(atom.config.get('a.b')).toBe(3)

      atom.config.set('a.c', 5)
      expect(atom.config.get('a.c')).toBe(5)
      atom.config.unset('a.c')
      return expect(atom.config.get('a.c')).toBeUndefined()
    })

    it('calls ::save()', function () {
      atom.config.setDefaults('a', { b: 3 })
      atom.config.set('a.b', 4)
      atom.config.save.reset()

      atom.config.unset('a.c')
      advanceClock(500)
      return expect(atom.config.save.callCount).toBe(1)
    })

    describe("when no 'scopeSelector' is given", function () {
      describe("when a 'source' but no key-path is given", () => it('removes all scoped settings with the given source', function () {
        atom.config.set('foo.bar.baz', 1, { scopeSelector: '.a', source: 'source-a' })
        atom.config.set('foo.bar.quux', 2, { scopeSelector: '.b', source: 'source-a' })
        expect(atom.config.get('foo.bar', { scope: ['.a.b'] })).toEqual({ baz: 1, quux: 2 })

        atom.config.unset(null, { source: 'source-a' })
        return expect(atom.config.get('foo.bar', { scope: ['.a'] })).toEqual({ baz: 0, ok: 0 })
      }))

      describe("when a 'source' and a key-path is given", () => it('removes all scoped settings with the given source and key-path', function () {
        atom.config.set('foo.bar.baz', 1)
        atom.config.set('foo.bar.baz', 2, { scopeSelector: '.a', source: 'source-a' })
        atom.config.set('foo.bar.baz', 3, { scopeSelector: '.a.b', source: 'source-b' })
        expect(atom.config.get('foo.bar.baz', { scope: ['.a.b'] })).toEqual(3)

        atom.config.unset('foo.bar.baz', { source: 'source-b' })
        expect(atom.config.get('foo.bar.baz', { scope: ['.a.b'] })).toEqual(2)
        return expect(atom.config.get('foo.bar.baz')).toEqual(1)
      }))

      return describe("when no 'source' is given", () => it('removes all scoped and unscoped properties for that key-path', function () {
        atom.config.setDefaults('foo.bar', { baz: 100 })

        atom.config.set('foo.bar', { baz: 1, ok: 2 }, { scopeSelector: '.a' })
        atom.config.set('foo.bar', { baz: 11, ok: 12 }, { scopeSelector: '.b' })
        atom.config.set('foo.bar', { baz: 21, ok: 22 })

        atom.config.unset('foo.bar.baz')

        expect(atom.config.get('foo.bar.baz', { scope: ['.a'] })).toBe(100)
        expect(atom.config.get('foo.bar.baz', { scope: ['.b'] })).toBe(100)
        expect(atom.config.get('foo.bar.baz')).toBe(100)

        expect(atom.config.get('foo.bar.ok', { scope: ['.a'] })).toBe(2)
        expect(atom.config.get('foo.bar.ok', { scope: ['.b'] })).toBe(12)
        return expect(atom.config.get('foo.bar.ok')).toBe(22)
      }))
    })

    return describe("when a 'scopeSelector' is given", function () {
      it('restores the global default when no scoped default set', function () {
        atom.config.setDefaults('foo', { bar: { baz: 10 } })
        atom.config.set('foo.bar.baz', 55, { scopeSelector: '.source.coffee' })
        expect(atom.config.get('foo.bar.baz', { scope: ['.source.coffee'] })).toBe(55)

        atom.config.unset('foo.bar.baz', { scopeSelector: '.source.coffee' })
        return expect(atom.config.get('foo.bar.baz', { scope: ['.source.coffee'] })).toBe(10)
      })

      it('restores the scoped default when a scoped default is set', function () {
        atom.config.setDefaults('foo', { bar: { baz: 10 } })
        atom.config.set('foo.bar.baz', 42, { scopeSelector: '.source.coffee', source: 'some-source' })
        atom.config.set('foo.bar.baz', 55, { scopeSelector: '.source.coffee' })
        atom.config.set('foo.bar.ok', 100, { scopeSelector: '.source.coffee' })
        expect(atom.config.get('foo.bar.baz', { scope: ['.source.coffee'] })).toBe(55)

        atom.config.unset('foo.bar.baz', { scopeSelector: '.source.coffee' })
        expect(atom.config.get('foo.bar.baz', { scope: ['.source.coffee'] })).toBe(42)
        return expect(atom.config.get('foo.bar.ok', { scope: ['.source.coffee'] })).toBe(100)
      })

      it('calls ::save()', function () {
        atom.config.setDefaults('foo', { bar: { baz: 10 } })
        atom.config.set('foo.bar.baz', 55, { scopeSelector: '.source.coffee' })
        atom.config.save.reset()

        atom.config.unset('foo.bar.baz', { scopeSelector: '.source.coffee' })
        advanceClock(150)
        return expect(atom.config.save.callCount).toBe(1)
      })

      it('allows removing settings for a specific source and scope selector', function () {
        atom.config.set('foo.bar.baz', 55, { scopeSelector: '.source.coffee', source: 'source-a' })
        atom.config.set('foo.bar.baz', 65, { scopeSelector: '.source.coffee', source: 'source-b' })
        expect(atom.config.get('foo.bar.baz', { scope: ['.source.coffee'] })).toBe(65)

        atom.config.unset('foo.bar.baz', { source: 'source-b', scopeSelector: '.source.coffee' })
        return expect(atom.config.get('foo.bar.baz', { scope: ['.source.coffee', '.string'] })).toBe(55)
      })

      it('allows removing all settings for a specific source', function () {
        atom.config.set('foo.bar.baz', 55, { scopeSelector: '.source.coffee', source: 'source-a' })
        atom.config.set('foo.bar.baz', 65, { scopeSelector: '.source.coffee', source: 'source-b' })
        atom.config.set('foo.bar.ok', 65, { scopeSelector: '.source.coffee', source: 'source-b' })
        expect(atom.config.get('foo.bar.baz', { scope: ['.source.coffee'] })).toBe(65)

        atom.config.unset(null, { source: 'source-b', scopeSelector: '.source.coffee' })
        expect(atom.config.get('foo.bar.baz', { scope: ['.source.coffee', '.string'] })).toBe(55)
        return expect(atom.config.get('foo.bar.ok', { scope: ['.source.coffee', '.string'] })).toBe(0)
      })

      it('does not call ::save or add a scoped property when no value has been set', function () {
        // see https://github.com/atom/atom/issues/4175
        atom.config.setDefaults('foo', { bar: { baz: 10 } })
        atom.config.unset('foo.bar.baz', { scopeSelector: '.source.coffee' })
        expect(atom.config.get('foo.bar.baz', { scope: ['.source.coffee'] })).toBe(10)

        expect(atom.config.save).not.toHaveBeenCalled()

        const scopedProperties = atom.config.scopedSettingsStore.propertiesForSource('user-config')
        return expect(scopedProperties['.coffee.source']).toBeUndefined()
      })

      it('removes the scoped value when it was the only set value on the object', function () {
        spyOn(CSON, 'writeFileSync')
        atom.config.save.andCallThrough()

        atom.config.setDefaults('foo', { bar: { baz: 10 } })
        atom.config.set('foo.bar.baz', 55, { scopeSelector: '.source.coffee' })
        atom.config.set('foo.bar.ok', 20, { scopeSelector: '.source.coffee' })
        expect(atom.config.get('foo.bar.baz', { scope: ['.source.coffee'] })).toBe(55)

        advanceClock(150)
        CSON.writeFileSync.reset()

        atom.config.unset('foo.bar.baz', { scopeSelector: '.source.coffee' })
        expect(atom.config.get('foo.bar.baz', { scope: ['.source.coffee'] })).toBe(10)
        expect(atom.config.get('foo.bar.ok', { scope: ['.source.coffee'] })).toBe(20)

        advanceClock(150)
        expect(CSON.writeFileSync).toHaveBeenCalled()
        let properties = CSON.writeFileSync.mostRecentCall.args[1]
        expect(properties['.coffee.source']).toEqual({
          foo: {
            bar: {
              ok: 20
            }
          }
        })
        CSON.writeFileSync.reset()

        atom.config.unset('foo.bar.ok', { scopeSelector: '.source.coffee' })

        advanceClock(150)
        expect(CSON.writeFileSync).toHaveBeenCalled()
        properties = CSON.writeFileSync.mostRecentCall.args[1]
        return expect(properties['.coffee.source']).toBeUndefined()
      })

      return it('does not call ::save when the value is already at the default', function () {
        atom.config.setDefaults('foo', { bar: { baz: 10 } })
        atom.config.set('foo.bar.baz', 55)
        atom.config.save.reset()

        atom.config.unset('foo.bar.ok', { scopeSelector: '.source.coffee' })
        expect(atom.config.save).not.toHaveBeenCalled()
        return expect(atom.config.get('foo.bar.baz', { scope: ['.source.coffee'] })).toBe(55)
      })
    })
  })

  describe('.onDidChange(keyPath, {scope})', function () {
    let [observeHandler, observeSubscription] = Array.from([])

    describe('when a keyPath is specified', function () {
      beforeEach(function () {
        observeHandler = jasmine.createSpy('observeHandler')
        atom.config.set('foo.bar.baz', 'value 1')
        return observeSubscription = atom.config.onDidChange('foo.bar.baz', observeHandler)
      })

      it('does not fire the given callback with the current value at the keypath', () => expect(observeHandler).not.toHaveBeenCalled())

      return it('fires the callback every time the observed value changes', function () {
        atom.config.set('foo.bar.baz', 'value 2')
        expect(observeHandler).toHaveBeenCalledWith({ newValue: 'value 2', oldValue: 'value 1' })
        observeHandler.reset()

        observeHandler.andCallFake(function () { throw new Error('oops') })
        expect(() => atom.config.set('foo.bar.baz', 'value 1')).toThrow('oops')
        expect(observeHandler).toHaveBeenCalledWith({ newValue: 'value 1', oldValue: 'value 2' })
        observeHandler.reset()

        // Regression: exception in earlier handler shouldn't put observer
        // into a bad state.
        atom.config.set('something.else', 'new value')
        return expect(observeHandler).not.toHaveBeenCalled()
      })
    })

    describe('when a keyPath is not specified', function () {
      beforeEach(function () {
        observeHandler = jasmine.createSpy('observeHandler')
        atom.config.set('foo.bar.baz', 'value 1')
        return observeSubscription = atom.config.onDidChange(observeHandler)
      })

      it('does not fire the given callback initially', () => expect(observeHandler).not.toHaveBeenCalled())

      return it('fires the callback every time any value changes', function () {
        observeHandler.reset() // clear the initial call
        atom.config.set('foo.bar.baz', 'value 2')
        expect(observeHandler).toHaveBeenCalled()
        expect(observeHandler.mostRecentCall.args[0].newValue.foo.bar.baz).toBe('value 2')
        expect(observeHandler.mostRecentCall.args[0].oldValue.foo.bar.baz).toBe('value 1')

        observeHandler.reset()
        atom.config.set('foo.bar.baz', 'value 1')
        expect(observeHandler).toHaveBeenCalled()
        expect(observeHandler.mostRecentCall.args[0].newValue.foo.bar.baz).toBe('value 1')
        expect(observeHandler.mostRecentCall.args[0].oldValue.foo.bar.baz).toBe('value 2')

        observeHandler.reset()
        atom.config.set('foo.bar.int', 1)
        expect(observeHandler).toHaveBeenCalled()
        expect(observeHandler.mostRecentCall.args[0].newValue.foo.bar.int).toBe(1)
        return expect(observeHandler.mostRecentCall.args[0].oldValue.foo.bar.int).toBe(undefined)
      })
    })

    return describe("when a 'scope' is given", () => it('calls the supplied callback when the value at the descriptor/keypath changes', function () {
      const changeSpy = jasmine.createSpy('onDidChange callback')
      atom.config.onDidChange('foo.bar.baz', { scope: ['.source.coffee', '.string.quoted.double.coffee'] }, changeSpy)

      atom.config.set('foo.bar.baz', 12)
      expect(changeSpy).toHaveBeenCalledWith({ oldValue: undefined, newValue: 12 })
      changeSpy.reset()

      atom.config.set('foo.bar.baz', 22, { scopeSelector: '.source .string.quoted.double', source: 'a' })
      expect(changeSpy).toHaveBeenCalledWith({ oldValue: 12, newValue: 22 })
      changeSpy.reset()

      atom.config.set('foo.bar.baz', 42, { scopeSelector: '.source.coffee .string.quoted.double.coffee', source: 'b' })
      expect(changeSpy).toHaveBeenCalledWith({ oldValue: 22, newValue: 42 })
      changeSpy.reset()

      atom.config.unset(null, { scopeSelector: '.source.coffee .string.quoted.double.coffee', source: 'b' })
      expect(changeSpy).toHaveBeenCalledWith({ oldValue: 42, newValue: 22 })
      changeSpy.reset()

      atom.config.unset(null, { scopeSelector: '.source .string.quoted.double', source: 'a' })
      expect(changeSpy).toHaveBeenCalledWith({ oldValue: 22, newValue: 12 })
      changeSpy.reset()

      atom.config.set('foo.bar.baz', undefined)
      expect(changeSpy).toHaveBeenCalledWith({ oldValue: 12, newValue: undefined })
      return changeSpy.reset()
    }))
  })

  describe('.observe(keyPath, {scope})', function () {
    let [observeHandler, observeSubscription] = Array.from([])

    beforeEach(function () {
      observeHandler = jasmine.createSpy('observeHandler')
      atom.config.set('foo.bar.baz', 'value 1')
      return observeSubscription = atom.config.observe('foo.bar.baz', observeHandler)
    })

    it('fires the given callback with the current value at the keypath', () => expect(observeHandler).toHaveBeenCalledWith('value 1'))

    it('fires the callback every time the observed value changes', function () {
      observeHandler.reset() // clear the initial call
      atom.config.set('foo.bar.baz', 'value 2')
      expect(observeHandler).toHaveBeenCalledWith('value 2')

      observeHandler.reset()
      atom.config.set('foo.bar.baz', 'value 1')
      expect(observeHandler).toHaveBeenCalledWith('value 1')
      advanceClock(100) // complete pending save that was requested in ::set

      observeHandler.reset()
      atom.config.loadUserConfig()
      return expect(observeHandler).toHaveBeenCalledWith(undefined)
    })

    it('fires the callback when the observed value is deleted', function () {
      observeHandler.reset() // clear the initial call
      atom.config.set('foo.bar.baz', undefined)
      return expect(observeHandler).toHaveBeenCalledWith(undefined)
    })

    it('fires the callback when the full key path goes into and out of existence', function () {
      observeHandler.reset() // clear the initial call
      atom.config.set('foo.bar', undefined)
      expect(observeHandler).toHaveBeenCalledWith(undefined)

      observeHandler.reset()
      atom.config.set('foo.bar.baz', "i'm back")
      return expect(observeHandler).toHaveBeenCalledWith("i'm back")
    })

    it('does not fire the callback once the subscription is disposed', function () {
      observeHandler.reset() // clear the initial call
      observeSubscription.dispose()
      atom.config.set('foo.bar.baz', 'value 2')
      return expect(observeHandler).not.toHaveBeenCalled()
    })

    it('does not fire the callback for a similarly named keyPath', function () {
      const bazCatHandler = jasmine.createSpy('bazCatHandler')
      observeSubscription = atom.config.observe('foo.bar.bazCat', bazCatHandler)

      bazCatHandler.reset()
      atom.config.set('foo.bar.baz', 'value 10')
      return expect(bazCatHandler).not.toHaveBeenCalled()
    })

    return describe("when a 'scope' is given", function () {
      let otherHandler = null

      beforeEach(function () {
        observeSubscription.dispose()
        return otherHandler = jasmine.createSpy('otherHandler')
      })

      it('allows settings to be observed in a specific scope', function () {
        atom.config.observe('foo.bar.baz', { scope: ['.some.scope'] }, observeHandler)
        atom.config.observe('foo.bar.baz', { scope: ['.another.scope'] }, otherHandler)

        atom.config.set('foo.bar.baz', 'value 2', { scopeSelector: '.some' })
        expect(observeHandler).toHaveBeenCalledWith('value 2')
        return expect(otherHandler).not.toHaveBeenCalledWith('value 2')
      })

      return it('calls the callback when properties with more specific selectors are removed', function () {
        const changeSpy = jasmine.createSpy()
        atom.config.observe('foo.bar.baz', { scope: ['.source.coffee', '.string.quoted.double.coffee'] }, changeSpy)
        expect(changeSpy).toHaveBeenCalledWith('value 1')
        changeSpy.reset()

        atom.config.set('foo.bar.baz', 12)
        expect(changeSpy).toHaveBeenCalledWith(12)
        changeSpy.reset()

        atom.config.set('foo.bar.baz', 22, { scopeSelector: '.source .string.quoted.double', source: 'a' })
        expect(changeSpy).toHaveBeenCalledWith(22)
        changeSpy.reset()

        atom.config.set('foo.bar.baz', 42, { scopeSelector: '.source.coffee .string.quoted.double.coffee', source: 'b' })
        expect(changeSpy).toHaveBeenCalledWith(42)
        changeSpy.reset()

        atom.config.unset(null, { scopeSelector: '.source.coffee .string.quoted.double.coffee', source: 'b' })
        expect(changeSpy).toHaveBeenCalledWith(22)
        changeSpy.reset()

        atom.config.unset(null, { scopeSelector: '.source .string.quoted.double', source: 'a' })
        expect(changeSpy).toHaveBeenCalledWith(12)
        changeSpy.reset()

        atom.config.set('foo.bar.baz', undefined)
        expect(changeSpy).toHaveBeenCalledWith(undefined)
        return changeSpy.reset()
      })
    })
  })

  describe('.transact(callback)', function () {
    let changeSpy = null

    beforeEach(function () {
      changeSpy = jasmine.createSpy('onDidChange callback')
      return atom.config.onDidChange('foo.bar.baz', changeSpy)
    })

    it('allows only one change event for the duration of the given callback', function () {
      atom.config.transact(function () {
        atom.config.set('foo.bar.baz', 1)
        atom.config.set('foo.bar.baz', 2)
        return atom.config.set('foo.bar.baz', 3)
      })

      expect(changeSpy.callCount).toBe(1)
      return expect(changeSpy.argsForCall[0][0]).toEqual({ newValue: 3, oldValue: undefined })
    })

    return it('does not emit an event if no changes occur while paused', function () {
      atom.config.transact(function () {})
      return expect(changeSpy).not.toHaveBeenCalled()
    })
  })

  describe('.transactAsync(callback)', function () {
    let changeSpy = null

    beforeEach(function () {
      changeSpy = jasmine.createSpy('onDidChange callback')
      return atom.config.onDidChange('foo.bar.baz', changeSpy)
    })

    it('allows only one change event for the duration of the given promise if it gets resolved', function () {
      let promiseResult = null
      const transactionPromise = atom.config.transactAsync(function () {
        atom.config.set('foo.bar.baz', 1)
        atom.config.set('foo.bar.baz', 2)
        atom.config.set('foo.bar.baz', 3)
        return Promise.resolve('a result')
      })

      waitsForPromise(() => transactionPromise.then(r => promiseResult = r))

      return runs(function () {
        expect(promiseResult).toBe('a result')
        expect(changeSpy.callCount).toBe(1)
        return expect(changeSpy.argsForCall[0][0]).toEqual({ newValue: 3, oldValue: undefined })
      })
    })

    it('allows only one change event for the duration of the given promise if it gets rejected', function () {
      let promiseError = null
      const transactionPromise = atom.config.transactAsync(function () {
        atom.config.set('foo.bar.baz', 1)
        atom.config.set('foo.bar.baz', 2)
        atom.config.set('foo.bar.baz', 3)
        return Promise.reject('an error')
      })

      waitsForPromise(() => transactionPromise.catch(e => promiseError = e))

      return runs(function () {
        expect(promiseError).toBe('an error')
        expect(changeSpy.callCount).toBe(1)
        return expect(changeSpy.argsForCall[0][0]).toEqual({ newValue: 3, oldValue: undefined })
      })
    })

    return it('allows only one change event even when the given callback throws', function () {
      const error = new Error('Oops!')
      let promiseError = null
      const transactionPromise = atom.config.transactAsync(function () {
        atom.config.set('foo.bar.baz', 1)
        atom.config.set('foo.bar.baz', 2)
        atom.config.set('foo.bar.baz', 3)
        throw error
      })

      waitsForPromise(() => transactionPromise.catch(e => promiseError = e))

      return runs(function () {
        expect(promiseError).toBe(error)
        expect(changeSpy.callCount).toBe(1)
        return expect(changeSpy.argsForCall[0][0]).toEqual({ newValue: 3, oldValue: undefined })
      })
    })
  })

  describe('.getSources()', () => it("returns an array of all of the config's source names", function () {
    expect(atom.config.getSources()).toEqual([])

    atom.config.set('a.b', 1, { scopeSelector: '.x1', source: 'source-1' })
    atom.config.set('a.c', 1, { scopeSelector: '.x1', source: 'source-1' })
    atom.config.set('a.b', 2, { scopeSelector: '.x2', source: 'source-2' })
    atom.config.set('a.b', 1, { scopeSelector: '.x3', source: 'source-3' })

    return expect(atom.config.getSources()).toEqual([
      'source-1',
      'source-2',
      'source-3'
    ])
  }))

  return describe('Internal Methods', function () {
    describe('.save()', function () {
      CSON = require('season')

      beforeEach(function () {
        spyOn(CSON, 'writeFileSync')
        return jasmine.unspy(atom.config, 'save')
      })

      describe('when ~/.atom/config.json exists', function () {
        it('writes any non-default properties to ~/.atom/config.json', function () {
          atom.config.set('a.b.c', 1)
          atom.config.set('a.b.d', 2)
          atom.config.set('x.y.z', 3)
          atom.config.setDefaults('a.b', { e: 4, f: 5 })

          CSON.writeFileSync.reset()
          atom.config.save()

          expect(CSON.writeFileSync.argsForCall[0][0]).toBe(atom.config.configFilePath)
          const writtenConfig = CSON.writeFileSync.argsForCall[0][1]
          return expect(writtenConfig).toEqual({ '*': atom.config.settings })
        })

        return it('writes properties in alphabetical order', function () {
          let key
          atom.config.set('foo', 1)
          atom.config.set('bar', 2)
          atom.config.set('baz.foo', 3)
          atom.config.set('baz.bar', 4)

          CSON.writeFileSync.reset()
          atom.config.save()

          expect(CSON.writeFileSync.argsForCall[0][0]).toBe(atom.config.configFilePath)
          const writtenConfig = CSON.writeFileSync.argsForCall[0][1]
          expect(writtenConfig).toEqual({ '*': atom.config.settings })

          let expectedKeys = ['bar', 'baz', 'foo']
          let foundKeys = ((() => {
            const result = []
            for (key in writtenConfig['*']) {
              if (Array.from(expectedKeys).includes(key)) {
                result.push(key)
              }
            }
            return result
          })())
          expect(foundKeys).toEqual(expectedKeys)
          expectedKeys = ['bar', 'foo']
          foundKeys = ((() => {
            const result1 = []
            for (key in writtenConfig['*'].baz) {
              if (Array.from(expectedKeys).includes(key)) {
                result1.push(key)
              }
            }
            return result1
          })())
          return expect(foundKeys).toEqual(expectedKeys)
        })
      })

      describe("when ~/.atom/config.json doesn't exist", () => it('writes any non-default properties to ~/.atom/config.cson', function () {
        atom.config.set('a.b.c', 1)
        atom.config.set('a.b.d', 2)
        atom.config.set('x.y.z', 3)
        atom.config.setDefaults('a.b', { e: 4, f: 5 })

        CSON.writeFileSync.reset()
        atom.config.save()

        expect(CSON.writeFileSync.argsForCall[0][0]).toBe(path.join(atom.config.configDirPath, 'atom.config.cson'))
        const writtenConfig = CSON.writeFileSync.argsForCall[0][1]
        return expect(writtenConfig).toEqual({ '*': atom.config.settings })
      }))

      describe('when scoped settings are defined', () => it('writes out explicitly set config settings', function () {
        atom.config.set('foo.bar', 'ruby', { scopeSelector: '.source.ruby' })
        atom.config.set('foo.omg', 'wow', { scopeSelector: '.source.ruby' })
        atom.config.set('foo.bar', 'coffee', { scopeSelector: '.source.coffee' })

        CSON.writeFileSync.reset()
        atom.config.save()

        const writtenConfig = CSON.writeFileSync.argsForCall[0][1]
        return expect(writtenConfig).toEqualJson({
          '*':
            atom.config.settings,
          '.ruby.source': {
            foo: {
              bar: 'ruby',
              omg: 'wow'
            }
          },
          '.coffee.source': {
            foo: {
              bar: 'coffee'
            }
          }
        })
      }))

      return describe('when an error is thrown writing the file to disk', function () {
        let addErrorHandler = null
        beforeEach(() => atom.notifications.onDidAddNotification(addErrorHandler = jasmine.createSpy()))

        return it('creates a notification', function () {
          jasmine.unspy(CSON, 'writeFileSync')
          spyOn(CSON, 'writeFileSync').andCallFake(function () {
            const error = new Error()
            error.code = 'EPERM'
            error.path = atom.config.getUserConfigPath()
            throw error
          })

          const save = () => atom.config.save()
          expect(save).not.toThrow()
          return expect(addErrorHandler.callCount).toBe(1)
        })
      })
    })

    describe('.loadUserConfig()', function () {
      beforeEach(function () {
        expect(fs.existsSync(atom.config.configDirPath)).toBeFalsy()
        return atom.config.setSchema('foo', {
          type: 'object',
          properties: {
            bar: {
              type: 'string',
              default: 'def'
            },
            int: {
              type: 'integer',
              default: 12
            }
          }
        }
        )
      })

      afterEach(() => fs.removeSync(dotAtomPath))

      describe('when the config file contains scoped settings', function () {
        beforeEach(function () {
          fs.writeFileSync(atom.config.configFilePath, `\
'*':
  foo:
    bar: 'baz'

'.source.ruby':
  foo:
    bar: 'more-specific'\
`
          )
          return atom.config.loadUserConfig()
        })

        return it('updates the config data based on the file contents', function () {
          expect(atom.config.get('foo.bar')).toBe('baz')
          return expect(atom.config.get('foo.bar', { scope: ['.source.ruby'] })).toBe('more-specific')
        })
      })

      describe('when the config file does not conform to the schema', function () {
        beforeEach(() => fs.writeFileSync(atom.config.configFilePath, `\
'*':
foo:
  bar: 'omg'
  int: 'baz'
'.source.ruby':
foo:
  bar: 'scoped'
  int: 'nope'\
`
        ))

        return it('validates and does not load the incorrect values', function () {
          atom.config.loadUserConfig()
          expect(atom.config.get('foo.int')).toBe(12)
          expect(atom.config.get('foo.bar')).toBe('omg')
          expect(atom.config.get('foo.int', { scope: ['.source.ruby'] })).toBe(12)
          return expect(atom.config.get('foo.bar', { scope: ['.source.ruby'] })).toBe('scoped')
        })
      })

      describe('when the config file contains valid cson', function () {
        beforeEach(() => fs.writeFileSync(atom.config.configFilePath, "foo: bar: 'baz'"))

        it('updates the config data based on the file contents', function () {
          atom.config.loadUserConfig()
          return expect(atom.config.get('foo.bar')).toBe('baz')
        })

        return it('notifies observers for updated keypaths on load', function () {
          const observeHandler = jasmine.createSpy('observeHandler')
          const observeSubscription = atom.config.observe('foo.bar', observeHandler)

          atom.config.loadUserConfig()

          return expect(observeHandler).toHaveBeenCalledWith('baz')
        })
      })

      describe('when the config file contains invalid cson', function () {
        let addErrorHandler = null
        beforeEach(function () {
          atom.notifications.onDidAddNotification(addErrorHandler = jasmine.createSpy())
          return fs.writeFileSync(atom.config.configFilePath, '{{{{{')
        })

        return it('logs an error to the console and does not overwrite the config file on a subsequent save', function () {
          atom.config.loadUserConfig()
          expect(addErrorHandler.callCount).toBe(1)
          atom.config.set('hair', 'blonde') // trigger a save
          return expect(atom.config.save).not.toHaveBeenCalled()
        })
      })

      describe('when the config file does not exist', () => it('creates it with an empty object', function () {
        fs.makeTreeSync(atom.config.configDirPath)
        atom.config.loadUserConfig()
        expect(fs.existsSync(atom.config.configFilePath)).toBe(true)
        return expect(CSON.readFileSync(atom.config.configFilePath)).toEqual({})
      }))

      describe('when the config file contains values that do not adhere to the schema', function () {
        beforeEach(function () {
          fs.writeFileSync(atom.config.configFilePath, `\
foo:
  bar: 'baz'
  int: 'bad value'\
`
          )
          return atom.config.loadUserConfig()
        })

        return it('updates the only the settings that have values matching the schema', function () {
          expect(atom.config.get('foo.bar')).toBe('baz')
          expect(atom.config.get('foo.int')).toBe(12)

          expect(console.warn).toHaveBeenCalled()
          return expect(console.warn.mostRecentCall.args[0]).toContain('foo.int')
        })
      })

      describe('when there is a pending save', () => it('does not change the config settings', function () {
        fs.writeFileSync(atom.config.configFilePath, "'*': foo: bar: 'baz'")

        atom.config.set('foo.bar', 'quux')
        atom.config.loadUserConfig()
        expect(atom.config.get('foo.bar')).toBe('quux')

        advanceClock(100)
        expect(atom.config.save.callCount).toBe(1)

        expect(atom.config.get('foo.bar')).toBe('quux')
        atom.config.loadUserConfig()
        return expect(atom.config.get('foo.bar')).toBe('baz')
      }))

      return describe('when the config file fails to load', function () {
        let addErrorHandler = null

        beforeEach(function () {
          atom.notifications.onDidAddNotification(addErrorHandler = jasmine.createSpy())
          return spyOn(fs, 'existsSync').andCallFake(function () {
            const error = new Error()
            error.code = 'EPERM'
            throw error
          })
        })

        return it('creates a notification and does not try to save later changes to disk', function () {
          const load = () => atom.config.loadUserConfig()
          expect(load).not.toThrow()
          expect(addErrorHandler.callCount).toBe(1)

          atom.config.set('foo.bar', 'baz')
          advanceClock(100)
          expect(atom.config.save).not.toHaveBeenCalled()
          return expect(atom.config.get('foo.bar')).toBe('baz')
        })
      })
    })

    describe('.observeUserConfig()', function () {
      let updatedHandler = null

      const writeConfigFile = function (data) {
        const previousSetTimeoutCallCount = setTimeout.callCount
        runs(() => fs.writeFileSync(atom.config.configFilePath, data))
        waitsFor('debounced config file load', () => setTimeout.callCount > previousSetTimeoutCallCount)
        return runs(() => advanceClock(1000))
      }

      beforeEach(function () {
        atom.config.setSchema('foo', {
          type: 'object',
          properties: {
            bar: {
              type: 'string',
              default: 'def'
            },
            baz: {
              type: 'string'
            },
            scoped: {
              type: 'boolean'
            },
            int: {
              type: 'integer',
              default: 12
            }
          }
        }
        )

        expect(fs.existsSync(atom.config.configDirPath)).toBeFalsy()
        fs.writeFileSync(atom.config.configFilePath, `\
'*':
  foo:
    bar: 'baz'
    scoped: false
'.source.ruby':
  foo:
    scoped: true\
`
        )
        atom.config.loadUserConfig()
        atom.config.observeUserConfig()
        updatedHandler = jasmine.createSpy('updatedHandler')
        return atom.config.onDidChange(updatedHandler)
      })

      afterEach(function () {
        atom.config.unobserveUserConfig()
        return fs.removeSync(dotAtomPath)
      })

      describe('when the config file changes to contain valid cson', function () {
        it('updates the config data', function () {
          writeConfigFile("foo: { bar: 'quux', baz: 'bar'}")
          waitsFor('update event', () => updatedHandler.callCount > 0)
          return runs(function () {
            expect(atom.config.get('foo.bar')).toBe('quux')
            return expect(atom.config.get('foo.baz')).toBe('bar')
          })
        })

        it('does not fire a change event for paths that did not change', function () {
          let noChangeSpy
          atom.config.onDidChange('foo.bar', (noChangeSpy = jasmine.createSpy()))

          writeConfigFile("foo: { bar: 'baz', baz: 'ok'}")
          waitsFor('update event', () => updatedHandler.callCount > 0)

          return runs(function () {
            expect(noChangeSpy).not.toHaveBeenCalled()
            expect(atom.config.get('foo.bar')).toBe('baz')
            return expect(atom.config.get('foo.baz')).toBe('ok')
          })
        })

        describe('when the default value is a complex value', function () {
          beforeEach(function () {
            atom.config.setSchema('foo.bar', {
              type: 'array',
              items: {
                type: 'string'
              }
            }
            )

            writeConfigFile("foo: { bar: ['baz', 'ok']}")
            waitsFor('update event', () => updatedHandler.callCount > 0)
            return runs(() => updatedHandler.reset())
          })

          return it('does not fire a change event for paths that did not change', function () {
            const noChangeSpy = jasmine.createSpy()
            atom.config.onDidChange('foo.bar', noChangeSpy)

            writeConfigFile("foo: { bar: ['baz', 'ok'], baz: 'another'}")
            waitsFor('update event', () => updatedHandler.callCount > 0)

            return runs(function () {
              expect(noChangeSpy).not.toHaveBeenCalled()
              expect(atom.config.get('foo.bar')).toEqual(['baz', 'ok'])
              return expect(atom.config.get('foo.baz')).toBe('another')
            })
          })
        })

        return describe('when scoped settings are used', function () {
          it('fires a change event for scoped settings that are removed', function () {
            const scopedSpy = jasmine.createSpy()
            atom.config.onDidChange('foo.scoped', { scope: ['.source.ruby'] }, scopedSpy)

            writeConfigFile(`\
'*':
  foo:
    scoped: false\
`
            )
            waitsFor('update event', () => updatedHandler.callCount > 0)

            return runs(function () {
              expect(scopedSpy).toHaveBeenCalled()
              return expect(atom.config.get('foo.scoped', { scope: ['.source.ruby'] })).toBe(false)
            })
          })

          return it('does not fire a change event for paths that did not change', function () {
            const noChangeSpy = jasmine.createSpy()
            atom.config.onDidChange('foo.scoped', { scope: ['.source.ruby'] }, noChangeSpy)

            writeConfigFile(`\
'*':
  foo:
    bar: 'baz'
'.source.ruby':
  foo:
    scoped: true\
`
            )
            waitsFor('update event', () => updatedHandler.callCount > 0)

            return runs(function () {
              expect(noChangeSpy).not.toHaveBeenCalled()
              expect(atom.config.get('foo.bar', { scope: ['.source.ruby'] })).toBe('baz')
              return expect(atom.config.get('foo.scoped', { scope: ['.source.ruby'] })).toBe(true)
            })
          })
        })
      })

      describe('when the config file changes to omit a setting with a default', () => it('resets the setting back to the default', function () {
        writeConfigFile("foo: { baz: 'new'}")
        waitsFor('update event', () => updatedHandler.callCount > 0)
        return runs(function () {
          expect(atom.config.get('foo.bar')).toBe('def')
          return expect(atom.config.get('foo.baz')).toBe('new')
        })
      }))

      describe('when the config file changes to be empty', function () {
        beforeEach(function () {
          writeConfigFile('')
          return waitsFor('update event', () => updatedHandler.callCount > 0)
        })

        it('resets all settings back to the defaults', function () {
          expect(updatedHandler.callCount).toBe(1)
          expect(atom.config.get('foo.bar')).toBe('def')
          atom.config.set('hair', 'blonde') // trigger a save
          advanceClock(500)
          return expect(atom.config.save).toHaveBeenCalled()
        })

        return describe('when the config file subsequently changes again to contain configuration', function () {
          beforeEach(function () {
            updatedHandler.reset()
            writeConfigFile("foo: bar: 'newVal'")
            return waitsFor('update event', () => updatedHandler.callCount > 0)
          })

          return it('sets the setting to the value specified in the config file', () => expect(atom.config.get('foo.bar')).toBe('newVal'))
        })
      })

      return describe('when the config file changes to contain invalid cson', function () {
        let addErrorHandler = null
        beforeEach(function () {
          atom.notifications.onDidAddNotification(addErrorHandler = jasmine.createSpy())
          writeConfigFile('}}}')
          return waitsFor('error to be logged', () => addErrorHandler.callCount > 0)
        })

        it('logs a warning and does not update config data', function () {
          expect(updatedHandler.callCount).toBe(0)
          expect(atom.config.get('foo.bar')).toBe('baz')
          atom.config.set('hair', 'blonde') // trigger a save
          return expect(atom.config.save).not.toHaveBeenCalled()
        })

        return describe('when the config file subsequently changes again to contain valid cson', function () {
          beforeEach(function () {
            writeConfigFile("foo: bar: 'newVal'")
            return waitsFor('update event', () => updatedHandler.callCount > 0)
          })

          return it('updates the config data and resumes saving', function () {
            atom.config.set('hair', 'blonde')
            advanceClock(500)
            return expect(atom.config.save).toHaveBeenCalled()
          })
        })
      })
    })

    describe('.initializeConfigDirectory()', function () {
      beforeEach(function () {
        if (fs.existsSync(dotAtomPath)) {
          fs.removeSync(dotAtomPath)
        }

        return atom.config.configDirPath = dotAtomPath
      })

      afterEach(() => fs.removeSync(dotAtomPath))

      return describe("when the configDirPath doesn't exist", () => it('copies the contents of dot-atom to ~/.atom', function () {
        if (process.platform === 'win32') { return } // Flakey test on Win32
        let initializationDone = false
        jasmine.unspy(window, 'setTimeout')
        atom.config.initializeConfigDirectory(() => initializationDone = true)

        waitsFor(() => initializationDone)

        return runs(function () {
          expect(fs.existsSync(atom.config.configDirPath)).toBeTruthy()
          expect(fs.existsSync(path.join(atom.config.configDirPath, 'packages'))).toBeTruthy()
          expect(fs.isFileSync(path.join(atom.config.configDirPath, 'snippets.cson'))).toBeTruthy()
          expect(fs.isFileSync(path.join(atom.config.configDirPath, 'init.coffee'))).toBeTruthy()
          return expect(fs.isFileSync(path.join(atom.config.configDirPath, 'styles.less'))).toBeTruthy()
        })
      }))
    })

    describe('.pushAtKeyPath(keyPath, value)', () => it('pushes the given value to the array at the key path and updates observers', function () {
      atom.config.set('foo.bar.baz', ['a'])
      const observeHandler = jasmine.createSpy('observeHandler')
      atom.config.observe('foo.bar.baz', observeHandler)
      observeHandler.reset()

      expect(atom.config.pushAtKeyPath('foo.bar.baz', 'b')).toBe(2)
      expect(atom.config.get('foo.bar.baz')).toEqual(['a', 'b'])
      return expect(observeHandler).toHaveBeenCalledWith(atom.config.get('foo.bar.baz'))
    }))

    describe('.unshiftAtKeyPath(keyPath, value)', () => it('unshifts the given value to the array at the key path and updates observers', function () {
      atom.config.set('foo.bar.baz', ['b'])
      const observeHandler = jasmine.createSpy('observeHandler')
      atom.config.observe('foo.bar.baz', observeHandler)
      observeHandler.reset()

      expect(atom.config.unshiftAtKeyPath('foo.bar.baz', 'a')).toBe(2)
      expect(atom.config.get('foo.bar.baz')).toEqual(['a', 'b'])
      return expect(observeHandler).toHaveBeenCalledWith(atom.config.get('foo.bar.baz'))
    }))

    describe('.removeAtKeyPath(keyPath, value)', () => it('removes the given value from the array at the key path and updates observers', function () {
      atom.config.set('foo.bar.baz', ['a', 'b', 'c'])
      const observeHandler = jasmine.createSpy('observeHandler')
      atom.config.observe('foo.bar.baz', observeHandler)
      observeHandler.reset()

      expect(atom.config.removeAtKeyPath('foo.bar.baz', 'b')).toEqual(['a', 'c'])
      expect(atom.config.get('foo.bar.baz')).toEqual(['a', 'c'])
      return expect(observeHandler).toHaveBeenCalledWith(atom.config.get('foo.bar.baz'))
    }))

    describe('.setDefaults(keyPath, defaults)', function () {
      it('assigns any previously-unassigned keys to the object at the key path', function () {
        atom.config.set('foo.bar.baz', { a: 1 })
        atom.config.setDefaults('foo.bar.baz', { a: 2, b: 3, c: 4 })
        expect(atom.config.get('foo.bar.baz.a')).toBe(1)
        expect(atom.config.get('foo.bar.baz.b')).toBe(3)
        expect(atom.config.get('foo.bar.baz.c')).toBe(4)

        atom.config.setDefaults('foo.quux', { x: 0, y: 1 })
        expect(atom.config.get('foo.quux.x')).toBe(0)
        return expect(atom.config.get('foo.quux.y')).toBe(1)
      })

      return it('emits an updated event', function () {
        const updatedCallback = jasmine.createSpy('updated')
        atom.config.onDidChange('foo.bar.baz.a', updatedCallback)
        expect(updatedCallback.callCount).toBe(0)
        atom.config.setDefaults('foo.bar.baz', { a: 2 })
        return expect(updatedCallback.callCount).toBe(1)
      })
    })

    return describe('.setSchema(keyPath, schema)', function () {
      it('creates a properly nested schema', function () {
        const schema = {
          type: 'object',
          properties: {
            anInt: {
              type: 'integer',
              default: 12
            }
          }
        }

        atom.config.setSchema('foo.bar', schema)

        return expect(atom.config.getSchema('foo')).toEqual({
          type: 'object',
          properties: {
            bar: {
              type: 'object',
              properties: {
                anInt: {
                  type: 'integer',
                  default: 12
                }
              }
            }
          }
        })
      })

      it('sets defaults specified by the schema', function () {
        const schema = {
          type: 'object',
          properties: {
            anInt: {
              type: 'integer',
              default: 12
            },
            anObject: {
              type: 'object',
              properties: {
                nestedInt: {
                  type: 'integer',
                  default: 24
                },
                nestedObject: {
                  type: 'object',
                  properties: {
                    superNestedInt: {
                      type: 'integer',
                      default: 36
                    }
                  }
                }
              }
            }
          }
        }

        atom.config.setSchema('foo.bar', schema)
        expect(atom.config.get('foo.bar.anInt')).toBe(12)
        expect(atom.config.get('foo.bar.anObject')).toEqual({
          nestedInt: 24,
          nestedObject: {
            superNestedInt: 36
          }
        })

        expect(atom.config.get('foo')).toEqual({
          bar: {
            anInt: 12,
            anObject: {
              nestedInt: 24,
              nestedObject: {
                superNestedInt: 36
              }
            }
          }
        })
        atom.config.set('foo.bar.anObject.nestedObject.superNestedInt', 37)
        return expect(atom.config.get('foo')).toEqual({
          bar: {
            anInt: 12,
            anObject: {
              nestedInt: 24,
              nestedObject: {
                superNestedInt: 37
              }
            }
          }
        })
      })

      it('can set a non-object schema', function () {
        const schema = {
          type: 'integer',
          default: 12
        }

        atom.config.setSchema('foo.bar.anInt', schema)
        expect(atom.config.get('foo.bar.anInt')).toBe(12)
        return expect(atom.config.getSchema('foo.bar.anInt')).toEqual({
          type: 'integer',
          default: 12
        })
      })

      it('allows the schema to be retrieved via ::getSchema', function () {
        const schema = {
          type: 'object',
          properties: {
            anInt: {
              type: 'integer',
              default: 12
            }
          }
        }

        atom.config.setSchema('foo.bar', schema)

        expect(atom.config.getSchema('foo.bar')).toEqual({
          type: 'object',
          properties: {
            anInt: {
              type: 'integer',
              default: 12
            }
          }
        })

        expect(atom.config.getSchema('foo.bar.anInt')).toEqual({
          type: 'integer',
          default: 12
        })

        expect(atom.config.getSchema('foo.baz')).toEqual({ type: 'any' })
        return expect(atom.config.getSchema('foo.bar.anInt.baz')).toBe(null)
      })

      it('respects the schema for scoped settings', function () {
        const schema = {
          type: 'string',
          default: 'ok',
          scopes: {
            '.source.js': {
              default: 'omg'
            }
          }
        }
        atom.config.setSchema('foo.bar.str', schema)

        expect(atom.config.get('foo.bar.str')).toBe('ok')
        expect(atom.config.get('foo.bar.str', { scope: ['.source.js'] })).toBe('omg')
        return expect(atom.config.get('foo.bar.str', { scope: ['.source.coffee'] })).toBe('ok')
      })

      describe('when a schema is added after config values have been set', function () {
        let schema = null
        beforeEach(() => schema = {
          type: 'object',
          properties: {
            int: {
              type: 'integer',
              default: 2
            },
            str: {
              type: 'string',
              default: 'def'
            }
          }
        })

        it('respects the new schema when values are set', function () {
          expect(atom.config.set('foo.bar.str', 'global')).toBe(true)
          expect(atom.config.set('foo.bar.str', 'scoped', { scopeSelector: '.source.js' })).toBe(true)
          expect(atom.config.get('foo.bar.str')).toBe('global')
          expect(atom.config.get('foo.bar.str', { scope: ['.source.js'] })).toBe('scoped')

          expect(atom.config.set('foo.bar.noschema', 'nsGlobal')).toBe(true)
          expect(atom.config.set('foo.bar.noschema', 'nsScoped', { scopeSelector: '.source.js' })).toBe(true)
          expect(atom.config.get('foo.bar.noschema')).toBe('nsGlobal')
          expect(atom.config.get('foo.bar.noschema', { scope: ['.source.js'] })).toBe('nsScoped')

          expect(atom.config.set('foo.bar.int', 'nope')).toBe(true)
          expect(atom.config.set('foo.bar.int', 'notanint', { scopeSelector: '.source.js' })).toBe(true)
          expect(atom.config.set('foo.bar.int', 23, { scopeSelector: '.source.coffee' })).toBe(true)
          expect(atom.config.get('foo.bar.int')).toBe('nope')
          expect(atom.config.get('foo.bar.int', { scope: ['.source.js'] })).toBe('notanint')
          expect(atom.config.get('foo.bar.int', { scope: ['.source.coffee'] })).toBe(23)

          atom.config.setSchema('foo.bar', schema)

          expect(atom.config.get('foo.bar.str')).toBe('global')
          expect(atom.config.get('foo.bar.str', { scope: ['.source.js'] })).toBe('scoped')
          expect(atom.config.get('foo.bar.noschema')).toBe('nsGlobal')
          expect(atom.config.get('foo.bar.noschema', { scope: ['.source.js'] })).toBe('nsScoped')

          expect(atom.config.get('foo.bar.int')).toBe(2)
          expect(atom.config.get('foo.bar.int', { scope: ['.source.js'] })).toBe(2)
          return expect(atom.config.get('foo.bar.int', { scope: ['.source.coffee'] })).toBe(23)
        })

        return it('sets all values that adhere to the schema', function () {
          expect(atom.config.set('foo.bar.int', 10)).toBe(true)
          expect(atom.config.set('foo.bar.int', 15, { scopeSelector: '.source.js' })).toBe(true)
          expect(atom.config.set('foo.bar.int', 23, { scopeSelector: '.source.coffee' })).toBe(true)
          expect(atom.config.get('foo.bar.int')).toBe(10)
          expect(atom.config.get('foo.bar.int', { scope: ['.source.js'] })).toBe(15)
          expect(atom.config.get('foo.bar.int', { scope: ['.source.coffee'] })).toBe(23)

          atom.config.setSchema('foo.bar', schema)

          expect(atom.config.get('foo.bar.int')).toBe(10)
          expect(atom.config.get('foo.bar.int', { scope: ['.source.js'] })).toBe(15)
          return expect(atom.config.get('foo.bar.int', { scope: ['.source.coffee'] })).toBe(23)
        })
      })

      describe('when the value has an "integer" type', function () {
        beforeEach(function () {
          const schema = {
            type: 'integer',
            default: 12
          }
          return atom.config.setSchema('foo.bar.anInt', schema)
        })

        it('coerces a string to an int', function () {
          atom.config.set('foo.bar.anInt', '123')
          return expect(atom.config.get('foo.bar.anInt')).toBe(123)
        })

        it('does not allow infinity', function () {
          atom.config.set('foo.bar.anInt', Infinity)
          return expect(atom.config.get('foo.bar.anInt')).toBe(12)
        })

        it('coerces a float to an int', function () {
          atom.config.set('foo.bar.anInt', 12.3)
          return expect(atom.config.get('foo.bar.anInt')).toBe(12)
        })

        it('will not set non-integers', function () {
          atom.config.set('foo.bar.anInt', null)
          expect(atom.config.get('foo.bar.anInt')).toBe(12)

          atom.config.set('foo.bar.anInt', 'nope')
          return expect(atom.config.get('foo.bar.anInt')).toBe(12)
        })

        return describe('when the minimum and maximum keys are used', function () {
          beforeEach(function () {
            const schema = {
              type: 'integer',
              minimum: 10,
              maximum: 20,
              default: 12
            }
            return atom.config.setSchema('foo.bar.anInt', schema)
          })

          return it('keeps the specified value within the specified range', function () {
            atom.config.set('foo.bar.anInt', '123')
            expect(atom.config.get('foo.bar.anInt')).toBe(20)

            atom.config.set('foo.bar.anInt', '1')
            return expect(atom.config.get('foo.bar.anInt')).toBe(10)
          })
        })
      })

      describe('when the value has an "integer" and "string" type', function () {
        beforeEach(function () {
          const schema = {
            type: ['integer', 'string'],
            default: 12
          }
          return atom.config.setSchema('foo.bar.anInt', schema)
        })

        return it('can coerce an int, and fallback to a string', function () {
          atom.config.set('foo.bar.anInt', '123')
          expect(atom.config.get('foo.bar.anInt')).toBe(123)

          atom.config.set('foo.bar.anInt', 'cats')
          return expect(atom.config.get('foo.bar.anInt')).toBe('cats')
        })
      })

      describe('when the value has an "string" and "boolean" type', function () {
        beforeEach(function () {
          const schema = {
            type: ['string', 'boolean'],
            default: 'def'
          }
          return atom.config.setSchema('foo.bar', schema)
        })

        return it('can set a string, a boolean, and revert back to the default', function () {
          atom.config.set('foo.bar', 'ok')
          expect(atom.config.get('foo.bar')).toBe('ok')

          atom.config.set('foo.bar', false)
          expect(atom.config.get('foo.bar')).toBe(false)

          atom.config.set('foo.bar', undefined)
          return expect(atom.config.get('foo.bar')).toBe('def')
        })
      })

      describe('when the value has a "number" type', function () {
        beforeEach(function () {
          const schema = {
            type: 'number',
            default: 12.1
          }
          return atom.config.setSchema('foo.bar.aFloat', schema)
        })

        it('coerces a string to a float', function () {
          atom.config.set('foo.bar.aFloat', '12.23')
          return expect(atom.config.get('foo.bar.aFloat')).toBe(12.23)
        })

        it('will not set non-numbers', function () {
          atom.config.set('foo.bar.aFloat', null)
          expect(atom.config.get('foo.bar.aFloat')).toBe(12.1)

          atom.config.set('foo.bar.aFloat', 'nope')
          return expect(atom.config.get('foo.bar.aFloat')).toBe(12.1)
        })

        return describe('when the minimum and maximum keys are used', function () {
          beforeEach(function () {
            const schema = {
              type: 'number',
              minimum: 11.2,
              maximum: 25.4,
              default: 12.1
            }
            return atom.config.setSchema('foo.bar.aFloat', schema)
          })

          return it('keeps the specified value within the specified range', function () {
            atom.config.set('foo.bar.aFloat', '123.2')
            expect(atom.config.get('foo.bar.aFloat')).toBe(25.4)

            atom.config.set('foo.bar.aFloat', '1.0')
            return expect(atom.config.get('foo.bar.aFloat')).toBe(11.2)
          })
        })
      })

      describe('when the value has a "boolean" type', function () {
        beforeEach(function () {
          const schema = {
            type: 'boolean',
            default: true
          }
          return atom.config.setSchema('foo.bar.aBool', schema)
        })

        it('coerces various types to a boolean', function () {
          atom.config.set('foo.bar.aBool', 'true')
          expect(atom.config.get('foo.bar.aBool')).toBe(true)
          atom.config.set('foo.bar.aBool', 'false')
          expect(atom.config.get('foo.bar.aBool')).toBe(false)
          atom.config.set('foo.bar.aBool', 'TRUE')
          expect(atom.config.get('foo.bar.aBool')).toBe(true)
          atom.config.set('foo.bar.aBool', 'FALSE')
          expect(atom.config.get('foo.bar.aBool')).toBe(false)
          atom.config.set('foo.bar.aBool', 1)
          expect(atom.config.get('foo.bar.aBool')).toBe(false)
          atom.config.set('foo.bar.aBool', 0)
          expect(atom.config.get('foo.bar.aBool')).toBe(false)
          atom.config.set('foo.bar.aBool', {})
          expect(atom.config.get('foo.bar.aBool')).toBe(false)
          atom.config.set('foo.bar.aBool', null)
          return expect(atom.config.get('foo.bar.aBool')).toBe(false)
        })

        return it('reverts back to the default value when undefined is passed to set', function () {
          atom.config.set('foo.bar.aBool', 'false')
          expect(atom.config.get('foo.bar.aBool')).toBe(false)

          atom.config.set('foo.bar.aBool', undefined)
          return expect(atom.config.get('foo.bar.aBool')).toBe(true)
        })
      })

      describe('when the value has an "string" type', function () {
        beforeEach(function () {
          const schema = {
            type: 'string',
            default: 'ok'
          }
          return atom.config.setSchema('foo.bar.aString', schema)
        })

        it('allows strings', function () {
          atom.config.set('foo.bar.aString', 'yep')
          return expect(atom.config.get('foo.bar.aString')).toBe('yep')
        })

        it('will only set strings', function () {
          expect(atom.config.set('foo.bar.aString', 123)).toBe(false)
          expect(atom.config.get('foo.bar.aString')).toBe('ok')

          expect(atom.config.set('foo.bar.aString', true)).toBe(false)
          expect(atom.config.get('foo.bar.aString')).toBe('ok')

          expect(atom.config.set('foo.bar.aString', null)).toBe(false)
          expect(atom.config.get('foo.bar.aString')).toBe('ok')

          expect(atom.config.set('foo.bar.aString', [])).toBe(false)
          expect(atom.config.get('foo.bar.aString')).toBe('ok')

          expect(atom.config.set('foo.bar.aString', { nope: 'nope' })).toBe(false)
          return expect(atom.config.get('foo.bar.aString')).toBe('ok')
        })

        it('does not allow setting children of that key-path', function () {
          expect(atom.config.set('foo.bar.aString.something', 123)).toBe(false)
          return expect(atom.config.get('foo.bar.aString')).toBe('ok')
        })

        return describe('when the schema has a "maximumLength" key', () => it('trims the string to be no longer than the specified maximum', function () {
          const schema = {
            type: 'string',
            default: 'ok',
            maximumLength: 3
          }
          atom.config.setSchema('foo.bar.aString', schema)
          atom.config.set('foo.bar.aString', 'abcdefg')
          return expect(atom.config.get('foo.bar.aString')).toBe('abc')
        }))
      })

      describe('when the value has an "object" type', function () {
        beforeEach(function () {
          const schema = {
            type: 'object',
            properties: {
              anInt: {
                type: 'integer',
                default: 12
              },
              nestedObject: {
                type: 'object',
                properties: {
                  nestedBool: {
                    type: 'boolean',
                    default: false
                  }
                }
              }
            }
          }
          return atom.config.setSchema('foo.bar', schema)
        })

        it('converts and validates all the children', function () {
          atom.config.set('foo.bar', {
            anInt: '23',
            nestedObject: {
              nestedBool: 'true'
            }
          }
          )
          return expect(atom.config.get('foo.bar')).toEqual({
            anInt: 23,
            nestedObject: {
              nestedBool: true
            }
          })
        })

        it('will set only the values that adhere to the schema', function () {
          expect(atom.config.set('foo.bar', {
            anInt: 'nope',
            nestedObject: {
              nestedBool: true
            }
          }
          )).toBe(true)
          expect(atom.config.get('foo.bar.anInt')).toEqual(12)
          return expect(atom.config.get('foo.bar.nestedObject.nestedBool')).toEqual(true)
        })

        describe('when the value has additionalProperties set to false', () => it('does not allow other properties to be set on the object', function () {
          atom.config.setSchema('foo.bar', {
            type: 'object',
            properties: {
              anInt: {
                type: 'integer',
                default: 12
              }
            },
            additionalProperties: false
          }
          )

          expect(atom.config.set('foo.bar', { anInt: 5, somethingElse: 'ok' })).toBe(true)
          expect(atom.config.get('foo.bar.anInt')).toBe(5)
          expect(atom.config.get('foo.bar.somethingElse')).toBeUndefined()

          expect(atom.config.set('foo.bar.somethingElse', { anInt: 5 })).toBe(false)
          return expect(atom.config.get('foo.bar.somethingElse')).toBeUndefined()
        }))

        return describe('when the value has an additionalProperties schema', () => it('validates properties of the object against that schema', function () {
          atom.config.setSchema('foo.bar', {
            type: 'object',
            properties: {
              anInt: {
                type: 'integer',
                default: 12
              }
            },
            additionalProperties: {
              type: 'string'
            }
          }
          )

          expect(atom.config.set('foo.bar', { anInt: 5, somethingElse: 'ok' })).toBe(true)
          expect(atom.config.get('foo.bar.anInt')).toBe(5)
          expect(atom.config.get('foo.bar.somethingElse')).toBe('ok')

          expect(atom.config.set('foo.bar.somethingElse', 7)).toBe(false)
          expect(atom.config.get('foo.bar.somethingElse')).toBe('ok')

          expect(atom.config.set('foo.bar', { anInt: 6, somethingElse: 7 })).toBe(true)
          expect(atom.config.get('foo.bar.anInt')).toBe(6)
          return expect(atom.config.get('foo.bar.somethingElse')).toBe(undefined)
        }))
      })

      describe('when the value has an "array" type', function () {
        beforeEach(function () {
          const schema = {
            type: 'array',
            default: [1, 2, 3],
            items: {
              type: 'integer'
            }
          }
          return atom.config.setSchema('foo.bar', schema)
        })

        it('converts an array of strings to an array of ints', function () {
          atom.config.set('foo.bar', ['2', '3', '4'])
          return expect(atom.config.get('foo.bar')).toEqual([2, 3, 4])
        })

        return it('does not allow setting children of that key-path', function () {
          expect(atom.config.set('foo.bar.child', 123)).toBe(false)
          expect(atom.config.set('foo.bar.child.grandchild', 123)).toBe(false)
          return expect(atom.config.get('foo.bar')).toEqual([1, 2, 3])
        })
      })

      describe('when the value has a "color" type', function () {
        beforeEach(function () {
          const schema = {
            type: 'color',
            default: 'white'
          }
          return atom.config.setSchema('foo.bar.aColor', schema)
        })

        it('returns a Color object', function () {
          let color = atom.config.get('foo.bar.aColor')
          expect(color.toHexString()).toBe('#ffffff')
          expect(color.toRGBAString()).toBe('rgba(255, 255, 255, 1)')

          color.red = 0
          color.green = 0
          color.blue = 0
          color.alpha = 0
          atom.config.set('foo.bar.aColor', color)

          color = atom.config.get('foo.bar.aColor')
          expect(color.toHexString()).toBe('#000000')
          expect(color.toRGBAString()).toBe('rgba(0, 0, 0, 0)')

          color.red = 300
          color.green = -200
          color.blue = -1
          color.alpha = 'not see through'
          atom.config.set('foo.bar.aColor', color)

          color = atom.config.get('foo.bar.aColor')
          expect(color.toHexString()).toBe('#ff0000')
          expect(color.toRGBAString()).toBe('rgba(255, 0, 0, 1)')

          color.red = 11
          color.green = 11
          color.blue = 124
          color.alpha = 1
          atom.config.set('foo.bar.aColor', color)

          color = atom.config.get('foo.bar.aColor')
          expect(color.toHexString()).toBe('#0b0b7c')
          return expect(color.toRGBAString()).toBe('rgba(11, 11, 124, 1)')
        })

        it('coerces various types to a color object', function () {
          atom.config.set('foo.bar.aColor', 'red')
          expect(atom.config.get('foo.bar.aColor')).toEqual({ red: 255, green: 0, blue: 0, alpha: 1 })
          atom.config.set('foo.bar.aColor', '#020')
          expect(atom.config.get('foo.bar.aColor')).toEqual({ red: 0, green: 34, blue: 0, alpha: 1 })
          atom.config.set('foo.bar.aColor', '#abcdef')
          expect(atom.config.get('foo.bar.aColor')).toEqual({ red: 171, green: 205, blue: 239, alpha: 1 })
          atom.config.set('foo.bar.aColor', 'rgb(1,2,3)')
          expect(atom.config.get('foo.bar.aColor')).toEqual({ red: 1, green: 2, blue: 3, alpha: 1 })
          atom.config.set('foo.bar.aColor', 'rgba(4,5,6,.7)')
          expect(atom.config.get('foo.bar.aColor')).toEqual({ red: 4, green: 5, blue: 6, alpha: 0.7 })
          atom.config.set('foo.bar.aColor', 'hsl(120,100%,50%)')
          expect(atom.config.get('foo.bar.aColor')).toEqual({ red: 0, green: 255, blue: 0, alpha: 1 })
          atom.config.set('foo.bar.aColor', 'hsla(120,100%,50%,0.3)')
          expect(atom.config.get('foo.bar.aColor')).toEqual({ red: 0, green: 255, blue: 0, alpha: 0.3 })
          atom.config.set('foo.bar.aColor', { red: 100, green: 255, blue: 2, alpha: 0.5 })
          expect(atom.config.get('foo.bar.aColor')).toEqual({ red: 100, green: 255, blue: 2, alpha: 0.5 })
          atom.config.set('foo.bar.aColor', { red: 255 })
          expect(atom.config.get('foo.bar.aColor')).toEqual({ red: 255, green: 0, blue: 0, alpha: 1 })
          atom.config.set('foo.bar.aColor', { red: 1000 })
          expect(atom.config.get('foo.bar.aColor')).toEqual({ red: 255, green: 0, blue: 0, alpha: 1 })
          atom.config.set('foo.bar.aColor', { red: 'dark' })
          return expect(atom.config.get('foo.bar.aColor')).toEqual({ red: 0, green: 0, blue: 0, alpha: 1 })
        })

        it('reverts back to the default value when undefined is passed to set', function () {
          atom.config.set('foo.bar.aColor', undefined)
          return expect(atom.config.get('foo.bar.aColor')).toEqual({ red: 255, green: 255, blue: 255, alpha: 1 })
        })

        it('will not set non-colors', function () {
          atom.config.set('foo.bar.aColor', null)
          expect(atom.config.get('foo.bar.aColor')).toEqual({ red: 255, green: 255, blue: 255, alpha: 1 })

          atom.config.set('foo.bar.aColor', 'nope')
          expect(atom.config.get('foo.bar.aColor')).toEqual({ red: 255, green: 255, blue: 255, alpha: 1 })

          atom.config.set('foo.bar.aColor', 30)
          expect(atom.config.get('foo.bar.aColor')).toEqual({ red: 255, green: 255, blue: 255, alpha: 1 })

          atom.config.set('foo.bar.aColor', false)
          return expect(atom.config.get('foo.bar.aColor')).toEqual({ red: 255, green: 255, blue: 255, alpha: 1 })
        })

        return it('returns a clone of the Color when returned in a parent object', function () {
          const color1 = atom.config.get('foo.bar').aColor
          const color2 = atom.config.get('foo.bar').aColor
          expect(color1.toRGBAString()).toBe('rgba(255, 255, 255, 1)')
          expect(color2.toRGBAString()).toBe('rgba(255, 255, 255, 1)')
          expect(color1).not.toBe(color2)
          return expect(color1).toEqual(color2)
        })
      })

      return describe('when the `enum` key is used', function () {
        beforeEach(function () {
          const schema = {
            type: 'object',
            properties: {
              str: {
                type: 'string',
                default: 'ok',
                enum: ['ok', 'one', 'two']
              },
              int: {
                type: 'integer',
                default: 2,
                enum: [2, 3, 5]
              },
              arr: {
                type: 'array',
                default: ['one', 'two'],
                items: {
                  type: 'string',
                  enum: ['one', 'two', 'three']
                }
              },
              str_options: {
                type: 'string',
                default: 'one',
                enum: [
                  { value: 'one', description: 'One' },
                  'two',
                  { value: 'three', description: 'Three' }
                ]
              }
            }
          }

          return atom.config.setSchema('foo.bar', schema)
        })

        it('will only set a string when the string is in the enum values', function () {
          expect(atom.config.set('foo.bar.str', 'nope')).toBe(false)
          expect(atom.config.get('foo.bar.str')).toBe('ok')

          expect(atom.config.set('foo.bar.str', 'one')).toBe(true)
          return expect(atom.config.get('foo.bar.str')).toBe('one')
        })

        it('will only set an integer when the integer is in the enum values', function () {
          expect(atom.config.set('foo.bar.int', '400')).toBe(false)
          expect(atom.config.get('foo.bar.int')).toBe(2)

          expect(atom.config.set('foo.bar.int', '3')).toBe(true)
          return expect(atom.config.get('foo.bar.int')).toBe(3)
        })

        it('will only set an array when the array values are in the enum values', function () {
          expect(atom.config.set('foo.bar.arr', ['one', 'five'])).toBe(true)
          expect(atom.config.get('foo.bar.arr')).toEqual(['one'])

          expect(atom.config.set('foo.bar.arr', ['two', 'three'])).toBe(true)
          return expect(atom.config.get('foo.bar.arr')).toEqual(['two', 'three'])
        })

        return it('will honor the enum when specified as an array', function () {
          expect(atom.config.set('foo.bar.str_options', 'one')).toBe(true)
          expect(atom.config.get('foo.bar.str_options')).toEqual('one')

          expect(atom.config.set('foo.bar.str_options', 'two')).toBe(true)
          expect(atom.config.get('foo.bar.str_options')).toEqual('two')

          expect(atom.config.set('foo.bar.str_options', 'One')).toBe(false)
          return expect(atom.config.get('foo.bar.str_options')).toEqual('two')
        })
      })
    })
  })
})

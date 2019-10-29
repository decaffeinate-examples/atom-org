/** @babel */
/* eslint-disable
    constructor-super,
    no-constant-condition,
    no-eval,
    no-lone-blocks,
    no-this-before-super,
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const Serializable = require('../src/serializable')

describe('Serializable', function () {
  it('provides a default implementation of .deserialize and ::serialize based on (de)serializing params', function () {
    class Parent extends Serializable {
      constructor (param) {
        {
          // Hack: trick Babel/TypeScript into allowing this before super.
          if (false) { super() }
          const thisFn = (() => { return this }).toString()
          const thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1]
          eval(`${thisName} = this;`)
        }
        if (param == null) { param = {} }
        const { child, foo } = param
        this.child = child
        if (this.child == null) { this.child = new Child({ parent: this, foo }) }
      }

      serializeParams () {
        return { child: this.child.serialize() }
      }

      deserializeParams (state) {
        state.child = Child.deserialize(state.child, { parent: this })
        return state
      }
    }

    class Child extends Serializable {
      constructor ({ parent, foo }) {
        {
          // Hack: trick Babel/TypeScript into allowing this before super.
          if (false) { super() }
          const thisFn = (() => { return this }).toString()
          const thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1]
          eval(`${thisName} = this;`)
        }
        this.parent = parent
        this.foo = foo
      }

      serializeParams () { return { foo: this.foo } }
    }

    const parentA = new Parent({ foo: 1 })
    expect(parentA.child.parent).toBe(parentA)
    expect(parentA.child.foo).toBe(1)

    const parentB = Parent.deserialize(parentA.serialize())
    expect(parentB.child.parent).toBe(parentB)
    return expect(parentB.child.foo).toBe(1)
  })

  it('allows other deserializers to be registered on a serializable class', function () {
    class Superclass extends Serializable {}

    class SubclassA extends Superclass {
      constructor ({ foo }) {
        {
          // Hack: trick Babel/TypeScript into allowing this before super.
          if (false) { super() }
          const thisFn = (() => { return this }).toString()
          const thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1]
          eval(`${thisName} = this;`)
        }
        this.foo = foo
      }

      serializeParams () { return { foo: this.foo } }
    }

    class SubclassB extends Superclass {
      constructor ({ bar }) {
        {
          // Hack: trick Babel/TypeScript into allowing this before super.
          if (false) { super() }
          const thisFn = (() => { return this }).toString()
          const thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1]
          eval(`${thisName} = this;`)
        }
        this.bar = bar
      }

      serializeParams () { return { bar: this.bar } }
    }

    Superclass.registerDeserializers(SubclassA, SubclassB)

    const a = Superclass.deserialize(new SubclassA({ foo: 1 }).serialize())
    expect(a instanceof SubclassA).toBe(true)
    expect(a.foo).toBe(1)

    const b = Superclass.deserialize(new SubclassB({ bar: 2 }).serialize())
    expect(b instanceof SubclassB).toBe(true)
    return expect(b.bar).toBe(2)
  })

  it("allows ordered constructor parameters to be inferred from their names so constructors don't need to take a hash", function () {
    class Example extends Serializable {
      constructor (foo, bar) {
        {
          // Hack: trick Babel/TypeScript into allowing this before super.
          if (false) { super() }
          const thisFn = (() => { return this }).toString()
          const thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1]
          eval(`${thisName} = this;`)
        }
        this.foo = foo
        this.bar = bar
      }

      serializeParams () { return { foo: this.foo, bar: this.bar } }
    }

    const object = Example.deserialize(new Example(2, 1).serialize())
    expect(object.foo).toBe(2)
    return expect(object.bar).toBe(1)
  })

  it("returns undefined from deserialize if the deserializer's version number doesn't match", function () {
    class Example extends Serializable {
      static initClass () {
        this.version = 1
      }

      constructor (foo, bar) {
        {
          // Hack: trick Babel/TypeScript into allowing this before super.
          if (false) { super() }
          const thisFn = (() => { return this }).toString()
          const thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1]
          eval(`${thisName} = this;`)
        }
        this.foo = foo
        this.bar = bar
      }

      serializeParams () { return { foo: this.foo, bar: this.bar } }
    }
    Example.initClass()

    const object = new Example(1, 2)
    const state = object.serialize()
    expect(Example.deserialize(state)).toBeDefined()
    Example.version = 2
    return expect(Example.deserialize(state)).toBeUndefined()
  })

  it('returns undefined from .deserialize if ::deserializeParams returns undefined', function () {
    class Example extends Serializable {}
    return Example.deserialize(undefined, { foo: 'bar' })
  })

  return it('returns undefined from .deserialize if the given state is undefined', function () {
    class Example extends Serializable {
      constructor () {
        {
          // Hack: trick Babel/TypeScript into allowing this before super.
          if (false) { super() }
          const thisFn = (() => { return this }).toString()
          const thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1]
          eval(`${thisName} = this;`)
        }
      }

      deserializeParams () {}
    }

    const object = new Example()
    return expect(object.testSerialization()).toBeUndefined()
  })
})

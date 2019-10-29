/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {checkValueAtKeyPath, deepDefaults, deepClone} = require('../src/helpers');

describe("Helpers", function() {
  describe(".checkValueAtKeyPath", function() {
    describe("when the object is a primitive", () => it("indicates that the object affects the given key-path", function() {
      let [value, hasValue] = Array.from(checkValueAtKeyPath(null, 'the.key.path'));
      expect(value).toBeUndefined();
      expect(hasValue).toBe(true);

      [value, hasValue] = Array.from(checkValueAtKeyPath(5, 'the.key.path'));
      expect(value).toBeUndefined();
      return expect(hasValue).toBe(true);
    }));

    describe("when one of the object's children on the key-path is a primitive", () => it("indicates that the object affects the given key-path", function() {
      let [value, hasValue] = Array.from(checkValueAtKeyPath({the: 5}, 'the.key.path'));
      expect(value).toBeUndefined();
      expect(hasValue).toBe(true);

      [value, hasValue] = Array.from(checkValueAtKeyPath({the: {key: 5}}, 'the.key.path'));
      expect(value).toBeUndefined();
      return expect(hasValue).toBe(true);
    }));

    describe("when the object is of a custom type", function() {
      class Thing {}

      return it("indicates that the object affects the given key-path", function() {
        const [value, hasValue] = Array.from(checkValueAtKeyPath(new Thing, 'the.key.path'));
        expect(value).toBeUndefined();
        return expect(hasValue).toBe(true);
      });
    });

    describe("when one of the object's children on the key-path is of a custom type", function() {
      class Thing {}

      return it("indicates that the object affects the given key-path", function() {
        let [value, hasValue] = Array.from(checkValueAtKeyPath({the: new Thing}, 'the.key.path'));
        expect(value).toBeUndefined();
        expect(hasValue).toBe(true);

        [value, hasValue] = Array.from(checkValueAtKeyPath({the: {key: new Thing}}, 'the.key.path'));
        expect(value).toBeUndefined();
        return expect(hasValue).toBe(true);
      });
    });

    describe("when the object has a value for the given key-path", () => it("indicates that the object affects the given key-path", function() {
      const [value, hasValue] = Array.from(checkValueAtKeyPath({the: {key: {path: 5}}}, 'the.key.path'));
      expect(value).toBe(5);
      return expect(hasValue).toBe(true);
    }));

    return describe("when the object doesn't have a value for the given key-path", () => it("indicates that the object doesn't affect the given key-path", function() {
      const [value, hasValue] = Array.from(checkValueAtKeyPath({the: {other: {path: 5}}}, 'the.key.path'));
      expect(value).toBe(undefined);
      return expect(hasValue).toBe(false);
    }));
  });

  describe(".deepDefaults", function() {
    it("fills in missing values on the target object", function() {
      const target = {
        one: 1,
        two: 2,
        nested: {
          a: 'a',
          b: 'b'
        }
      };

      const defaults = {
        one: 100,
        three: 300,
        nested: {
          a: 'A',
          c: 'C'
        }
      };

      deepDefaults(target, defaults);

      return expect(target).toEqual({
        one: 1,
        two: 2,
        three: 300,
        nested: {
          a: 'a',
          b: 'b',
          c: 'C'
        }
      });
    });

    return it("does nothing if the target isn't a plain object", function() {
      class Thing {}

      let target = new Thing;

      const defaults = {one: 1};

      deepDefaults(target, defaults);
      expect(target.hasOwnProperty('one')).toBe(false);

      target = "stuff";
      deepDefaults(target, defaults);
      return expect(target.hasOwnProperty('one')).toBe(false);
    });
  });

  return describe(".deepClone", function() {
    it("clones the object", function() {
      const object = {a: {b: [{c: 'd', e: 'f'}]}};
      const clone = deepClone(object);
      expect(clone).toEqual(object);
      return expect(clone.a.b[0]).not.toBe(object.a.b[0]);
    });

    return it("doesn't clone custom-objects", function() {
      class Test {
        constructor(value) {
          this.value = value;
        }
      }

      const object1 = new Test({a: 'b'});
      const clone1 = deepClone(object1);
      expect(clone1).toBe(object1);

      const object2 = {x: new Test({a: 'b'})};
      const clone2 = deepClone(object2);
      expect(clone2).toEqual(object2);
      return expect(clone2.x).toBe(object2.x);
    });
  });
});

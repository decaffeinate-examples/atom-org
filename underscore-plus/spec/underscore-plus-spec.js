/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const _ = require('../src/underscore-plus');

describe("underscore extensions", function() {
  describe("::adviseBefore(object, methodName, advice)", function() {
    let [object, calls] = Array.from([]);

    beforeEach(function() {
      calls = [];
      return object = {
        method(...args) {
          return calls.push(["original", this, args]);
        }
      };});

    it("calls the given function before the advised method", function() {
      _.adviseBefore(object, 'method', function(...args) { return calls.push(["advice", this, args]); });
      object.method(1, 2, 3);
      return expect(calls).toEqual([['advice', object, [1, 2, 3]], ['original', object, [1, 2, 3]]]);
  });

    return it("cancels the original method's invocation if the advice returns false", function() {
      _.adviseBefore(object, 'method', () => false);
      object.method(1, 2, 3);
      return expect(calls).toEqual([]);
  });
});

  describe("::endsWith(string, ending)", () => it("returns whether the given string ends with the given suffix", function() {
    expect(_.endsWith("test.txt", ".txt")).toBeTruthy();
    expect(_.endsWith("test.txt", "txt")).toBeTruthy();
    expect(_.endsWith("test.txt", "test.txt")).toBeTruthy();
    expect(_.endsWith("test.txt", "")).toBeTruthy();
    expect(_.endsWith("test.txt", ".txt2")).toBeFalsy();
    expect(_.endsWith("test.txt", ".tx")).toBeFalsy();
    return expect(_.endsWith("test.txt", "test")).toBeFalsy();
  }));

  describe("::camelize(string)", () => it("converts `string` to camel case", function() {
    expect(_.camelize("corey_dale_johnson")).toBe("coreyDaleJohnson");
    expect(_.camelize("corey-dale-johnson")).toBe("coreyDaleJohnson");
    expect(_.camelize("corey_dale-johnson")).toBe("coreyDaleJohnson");
    expect(_.camelize("coreyDaleJohnson")).toBe("coreyDaleJohnson");
    return expect(_.camelize("CoreyDaleJohnson")).toBe("CoreyDaleJohnson");
  }));

  describe("::dasherize(string)", () => it("converts `string` to use dashes", function() {
    expect(_.dasherize("corey_dale_johnson")).toBe("corey-dale-johnson");
    expect(_.dasherize("coreyDaleJohnson")).toBe("corey-dale-johnson");
    expect(_.dasherize("CoreyDaleJohnson")).toBe("corey-dale-johnson");
    return expect(_.dasherize("corey-dale-johnson")).toBe("corey-dale-johnson");
  }));

  describe("::underscore(string)", () => it("converts `string` to use underscores", function() {
    expect(_.underscore('')).toBe('');
    expect(_.underscore(null)).toBe('');
    expect(_.underscore()).toBe('');
    expect(_.underscore('a_b')).toBe('a_b');
    expect(_.underscore('A_b')).toBe('a_b');
    expect(_.underscore('a-b')).toBe('a_b');
    expect(_.underscore('TheOffice')).toBe('the_office');
    expect(_.underscore('theOffice')).toBe('the_office');
    expect(_.underscore('test')).toBe('test');
    expect(_.underscore(' test ')).toBe(' test ');
    expect(_.underscore('--ParksAndRec')).toBe('__parks_and_rec');
    expect(_.underscore("corey-dale-johnson")).toBe("corey_dale_johnson");
    expect(_.underscore("coreyDaleJohnson")).toBe("corey_dale_johnson");
    expect(_.underscore("CoreyDaleJohnson")).toBe("corey_dale_johnson");
    return expect(_.underscore("corey_dale_johnson")).toBe("corey_dale_johnson");
  }));

  describe("::spliceWithArray(originalArray, start, length, insertedArray, chunkSize)", function() {
    describe("when the inserted array is smaller than the chunk size", () => it("splices the array in place", function() {
      const array = ['a', 'b', 'c'];
      _.spliceWithArray(array, 1, 1, ['v', 'w', 'x', 'y', 'z'], 100);
      return expect(array).toEqual(['a', 'v', 'w', 'x', 'y', 'z', 'c']);
  }));

    return describe("when the inserted array is larger than the chunk size", () => it("splices the array in place one chunk at a time (to avoid stack overflows)", function() {
      const array = ['a', 'b', 'c'];
      _.spliceWithArray(array, 1, 1, ['v', 'w', 'x', 'y', 'z'], 2);
      return expect(array).toEqual(['a', 'v', 'w', 'x', 'y', 'z', 'c']);
  }));
});

  describe("::humanizeEventName(eventName)", function() {
    describe("when no namespace exists", () => it("undasherizes and capitalizes the event name", function() {
      expect(_.humanizeEventName('nonamespace')).toBe('Nonamespace');
      return expect(_.humanizeEventName('no-name-space')).toBe('No Name Space');
    }));

    return describe("when a namespaces exists", () => it("space separates the undasherized/capitalized versions of the namespace and event name", function() {
      expect(_.humanizeEventName('space:final-frontier')).toBe('Space: Final Frontier');
      return expect(_.humanizeEventName('star-trek:the-next-generation')).toBe('Star Trek: The Next Generation');
    }));
  });

  describe("::humanizeKeystroke(keystroke)", function() {
    it("replaces single keystroke", function() {
      expect(_.humanizeKeystroke('cmd-O', 'darwin')).toEqual('⌘⇧O');
      expect(_.humanizeKeystroke('cmd-O', 'linux')).toEqual('Cmd+Shift+O');

      expect(_.humanizeKeystroke('cmd-shift-up', 'darwin')).toEqual('⌘⇧↑');
      expect(_.humanizeKeystroke('cmd-shift-up', 'linux')).toEqual('Cmd+Shift+Up');

      expect(_.humanizeKeystroke('cmd-option-down', 'darwin')).toEqual('⌘⌥↓');
      expect(_.humanizeKeystroke('cmd-option-down', 'linux')).toEqual('Cmd+Alt+Down');

      expect(_.humanizeKeystroke('cmd-option-left', 'darwin')).toEqual('⌘⌥←');
      expect(_.humanizeKeystroke('cmd-option-left', 'linux')).toEqual('Cmd+Alt+Left');

      expect(_.humanizeKeystroke('cmd-option-right', 'darwin')).toEqual('⌘⌥→');
      expect(_.humanizeKeystroke('cmd-option-right', 'linux')).toEqual('Cmd+Alt+Right');

      expect(_.humanizeKeystroke('cmd-o', 'darwin')).toEqual('⌘O');
      expect(_.humanizeKeystroke('cmd-o', 'linux')).toEqual('Cmd+O');

      expect(_.humanizeKeystroke('ctrl-2', 'darwin')).toEqual('⌃2');
      expect(_.humanizeKeystroke('ctrl-2', 'linux')).toEqual('Ctrl+2');

      expect(_.humanizeKeystroke('cmd-space', 'darwin')).toEqual('⌘space');
      expect(_.humanizeKeystroke('cmd-space', 'linux')).toEqual('Cmd+Space');

      expect(_.humanizeKeystroke('cmd-|', 'darwin')).toEqual('⌘⇧\\');
      expect(_.humanizeKeystroke('cmd-|', 'linux')).toEqual('Cmd+Shift+\\');

      expect(_.humanizeKeystroke('cmd-}', 'darwin')).toEqual('⌘⇧]');
      expect(_.humanizeKeystroke('cmd-}', 'linux')).toEqual('Cmd+Shift+]');

      expect(_.humanizeKeystroke('cmd--', 'darwin')).toEqual('⌘-');
      return expect(_.humanizeKeystroke('cmd--', 'linux')).toEqual('Cmd+-');
    });

    it("correctly replaces keystrokes with shift and capital letter", function() {
      expect(_.humanizeKeystroke('cmd-shift-P', 'darwin')).toEqual('⌘⇧P');
      return expect(_.humanizeKeystroke('cmd-shift-P', 'linux')).toEqual('Cmd+Shift+P');
    });

    it("replaces multiple keystrokes", function() {
      expect(_.humanizeKeystroke('cmd-O cmd-n', 'darwin')).toEqual('⌘⇧O ⌘N');
      expect(_.humanizeKeystroke('cmd-O cmd-n', 'linux')).toEqual('Cmd+Shift+O Cmd+N');

      expect(_.humanizeKeystroke('cmd-shift-- cmd-n', 'darwin')).toEqual('⌘⇧- ⌘N');
      expect(_.humanizeKeystroke('cmd-shift-- cmd-n', 'linux')).toEqual('Cmd+Shift+- Cmd+N');

      expect(_.humanizeKeystroke('cmd-k right', 'darwin')).toEqual('⌘K →');
      return expect(_.humanizeKeystroke('cmd-k right', 'linux')).toEqual('Cmd+K Right');
    });

    it("formats function keys", function() {
      expect(_.humanizeKeystroke('cmd-f2', 'darwin')).toEqual('⌘F2');
      return expect(_.humanizeKeystroke('cmd-f2', 'linux')).toEqual('Cmd+F2');
    });

    return it("handles junk input", function() {
      expect(_.humanizeKeystroke()).toEqual(undefined);
      expect(_.humanizeKeystroke(null)).toEqual(null);
      return expect(_.humanizeKeystroke('')).toEqual('');
    });
  });

  describe("::deepExtend(objects...)", function() {
    it("copies all key/values from each object onto the target", function() {
      const first = {
        things: {
          string: "oh",
          boolean: false,
          anotherArray: ['a', 'b', 'c'],
          object: {
            first: 1,
            second: 2
          }
        }
      };

      const second = {
        things: {
          string: "cool",
          array: [1,2,3],
          anotherArray: ['aa', 'bb', 'cc'],
          object: {
            first: 1
          },
          newObject: {
            first: 'one'
          }
        }
      };

      const result = _.deepExtend(first, second);

      expect(result).toBe(first);
      expect(result).toEqual({
        things: {
          string: "cool",
          boolean: false,
          array: [1,2,3],
          anotherArray: ['aa', 'bb', 'cc'],
          object: {
            first: 1,
            second: 2
          },
          newObject: {
            first: 'one'
          }
        }
      });
      return expect(result.things.newObject).not.toBe(second.things.newObject);
    });

    it("prefers values from later objects over those from earlier objects", function() {
      const first = {
        things: {string: 'oh'},
        otherThings: ['one', 'two']
      };

      const second = {
        things: false,
        otherThings: null
      };

      return expect(_.deepExtend(first, second)).toEqual({
        things: false,
        otherThings: null
      });
    });

    return it("overrides objects with scalar values", function() {
      expect(_.deepExtend({a: {b: "c"}}, {a: "d"})).toEqual({a: "d"});
      expect(_.deepExtend({a: {b: "c"}}, {a: "d"}, {a: {e: "f"}})).toEqual({a: {e: "f"}});
      return expect(_.deepExtend({a: {b: "c"}}, {a: "d"}, {a: "e"})).toEqual({a: "e"});
  });
});

  describe("::deepContains(array, target)", function() {
    let subject = null;
    beforeEach(() => subject = [{one: 1, two: {three: 3}}, {four: 4, five: {six: 6}}, 'omgkittens']);

    it("returns true for a matching object in the array", function() {
      expect(_.deepContains(subject, {four: 4, five: {six: 6}})).toBe(true);
      return expect(_.deepContains(subject, 'omgkittens')).toBe(true);
    });

    return it("returns false when it does not find a match in the array", function() {
      expect(_.deepContains(subject, {four: 4, five: {six: 7}})).toBe(false);
      return expect(_.deepContains(subject, 'nope')).toBe(false);
    });
  });

  describe("::isSubset(potentialSubset, potentialSuperset)", () => it("returns whether the first argument is a subset of the second", function() {
    expect(_.isSubset([1, 2], [1, 2])).toBeTruthy();
    expect(_.isSubset([1, 2], [1, 2, 3])).toBeTruthy();
    expect(_.isSubset([], [1])).toBeTruthy();
    expect(_.isSubset([], [])).toBeTruthy();
    return expect(_.isSubset([1, 2], [2, 3])).toBeFalsy();
  }));

  describe('::isEqual(a, b)', function() {
    it('returns true when the elements are equal, false otherwise', function() {
      expect(_.isEqual(null, null)).toBe(true);
      expect(_.isEqual('test', 'test')).toBe(true);
      expect(_.isEqual(3, 3)).toBe(true);
      expect(_.isEqual({a: 'b'}, {a: 'b'})).toBe(true);
      expect(_.isEqual([1, 'a'], [1, 'a'])).toBe(true);

      expect(_.isEqual(null, 'test')).toBe(false);
      expect(_.isEqual(3, 4)).toBe(false);
      expect(_.isEqual({a: 'b'}, {a: 'c'})).toBe(false);
      expect(_.isEqual({a: 'b'}, {a: 'b', c: 'd'})).toBe(false);
      expect(_.isEqual([1, 'a'], [2])).toBe(false);
      expect(_.isEqual([1, 'a'], [1, 'b'])).toBe(false);

      const a = {isEqual(other) { return other === b; }};
      var b = {isEqual(other) { return other === 'test'; }};
      expect(_.isEqual(a, null)).toBe(false);
      expect(_.isEqual(a, 'test')).toBe(false);
      expect(_.isEqual(a, b)).toBe(true);
      expect(_.isEqual(null, b)).toBe(false);
      expect(_.isEqual('test', b)).toBe(true);

      expect(_.isEqual(/a/, /a/g)).toBe(false);
      expect(_.isEqual(/a/, /b/)).toBe(false);
      expect(_.isEqual(/a/gi, /a/gi)).toBe(true);

      // Simulate DOM element comparison
      const domElement1 = {nodeType: 1, a: 2};
      const domElement2 = {nodeType: 1, a: 2};
      expect(_.isEqual(domElement1, domElement2)).toBe(false);
      expect(_.isEqual(domElement2, domElement1)).toBe(false);
      expect(_.isEqual(domElement1, domElement1)).toBe(true);
      return expect(_.isEqual(domElement2, domElement2)).toBe(true);
    });

    it("calls custom equality methods with stacks so they can participate in cycle-detection", function() {
      class X {
        isEqual(b, aStack, bStack) {
          return _.isEqual(this.y, b.y, aStack, bStack);
        }
      }

      class Y {
        isEqual(b, aStack, bStack) {
          return _.isEqual(this.x, b.x, aStack, bStack);
        }
      }

      const x1 = new X;
      const y1 = new Y;
      x1.y = y1;
      y1.x = x1;

      const x2 = new X;
      const y2 = new Y;
      x2.y = y2;
      y2.x = x2;

      return expect(_.isEqual(x1, x2)).toBe(true);
    });

    return it("only accepts arrays as stack arguments to avoid accidentally calling with other objects", function() {
      expect(() => _.isEqual({}, {}, "junk")).not.toThrow();
      return expect(() => _.isEqual({}, {}, [], "junk")).not.toThrow();
    });
  });

  describe("::isEqualForProperties(a, b, properties...)", () => it("compares two objects for equality using just the specified properties", function() {
    expect(_.isEqualForProperties({a: 1, b: 2, c: 3}, {a: 1, b: 2, c: 4}, 'a', 'b')).toBe(true);
    return expect(_.isEqualForProperties({a: 1, b: 2, c: 3}, {a: 1, b: 2, c: 4}, 'a', 'c')).toBe(false);
  }));

  describe("::capitalize(word)", () => it("capitalizes the word", function() {
    expect(_.capitalize('')).toBe('');
    expect(_.capitalize(null)).toBe('');
    expect(_.capitalize()).toBe('');
    expect(_.capitalize('Github')).toBe('GitHub');
    return expect(_.capitalize('test')).toBe('Test');
  }));

  describe("::dasherize(word)", () => it("dasherizes the word", function() {
    expect(_.dasherize('')).toBe('');
    expect(_.dasherize(null)).toBe('');
    expect(_.dasherize()).toBe('');
    expect(_.dasherize('a_b')).toBe('a-b');
    return expect(_.dasherize('test')).toBe('test');
  }));

  describe("::uncamelcase(string)", () => it("uncamelcases the string", function() {
    expect(_.uncamelcase('')).toBe('');
    expect(_.uncamelcase(null)).toBe('');
    expect(_.uncamelcase()).toBe('');
    expect(_.uncamelcase('a_b')).toBe('A b');
    expect(_.uncamelcase('TheOffice')).toBe('The Office');
    expect(_.uncamelcase('theOffice')).toBe('The Office');
    expect(_.uncamelcase('test')).toBe('Test');
    expect(_.uncamelcase(' test ')).toBe('Test');
    return expect(_.uncamelcase('__ParksAndRec')).toBe('Parks And Rec');
  }));

  describe("::valueForKeyPath(object, keyPath)", function() {
    it("retrieves the value at the given key path or undefined if none exists", function() {
      const object = {a: {b: {c: 2}}};
      expect(_.valueForKeyPath(object, 'a.b.c')).toBe(2);
      expect(_.valueForKeyPath(object, 'a.b')).toEqual({c: 2});
      return expect(_.valueForKeyPath(object, 'a.x')).toBeUndefined();
    });

    it("retrieves the value at the when the key contains a dot", function() {
      const object = {a: {b: {'c\\.d': 2}}};
      expect(_.valueForKeyPath(object, 'a.b.c\\.d')).toBe(2);
      expect(_.valueForKeyPath(object, 'a.b')).toEqual({'c\\.d': 2});
      return expect(_.valueForKeyPath(object, 'a.x')).toBeUndefined();
    });

    return it("returns the object when no key path is given", function() {
      const object = {a: {b: {'c\\.d': 2}}};
      expect(_.valueForKeyPath(object, null)).toBe(object);
      return expect(_.valueForKeyPath(object)).toBe(object);
    });
  });

  describe("::setValueForKeyPath(object, keyPath, value)", function() {
    it("assigns a value at the given key path, creating intermediate objects if needed", function() {
      const object = {};
      _.setValueForKeyPath(object, 'a.b.c', 1);
      _.setValueForKeyPath(object, 'd', 2);
      return expect(object).toEqual({a: {b: {c: 1}}, d: 2});
  });

    return it("assigns a value at the given key path when the key has a dot in it", function() {
      const object = {};
      _.setValueForKeyPath(object, 'a.b.c', 1);
      _.setValueForKeyPath(object, 'd\\.e', 2);
      return expect(object).toEqual({a: {b: {c: 1}}, 'd\\.e': 2});
  });
});

  describe("::hasKeyPath(object, keyPath)", () => it("determines whether the given object has properties along the given key path", function() {
    const object = {
      a: {
        b: {
          c: 2
        },
        'd\\.e': 3
      }
    };
    expect(_.hasKeyPath(object, 'a')).toBe(true);
    expect(_.hasKeyPath(object, 'a.b.c')).toBe(true);
    expect(_.hasKeyPath(object, 'a.b.c.d')).toBe(false);
    expect(_.hasKeyPath(object, 'a.x')).toBe(false);
    return expect(_.hasKeyPath(object, 'a.d\\.e')).toBe(true);
  }));

  describe("deepClone(object)", () => it("clones nested object", function() {
    const object = {
      a: {
        b: 'test',
        c: {
          d() { return console.log('hi'); }
        },
        e: 3,
        f: [4, 'abc']
      }
    };

    return expect(_.deepClone(object)).toEqual(object);
  }));

  return describe("::escapeRegExp(string)", function() {
    it("returns a regular expression pattern that can will match the given string", function() {
      const check = function(source) {
        const regex = new RegExp(_.escapeRegExp(source));
        return expect(source.match(regex)[0]).toBe(source);
      };

      check('ab');
      check('a[b');
      check('a]b');
      check('a(b');
      check('a)b');
      check('a-b');
      check('[a-b]');
      check('a{2}b{3}');
      check('a|b');
      check('([a-b])');
      check('a?b?');
      return check('a...b...');
    });

    return it("returns a pattern that can be used within a character class", function() {
      const regex = new RegExp(`[${_.escapeRegExp("a-b")}]`);
      return expect("-".match(regex)[0]).toBe('-');
    });
  });
});

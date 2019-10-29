/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {allowUnsafeEval, allowUnsafeNewFunction} = require('../src/loophole');

describe("Loophole", function() {
  describe("allowUnsafeNewFunction", function() {
    it("allows functions to be created with no formal parameters", () => allowUnsafeNewFunction(function() {
      const f = new Function("return 1 + 1;");
      return expect(f()).toBe(2);
    }));

    it("allows functions to be created with formal parameters", () => allowUnsafeNewFunction(function() {
      const f = new Function("a, b", "c", "return a + b + c;");
      return expect(f(1, 2, 3)).toBe(6);
    }));

    it("supports Function.prototype.call", () => allowUnsafeNewFunction(function() {
      expect(Function.prototype.call).toBeDefined();
      const f = new Function("a, b", "c", "return a + b + c;");
      return expect(Function.prototype.call.call(f, null, 1, 2, 3)).toBe(6);
    }));

    it("supports Function.prototype.apply", () => allowUnsafeNewFunction(function() {
      expect(Function.prototype.apply).toBeDefined();
      const f = new Function("a, b", "c", "return a + b + c;");
      return expect(Function.prototype.apply.call(f, null, [1, 2, 3])).toBe(6);
    }));

    return it("returns the value that its body function returns", function() {
      const result = allowUnsafeNewFunction(() => 42);
      return expect(result).toBe(42);
    });
  });

  return describe("allowUnsafeEval", () => it("returns the value that its body function returns", function() {
    const result = allowUnsafeEval(() => 42);
    return expect(result).toBe(42);
  }));
});

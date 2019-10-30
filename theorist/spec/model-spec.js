/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {Behavior, Signal} = require('emissary');
const Model = require('../src/model');

describe("Model", function() {
  describe("declared properties", function() {
    it("assigns declared properties in the default constructor", function() {
      class TestModel extends Model {
        static initClass() {
          this.properties('foo', 'bar');
        }
      }
      TestModel.initClass();

      const model = new TestModel({foo: 1, bar: 2, baz: 3});
      expect(model.foo).toBe(1);
      expect(model.bar).toBe(2);
      return expect(model.baz).toBeUndefined();
    });

    it("allows declared properties to be associated with default values, which are assigned on construction", function() {
      class TestModel extends Model {
        static initClass() {
          this.properties({
            foo: 1,
            bar: 2,
            baz() { return defaultValue; }
          });
        }
      }
      TestModel.initClass();

      var defaultValue = 3;
      const model = new TestModel({foo: 4});
      defaultValue = 10;
      expect(model.foo).toBe(4);
      expect(model.bar).toBe(2);
      return expect(model.baz).toBe(3);
    });

    it("does not assign default values over existing values", function() {
      class TestModel extends Model {
        static initClass() {
          this.prototype.bar = 3;
          this.properties({
            foo: 1,
            bar: 2
          });
        }
      }
      TestModel.initClass();

      const model = Object.create(TestModel.prototype);
      model.bar = 3;
      TestModel.call(model);
      expect(model.foo).toBe(1);
      return expect(model.bar).toBe(3);
    });

    it("evaluates default values lazily if the constructor is overridden", function() {
      class TestModel extends Model {
        static initClass() {
          this.properties({
            foo() { return defaultValue; }});
        }

        constructor() {
          {
            // Hack: trick Babel/TypeScript into allowing this before super.
            if (false) { super(); }
            let thisFn = (() => { return this; }).toString();
            let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
            eval(`${thisName} = this;`);
          }
        }
      }
      TestModel.initClass();

      var defaultValue = 1;
      const model = new TestModel;
      defaultValue = 2;
      return expect(model.foo).toBe(2);
    });

    return it("associates declared properties with $-prefixed behavior accessors", function() {
      class TestModel extends Model {
        static initClass() {
          this.properties('foo', 'bar');
        }
      }
      TestModel.initClass();

      const model = new TestModel({foo: 1, bar: 2});

      const fooValues = [];
      const barValues = [];
      model.$foo.onValue(v => fooValues.push(v));
      model.$bar.onValue(v => barValues.push(v));

      model.foo = 10;
      model.set({foo: 20, bar: 21});
      model.foo = 20;

      expect(fooValues).toEqual([1, 10, 20]);
      return expect(barValues).toEqual([2, 21]);
  });
});

  describe(".behavior", function() {
    it("defines behavior accessors based on the given name and definition", function() {
      class TestModel extends Model {
        static initClass() {
          this.property('foo', 0);
          this.behavior('bar', function() { return this.$foo.map(v => v + 1); });
        }
      }
      TestModel.initClass();

      const model = new TestModel;

      expect(model.bar).toBe(1);
      const values = [];
      model.$bar.onValue(v => values.push(v));

      model.foo = 10;
      expect(model.bar).toBe(11);
      return expect(values).toEqual([1, 11]);
  });

    return it("releases behaviors when the model is destroyed", function() {
      const behavior = new Behavior(0);
      class TestModel extends Model {
        static initClass() {
          this.property('foo', 0);
          this.behavior('bar', () => behavior);
        }
      }
      TestModel.initClass();

      const model = new TestModel;
      model.bar; // force retention of behavior

      expect(behavior.retainCount).toBeGreaterThan(0);
      model.destroy();
      return expect(behavior.retainCount).toBe(0);
    });
  });

  describe("instance ids", function() {
    it("assigns a unique id to each model instance", function() {
      const model1 = new Model;
      const model2 = new Model;

      expect(model1.id).toBeDefined();
      expect(model2.id).toBeDefined();
      return expect(model1.id).not.toBe(model2.id);
    });

    return it("honors explicit id assignments in the params hash", function() {
      const model1 = new Model({id: 22});
      const model2 = new Model({id: 33});
      expect(model1.id).toBe(22);
      expect(model2.id).toBe(33);

      // auto-generates a higher id than what was explicitly assigned
      const model3 = new Model;
      return expect(model3.id).toBe(34);
    });
  });

  describe("::destroy()", () => it("marks the model as no longer alive, unsubscribes, calls an optional destroyed hook, and emits a 'destroyed' event", function() {
    let destroyedHandler;
    class TestModel extends Model {
      static initClass() {
        this.prototype.destroyedCallCount = 0;
      }
      destroyed() { return this.destroyedCallCount++; }
    }
    TestModel.initClass();

    const emitter = new Model;
    const model = new TestModel;
    model.subscribe(emitter, 'foo', function() {});
    model.on('destroyed', (destroyedHandler = jasmine.createSpy("destroyedHandler")));

    expect(model.isAlive()).toBe(true);
    expect(model.isDestroyed()).toBe(false);
    expect(emitter.getSubscriptionCount()).toBe(1);

    model.destroy();
    model.destroy();

    expect(model.isAlive()).toBe(false);
    expect(model.isDestroyed()).toBe(true);
    expect(model.destroyedCallCount).toBe(1);
    expect(destroyedHandler.callCount).toBe(1);
    return expect(emitter.getSubscriptionCount()).toBe(0);
  }));

  return describe("::when(signal, callback)", function() {
    describe("when called with a callback", () => it("calls the callback when the signal yields a truthy value", function() {
      let callback;
      const signal = new Signal;
      const model = new Model;
      model.when(signal, (callback = jasmine.createSpy("callback").andCallFake(function() { return expect(this).toBe(model); })));
      signal.emitValue(0);
      signal.emitValue(null);
      signal.emitValue('');
      expect(callback.callCount).toBe(0);
      signal.emitValue(1);
      return expect(callback.callCount).toBe(1);
    }));

    return describe("when called with a method name", () => it("calls the named method when the signal yields a truthy value", function() {
      const signal = new Signal;
      const model = new Model;
      model.action = jasmine.createSpy("action");
      model.when(signal, 'action');
      signal.emitValue(0);
      signal.emitValue(null);
      signal.emitValue('');
      expect(model.action.callCount).toBe(0);
      signal.emitValue(1);
      return expect(model.action.callCount).toBe(1);
    }));
  });
});

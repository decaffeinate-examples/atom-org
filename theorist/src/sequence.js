/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Sequence;
const {isEqual} = require('underscore-plus');
const {Emitter} = require('emissary');
const PropertyAccessors = require('property-accessors');

module.exports =
(Sequence = (function() {
  Sequence = class Sequence extends Array {
    static initClass() {
      Emitter.includeInto(this);
      PropertyAccessors.includeInto(this);
  
      this.prototype.suppressChangeEvents = false;
  
      this.prototype.lazyAccessor('$length', function() {
        return this.signal('changed').map(() => this.length).distinctUntilChanged().toBehavior(this.length);
      });
    }

    static fromArray(array) {
      if (array == null) { array = []; }
      array = array.slice();
      array.__proto__ = this.prototype;
      return array;
    }

    constructor(...elements) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      return Sequence.fromArray(elements);
    }

    set(index, value) {
      let insertedValues, removedValues;
      if (index >= this.length) {
        const oldLength = this.length;
        removedValues = [];
        this[index] = value;
        insertedValues = this.slice(oldLength, +(index + 1) + 1 || undefined);
        index = oldLength;
      } else {
        removedValues = [this[index]];
        insertedValues = [value];
        this[index] = value;
      }

      return this.emitChanged({index, removedValues, insertedValues});
    }

    splice(index, count, ...insertedValues) {
      const removedValues = super.splice(...arguments);
      this.emitChanged({index, removedValues, insertedValues});
      return removedValues;
    }

    push(...insertedValues) {
      const index = this.length;
      this.suppressChangeEvents = true;
      const result = super.push(...arguments);
      this.suppressChangeEvents = false;
      this.emitChanged({index, removedValues: [], insertedValues});
      return result;
    }

    pop() {
      this.suppressChangeEvents = true;
      const result = super.pop(...arguments);
      this.suppressChangeEvents = false;
      this.emitChanged({index: this.length, removedValues: [result], insertedValues: []});
      return result;
    }

    unshift(...insertedValues) {
      this.suppressChangeEvents = true;
      const result = super.unshift(...arguments);
      this.suppressChangeEvents = false;
      this.emitChanged({index: 0, removedValues: [], insertedValues});
      return result;
    }

    shift() {
      this.suppressChangeEvents = true;
      const result = super.shift(...arguments);
      this.suppressChangeEvents = false;
      this.emitChanged({index: 0, removedValues: [result], insertedValues: []});
      return result;
    }

    isEqual(other) {
      let v;
      return (this === other) || isEqual(((() => {
        const result = [];
        for (v of Array.from(this)) {           result.push(v);
        }
        return result;
      })()), ((() => {
        const result1 = [];
        for (v of Array.from(other)) {           result1.push(v);
        }
        return result1;
      })()));
    }

    onEach(callback) {
      this.forEach(callback);
      return this.on('changed', ({index, insertedValues}) => Array.from(insertedValues).map((value, i) =>
        callback(value, index + i)));
    }

    onRemoval(callback) {
      return this.on('changed', ({index, removedValues}) => Array.from(removedValues).map((value) =>
        callback(value, index)));
    }

    setLength(length) {
      let index, insertedValues, removedValues;
      if (length < this.length) {
        index = length;
        removedValues = this.slice(index);
        insertedValues = [];
        this.length = length;
        return this.emitChanged({index, removedValues, insertedValues});
      } else if (length > this.length) {
        index = this.length;
        removedValues = [];
        this.length = length;
        insertedValues = this.slice(index);
        return this.emitChanged({index, removedValues, insertedValues});
      }
    }

    emitChanged(event) {
      if (!this.suppressChangeEvents) { return this.emit('changed', event); }
    }
  };
  Sequence.initClass();
  return Sequence;
})());

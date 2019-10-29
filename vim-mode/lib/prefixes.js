/** @babel */
/* eslint-disable
    constructor-super,
    no-constant-condition,
    no-eval,
    no-return-assign,
    no-this-before-super,
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
class Prefix {
  static initClass () {
    this.prototype.complete = null
    this.prototype.composedObject = null
  }

  isComplete () { return this.complete }

  isRecordable () { return this.composedObject.isRecordable() }

  // Public: Marks this as complete upon receiving an object to compose with.
  //
  // composedObject - The next motion or operator.
  //
  // Returns nothing.
  compose (composedObject) {
    this.composedObject = composedObject
    return this.complete = true
  }

  // Public: Executes the composed operator or motion.
  //
  // Returns nothing.
  execute () {
    return (typeof this.composedObject.execute === 'function' ? this.composedObject.execute(this.count) : undefined)
  }

  // Public: Selects using the composed motion.
  //
  // Returns an array of booleans representing whether each selections' success.
  select () {
    return (typeof this.composedObject.select === 'function' ? this.composedObject.select(this.count) : undefined)
  }

  isLinewise () {
    return (typeof this.composedObject.isLinewise === 'function' ? this.composedObject.isLinewise() : undefined)
  }
}
Prefix.initClass()

//
// Used to track the number of times either a motion or operator should
// be repeated.
//
class Repeat extends Prefix {
  static initClass () {
    this.prototype.count = null
  }

  // count - The initial digit of the repeat sequence.
  constructor (count) {
    { // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super() } const thisFn = (() => { return this }).toString(); const thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1]; eval(`${thisName} = this;`) } this.count = count; this.complete = false
  }

  // Public: Adds an additional digit to this repeat sequence.
  //
  // digit - A single digit, 0-9.
  //
  // Returns nothing.
  addDigit (digit) {
    return this.count = (this.count * 10) + digit
  }
}
Repeat.initClass()

//
// Used to track which register the following operator should operate on.
//
class Register extends Prefix {
  static initClass () {
    this.prototype.name = null
  }

  // name - The single character name of the desired register
  constructor (name) {
    { // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super() } const thisFn = (() => { return this }).toString(); const thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1]; eval(`${thisName} = this;`) } this.name = name; this.complete = false
  }

  // Public: Marks as complete and sets the operator's register if it accepts it.
  //
  // composedOperator - The operator this register pertains to.
  //
  // Returns nothing.
  compose (composedObject) {
    super.compose(composedObject)
    if (composedObject.register != null) { return composedObject.register = this.name }
  }
}
Register.initClass()

module.exports = { Repeat, Register }

/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Parameter;
const Node      = require('./node');

const _         = require('underscore');
_.str     = require('underscore.string');

// Public: The Node representation of a CoffeeScript method parameter.
module.exports = (Parameter = class Parameter extends Node {

  // Public: Construct a parameter node.
  //
  // node - The node (a {Object})
  // options - The parser options (a {Object})
  // optionized - A {Boolean} indicating if the parameter is a set of options
  constructor(node, options, optionized) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }
      let thisFn = (() => { return this; }).toString();
      let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
      eval(`${thisName} = this;`);
    }
    this.node = node;
    this.options = options;
    this.optionized = optionized;
  }

  // Public: Get the full parameter signature.
  //
  // Returns the signature (a {String}).
  getSignature() {
    try {
      if (!this.signature) {
        this.signature = this.getName();

        if (this.isSplat()) {
          this.signature += '...';
        }

        const value = this.getDefault();
        if (value) { this.signature += ` = ${ value.replace(/\n\s*/g, ' ') }`; }
      }

      return this.signature;

    } catch (error) {
      if (this.options.verbose) { return console.warn('Get parameter signature error:', this.node, error); }
    }
  }

  // Public: Get the parameter name
  //
  // Returns the name (a {String}).
  getName(i) {
    if (i == null) { i = -1; }
    try {
      // params like `method: ({option1, option2}) ->`
      if (this.optionized && (i >= 0)) {
        this.name = this.node.name.properties[i].base.value;
      }

      if (!this.name) {

        // Normal attribute `do: (it) ->`
        this.name = this.node.name.value;

        if (!this.name) {
          if (this.node.name.properties) {
            // Assigned attributes `do: (@it) ->`
            this.name = __guard__(this.node.name.properties[0] != null ? this.node.name.properties[0].name : undefined, x => x.value);
          }
        }
      }

      return this.name;

    } catch (error) {
      if (this.options.verbose) { return console.warn('Get parameter name error:', this.node, error); }
    }
  }

  // Public: Get the parameter default value
  //
  // Returns the default (a {String}).
  getDefault(i) {
    if (i == null) { i = -1; }
    try {
      // for optionized arguments
      if (this.optionized && (i >= 0)) {
        return _.str.strip((this.node.value != null ? this.node.value.compile({ indent: '' }) : undefined).slice(1, +-2 + 1 || undefined).split(",")[i]).split(": ")[1];
      } else {
        return (this.node.value != null ? this.node.value.compile({ indent: '' }) : undefined);
      }

    } catch (error) {
      if (__guard__(__guard__(this.node != null ? this.node.value : undefined, x1 => x1.base), x => x.value) === 'this') {
        return `@${ (this.node.value.properties[0] != null ? this.node.value.properties[0].name.compile({ indent: '' }) : undefined) }`;
      } else {
        if (this.options.verbose) { return console.warn('Get parameter default error:', this.node, error); }
      }
    }
  }

  // Public: Gets the defaults of the optionized parameters.
  //
  // Returns the defaults as a {String}.
  getOptionizedDefaults() {
    if (this.node.value == null) { return ''; }

    const defaults = [];
    for (let k of Array.from(this.node.value.compile({ indent: '' }).split("\n").slice(1, +-2 + 1 || undefined))) {
      defaults.push(_.str.strip(k.split(":")[0]));
    }

    return "{" + defaults.join(",") + "}";
  }

  // Public: Checks if the parameters is a splat
  //
  // Returns `true` if a splat (a {Boolean}).
  isSplat() {
    try {
      return this.node.splat === true;

    } catch (error) {
      if (this.options.verbose) { return console.warn('Get parameter splat type error:', this.node, error); }
    }
  }
});

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
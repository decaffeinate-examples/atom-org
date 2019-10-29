/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Variable;
const Node      = require('./node');
const Doc      = require('./doc');

// Public: The Node representation of a CoffeeScript variable.
module.exports = (Variable = class Variable extends Node {

  // Public: Construct a variable node.
  //
  // entity - The variable's {Class}
  // node - The variable node (a {Object})
  // lineMapping - An object mapping the actual position of a member to its Donna one
  // options - The parser options (a {Object})
  // classType - A {Boolean} indicating if the class is a `class` or an `instance`
  // comment - The comment node (a {Object})
  constructor(entity, node, lineMapping, options, classType, comment = null) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }
      let thisFn = (() => { return this; }).toString();
      let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
      eval(`${thisName} = this;`);
    }
    this.entity = entity;
    this.node = node;
    this.lineMapping = lineMapping;
    this.options = options;
    if (classType == null) { classType = false; }
    this.classType = classType;
    try {
      this.doc = new Doc(comment, this.options);
      this.getName();

    } catch (error) {
      if (this.options.verbose) { console.warn('Create variable error:', this.node, error); }
    }
  }

  // Public: Get the variable type, either `class` or `constant`
  //
  // Returns the variable type (a {String}).
  getType() {
    if (!this.type) {
      this.type = this.classType ? 'class' : 'instance';
    }

    return this.type;
  }

  // Public: Test if the given value should be treated ad constant.
  //
  // Returns true if a constant (a {Boolean})
  //
  isConstant() {
    if (!this.constant) {
      this.constant = /^[A-Z_-]*$/.test(this.getName());
    }

    return this.constant;
  }

  // Public: Get the class doc
  //
  // Returns the class doc (a [Doc]).
  getDoc() { return this.doc; }

  // Public: Get the variable name
  //
  // Returns the variable name (a {String}).
  getName() {
    try {
      if (!this.name) {
        this.name = this.node.variable.base.value;

        for (let prop of Array.from(this.node.variable.properties)) {
          this.name += `.${ prop.name.value }`;
        }

        if (/^this\./.test(this.name)) {
          this.name = this.name.substring(5);
          this.type = 'class';
        }
      }

      return this.name;

    } catch (error) {
      if (this.options.verbose) { return console.warn('Get method name error:', this.node, error); }
    }
  }


  // Public: Get the source line number
  //
  // Returns a {Number}.
  getLocation() {
    try {
      if (!this.location) {
        const {locationData} = this.node.variable;
        const firstLine = locationData.first_line + 1;
        if ((this.lineMapping[firstLine] == null)) {
          this.lineMapping[firstLine] = this.lineMapping[firstLine - 1];
        }

        this.location = { line: this.lineMapping[firstLine] };
      }

      return this.location;

    } catch (error) {
      if (this.options.verbose) { return console.warn(`Get location error at ${this.fileName}:`, this.node, error); }
    }
  }

  // Public: Get the variable value.
  //
  // Returns the value (a {String}).
  getValue() {
    try {
      if (!this.value) {
        this.value = this.node.value.base.compile({ indent: '' });
      }

      return this.value;

    } catch (error) {
      if (this.options.verbose) { return console.warn('Get method value error:', this.node, error); }
    }
  }
});

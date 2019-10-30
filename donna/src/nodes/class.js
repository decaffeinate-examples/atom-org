/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Class;
const Node          = require('./node');
const Method        = require('./method');
const VirtualMethod = require('./virtual_method');
const Variable      = require('./variable');
const Property      = require('./property');
const Doc           = require('./doc');
const _             = require('underscore');

// Public: The Node representation of a CoffeeScript class.
module.exports = (Class = class Class extends Node {

  // Constructs a class.
  //
  // node - The class node (a {Object})
  // fileName - The filename (a {String})
  // options - The parser options (a {Object})
  // comment - The comment node (a {Object})
  constructor(node, fileName, lineMapping, options, comment) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }
      let thisFn = (() => { return this; }).toString();
      let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
      eval(`${thisName} = this;`);
    }
    this.node = node;
    this.fileName = fileName;
    this.lineMapping = lineMapping;
    this.options = options;
    try {
      this.methods = [];
      this.variables = [];
      this.properties = [];

      this.doc = new Doc(comment, this.options);

      if (this.doc.methods) {
        for (let method of Array.from((this.doc != null ? this.doc.methods : undefined))) { this.methods.push(new VirtualMethod(this, method, this.lineMapping, this.options)); }
      }

      let previousExp = null;

      for (let exp of Array.from(this.node.body.expressions)) {
        var doc, property, variable;
        switch (exp.constructor.name) {

          case 'Assign':
            if ((previousExp != null ? previousExp.constructor.name : undefined) === 'Comment') { doc = previousExp; }
            if (!doc) { doc = swallowedDoc; }

            switch ((exp.value != null ? exp.value.constructor.name : undefined)) {
              case 'Code':
                if (exp.variable.base.value === 'this') { this.methods.push(new Method(this, exp, this.lineMapping, this.options, doc)); }
                break;
              case 'Value':
                this.variables.push(new Variable(this, exp, this.lineMapping, this.options, true, doc));
                break;
            }

            doc = null;
            break;

          case 'Value':
            var previousProp = null;

            for (let prop of Array.from(exp.base.properties)) {
              if ((previousProp != null ? previousProp.constructor.name : undefined) === 'Comment') { doc = previousProp; }
              if (!doc) { doc = swallowedDoc; }

              switch ((prop.value != null ? prop.value.constructor.name : undefined)) {
                case 'Code':
                  this.methods.push(new Method(this, prop, this.lineMapping, this.options, doc));
                  break;
                case 'Value':
                  variable =  new Variable(this, prop, this.lineMapping, this.options, false, doc);

                  if (variable.doc != null ? variable.doc.property : undefined) {
                    property = new Property(this, prop, this.lineMapping, this.options, variable.getName(), doc);
                    property.setter = true;
                    property.getter = true;
                    this.properties.push(property);
                  } else {
                    this.variables.push(variable);
                  }
                  break;
              }

              doc = null;
              previousProp = prop;
            }
            break;

          case 'Call':
            if ((previousExp != null ? previousExp.constructor.name : undefined) === 'Comment') { doc = previousExp; }
            if (!doc) { doc = swallowedDoc; }

            var type = __guard__(exp.variable != null ? exp.variable.base : undefined, x => x.value);
            var name = __guard__(__guard__(__guard__(__guard__(__guard__(__guard__(exp.args != null ? exp.args[0] : undefined, x6 => x6.base), x5 => x5.properties), x4 => x4[0]), x3 => x3.variable), x2 => x2.base), x1 => x1.value);

            // This is a workaround for a strange CoffeeScript bug:
            // Given the following snippet:
            //
            // class Test
            //   # Doc a
            //   set name: ->
            //
            //   # Doc B
            //   set another: ->
            //
            // This will be converted to:
            //
            // class Test
            //   ###
            //   Doc A
            //   ###
            //   set name: ->
            //
            //   ###
            //   Doc B
            //   ###
            //   set another: ->
            //
            // BUT, Doc B is now a sibling property of the previous `set name: ->` setter!
            //
            var swallowedDoc = __guard__(__guard__(__guard__(exp.args != null ? exp.args[0] : undefined, x9 => x9.base), x8 => x8.properties), x7 => x7[1]);

            if (name && ((type === 'set') || (type === 'get'))) {
              property = _.find(this.properties, p => p.name === name);

              if (!property) {
                property = new Property(this, exp, this.smc, this.options, name, doc);
                this.properties.push(property);
              }

              if (type === 'set') { property.setter = true; }
              if (type === 'get') { property.getter = true; }

              doc = null;
            }
            break;
        }

        previousExp = exp;
      }

    } catch (error) {
      if (this.options.verbose) { console.warn('Create class error:', this.node, error); }
    }
  }

  // Public: Get the source file name.
  //
  // Returns the filename of the class (a {String})
  getFileName() { return this.fileName; }

  // Public: Get the class doc
  //
  // Returns the class doc (a [Doc])
  getDoc() { return this.doc; }

  // Public: Alias for {::getClassName}
  //
  // Returns the full class name (a {String})
  getFullName() {
    return this.getClassName();
  }

  // Public: Get the full class name
  //
  // Returns the class (a {String})
  getClassName() {
    try {
      if (!this.className && !!this.node.variable) {
        let prop;
        this.className = this.node.variable.base.value;

        // Inner class definition inherits
        // the namespace from the outer class
        if (this.className === 'this') {
          const outer = this.findAncestor('Class');

          if (outer) {
            this.className = outer.variable.base.value;
            for (prop of Array.from(outer.variable.properties)) {
              this.className += `.${ prop.name.value }`;
            }

          } else {
            this.className = '';
          }
        }

        for (prop of Array.from(this.node.variable.properties)) {
          this.className += `.${ prop.name.value }`;
        }
      }

      return this.className;

    } catch (error) {
      if (this.options.verbose) { return console.warn(`Get class classname error at ${this.fileName}:`, this.node, error); }
    }
  }

  // Public: Get the class name
  //
  // Returns the name (a {String})
  getName() {
    try {
      if (!this.name) {
        this.name = this.getClassName().split('.').pop();
      }

      return this.name;

    } catch (error) {
      if (this.options.verbose) { return console.warn(`Get class name error at ${this.fileName}:`, this.node, error); }
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

  // Public: Get the class namespace
  //
  // Returns the namespace (a {String}).
  getNamespace() {
    try {
      if (!this.namespace) {
        this.namespace = this.getClassName().split('.');
        this.namespace.pop();

        this.namespace = this.namespace.join('.');
      }

      return this.namespace;

    } catch (error) {
      if (this.options.verbose) { return console.warn(`Get class namespace error at ${this.fileName}:`, this.node, error); }
    }
  }

  // Public: Get the full parent class name
  //
  // Returns the parent class name (a {String}).
  getParentClassName() {
    try {
      if (!this.parentClassName) {
        if (this.node.parent) {
          let prop;
          this.parentClassName = this.node.parent.base.value;

          // Inner class parent inherits
          // the namespace from the outer class parent
          if (this.parentClassName === 'this') {
            const outer = this.findAncestor('Class');

            if (outer) {
              this.parentClassName = outer.parent.base.value;
              for (prop of Array.from(outer.parent.properties)) {
                this.parentClassName += `.${ prop.name.value }`;
              }

            } else {
              this.parentClassName = '';
            }
          }

          for (prop of Array.from(this.node.parent.properties)) {
            this.parentClassName += `.${ prop.name.value }`;
          }
        }
      }

      return this.parentClassName;

    } catch (error) {
      if (this.options.verbose) { return console.warn(`Get class parent classname error at ${this.fileName}:`, this.node, error); }
    }
  }

  // Public: Get all methods.
  //
  // Returns the methods as an {Array}.
  getMethods() { return this.methods; }

  // Public: Get all variables.
  //
  // Returns the variables as an {Array}.
  getVariables() { return this.variables; }
});

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let VirtualMethod;
const Node      = require('./node');
const Parameter = require('./parameter');
const Doc       = require('./doc');

const _         = require('underscore');
_.str     = require('underscore.string');

// Public: The Node representation of a CoffeeScript  virtual method that has
// been declared by the `@method` tag.
module.exports = (VirtualMethod = class VirtualMethod extends Node {

  // Public: Construct a virtual method node.
  //
  // entity - The method's {Class}
  // doc - The property node (a {Object})
  // options - The parser options (a {Object})
  constructor(entity, doc, options) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }
      let thisFn = (() => { return this; }).toString();
      let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
      eval(`${thisName} = this;`);
    }
    this.entity = entity;
    this.doc = doc;
    this.options = options;
  }

  // Public: Get the method type, either `class`, `instance` or `mixin`.
  //
  // Returns the method type (a {String}).
  getType() {
    if (!this.type) {
      if (this.doc.signature.substring(0, 1) === '.') {
        this.type = 'instance';
      } else if (this.doc.signature.substring(0, 1) === '@') {
        this.type = 'class';
      } else {
        this.type = 'mixin';
      }
    }

    return this.type;
  }

  // Public: Get the class doc
  //
  // Returns the class doc (a {Doc}).
  getDoc() { return this.doc; }

  // Public: Get the full method signature.
  //
  // Returns the signature (a {String}).
  getSignature() {
    try {
      if (!this.signature) {
        this.signature = (() => { switch (this.getType()) {
                     case 'class':
                       return '+ ';
                     case 'instance':
                       return '- ';
                     default:
                       return '? ';
        } })();

        if (this.getDoc()) {
          this.signature += this.getDoc().returnValue ? `(${ _.str.escapeHTML(this.getDoc().returnValue.type) }) ` : "(void) ";
        }

        this.signature += `<strong>${ this.getName() }</strong>`;
        this.signature += '(';

        const params = [];

        for (let param of Array.from(this.getParameters())) {
          params.push(param.name);
        }

        this.signature += params.join(', ');
        this.signature += ')';
      }

      return this.signature;

    } catch (error) {
      if (this.options.verbose) { return console.warn('Get method signature error:', this.node, error); }
    }
  }

  // Public: Get the short method signature.
  //
  // Returns the short signature (a {String}).
  getShortSignature() {
    try {
      if (!this.shortSignature) {
        this.shortSignature = (() => { switch (this.getType()) {
                          case 'class':
                            return '@';
                          case 'instance':
                            return '.';
                          default:
                            return '';
        } })();
        this.shortSignature += this.getName();
      }

      return this.shortSignature;

    } catch (error) {
      if (this.options.verbose) { return console.warn('Get method short signature error:', this.node, error); }
    }
  }

  // Public: Get the method name
  //
  // Returns the method name (a {String}).
  getName() {
    try {
      let name;
      if (!this.name) {
        if ((name = /[.#]?([$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*)/i.exec(this.doc.signature))) {
          this.name = name[1];
        } else {
          this.name = 'unknown';
        }
      }

      return this.name;

    } catch (error) {
      if (this.options.verbose) { return console.warn('Get method name error:', this.node, error); }
    }
  }

  // Public: Get the method parameters
  //
  // params - The method parameters
  getParameters() { return this.doc.params || []; }

  // Public: Get the method source in CoffeeScript
  //
  // Returns the CoffeeScript source (a {String}).
  getCoffeeScriptSource() {}

  // Public: Get the method source in JavaScript
  //
  // Returns the JavaScript source (a {String}).
  getJavaScriptSource() {}
});

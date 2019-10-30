/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Referencer;
const _ = require('underscore');
const path = require('path');
const fs = require('fs');

// Public: Responsible for resolving class references.
//
module.exports = (Referencer = class Referencer {

  // Public: Construct a referencer.
  //
  // classes - All known classes
  // mixins - All known mixins
  // options - the parser options (a {Object})
  constructor(classes, mixins, options) {
    this.classes = classes;
    this.mixins = mixins;
    this.options = options;
    this.readStandardJSON();
    this.resolveParamReferences();
    this.errors = 0;
  }

  // Public: Get all direct subclasses.
  //
  // clazz - The parent class (a {Class})
  //
  // Returns an {Array} of {Class}es.
  getDirectSubClasses(clazz) {
    return _.filter(this.classes, cl => cl.getParentClassName() === clazz.getFullName());
  }

  // Public: Get all inherited methods.
  //
  // clazz - The parent class (a {Class})
  //
  // Returns the inherited methods.
  getInheritedMethods(clazz) {
    if (!_.isEmpty(clazz.getParentClassName())) {
      const parentClass = _.find(this.classes, c => c.getFullName() === clazz.getParentClassName());
      if (parentClass) { return _.union(parentClass.getMethods(), this.getInheritedMethods(parentClass)); } else { return []; }

    } else {
      return [];
    }
  }

  // Public: Get all included mixins in the class hierarchy.
  //
  // clazz - The parent class (a {Class})
  //
  // Returns an {Array} of {Mixin}s.
  getIncludedMethods(clazz) {
    let result = {};

    for (let mixin of Array.from((clazz.doc != null ? clazz.doc.includeMixins : undefined) || [])) {
      result[mixin] = this.resolveMixinMethods(mixin);
    }

    if (!_.isEmpty(clazz.getParentClassName())) {
      const parentClass = _.find(this.classes, c => c.getFullName() === clazz.getParentClassName());

      if (parentClass) {
        result = _.extend({}, this.getIncludedMethods(parentClass), result);
      }
    }

    return result;
  }

  // Public: Get all extended mixins in the class hierarchy.
  //
  // clazz - The parent class (a {Class})
  //
  // Returns an {Array} of {Mixin}s.
  getExtendedMethods(clazz) {
    let result = {};

    for (let mixin of Array.from((clazz.doc != null ? clazz.doc.extendMixins : undefined) || [])) {
      result[mixin] = this.resolveMixinMethods(mixin);
    }

    if (!_.isEmpty(clazz.getParentClassName())) {
      const parentClass = _.find(this.classes, c => c.getFullName() === clazz.getParentClassName());

      if (parentClass) {
        result = _.extend({}, this.getExtendedMethods(parentClass), result);
      }
    }

    return result;
  }

  // Public: Get all concerns methods.
  //
  // clazz - The parent class (a {Class})
  //
  // Returns an {Array} of concern {Method}s.
  getConcernMethods(clazz) {
    let result = {};

    for (let mixin of Array.from((clazz.doc != null ? clazz.doc.concerns : undefined) || [])) {
      result[mixin] = this.resolveMixinMethods(mixin);
    }

    if (!_.isEmpty(clazz.getParentClassName())) {
      const parentClass = _.find(this.classes, c => c.getFullName() === clazz.getParentClassName());

      if (parentClass) {
        result = _.extend({}, this.getConcernMethods(parentClass), result);
      }
    }

    return result;
  }

  // Public: Get a list of all methods from the given mixin name
  //
  // name - The full name of the {Mixin}
  //
  // Returns the mixin methods as an {Array}.
  resolveMixinMethods(name) {
    const mixin = _.find(this.mixins, m => m.getMixinName() === name);

    if (mixin) {
      return mixin.getMethods();
    } else {
      if (!this.options.quiet) { console.log(`[WARN] Cannot resolve mixin name ${ name }`); }
      this.errors++;
      return [];
    }
  }

  // Public: Get all inherited variables.
  //
  // clazz - The parent class (a {Class})
  //
  // Returns an {Array} of {Variable}s.
  getInheritedVariables(clazz) {
    if (!_.isEmpty(clazz.getParentClassName())) {
      const parentClass = _.find(this.classes, c => c.getFullName() === clazz.getParentClassName());
      if (parentClass) { return _.union(parentClass.getVariables(), this.getInheritedVariables(parentClass)); } else { return []; }

    } else {
      return [];
    }
  }

  // Public: Get all inherited constants.
  //
  // clazz - The parent class (a {Class})
  //
  // Returns an {Array} of {Variable}s that are constants.
  getInheritedConstants(clazz) {
    return _.filter(this.getInheritedVariables(clazz), v => v.isConstant());
  }

  // Public: Get all inherited properties.
  //
  // clazz - The parent class (a {Class})
  //
  // Returns an {Array} of {Property} types.
  getInheritedProperties(clazz) {
    if (!_.isEmpty(clazz.getParentClassName())) {
      const parentClass = _.find(this.classes, c => c.getFullName() === clazz.getParentClassName());
      if (parentClass) { return _.union(parentClass.properties, this.getInheritedProperties(parentClass)); } else { return []; }

    } else {
      return [];
    }
  }

  // Public: Creates browsable links for known entities.
  //
  // See {::getLink}.
  //
  // text - The text to parse (a {String})
  // path - The path prefix (a {String})
  //
  // Returns the processed text (a {String})
  linkTypes(text, path) {
    if (text == null) { text = ''; }
    text = text.split(',');

    text = Array.from(text).map((t) =>
      this.linkType(t.trim(), path));

    return text.join(', ');
  }

  // Public: Create browsable links to a known entity.
  //
  // See {::getLink}.
  //
  // text - The text to parse (a {String})
  // path - The path prefix (a {String})
  //
  // Returns the processed text (a {String})
  linkType(text, path) {
    if (text == null) { text = ''; }
    text = _.str.escapeHTML(text);

    for (let clazz of Array.from(this.classes)) {
      text = text.replace(new RegExp(`^(${ clazz.getFullName() })$`, 'g'), `<a href='${ path }classes/${ clazz.getFullName().replace(/\./g, '/') }.html'>$1</a>`);
      text = text.replace(new RegExp(`(&lt;|[])(${ clazz.getFullName() })(&gt;|[,])`, 'g'), `$1<a href='${ path }classes/${ clazz.getFullName().replace(/\./g, '/') }.html'>$2</a>$3`);
    }

    return text;
  }

  // Public: Get the link to classname.
  //
  // See {::linkTypes}.
  //
  // classname - The class name (a {String})
  // path - The path prefix (a {String})
  //
  // Returns the link (if any)
  getLink(classname, path) {
    for (let clazz of Array.from(this.classes)) {
      if (classname === clazz.getFullName()) { return `${ path }classes/${ clazz.getFullName().replace(/\./g, '/') }.html`; }
    }

    return undefined;
  }

  // Public: Resolve all tags on class and method json output.
  //
  // data - The JSON data (a {Object})
  // entity - The entity context (a {Class})
  // path - The path to the asset root (a {String})
  //
  // Returns the JSON data with resolved references (a {Object})
  resolveDoc(data, entity, path) {
    if (data.doc) {
      let index, name, option, options;
      if (data.doc.see) {
        for (let see of Array.from(data.doc.see)) {
          this.resolveSee(see, entity, path);
        }
      }

      if (_.isString(data.doc.abstract)) {
        data.doc.abstract = this.resolveTextReferences(data.doc.abstract, entity, path);
      }

      if (_.isString(data.doc.summary)) {
        data.doc.summary = this.resolveTextReferences(data.doc.summary, entity, path);
      }

      for (name in data.doc.options) {
        options = data.doc.options[name];
        if (options == null) { continue; }
        for (index = 0; index < options.length; index++) {
          option = options[index];
          data.doc.options[name][index].desc = this.resolveTextReferences(option.desc, entity, path);
        }
      }

      for (name in data.doc.params) {
        const param = data.doc.params[name];
        data.doc.params[name].desc = this.resolveTextReferences(param.desc, entity, path);

        for (option of Array.from(param.options != null ? param.options : [])) {
          option.desc = this.resolveTextReferences(option.desc, entity, path);
        }
      }

      if (data.doc.notes) {
        for (index = 0; index < data.doc.notes.length; index++) {
          const note = data.doc.notes[index];
          data.doc.notes[index] = this.resolveTextReferences(note, entity, path);
        }
      }

      if (data.doc.todos) {
        for (index = 0; index < data.doc.todos.length; index++) {
          const todo = data.doc.todos[index];
          data.doc.todos[index] = this.resolveTextReferences(todo, entity, path);
        }
      }

      if (data.doc.examples) {
        for (index = 0; index < data.doc.examples.length; index++) {
          const example = data.doc.examples[index];
          data.doc.examples[index].title = this.resolveTextReferences(example.title, entity, path);
        }
      }

      if (_.isString(data.doc.deprecated)) {
        data.doc.deprecated = this.resolveTextReferences(data.doc.deprecated, entity, path);
      }

      if (data.doc.comment) {
        data.doc.comment = this.resolveTextReferences(data.doc.comment, entity, path);
      }

      for (let returnValue of Array.from(data.doc.returnValue != null ? data.doc.returnValue : [])) {
        returnValue.desc = this.resolveTextReferences(returnValue.desc, entity, path);

        for (option of Array.from(returnValue.options != null ? returnValue.options : [])) {
          option.desc = this.resolveTextReferences(option.desc, entity, path);
        }
      }

      if (data.doc.throwValue) {
        for (index = 0; index < data.doc.throwValue.length; index++) {
          const throws = data.doc.throwValue[index];
          data.doc.throwValue[index].desc = this.resolveTextReferences(throws.desc, entity, path);
        }
      }
    }

    return data;
  }

  // Public: Search a text to find see links wrapped in curly braces.
  //
  // Examples
  //
  //   "To get a list of all customers, go to {Customers.getAll}"
  //
  // text - The text to search (a {String})
  //
  // Returns the text with hyperlinks (a {String})
  resolveTextReferences(text, entity, path) {
    // Make curly braces within code blocks undetectable
    if (text == null) { text = ''; }
    text = text.replace(/`(.|\n)+?`/mg, match => match.replace(/{/mg, "\u0091").replace(/}/mg, "\u0092"));

    // Search for references and replace them
    text = text.replace(/(?:\[((?:\[[^\]]*\]|[^\]]|\](?=[^\[]*\]))*)\])?\{([^\}]+)\}/gm, (match, label, link) => {
      // Remove the markdown generated autolinks
      link = link.replace(/<.+?>/g, '').split(' ');
      const href = link.shift();
      label = _.str.strip(label);

      if (label.length < 2) {
        label = "";
      }

      const see = this.resolveSee({ reference: href, label }, entity, path);

      if (see.reference) {
        return `<a href='${ see.reference }'>${ see.label }</a>`;
      } else {
        return match;
      }
    });

    // Restore curly braces within code blocks
    return text = text.replace(/<code(\s+[^>]*)?>(.|\n)+?<\/code>/mg, match => match.replace(/\u0091/mg, '{').replace(/\u0092/mg, '}'));
  }

  // Public: Resolves delegations; that is, methods whose source content come from
  // another file.
  //
  // These are basically conrefs.
  resolveDelegation(origin, ref, entity) {

    // Link to direct class methods
    let match, methods;
    if (/^\@/.test(ref)) {
      methods = _.map(_.filter(entity.getMethods(), m => _.indexOf(['class', 'mixin'], m.getType()) >= 0), m => m);

      match = _.find(methods, m => ref.substring(1) === m.getName());

      if (match) {
        if (match.doc.delegation) {
          return this.resolveDelegation(origin, match.doc.delegation, entity);
        } else {
          return [ _.clone(match.doc), match.parameters ];
        }
      } else {
        if (!this.options.quiet) { console.log(`[WARN] Cannot resolve delegation to ${ ref } in ${ entity.getFullName() }`); }
        this.errors++;
      }

    // Link to direct instance methods
    } else if (/^\./.test(ref)) {
      methods = _.map(_.filter(entity.getMethods(), m => m.getType() === 'instance'), m => m);

      match = _.find(methods, m => ref.substring(1) === m.getName());

      if (match) {
        if (match.doc.delegation) {
          return this.resolveDelegation(origin, match.doc.delegation, entity);
        } else {
          return [ _.clone(match.doc), match.parameters ];
        }
      } else {
        if (!this.options.quiet) { console.log(`[WARN] Cannot resolve delegation to ${ ref } in ${ entity.getFullName() }`); }
        this.errors++;
      }

     // Link to other objects
     } else {

      // Get class and method reference
      let otherEntity;
      if (match = /^(.*?)([.@][$a-z_\x7f-\uffff][$\w\x7f-\uffff]*)?$/.exec(ref)) {
        const refClass = match[1];
        const refMethod = match[2];
        otherEntity   = _.find(this.classes, c => c.getFullName() === refClass);
        if (!otherEntity) { otherEntity = _.find(this.mixins, c => c.getFullName() === refClass); }

        if (otherEntity) {
          // Link to another class
          if (_.isUndefined(refMethod)) {
            // if _.include(_.map(@classes, (c) -> c.getFullName()), refClass) || _.include(_.map(@mixins, (c) -> c.getFullName()), refClass)
            //   see.reference = "#{ path }#{ if otherEntity.constructor.name == 'Class' then 'classes' else 'modules' }/#{ refClass.replace(/\./g, '/') }.html"
            //   see.label = ref unless see.label
            // else
            //   console.log "[WARN] Cannot resolve link to entity #{ refClass } in #{ entity.getFullName() }" unless @options.quiet
            //   @errors++

          // Link to other class' class methods
          } else if (/^\@/.test(refMethod)) {
            methods = _.map(_.filter(otherEntity.getMethods(), m => _.indexOf(['class', 'mixin'], m.getType()) >= 0), m => m);

            match = _.find(methods, m => refMethod.substring(1) === m.getName());

            if (match) {
              if (match.doc.delegation) {
                return this.resolveDelegation(origin, match.doc.delegation, otherEntity);
              } else {
                return [ _.clone(match.doc), match.parameters ];
              }
            } else {
              if (!this.options.quiet) { console.log(`[WARN] Cannot resolve delegation to ${ refMethod } in ${ otherEntity.getFullName() }`); }
              this.errors++;
            }

          // Link to other class instance methods
          } else if (/^\./.test(refMethod)) {
            methods = _.map(_.filter(otherEntity.getMethods(), m => m.getType() === 'instance'), m => m);

            match = _.find(methods, m => refMethod.substring(1) === m.getName());

            if (match) {
              if (match.doc.delegation) {
                return this.resolveDelegation(origin, match.doc.delegation, otherEntity);
              } else {
                return [ _.clone(match.doc), match.parameters ];
              }
            } else {
              if (!this.options.quiet) { console.log(`[WARN] Cannot resolve delegation to ${ refMethod } in ${ otherEntity.getFullName() }`); }
              this.errors++;
            }
          }
        } else {
          if (!this.options.quiet) { console.log(`[WARN] Cannot find delegation to ${ ref } in class ${ entity.getFullName() }`); }
          this.errors++;
        }
      } else {
        if (!this.options.quiet) { console.log(`[WARN] Cannot resolve delegation to ${ ref } in class ${ otherEntity.getFullName() }`); }
        this.errors++;
      }
    }

    return [ origin.doc, origin.parameters ];
  }

  // Public: Resolves curly-bracket reference links.
  //
  // see - The reference object (a {Object})
  // entity - The entity context (a {Class})
  // path - The path to the asset root (a {String})
  //
  // Returns the resolved see (a {Object}).
  resolveSee(see, entity, path) {
    // If a reference starts with a space like `{ a: 1 }`, then it's not a valid reference
    let instanceMethods, methods;
    if (see.reference.substring(0, 1) === ' ') { return see; }

    const ref = see.reference;

    // Link to direct class methods
    if (/^\./.test(ref)) {
      methods = _.map(_.filter(entity.getMethods(), m => _.indexOf(['class', 'mixin'], m.getType()) >= 0), m => m.getName());

      if (_.include(methods, ref.substring(1))) {
        see.reference = `${ path }${entity.constructor.name === 'Class' ? 'classes' : 'modules'}/${ entity.getFullName().replace(/\./g, '/') }.html#${ ref.substring(1) }-class`;
        if (!see.label) { see.label = ref; }
      } else {
        see.label = see.reference;
        see.reference = undefined;
        if (!this.options.quiet) { console.log(`[WARN] Cannot resolve link to ${ ref } in ${ entity.getFullName() }`); }
        this.errors++;
      }

    // Link to direct instance methods
    } else if (/^::/.test(ref)) {
      instanceMethods = _.map(_.filter(entity.getMethods(), m => m.getType() === 'instance'), m => m.getName());

      if (_.include(instanceMethods, ref.substring(2))) {
        see.reference = `${ path }classes/${ entity.getFullName().replace(/\./g, '/') }.html#${ ref.substring(2) }-instance`;
        if (!see.label) { see.label = ref; }
      } else {
        see.label = see.reference;
        see.reference = undefined;
        if (!this.options.quiet) { console.log(`[WARN] Cannot resolve link to ${ ref } in class ${ entity.getFullName() }`); }
        this.errors++;
      }

    // Link to other objects
    } else {
      // Ignore normal links
      if (!/^https?:\/\//.test(ref)) {
        // Get class and method reference
        let match;
        if (match = /^(.*?)((\.|::)[$a-z_\x7f-\uffff][$\w\x7f-\uffff]*)?$/.exec(ref)) {
          const refClass = match[1];
          const refMethod = match[2];
          let otherEntity   = _.find(this.classes, c => c.getFullName() === refClass);
          if (!otherEntity) { otherEntity = _.find(this.mixins, c => c.getFullName() === refClass); }

          if (otherEntity) {
            // Link to another class
            if (_.isUndefined(refMethod)) {
              if (_.include(_.map(this.classes, c => c.getFullName()), refClass) || _.include(_.map(this.mixins, c => c.getFullName()), refClass)) {
                see.reference = `${ path }${ otherEntity.constructor.name === 'Class' ? 'classes' : 'modules' }/${ refClass.replace(/\./g, '/') }.html`;
                if (!see.label) { see.label = ref; }
              } else {
                see.label = see.reference;
                see.reference = undefined;
                if (!this.options.quiet) { console.log(`[WARN] Cannot resolve link to entity ${ refClass } in ${ entity.getFullName() }`); }
                this.errors++;
              }

            // Link to other class' class methods
            } else if (/^\./.test(refMethod)) {
              methods = _.map(_.filter(otherEntity.getMethods(), m => _.indexOf(['class', 'mixin'], m.getType()) >= 0), m => m.getName());

              if (_.include(methods, refMethod.substring(1))) {
                see.reference = `${ path }${ otherEntity.constructor.name === 'Class' ? 'classes' : 'modules' }/${ otherEntity.getFullName().replace(/\./g, '/') }.html#${ refMethod.substring(1) }-class`;
                if (!see.label) { see.label = ref; }
              } else {
                see.label = see.reference;
                see.reference = undefined;
                if (!this.options.quiet) { console.log(`[WARN] Cannot resolve link to ${ refMethod } of class ${ otherEntity.getFullName() } in class ${ entity.getFullName() }`); }
                this.errors++;
              }

            // Link to other class instance methods
            } else if (/^::/.test(refMethod)) {
              instanceMethods = _.map(_.filter(otherEntity.getMethods(), m => _.indexOf(['instance', 'mixin'], m.getType()) >= 0), m => m.getName());

              if (_.include(instanceMethods, refMethod.substring(2))) {
                see.reference = `${ path }${ otherEntity.constructor.name === 'Class' ? 'classes' : 'modules' }/${ otherEntity.getFullName().replace(/\./g, '/') }.html#${ refMethod.substring(2) }-instance`;
                if (!see.label) { see.label = ref; }
              } else {
                see.label = see.reference;
                see.reference = undefined;
                if (!this.options.quiet) { console.log(`[WARN] Cannot resolve link to ${ refMethod } of class ${ otherEntity.getFullName() } in class ${ entity.getFullName() }`); }
                this.errors++;
              }
            }
          } else {
            // controls external reference links
            if (this.verifyExternalObjReference(see.reference)) {
              if (!see.label) { see.label = see.reference; }
              see.reference = this.standardObjs[see.reference];
            } else {
              see.label = see.reference;
              see.reference = undefined;
              if (!this.options.quiet) { console.log(`[WARN] Cannot find referenced class ${ refClass } in class ${ entity.getFullName() } (${see.label})`); }
              this.errors++;
            }
          }
        } else {
          see.label = see.reference;
          see.reference = undefined;
          if (!this.options.quiet) { console.log(`[WARN] Cannot resolve link to ${ ref } in class ${ entity.getFullName() }`); }
          this.errors++;
        }
      }
    }
    return see;
  }

  static getLinkMatch(text) {
    let m;
    if (m = text.match(/\{([\w.]+)\}/)) {
      return m[1];
    } else {
      return "";
    }
  }

  // Public: Constructs the documentation links for the standard JS objects.
  //
  // Returns a JSON {Object}.
  readStandardJSON() {
    return this.standardObjs = JSON.parse(fs.readFileSync(path.join(__dirname, 'standardObjs.json'), 'utf-8'));
  }

  // Public: Checks to make sure that an object that's referenced exists in *standardObjs.json*.
  //
  // Returns a {Boolean}.
  verifyExternalObjReference(name) {
    return this.standardObjs[name] !== undefined;
  }

  // Public: Resolve parameter references. This goes through all
  // method parameter and see if a param doc references another
  // method. If so, copy over the doc meta data.
  resolveParamReferences() {
    const entities = _.union(this.classes, this.mixins);

    return Array.from(entities).map((entity) =>
      (() => {
        const result = [];
        for (var method of Array.from(entity.getMethods())) {
          if (method.getDoc() && !_.isEmpty(method.getDoc().params)) {
            result.push((() => {
              const result1 = [];
              for (var param of Array.from(method.getDoc().params)) {
                if (param.reference) {

                  // Find referenced entity
                  var otherEntity, otherMethod, otherMethodType, ref;
                  if (ref = /([$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*)([#.])([$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*)/i.test(param.reference)) {
                    otherEntity = _.first(entities, e => e.getFullName() === ref[1]);
                    otherMethodType = ref[2] === '.' ? ['instance'] : ['class', 'mixin'];
                    otherMethod = ref[3];

                  // The referenced entity is on the current entity
                  } else {
                    otherEntity = entity;
                    otherMethodType = param.reference.substring(0, 1) === '.' ? ['instance', 'mixin'] : ['class', 'mixin'];
                    otherMethod = param.reference.substring(1);
                  }

                  // Find the referenced method
                  var refMethod = _.find(otherEntity.getMethods(), m => (m.getName() === otherMethod) && (_.indexOf(otherMethodType, m.getType()) >= 0));

                  if (refMethod) {
                    // Filter param name
                    if (param.name) {
                      const copyParam = _.find(refMethod.getDoc().params, p => p.name === param.name);

                      if (copyParam) {
                        // Replace a single param
                        var base;
                        if (!(base = method.getDoc()).params) { base.params = []; }
                        method.getDoc().params = _.reject(method.getDoc().params, p => p.name = param.name);
                        method.getDoc().params.push(copyParam);

                        // Replace a single option param
                        if (_.isObject(refMethod.getDoc().paramsOptions)) {
                          var base1;
                          if (!(base1 = method.getDoc()).paramsOptions) { base1.paramsOptions = {}; }
                          result1.push(method.getDoc().paramsOptions[param.name] = refMethod.getDoc().paramsOptions[param.name]);
                        } else {
                          result1.push(undefined);
                        }

                      } else {
                        if (!this.options.quiet) { console.log(`[WARN] Parameter ${ param.name } does not exist in ${ param.reference } in class ${ entity.getFullName() }`); }
                        result1.push(this.errors++);
                      }
                    } else {
                      // Copy all parameters that exist on the given method
                      var names = _.map(method.getParameters(), p => p.getName());
                      method.getDoc().params = _.filter(refMethod.getDoc().params, p => _.contains(names, p.name));

                      // Copy all matching options
                      if (_.isObject(refMethod.getDoc().paramsOptions)) {
                        var base2;
                        if (!(base2 = method.getDoc()).paramsOptions) { base2.paramsOptions = {}; }
                        result1.push(Array.from(names).map((name) => (method.getDoc().paramsOptions[name] = refMethod.getDoc().paramsOptions[name])));
                      } else {
                        result1.push(undefined);
                      }
                    }

                  } else {
                    if (!this.options.quiet) { console.log(`[WARN] Cannot resolve reference tag ${ param.reference } in class ${ entity.getFullName() }`); }
                    result1.push(this.errors++);
                  }
                } else {
                  result1.push(undefined);
                }
              }
              return result1;
            })());
          } else {
            result.push(undefined);
          }
        }
        return result;
      })());
  }
});

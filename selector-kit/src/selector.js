/** @babel */
/* eslint-disable
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Selector
const slick = require('atom-slick')

let indexCounter = 0

module.exports =
(Selector = class Selector {
  // Public: Creates one or more {Selector} objects.
  //
  // This method will return more than one `Selector` object when the string
  // selector describes more than one object. e.g. `.foo.bar, .omg.wow`
  //
  // * `selectorString` {String} CSS selector. e.g. `.foo .bar`
  // * `options` {Object} (optional)
  //   * `priority` {Number} (optional)
  //
  // Returns an {Array} or {Selector} objects.
  static create (selectorString, options) {
    return (() => {
      const result = []
      for (const selectorAst of Array.from(slick.parse(selectorString))) {
        for (const selectorComponent of Array.from(selectorAst)) { this.parsePseudoSelectors(selectorComponent) }
        result.push(new (this)(selectorAst, options))
      }
      return result
    })()
  }

  static parsePseudoSelectors (selectorComponent) {
    if (selectorComponent.pseudos == null) { return }
    return (() => {
      const result = []
      for (const pseudoClass of Array.from(selectorComponent.pseudos)) {
        if (pseudoClass.name === 'not') {
          if (selectorComponent.notSelectors == null) { selectorComponent.notSelectors = [] }
          result.push(selectorComponent.notSelectors.push(...Array.from(this.create(pseudoClass.value) || [])))
        } else {
          result.push(console.warn(`Unsupported pseudo-selector: ${pseudoClass.name}`))
        }
      }
      return result
    })()
  }

  constructor (selector, options) {
    this.selector = selector
    const priority = (options != null ? options.priority : undefined) != null ? (options != null ? options.priority : undefined) : 0
    this.specificity = this.calculateSpecificity()
    this.index = priority + indexCounter++
  }

  // Public: Returns a {Boolean} indcating whether or not this `Selector` matches
  // the given scope chain.
  //
  // * `scopeChain` {String} e.g. `.parent .child`
  matches (scopeChain) {
    if (typeof scopeChain === 'string') {
      [scopeChain] = Array.from(slick.parse(scopeChain))
      if (scopeChain == null) { return false }
    }

    let selectorIndex = this.selector.length - 1
    let scopeIndex = scopeChain.length - 1

    let requireMatch = true
    while ((selectorIndex >= 0) && (scopeIndex >= 0)) {
      if (this.selectorComponentMatchesScope(this.selector[selectorIndex], scopeChain[scopeIndex])) {
        requireMatch = this.selector[selectorIndex].combinator === '>'
        selectorIndex--
      } else if (requireMatch) {
        return false
      }

      scopeIndex--
    }

    return selectorIndex < 0
  }

  // Public: Compare specificity to another {Selector} object
  //
  // * `other` {Selector} object
  //
  // Returns a {Number}
  compare (other) {
    if (other.specificity === this.specificity) {
      return other.index - this.index
    } else {
      return other.specificity - this.specificity
    }
  }

  // Public: Returns {Boolean} if the selectors are equal.
  //
  // * `other` {Selector} object
  isEqual (other) {
    return this.toString() === other.toString()
  }

  // Public: Returns a {String} representation of the object
  toString () {
    return this.selector.toString().replace(/\*\./g, '.')
  }

  // Public: Returns {Number} specificity
  getSpecificity () {
    return this.specificity
  }

  /*
  Section: Private Member Methods
  */

  selectorComponentMatchesScope (selectorComponent, scope) {
    if (selectorComponent.classList != null) {
      for (const className of Array.from(selectorComponent.classList)) {
        if ((scope.classes != null ? scope.classes[className] : undefined) == null) { return false }
      }
    }

    if (selectorComponent.tag != null) {
      if ((selectorComponent.tag !== scope.tag) && (selectorComponent.tag !== '*')) { return false }
    }

    if (selectorComponent.attributes != null) {
      let attribute
      const scopeAttributes = {}
      for (attribute of Array.from(scope.attributes != null ? scope.attributes : [])) {
        scopeAttributes[attribute.name] = attribute
      }
      for (attribute of Array.from(selectorComponent.attributes)) {
        if ((scopeAttributes[attribute.name] != null ? scopeAttributes[attribute.name].value : undefined) !== attribute.value) { return false }
      }
    }

    if (selectorComponent.notSelectors != null) {
      for (const selector of Array.from(selectorComponent.notSelectors)) {
        if (selector.matches([scope])) { return false }
      }
    }

    return true
  }

  calculateSpecificity () {
    const a = 0
    let b = 0
    let c = 0

    for (const selectorComponent of Array.from(this.selector)) {
      if (selectorComponent.classList != null) {
        b += selectorComponent.classList.length
      }

      if (selectorComponent.attributes != null) {
        b += selectorComponent.attributes.length
      }

      if (selectorComponent.tag != null) {
        c += 1
      }
    }

    return (a * 100) + (b * 10) + (c * 1)
  }
})

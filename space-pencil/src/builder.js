/** @babel */
/* eslint-disable
    no-multi-str,
    no-prototype-builtins,
    no-return-assign,
    no-useless-escape,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Builder
const TagNames = `\
a abbr address area article aside audio b base bdi bdo big blockquote body br
button canvas caption cite code col colgroup data datalist dd del details dfn
div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6
head header hr html i iframe img input ins kbd keygen label legend li link main
map mark menu menuitem meta meter nav noscript object ol optgroup option output
p param pre progress q rp rt ruby s samp script section select small source
span strong style sub summary sup table tbody td textarea tfoot th thead time
title tr track u ul var video wbr circle g line path polyline rect svg text\
`.split(/\s+/)

const SelfClosingTags = {}
'area base br col command embed hr img input keygen link meta param source \
track wbr'.split(/\s+/).forEach(tag => SelfClosingTags[tag] = true)

module.exports =
(Builder = (function () {
  Builder = class Builder {
    static initClass () {
      for (const tagName of Array.from(TagNames)) {
        (tagName => { return this.prototype[tagName] = function (...args) { return this.tag(tagName, ...Array.from(args)) } })(tagName)
      }
    }

    buildElement (fn) {
      const wrapper = document.createElement('div')
      wrapper.innerHTML = this.buildHtml(fn)
      return wrapper.firstChild
    }

    buildHtml (fn) {
      this.document = []
      fn.call(this)
      return this.document.join('')
    }

    tag (name, ...args) {
      let attributes, content, text
      for (const arg of Array.from(args)) {
        switch (typeof arg) {
          case 'function': content = arg; break
          case 'string': case 'number': text = arg.toString(); break
          case 'object': attributes = arg; break
        }
      }

      this.openTag(name, attributes)

      if (SelfClosingTags.hasOwnProperty(name)) {
        if ((text != null) || (content != null)) {
          throw new Error(`Self-closing tag ${name} cannot have text or content`)
        }
      } else {
        if (content != null) { content.call(this) }
        if (text != null) { this.text(text) }
        return this.closeTag(name)
      }
    }

    openTag (name, attributes) {
      const attributePairs =
        (() => {
          const result = []
          for (const attributeName in attributes) {
            const value = attributes[attributeName]
            result.push(`${attributeName}=\"${value}\"`)
          }
          return result
        })()

      const attributesText =
        attributePairs.length
          ? ' ' + attributePairs.join(' ')
          : ''

      return this.document.push(`<${name}${attributesText}>`)
    }

    closeTag (name) {
      return this.document.push(`</${name}>`)
    }

    text (text) {
      const escapedText = text
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      return this.document.push(escapedText)
    }

    raw (text) {
      return this.document.push(text)
    }
  }
  Builder.initClass()
  return Builder
})())

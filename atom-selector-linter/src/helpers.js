/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const classRegexpCache = {};
const psuedoClassRegexpCache = {};

module.exports = {
  eachSelector(css, fn) {
    return (() => {
      const result = [];
      const iterable = css.split(/{|}/);
      for (let i = 0; i < iterable.length; i++) {
        var selectors = iterable[i];
        if ((i % 2) === 0) {
          result.push((() => {
            const result1 = [];
            for (let selector of Array.from(selectors.split(","))) {
              selector = selector.trim();
              if (selector) { result1.push(fn(selector)); } else {
                result1.push(undefined);
              }
            }
            return result1;
          })());
        }
      }
      return result;
    })();
  },

  selectorHasClass(selector, klass) {
    if (classRegexpCache[klass] == null) { classRegexpCache[klass] = new RegExp(`\\.${klass}([ >\.:]|$)`); }
    return classRegexpCache[klass].test(selector);
  },

  selectorHasPsuedoClass(selector, klass) {
    if (psuedoClassRegexpCache[klass] == null) { psuedoClassRegexpCache[klass] = new RegExp(`\\:${klass}([ >\.:]|$)`); }
    return psuedoClassRegexpCache[klass].test(selector);
  }
};

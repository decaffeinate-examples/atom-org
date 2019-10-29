/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {DOM} = require('react');

const tag = function(name, ...args) {
  let attributes;
  if ((args[0] != null ? args[0].constructor : undefined) === Object) {
    attributes = args.shift();
  } else {
    attributes = {};
  }

  return DOM[name](attributes, ...Array.from(args));
};

for (let tagName in DOM) {
  (function(tagName) { return exports[tagName] = tag.bind(this, tagName); })(tagName);
}

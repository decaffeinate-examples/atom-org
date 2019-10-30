/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let tagName;
const buildVirtualNode = require('./build-virtual-node');

const DEFAULT_TAG_NAMES =
  `a abbr address article aside audio b bdi bdo blockquote body button canvas \
caption cite code colgroup datalist dd del details dfn dialog div dl dt em \
fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header html i \
iframe ins kbd label legend li main map mark menu meter nav noscript object \
ol optgroup option output p pre progress q rp rt ruby s samp script section \
select small span strong style sub summary sup table tbody td textarea tfoot \
th thead time title tr u ul var video area base br col command embed hr img \
input keygen link meta param source track wbr`.split(/\s+/);

const DEFAULT_TAG_FUNCTIONS = {};
for (tagName of Array.from(DEFAULT_TAG_NAMES)) {
  ((tagName => DEFAULT_TAG_FUNCTIONS[tagName] = function() { return buildVirtualNode(tagName, ...arguments); }))(tagName);
}

module.exports = function() {
  const tags = {};

  for (let tagFunctionName of Array.from(arguments)) {
    tagName = tagFunctionName.replace(/([A-Z])/g, "-$1").replace(/^-/, "").toLowerCase();
    (((tagFunctionName, tagName) => tags[tagFunctionName] = function() { return buildVirtualNode(tagName, ...arguments); }))(tagFunctionName, tagName);
  }

  for (tagName in DEFAULT_TAG_FUNCTIONS) {
    const tagFunction = DEFAULT_TAG_FUNCTIONS[tagName];
    tags[tagName] = tagFunction;
  }

  return tags;
};

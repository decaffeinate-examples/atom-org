/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
require('coffee-cache');

const {jsdom} = require('jsdom');

beforeEach(function() {
  const browser = jsdom();
  global.window = browser.parentWindow;
  global.document = window.document;

  return this.addMatchers({
    toMatchMarkup(expected) {
      const notText = this.isNot ? " not" : "";

      this.message = () => `\
Expected markup to${notText} match.
Actual: ${actualMarkup}
Expected: ${expectedMarkup}\
`;

      const actual = this.actual.cloneNode(true);
      var actualMarkup = actual.outerHTML;
      var expectedMarkup = expected.replace(/\n\s*/g, '');
      return actualMarkup === expectedMarkup;
    }
  });
});

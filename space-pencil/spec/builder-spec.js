/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const Builder = require('../src/builder');

describe("Builder", () => it("builds an DOM elements based on the given function", function() {
  const builder = new Builder;
  const element = builder.buildElement(function() {
    return this.div({class: "greeting"}, function() {
      return this.h1(function() {
        this.text("Hello");
        return this.span("World");
      });
    });
  });

  return expect(element).toMatchMarkup(`\
<div class="greeting">
<h1>Hello<span>World</span></h1>
</div>\
`
  );
}));

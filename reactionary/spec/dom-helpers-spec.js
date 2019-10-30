/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const React        = require('react/addons');
const {div, h1, p} = require('../src/dom-helpers');

let element = null;

describe("DOM helpers", function() {
  beforeEach(() => // Create React Component with Reactionary
  element = div({className: "greeting", key: "fancy-key"},
    div({className: "header"},
      h1("Hello World")),
    div({className: "body"},
      p("Each and every one of you"))
  ));


  it("allows for convenient creation of DOM nodes", () => (expect(React.addons.TestUtils.isDOMComponent(element))).toBe(true));

  it("creates DOM nodes with children", function() {
    (expect(element.props.children)).toBeDefined();
    return (expect(element.props.children.length)).toEqual(2);
  });

  it("creates DOM nodes with correct props", function() {
    (expect(element.props.key)).toEqual('fancy-key');
    (expect(element.props.className)).toEqual('greeting');
    return (expect(element.props.children[0].props.className)).toEqual('header');
  });

  return it("creates DOM nodes with plain text child", () => expect(
    element.props.children[0].props.children.props.children
  ).toEqual('Hello World'));
});

/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const _ = require('underscore');

const unorderedEqual = function(one, two) {
  if (one.length !== two.length) { return false; }
  for (let val of Array.from(one)) {
    if (!_.contains(two, val)) { return false; }
  }
  return true;
};

beforeEach(function() {
  return this.addMatchers({
    toEqualJson(expected) {
      const failures = {};

      class Failure {
        constructor(path, actual, expected1) {
          this.path = path;
          this.actual = actual;
          this.expected = expected1;
        }

        getMessage() {
          return `\
${this.path}:
  actual:   ${this.actual}
  expected: ${this.expected}\
`;
        }
      }

      const addFailure = function(path, actual, expected) {
        path = path.join('.') || '<root>';
        return failures[path] = new Failure(path, actual, expected);
      };

      const appendToPath = (path, value) => path.concat([value]);

      var compare = function(path, actual, expected) {
        if ((actual == null) && (expected == null)) { return; }

        if ((actual == null) || (expected == null)) {
          addFailure(path, JSON.stringify(actual), JSON.stringify(expected));
        } else if (actual.constructor.name !== expected.constructor.name) {
          addFailure(path, JSON.stringify(actual), JSON.stringify(expected));
        } else {
          let value;
          switch (actual.constructor.name) {
            case "String": case "Boolean": case "Number":
              if (actual !== expected) { addFailure(path, JSON.stringify(actual), JSON.stringify(expected)); }
              break;

            case "Array":
              if (actual.length !== expected.length) {
                addFailure(path, `has length ${actual.length} ${JSON.stringify(actual)}`, `has length ${expected.length} ${JSON.stringify(expected)}`);
              } else {
                for (let i = 0; i < actual.length; i++) {
                  value = actual[i];
                  compare(appendToPath(path, i), actual[i], expected[i]);
                }
              }
              break;

            case "Object":
              var actualKeys = _.keys(actual);
              var expectedKeys = _.keys(expected);
              if (!unorderedEqual(actualKeys, expectedKeys)) {
                addFailure(path, `has keys ${JSON.stringify(actualKeys.sort())}`, `has keys ${JSON.stringify(expectedKeys.sort())}`);
              } else {
                for (let key in actual) {
                  value = actual[key];
                  if (!actual.hasOwnProperty(key)) { continue; }
                  compare(appendToPath(path, key), actual[key], expected[key]);
                }
              }
              break;
          }
        }
      };

      compare([], this.actual, expected);

      if (_.size(failures)) {
        this.message = () => {
          const messages = [];
          for (let key in failures) {
            const failure = failures[key];
            messages.push(failure.getMessage());
          }
          return 'JSON is not equal:\n' + messages.join('\n');
        };
        return false;

      } else {
        this.message = () => this.actual + ' is equal to ' + expected;
        return true;
      }
    }
  });
});

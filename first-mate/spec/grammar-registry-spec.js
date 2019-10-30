/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const path = require('path');
const GrammarRegistry = require('../src/grammar-registry');

describe("GrammarRegistry", function() {
  let registry = null;

  const loadGrammarSync = name => registry.loadGrammarSync(path.join(__dirname, 'fixtures', name));

  describe("when the grammar has no scope name", () => it("throws an error", function() {
    const grammarPath = path.join(__dirname, 'fixtures', 'no-scope-name.json');
    registry = new GrammarRegistry();
    expect(() => registry.loadGrammarSync(grammarPath)).toThrow();

    const callback = jasmine.createSpy('callback');
    registry.loadGrammar(grammarPath, callback);

    waitsFor(() => callback.callCount === 1);

    return runs(() => expect(callback.argsForCall[0][0].message.length).toBeGreaterThan(0));
  }));

  describe("maxTokensPerLine option", () => it("limits the number of tokens created by the parser per line", function() {
    registry = new GrammarRegistry({maxTokensPerLine: 2});
    loadGrammarSync('json.json');

    const grammar = registry.grammarForScopeName('source.json');
    const {line, tags} = grammar.tokenizeLine("{ }");
    const tokens = registry.decodeTokens(line, tags);
    return expect(tokens.length).toBe(2);
  }));

  return describe("maxLineLength option", function() {
    it("limits the number of characters scanned by the parser per line", function() {
      registry = new GrammarRegistry({maxLineLength: 10});
      loadGrammarSync('json.json');
      const grammar = registry.grammarForScopeName('source.json');

      const {ruleStack: initialRuleStack} = grammar.tokenizeLine('[');
      const {line, tags, ruleStack} = grammar.tokenizeLine('{"foo": "this is a long value"}', initialRuleStack);
      const tokens = registry.decodeTokens(line, tags);

      expect(ruleStack.map(entry => entry.scopeName)).toEqual(initialRuleStack.map(entry => entry.scopeName));
      return expect(tokens.map(token => token.value)).toEqual([
        '{',
        '"',
        'foo',
        '"',
        ':',
        ' ',
        '"',
        'this is a long value"}'
      ]);
    });

    return it("does not apply if the grammar's limitLineLength option is set to false", function() {
      registry = new GrammarRegistry({maxLineLength: 10});
      loadGrammarSync('no-line-length-limit.cson');
      const grammar = registry.grammarForScopeName('source.long-lines');

      const {tokens} = grammar.tokenizeLine("hello goodbye hello goodbye hello");
      return expect(tokens.length).toBe(5);
    });
  });
});

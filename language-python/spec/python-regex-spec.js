/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
describe('Python regular expression grammar', function() {
  let grammar = null;

  beforeEach(function() {
    atom.config.set('core.useTreeSitterParsers', false);

    waitsForPromise(() => atom.packages.activatePackage('language-python'));

    return runs(() => grammar = atom.grammars.grammarForScopeName('source.regexp.python'));
  });

  return describe('character classes', function() {
    it('does not recursively match character classes', function() {
      const {tokens} = grammar.tokenizeLine('[.:[\\]@]');
      expect(tokens[0]).toEqual({value: '[', scopes: ['source.regexp.python', 'constant.other.character-class.set.regexp', 'punctuation.definition.character-class.begin.regexp']});
      expect(tokens[1]).toEqual({value: '.:[', scopes: ['source.regexp.python', 'constant.other.character-class.set.regexp']});
      expect(tokens[2]).toEqual({value: '\\]', scopes: ['source.regexp.python', 'constant.other.character-class.set.regexp', 'constant.character.escape.backslash.regexp']});
      expect(tokens[3]).toEqual({value: '@', scopes: ['source.regexp.python', 'constant.other.character-class.set.regexp']});
      return expect(tokens[4]).toEqual({value: ']', scopes: ['source.regexp.python', 'constant.other.character-class.set.regexp', 'punctuation.definition.character-class.end.regexp']});
  });

    it('does not end the character class early if the first character is a ]', function() {
      let {tokens} = grammar.tokenizeLine('[][]');
      expect(tokens[0]).toEqual({value: '[', scopes: ['source.regexp.python', 'constant.other.character-class.set.regexp', 'punctuation.definition.character-class.begin.regexp']});
      expect(tokens[1]).toEqual({value: '][', scopes: ['source.regexp.python', 'constant.other.character-class.set.regexp']});
      expect(tokens[2]).toEqual({value: ']', scopes: ['source.regexp.python', 'constant.other.character-class.set.regexp', 'punctuation.definition.character-class.end.regexp']});

      ({tokens} = grammar.tokenizeLine('[^][]'));
      expect(tokens[0]).toEqual({value: '[', scopes: ['source.regexp.python', 'constant.other.character-class.set.regexp', 'punctuation.definition.character-class.begin.regexp']});
      expect(tokens[1]).toEqual({value: '^', scopes: ['source.regexp.python', 'constant.other.character-class.set.regexp', 'keyword.operator.negation.regexp']});
      expect(tokens[2]).toEqual({value: '][', scopes: ['source.regexp.python', 'constant.other.character-class.set.regexp']});
      return expect(tokens[3]).toEqual({value: ']', scopes: ['source.regexp.python', 'constant.other.character-class.set.regexp', 'punctuation.definition.character-class.end.regexp']});
  });

    return it('escapes the character following any backslash', function() {
      let {tokens} = grammar.tokenizeLine('\\q\\(\\[\\\'\\"\\?\\^\\-\\*\\.\\#');
      expect(tokens[0]).toEqual({value: '\\q', scopes: ['source.regexp.python', 'constant.character.escape.backslash.regexp']});
      expect(tokens[1]).toEqual({value: '\\(', scopes: ['source.regexp.python', 'constant.character.escape.backslash.regexp']});
      expect(tokens[2]).toEqual({value: '\\[', scopes: ['source.regexp.python', 'constant.character.escape.backslash.regexp']});
      expect(tokens[3]).toEqual({value: '\\\'', scopes: ['source.regexp.python', 'constant.character.escape.backslash.regexp']});
      expect(tokens[4]).toEqual({value: '\\"', scopes: ['source.regexp.python', 'constant.character.escape.backslash.regexp']});
      expect(tokens[5]).toEqual({value: '\\?', scopes: ['source.regexp.python', 'constant.character.escape.backslash.regexp']});
      expect(tokens[6]).toEqual({value: '\\^', scopes: ['source.regexp.python', 'constant.character.escape.backslash.regexp']});
      expect(tokens[7]).toEqual({value: '\\-', scopes: ['source.regexp.python', 'constant.character.escape.backslash.regexp']});
      expect(tokens[8]).toEqual({value: '\\*', scopes: ['source.regexp.python', 'constant.character.escape.backslash.regexp']});
      expect(tokens[9]).toEqual({value: '\\.', scopes: ['source.regexp.python', 'constant.character.escape.backslash.regexp']});
      expect(tokens[10]).toEqual({value: '\\#', scopes: ['source.regexp.python', 'constant.character.escape.backslash.regexp']});

      ({tokens} = grammar.tokenizeLine('(\\()\\)'));
      expect(tokens[0]).toEqual({value: '(', scopes: ['source.regexp.python', 'meta.group.regexp', 'punctuation.definition.group.regexp']});
      expect(tokens[1]).toEqual({value: '\\(', scopes: ['source.regexp.python', 'meta.group.regexp', 'constant.character.escape.backslash.regexp']});
      expect(tokens[2]).toEqual({value: ')', scopes: ['source.regexp.python', 'meta.group.regexp', 'punctuation.definition.group.regexp']});
      return expect(tokens[3]).toEqual({value: '\\)', scopes: ['source.regexp.python', 'constant.character.escape.backslash.regexp']});
  });
});
});

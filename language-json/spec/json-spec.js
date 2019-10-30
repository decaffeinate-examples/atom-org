/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
describe("JSON grammar", function() {
  let grammar = null;

  beforeEach(function() {
    atom.config.set('core.useTreeSitterParsers', false);

    waitsForPromise(() => atom.packages.activatePackage('language-json'));

    return runs(() => grammar = atom.grammars.grammarForScopeName('source.json'));
  });

  it("parses the grammar", function() {
    expect(grammar).toBeDefined();
    return expect(grammar.scopeName).toBe('source.json');
  });

  it("tokenizes arrays", function() {
    const baseScopes = ['source.json', 'meta.structure.array.json'];
    const numericScopes = [...Array.from(baseScopes), 'constant.numeric.json'];
    const separatorScopes = [...Array.from(baseScopes), 'punctuation.separator.array.json'];

    const {tokens} = grammar.tokenizeLine('[1, 2, 3]');
    expect(tokens[0]).toEqual({value: '[', scopes: [...Array.from(baseScopes), 'punctuation.definition.array.begin.json']});
    expect(tokens[1]).toEqual({value: '1', scopes: numericScopes});
    expect(tokens[2]).toEqual({value: ',', scopes: separatorScopes});
    expect(tokens[3]).toEqual({value: ' ', scopes: baseScopes});
    expect(tokens[4]).toEqual({value: '2', scopes: numericScopes});
    expect(tokens[5]).toEqual({value: ',', scopes: separatorScopes});
    expect(tokens[6]).toEqual({value: ' ', scopes: baseScopes});
    expect(tokens[7]).toEqual({value: '3', scopes: numericScopes});
    return expect(tokens[8]).toEqual({value: ']', scopes: [...Array.from(baseScopes), 'punctuation.definition.array.end.json']});
});

  it("identifies trailing commas in arrays", function() {
    const baseScopes = ['source.json', 'meta.structure.array.json'];
    const numericScopes = [...Array.from(baseScopes), 'constant.numeric.json'];
    const separatorScopes = [...Array.from(baseScopes), 'punctuation.separator.array.json'];

    const {tokens} = grammar.tokenizeLine('[1, ]');
    expect(tokens[0]).toEqual({value: '[', scopes: [...Array.from(baseScopes), 'punctuation.definition.array.begin.json']});
    expect(tokens[1]).toEqual({value: '1', scopes: numericScopes});
    expect(tokens[2]).toEqual({value: ',', scopes: [...Array.from(baseScopes), 'invalid.illegal.trailing-array-separator.json']});
    expect(tokens[3]).toEqual({value: ' ', scopes: baseScopes});
    return expect(tokens[4]).toEqual({value: ']', scopes: [...Array.from(baseScopes), 'punctuation.definition.array.end.json']});
});

  it("tokenizes objects", function() {
    const baseScopes = ['source.json', 'meta.structure.dictionary.json'];
    const keyScopes = [...Array.from(baseScopes), 'meta.structure.dictionary.key.json', 'string.quoted.double.json'];
    const keyBeginScopes = [...Array.from(keyScopes), 'punctuation.definition.string.begin.json'];
    const keyEndScopes = [...Array.from(keyScopes), 'punctuation.definition.string.end.json'];
    const valueScopes = [...Array.from(baseScopes), 'meta.structure.dictionary.value.json'];
    const keyValueSeparatorScopes = [...Array.from(valueScopes), 'punctuation.separator.dictionary.key-value.json'];
    const pairSeparatorScopes = [...Array.from(valueScopes), 'punctuation.separator.dictionary.pair.json'];
    const stringValueScopes = [...Array.from(valueScopes), 'string.quoted.double.json'];

    const {tokens} = grammar.tokenizeLine('{"a": 1, "b": true, "foo": "bar"}');
    expect(tokens[0]).toEqual({value: '{', scopes: [...Array.from(baseScopes), 'punctuation.definition.dictionary.begin.json']});
    expect(tokens[1]).toEqual({value: '"', scopes: keyBeginScopes});
    expect(tokens[2]).toEqual({value: 'a', scopes: keyScopes});
    expect(tokens[3]).toEqual({value: '"', scopes: keyEndScopes});
    expect(tokens[4]).toEqual({value: ':', scopes: keyValueSeparatorScopes});
    expect(tokens[5]).toEqual({value: ' ', scopes: valueScopes});
    expect(tokens[6]).toEqual({value: '1', scopes: [...Array.from(valueScopes), 'constant.numeric.json']});
    expect(tokens[7]).toEqual({value: ',', scopes: pairSeparatorScopes});
    expect(tokens[8]).toEqual({value: ' ', scopes: baseScopes});
    expect(tokens[9]).toEqual({value: '"', scopes: keyBeginScopes});
    expect(tokens[10]).toEqual({value: 'b', scopes: keyScopes});
    expect(tokens[11]).toEqual({value: '"', scopes: keyEndScopes});
    expect(tokens[12]).toEqual({value: ':', scopes: keyValueSeparatorScopes});
    expect(tokens[13]).toEqual({value: ' ', scopes: valueScopes});
    expect(tokens[14]).toEqual({value: 'true', scopes: [...Array.from(valueScopes), 'constant.language.json']});
    expect(tokens[15]).toEqual({value: ',', scopes: pairSeparatorScopes});
    expect(tokens[16]).toEqual({value: ' ', scopes: baseScopes});
    expect(tokens[17]).toEqual({value: '"', scopes: keyBeginScopes});
    expect(tokens[18]).toEqual({value: 'foo', scopes: keyScopes});
    expect(tokens[19]).toEqual({value: '"', scopes: keyEndScopes});
    expect(tokens[20]).toEqual({value: ':', scopes: keyValueSeparatorScopes});
    expect(tokens[21]).toEqual({value: ' ', scopes: valueScopes});
    expect(tokens[22]).toEqual({value: '"', scopes: [...Array.from(stringValueScopes), 'punctuation.definition.string.begin.json']});
    expect(tokens[23]).toEqual({value: 'bar', scopes: stringValueScopes});
    expect(tokens[24]).toEqual({value: '"', scopes: [...Array.from(stringValueScopes), 'punctuation.definition.string.end.json']});
    return expect(tokens[25]).toEqual({value: '}', scopes: [...Array.from(baseScopes), 'punctuation.definition.dictionary.end.json']});
});

  return it("identifies trailing commas in objects", function() {
    const baseScopes = ['source.json', 'meta.structure.dictionary.json'];
    const keyScopes = [...Array.from(baseScopes), 'meta.structure.dictionary.key.json', 'string.quoted.double.json'];
    const keyBeginScopes = [...Array.from(keyScopes), 'punctuation.definition.string.begin.json'];
    const keyEndScopes = [...Array.from(keyScopes), 'punctuation.definition.string.end.json'];
    const valueScopes = [...Array.from(baseScopes), 'meta.structure.dictionary.value.json'];
    const keyValueSeparatorScopes = [...Array.from(valueScopes), 'punctuation.separator.dictionary.key-value.json'];
    const pairSeparatorScopes = [...Array.from(valueScopes), 'punctuation.separator.dictionary.pair.json'];

    const {tokens} = grammar.tokenizeLine('{"a": 1, "b": 2, }');
    expect(tokens[0]).toEqual({value: '{', scopes: [...Array.from(baseScopes), 'punctuation.definition.dictionary.begin.json']});
    expect(tokens[1]).toEqual({value: '"', scopes: keyBeginScopes});
    expect(tokens[2]).toEqual({value: 'a', scopes: keyScopes});
    expect(tokens[3]).toEqual({value: '"', scopes: keyEndScopes});
    expect(tokens[4]).toEqual({value: ':', scopes: keyValueSeparatorScopes});
    expect(tokens[5]).toEqual({value: ' ', scopes: valueScopes});
    expect(tokens[6]).toEqual({value: '1', scopes: [...Array.from(valueScopes), 'constant.numeric.json']});
    expect(tokens[7]).toEqual({value: ',', scopes: pairSeparatorScopes});
    expect(tokens[8]).toEqual({value: ' ', scopes: baseScopes});
    expect(tokens[9]).toEqual({value: '"', scopes: keyBeginScopes});
    expect(tokens[10]).toEqual({value: 'b', scopes: keyScopes});
    expect(tokens[11]).toEqual({value: '"', scopes: keyEndScopes});
    expect(tokens[12]).toEqual({value: ':', scopes: keyValueSeparatorScopes});
    expect(tokens[13]).toEqual({value: ' ', scopes: valueScopes});
    expect(tokens[14]).toEqual({value: '2', scopes: [...Array.from(valueScopes), 'constant.numeric.json']});
    expect(tokens[15]).toEqual({value: ',', scopes: [...Array.from(valueScopes), 'invalid.illegal.trailing-dictionary-separator.json']});
    expect(tokens[16]).toEqual({value: ' ', scopes: baseScopes});
    return expect(tokens[17]).toEqual({value: '}', scopes: [...Array.from(baseScopes), 'punctuation.definition.dictionary.end.json']});
});
});

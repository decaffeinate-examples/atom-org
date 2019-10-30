/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
describe("TextMate HTML (Ruby - ERB) grammar", function() {
  let grammar = null;

  beforeEach(function() {
    atom.config.set('core.useTreeSitterParsers', false);

    waitsForPromise(() => atom.packages.activatePackage("language-ruby"));

    return runs(() => grammar = atom.grammars.grammarForScopeName("text.html.erb"));
  });

  it("parses the grammar", function() {
    expect(grammar).toBeTruthy();
    return expect(grammar.scopeName).toBe("text.html.erb");
  });

  return it("tokenizes embedded ruby", function() {
    const {tokens} = grammar.tokenizeLine('<%= self %>');
    expect(tokens[0]).toEqual({value: '<%=', scopes: ['text.html.erb', 'meta.embedded.line.erb', 'punctuation.section.embedded.begin.erb']});
    expect(tokens[1]).toEqual({value: ' ', scopes: ['text.html.erb', 'meta.embedded.line.erb', 'source.ruby.embedded.erb']});
    expect(tokens[2]).toEqual({value: 'self', scopes: ['text.html.erb', 'meta.embedded.line.erb', 'source.ruby.embedded.erb', 'variable.language.self.ruby']});
    expect(tokens[3]).toEqual({value: ' ', scopes: ['text.html.erb', 'meta.embedded.line.erb', 'source.ruby.embedded.erb']});
    expect(tokens[4]).toEqual({value: '%>', scopes: ['text.html.erb', 'meta.embedded.line.erb', 'punctuation.section.embedded.end.erb']});

    const lines = grammar.tokenizeLines('<%=\nself\n%>');
    expect(lines[0][0]).toEqual({value: '<%=', scopes: ['text.html.erb', 'meta.embedded.block.erb', 'punctuation.section.embedded.begin.erb']});
    expect(lines[1][0]).toEqual({value: 'self', scopes: ['text.html.erb', 'meta.embedded.block.erb', 'source.ruby.embedded.erb', 'variable.language.self.ruby']});
    return expect(lines[2][0]).toEqual({value: '%>', scopes: ['text.html.erb', 'meta.embedded.block.erb', 'punctuation.section.embedded.end.erb']});
});
});

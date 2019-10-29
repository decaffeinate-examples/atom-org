/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const path = require('path');
const Highlights = require('../src/highlights');

describe("Highlights", function() {
  describe("when an includePath is specified", function() {
    it("includes the grammar when the path is a file", function() {
      const highlights = new Highlights({scopePrefix: 'syntax--', includePath: path.join(__dirname, 'fixtures', 'includes')});
      const html = highlights.highlightSync({fileContents: 'test', scopeName: 'include1'});
      return expect(html).toBe('<pre class="editor editor-colors"><div class="line"><span class="syntax--include1"><span>test</span></span></div></pre>');
    });

    it("includes the grammars when the path is a directory", function() {
      const highlights = new Highlights({scopePrefix: 'syntax--', includePath: path.join(__dirname, 'fixtures', 'includes', 'include1.cson')});
      const html = highlights.highlightSync({fileContents: 'test', scopeName: 'include1'});
      return expect(html).toBe('<pre class="editor editor-colors"><div class="line"><span class="syntax--include1"><span>test</span></span></div></pre>');
    });

    return it("overrides built-in grammars", function() {
      const highlights = new Highlights({scopePrefix: 'syntax--', includePath: path.join(__dirname, 'fixtures', 'includes')});
      const html = highlights.highlightSync({fileContents: 's = "test"', scopeName: 'source.coffee'});
      return expect(html).toBe('<pre class="editor editor-colors"><div class="line"><span class="syntax--source syntax--coffee"><span>s&nbsp;=&nbsp;&quot;test&quot;</span></span></div></pre>');
    });
  });

  describe("highlightSync", function() {
    it("returns an HTML string", function() {
      const highlights = new Highlights({scopePrefix: 'syntax--'});
      const html = highlights.highlightSync({fileContents: 'test'});
      return expect(html).toBe('<pre class="editor editor-colors"><div class="line"><span class="syntax--text syntax--plain syntax--null-grammar"><span>test</span></span></div></pre>');
    });

    it("uses the given scope name as the grammar to tokenize with", function() {
      const highlights = new Highlights({scopePrefix: 'syntax--'});
      const html = highlights.highlightSync({fileContents: 'test', scopeName: 'source.coffee'});
      return expect(html).toBe('<pre class="editor editor-colors"><div class="line"><span class="syntax--source syntax--coffee"><span>test</span></span></div></pre>');
    });

    return it("uses the best grammar match when no scope name is specified", function() {
      const highlights = new Highlights({scopePrefix: 'syntax--'});
      const html = highlights.highlightSync({fileContents: 'test', filePath: 'test.coffee'});
      return expect(html).toBe('<pre class="editor editor-colors"><div class="line"><span class="syntax--source syntax--coffee"><span>test</span></span></div></pre>');
    });
  });

  describe("requireGrammarsSync", function() {
    it("loads the grammars from a file-based npm module path", function() {
      const highlights = new Highlights({scopePrefix: 'syntax--'});
      highlights.requireGrammarsSync({modulePath: require.resolve('language-erlang/package.json')});
      return expect(highlights.registry.grammarForScopeName('source.erlang').path).toBe(path.resolve(__dirname, '..', 'node_modules', 'language-erlang', 'grammars', 'erlang.cson'));
    });

    it("loads the grammars from a folder-based npm module path", function() {
      const highlights = new Highlights({scopePrefix: 'syntax--'});
      highlights.requireGrammarsSync({modulePath: path.resolve(__dirname, '..', 'node_modules', 'language-erlang')});
      return expect(highlights.registry.grammarForScopeName('source.erlang').path).toBe(path.resolve(__dirname, '..', 'node_modules', 'language-erlang', 'grammars', 'erlang.cson'));
    });

    return it("loads default grammars prior to loading grammar from module", function() {
      const highlights = new Highlights({scopePrefix: 'syntax--'});
      highlights.requireGrammarsSync({modulePath: require.resolve('language-erlang/package.json')});
      const html = highlights.highlightSync({fileContents: 'test', scopeName: 'source.coffee'});
      return expect(html).toBe('<pre class="editor editor-colors"><div class="line"><span class="syntax--source syntax--coffee"><span>test</span></span></div></pre>');
    });
  });

  //
  // async tests
  //

  describe("async: when an includePath is specified", function() {
    it("includes the grammar when the path is a file", function(done) {
      const highlights = new Highlights({scopePrefix: 'syntax--', includePath: path.join(__dirname, 'fixtures', 'includes')});
      return highlights.highlight({fileContents: 'test', scopeName: 'include1'}, function(err, html) {
        expect(!err).toBe(true);
        expect(html).toBe('<pre class="editor editor-colors"><div class="line"><span class="syntax--include1"><span>test</span></span></div></pre>');
        return done();
      });
    });

    it("includes the grammars when the path is a directory", function(done) {
      const highlights = new Highlights({scopePrefix: 'syntax--', includePath: path.join(__dirname, 'fixtures', 'includes', 'include1.cson')});
      return highlights.highlight({fileContents: 'test', scopeName: 'include1'}, function(err, html) {
        expect(!err).toBe(true);
        expect(html).toBe('<pre class="editor editor-colors"><div class="line"><span class="syntax--include1"><span>test</span></span></div></pre>');
        return done();
      });
    });

    return it("overrides built-in grammars", function(done) {
      const highlights = new Highlights({scopePrefix: 'syntax--', includePath: path.join(__dirname, 'fixtures', 'includes')});
      return highlights.highlight({fileContents: 's = "test"', scopeName: 'source.coffee'}, function(err, html) {
        expect(!err).toBe(true);
        expect(html).toBe('<pre class="editor editor-colors"><div class="line"><span class="syntax--source syntax--coffee"><span>s&nbsp;=&nbsp;&quot;test&quot;</span></span></div></pre>');
        return done();
      });
    });
  });

  describe("async: highlight", function() {
    it("calls back an HTML string", function(done) {
      const highlights = new Highlights({scopePrefix: 'syntax--'});
      return highlights.highlight({fileContents: 'test'}, function(err, html) {
        expect(!err).toBe(true);
        expect(html).toBe('<pre class="editor editor-colors"><div class="line"><span class="syntax--text syntax--plain syntax--null-grammar"><span>test</span></span></div></pre>');
        return done();
      });
    });

    it("uses the given scope name as the grammar to tokenize with", function(done) {
      const highlights = new Highlights({scopePrefix: 'syntax--'});
      return highlights.highlight({fileContents: 'test', scopeName: 'source.coffee'}, function(err, html) {
        expect(!err).toBe(true);
        expect(html).toBe('<pre class="editor editor-colors"><div class="line"><span class="syntax--source syntax--coffee"><span>test</span></span></div></pre>');
        return done();
      });
    });

    return it("uses the best grammar match when no scope name is specified", function(done) {
      const highlights = new Highlights({scopePrefix: 'syntax--'});
      return highlights.highlight({fileContents: 'test', filePath: 'test.coffee'}, function(err, html) {
        expect(html).toBe('<pre class="editor editor-colors"><div class="line"><span class="syntax--source syntax--coffee"><span>test</span></span></div></pre>');
        return done();
      });
    });
  });

  return describe("async: requireGrammars", function() {
    it("loads the grammars async from a file-based npm module path", function(done) {
      const highlights = new Highlights({scopePrefix: 'syntax--'});
      return highlights.requireGrammars({modulePath: require.resolve('language-erlang/package.json')}, function(err) {
        expect(!err).toBe(true);
        expect(__guard__(highlights.registry.grammarForScopeName('source.erlang'), x => x.path)).toBe(path.resolve(__dirname, '..', 'node_modules', 'language-erlang', 'grammars', 'erlang.cson'));
        return done();
      });
    });

    it("loads the grammars from a folder-based npm module path", function(done) {
      const highlights = new Highlights({scopePrefix: 'syntax--'});
      return highlights.requireGrammars({modulePath: path.resolve(__dirname, '..', 'node_modules', 'language-erlang')}, function(err) {
        expect(!err).toBe(true);
        expect(__guard__(highlights.registry.grammarForScopeName('source.erlang'), x => x.path)).toBe(path.resolve(__dirname, '..', 'node_modules', 'language-erlang', 'grammars', 'erlang.cson'));
        return done();
      });
    });

    return it("loads default grammars prior to loading grammar from module", function(done) {
      const highlights = new Highlights({scopePrefix: 'syntax--'});
      return highlights.requireGrammars({modulePath: require.resolve('language-erlang/package.json')}, (err, html) => highlights.highlight({fileContents: 'test', scopeName: 'source.coffee'}, function(err, html) {
        expect(!err).toBe(true);
        expect(html).toBe('<pre class="editor editor-colors"><div class="line"><span class="syntax--source syntax--coffee"><span>test</span></span></div></pre>');
        return done();
      }));
    });
  });
});

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
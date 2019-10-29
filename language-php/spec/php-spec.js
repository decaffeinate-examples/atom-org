/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
describe('PHP grammar', function() {
  let grammar = null;

  beforeEach(function() {
    waitsForPromise(() => atom.packages.activatePackage('language-php'));

    return runs(function() {
      grammar = atom.grammars.grammarForScopeName('source.php');
      return this.addMatchers({
        toContainAll(arr) {
          return arr.every(el => {
            return this.actual.includes(el);
          });
        }
      });
    });
  });

  it('parses the grammar', function() {
    expect(grammar).toBeTruthy();
    return expect(grammar.scopeName).toBe('source.php');
  });

  describe('operators', function() {
    it('should tokenize = correctly', function() {
      const {tokens} = grammar.tokenizeLine('$test = 2;');

      expect(tokens[0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
      expect(tokens[2]).toEqual({value: ' ', scopes: ['source.php']});
      expect(tokens[3]).toEqual({value: '=', scopes: ['source.php', 'keyword.operator.assignment.php']});
      expect(tokens[4]).toEqual({value: ' ', scopes: ['source.php']});
      expect(tokens[5]).toEqual({value: '2', scopes: ['source.php', 'constant.numeric.decimal.php']});
      return expect(tokens[6]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
  });

    it('should tokenize + correctly', function() {
      const {tokens} = grammar.tokenizeLine('1 + 2;');

      expect(tokens[0]).toEqual({value: '1', scopes: ['source.php', 'constant.numeric.decimal.php']});
      expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php']});
      expect(tokens[2]).toEqual({value: '+', scopes: ['source.php', 'keyword.operator.arithmetic.php']});
      expect(tokens[3]).toEqual({value: ' ', scopes: ['source.php']});
      expect(tokens[4]).toEqual({value: '2', scopes: ['source.php', 'constant.numeric.decimal.php']});
      return expect(tokens[5]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
  });

    it('should tokenize - correctly', function() {
      const {tokens} = grammar.tokenizeLine('1 - 2;');

      expect(tokens[0]).toEqual({value: '1', scopes: ['source.php', 'constant.numeric.decimal.php']});
      expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php']});
      expect(tokens[2]).toEqual({value: '-', scopes: ['source.php', 'keyword.operator.arithmetic.php']});
      expect(tokens[3]).toEqual({value: ' ', scopes: ['source.php']});
      expect(tokens[4]).toEqual({value: '2', scopes: ['source.php', 'constant.numeric.decimal.php']});
      return expect(tokens[5]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
  });

    it('should tokenize * correctly', function() {
      const {tokens} = grammar.tokenizeLine('1 * 2;');

      expect(tokens[0]).toEqual({value: '1', scopes: ['source.php', 'constant.numeric.decimal.php']});
      expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php']});
      expect(tokens[2]).toEqual({value: '*', scopes: ['source.php', 'keyword.operator.arithmetic.php']});
      expect(tokens[3]).toEqual({value: ' ', scopes: ['source.php']});
      expect(tokens[4]).toEqual({value: '2', scopes: ['source.php', 'constant.numeric.decimal.php']});
      return expect(tokens[5]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
  });

    it('should tokenize / correctly', function() {
      const {tokens} = grammar.tokenizeLine('1 / 2;');

      expect(tokens[0]).toEqual({value: '1', scopes: ['source.php', 'constant.numeric.decimal.php']});
      expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php']});
      expect(tokens[2]).toEqual({value: '/', scopes: ['source.php', 'keyword.operator.arithmetic.php']});
      expect(tokens[3]).toEqual({value: ' ', scopes: ['source.php']});
      expect(tokens[4]).toEqual({value: '2', scopes: ['source.php', 'constant.numeric.decimal.php']});
      return expect(tokens[5]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
  });

    it('should tokenize % correctly', function() {
      const {tokens} = grammar.tokenizeLine('1 % 2;');

      expect(tokens[0]).toEqual({value: '1', scopes: ['source.php', 'constant.numeric.decimal.php']});
      expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php']});
      expect(tokens[2]).toEqual({value: '%', scopes: ['source.php', 'keyword.operator.arithmetic.php']});
      expect(tokens[3]).toEqual({value: ' ', scopes: ['source.php']});
      expect(tokens[4]).toEqual({value: '2', scopes: ['source.php', 'constant.numeric.decimal.php']});
      return expect(tokens[5]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
  });

    return describe('combined operators', function() {
      it('should tokenize === correctly', function() {
        const {tokens} = grammar.tokenizeLine('$test === 2;');

        expect(tokens[0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
        expect(tokens[1]).toEqual({value: 'test', scopes: ['source.php', 'variable.other.php']});
        expect(tokens[2]).toEqual({value: ' ', scopes: ['source.php']});
        expect(tokens[3]).toEqual({value: '===', scopes: ['source.php', 'keyword.operator.comparison.php']});
        expect(tokens[4]).toEqual({value: ' ', scopes: ['source.php']});
        expect(tokens[5]).toEqual({value: '2', scopes: ['source.php', 'constant.numeric.decimal.php']});
        return expect(tokens[6]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
    });

      it('should tokenize += correctly', function() {
        const {tokens} = grammar.tokenizeLine('$test += 2;');

        expect(tokens[0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
        expect(tokens[1]).toEqual({value: 'test', scopes: ['source.php', 'variable.other.php']});
        expect(tokens[2]).toEqual({value: ' ', scopes: ['source.php']});
        expect(tokens[3]).toEqual({value: '+=', scopes: ['source.php', 'keyword.operator.assignment.php']});
        expect(tokens[4]).toEqual({value: ' ', scopes: ['source.php']});
        expect(tokens[5]).toEqual({value: '2', scopes: ['source.php', 'constant.numeric.decimal.php']});
        return expect(tokens[6]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
    });

      it('should tokenize -= correctly', function() {
        const {tokens} = grammar.tokenizeLine('$test -= 2;');

        expect(tokens[0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
        expect(tokens[1]).toEqual({value: 'test', scopes: ['source.php', 'variable.other.php']});
        expect(tokens[2]).toEqual({value: ' ', scopes: ['source.php']});
        expect(tokens[3]).toEqual({value: '-=', scopes: ['source.php', 'keyword.operator.assignment.php']});
        expect(tokens[4]).toEqual({value: ' ', scopes: ['source.php']});
        expect(tokens[5]).toEqual({value: '2', scopes: ['source.php', 'constant.numeric.decimal.php']});
        return expect(tokens[6]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
    });

      it('should tokenize *= correctly', function() {
        const {tokens} = grammar.tokenizeLine('$test *= 2;');

        expect(tokens[0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
        expect(tokens[1]).toEqual({value: 'test', scopes: ['source.php', 'variable.other.php']});
        expect(tokens[2]).toEqual({value: ' ', scopes: ['source.php']});
        expect(tokens[3]).toEqual({value: '*=', scopes: ['source.php', 'keyword.operator.assignment.php']});
        expect(tokens[4]).toEqual({value: ' ', scopes: ['source.php']});
        expect(tokens[5]).toEqual({value: '2', scopes: ['source.php', 'constant.numeric.decimal.php']});
        return expect(tokens[6]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
    });

      it('should tokenize /= correctly', function() {
        const {tokens} = grammar.tokenizeLine('$test /= 2;');

        expect(tokens[0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
        expect(tokens[1]).toEqual({value: 'test', scopes: ['source.php', 'variable.other.php']});
        expect(tokens[2]).toEqual({value: ' ', scopes: ['source.php']});
        expect(tokens[3]).toEqual({value: '/=', scopes: ['source.php', 'keyword.operator.assignment.php']});
        expect(tokens[4]).toEqual({value: ' ', scopes: ['source.php']});
        expect(tokens[5]).toEqual({value: '2', scopes: ['source.php', 'constant.numeric.decimal.php']});
        return expect(tokens[6]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
    });

      it('should tokenize %= correctly', function() {
        const {tokens} = grammar.tokenizeLine('$test %= 2;');

        expect(tokens[0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
        expect(tokens[1]).toEqual({value: 'test', scopes: ['source.php', 'variable.other.php']});
        expect(tokens[2]).toEqual({value: ' ', scopes: ['source.php']});
        expect(tokens[3]).toEqual({value: '%=', scopes: ['source.php', 'keyword.operator.assignment.php']});
        expect(tokens[4]).toEqual({value: ' ', scopes: ['source.php']});
        expect(tokens[5]).toEqual({value: '2', scopes: ['source.php', 'constant.numeric.decimal.php']});
        return expect(tokens[6]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
    });

      it('should tokenize .= correctly', function() {
        const {tokens} = grammar.tokenizeLine('$test .= 2;');

        expect(tokens[0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
        expect(tokens[1]).toEqual({value: 'test', scopes: ['source.php', 'variable.other.php']});
        expect(tokens[2]).toEqual({value: ' ', scopes: ['source.php']});
        expect(tokens[3]).toEqual({value: '.=', scopes: ['source.php', 'keyword.operator.string.php']});
        expect(tokens[4]).toEqual({value: ' ', scopes: ['source.php']});
        expect(tokens[5]).toEqual({value: '2', scopes: ['source.php', 'constant.numeric.decimal.php']});
        return expect(tokens[6]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
    });

      it('should tokenize &= correctly', function() {
        const {tokens} = grammar.tokenizeLine('$test &= 2;');

        expect(tokens[0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
        expect(tokens[1]).toEqual({value: 'test', scopes: ['source.php', 'variable.other.php']});
        expect(tokens[2]).toEqual({value: ' ', scopes: ['source.php']});
        expect(tokens[3]).toEqual({value: '&=', scopes: ['source.php', 'keyword.operator.assignment.php']});
        expect(tokens[4]).toEqual({value: ' ', scopes: ['source.php']});
        expect(tokens[5]).toEqual({value: '2', scopes: ['source.php', 'constant.numeric.decimal.php']});
        return expect(tokens[6]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
    });

      it('should tokenize |= correctly', function() {
        const {tokens} = grammar.tokenizeLine('$test |= 2;');

        expect(tokens[0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
        expect(tokens[1]).toEqual({value: 'test', scopes: ['source.php', 'variable.other.php']});
        expect(tokens[2]).toEqual({value: ' ', scopes: ['source.php']});
        expect(tokens[3]).toEqual({value: '|=', scopes: ['source.php', 'keyword.operator.assignment.php']});
        expect(tokens[4]).toEqual({value: ' ', scopes: ['source.php']});
        expect(tokens[5]).toEqual({value: '2', scopes: ['source.php', 'constant.numeric.decimal.php']});
        return expect(tokens[6]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
    });

      it('should tokenize ^= correctly', function() {
        const {tokens} = grammar.tokenizeLine('$test ^= 2;');

        expect(tokens[0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
        expect(tokens[1]).toEqual({value: 'test', scopes: ['source.php', 'variable.other.php']});
        expect(tokens[2]).toEqual({value: ' ', scopes: ['source.php']});
        expect(tokens[3]).toEqual({value: '^=', scopes: ['source.php', 'keyword.operator.assignment.php']});
        expect(tokens[4]).toEqual({value: ' ', scopes: ['source.php']});
        expect(tokens[5]).toEqual({value: '2', scopes: ['source.php', 'constant.numeric.decimal.php']});
        return expect(tokens[6]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
    });

      it('should tokenize <<= correctly', function() {
        const {tokens} = grammar.tokenizeLine('$test <<= 2;');

        expect(tokens[0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
        expect(tokens[1]).toEqual({value: 'test', scopes: ['source.php', 'variable.other.php']});
        expect(tokens[2]).toEqual({value: ' ', scopes: ['source.php']});
        expect(tokens[3]).toEqual({value: '<<=', scopes: ['source.php', 'keyword.operator.assignment.php']});
        expect(tokens[4]).toEqual({value: ' ', scopes: ['source.php']});
        expect(tokens[5]).toEqual({value: '2', scopes: ['source.php', 'constant.numeric.decimal.php']});
        return expect(tokens[6]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
    });

      it('should tokenize >>= correctly', function() {
        const {tokens} = grammar.tokenizeLine('$test >>= 2;');

        expect(tokens[0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
        expect(tokens[1]).toEqual({value: 'test', scopes: ['source.php', 'variable.other.php']});
        expect(tokens[2]).toEqual({value: ' ', scopes: ['source.php']});
        expect(tokens[3]).toEqual({value: '>>=', scopes: ['source.php', 'keyword.operator.assignment.php']});
        expect(tokens[4]).toEqual({value: ' ', scopes: ['source.php']});
        expect(tokens[5]).toEqual({value: '2', scopes: ['source.php', 'constant.numeric.decimal.php']});
        return expect(tokens[6]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
    });

      it('should tokenize ?? correctly', function() {
        const {tokens} = grammar.tokenizeLine("$foo = $bar ?? 'bar';");
        return expect(tokens[8]).toEqual({value: '??', scopes: ['source.php', 'keyword.operator.null-coalescing.php']});
    });

      return describe('ternaries', function() {
        it('should tokenize ternary expressions', function() {
          let {tokens} = grammar.tokenizeLine('$foo = 1 == 3 ? true : false;');
          expect(tokens[11]).toEqual({value: '?', scopes: ['source.php', 'keyword.operator.ternary.php']});
          expect(tokens[15]).toEqual({value: ':', scopes: ['source.php', 'keyword.operator.ternary.php']});

          const lines = grammar.tokenizeLines(`\
$foo = 1 == 3
? true
: false;\
`
          );
          expect(lines[1][0]).toEqual({value: '?', scopes: ['source.php', 'keyword.operator.ternary.php']});
          expect(lines[2][0]).toEqual({value: ':', scopes: ['source.php', 'keyword.operator.ternary.php']});

          ({tokens} = grammar.tokenizeLine('$foo=1==3?true:false;'));
          expect(tokens[6]).toEqual({value: '?', scopes: ['source.php', 'keyword.operator.ternary.php']});
          return expect(tokens[8]).toEqual({value: ':', scopes: ['source.php', 'keyword.operator.ternary.php']});
      });

        it('should tokenize shorthand ternaries', function() {
          const {tokens} = grammar.tokenizeLine('$foo = false ?: false ?: true ?: false;');
          expect(tokens[7]).toEqual({value: '?:', scopes: ['source.php', 'keyword.operator.ternary.php']});
          expect(tokens[11]).toEqual(tokens[7]);
          return expect(tokens[15]).toEqual(tokens[7]);
      });

        it('should tokenize a combination of ternaries', function() {
          const lines = grammar.tokenizeLines(`\
$foo = false ?: true == 1
? true : false ?: false;\
`
          );
          expect(lines[0][7]).toEqual({value: '?:', scopes: ['source.php', 'keyword.operator.ternary.php']});
          expect(lines[1][0]).toEqual({value: '?', scopes: ['source.php', 'keyword.operator.ternary.php']});
          expect(lines[1][4]).toEqual({value: ':', scopes: ['source.php', 'keyword.operator.ternary.php']});
          return expect(lines[1][8]).toEqual({value: '?:', scopes: ['source.php', 'keyword.operator.ternary.php']});
      });

        return it('should tokenize ternaries with double colons', function() {
          const {tokens} = grammar.tokenizeLine('true ? A::$a : B::$b');

          expect(tokens[2]).toEqual({value: '?', scopes: ["source.php", "keyword.operator.ternary.php"]});
          expect(tokens[5]).toEqual({value: '::', scopes: ["source.php", "keyword.operator.class.php"]});
          expect(tokens[9]).toEqual({value: ':', scopes: ["source.php", "keyword.operator.ternary.php"]});
          return expect(tokens[12]).toEqual({value: '::', scopes: ["source.php", "keyword.operator.class.php"]});
      });
    });
  });
});

  describe('identifiers', function() {
    it('tokenizes identifiers with only letters', function() {
      let {tokens} = grammar.tokenizeLine('$abc');

      expect(tokens[1]).toEqual({value: 'abc', scopes: ['source.php', 'variable.other.php']});

      ({tokens} = grammar.tokenizeLine('$aBc'));

      return expect(tokens[1]).toEqual({value: 'aBc', scopes: ['source.php', 'variable.other.php']});
  });

    it('tokenizes identifiers with a combination of letters and numbers', function() {
      const {tokens} = grammar.tokenizeLine('$a1B99c4');

      return expect(tokens[1]).toEqual({value: 'a1B99c4', scopes: ['source.php', 'variable.other.php']});
  });

    it('tokenizes identifiers that contain accents, umlauts, or similar', function() {
      const {tokens} = grammar.tokenizeLine('$ßÄÖÜäöüàésF4s3');

      return expect(tokens[1]).toEqual({value: 'ßÄÖÜäöüàésF4s3', scopes: ['source.php', 'variable.other.php']});
  });

    it('tokenizes identifiers that contain Arabic', function() {
      const {tokens} = grammar.tokenizeLine('$سن');

      return expect(tokens[1]).toEqual({value: 'سن', scopes: ['source.php', 'variable.other.php']});
  });

    return it('tokenizes identifiers that contain emojis', function() {
      const {tokens} = grammar.tokenizeLine('$🐘');

      return expect(tokens[1]).toEqual({value: '🐘', scopes: ['source.php', 'variable.other.php']});
  });
});

  it('should tokenize $this', function() {
    let {tokens} = grammar.tokenizeLine('$this');

    expect(tokens[0]).toEqual({value: '$', scopes: ['source.php', 'variable.language.this.php', 'punctuation.definition.variable.php']});
    expect(tokens[1]).toEqual({value: 'this', scopes: ['source.php', 'variable.language.this.php']});

    ({tokens} = grammar.tokenizeLine('$thistles'));

    expect(tokens[0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
    return expect(tokens[1]).toEqual({value: 'thistles', scopes: ['source.php', 'variable.other.php']});
});

  describe('declaring namespaces', function() {
    it('tokenizes namespaces', function() {
      const {tokens} = grammar.tokenizeLine('namespace Test;');

      expect(tokens[0]).toEqual({value: 'namespace', scopes: ['source.php', 'meta.namespace.php', 'keyword.other.namespace.php']});
      expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php', 'meta.namespace.php']});
      expect(tokens[2]).toEqual({value: 'Test', scopes: ['source.php', 'meta.namespace.php', 'entity.name.type.namespace.php']});
      return expect(tokens[3]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
  });

    it('tokenizes sub-namespaces', function() {
      const {tokens} = grammar.tokenizeLine('namespace One\\Two\\Three;');

      expect(tokens[0]).toEqual({value: 'namespace', scopes: ['source.php', 'meta.namespace.php', 'keyword.other.namespace.php']});
      expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php', 'meta.namespace.php']});
      expect(tokens[2]).toEqual({value: 'One', scopes: ['source.php', 'meta.namespace.php', 'entity.name.type.namespace.php']});
      expect(tokens[3]).toEqual({value: '\\', scopes: ['source.php', 'meta.namespace.php', 'entity.name.type.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(tokens[4]).toEqual({value: 'Two', scopes: ['source.php', 'meta.namespace.php', 'entity.name.type.namespace.php']});
      expect(tokens[5]).toEqual({value: '\\', scopes: ['source.php', 'meta.namespace.php', 'entity.name.type.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(tokens[6]).toEqual({value: 'Three', scopes: ['source.php', 'meta.namespace.php', 'entity.name.type.namespace.php']});
      return expect(tokens[7]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
  });

    it('tokenizes bracketed namespaces', function() {
      let lines = grammar.tokenizeLines(`\
namespace Test {
  // code
}\
`
      );

      expect(lines[0][0]).toEqual({value: 'namespace', scopes: ['source.php', 'meta.namespace.php', 'keyword.other.namespace.php']});
      expect(lines[0][1]).toEqual({value: ' ', scopes: ['source.php', 'meta.namespace.php']});
      expect(lines[0][2]).toEqual({value: 'Test', scopes: ['source.php', 'meta.namespace.php', 'entity.name.type.namespace.php']});
      expect(lines[0][3]).toEqual({value: ' ', scopes: ['source.php', 'meta.namespace.php']});
      expect(lines[0][4]).toEqual({value: '{', scopes: ['source.php', 'meta.namespace.php', 'punctuation.definition.namespace.begin.bracket.curly.php']});
      expect(lines[1][1]).toEqual({value: '//', scopes: ['source.php', 'meta.namespace.php', 'comment.line.double-slash.php', 'punctuation.definition.comment.php']});
      expect(lines[2][0]).toEqual({value: '}', scopes: ['source.php', 'meta.namespace.php', 'punctuation.definition.namespace.end.bracket.curly.php']});

      lines = grammar.tokenizeLines(`\
namespace Test
{
  // code
}\
`
      );

      expect(lines[0][0]).toEqual({value: 'namespace', scopes: ['source.php', 'meta.namespace.php', 'keyword.other.namespace.php']});
      expect(lines[0][1]).toEqual({value: ' ', scopes: ['source.php', 'meta.namespace.php']});
      expect(lines[0][2]).toEqual({value: 'Test', scopes: ['source.php', 'meta.namespace.php', 'entity.name.type.namespace.php']});
      expect(lines[1][0]).toEqual({value: '{', scopes: ['source.php', 'meta.namespace.php', 'punctuation.definition.namespace.begin.bracket.curly.php']});
      expect(lines[2][1]).toEqual({value: '//', scopes: ['source.php', 'meta.namespace.php', 'comment.line.double-slash.php', 'punctuation.definition.comment.php']});
      expect(lines[3][0]).toEqual({value: '}', scopes: ['source.php', 'meta.namespace.php', 'punctuation.definition.namespace.end.bracket.curly.php']});

      lines = grammar.tokenizeLines(`\
namespace One\\Two\\Three {
  // code
}\
`
      );

      expect(lines[0][0]).toEqual({value: 'namespace', scopes: ['source.php', 'meta.namespace.php', 'keyword.other.namespace.php']});
      expect(lines[0][1]).toEqual({value: ' ', scopes: ['source.php', 'meta.namespace.php']});
      expect(lines[0][2]).toEqual({value: 'One', scopes: ['source.php', 'meta.namespace.php', 'entity.name.type.namespace.php']});
      expect(lines[0][3]).toEqual({value: '\\', scopes: ['source.php', 'meta.namespace.php', 'entity.name.type.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(lines[0][4]).toEqual({value: 'Two', scopes: ['source.php', 'meta.namespace.php', 'entity.name.type.namespace.php']});
      expect(lines[0][5]).toEqual({value: '\\', scopes: ['source.php', 'meta.namespace.php', 'entity.name.type.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(lines[0][6]).toEqual({value: 'Three', scopes: ['source.php', 'meta.namespace.php', 'entity.name.type.namespace.php']});
      expect(lines[0][7]).toEqual({value: ' ', scopes: ['source.php', 'meta.namespace.php']});
      expect(lines[0][8]).toEqual({value: '{', scopes: ['source.php', 'meta.namespace.php', 'punctuation.definition.namespace.begin.bracket.curly.php']});
      expect(lines[1][1]).toEqual({value: '//', scopes: ['source.php', 'meta.namespace.php', 'comment.line.double-slash.php', 'punctuation.definition.comment.php']});
      expect(lines[2][0]).toEqual({value: '}', scopes: ['source.php', 'meta.namespace.php', 'punctuation.definition.namespace.end.bracket.curly.php']});

      lines = grammar.tokenizeLines(`\
namespace One\\Two\\Three
{
  // code
}\
`
      );

      expect(lines[0][0]).toEqual({value: 'namespace', scopes: ['source.php', 'meta.namespace.php', 'keyword.other.namespace.php']});
      expect(lines[0][1]).toEqual({value: ' ', scopes: ['source.php', 'meta.namespace.php']});
      expect(lines[0][2]).toEqual({value: 'One', scopes: ['source.php', 'meta.namespace.php', 'entity.name.type.namespace.php']});
      expect(lines[0][3]).toEqual({value: '\\', scopes: ['source.php', 'meta.namespace.php', 'entity.name.type.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(lines[0][4]).toEqual({value: 'Two', scopes: ['source.php', 'meta.namespace.php', 'entity.name.type.namespace.php']});
      expect(lines[0][5]).toEqual({value: '\\', scopes: ['source.php', 'meta.namespace.php', 'entity.name.type.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(lines[0][6]).toEqual({value: 'Three', scopes: ['source.php', 'meta.namespace.php', 'entity.name.type.namespace.php']});
      expect(lines[1][0]).toEqual({value: '{', scopes: ['source.php', 'meta.namespace.php', 'punctuation.definition.namespace.begin.bracket.curly.php']});
      expect(lines[2][1]).toEqual({value: '//', scopes: ['source.php', 'meta.namespace.php', 'comment.line.double-slash.php', 'punctuation.definition.comment.php']});
      return expect(lines[3][0]).toEqual({value: '}', scopes: ['source.php', 'meta.namespace.php', 'punctuation.definition.namespace.end.bracket.curly.php']});
  });

    return it('tokenizes global namespaces', function() {
      let lines = grammar.tokenizeLines(`\
namespace {
  // code
}\
`
      );

      expect(lines[0][0]).toEqual({value: 'namespace', scopes: ['source.php', 'meta.namespace.php', 'keyword.other.namespace.php']});
      expect(lines[0][1]).toEqual({value: ' ', scopes: ['source.php', 'meta.namespace.php']});
      expect(lines[0][2]).toEqual({value: '{', scopes: ['source.php', 'meta.namespace.php', 'punctuation.definition.namespace.begin.bracket.curly.php']});
      expect(lines[1][1]).toEqual({value: '//', scopes: ['source.php', 'meta.namespace.php', 'comment.line.double-slash.php', 'punctuation.definition.comment.php']});
      expect(lines[2][0]).toEqual({value: '}', scopes: ['source.php', 'meta.namespace.php', 'punctuation.definition.namespace.end.bracket.curly.php']});

      lines = grammar.tokenizeLines(`\
namespace
{
  // code
}\
`
      );

      expect(lines[0][0]).toEqual({value: 'namespace', scopes: ['source.php', 'meta.namespace.php', 'keyword.other.namespace.php']});
      expect(lines[1][0]).toEqual({value: '{', scopes: ['source.php', 'meta.namespace.php', 'punctuation.definition.namespace.begin.bracket.curly.php']});
      expect(lines[2][1]).toEqual({value: '//', scopes: ['source.php', 'meta.namespace.php', 'comment.line.double-slash.php', 'punctuation.definition.comment.php']});
      return expect(lines[3][0]).toEqual({value: '}', scopes: ['source.php', 'meta.namespace.php', 'punctuation.definition.namespace.end.bracket.curly.php']});
  });
});

  describe('using namespaces', function() {
    it('tokenizes basic use statements', function() {
      let {tokens} = grammar.tokenizeLine('use ArrayObject;');

      expect(tokens[0]).toEqual({value: 'use', scopes: ['source.php', 'meta.use.php', 'keyword.other.use.php']});
      expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php', 'meta.use.php']});
      expect(tokens[2]).toEqual({value: 'ArrayObject', scopes: ['source.php', 'meta.use.php', 'support.class.builtin.php']});
      expect(tokens[3]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});

      ({tokens} = grammar.tokenizeLine('use My\\Full\\NSname;'));

      expect(tokens[0]).toEqual({value: 'use', scopes: ['source.php', 'meta.use.php', 'keyword.other.use.php']});
      expect(tokens[2]).toEqual({value: 'My', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php']});
      expect(tokens[3]).toEqual({value: '\\', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(tokens[4]).toEqual({value: 'Full', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php']});
      expect(tokens[5]).toEqual({value: '\\', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(tokens[6]).toEqual({value: 'NSname', scopes: ['source.php', 'meta.use.php', 'support.class.php']});
      return expect(tokens[7]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
  });

    it('tokenizes multiline use statements', function() {
      const lines = grammar.tokenizeLines(`\
use One\\Two,
    Three\\Four;\
`
      );

      expect(lines[0][0]).toEqual({value: 'use', scopes: ['source.php', 'meta.use.php', 'keyword.other.use.php']});
      expect(lines[0][2]).toEqual({value: 'One', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php']});
      expect(lines[0][3]).toEqual({value: '\\', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(lines[0][4]).toEqual({value: 'Two', scopes: ['source.php', 'meta.use.php', 'support.class.php']});
      expect(lines[0][5]).toEqual({value: ',', scopes: ['source.php', 'meta.use.php', 'punctuation.separator.delimiter.php']});
      expect(lines[1][1]).toEqual({value: 'Three', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php']});
      expect(lines[1][2]).toEqual({value: '\\', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(lines[1][3]).toEqual({value: 'Four', scopes: ['source.php', 'meta.use.php', 'support.class.php']});
      return expect(lines[1][4]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
  });

    it('tokenizes use function statements', function() {
      const {tokens} = grammar.tokenizeLine('use function My\\Full\\functionName;');

      expect(tokens[0]).toEqual({value: 'use', scopes: ['source.php', 'meta.use.php', 'keyword.other.use.php']});
      expect(tokens[2]).toEqual({value: 'function', scopes: ['source.php', 'meta.use.php', 'storage.type.function.php']});
      expect(tokens[3]).toEqual({value: ' ', scopes: ['source.php', 'meta.use.php']});
      expect(tokens[4]).toEqual({value: 'My', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php']});
      expect(tokens[5]).toEqual({value: '\\', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(tokens[6]).toEqual({value: 'Full', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php']});
      expect(tokens[7]).toEqual({value: '\\', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(tokens[8]).toEqual({value: 'functionName', scopes: ['source.php', 'meta.use.php', 'support.class.php']});
      return expect(tokens[9]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
  });

    it('tokenizes use const statements', function() {
      const {tokens} = grammar.tokenizeLine('use const My\\Full\\CONSTANT;');

      expect(tokens[0]).toEqual({value: 'use', scopes: ['source.php', 'meta.use.php', 'keyword.other.use.php']});
      expect(tokens[2]).toEqual({value: 'const', scopes: ['source.php', 'meta.use.php', 'storage.type.const.php']});
      expect(tokens[3]).toEqual({value: ' ', scopes: ['source.php', 'meta.use.php']});
      expect(tokens[4]).toEqual({value: 'My', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php']});
      expect(tokens[5]).toEqual({value: '\\', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(tokens[6]).toEqual({value: 'Full', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php']});
      expect(tokens[7]).toEqual({value: '\\', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(tokens[8]).toEqual({value: 'CONSTANT', scopes: ['source.php', 'meta.use.php', 'support.class.php']});
      return expect(tokens[9]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
  });

    it('tokenizes use-as statements', function() {
      const {tokens} = grammar.tokenizeLine('use My\\Full\\Classname as Another;');

      expect(tokens[0]).toEqual({value: 'use', scopes: ['source.php', 'meta.use.php', 'keyword.other.use.php']});
      expect(tokens[2]).toEqual({value: 'My', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php']});
      expect(tokens[3]).toEqual({value: '\\', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(tokens[4]).toEqual({value: 'Full', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php']});
      expect(tokens[5]).toEqual({value: '\\', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(tokens[6]).toEqual({value: 'Classname', scopes: ['source.php', 'meta.use.php', 'support.class.php']});
      expect(tokens[7]).toEqual({value: ' ', scopes: ['source.php', 'meta.use.php']});
      expect(tokens[8]).toEqual({value: 'as', scopes: ['source.php', 'meta.use.php', 'keyword.other.use-as.php']});
      expect(tokens[9]).toEqual({value: ' ', scopes: ['source.php', 'meta.use.php']});
      expect(tokens[10]).toEqual({value: 'Another', scopes: ['source.php', 'meta.use.php', 'entity.other.alias.php']});
      return expect(tokens[11]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
  });

    it('tokenizes multiple combined use statements', function() {
      const {tokens} = grammar.tokenizeLine('use My\\Full\\Classname as Another, My\\Full\\NSname;');

      expect(tokens[0]).toEqual({value: 'use', scopes: ['source.php', 'meta.use.php', 'keyword.other.use.php']});
      expect(tokens[2]).toEqual({value: 'My', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php']});
      expect(tokens[3]).toEqual({value: '\\', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(tokens[4]).toEqual({value: 'Full', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php']});
      expect(tokens[5]).toEqual({value: '\\', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(tokens[6]).toEqual({value: 'Classname', scopes: ['source.php', 'meta.use.php', 'support.class.php']});
      expect(tokens[8]).toEqual({value: 'as', scopes: ['source.php', 'meta.use.php', 'keyword.other.use-as.php']});
      expect(tokens[10]).toEqual({value: 'Another', scopes: ['source.php', 'meta.use.php', 'entity.other.alias.php']});
      expect(tokens[11]).toEqual({value: ',', scopes: ['source.php', 'meta.use.php', 'punctuation.separator.delimiter.php']});
      expect(tokens[12]).toEqual({value: ' ', scopes: ['source.php', 'meta.use.php']});
      expect(tokens[13]).toEqual({value: 'My', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php']});
      expect(tokens[14]).toEqual({value: '\\', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(tokens[15]).toEqual({value: 'Full', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php']});
      expect(tokens[16]).toEqual({value: '\\', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(tokens[17]).toEqual({value: 'NSname', scopes: ['source.php', 'meta.use.php', 'support.class.php']});
      return expect(tokens[18]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
  });

    return it('tokenizes grouped use statements', function() {
      const tokens = grammar.tokenizeLines(`\
use some\\namespace\\{
  ClassA,
  ClassB,
  ClassC as C
};\
`
      );

      expect(tokens[0][0]).toEqual({value: 'use', scopes: ['source.php', 'meta.use.php', 'keyword.other.use.php']});
      expect(tokens[0][2]).toEqual({value: 'some', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php']});
      expect(tokens[0][3]).toEqual({value: '\\', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(tokens[0][4]).toEqual({value: 'namespace', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php']});
      expect(tokens[0][5]).toEqual({value: '\\', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(tokens[0][6]).toEqual({value: '{', scopes: ['source.php', 'meta.use.php', 'punctuation.definition.use.begin.bracket.curly.php']});
      expect(tokens[1][1]).toEqual({value: 'ClassA', scopes: ['source.php', 'meta.use.php', 'support.class.php']});
      expect(tokens[1][2]).toEqual({value: ',', scopes: ['source.php', 'meta.use.php', 'punctuation.separator.delimiter.php']});
      expect(tokens[2][1]).toEqual({value: 'ClassB', scopes: ['source.php', 'meta.use.php', 'support.class.php']});
      expect(tokens[2][2]).toEqual({value: ',', scopes: ['source.php', 'meta.use.php', 'punctuation.separator.delimiter.php']});
      expect(tokens[3][1]).toEqual({value: 'ClassC', scopes: ['source.php', 'meta.use.php', 'support.class.php']});
      expect(tokens[3][2]).toEqual({value: ' ', scopes: ['source.php', 'meta.use.php']});
      expect(tokens[3][3]).toEqual({value: 'as', scopes: ['source.php', 'meta.use.php', 'keyword.other.use-as.php']});
      expect(tokens[3][4]).toEqual({value: ' ', scopes: ['source.php', 'meta.use.php']});
      expect(tokens[3][5]).toEqual({value: 'C', scopes: ['source.php', 'meta.use.php', 'entity.other.alias.php']});
      expect(tokens[4][0]).toEqual({value: '}', scopes: ['source.php', 'meta.use.php', 'punctuation.definition.use.end.bracket.curly.php']});
      return expect(tokens[4][1]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
  });
});

  describe('classes', function() {
    it('tokenizes class declarations', function() {
      const {tokens} = grammar.tokenizeLine('class Test { /* stuff */ }');

      expect(tokens[0]).toEqual({value: 'class', scopes: ['source.php', 'meta.class.php', 'storage.type.class.php']});
      expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php', 'meta.class.php']});
      expect(tokens[2]).toEqual({value: 'Test', scopes: ['source.php', 'meta.class.php', 'entity.name.type.class.php']});
      expect(tokens[3]).toEqual({value: ' ', scopes: ['source.php', 'meta.class.php']});
      expect(tokens[4]).toEqual({value: '{', scopes: ['source.php', 'meta.class.php', 'punctuation.definition.class.begin.bracket.curly.php']});
      expect(tokens[5]).toEqual({value: ' ', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php']});
      expect(tokens[6]).toEqual({value: '/*', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'comment.block.php', 'punctuation.definition.comment.php']});
      return expect(tokens[10]).toEqual({value: '}', scopes: ['source.php', 'meta.class.php', 'punctuation.definition.class.end.bracket.curly.php']});
  });

    it('tokenizes class modifiers', function() {
      let {tokens} = grammar.tokenizeLine('abstract class Test {}');

      expect(tokens[0]).toEqual({value: 'abstract', scopes: ['source.php', 'meta.class.php', 'storage.modifier.abstract.php']});
      expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php', 'meta.class.php']});
      expect(tokens[2]).toEqual({value: 'class', scopes: ['source.php', 'meta.class.php', 'storage.type.class.php']});
      expect(tokens[3]).toEqual({value: ' ', scopes: ['source.php', 'meta.class.php']});
      expect(tokens[4]).toEqual({value: 'Test', scopes: ['source.php', 'meta.class.php', 'entity.name.type.class.php']});

      ({tokens} = grammar.tokenizeLine('final class Test {}'));

      expect(tokens[0]).toEqual({value: 'final', scopes: ['source.php', 'meta.class.php', 'storage.modifier.final.php']});
      expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php', 'meta.class.php']});
      expect(tokens[2]).toEqual({value: 'class', scopes: ['source.php', 'meta.class.php', 'storage.type.class.php']});
      expect(tokens[3]).toEqual({value: ' ', scopes: ['source.php', 'meta.class.php']});
      return expect(tokens[4]).toEqual({value: 'Test', scopes: ['source.php', 'meta.class.php', 'entity.name.type.class.php']});
  });

    it('tokenizes classes declared immediately after another class ends', function() {
      const {tokens} = grammar.tokenizeLine('class Test {}final class Test2 {}');

      expect(tokens[6]).toEqual({value: 'final', scopes: ['source.php', 'meta.class.php', 'storage.modifier.final.php']});
      expect(tokens[8]).toEqual({value: 'class', scopes: ['source.php', 'meta.class.php', 'storage.type.class.php']});
      return expect(tokens[10]).toEqual({value: 'Test2', scopes: ['source.php', 'meta.class.php', 'entity.name.type.class.php']});
  });

    return describe('use statements', function() {
      it('tokenizes basic use statements', function() {
        let lines = grammar.tokenizeLines(`\
class Test {
  use A;
}\
`
        );

        expect(lines[1][1]).toEqual({value: 'use', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'keyword.other.use.php']});
        expect(lines[1][2]).toEqual({value: ' ', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php']});
        expect(lines[1][3]).toEqual({value: 'A', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'support.class.php']});
        expect(lines[1][4]).toEqual({value: ';', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'punctuation.terminator.expression.php']});

        lines = grammar.tokenizeLines(`\
class Test {
  use A, B;
}\
`
        );

        expect(lines[1][1]).toEqual({value: 'use', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'keyword.other.use.php']});
        expect(lines[1][2]).toEqual({value: ' ', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php']});
        expect(lines[1][3]).toEqual({value: 'A', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'support.class.php']});
        expect(lines[1][4]).toEqual({value: ',', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'punctuation.separator.delimiter.php']});
        expect(lines[1][5]).toEqual({value: ' ', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php']});
        expect(lines[1][6]).toEqual({value: 'B', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'support.class.php']});
        expect(lines[1][7]).toEqual({value: ';', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'punctuation.terminator.expression.php']});

        lines = grammar.tokenizeLines(`\
class Test {
  use A\\B;
}\
`
        );

        expect(lines[1][1]).toEqual({value: 'use', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'keyword.other.use.php']});
        expect(lines[1][2]).toEqual({value: ' ', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php']});
        expect(lines[1][3]).toEqual({value: 'A', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'support.other.namespace.php']});
        expect(lines[1][4]).toEqual({value: '\\', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
        expect(lines[1][5]).toEqual({value: 'B', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'support.class.php']});
        return expect(lines[1][6]).toEqual({value: ';', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'punctuation.terminator.expression.php']});
    });

      it('tokenizes multiline use statements', function() {
        const lines = grammar.tokenizeLines(`\
class Test {
  use One\\Two,
      Three\\Four;
}\
`
        );

        expect(lines[1][1]).toEqual({value: 'use', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'keyword.other.use.php']});
        expect(lines[1][3]).toEqual({value: 'One', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'support.other.namespace.php']});
        expect(lines[1][4]).toEqual({value: '\\', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
        expect(lines[1][5]).toEqual({value: 'Two', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'support.class.php']});
        expect(lines[1][6]).toEqual({value: ',', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'punctuation.separator.delimiter.php']});
        expect(lines[2][1]).toEqual({value: 'Three', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'support.other.namespace.php']});
        expect(lines[2][2]).toEqual({value: '\\', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
        expect(lines[2][3]).toEqual({value: 'Four', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'support.class.php']});
        return expect(lines[2][4]).toEqual({value: ';', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'punctuation.terminator.expression.php']});
    });

      it('tokenizes complex use statements', function() {
        const lines = grammar.tokenizeLines(`\
class Test {
  use A, B {
    B::smallTalk insteadof A;
  }
  /* comment */
}\
`
        );

        expect(lines[1][1]).toEqual({value: 'use', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'keyword.other.use.php']});
        expect(lines[1][2]).toEqual({value: ' ', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php']});
        expect(lines[1][3]).toEqual({value: 'A', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'support.class.php']});
        expect(lines[1][4]).toEqual({value: ',', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'punctuation.separator.delimiter.php']});
        expect(lines[1][5]).toEqual({value: ' ', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php']});
        expect(lines[1][6]).toEqual({value: 'B', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'support.class.php']});
        expect(lines[1][7]).toEqual({value: ' ', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php']});
        expect(lines[1][8]).toEqual({value: '{', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'punctuation.definition.use.begin.bracket.curly.php']});
        expect(lines[2][1]).toEqual({value: 'B', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'support.class.php']});
        expect(lines[2][2]).toEqual({value: '::', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'keyword.operator.class.php']});
        expect(lines[2][3]).toEqual({value: 'smallTalk', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'constant.other.class.php']});
        expect(lines[2][4]).toEqual({value: ' ', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php']});
        expect(lines[2][5]).toEqual({value: 'insteadof', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'keyword.other.use-insteadof.php']});
        expect(lines[2][6]).toEqual({value: ' ', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php']});
        expect(lines[2][7]).toEqual({value: 'A', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'support.class.php']});
        expect(lines[2][8]).toEqual({value: ';', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'punctuation.terminator.expression.php']});
        expect(lines[3][1]).toEqual({value: '}', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'punctuation.definition.use.end.bracket.curly.php']});
        return expect(lines[4][1]).toEqual({value: '/*', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'comment.block.php', 'punctuation.definition.comment.php']});
    });

      it('tokenizes aliases', function() {
        const lines = grammar.tokenizeLines(`\
class Aliased_Talker {
    use A, B {
        B::smallTalk as private talk;
    }
}\
`
        );

        expect(lines[2][1]).toEqual({value: 'B', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'support.class.php']});
        expect(lines[2][2]).toEqual({value: '::', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'keyword.operator.class.php']});
        expect(lines[2][3]).toEqual({value: 'smallTalk', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'constant.other.class.php']});
        expect(lines[2][4]).toEqual({value: ' ', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php']});
        expect(lines[2][5]).toEqual({value: 'as', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'keyword.other.use-as.php']});
        expect(lines[2][6]).toEqual({value: ' ', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php']});
        expect(lines[2][7]).toEqual({value: 'private', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'storage.modifier.php']});
        expect(lines[2][8]).toEqual({value: ' ', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php']});
        expect(lines[2][9]).toEqual({value: 'talk', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'entity.other.alias.php']});
        expect(lines[2][10]).toEqual({value: ';', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'punctuation.terminator.expression.php']});
        return expect(lines[3][1]).toEqual({value: '}', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'punctuation.definition.use.end.bracket.curly.php']});
    });

      return it('tokenizes aliases', function() {
        const lines = grammar.tokenizeLines(`\
class Aliased_Talker {
    use A, B {
        B::smallTalk as talk;
    }
}\
`
        );

        expect(lines[2][1]).toEqual({value: 'B', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'support.class.php']});
        expect(lines[2][2]).toEqual({value: '::', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'keyword.operator.class.php']});
        expect(lines[2][3]).toEqual({value: 'smallTalk', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'constant.other.class.php']});
        expect(lines[2][4]).toEqual({value: ' ', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php']});
        expect(lines[2][5]).toEqual({value: 'as', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'keyword.other.use-as.php']});
        expect(lines[2][6]).toEqual({value: ' ', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php']});
        expect(lines[2][7]).toEqual({value: 'talk', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'entity.other.alias.php']});
        expect(lines[2][8]).toEqual({value: ';', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'punctuation.terminator.expression.php']});
        return expect(lines[3][1]).toEqual({value: '}', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'meta.use.php', 'punctuation.definition.use.end.bracket.curly.php']});
    });
  });
});

  describe('functions', function() {
    it('tokenizes functions with no arguments', function() {
      let {tokens} = grammar.tokenizeLine('function test() {}');

      expect(tokens[0]).toEqual({value: 'function', scopes: ['source.php', 'meta.function.php', 'storage.type.function.php']});
      expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php', 'meta.function.php']});
      expect(tokens[2]).toEqual({value: 'test', scopes: ['source.php', 'meta.function.php', 'entity.name.function.php']});
      expect(tokens[3]).toEqual({value: '(', scopes: ['source.php', 'meta.function.php', 'punctuation.definition.parameters.begin.bracket.round.php']});
      expect(tokens[4]).toEqual({value: ')', scopes: ['source.php', 'meta.function.php', 'punctuation.definition.parameters.end.bracket.round.php']});

      // Should NOT be tokenized as an actual function
      ({tokens} = grammar.tokenizeLine('function_test() {}'));

      return expect(tokens[0]).toEqual({value: 'function_test', scopes: ['source.php', 'meta.function-call.php', 'entity.name.function.php']});
  });

    it('tokenizes default array type with old array value', function() {
      const {tokens} = grammar.tokenizeLine('function array_test(array $value = array()) {}');

      expect(tokens[0]).toEqual({value: 'function', scopes: ['source.php', 'meta.function.php', 'storage.type.function.php']});
      expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php', 'meta.function.php']});
      expect(tokens[2]).toEqual({value: 'array_test', scopes: ['source.php', 'meta.function.php', 'entity.name.function.php']});
      expect(tokens[3]).toEqual({value: '(', scopes: ['source.php', 'meta.function.php', 'punctuation.definition.parameters.begin.bracket.round.php']});
      expect(tokens[4]).toEqual({value: 'array', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php', 'storage.type.php']});
      expect(tokens[5]).toEqual({value: ' ', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php']});
      expect(tokens[6]).toEqual({value: '$', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php', 'variable.other.php', 'punctuation.definition.variable.php']});
      expect(tokens[7]).toEqual({value: 'value', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php', 'variable.other.php']});
      expect(tokens[8]).toEqual({value: ' ', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php']});
      expect(tokens[9]).toEqual({value: '=', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php', 'keyword.operator.assignment.php']});
      expect(tokens[10]).toEqual({value: ' ', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php']});
      expect(tokens[11]).toEqual({value: 'array', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php', 'support.function.construct.php']});
      expect(tokens[12]).toEqual({value: '(', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php', 'punctuation.definition.array.begin.bracket.round.php']});
      expect(tokens[13]).toEqual({value: ')', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php', 'punctuation.definition.array.end.bracket.round.php']});
      expect(tokens[14]).toEqual({value: ')', scopes: ['source.php', 'meta.function.php', 'punctuation.definition.parameters.end.bracket.round.php']});
      expect(tokens[15]).toEqual({value: ' ', scopes: ['source.php']});
      expect(tokens[16]).toEqual({value: '{', scopes: ['source.php', 'punctuation.definition.begin.bracket.curly.php']});
      return expect(tokens[17]).toEqual({value: '}', scopes: ['source.php', 'punctuation.definition.end.bracket.curly.php']});
  });

    it('tokenizes variadic arguments', function() {
      const {tokens} = grammar.tokenizeLine('function test(...$value) {}');

      expect(tokens[4]).toEqual({value: '...', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.no-default.php', 'variable.other.php', 'keyword.operator.variadic.php']});
      expect(tokens[5]).toEqual({value: '$', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.no-default.php', 'variable.other.php', 'punctuation.definition.variable.php']});
      return expect(tokens[6]).toEqual({value: 'value', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.no-default.php', 'variable.other.php']});
  });

    it('tokenizes variadic arguments and typehinted class name', function() {
      const {tokens} = grammar.tokenizeLine('function test(class_name ...$value) {}');

      expect(tokens[4]).toEqual({value: 'class_name', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'storage.type.php']});
      expect(tokens[6]).toEqual({value: '...', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'variable.other.php', 'keyword.operator.variadic.php']});
      expect(tokens[7]).toEqual({value: '$', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'variable.other.php', 'punctuation.definition.variable.php']});
      return expect(tokens[8]).toEqual({value: 'value', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'variable.other.php']});
  });

    it('tokenizes nullable typehints', function() {
      let {tokens} = grammar.tokenizeLine('function test(?class_name $value) {}');

      expect(tokens[4]).toEqual({value: '?', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'keyword.operator.nullable-type.php']});
      expect(tokens[5]).toEqual({value: 'class_name', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'storage.type.php']});
      expect(tokens[7]).toEqual({value: '$', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'variable.other.php', 'punctuation.definition.variable.php']});
      expect(tokens[8]).toEqual({value: 'value', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'variable.other.php']});

      ({tokens} = grammar.tokenizeLine('function test(?   class_name $value) {}'));

      expect(tokens[4]).toEqual({value: '?', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'keyword.operator.nullable-type.php']});
      expect(tokens[5]).toEqual({value: '   ', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php']});
      expect(tokens[6]).toEqual({value: 'class_name', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'storage.type.php']});
      expect(tokens[8]).toEqual({value: '$', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'variable.other.php', 'punctuation.definition.variable.php']});
      return expect(tokens[9]).toEqual({value: 'value', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'variable.other.php']});
  });

    it('tokenizes namespaced and typehinted class names', function() {
      let {tokens} = grammar.tokenizeLine('function test(\\class_name $value) {}');

      expect(tokens[4]).toEqual({value: '\\', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(tokens[5]).toEqual({value: 'class_name', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'storage.type.php']});
      expect(tokens[7]).toEqual({value: '$', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'variable.other.php', 'punctuation.definition.variable.php']});

      ({tokens} = grammar.tokenizeLine('function test(a\\class_name $value) {}'));

      expect(tokens[4]).toEqual({value: 'a', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'support.other.namespace.php', 'storage.type.php']});
      expect(tokens[5]).toEqual({value: '\\', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(tokens[6]).toEqual({value: 'class_name', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'storage.type.php']});
      expect(tokens[8]).toEqual({value: '$', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'variable.other.php', 'punctuation.definition.variable.php']});

      ({tokens} = grammar.tokenizeLine('function test(a\\b\\class_name $value) {}'));

      expect(tokens[4]).toEqual({value: 'a', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'support.other.namespace.php', 'storage.type.php']});
      expect(tokens[5]).toEqual({value: '\\', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(tokens[6]).toEqual({value: 'b', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'support.other.namespace.php', 'storage.type.php']});
      expect(tokens[7]).toEqual({value: '\\', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(tokens[8]).toEqual({value: 'class_name', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'storage.type.php']});
      expect(tokens[10]).toEqual({value: '$', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'variable.other.php', 'punctuation.definition.variable.php']});

      ({tokens} = grammar.tokenizeLine('function test(\\a\\b\\class_name $value) {}'));

      expect(tokens[4]).toEqual({value: '\\', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(tokens[5]).toEqual({value: 'a', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'support.other.namespace.php', 'storage.type.php']});
      expect(tokens[6]).toEqual({value: '\\', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(tokens[7]).toEqual({value: 'b', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'support.other.namespace.php', 'storage.type.php']});
      expect(tokens[8]).toEqual({value: '\\', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(tokens[9]).toEqual({value: 'class_name', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'storage.type.php']});
      return expect(tokens[11]).toEqual({value: '$', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'variable.other.php', 'punctuation.definition.variable.php']});
  });

    it('tokenizes default array type with short array value', function() {
      const {tokens} = grammar.tokenizeLine('function array_test(array $value = []) {}');

      expect(tokens[0]).toEqual({value: 'function', scopes: ['source.php', 'meta.function.php', 'storage.type.function.php']});
      expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php', 'meta.function.php']});
      expect(tokens[2]).toEqual({value: 'array_test', scopes: ['source.php', 'meta.function.php', 'entity.name.function.php']});
      expect(tokens[3]).toEqual({value: '(', scopes: ['source.php', 'meta.function.php', 'punctuation.definition.parameters.begin.bracket.round.php']});
      expect(tokens[4]).toEqual({value: 'array', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php', 'storage.type.php']});
      expect(tokens[5]).toEqual({value: ' ', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php']});
      expect(tokens[6]).toEqual({value: '$', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php', 'variable.other.php', 'punctuation.definition.variable.php']});
      expect(tokens[7]).toEqual({value: 'value', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php', 'variable.other.php']});
      expect(tokens[8]).toEqual({value: ' ', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php']});
      expect(tokens[9]).toEqual({value: '=', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php', 'keyword.operator.assignment.php']});
      expect(tokens[10]).toEqual({value: ' ', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php']});
      expect(tokens[11]).toEqual({value: '[', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php', 'punctuation.section.array.begin.php']});
      expect(tokens[12]).toEqual({value: ']', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php', 'punctuation.section.array.end.php']});
      expect(tokens[13]).toEqual({value: ')', scopes: ['source.php', 'meta.function.php', 'punctuation.definition.parameters.end.bracket.round.php']});
      expect(tokens[14]).toEqual({value: ' ', scopes: ['source.php']});
      expect(tokens[15]).toEqual({value: '{', scopes: ['source.php', 'punctuation.definition.begin.bracket.curly.php']});
      return expect(tokens[16]).toEqual({value: '}', scopes: ['source.php', 'punctuation.definition.end.bracket.curly.php']});
  });

    it('tokenizes a non-empty array', function() {
      const {tokens} = grammar.tokenizeLine("function not_empty_array_test(array $value = [1,2,'3']) {}");

      expect(tokens[11]).toEqual({value: '[', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php', 'punctuation.section.array.begin.php']});
      expect(tokens[12]).toEqual({value: '1', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php', 'constant.numeric.decimal.php']});
      expect(tokens[13]).toEqual({value: ',', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php']});
      expect(tokens[14]).toEqual({value: '2', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php', 'constant.numeric.decimal.php']});
      expect(tokens[15]).toEqual({value: ',', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php']});
      expect(tokens[16]).toEqual({value: '\'', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php', 'string.quoted.single.php', 'punctuation.definition.string.begin.php']});
      expect(tokens[17]).toEqual({value: '3', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php', 'string.quoted.single.php']});
      expect(tokens[18]).toEqual({value: '\'', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php', 'string.quoted.single.php', 'punctuation.definition.string.end.php']});
      return expect(tokens[19]).toEqual({value: ']', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php', 'punctuation.section.array.end.php']});
  });

    it('tokenizes default value with non-lowercase array type hinting', function() {
      const {tokens} = grammar.tokenizeLine('function array_test(Array $value = []) {}');

      expect(tokens[0]).toEqual({value: 'function', scopes: ['source.php', 'meta.function.php', 'storage.type.function.php']});
      expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php', 'meta.function.php']});
      expect(tokens[2]).toEqual({value: 'array_test', scopes: ['source.php', 'meta.function.php', 'entity.name.function.php']});
      expect(tokens[3]).toEqual({value: '(', scopes: ['source.php', 'meta.function.php', 'punctuation.definition.parameters.begin.bracket.round.php']});
      expect(tokens[4]).toEqual({value: 'Array', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php', 'storage.type.php']});
      expect(tokens[5]).toEqual({value: ' ', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php']});
      expect(tokens[6]).toEqual({value: '$', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php', 'variable.other.php', 'punctuation.definition.variable.php']});
      expect(tokens[7]).toEqual({value: 'value', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php', 'variable.other.php']});
      expect(tokens[8]).toEqual({value: ' ', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php']});
      expect(tokens[9]).toEqual({value: '=', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php', 'keyword.operator.assignment.php']});
      expect(tokens[10]).toEqual({value: ' ', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php']});
      expect(tokens[11]).toEqual({value: '[', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php', 'punctuation.section.array.begin.php']});
      expect(tokens[12]).toEqual({value: ']', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.array.php', 'punctuation.section.array.end.php']});
      expect(tokens[13]).toEqual({value: ')', scopes: ['source.php', 'meta.function.php', 'punctuation.definition.parameters.end.bracket.round.php']});
      expect(tokens[14]).toEqual({value: ' ', scopes: ['source.php']});
      expect(tokens[15]).toEqual({value: '{', scopes: ['source.php', 'punctuation.definition.begin.bracket.curly.php']});
      return expect(tokens[16]).toEqual({value: '}', scopes: ['source.php', 'punctuation.definition.end.bracket.curly.php']});
  });

    it('tokenizes multiple typehinted arguments with default values', function() {
      const {tokens} = grammar.tokenizeLine("function test(string $subject = 'no subject', string $body = null) {}");

      expect(tokens[0]).toEqual({value: 'function', scopes: ['source.php', 'meta.function.php', 'storage.type.function.php']});
      expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php', 'meta.function.php']});
      expect(tokens[2]).toEqual({value: 'test', scopes: ['source.php', 'meta.function.php', 'entity.name.function.php']});
      expect(tokens[3]).toEqual({value: '(', scopes: ['source.php', 'meta.function.php', 'punctuation.definition.parameters.begin.bracket.round.php']});
      expect(tokens[4]).toEqual({value: 'string', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'storage.type.php']});
      expect(tokens[6]).toEqual({value: '$', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'variable.other.php', 'punctuation.definition.variable.php']});
      expect(tokens[7]).toEqual({value: 'subject', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'variable.other.php']});
      expect(tokens[8]).toEqual({value: ' ', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php']});
      expect(tokens[9]).toEqual({value: '=', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'keyword.operator.assignment.php']});
      expect(tokens[10]).toEqual({value: ' ', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php']});
      expect(tokens[11]).toEqual({value: "'", scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'string.quoted.single.php', 'punctuation.definition.string.begin.php']});
      expect(tokens[12]).toEqual({value: 'no subject', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'string.quoted.single.php']});
      expect(tokens[13]).toEqual({value: "'", scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'string.quoted.single.php', 'punctuation.definition.string.end.php']});
      expect(tokens[14]).toEqual({value: ',', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'punctuation.separator.delimiter.php']});
      expect(tokens[15]).toEqual({value: ' ', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php']});
      expect(tokens[16]).toEqual({value: 'string', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'storage.type.php']});
      expect(tokens[18]).toEqual({value: '$', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'variable.other.php', 'punctuation.definition.variable.php']});
      expect(tokens[19]).toEqual({value: 'body', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'variable.other.php']});
      expect(tokens[21]).toEqual({value: '=', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'keyword.operator.assignment.php']});
      expect(tokens[22]).toEqual({value: ' ', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php']});
      expect(tokens[23]).toEqual({value: 'null', scopes: ['source.php', 'meta.function.php', 'meta.function.parameters.php', 'meta.function.parameter.typehinted.php', 'constant.language.php']});
      return expect(tokens[24]).toEqual({value: ')', scopes: ['source.php', 'meta.function.php', 'punctuation.definition.parameters.end.bracket.round.php']});
  });

    it('tokenizes return values', function() {
      const {tokens} = grammar.tokenizeLine('function test() : Client {}');

      expect(tokens[0]).toEqual({value: 'function', scopes: ['source.php', 'meta.function.php', 'storage.type.function.php']});
      expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php', 'meta.function.php']});
      expect(tokens[2]).toEqual({value: 'test', scopes: ['source.php', 'meta.function.php', 'entity.name.function.php']});
      expect(tokens[3]).toEqual({value: '(', scopes: ['source.php', 'meta.function.php', 'punctuation.definition.parameters.begin.bracket.round.php']});
      expect(tokens[4]).toEqual({value: ')', scopes: ['source.php', 'meta.function.php', 'punctuation.definition.parameters.end.bracket.round.php']});
      expect(tokens[5]).toEqual({value: ' ', scopes: ['source.php', 'meta.function.php']});
      expect(tokens[6]).toEqual({value: ':', scopes: ['source.php', 'meta.function.php', 'keyword.operator.return-value.php']});
      expect(tokens[7]).toEqual({value: ' ', scopes: ['source.php', 'meta.function.php']});
      expect(tokens[8]).toEqual({value: 'Client', scopes: ['source.php', 'meta.function.php', 'storage.type.php']});
      return expect(tokens[9]).toEqual({value: ' ', scopes: ['source.php']});
  });

    it('tokenizes nullable return values', function() {
      let {tokens} = grammar.tokenizeLine('function test() : ?Client {}');

      expect(tokens[6]).toEqual({value: ':', scopes: ['source.php', 'meta.function.php', 'keyword.operator.return-value.php']});
      expect(tokens[7]).toEqual({value: ' ', scopes: ['source.php', 'meta.function.php']});
      expect(tokens[8]).toEqual({value: '?', scopes: ['source.php', 'meta.function.php', 'keyword.operator.nullable-type.php']});
      expect(tokens[9]).toEqual({value: 'Client', scopes: ['source.php', 'meta.function.php', 'storage.type.php']});

      ({tokens} = grammar.tokenizeLine('function test() : ?   Client {}'));

      expect(tokens[6]).toEqual({value: ':', scopes: ['source.php', 'meta.function.php', 'keyword.operator.return-value.php']});
      expect(tokens[7]).toEqual({value: ' ', scopes: ['source.php', 'meta.function.php']});
      expect(tokens[8]).toEqual({value: '?', scopes: ['source.php', 'meta.function.php', 'keyword.operator.nullable-type.php']});
      expect(tokens[9]).toEqual({value: '   ', scopes: ['source.php', 'meta.function.php']});
      return expect(tokens[10]).toEqual({value: 'Client', scopes: ['source.php', 'meta.function.php', 'storage.type.php']});
  });

    return it('tokenizes function names with characters other than letters or numbers', function() {
      // Char 160 is hex 0xA0, which is between 0x7F and 0xFF, making it a valid PHP identifier
      const functionName = `foo${String.fromCharCode(160)}bar`;
      const {tokens} = grammar.tokenizeLine(`function ${functionName}() {}`);

      expect(tokens[0]).toEqual({value: 'function', scopes: ['source.php', 'meta.function.php', 'storage.type.function.php']});
      expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php', 'meta.function.php']});
      expect(tokens[2]).toEqual({value: functionName, scopes: ['source.php', 'meta.function.php', 'entity.name.function.php']});
      expect(tokens[3]).toEqual({value: '(', scopes: ['source.php', 'meta.function.php', 'punctuation.definition.parameters.begin.bracket.round.php']});
      expect(tokens[4]).toEqual({value: ')', scopes: ['source.php', 'meta.function.php', 'punctuation.definition.parameters.end.bracket.round.php']});
      expect(tokens[5]).toEqual({value: ' ', scopes: ['source.php']});
      expect(tokens[6]).toEqual({value: '{', scopes: ['source.php', 'punctuation.definition.begin.bracket.curly.php']});
      return expect(tokens[7]).toEqual({value: '}', scopes: ['source.php', 'punctuation.definition.end.bracket.curly.php']});
  });
});

  describe('function calls', function() {
    it('tokenizes function calls with no arguments', function() {
      let {tokens} = grammar.tokenizeLine('inverse()');

      expect(tokens[0]).toEqual({value: 'inverse', scopes: ['source.php', 'meta.function-call.php', 'entity.name.function.php']});
      expect(tokens[1]).toEqual({value: '(', scopes: ['source.php', 'meta.function-call.php', 'punctuation.definition.arguments.begin.bracket.round.php']});
      expect(tokens[2]).toEqual({value: ')', scopes: ['source.php', 'meta.function-call.php', 'punctuation.definition.arguments.end.bracket.round.php']});

      ({tokens} = grammar.tokenizeLine('inverse ()'));

      expect(tokens[0]).toEqual({value: 'inverse', scopes: ['source.php', 'meta.function-call.php', 'entity.name.function.php']});
      expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php', 'meta.function-call.php']});
      expect(tokens[2]).toEqual({value: '(', scopes: ['source.php', 'meta.function-call.php', 'punctuation.definition.arguments.begin.bracket.round.php']});
      return expect(tokens[3]).toEqual({value: ')', scopes: ['source.php', 'meta.function-call.php', 'punctuation.definition.arguments.end.bracket.round.php']});
  });

    it('tokenizes function calls with arguments', function() {
      let {tokens} = grammar.tokenizeLine("inverse(5, 'b')");

      expect(tokens[0]).toEqual({value: 'inverse', scopes: ['source.php', 'meta.function-call.php', 'entity.name.function.php']});
      expect(tokens[1]).toEqual({value: '(', scopes: ['source.php', 'meta.function-call.php', 'punctuation.definition.arguments.begin.bracket.round.php']});
      expect(tokens[2]).toEqual({value: '5', scopes: ['source.php', 'meta.function-call.php', 'constant.numeric.decimal.php']});
      expect(tokens[3]).toEqual({value: ',', scopes: ['source.php', 'meta.function-call.php', 'punctuation.separator.delimiter.php']});
      expect(tokens[4]).toEqual({value: ' ', scopes: ['source.php', 'meta.function-call.php']});
      expect(tokens[5]).toEqual({value: "'", scopes: ['source.php', 'meta.function-call.php', 'string.quoted.single.php', 'punctuation.definition.string.begin.php']});
      expect(tokens[6]).toEqual({value: 'b', scopes: ['source.php', 'meta.function-call.php', 'string.quoted.single.php']});
      expect(tokens[7]).toEqual({value: "'", scopes: ['source.php', 'meta.function-call.php', 'string.quoted.single.php', 'punctuation.definition.string.end.php']});
      expect(tokens[8]).toEqual({value: ')', scopes: ['source.php', 'meta.function-call.php', 'punctuation.definition.arguments.end.bracket.round.php']});

      ({tokens} = grammar.tokenizeLine("inverse (5, 'b')"));

      expect(tokens[0]).toEqual({value: 'inverse', scopes: ['source.php', 'meta.function-call.php', 'entity.name.function.php']});
      expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php', 'meta.function-call.php']});
      expect(tokens[2]).toEqual({value: '(', scopes: ['source.php', 'meta.function-call.php', 'punctuation.definition.arguments.begin.bracket.round.php']});
      expect(tokens[3]).toEqual({value: '5', scopes: ['source.php', 'meta.function-call.php', 'constant.numeric.decimal.php']});
      expect(tokens[4]).toEqual({value: ',', scopes: ['source.php', 'meta.function-call.php', 'punctuation.separator.delimiter.php']});
      expect(tokens[5]).toEqual({value: ' ', scopes: ['source.php', 'meta.function-call.php']});
      expect(tokens[6]).toEqual({value: "'", scopes: ['source.php', 'meta.function-call.php', 'string.quoted.single.php', 'punctuation.definition.string.begin.php']});
      expect(tokens[7]).toEqual({value: 'b', scopes: ['source.php', 'meta.function-call.php', 'string.quoted.single.php']});
      expect(tokens[8]).toEqual({value: "'", scopes: ['source.php', 'meta.function-call.php', 'string.quoted.single.php', 'punctuation.definition.string.end.php']});
      return expect(tokens[9]).toEqual({value: ')', scopes: ['source.php', 'meta.function-call.php', 'punctuation.definition.arguments.end.bracket.round.php']});
  });

    it('tokenizes builtin function calls', function() {
      let {tokens} = grammar.tokenizeLine("echo('Hi!')");

      expect(tokens[0]).toEqual({value: 'echo', scopes: ['source.php', 'meta.function-call.php', 'support.function.construct.output.php']});
      expect(tokens[1]).toEqual({value: '(', scopes: ['source.php', 'meta.function-call.php', 'punctuation.definition.arguments.begin.bracket.round.php']});
      expect(tokens[2]).toEqual({value: "'", scopes: ['source.php', 'meta.function-call.php', 'string.quoted.single.php', 'punctuation.definition.string.begin.php']});
      expect(tokens[3]).toEqual({value: 'Hi!', scopes: ['source.php', 'meta.function-call.php', 'string.quoted.single.php']});
      expect(tokens[4]).toEqual({value: "'", scopes: ['source.php', 'meta.function-call.php', 'string.quoted.single.php', 'punctuation.definition.string.end.php']});
      expect(tokens[5]).toEqual({value: ')', scopes: ['source.php', 'meta.function-call.php', 'punctuation.definition.arguments.end.bracket.round.php']});

      ({tokens} = grammar.tokenizeLine("echo ('Hi!')"));

      expect(tokens[0]).toEqual({value: 'echo', scopes: ['source.php', 'meta.function-call.php', 'support.function.construct.output.php']});
      expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php', 'meta.function-call.php']});
      expect(tokens[2]).toEqual({value: '(', scopes: ['source.php', 'meta.function-call.php', 'punctuation.definition.arguments.begin.bracket.round.php']});
      expect(tokens[3]).toEqual({value: "'", scopes: ['source.php', 'meta.function-call.php', 'string.quoted.single.php', 'punctuation.definition.string.begin.php']});
      expect(tokens[4]).toEqual({value: 'Hi!', scopes: ['source.php', 'meta.function-call.php', 'string.quoted.single.php']});
      expect(tokens[5]).toEqual({value: "'", scopes: ['source.php', 'meta.function-call.php', 'string.quoted.single.php', 'punctuation.definition.string.end.php']});
      return expect(tokens[6]).toEqual({value: ')', scopes: ['source.php', 'meta.function-call.php', 'punctuation.definition.arguments.end.bracket.round.php']});
  });

    it('tokenizes root-namespaced function calls', function() {
      const {tokens} = grammar.tokenizeLine('\\test()');

      expect(tokens[0]).toEqual({value: '\\', scopes: ['source.php', 'meta.function-call.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      return expect(tokens[1]).toEqual({value: 'test', scopes: ['source.php', 'meta.function-call.php', 'entity.name.function.php']});
  });

    it('tokenizes user-namespaced function calls', function() {
      let {tokens} = grammar.tokenizeLine('hello\\test()');

      expect(tokens[0]).toEqual({value: 'hello', scopes: ['source.php', 'meta.function-call.php', 'support.other.namespace.php']});
      expect(tokens[1]).toEqual({value: '\\', scopes: ['source.php', 'meta.function-call.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(tokens[2]).toEqual({value: 'test', scopes: ['source.php', 'meta.function-call.php', 'entity.name.function.php']});

      ({tokens} = grammar.tokenizeLine('one\\two\\test()'));

      expect(tokens[0]).toEqual({value: 'one', scopes: ['source.php', 'meta.function-call.php', 'support.other.namespace.php']});
      expect(tokens[1]).toEqual({value: '\\', scopes: ['source.php', 'meta.function-call.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(tokens[2]).toEqual({value: 'two', scopes: ['source.php', 'meta.function-call.php', 'support.other.namespace.php']});
      expect(tokens[3]).toEqual({value: '\\', scopes: ['source.php', 'meta.function-call.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      return expect(tokens[4]).toEqual({value: 'test', scopes: ['source.php', 'meta.function-call.php', 'entity.name.function.php']});
  });

    it('tokenizes absolutely-namespaced function calls', function() {
      let {tokens} = grammar.tokenizeLine('\\hello\\test()');

      expect(tokens[0]).toEqual({value: '\\', scopes: ['source.php', 'meta.function-call.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(tokens[1]).toEqual({value: 'hello', scopes: ['source.php', 'meta.function-call.php', 'support.other.namespace.php']});
      expect(tokens[2]).toEqual({value: '\\', scopes: ['source.php', 'meta.function-call.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(tokens[3]).toEqual({value: 'test', scopes: ['source.php', 'meta.function-call.php', 'entity.name.function.php']});

      ({tokens} = grammar.tokenizeLine('\\one\\two\\test()'));

      expect(tokens[0]).toEqual({value: '\\', scopes: ['source.php', 'meta.function-call.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(tokens[1]).toEqual({value: 'one', scopes: ['source.php', 'meta.function-call.php', 'support.other.namespace.php']});
      expect(tokens[2]).toEqual({value: '\\', scopes: ['source.php', 'meta.function-call.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(tokens[3]).toEqual({value: 'two', scopes: ['source.php', 'meta.function-call.php', 'support.other.namespace.php']});
      expect(tokens[4]).toEqual({value: '\\', scopes: ['source.php', 'meta.function-call.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      return expect(tokens[5]).toEqual({value: 'test', scopes: ['source.php', 'meta.function-call.php', 'entity.name.function.php']});
  });

    return it('does not treat user-namespaced functions as builtins', function() {
      let {tokens} = grammar.tokenizeLine('hello\\apc_store()');

      expect(tokens[2]).toEqual({value: 'apc_store', scopes: ['source.php', 'meta.function-call.php', 'entity.name.function.php']});

      ({tokens} = grammar.tokenizeLine('\\hello\\apc_store()'));

      return expect(tokens[3]).toEqual({value: 'apc_store', scopes: ['source.php', 'meta.function-call.php', 'entity.name.function.php']});
  });
});

  describe('method calls', function() {
    it('tokenizes method calls with no arguments', function() {
      let {tokens} = grammar.tokenizeLine('obj->method()');

      expect(tokens[2]).toEqual({value: 'method', scopes: ['source.php', 'meta.method-call.php', 'entity.name.function.php']});
      expect(tokens[3]).toEqual({value: '(', scopes: ['source.php', 'meta.method-call.php', 'punctuation.definition.arguments.begin.bracket.round.php']});
      expect(tokens[4]).toEqual({value: ')', scopes: ['source.php', 'meta.method-call.php', 'punctuation.definition.arguments.end.bracket.round.php']});

      ({tokens} = grammar.tokenizeLine('obj->method ()'));

      expect(tokens[2]).toEqual({value: 'method', scopes: ['source.php', 'meta.method-call.php', 'entity.name.function.php']});
      expect(tokens[3]).toEqual({value: ' ', scopes: ['source.php', 'meta.method-call.php']});
      expect(tokens[4]).toEqual({value: '(', scopes: ['source.php', 'meta.method-call.php', 'punctuation.definition.arguments.begin.bracket.round.php']});
      return expect(tokens[5]).toEqual({value: ')', scopes: ['source.php', 'meta.method-call.php', 'punctuation.definition.arguments.end.bracket.round.php']});
  });

    return it('tokenizes method calls with arguments', function() {
      let {tokens} = grammar.tokenizeLine("obj->method(5, 'b')");

      expect(tokens[2]).toEqual({value: 'method', scopes: ['source.php', 'meta.method-call.php', 'entity.name.function.php']});
      expect(tokens[3]).toEqual({value: '(', scopes: ['source.php', 'meta.method-call.php', 'punctuation.definition.arguments.begin.bracket.round.php']});
      expect(tokens[4]).toEqual({value: '5', scopes: ['source.php', 'meta.method-call.php', 'constant.numeric.decimal.php']});
      expect(tokens[5]).toEqual({value: ',', scopes: ['source.php', 'meta.method-call.php', 'punctuation.separator.delimiter.php']});
      expect(tokens[6]).toEqual({value: ' ', scopes: ['source.php', 'meta.method-call.php']});
      expect(tokens[7]).toEqual({value: "'", scopes: ['source.php', 'meta.method-call.php', 'string.quoted.single.php', 'punctuation.definition.string.begin.php']});
      expect(tokens[8]).toEqual({value: 'b', scopes: ['source.php', 'meta.method-call.php', 'string.quoted.single.php']});
      expect(tokens[9]).toEqual({value: "'", scopes: ['source.php', 'meta.method-call.php', 'string.quoted.single.php', 'punctuation.definition.string.end.php']});
      expect(tokens[10]).toEqual({value: ')', scopes: ['source.php', 'meta.method-call.php', 'punctuation.definition.arguments.end.bracket.round.php']});

      ({tokens} = grammar.tokenizeLine("obj->method (5, 'b')"));

      expect(tokens[2]).toEqual({value: 'method', scopes: ['source.php', 'meta.method-call.php', 'entity.name.function.php']});
      expect(tokens[3]).toEqual({value: ' ', scopes: ['source.php', 'meta.method-call.php']});
      expect(tokens[4]).toEqual({value: '(', scopes: ['source.php', 'meta.method-call.php', 'punctuation.definition.arguments.begin.bracket.round.php']});
      expect(tokens[5]).toEqual({value: '5', scopes: ['source.php', 'meta.method-call.php', 'constant.numeric.decimal.php']});
      expect(tokens[6]).toEqual({value: ',', scopes: ['source.php', 'meta.method-call.php', 'punctuation.separator.delimiter.php']});
      expect(tokens[7]).toEqual({value: ' ', scopes: ['source.php', 'meta.method-call.php']});
      expect(tokens[8]).toEqual({value: "'", scopes: ['source.php', 'meta.method-call.php', 'string.quoted.single.php', 'punctuation.definition.string.begin.php']});
      expect(tokens[9]).toEqual({value: 'b', scopes: ['source.php', 'meta.method-call.php', 'string.quoted.single.php']});
      expect(tokens[10]).toEqual({value: "'", scopes: ['source.php', 'meta.method-call.php', 'string.quoted.single.php', 'punctuation.definition.string.end.php']});
      return expect(tokens[11]).toEqual({value: ')', scopes: ['source.php', 'meta.method-call.php', 'punctuation.definition.arguments.end.bracket.round.php']});
  });
});

  describe('the scope resolution operator', function() {
    it('tokenizes static method calls with no arguments', function() {
      let {tokens} = grammar.tokenizeLine('obj::method()');

      expect(tokens[0]).toEqual({value: 'obj', scopes: ['source.php', 'support.class.php']});
      expect(tokens[1]).toEqual({value: '::', scopes: ['source.php', 'meta.method-call.static.php', 'keyword.operator.class.php']});
      expect(tokens[2]).toEqual({value: 'method', scopes: ['source.php', 'meta.method-call.static.php', 'entity.name.function.php']});
      expect(tokens[3]).toEqual({value: '(', scopes: ['source.php', 'meta.method-call.static.php', 'punctuation.definition.arguments.begin.bracket.round.php']});
      expect(tokens[4]).toEqual({value: ')', scopes: ['source.php', 'meta.method-call.static.php', 'punctuation.definition.arguments.end.bracket.round.php']});

      ({tokens} = grammar.tokenizeLine('obj :: method ()'));

      expect(tokens[0]).toEqual({value: 'obj', scopes: ['source.php', 'support.class.php']});
      expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php']});
      expect(tokens[2]).toEqual({value: '::', scopes: ['source.php', 'meta.method-call.static.php', 'keyword.operator.class.php']});
      expect(tokens[3]).toEqual({value: ' ', scopes: ['source.php', 'meta.method-call.static.php']});
      expect(tokens[4]).toEqual({value: 'method', scopes: ['source.php', 'meta.method-call.static.php', 'entity.name.function.php']});
      expect(tokens[5]).toEqual({value: ' ', scopes: ['source.php', 'meta.method-call.static.php']});
      expect(tokens[6]).toEqual({value: '(', scopes: ['source.php', 'meta.method-call.static.php', 'punctuation.definition.arguments.begin.bracket.round.php']});
      return expect(tokens[7]).toEqual({value: ')', scopes: ['source.php', 'meta.method-call.static.php', 'punctuation.definition.arguments.end.bracket.round.php']});
  });

    it('tokenizes static method calls with arguments', function() {
      let {tokens} = grammar.tokenizeLine("obj::method(5, 'b')");

      expect(tokens[0]).toEqual({value: 'obj', scopes: ['source.php', 'support.class.php']});
      expect(tokens[1]).toEqual({value: '::', scopes: ['source.php', 'meta.method-call.static.php', 'keyword.operator.class.php']});
      expect(tokens[2]).toEqual({value: 'method', scopes: ['source.php', 'meta.method-call.static.php', 'entity.name.function.php']});
      expect(tokens[3]).toEqual({value: '(', scopes: ['source.php', 'meta.method-call.static.php', 'punctuation.definition.arguments.begin.bracket.round.php']});
      expect(tokens[4]).toEqual({value: '5', scopes: ['source.php', 'meta.method-call.static.php', 'constant.numeric.decimal.php']});
      expect(tokens[5]).toEqual({value: ',', scopes: ['source.php', 'meta.method-call.static.php', 'punctuation.separator.delimiter.php']});
      expect(tokens[6]).toEqual({value: ' ', scopes: ['source.php', 'meta.method-call.static.php']});
      expect(tokens[7]).toEqual({value: "'", scopes: ['source.php', 'meta.method-call.static.php', 'string.quoted.single.php', 'punctuation.definition.string.begin.php']});
      expect(tokens[8]).toEqual({value: 'b', scopes: ['source.php', 'meta.method-call.static.php', 'string.quoted.single.php']});
      expect(tokens[9]).toEqual({value: "'", scopes: ['source.php', 'meta.method-call.static.php', 'string.quoted.single.php', 'punctuation.definition.string.end.php']});
      expect(tokens[10]).toEqual({value: ')', scopes: ['source.php', 'meta.method-call.static.php', 'punctuation.definition.arguments.end.bracket.round.php']});

      ({tokens} = grammar.tokenizeLine("obj :: method (5, 'b')"));

      expect(tokens[0]).toEqual({value: 'obj', scopes: ['source.php', 'support.class.php']});
      expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php']});
      expect(tokens[2]).toEqual({value: '::', scopes: ['source.php', 'meta.method-call.static.php', 'keyword.operator.class.php']});
      expect(tokens[3]).toEqual({value: ' ', scopes: ['source.php', 'meta.method-call.static.php']});
      expect(tokens[4]).toEqual({value: 'method', scopes: ['source.php', 'meta.method-call.static.php', 'entity.name.function.php']});
      expect(tokens[5]).toEqual({value: ' ', scopes: ['source.php', 'meta.method-call.static.php']});
      expect(tokens[6]).toEqual({value: '(', scopes: ['source.php', 'meta.method-call.static.php', 'punctuation.definition.arguments.begin.bracket.round.php']});
      expect(tokens[7]).toEqual({value: '5', scopes: ['source.php', 'meta.method-call.static.php', 'constant.numeric.decimal.php']});
      expect(tokens[8]).toEqual({value: ',', scopes: ['source.php', 'meta.method-call.static.php', 'punctuation.separator.delimiter.php']});
      expect(tokens[9]).toEqual({value: ' ', scopes: ['source.php', 'meta.method-call.static.php']});
      expect(tokens[10]).toEqual({value: "'", scopes: ['source.php', 'meta.method-call.static.php', 'string.quoted.single.php', 'punctuation.definition.string.begin.php']});
      expect(tokens[11]).toEqual({value: 'b', scopes: ['source.php', 'meta.method-call.static.php', 'string.quoted.single.php']});
      expect(tokens[12]).toEqual({value: "'", scopes: ['source.php', 'meta.method-call.static.php', 'string.quoted.single.php', 'punctuation.definition.string.end.php']});
      return expect(tokens[13]).toEqual({value: ')', scopes: ['source.php', 'meta.method-call.static.php', 'punctuation.definition.arguments.end.bracket.round.php']});
  });

    it('tokenizes class variables', function() {
      let {tokens} = grammar.tokenizeLine('obj::$variable');

      expect(tokens[0]).toEqual({value: 'obj', scopes: ['source.php', 'support.class.php']});
      expect(tokens[1]).toEqual({value: '::', scopes: ['source.php', 'keyword.operator.class.php']});
      expect(tokens[2]).toEqual({value: '$', scopes: ['source.php', 'variable.other.class.php', 'punctuation.definition.variable.php']});
      expect(tokens[3]).toEqual({value: 'variable', scopes: ['source.php', 'variable.other.class.php']});

      ({tokens} = grammar.tokenizeLine('obj :: $variable'));

      expect(tokens[0]).toEqual({value: 'obj', scopes: ['source.php', 'support.class.php']});
      expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php']});
      expect(tokens[2]).toEqual({value: '::', scopes: ['source.php', 'keyword.operator.class.php']});
      expect(tokens[3]).toEqual({value: ' ', scopes: ['source.php']});
      expect(tokens[4]).toEqual({value: '$', scopes: ['source.php', 'variable.other.class.php', 'punctuation.definition.variable.php']});
      return expect(tokens[5]).toEqual({value: 'variable', scopes: ['source.php', 'variable.other.class.php']});
  });

    it('tokenizes class constants', function() {
      let {tokens} = grammar.tokenizeLine('obj::constant');

      expect(tokens[0]).toEqual({value: 'obj', scopes: ['source.php', 'support.class.php']});
      expect(tokens[1]).toEqual({value: '::', scopes: ['source.php', 'keyword.operator.class.php']});
      expect(tokens[2]).toEqual({value: 'constant', scopes: ['source.php', 'constant.other.class.php']});

      ({tokens} = grammar.tokenizeLine('obj :: constant'));

      expect(tokens[0]).toEqual({value: 'obj', scopes: ['source.php', 'support.class.php']});
      expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php']});
      expect(tokens[2]).toEqual({value: '::', scopes: ['source.php', 'keyword.operator.class.php']});
      expect(tokens[3]).toEqual({value: ' ', scopes: ['source.php']});
      return expect(tokens[4]).toEqual({value: 'constant', scopes: ['source.php', 'constant.other.class.php']});
  });

    it('tokenizes namespaced classes', function() {
      const {tokens} = grammar.tokenizeLine('\\One\\Two\\Three::$var');

      expect(tokens[0]).toEqual({value: '\\', scopes: ['source.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(tokens[1]).toEqual({value: 'One', scopes: ['source.php', 'support.other.namespace.php']});
      expect(tokens[2]).toEqual({value: '\\', scopes: ['source.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(tokens[3]).toEqual({value: 'Two', scopes: ['source.php', 'support.other.namespace.php']});
      expect(tokens[4]).toEqual({value: '\\', scopes: ['source.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
      expect(tokens[5]).toEqual({value: 'Three', scopes: ['source.php', 'support.class.php']});
      expect(tokens[6]).toEqual({value: '::', scopes: ['source.php', 'keyword.operator.class.php']});
      expect(tokens[7]).toEqual({value: '$', scopes: ['source.php', 'variable.other.class.php', 'punctuation.definition.variable.php']});
      return expect(tokens[8]).toEqual({value: 'var', scopes: ['source.php', 'variable.other.class.php']});
  });

    return it('tokenizes the special "class" keyword', function() {
      let {tokens} = grammar.tokenizeLine('obj::class');

      expect(tokens[0]).toEqual({value: 'obj', scopes: ['source.php', 'support.class.php']});
      expect(tokens[1]).toEqual({value: '::', scopes: ['source.php', 'keyword.operator.class.php']});
      expect(tokens[2]).toEqual({value: 'class', scopes: ['source.php', 'keyword.other.class.php']});

      ({tokens} = grammar.tokenizeLine('obj :: class'));

      expect(tokens[0]).toEqual({value: 'obj', scopes: ['source.php', 'support.class.php']});
      expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php']});
      expect(tokens[2]).toEqual({value: '::', scopes: ['source.php', 'keyword.operator.class.php']});
      expect(tokens[3]).toEqual({value: ' ', scopes: ['source.php']});
      expect(tokens[4]).toEqual({value: 'class', scopes: ['source.php', 'keyword.other.class.php']});

      // Should NOT be tokenized as `keyword.other.class`
      ({tokens} = grammar.tokenizeLine('obj::classic'));

      expect(tokens[0]).toEqual({value: 'obj', scopes: ['source.php', 'support.class.php']});
      expect(tokens[1]).toEqual({value: '::', scopes: ['source.php', 'keyword.operator.class.php']});
      return expect(tokens[2]).toEqual({value: 'classic', scopes: ['source.php', 'constant.other.class.php']});
  });
});

  describe('try/catch', function() {
    it('tokenizes a basic try/catch block', function() {
      let {tokens} = grammar.tokenizeLine('try {} catch(Exception $e) {}');

      expect(tokens[0]).toEqual({value: 'try', scopes: ['source.php', 'keyword.control.exception.php']});
      expect(tokens[2]).toEqual({value: '{', scopes: ['source.php', 'punctuation.definition.begin.bracket.curly.php']});
      expect(tokens[3]).toEqual({value: '}', scopes: ['source.php', 'punctuation.definition.end.bracket.curly.php']});
      expect(tokens[5]).toEqual({value: 'catch', scopes: ['source.php', 'meta.catch.php', 'keyword.control.exception.catch.php']});
      expect(tokens[6]).toEqual({value: '(', scopes: ['source.php', 'meta.catch.php', 'punctuation.definition.parameters.begin.bracket.round.php']});
      expect(tokens[7]).toEqual({value: 'Exception', scopes: ['source.php', 'meta.catch.php', 'support.class.exception.php']});
      expect(tokens[8]).toEqual({value: ' ', scopes: ['source.php', 'meta.catch.php']});
      expect(tokens[9]).toEqual({value: '$', scopes: ['source.php', 'meta.catch.php', 'variable.other.php', 'punctuation.definition.variable.php']});
      expect(tokens[10]).toEqual({value: 'e', scopes: ['source.php', 'meta.catch.php', 'variable.other.php']});
      expect(tokens[11]).toEqual({value: ')', scopes: ['source.php', 'meta.catch.php', 'punctuation.definition.parameters.end.bracket.round.php']});
      expect(tokens[13]).toEqual({value: '{', scopes: ['source.php', 'punctuation.definition.begin.bracket.curly.php']});
      expect(tokens[14]).toEqual({value: '}', scopes: ['source.php', 'punctuation.definition.end.bracket.curly.php']});

      ({tokens} = grammar.tokenizeLine('try {} catch (Exception $e) {}'));

      expect(tokens[0]).toEqual({value: 'try', scopes: ['source.php', 'keyword.control.exception.php']});
      expect(tokens[2]).toEqual({value: '{', scopes: ['source.php', 'punctuation.definition.begin.bracket.curly.php']});
      expect(tokens[3]).toEqual({value: '}', scopes: ['source.php', 'punctuation.definition.end.bracket.curly.php']});
      expect(tokens[5]).toEqual({value: 'catch', scopes: ['source.php', 'meta.catch.php', 'keyword.control.exception.catch.php']});
      expect(tokens[6]).toEqual({value: ' ', scopes: ['source.php', 'meta.catch.php']});
      expect(tokens[7]).toEqual({value: '(', scopes: ['source.php', 'meta.catch.php', 'punctuation.definition.parameters.begin.bracket.round.php']});
      expect(tokens[8]).toEqual({value: 'Exception', scopes: ['source.php', 'meta.catch.php', 'support.class.exception.php']});
      expect(tokens[9]).toEqual({value: ' ', scopes: ['source.php', 'meta.catch.php']});
      expect(tokens[10]).toEqual({value: '$', scopes: ['source.php', 'meta.catch.php', 'variable.other.php', 'punctuation.definition.variable.php']});
      expect(tokens[11]).toEqual({value: 'e', scopes: ['source.php', 'meta.catch.php', 'variable.other.php']});
      expect(tokens[12]).toEqual({value: ')', scopes: ['source.php', 'meta.catch.php', 'punctuation.definition.parameters.end.bracket.round.php']});
      expect(tokens[14]).toEqual({value: '{', scopes: ['source.php', 'punctuation.definition.begin.bracket.curly.php']});
      return expect(tokens[15]).toEqual({value: '}', scopes: ['source.php', 'punctuation.definition.end.bracket.curly.php']});
  });

    return it('tokenizes a catch block containing multiple exceptions', function() {
      const {tokens} = grammar.tokenizeLine('try {} catch(AException | BException | CException $e) {}');

      expect(tokens[5]).toEqual({value: 'catch', scopes: ['source.php', 'meta.catch.php', 'keyword.control.exception.catch.php']});
      expect(tokens[6]).toEqual({value: '(', scopes: ['source.php', 'meta.catch.php', 'punctuation.definition.parameters.begin.bracket.round.php']});
      expect(tokens[7]).toEqual({value: 'AException', scopes: ['source.php', 'meta.catch.php', 'support.class.exception.php']});
      expect(tokens[8]).toEqual({value: ' ', scopes: ['source.php', 'meta.catch.php']});
      expect(tokens[9]).toEqual({value: '|', scopes: ['source.php', 'meta.catch.php', 'punctuation.separator.delimiter.php']});
      expect(tokens[10]).toEqual({value: ' ', scopes: ['source.php', 'meta.catch.php']});
      expect(tokens[11]).toEqual({value: 'BException', scopes: ['source.php', 'meta.catch.php', 'support.class.exception.php']});
      expect(tokens[13]).toEqual({value: '|', scopes: ['source.php', 'meta.catch.php', 'punctuation.separator.delimiter.php']});
      expect(tokens[15]).toEqual({value: 'CException', scopes: ['source.php', 'meta.catch.php', 'support.class.exception.php']});
      expect(tokens[17]).toEqual({value: '$', scopes: ['source.php', 'meta.catch.php', 'variable.other.php', 'punctuation.definition.variable.php']});
      expect(tokens[18]).toEqual({value: 'e', scopes: ['source.php', 'meta.catch.php', 'variable.other.php']});
      expect(tokens[19]).toEqual({value: ')', scopes: ['source.php', 'meta.catch.php', 'punctuation.definition.parameters.end.bracket.round.php']});
      expect(tokens[21]).toEqual({value: '{', scopes: ['source.php', 'punctuation.definition.begin.bracket.curly.php']});
      return expect(tokens[22]).toEqual({value: '}', scopes: ['source.php', 'punctuation.definition.end.bracket.curly.php']});
  });
});

  describe('numbers', function() {
    it('tokenizes hexadecimals', function() {
      let {tokens} = grammar.tokenizeLine('0x1D306');
      expect(tokens[0]).toEqual({value: '0x1D306', scopes: ['source.php', 'constant.numeric.hex.php']});

      ({tokens} = grammar.tokenizeLine('0X1D306'));
      return expect(tokens[0]).toEqual({value: '0X1D306', scopes: ['source.php', 'constant.numeric.hex.php']});
  });

    it('tokenizes binary literals', function() {
      let {tokens} = grammar.tokenizeLine('0b011101110111010001100110');
      expect(tokens[0]).toEqual({value: '0b011101110111010001100110', scopes: ['source.php', 'constant.numeric.binary.php']});

      ({tokens} = grammar.tokenizeLine('0B011101110111010001100110'));
      return expect(tokens[0]).toEqual({value: '0B011101110111010001100110', scopes: ['source.php', 'constant.numeric.binary.php']});
  });

    it('tokenizes octal literals', function() {
      let {tokens} = grammar.tokenizeLine('01411');
      expect(tokens[0]).toEqual({value: '01411', scopes: ['source.php', 'constant.numeric.octal.php']});

      ({tokens} = grammar.tokenizeLine('0010'));
      return expect(tokens[0]).toEqual({value: '0010', scopes: ['source.php', 'constant.numeric.octal.php']});
  });

    return it('tokenizes decimals', function() {
      let {tokens} = grammar.tokenizeLine('1234');
      expect(tokens[0]).toEqual({value: '1234', scopes: ['source.php', 'constant.numeric.decimal.php']});

      ({tokens} = grammar.tokenizeLine('5e-10'));
      expect(tokens[0]).toEqual({value: '5e-10', scopes: ['source.php', 'constant.numeric.decimal.php']});

      ({tokens} = grammar.tokenizeLine('5E+5'));
      expect(tokens[0]).toEqual({value: '5E+5', scopes: ['source.php', 'constant.numeric.decimal.php']});

      ({tokens} = grammar.tokenizeLine('9.'));
      expect(tokens[0]).toEqual({value: '9', scopes: ['source.php', 'constant.numeric.decimal.php']});
      expect(tokens[1]).toEqual({value: '.', scopes: ['source.php', 'constant.numeric.decimal.php', 'punctuation.separator.decimal.period.php']});

      ({tokens} = grammar.tokenizeLine('.9'));
      expect(tokens[0]).toEqual({value: '.', scopes: ['source.php', 'constant.numeric.decimal.php', 'punctuation.separator.decimal.period.php']});
      expect(tokens[1]).toEqual({value: '9', scopes: ['source.php', 'constant.numeric.decimal.php']});

      ({tokens} = grammar.tokenizeLine('9.9'));
      expect(tokens[0]).toEqual({value: '9', scopes: ['source.php', 'constant.numeric.decimal.php']});
      expect(tokens[1]).toEqual({value: '.', scopes: ['source.php', 'constant.numeric.decimal.php', 'punctuation.separator.decimal.period.php']});
      expect(tokens[2]).toEqual({value: '9', scopes: ['source.php', 'constant.numeric.decimal.php']});

      ({tokens} = grammar.tokenizeLine('.1e-23'));
      expect(tokens[0]).toEqual({value: '.', scopes: ['source.php', 'constant.numeric.decimal.php', 'punctuation.separator.decimal.period.php']});
      expect(tokens[1]).toEqual({value: '1e-23', scopes: ['source.php', 'constant.numeric.decimal.php']});

      ({tokens} = grammar.tokenizeLine('1.E3'));
      expect(tokens[0]).toEqual({value: '1', scopes: ['source.php', 'constant.numeric.decimal.php']});
      expect(tokens[1]).toEqual({value: '.', scopes: ['source.php', 'constant.numeric.decimal.php', 'punctuation.separator.decimal.period.php']});
      return expect(tokens[2]).toEqual({value: 'E3', scopes: ['source.php', 'constant.numeric.decimal.php']});
  });
});

  it('should tokenize switch statements correctly', function() {
    const lines = grammar.tokenizeLines(`\
switch($something)
{
  case 'string':
    return 1;
  case 1:
    break;
  default:
    continue;
}\
`
    );

    expect(lines[0][0]).toEqual({value: 'switch', scopes: ['source.php', 'meta.switch-statement.php', 'keyword.control.switch.php']});
    expect(lines[0][1]).toEqual({value: '(', scopes: ['source.php', 'meta.switch-statement.php', 'punctuation.definition.switch-expression.begin.bracket.round.php']});
    expect(lines[0][2]).toEqual({value: '$', scopes: ['source.php', 'meta.switch-statement.php', 'variable.other.php', 'punctuation.definition.variable.php']});
    expect(lines[0][3]).toEqual({value: 'something', scopes: ['source.php', 'meta.switch-statement.php', 'variable.other.php']});
    expect(lines[0][4]).toEqual({value: ')', scopes: ['source.php', 'meta.switch-statement.php', 'punctuation.definition.switch-expression.end.bracket.round.php']});
    expect(lines[1][0]).toEqual({value: '{', scopes: ['source.php', 'meta.switch-statement.php', 'punctuation.definition.section.switch-block.begin.bracket.curly.php']});
    expect(lines[2][1]).toEqual({value: 'case', scopes: ['source.php', 'meta.switch-statement.php', 'keyword.control.case.php']});
    expect(lines[2][2]).toEqual({value: ' ', scopes: ['source.php', 'meta.switch-statement.php']});
    expect(lines[2][3]).toEqual({value: "'", scopes: ['source.php', 'meta.switch-statement.php', 'string.quoted.single.php', 'punctuation.definition.string.begin.php']});
    expect(lines[2][6]).toEqual({value: ':', scopes: ['source.php', 'meta.switch-statement.php', 'punctuation.terminator.statement.php']});
    expect(lines[3][1]).toEqual({value: 'return', scopes: ['source.php', 'meta.switch-statement.php', 'keyword.control.return.php']});
    expect(lines[4][1]).toEqual({value: 'case', scopes: ['source.php', 'meta.switch-statement.php', 'keyword.control.case.php']});
    expect(lines[4][2]).toEqual({value: ' ', scopes: ['source.php', 'meta.switch-statement.php']});
    expect(lines[4][3]).toEqual({value: '1', scopes: ['source.php', 'meta.switch-statement.php', 'constant.numeric.decimal.php']});
    expect(lines[4][4]).toEqual({value: ':', scopes: ['source.php', 'meta.switch-statement.php', 'punctuation.terminator.statement.php']});
    expect(lines[5][1]).toEqual({value: 'break', scopes: ['source.php', 'meta.switch-statement.php', 'keyword.control.break.php']});
    expect(lines[6][1]).toEqual({value: 'default', scopes: ['source.php', 'meta.switch-statement.php', 'keyword.control.default.php']});
    expect(lines[6][2]).toEqual({value: ':', scopes: ['source.php', 'meta.switch-statement.php', 'punctuation.terminator.statement.php']});
    expect(lines[7][1]).toEqual({value: 'continue', scopes: ['source.php', 'meta.switch-statement.php', 'keyword.control.continue.php']});
    return expect(lines[8][0]).toEqual({value: '}', scopes: ['source.php', 'meta.switch-statement.php', 'punctuation.definition.section.switch-block.end.bracket.curly.php']});
});

  it('should tokenize storage types correctly', function() {
    let {tokens} = grammar.tokenizeLine('(int)');

    expect(tokens[0]).toEqual({value: '(', scopes: ['source.php', 'punctuation.definition.storage-type.begin.bracket.round.php']});
    expect(tokens[1]).toEqual({value: 'int', scopes: ['source.php', 'storage.type.php']});
    expect(tokens[2]).toEqual({value: ')', scopes: ['source.php', 'punctuation.definition.storage-type.end.bracket.round.php']});

    ({tokens} = grammar.tokenizeLine('( int )'));

    expect(tokens[0]).toEqual({value: '(', scopes: ['source.php', 'punctuation.definition.storage-type.begin.bracket.round.php']});
    expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php']});
    expect(tokens[2]).toEqual({value: 'int', scopes: ['source.php', 'storage.type.php']});
    expect(tokens[3]).toEqual({value: ' ', scopes: ['source.php']});
    return expect(tokens[4]).toEqual({value: ')', scopes: ['source.php', 'punctuation.definition.storage-type.end.bracket.round.php']});
});

  describe('PHPDoc', function() {
    it('should tokenize @api tag correctly', function() {
      const lines = grammar.tokenizeLines(`\
/**
*@api
*/\
`
      );

      expect(lines[0][0]).toEqual({value: '/**', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'punctuation.definition.comment.php']});
      expect(lines[1][0]).toEqual({value: '*', scopes: ['source.php', 'comment.block.documentation.phpdoc.php']});
      expect(lines[1][1]).toEqual({value: '@api', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'keyword.other.phpdoc.php']});
      return expect(lines[2][0]).toEqual({value: '*/', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'punctuation.definition.comment.php']});
  });

    it('should tokenize @method tag correctly', function() {
      const lines = grammar.tokenizeLines(`\
/**
*@method
*/\
`
      );

      expect(lines[0][0]).toEqual({value: '/**', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'punctuation.definition.comment.php']});
      expect(lines[1][0]).toEqual({value: '*', scopes: ['source.php', 'comment.block.documentation.phpdoc.php']});
      expect(lines[1][1]).toEqual({value: '@method', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'keyword.other.phpdoc.php']});
      return expect(lines[2][0]).toEqual({value: '*/', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'punctuation.definition.comment.php']});
  });

    it('should tokenize @property tag correctly', function() {
      const lines = grammar.tokenizeLines(`\
/**
*@property
*/\
`
      );

      expect(lines[0][0]).toEqual({value: '/**', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'punctuation.definition.comment.php']});
      expect(lines[1][0]).toEqual({value: '*', scopes: ['source.php', 'comment.block.documentation.phpdoc.php']});
      expect(lines[1][1]).toEqual({value: '@property', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'keyword.other.phpdoc.php']});
      return expect(lines[2][0]).toEqual({value: '*/', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'punctuation.definition.comment.php']});
  });

    it('should tokenize @property-read tag correctly', function() {
      const lines = grammar.tokenizeLines(`\
/**
*@property-read
*/\
`
      );

      expect(lines[0][0]).toEqual({value: '/**', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'punctuation.definition.comment.php']});
      expect(lines[1][0]).toEqual({value: '*', scopes: ['source.php', 'comment.block.documentation.phpdoc.php']});
      expect(lines[1][1]).toEqual({value: '@property-read', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'keyword.other.phpdoc.php']});
      return expect(lines[2][0]).toEqual({value: '*/', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'punctuation.definition.comment.php']});
  });

    it('should tokenize @property-write tag correctly', function() {
      const lines = grammar.tokenizeLines(`\
/**
*@property-write
*/\
`
      );

      expect(lines[0][0]).toEqual({value: '/**', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'punctuation.definition.comment.php']});
      expect(lines[1][0]).toEqual({value: '*', scopes: ['source.php', 'comment.block.documentation.phpdoc.php']});
      expect(lines[1][1]).toEqual({value: '@property-write', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'keyword.other.phpdoc.php']});
      return expect(lines[2][0]).toEqual({value: '*/', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'punctuation.definition.comment.php']});
  });

    it('should tokenize @source tag correctly', function() {
      const lines = grammar.tokenizeLines(`\
/**
*@source
*/\
`
      );

      expect(lines[0][0]).toEqual({value: '/**', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'punctuation.definition.comment.php']});
      expect(lines[1][0]).toEqual({value: '*', scopes: ['source.php', 'comment.block.documentation.phpdoc.php']});
      expect(lines[1][1]).toEqual({value: '@source', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'keyword.other.phpdoc.php']});
      return expect(lines[2][0]).toEqual({value: '*/', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'punctuation.definition.comment.php']});
  });

    it('should tokenize an inline phpdoc correctly', function() {
      const {tokens} = grammar.tokenizeLine('/** @var */');

      expect(tokens[0]).toEqual({value: '/**', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'punctuation.definition.comment.php']});
      expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php', 'comment.block.documentation.phpdoc.php']});
      expect(tokens[2]).toEqual({value: '@var', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'keyword.other.phpdoc.php']});
      expect(tokens[3]).toEqual({value: ' ', scopes: ['source.php', 'comment.block.documentation.phpdoc.php']});
      return expect(tokens[4]).toEqual({value: '*/', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'punctuation.definition.comment.php']});
  });

    describe('types', function() {
      it('should tokenize a single type', function() {
        let lines = grammar.tokenizeLines(`\
/**
*@param int description\
`
        );

        expect(lines[1][1]).toEqual({value: '@param', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'keyword.other.phpdoc.php']});
        expect(lines[1][2]).toEqual({value: ' ', scopes: ['source.php', 'comment.block.documentation.phpdoc.php']});
        expect(lines[1][3]).toEqual({value: 'int', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'keyword.other.type.php']});
        expect(lines[1][4]).toEqual({value: ' description', scopes: ['source.php', 'comment.block.documentation.phpdoc.php']});

        lines = grammar.tokenizeLines(`\
/**
*@param Test description\
`
        );

        expect(lines[1][1]).toEqual({value: '@param', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'keyword.other.phpdoc.php']});
        expect(lines[1][2]).toEqual({value: ' ', scopes: ['source.php', 'comment.block.documentation.phpdoc.php']});
        expect(lines[1][3]).toEqual({value: 'Test', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'support.class.php']});
        return expect(lines[1][4]).toEqual({value: ' description', scopes: ['source.php', 'comment.block.documentation.phpdoc.php']});
    });

      it('should tokenize a single namespaced type', function() {
        const lines = grammar.tokenizeLines(`\
/**
*@param \\Test\\Type description\
`
        );

        expect(lines[1][1]).toEqual({value: '@param', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'keyword.other.phpdoc.php']});
        expect(lines[1][2]).toEqual({value: ' ', scopes: ['source.php', 'comment.block.documentation.phpdoc.php']});
        expect(lines[1][3]).toEqual({value: '\\', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
        expect(lines[1][4]).toEqual({value: 'Test', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'support.other.namespace.php']});
        expect(lines[1][5]).toEqual({value: '\\', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
        expect(lines[1][6]).toEqual({value: 'Type', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'support.class.php']});
        return expect(lines[1][7]).toEqual({value: ' description', scopes: ['source.php', 'comment.block.documentation.phpdoc.php']});
    });

      it('should tokenize multiple types', function() {
        const lines = grammar.tokenizeLines(`\
/**
*@param int|Class description\
`
        );

        expect(lines[1][1]).toEqual({value: '@param', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'keyword.other.phpdoc.php']});
        expect(lines[1][2]).toEqual({value: ' ', scopes: ['source.php', 'comment.block.documentation.phpdoc.php']});
        expect(lines[1][3]).toEqual({value: 'int', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'keyword.other.type.php']});
        expect(lines[1][4]).toEqual({value: '|', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'punctuation.separator.delimiter.php']});
        expect(lines[1][5]).toEqual({value: 'Class', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'support.class.php']});
        return expect(lines[1][6]).toEqual({value: ' description', scopes: ['source.php', 'comment.block.documentation.phpdoc.php']});
    });

      it('should tokenize multiple namespaced types', function() {
        const lines = grammar.tokenizeLines(`\
/**
*@param Test\\One|\\Another\\Root description\
`
        );

        expect(lines[1][1]).toEqual({value: '@param', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'keyword.other.phpdoc.php']});
        expect(lines[1][2]).toEqual({value: ' ', scopes: ['source.php', 'comment.block.documentation.phpdoc.php']});
        expect(lines[1][3]).toEqual({value: 'Test', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'support.other.namespace.php']});
        expect(lines[1][4]).toEqual({value: '\\', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
        expect(lines[1][5]).toEqual({value: 'One', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'support.class.php']});
        expect(lines[1][6]).toEqual({value: '|', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'punctuation.separator.delimiter.php']});
        expect(lines[1][7]).toEqual({value: '\\', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
        expect(lines[1][8]).toEqual({value: 'Another', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'support.other.namespace.php']});
        expect(lines[1][9]).toEqual({value: '\\', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
        expect(lines[1][10]).toEqual({value: 'Root', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'support.class.php']});
        return expect(lines[1][11]).toEqual({value: ' description', scopes: ['source.php', 'comment.block.documentation.phpdoc.php']});
    });

      it('should tokenize a single array type', function() {
        let lines = grammar.tokenizeLines(`\
/**
*@param int[] description\
`
        );

        expect(lines[1][1]).toEqual({value: '@param', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'keyword.other.phpdoc.php']});
        expect(lines[1][2]).toEqual({value: ' ', scopes: ['source.php', 'comment.block.documentation.phpdoc.php']});
        expect(lines[1][3]).toEqual({value: 'int', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'keyword.other.type.php']});
        expect(lines[1][4]).toEqual({value: '[]', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'keyword.other.array.phpdoc.php']});
        expect(lines[1][5]).toEqual({value: ' description', scopes: ['source.php', 'comment.block.documentation.phpdoc.php']});

        lines = grammar.tokenizeLines(`\
/**
*@param Test[] description\
`
        );

        expect(lines[1][1]).toEqual({value: '@param', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'keyword.other.phpdoc.php']});
        expect(lines[1][2]).toEqual({value: ' ', scopes: ['source.php', 'comment.block.documentation.phpdoc.php']});
        expect(lines[1][3]).toEqual({value: 'Test', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'support.class.php']});
        expect(lines[1][4]).toEqual({value: '[]', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'keyword.other.array.phpdoc.php']});
        return expect(lines[1][5]).toEqual({value: ' description', scopes: ['source.php', 'comment.block.documentation.phpdoc.php']});
    });

      it('should tokenize a single namespaced array type', function() {
        const lines = grammar.tokenizeLines(`\
/**
*@param Test\\Type[] description\
`
        );

        expect(lines[1][1]).toEqual({value: '@param', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'keyword.other.phpdoc.php']});
        expect(lines[1][2]).toEqual({value: ' ', scopes: ['source.php', 'comment.block.documentation.phpdoc.php']});
        expect(lines[1][3]).toEqual({value: 'Test', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'support.other.namespace.php']});
        expect(lines[1][4]).toEqual({value: '\\', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
        expect(lines[1][5]).toEqual({value: 'Type', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'support.class.php']});
        expect(lines[1][6]).toEqual({value: '[]', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'keyword.other.array.phpdoc.php']});
        return expect(lines[1][7]).toEqual({value: ' description', scopes: ['source.php', 'comment.block.documentation.phpdoc.php']});
    });

      it('should tokenize multiple array types', function() {
        let lines = grammar.tokenizeLines(`\
/**
*@param (int|Class)[] description\
`
        );

        expect(lines[1][1]).toEqual({value: '@param', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'keyword.other.phpdoc.php']});
        expect(lines[1][2]).toEqual({value: ' ', scopes: ['source.php', 'comment.block.documentation.phpdoc.php']});
        expect(lines[1][3]).toEqual({value: '(', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'punctuation.definition.type.begin.bracket.round.phpdoc.php']});
        expect(lines[1][4]).toEqual({value: 'int', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'keyword.other.type.php']});
        expect(lines[1][5]).toEqual({value: '|', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'punctuation.separator.delimiter.php']});
        expect(lines[1][6]).toEqual({value: 'Class', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'support.class.php']});
        expect(lines[1][7]).toEqual({value: ')', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'punctuation.definition.type.end.bracket.round.phpdoc.php']});
        expect(lines[1][8]).toEqual({value: '[]', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'keyword.other.array.phpdoc.php']});

        lines = grammar.tokenizeLines(`\
/**
*@param ((Test|int)[]|Test\\Type[]|string[]|resource)[] description\
`
        );

        expect(lines[1][1]).toEqual({value: '@param', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'keyword.other.phpdoc.php']});
        expect(lines[1][2]).toEqual({value: ' ', scopes: ['source.php', 'comment.block.documentation.phpdoc.php']});
        expect(lines[1][3]).toEqual({value: '(', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'punctuation.definition.type.begin.bracket.round.phpdoc.php']});
        expect(lines[1][4]).toEqual({value: '(', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'punctuation.definition.type.begin.bracket.round.phpdoc.php']});
        expect(lines[1][5]).toEqual({value: 'Test', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'support.class.php']});
        expect(lines[1][6]).toEqual({value: '|', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'punctuation.separator.delimiter.php']});
        expect(lines[1][7]).toEqual({value: 'int', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'keyword.other.type.php']});
        expect(lines[1][8]).toEqual({value: ')', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'punctuation.definition.type.end.bracket.round.phpdoc.php']});
        expect(lines[1][9]).toEqual({value: '[]', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'keyword.other.array.phpdoc.php']});
        expect(lines[1][10]).toEqual({value: '|', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'punctuation.separator.delimiter.php']});
        expect(lines[1][11]).toEqual({value: 'Test', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'support.other.namespace.php']});
        expect(lines[1][12]).toEqual({value: '\\', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
        expect(lines[1][13]).toEqual({value: 'Type', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'support.class.php']});
        expect(lines[1][14]).toEqual({value: '[]', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'keyword.other.array.phpdoc.php']});
        expect(lines[1][15]).toEqual({value: '|', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'punctuation.separator.delimiter.php']});
        expect(lines[1][16]).toEqual({value: 'string', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'keyword.other.type.php']});
        expect(lines[1][17]).toEqual({value: '[]', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'keyword.other.array.phpdoc.php']});
        expect(lines[1][18]).toEqual({value: '|', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'punctuation.separator.delimiter.php']});
        expect(lines[1][19]).toEqual({value: 'resource', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'keyword.other.type.php']});
        expect(lines[1][20]).toEqual({value: ')', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'punctuation.definition.type.end.bracket.round.phpdoc.php']});
        expect(lines[1][21]).toEqual({value: '[]', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'meta.other.type.phpdoc.php', 'keyword.other.array.phpdoc.php']});
        return expect(lines[1][22]).toEqual({value: ' description', scopes: ['source.php', 'comment.block.documentation.phpdoc.php']});
    });

      return it('should end the PHPDoc at the ending comment even if there are malformed types', function() {
        const {tokens} = grammar.tokenizeLine('/** @var array(string) */');

        return expect(tokens[8]).toEqual({value: '*/', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'punctuation.definition.comment.php']});
    });
  });

    it('should not tokenize /*** as phpdoc', function() {
      const {tokens} = grammar.tokenizeLine('/*** @var */');

      return expect(tokens[0].scopes).not.toContain('comment.block.documentation.phpdoc.php');
    });

    return it('should tokenize malformed phpDocumentor DocBlock line that contains closing tag correctly', function() {
      const lines = grammar.tokenizeLines(`\
/**
invalid*/$a=1;\
`
      );

      expect(lines[0][0]).toEqual({value: '/**', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'punctuation.definition.comment.php']});
      expect(lines[1][0]).toEqual({value: 'invalid', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'invalid.illegal.missing-asterisk.phpdoc.php']});
      expect(lines[1][1]).toEqual({value: '*/', scopes: ['source.php', 'comment.block.documentation.phpdoc.php', 'punctuation.definition.comment.php']});
      return expect(lines[1][2]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
  });
});

  describe('string escape sequences', function() {
    it('tokenizes escaped octal sequences', function() {
      const {tokens} = grammar.tokenizeLine('"test \\007 test";');

      expect(tokens[0]).toEqual({value: '"', scopes: ['source.php', 'string.quoted.double.php', 'punctuation.definition.string.begin.php']});
      expect(tokens[1]).toEqual({value: 'test ', scopes: ['source.php', 'string.quoted.double.php']});
      expect(tokens[2]).toEqual({value: '\\007', scopes: ['source.php', 'string.quoted.double.php', 'constant.character.escape.octal.php']});
      expect(tokens[3]).toEqual({value: ' test', scopes: ['source.php', 'string.quoted.double.php']});
      expect(tokens[4]).toEqual({value: '"', scopes: ['source.php', 'string.quoted.double.php', 'punctuation.definition.string.end.php']});
      return expect(tokens[5]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
  });

    it('tokenizes escaped hex sequences', function() {
      const {tokens} = grammar.tokenizeLine('"test \\x0f test";');

      expect(tokens[0]).toEqual({value: '"', scopes: ['source.php', 'string.quoted.double.php', 'punctuation.definition.string.begin.php']});
      expect(tokens[1]).toEqual({value: 'test ', scopes: ['source.php', 'string.quoted.double.php']});
      expect(tokens[2]).toEqual({value: '\\x0f', scopes: ['source.php', 'string.quoted.double.php', 'constant.character.escape.hex.php']});
      expect(tokens[3]).toEqual({value: ' test', scopes: ['source.php', 'string.quoted.double.php']});
      expect(tokens[4]).toEqual({value: '"', scopes: ['source.php', 'string.quoted.double.php', 'punctuation.definition.string.end.php']});
      return expect(tokens[5]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
  });

    it('tokenizes escaped unicode sequences', function() {
      const {tokens} = grammar.tokenizeLine('"test \\u{00A0} test";');

      expect(tokens[0]).toEqual({value: '"', scopes: ['source.php', 'string.quoted.double.php', 'punctuation.definition.string.begin.php']});
      expect(tokens[1]).toEqual({value: 'test ', scopes: ['source.php', 'string.quoted.double.php']});
      expect(tokens[2]).toEqual({value: '\\u{00A0}', scopes: ['source.php', 'string.quoted.double.php', 'constant.character.escape.unicode.php']});
      expect(tokens[3]).toEqual({value: ' test', scopes: ['source.php', 'string.quoted.double.php']});
      expect(tokens[4]).toEqual({value: '"', scopes: ['source.php', 'string.quoted.double.php', 'punctuation.definition.string.end.php']});
      return expect(tokens[5]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
  });

    return ['n', 'r', 't', 'v', 'e', 'f', '$', '"', '\\'].map((escapeCharacter) =>
      it(`tokenizes ${escapeCharacter} as an escape character`, function() {
        const {tokens} = grammar.tokenizeLine(`\"test \\${escapeCharacter} test\";`);

        expect(tokens[0]).toEqual({value: '"', scopes: ['source.php', 'string.quoted.double.php', 'punctuation.definition.string.begin.php']});
        expect(tokens[1]).toEqual({value: 'test ', scopes: ['source.php', 'string.quoted.double.php']});
        expect(tokens[2]).toEqual({value: `\\${escapeCharacter}`, scopes: ['source.php', 'string.quoted.double.php', 'constant.character.escape.php']});
        expect(tokens[3]).toEqual({value: ' test', scopes: ['source.php', 'string.quoted.double.php']});
        expect(tokens[4]).toEqual({value: '"', scopes: ['source.php', 'string.quoted.double.php', 'punctuation.definition.string.end.php']});
        return expect(tokens[5]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
    }));
});

  it('should tokenize multiple inherited interfaces correctly', function() {
    const {tokens} = grammar.tokenizeLine('interface Superman extends Bird, Plane {}');

    expect(tokens[0]).toEqual({value: 'interface', scopes: ['source.php', 'meta.interface.php', 'storage.type.interface.php']});
    expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php', 'meta.interface.php']});
    expect(tokens[2]).toEqual({value: 'Superman', scopes: ['source.php', 'meta.interface.php', 'entity.name.type.interface.php']});
    expect(tokens[3]).toEqual({value: ' ', scopes: ['source.php', 'meta.interface.php']});
    expect(tokens[4]).toEqual({value: 'extends', scopes: ['source.php', 'meta.interface.php', 'storage.modifier.extends.php']});
    expect(tokens[5]).toEqual({value: ' ', scopes: ['source.php', 'meta.interface.php']});
    expect(tokens[6]).toEqual({value: 'Bird', scopes: ['source.php', 'meta.interface.php', 'entity.other.inherited-class.php']});
    expect(tokens[7]).toEqual({value: ',', scopes: ['source.php', 'meta.interface.php', 'punctuation.separator.classes.php']});
    expect(tokens[8]).toEqual({value: ' ', scopes: ['source.php', 'meta.interface.php']});
    expect(tokens[9]).toEqual({value: 'Plane', scopes: ['source.php', 'meta.interface.php', 'entity.other.inherited-class.php']});
    expect(tokens[10]).toEqual({value: ' ', scopes: ['source.php', 'meta.interface.php']});
    expect(tokens[11]).toEqual({value: '{', scopes: ['source.php', 'punctuation.definition.begin.bracket.curly.php']});
    return expect(tokens[12]).toEqual({value: '}', scopes: ['source.php', 'punctuation.definition.end.bracket.curly.php']});
});

  it('should tokenize trait correctly', function() {
    const {tokens} = grammar.tokenizeLine('trait Test {}');

    expect(tokens[0]).toEqual({value: 'trait', scopes: ['source.php', 'meta.trait.php', 'storage.type.trait.php']});
    expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php', 'meta.trait.php']});
    expect(tokens[2]).toEqual({value: 'Test', scopes: ['source.php', 'meta.trait.php', 'entity.name.type.trait.php']});
    expect(tokens[3]).toEqual({value: ' ', scopes: ['source.php', 'meta.trait.php']});
    expect(tokens[4]).toEqual({value: '{', scopes: ['source.php', 'punctuation.definition.begin.bracket.curly.php']});
    return expect(tokens[5]).toEqual({value: '}', scopes: ['source.php', 'punctuation.definition.end.bracket.curly.php']});
});

  it('should tokenize use const correctly', function() {
    const {tokens} = grammar.tokenizeLine('use const Test\\Test\\CONSTANT;');

    expect(tokens[0]).toEqual({value: 'use', scopes: ['source.php', 'meta.use.php', 'keyword.other.use.php']});
    expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php', 'meta.use.php']});
    expect(tokens[2]).toEqual({value: 'const', scopes: ['source.php', 'meta.use.php', 'storage.type.const.php']});
    expect(tokens[3]).toEqual({value: ' ', scopes: ['source.php', 'meta.use.php']});
    expect(tokens[4]).toEqual({value: 'Test', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php']});
    expect(tokens[5]).toEqual({value: '\\', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
    expect(tokens[6]).toEqual({value: 'Test', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php']});
    expect(tokens[7]).toEqual({value: '\\', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
    expect(tokens[8]).toEqual({value: 'CONSTANT', scopes: ['source.php', 'meta.use.php', 'support.class.php']});
    return expect(tokens[9]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
});

  it('should tokenize use function correctly', function() {
    const {tokens} = grammar.tokenizeLine('use function A\\B\\fun as func;');

    expect(tokens[0]).toEqual({value: 'use', scopes: ['source.php', 'meta.use.php', 'keyword.other.use.php']});
    expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php', 'meta.use.php']});
    expect(tokens[2]).toEqual({value: 'function', scopes: ['source.php', 'meta.use.php', 'storage.type.function.php']});
    expect(tokens[3]).toEqual({value: ' ', scopes: ['source.php', 'meta.use.php']});
    expect(tokens[4]).toEqual({value: 'A', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php']});
    expect(tokens[5]).toEqual({value: '\\', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
    expect(tokens[6]).toEqual({value: 'B', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php']});
    expect(tokens[7]).toEqual({value: '\\', scopes: ['source.php', 'meta.use.php', 'support.other.namespace.php', 'punctuation.separator.inheritance.php']});
    expect(tokens[8]).toEqual({value: 'fun', scopes: ['source.php', 'meta.use.php', 'support.class.php']});
    expect(tokens[9]).toEqual({value: ' ', scopes: ['source.php', 'meta.use.php']});
    expect(tokens[10]).toEqual({value: 'as', scopes: ['source.php', 'meta.use.php', 'keyword.other.use-as.php']});
    expect(tokens[11]).toEqual({value: ' ', scopes: ['source.php', 'meta.use.php']});
    expect(tokens[12]).toEqual({value: 'func', scopes: ['source.php', 'meta.use.php', 'entity.other.alias.php']});
    return expect(tokens[13]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
});

  it('tokenizes yield', function() {
    const {tokens} = grammar.tokenizeLine('function test() { yield $a; }');

    expect(tokens[0]).toEqual({value: 'function', scopes: ['source.php', 'meta.function.php', 'storage.type.function.php']});
    expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php', 'meta.function.php']});
    expect(tokens[2]).toEqual({value: 'test', scopes: ['source.php', 'meta.function.php', 'entity.name.function.php']});
    expect(tokens[3]).toEqual({value: '(', scopes: ['source.php', 'meta.function.php', 'punctuation.definition.parameters.begin.bracket.round.php']});
    expect(tokens[4]).toEqual({value: ')', scopes: ['source.php', 'meta.function.php', 'punctuation.definition.parameters.end.bracket.round.php']});
    expect(tokens[5]).toEqual({value: ' ', scopes: ['source.php']});
    expect(tokens[6]).toEqual({value: '{', scopes: ['source.php', 'punctuation.definition.begin.bracket.curly.php']});
    expect(tokens[7]).toEqual({value: ' ', scopes: ['source.php']});
    expect(tokens[8]).toEqual({value: 'yield', scopes: ['source.php', 'keyword.control.yield.php']});
    expect(tokens[9]).toEqual({value: ' ', scopes: ['source.php']});
    expect(tokens[10]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
    expect(tokens[11]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
    expect(tokens[12]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
    expect(tokens[13]).toEqual({value: ' ', scopes: ['source.php']});
    return expect(tokens[14]).toEqual({value: '}', scopes: ['source.php', 'punctuation.definition.end.bracket.curly.php']});
});

  it('tokenizes `yield from`', function() {
    let {tokens} = grammar.tokenizeLine('function test() { yield from $a; }');

    expect(tokens[8]).toEqual({value: 'yield from', scopes: ['source.php', 'keyword.control.yield-from.php']});
    expect(tokens[9]).toEqual({value: ' ', scopes: ['source.php']});
    expect(tokens[10]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
    expect(tokens[11]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
    expect(tokens[12]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});

    ({tokens} = grammar.tokenizeLine('function test() { yield      from $a; }'));

    expect(tokens[8]).toEqual({value: 'yield      from', scopes: ['source.php', 'keyword.control.yield-from.php']});
    expect(tokens[9]).toEqual({value: ' ', scopes: ['source.php']});
    expect(tokens[10]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
    expect(tokens[11]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
    return expect(tokens[12]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
});

  describe('embedded SQL', function() {
    const delimsByScope = {
      'string.quoted.double.sql.php': '"',
      'string.quoted.single.sql.php': "'"
    };

    beforeEach(function() {
      waitsForPromise(() => atom.packages.activatePackage('language-sql'));

      // Use the HTML wrapper as that's where the SQL injections are
      return runs(() => grammar = atom.grammars.grammarForScopeName('text.html.php'));
    });

    it('tokenizes SQL statements in strings', () => (() => {
      const result = [];
      for (let scope in delimsByScope) {
        const delim = delimsByScope[scope];
        const {tokens} = grammar.tokenizeLine(`<?php ${delim}SELECT something${delim}`);

        expect(tokens[2]).toEqual({value: delim, scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', scope, 'punctuation.definition.string.begin.php']});
        expect(tokens[3]).toEqual({value: 'SELECT', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', scope, 'source.sql.embedded.php', 'keyword.other.DML.sql']});
        expect(tokens[4]).toEqual({value: ' something', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', scope, 'source.sql.embedded.php']});
        result.push(expect(tokens[5]).toEqual({value: delim, scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', scope, 'punctuation.definition.string.end.php']}));
      }
      return result;
    })());

    it('stops line comments when a quote is reached', () => (() => {
      const result = [];
      for (let scope in delimsByScope) {
        const delim = delimsByScope[scope];
        const lines = grammar.tokenizeLines(`\
<?php
${delim}SELECT something
-- uh oh a comment SELECT${delim}\
`
        );
        expect(lines[2][0]).toEqual({value: '--', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', scope, 'source.sql.embedded.php', 'comment.line.double-dash.sql', 'punctuation.definition.comment.sql']});
        expect(lines[2][1]).toEqual({value: ' uh oh a comment SELECT', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', scope, 'source.sql.embedded.php', 'comment.line.double-dash.sql']});
        result.push(expect(lines[2][2]).toEqual({value: delim, scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', scope, 'punctuation.definition.string.end.php']}));
      }
      return result;
    })());

    it('matches escape sequences in parentheses', function() {
      let {tokens} = grammar.tokenizeLine("<?php 'SELECT CONCAT(\\'\"\\', TRIM(cr.code)) as code'");

      expect(tokens[2]).toEqual({value: "'", scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.single.sql.php', 'punctuation.definition.string.begin.php']});
      expect(tokens[5]).toEqual({value: '(', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.single.sql.php', 'source.sql.embedded.php', 'punctuation.definition.section.bracket.round.begin.sql']});
      expect(tokens[6]).toEqual({value: "\\'", scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.single.sql.php', 'source.sql.embedded.php', 'constant.character.escape.php']});
      expect(tokens[7]).toEqual({value: '"', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.single.sql.php', 'source.sql.embedded.php', 'string.quoted.double.unclosed.sql']});
      expect(tokens[8]).toEqual({value: "\\'", scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.single.sql.php', 'source.sql.embedded.php', 'constant.character.escape.php']});
      expect(tokens[9]).toEqual({value: ',', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.single.sql.php', 'source.sql.embedded.php', 'punctuation.separator.comma.sql']});
      expect(tokens[10]).toEqual({value: ' ', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.single.sql.php', 'source.sql.embedded.php']});
      expect(tokens[11]).toEqual({value: 'TRIM', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.single.sql.php', 'source.sql.embedded.php', 'support.function.string.sql']});
      expect(tokens[17]).toEqual({value: ')', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.single.sql.php', 'source.sql.embedded.php', 'punctuation.definition.section.bracket.round.end.sql']});
      expect(tokens[19]).toEqual({value: 'as', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.single.sql.php', 'source.sql.embedded.php', 'keyword.other.alias.sql']});
      expect(tokens[21]).toEqual({value: "'", scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.single.sql.php', 'punctuation.definition.string.end.php']});

      ({tokens} = grammar.tokenizeLine('<?php "SELECT CONCAT(\\"\'\\", TRIM(cr.code)) as code"'));

      expect(tokens[2]).toEqual({value: '"', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'punctuation.definition.string.begin.php']});
      expect(tokens[5]).toEqual({value: '(', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'source.sql.embedded.php', 'punctuation.definition.section.bracket.round.begin.sql']});
      expect(tokens[6]).toEqual({value: '\\"', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'source.sql.embedded.php', 'constant.character.escape.php']});
      expect(tokens[7]).toEqual({value: "'", scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'source.sql.embedded.php', 'string.quoted.single.unclosed.sql']});
      expect(tokens[8]).toEqual({value: '\\"', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'source.sql.embedded.php', 'constant.character.escape.php']});
      expect(tokens[9]).toEqual({value: ',', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'source.sql.embedded.php', 'punctuation.separator.comma.sql']});
      expect(tokens[10]).toEqual({value: ' ', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'source.sql.embedded.php']});
      expect(tokens[11]).toEqual({value: 'TRIM', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'source.sql.embedded.php', 'support.function.string.sql']});
      expect(tokens[17]).toEqual({value: ')', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'source.sql.embedded.php', 'punctuation.definition.section.bracket.round.end.sql']});
      expect(tokens[19]).toEqual({value: 'as', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'source.sql.embedded.php', 'keyword.other.alias.sql']});
      return expect(tokens[21]).toEqual({value: '"', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'punctuation.definition.string.end.php']});
  });

    // TODO: Remove version guard when Atom 1.29 reaches stable
    if (parseFloat(atom.getVersion()) >= 1.29) {
      it('tokenizes interpolation', function() {
        const {tokens} = grammar.tokenizeLine('<?php "SELECT \\007 {$bond}"');

        expect(tokens[2]).toEqual({value: '"', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'punctuation.definition.string.begin.php']});
        expect(tokens[5]).toEqual({value: '\\007', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'source.sql.embedded.php', 'constant.character.escape.octal.php']});
        expect(tokens[7]).toEqual({value: '{', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'source.sql.embedded.php', 'punctuation.definition.variable.php']});
        expect(tokens[8]).toEqual({value: '$', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'source.sql.embedded.php', 'variable.other.php', 'punctuation.definition.variable.php']});
        expect(tokens[9]).toEqual({value: 'bond', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'source.sql.embedded.php', 'variable.other.php']});
        expect(tokens[10]).toEqual({value: '}', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'source.sql.embedded.php', 'punctuation.definition.variable.php']});
        return expect(tokens[11]).toEqual({value: '"', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'punctuation.definition.string.end.php']});
    });

      return it('tokenizes interpolation in SQL strings', function() {
        const {tokens} = grammar.tokenizeLine('<?php "INSERT INTO mytable(field1, field2) VALUES (\'".$val1."\', `".$val2."`)"');

        expect(tokens[2]).toEqual({value: '"', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'punctuation.definition.string.begin.php']});
        expect(tokens[13]).toEqual({value: '(', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'source.sql.embedded.php', 'punctuation.definition.section.bracket.round.begin.sql']});
        expect(tokens[14]).toEqual({value: "'", scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'source.sql.embedded.php', 'string.quoted.single.sql', 'punctuation.definition.string.begin.sql']});
        expect(tokens[15]).toEqual({value: '".', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'source.sql.embedded.php', 'string.quoted.single.sql']});
        expect(tokens[16]).toEqual({value: '$', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'source.sql.embedded.php', 'string.quoted.single.sql', 'variable.other.php', 'punctuation.definition.variable.php']});
        expect(tokens[17]).toEqual({value: 'val1', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'source.sql.embedded.php', 'string.quoted.single.sql', 'variable.other.php']});
        expect(tokens[18]).toEqual({value: '."', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'source.sql.embedded.php', 'string.quoted.single.sql']});
        expect(tokens[19]).toEqual({value: "'", scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'source.sql.embedded.php', 'string.quoted.single.sql', 'punctuation.definition.string.end.sql']});
        expect(tokens[20]).toEqual({value: ',', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'source.sql.embedded.php', 'punctuation.separator.comma.sql']});
        expect(tokens[21]).toEqual({value: ' ', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'source.sql.embedded.php']});
        expect(tokens[22]).toEqual({value: '`', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'source.sql.embedded.php', 'string.quoted.other.backtick.sql', 'punctuation.definition.string.begin.sql']});
        expect(tokens[23]).toEqual({value: '".', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'source.sql.embedded.php', 'string.quoted.other.backtick.sql']});
        expect(tokens[24]).toEqual({value: '$', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'source.sql.embedded.php', 'string.quoted.other.backtick.sql', 'variable.other.php', 'punctuation.definition.variable.php']});
        expect(tokens[25]).toEqual({value: 'val2', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'source.sql.embedded.php', 'string.quoted.other.backtick.sql', 'variable.other.php']});
        expect(tokens[26]).toEqual({value: '."', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'source.sql.embedded.php', 'string.quoted.other.backtick.sql']});
        expect(tokens[27]).toEqual({value: '`', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'source.sql.embedded.php', 'string.quoted.other.backtick.sql', 'punctuation.definition.string.end.sql']});
        expect(tokens[28]).toEqual({value: ')', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'source.sql.embedded.php', 'punctuation.definition.section.bracket.round.end.sql']});
        return expect(tokens[29]).toEqual({value: '"', scopes: ['text.html.php', 'meta.embedded.block.php', 'source.php', 'string.quoted.double.sql.php', 'punctuation.definition.string.end.php']});
    });
    }
});

  it('should tokenize single quoted string regex escape characters correctly', function() {
    const {tokens} = grammar.tokenizeLine("'/[\\\\\\\\]/';");

    expect(tokens[0]).toEqual({value: '\'/', scopes: ['source.php', 'string.regexp.single-quoted.php', 'punctuation.definition.string.begin.php']});
    expect(tokens[1]).toEqual({value: '[', scopes: ['source.php', 'string.regexp.single-quoted.php', 'string.regexp.character-class.php', 'punctuation.definition.character-class.php']});
    expect(tokens[2]).toEqual({value: '\\\\\\\\', scopes: ['source.php', 'string.regexp.single-quoted.php', 'string.regexp.character-class.php']});
    expect(tokens[3]).toEqual({value: ']', scopes: ['source.php', 'string.regexp.single-quoted.php', 'string.regexp.character-class.php', 'punctuation.definition.character-class.php']});
    expect(tokens[4]).toEqual({value: '/\'', scopes: ['source.php', 'string.regexp.single-quoted.php', 'punctuation.definition.string.end.php']});
    return expect(tokens[5]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
});

  it('should tokenize single quoted string regex with escaped bracket', function() {
    const {tokens} = grammar.tokenizeLine("'/\\[/'");

    expect(tokens[0]).toEqual({value: '\'/', scopes: ['source.php', 'string.regexp.single-quoted.php', 'punctuation.definition.string.begin.php']});
    expect(tokens[1]).toEqual({value: '\\[', scopes: ['source.php', 'string.regexp.single-quoted.php', 'constant.character.escape.php']});
    return expect(tokens[2]).toEqual({value: '/\'', scopes: ['source.php', 'string.regexp.single-quoted.php', 'punctuation.definition.string.end.php']});
});

  it('should tokenize opening scope of a closure correctly', function() {
    const {tokens} = grammar.tokenizeLine('$a = function() {};');

    expect(tokens[0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
    expect(tokens[1]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
    expect(tokens[2]).toEqual({value: ' ', scopes: ['source.php']});
    expect(tokens[3]).toEqual({value: '=', scopes: ['source.php', 'keyword.operator.assignment.php']});
    expect(tokens[4]).toEqual({value: ' ', scopes: ['source.php']});
    expect(tokens[5]).toEqual({value: 'function', scopes: ['source.php', 'meta.function.closure.php', 'storage.type.function.php']});
    expect(tokens[6]).toEqual({value: '(', scopes: ['source.php', 'meta.function.closure.php', 'punctuation.definition.parameters.begin.bracket.round.php']});
    expect(tokens[7]).toEqual({value: ')', scopes: ['source.php', 'meta.function.closure.php', 'punctuation.definition.parameters.end.bracket.round.php']});
    expect(tokens[8]).toEqual({value: ' ', scopes: ['source.php', 'meta.function.closure.php']});
    expect(tokens[9]).toEqual({value: '{', scopes: ['source.php', 'punctuation.definition.begin.bracket.curly.php']});
    expect(tokens[10]).toEqual({value: '}', scopes: ['source.php', 'punctuation.definition.end.bracket.curly.php']});
    return expect(tokens[11]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
});

  it('should tokenize comments in closures correctly', function() {
    const {tokens} = grammar.tokenizeLine('$a = function() /* use($b) */ {};');

    expect(tokens[5]).toEqual({value: 'function', scopes: ["source.php", "meta.function.closure.php", "storage.type.function.php"]});
    expect(tokens[6]).toEqual({value: '(', scopes: ["source.php", "meta.function.closure.php", "punctuation.definition.parameters.begin.bracket.round.php"]});
    expect(tokens[7]).toEqual({value: ')', scopes: ["source.php", "meta.function.closure.php", "punctuation.definition.parameters.end.bracket.round.php"]});
    expect(tokens[9]).toEqual({value: '/*', scopes: ["source.php", "meta.function.closure.php", "comment.block.php", "punctuation.definition.comment.php"]});
    return expect(tokens[11]).toEqual({value: '*/', scopes: ["source.php", "meta.function.closure.php", "comment.block.php", "punctuation.definition.comment.php"]});
});

  it('should tokenize non-function-non-control operations correctly', function() {
    const {tokens} = grammar.tokenizeLine("echo 'test';");

    expect(tokens[0]).toEqual({value: 'echo', scopes: ['source.php', 'support.function.construct.output.php']});
    expect(tokens[1]).toEqual({value: ' ', scopes: ['source.php']});
    expect(tokens[2]).toEqual({value: '\'', scopes: ['source.php', 'string.quoted.single.php', 'punctuation.definition.string.begin.php']});
    expect(tokens[3]).toEqual({value: 'test', scopes: ['source.php', 'string.quoted.single.php']});
    expect(tokens[4]).toEqual({value: '\'', scopes: ['source.php', 'string.quoted.single.php', 'punctuation.definition.string.end.php']});
    return expect(tokens[5]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
});

  it('should tokenize heredoc in a function call correctly', function() {
    const lines = grammar.tokenizeLines(`\
foo(
  <<<HEREDOC
  This is just a cool test.
  HEREDOC,
  $bar
);\
`
    );

    expect(lines[0][0]).toEqual({value: 'foo', scopes: ['source.php', 'meta.function-call.php', 'entity.name.function.php']});
    expect(lines[0][1]).toEqual({value: '(', scopes: ['source.php', 'meta.function-call.php', 'punctuation.definition.arguments.begin.bracket.round.php']});
    expect(lines[1][1]).toEqual({value: '<<<', scopes: ['source.php', 'meta.function-call.php', 'string.unquoted.heredoc.php', 'punctuation.definition.string.php']});
    expect(lines[1][2]).toEqual({value: 'HEREDOC', scopes: ['source.php', 'meta.function-call.php', 'string.unquoted.heredoc.php', 'keyword.operator.heredoc.php']});
    expect(lines[2][0]).toEqual({value: '  This is just a cool test.', scopes: ['source.php', 'meta.function-call.php', 'string.unquoted.heredoc.php']});
    expect(lines[3][1]).toEqual({value: 'HEREDOC', scopes: ['source.php', 'meta.function-call.php', 'string.unquoted.heredoc.php', 'keyword.operator.heredoc.php']});
    expect(lines[3][2]).toEqual({value: ',', scopes: ['source.php', 'meta.function-call.php', 'punctuation.separator.delimiter.php']});
    expect(lines[4][1]).toEqual({value: '$', scopes: ['source.php', 'meta.function-call.php', 'variable.other.php', 'punctuation.definition.variable.php']});
    expect(lines[4][2]).toEqual({value: 'bar', scopes: ['source.php', 'meta.function-call.php', 'variable.other.php']});
    expect(lines[5][0]).toEqual({value: ')', scopes: ['source.php', 'meta.function-call.php', 'punctuation.definition.arguments.end.bracket.round.php']});
    return expect(lines[5][1]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
});

  it('should tokenize a simple heredoc correctly', function() {
    let lines = grammar.tokenizeLines(`\
$a = <<<HEREDOC
I am a heredoc
HEREDOC;\
`
    );

    expect(lines[0][0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
    expect(lines[0][1]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
    expect(lines[0][2]).toEqual({value: ' ', scopes: ['source.php']});
    expect(lines[0][3]).toEqual({value: '=', scopes: ['source.php', 'keyword.operator.assignment.php']});
    expect(lines[0][4]).toEqual({value: ' ', scopes: ['source.php']});
    expect(lines[0][5]).toEqual({value: '<<<', scopes: ['source.php', 'string.unquoted.heredoc.php', 'punctuation.definition.string.php']});
    expect(lines[0][6]).toEqual({value: 'HEREDOC', scopes: ['source.php', 'string.unquoted.heredoc.php', 'keyword.operator.heredoc.php']});
    expect(lines[1][0]).toEqual({value: 'I am a heredoc', scopes: ['source.php', 'string.unquoted.heredoc.php']});
    expect(lines[2][0]).toEqual({value: 'HEREDOC', scopes: ['source.php', 'string.unquoted.heredoc.php', 'keyword.operator.heredoc.php']});
    expect(lines[2][1]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});

    lines = grammar.tokenizeLines(`\
$a = <<<HEREDOC
I am a heredoc
HEREDOC
;\
`
    );

    expect(lines[0][0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
    expect(lines[0][1]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
    expect(lines[0][2]).toEqual({value: ' ', scopes: ['source.php']});
    expect(lines[0][3]).toEqual({value: '=', scopes: ['source.php', 'keyword.operator.assignment.php']});
    expect(lines[0][4]).toEqual({value: ' ', scopes: ['source.php']});
    expect(lines[0][5]).toEqual({value: '<<<', scopes: ['source.php', 'string.unquoted.heredoc.php', 'punctuation.definition.string.php']});
    expect(lines[0][6]).toEqual({value: 'HEREDOC', scopes: ['source.php', 'string.unquoted.heredoc.php', 'keyword.operator.heredoc.php']});
    expect(lines[1][0]).toEqual({value: 'I am a heredoc', scopes: ['source.php', 'string.unquoted.heredoc.php']});
    expect(lines[2][0]).toEqual({value: 'HEREDOC', scopes: ['source.php', 'string.unquoted.heredoc.php', 'keyword.operator.heredoc.php']});
    expect(lines[3][0]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});

    lines = grammar.tokenizeLines(`\
$a = <<<HEREDOC
I am a heredoc
HEREDOC ;\
`
    );

    expect(lines[0][0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
    expect(lines[0][1]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
    expect(lines[0][2]).toEqual({value: ' ', scopes: ['source.php']});
    expect(lines[0][3]).toEqual({value: '=', scopes: ['source.php', 'keyword.operator.assignment.php']});
    expect(lines[0][4]).toEqual({value: ' ', scopes: ['source.php']});
    expect(lines[0][5]).toEqual({value: '<<<', scopes: ['source.php', 'string.unquoted.heredoc.php', 'punctuation.definition.string.php']});
    expect(lines[0][6]).toEqual({value: 'HEREDOC', scopes: ['source.php', 'string.unquoted.heredoc.php', 'keyword.operator.heredoc.php']});
    expect(lines[1][0]).toEqual({value: 'I am a heredoc', scopes: ['source.php', 'string.unquoted.heredoc.php']});
    expect(lines[2][0]).toEqual({value: 'HEREDOC', scopes: ['source.php', 'string.unquoted.heredoc.php', 'keyword.operator.heredoc.php']});
    expect(lines[2][1]).toEqual({value: ' ', scopes: ['source.php']});
    expect(lines[2][2]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});

    lines = grammar.tokenizeLines(`\
$a = <<<HEREDOC
I am a heredoc
HEREDOC; // comment\
`
    );

    expect(lines[0][0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
    expect(lines[0][1]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
    expect(lines[0][2]).toEqual({value: ' ', scopes: ['source.php']});
    expect(lines[0][3]).toEqual({value: '=', scopes: ['source.php', 'keyword.operator.assignment.php']});
    expect(lines[0][4]).toEqual({value: ' ', scopes: ['source.php']});
    expect(lines[0][5]).toEqual({value: '<<<', scopes: ['source.php', 'string.unquoted.heredoc.php', 'punctuation.definition.string.php']});
    expect(lines[0][6]).toEqual({value: 'HEREDOC', scopes: ['source.php', 'string.unquoted.heredoc.php', 'keyword.operator.heredoc.php']});
    expect(lines[1][0]).toEqual({value: 'I am a heredoc', scopes: ['source.php', 'string.unquoted.heredoc.php']});
    expect(lines[2][0]).toEqual({value: 'HEREDOC', scopes: ['source.php', 'string.unquoted.heredoc.php', 'keyword.operator.heredoc.php']});
    expect(lines[2][1]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
    expect(lines[2][2]).toEqual({value: ' ', scopes: ['source.php']});
    return expect(lines[2][3]).toEqual({value: '//', scopes: ['source.php', 'comment.line.double-slash.php', 'punctuation.definition.comment.php']});
});

  it('should tokenize a longer heredoc correctly', function() {
    const lines = grammar.tokenizeLines(`\
$a = <<<GITHUB
This is a plain string.
SELECT * FROM github WHERE octocat = 'awesome' and ID = 1;
<strong>rainbows</strong>

if(awesome) {
  doSomething(10, function(x){
    console.log(x*x);
  });
}
GITHUB;\
`
    );

    expect(lines[0][0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
    expect(lines[0][1]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
    expect(lines[0][2]).toEqual({value: ' ', scopes: ['source.php']});
    expect(lines[0][3]).toEqual({value: '=', scopes: ['source.php', 'keyword.operator.assignment.php']});
    expect(lines[0][4]).toEqual({value: ' ', scopes: ['source.php']});
    expect(lines[0][5]).toEqual({value: '<<<', scopes: ['source.php', 'string.unquoted.heredoc.php', 'punctuation.definition.string.php']});
    expect(lines[0][6]).toEqual({value: 'GITHUB', scopes: ['source.php', 'string.unquoted.heredoc.php', 'keyword.operator.heredoc.php']});
    expect(lines[1][0]).toEqual({value: 'This is a plain string.', scopes: ['source.php', 'string.unquoted.heredoc.php']});
    expect(lines[2][0]).toEqual({value: 'SELECT * FROM github WHERE octocat = \'awesome\' and ID = 1;', scopes: ['source.php', 'string.unquoted.heredoc.php']});
    expect(lines[3][0]).toEqual({value: '<strong>rainbows</strong>', scopes: ['source.php', 'string.unquoted.heredoc.php']});
    expect(lines[4][0]).toEqual({value: '', scopes: ['source.php', 'string.unquoted.heredoc.php']});
    expect(lines[5][0]).toEqual({value: 'if(awesome) {', scopes: ['source.php', 'string.unquoted.heredoc.php']});
    expect(lines[6][0]).toEqual({value: '  doSomething(10, function(x){', scopes: ['source.php', 'string.unquoted.heredoc.php']});
    expect(lines[7][0]).toEqual({value: '    console.log(x*x);', scopes: ['source.php', 'string.unquoted.heredoc.php']});
    expect(lines[8][0]).toEqual({value: '  });', scopes: ['source.php', 'string.unquoted.heredoc.php']});
    expect(lines[9][0]).toEqual({value: '}', scopes: ['source.php', 'string.unquoted.heredoc.php']});
    expect(lines[10][0]).toEqual({value: 'GITHUB', scopes: ['source.php', 'string.unquoted.heredoc.php', 'keyword.operator.heredoc.php']});
    return expect(lines[10][1]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
});

  it('should tokenize a longer heredoc with interpolated values and escaped characters correctly', function() {
    const lines = grammar.tokenizeLines(`\
$a = <<<GITHUB
This is a plain string.
Jumpin' Juniper is \\"The $thing\\"
SELECT * FROM github WHERE octocat = 'awesome' and ID = 1;
<strong>rainbows</strong>

if(awesome) {
  doSomething(10, function(x){
    console.log(x*x);
  });
}
C:\\\\no\\\\turning\\back.exe
GITHUB;\
`
    );

    expect(lines[0][0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
    expect(lines[0][1]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
    expect(lines[0][2]).toEqual({value: ' ', scopes: ['source.php']});
    expect(lines[0][3]).toEqual({value: '=', scopes: ['source.php', 'keyword.operator.assignment.php']});
    expect(lines[0][4]).toEqual({value: ' ', scopes: ['source.php']});
    expect(lines[0][5]).toEqual({value: '<<<', scopes: ['source.php', 'string.unquoted.heredoc.php', 'punctuation.definition.string.php']});
    expect(lines[0][6]).toEqual({value: 'GITHUB', scopes: ['source.php', 'string.unquoted.heredoc.php', 'keyword.operator.heredoc.php']});
    expect(lines[1][0]).toEqual({value: 'This is a plain string.', scopes: ['source.php', 'string.unquoted.heredoc.php']});
    expect(lines[2][0]).toEqual({value: 'Jumpin\' Juniper is \\"The ', scopes: ['source.php', 'string.unquoted.heredoc.php']});
    expect(lines[2][1]).toEqual({value: '$', scopes: ['source.php', 'string.unquoted.heredoc.php', 'variable.other.php', 'punctuation.definition.variable.php']});
    expect(lines[2][2]).toEqual({value: 'thing', scopes: ['source.php', 'string.unquoted.heredoc.php', 'variable.other.php']});
    expect(lines[2][3]).toEqual({value: '\\"', scopes: ['source.php', 'string.unquoted.heredoc.php']});
    expect(lines[3][0]).toEqual({value: 'SELECT * FROM github WHERE octocat = \'awesome\' and ID = 1;', scopes: ['source.php', 'string.unquoted.heredoc.php']});
    expect(lines[4][0]).toEqual({value: '<strong>rainbows</strong>', scopes: ['source.php', 'string.unquoted.heredoc.php']});
    expect(lines[5][0]).toEqual({value: '', scopes: ['source.php', 'string.unquoted.heredoc.php']});
    expect(lines[6][0]).toEqual({value: 'if(awesome) {', scopes: ['source.php', 'string.unquoted.heredoc.php']});
    expect(lines[7][0]).toEqual({value: '  doSomething(10, function(x){', scopes: ['source.php', 'string.unquoted.heredoc.php']});
    expect(lines[8][0]).toEqual({value: '    console.log(x*x);', scopes: ['source.php', 'string.unquoted.heredoc.php']});
    expect(lines[9][0]).toEqual({value: '  });', scopes: ['source.php', 'string.unquoted.heredoc.php']});
    expect(lines[10][0]).toEqual({value: '}', scopes: ['source.php', 'string.unquoted.heredoc.php']});
    expect(lines[11][0]).toEqual({value: 'C:', scopes: ['source.php', 'string.unquoted.heredoc.php']});
    expect(lines[11][1]).toEqual({value: '\\\\', scopes: ['source.php', 'string.unquoted.heredoc.php', 'constant.character.escape.php']});
    expect(lines[11][2]).toEqual({value: 'no', scopes: ['source.php', 'string.unquoted.heredoc.php']});
    expect(lines[11][3]).toEqual({value: '\\\\', scopes: ['source.php', 'string.unquoted.heredoc.php', 'constant.character.escape.php']});
    expect(lines[11][4]).toEqual({value: 'turning\\back.exe', scopes: ['source.php', 'string.unquoted.heredoc.php']});
    expect(lines[12][0]).toEqual({value: 'GITHUB', scopes: ['source.php', 'string.unquoted.heredoc.php', 'keyword.operator.heredoc.php']});
    return expect(lines[12][1]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
});

  it('should tokenize a nowdoc with interpolated values correctly', function() {
    const lines = grammar.tokenizeLines(`\
$a = <<<'GITHUB'
This is a plain string.
Jumpin' Juniper is \\"The $thing\\"
SELECT * FROM github WHERE octocat = 'awesome' and ID = 1;
<strong>rainbows</strong>

if(awesome) {
  doSomething(10, function(x){
    console.log(x*x);
  });
}
C:\\\\no\\\\turning\\back.exe
GITHUB;\
`
    );

    expect(lines[0][0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
    expect(lines[0][1]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
    expect(lines[0][2]).toEqual({value: ' ', scopes: ['source.php']});
    expect(lines[0][3]).toEqual({value: '=', scopes: ['source.php', 'keyword.operator.assignment.php']});
    expect(lines[0][4]).toEqual({value: ' ', scopes: ['source.php']});
    expect(lines[0][5]).toEqual({value: '<<<', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'punctuation.definition.string.php']});
    expect(lines[0][6]).toEqual({value: '\'', scopes: ['source.php', 'string.unquoted.nowdoc.php']});
    expect(lines[0][7]).toEqual({value: 'GITHUB', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'keyword.operator.nowdoc.php']});
    expect(lines[0][8]).toEqual({value: '\'', scopes: ['source.php', 'string.unquoted.nowdoc.php']});
    expect(lines[1][0]).toEqual({value: 'This is a plain string.', scopes: ['source.php', 'string.unquoted.nowdoc.php']});
    expect(lines[2][0]).toEqual({value: 'Jumpin\' Juniper is \\"The $thing\\"', scopes: ['source.php', 'string.unquoted.nowdoc.php']});
    expect(lines[3][0]).toEqual({value: 'SELECT * FROM github WHERE octocat = \'awesome\' and ID = 1;', scopes: ['source.php', 'string.unquoted.nowdoc.php']});
    expect(lines[4][0]).toEqual({value: '<strong>rainbows</strong>', scopes: ['source.php', 'string.unquoted.nowdoc.php']});
    expect(lines[5][0]).toEqual({value: '', scopes: ['source.php', 'string.unquoted.nowdoc.php']});
    expect(lines[6][0]).toEqual({value: 'if(awesome) {', scopes: ['source.php', 'string.unquoted.nowdoc.php']});
    expect(lines[7][0]).toEqual({value: '  doSomething(10, function(x){', scopes: ['source.php', 'string.unquoted.nowdoc.php']});
    expect(lines[8][0]).toEqual({value: '    console.log(x*x);', scopes: ['source.php', 'string.unquoted.nowdoc.php']});
    expect(lines[9][0]).toEqual({value: '  });', scopes: ['source.php', 'string.unquoted.nowdoc.php']});
    expect(lines[10][0]).toEqual({value: '}', scopes: ['source.php', 'string.unquoted.nowdoc.php']});
    expect(lines[11][0]).toEqual({value: 'C:\\\\no\\\\turning\\back.exe', scopes: ['source.php', 'string.unquoted.nowdoc.php']});
    expect(lines[12][0]).toEqual({value: 'GITHUB', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'keyword.operator.nowdoc.php']});
    return expect(lines[12][1]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
});

  it('should tokenize a heredoc with embedded HTML and interpolation correctly', function() {
    waitsForPromise(() => atom.packages.activatePackage('language-html'));

    return runs(function() {
      const lines = grammar.tokenizeLines(`\
$a = <<<HTML
<strong>rainbows</strong>
Jumpin' Juniper is \\"The $thing\\"
C:\\\\no\\\\turning\\back.exe
HTML;\
`
      );

      expect(lines[0][0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
      expect(lines[0][1]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
      expect(lines[0][2]).toEqual({value: ' ', scopes: ['source.php']});
      expect(lines[0][3]).toEqual({value: '=', scopes: ['source.php', 'keyword.operator.assignment.php']});
      expect(lines[0][4]).toEqual({value: ' ', scopes: ['source.php']});
      expect(lines[0][5]).toEqual({value: '<<<', scopes: ['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.html', 'punctuation.section.embedded.begin.php', 'punctuation.definition.string.php']});
      expect(lines[0][6]).toEqual({value: 'HTML', scopes: ['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.html', 'punctuation.section.embedded.begin.php', 'keyword.operator.heredoc.php']});
      expect(lines[1][0].value).toEqual('<');
      expect(lines[1][0].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.html', 'text.html']);
      expect(lines[1][1].value).toEqual('strong');
      expect(lines[1][1].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.html', 'text.html']);
      expect(lines[1][2].value).toEqual('>');
      expect(lines[1][2].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.html', 'text.html']);
      expect(lines[1][3].value).toEqual('rainbows');
      expect(lines[1][3].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.html', 'text.html']);
      expect(lines[1][4].value).toEqual('</');
      expect(lines[1][4].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.html', 'text.html']);
      expect(lines[1][5].value).toEqual('strong');
      expect(lines[1][5].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.html', 'text.html']);
      expect(lines[1][6].value).toEqual('>');
      expect(lines[1][6].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.html', 'text.html']);
      expect(lines[2][0]).toEqual({value: 'Jumpin\' Juniper is \\"The ', scopes: ['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.html', 'text.html']});
      expect(lines[2][1]).toEqual({value: '$', scopes: ['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.html', 'text.html', 'variable.other.php', 'punctuation.definition.variable.php']});
      expect(lines[2][2]).toEqual({value: 'thing', scopes: ['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.html', 'text.html', 'variable.other.php']});
      expect(lines[2][3]).toEqual({value: '\\"', scopes: ['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.html', 'text.html']});
      expect(lines[3][0]).toEqual({value: 'C:', scopes: ['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.html', 'text.html']});
      expect(lines[3][1]).toEqual({value: '\\\\', scopes: ['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.html', 'text.html', 'constant.character.escape.php']});
      expect(lines[3][2]).toEqual({value: 'no', scopes: ['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.html', 'text.html']});
      expect(lines[3][3]).toEqual({value: '\\\\', scopes: ['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.html', 'text.html', 'constant.character.escape.php']});
      expect(lines[3][4]).toEqual({value: 'turning\\back.exe', scopes: ['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.html', 'text.html']});
      expect(lines[4][0]).toEqual({value: 'HTML', scopes: ['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.html', 'punctuation.section.embedded.end.php', 'keyword.operator.heredoc.php']});
      return expect(lines[4][1]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});});
});

  it('should tokenize a nowdoc with embedded HTML and interpolation correctly', function() {
    waitsForPromise(() => atom.packages.activatePackage('language-html'));

    return runs(function() {
      const lines = grammar.tokenizeLines(`\
$a = <<<'HTML'
<strong>rainbows</strong>
Jumpin' Juniper is \\"The $thing\\"
HTML;\
`
      );

      expect(lines[0][0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
      expect(lines[0][1]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
      expect(lines[0][2]).toEqual({value: ' ', scopes: ['source.php']});
      expect(lines[0][3]).toEqual({value: '=', scopes: ['source.php', 'keyword.operator.assignment.php']});
      expect(lines[0][4]).toEqual({value: ' ', scopes: ['source.php']});
      expect(lines[0][5]).toEqual({value: '<<<', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.html', 'punctuation.section.embedded.begin.php', 'punctuation.definition.string.php']});
      expect(lines[0][6]).toEqual({value: '\'', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.html', 'punctuation.section.embedded.begin.php']});
      expect(lines[0][7]).toEqual({value: 'HTML', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.html', 'punctuation.section.embedded.begin.php', 'keyword.operator.nowdoc.php']});
      expect(lines[0][8]).toEqual({value: '\'', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.html', 'punctuation.section.embedded.begin.php']});
      expect(lines[1][0].value).toEqual('<');
      expect(lines[1][0].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.html', 'text.html']);
      expect(lines[1][1].value).toEqual('strong');
      expect(lines[1][1].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.html', 'text.html']);
      expect(lines[1][2].value).toEqual('>');
      expect(lines[1][2].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.html', 'text.html']);
      expect(lines[1][3].value).toEqual('rainbows');
      expect(lines[1][3].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.html', 'text.html']);
      expect(lines[1][4].value).toEqual('</');
      expect(lines[1][4].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.html', 'text.html']);
      expect(lines[1][5].value).toEqual('strong');
      expect(lines[1][5].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.html', 'text.html']);
      expect(lines[1][6].value).toEqual('>');
      expect(lines[1][6].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.html', 'text.html']);
      expect(lines[2][0]).toEqual({value: 'Jumpin\' Juniper is \\"The $thing\\"', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.html', 'text.html']});
      expect(lines[3][0]).toEqual({value: 'HTML', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.html', 'punctuation.section.embedded.end.php', 'keyword.operator.nowdoc.php']});
      return expect(lines[3][1]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});});
});

  it('should tokenize a heredoc with illegal whitespace at the end of the line correctly', function() {
    const lines = grammar.tokenizeLines(`\
$a = <<<GITHUB\t
This is a plain string.
GITHUB;\
`
    );

    expect(lines[0][0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
    expect(lines[0][1]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
    expect(lines[0][2]).toEqual({value: ' ', scopes: ['source.php']});
    expect(lines[0][3]).toEqual({value: '=', scopes: ['source.php', 'keyword.operator.assignment.php']});
    expect(lines[0][4]).toEqual({value: ' ', scopes: ['source.php']});
    expect(lines[0][5]).toEqual({value: '<<<', scopes: ['source.php', 'string.unquoted.heredoc.php', 'punctuation.definition.string.php']});
    expect(lines[0][6]).toEqual({value: 'GITHUB', scopes: ['source.php', 'string.unquoted.heredoc.php', 'keyword.operator.heredoc.php']});
    expect(lines[0][7]).toEqual({value: '\t', scopes: ['source.php', 'string.unquoted.heredoc.php', 'invalid.illegal.trailing-whitespace.php']});
    expect(lines[1][0]).toEqual({value: 'This is a plain string.', scopes: ['source.php', 'string.unquoted.heredoc.php']});
    expect(lines[2][0]).toEqual({value: 'GITHUB', scopes: ['source.php', 'string.unquoted.heredoc.php', 'keyword.operator.heredoc.php']});
    return expect(lines[2][1]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
});

  it('should tokenize a heredoc with embedded XML correctly', function() {
    waitsForPromise(() => atom.packages.activatePackage('language-xml'));

    return runs(function() {
      const lines = grammar.tokenizeLines(`\
$a = <<<XML
<root/>
XML;\
`
      );

      expect(lines[0][0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
      expect(lines[0][1]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
      expect(lines[0][2]).toEqual({value: ' ', scopes: ['source.php']});
      expect(lines[0][3]).toEqual({value: '=', scopes: ['source.php', 'keyword.operator.assignment.php']});
      expect(lines[0][4]).toEqual({value: ' ', scopes: ['source.php']});
      expect(lines[0][5]).toEqual({value: '<<<', scopes: ['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.xml', 'punctuation.section.embedded.begin.php', 'punctuation.definition.string.php']});
      expect(lines[0][6]).toEqual({value: 'XML', scopes: ['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.xml', 'punctuation.section.embedded.begin.php', 'keyword.operator.heredoc.php']});
      expect(lines[1][0].value).toEqual('<');
      expect(lines[1][0].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.xml', 'text.xml']);
      expect(lines[1][1].value).toEqual('root');
      expect(lines[1][1].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.xml', 'text.xml']);
      expect(lines[1][2].value).toEqual('/>');
      expect(lines[1][2].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.xml', 'text.xml']);
      expect(lines[2][0]).toEqual({value: 'XML', scopes: ['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.xml', 'punctuation.section.embedded.end.php', 'keyword.operator.heredoc.php']});
      return expect(lines[2][1]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});});
});

  it('should tokenize a nowdoc with embedded XML correctly', function() {
    waitsForPromise(() => atom.packages.activatePackage('language-xml'));

    return runs(function() {
      const lines = grammar.tokenizeLines(`\
$a = <<<'XML'
<root/>
XML;\
`
      );

      expect(lines[0][0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
      expect(lines[0][1]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
      expect(lines[0][2]).toEqual({value: ' ', scopes: ['source.php']});
      expect(lines[0][3]).toEqual({value: '=', scopes: ['source.php', 'keyword.operator.assignment.php']});
      expect(lines[0][4]).toEqual({value: ' ', scopes: ['source.php']});
      expect(lines[0][5]).toEqual({value: '<<<', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.xml', 'punctuation.section.embedded.begin.php', 'punctuation.definition.string.php']});
      expect(lines[0][6]).toEqual({value: '\'', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.xml', 'punctuation.section.embedded.begin.php']});
      expect(lines[0][7]).toEqual({value: 'XML', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.xml', 'punctuation.section.embedded.begin.php', 'keyword.operator.nowdoc.php']});
      expect(lines[0][8]).toEqual({value: '\'', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.xml', 'punctuation.section.embedded.begin.php']});
      expect(lines[1][0].value).toEqual('<');
      expect(lines[1][0].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.xml', 'text.xml']);
      expect(lines[1][1].value).toEqual('root');
      expect(lines[1][1].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.xml', 'text.xml']);
      expect(lines[1][2].value).toEqual('/>');
      expect(lines[1][2].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.xml', 'text.xml']);
      expect(lines[2][0]).toEqual({value: 'XML', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.xml', 'punctuation.section.embedded.end.php', 'keyword.operator.nowdoc.php']});
      return expect(lines[2][1]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});});
});

  it('should tokenize a heredoc with embedded SQL correctly', function() {
    waitsForPromise(() => atom.packages.activatePackage('language-sql'));

    return runs(function() {
      const lines = grammar.tokenizeLines(`\
$a = <<<SQL
SELECT * FROM table
SQL;\
`
      );

      expect(lines[0][0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
      expect(lines[0][1]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
      expect(lines[0][2]).toEqual({value: ' ', scopes: ['source.php']});
      expect(lines[0][3]).toEqual({value: '=', scopes: ['source.php', 'keyword.operator.assignment.php']});
      expect(lines[0][4]).toEqual({value: ' ', scopes: ['source.php']});
      expect(lines[0][5]).toEqual({value: '<<<', scopes: ['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.sql', 'punctuation.section.embedded.begin.php', 'punctuation.definition.string.php']});
      expect(lines[0][6]).toEqual({value: 'SQL', scopes: ['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.sql', 'punctuation.section.embedded.begin.php', 'keyword.operator.heredoc.php']});
      expect(lines[1][0].value).toEqual('SELECT');
      expect(lines[1][0].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.sql', 'source.sql']);
      expect(lines[1][1].value).toEqual(' ');
      expect(lines[1][1].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.sql', 'source.sql']);
      expect(lines[1][2].value).toEqual('*');
      expect(lines[1][2].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.sql', 'source.sql']);
      expect(lines[1][3].value).toEqual(' ');
      expect(lines[1][3].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.sql', 'source.sql']);
      expect(lines[1][4].value).toEqual('FROM');
      expect(lines[1][4].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.sql', 'source.sql']);
      expect(lines[1][5].value).toEqual(' table');
      expect(lines[1][5].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.sql', 'source.sql']);
      expect(lines[2][0]).toEqual({value: 'SQL', scopes: ['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.sql', 'punctuation.section.embedded.end.php', 'keyword.operator.heredoc.php']});
      return expect(lines[2][1]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});});
});

  it('should tokenize a nowdoc with embedded SQL correctly', function() {
    waitsForPromise(() => atom.packages.activatePackage('language-sql'));

    return runs(function() {
      const lines = grammar.tokenizeLines(`\
$a = <<<'SQL'
SELECT * FROM table
SQL;\
`
      );

      expect(lines[0][0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
      expect(lines[0][1]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
      expect(lines[0][2]).toEqual({value: ' ', scopes: ['source.php']});
      expect(lines[0][3]).toEqual({value: '=', scopes: ['source.php', 'keyword.operator.assignment.php']});
      expect(lines[0][4]).toEqual({value: ' ', scopes: ['source.php']});
      expect(lines[0][5]).toEqual({value: '<<<', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.sql', 'punctuation.section.embedded.begin.php', 'punctuation.definition.string.php']});
      expect(lines[0][6]).toEqual({value: '\'', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.sql', 'punctuation.section.embedded.begin.php']});
      expect(lines[0][7]).toEqual({value: 'SQL', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.sql', 'punctuation.section.embedded.begin.php', 'keyword.operator.nowdoc.php']});
      expect(lines[0][8]).toEqual({value: '\'', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.sql', 'punctuation.section.embedded.begin.php']});
      expect(lines[1][0].value).toEqual('SELECT');
      expect(lines[1][0].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.sql', 'source.sql']);
      expect(lines[1][1].value).toEqual(' ');
      expect(lines[1][1].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.sql', 'source.sql']);
      expect(lines[1][2].value).toEqual('*');
      expect(lines[1][2].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.sql', 'source.sql']);
      expect(lines[1][3].value).toEqual(' ');
      expect(lines[1][3].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.sql', 'source.sql']);
      expect(lines[1][4].value).toEqual('FROM');
      expect(lines[1][4].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.sql', 'source.sql']);
      expect(lines[1][5].value).toEqual(' table');
      expect(lines[1][5].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.sql', 'source.sql']);
      expect(lines[2][0]).toEqual({value: 'SQL', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.sql', 'punctuation.section.embedded.end.php', 'keyword.operator.nowdoc.php']});
      return expect(lines[2][1]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});});
});

  it('should tokenize a heredoc with embedded javascript correctly', function() {
    waitsForPromise(() => atom.packages.activatePackage('language-javascript'));

    return runs(function() {
      const lines = grammar.tokenizeLines(`\
$a = <<<JAVASCRIPT
var a = 1;
JAVASCRIPT;

$a = <<<JS
var a = 1;
JS;\
`
      );

      expect(lines[0][0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
      expect(lines[0][1]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
      expect(lines[0][2]).toEqual({value: ' ', scopes: ['source.php']});
      expect(lines[0][3]).toEqual({value: '=', scopes: ['source.php', 'keyword.operator.assignment.php']});
      expect(lines[0][4]).toEqual({value: ' ', scopes: ['source.php']});
      expect(lines[0][5]).toEqual({value: '<<<', scopes: ['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.js', 'punctuation.section.embedded.begin.php', 'punctuation.definition.string.php']});
      expect(lines[0][6]).toEqual({value: 'JAVASCRIPT', scopes: ['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.js', 'punctuation.section.embedded.begin.php', 'keyword.operator.heredoc.php']});
      expect(lines[1][0].value).toEqual('var');
      expect(lines[1][0].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.js', 'source.js']);
      expect(lines[1][1].value).toEqual(' a ');
      expect(lines[1][1].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.js', 'source.js']);
      expect(lines[1][2].value).toEqual('=');
      expect(lines[1][2].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.js', 'source.js']);
      expect(lines[1][3].value).toEqual(' ');
      expect(lines[1][3].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.js', 'source.js']);
      expect(lines[1][4].value).toEqual('1');
      expect(lines[1][4].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.js', 'source.js']);
      expect(lines[1][5].value).toEqual(';');
      expect(lines[1][5].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.js', 'source.js']);
      expect(lines[2][0]).toEqual({value: 'JAVASCRIPT', scopes: ['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.js', 'punctuation.section.embedded.end.php', 'keyword.operator.heredoc.php']});
      expect(lines[2][1]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});

      expect(lines[4][0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
      expect(lines[4][1]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
      expect(lines[4][2]).toEqual({value: ' ', scopes: ['source.php']});
      expect(lines[4][3]).toEqual({value: '=', scopes: ['source.php', 'keyword.operator.assignment.php']});
      expect(lines[4][4]).toEqual({value: ' ', scopes: ['source.php']});
      expect(lines[4][5]).toEqual({value: '<<<', scopes: ['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.js', 'punctuation.section.embedded.begin.php', 'punctuation.definition.string.php']});
      expect(lines[4][6]).toEqual({value: 'JS', scopes: ['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.js', 'punctuation.section.embedded.begin.php', 'keyword.operator.heredoc.php']});
      expect(lines[5][0].value).toEqual('var');
      expect(lines[5][0].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.js', 'source.js']);
      expect(lines[5][1].value).toEqual(' a ');
      expect(lines[5][1].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.js', 'source.js']);
      expect(lines[5][2].value).toEqual('=');
      expect(lines[5][2].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.js', 'source.js']);
      expect(lines[5][3].value).toEqual(' ');
      expect(lines[5][3].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.js', 'source.js']);
      expect(lines[5][4].value).toEqual('1');
      expect(lines[5][4].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.js', 'source.js']);
      expect(lines[5][5].value).toEqual(';');
      expect(lines[5][5].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.js', 'source.js']);
      expect(lines[6][0]).toEqual({value: 'JS', scopes: ['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.js', 'punctuation.section.embedded.end.php', 'keyword.operator.heredoc.php']});
      return expect(lines[6][1]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});});
});

  it('should tokenize a nowdoc with embedded javascript correctly', function() {
    waitsForPromise(() => atom.packages.activatePackage('language-javascript'));

    return runs(function() {
      const lines = grammar.tokenizeLines(`\
$a = <<<'JAVASCRIPT'
var a = 1;
JAVASCRIPT;

$a = <<<'JS'
var a = 1;
JS;\
`
      );

      expect(lines[0][0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
      expect(lines[0][1]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
      expect(lines[0][2]).toEqual({value: ' ', scopes: ['source.php']});
      expect(lines[0][3]).toEqual({value: '=', scopes: ['source.php', 'keyword.operator.assignment.php']});
      expect(lines[0][4]).toEqual({value: ' ', scopes: ['source.php']});
      expect(lines[0][5]).toEqual({value: '<<<', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.js', 'punctuation.section.embedded.begin.php', 'punctuation.definition.string.php']});
      expect(lines[0][6]).toEqual({value: '\'', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.js', 'punctuation.section.embedded.begin.php']});
      expect(lines[0][7]).toEqual({value: 'JAVASCRIPT', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.js', 'punctuation.section.embedded.begin.php', 'keyword.operator.nowdoc.php']});
      expect(lines[0][8]).toEqual({value: '\'', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.js', 'punctuation.section.embedded.begin.php']});
      expect(lines[1][0].value).toEqual('var');
      expect(lines[1][0].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.js', 'source.js']);
      expect(lines[1][1].value).toEqual(' a ');
      expect(lines[1][1].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.js', 'source.js']);
      expect(lines[1][2].value).toEqual('=');
      expect(lines[1][2].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.js', 'source.js']);
      expect(lines[1][3].value).toEqual(' ');
      expect(lines[1][3].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.js', 'source.js']);
      expect(lines[1][4].value).toEqual('1');
      expect(lines[1][4].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.js', 'source.js']);
      expect(lines[1][5].value).toEqual(';');
      expect(lines[1][5].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.js', 'source.js']);
      expect(lines[2][0]).toEqual({value: 'JAVASCRIPT', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.js', 'punctuation.section.embedded.end.php', 'keyword.operator.nowdoc.php']});
      expect(lines[2][1]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});

      expect(lines[4][0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
      expect(lines[4][1]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
      expect(lines[4][2]).toEqual({value: ' ', scopes: ['source.php']});
      expect(lines[4][3]).toEqual({value: '=', scopes: ['source.php', 'keyword.operator.assignment.php']});
      expect(lines[4][4]).toEqual({value: ' ', scopes: ['source.php']});
      expect(lines[4][5]).toEqual({value: '<<<', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.js', 'punctuation.section.embedded.begin.php', 'punctuation.definition.string.php']});
      expect(lines[4][6]).toEqual({value: '\'', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.js', 'punctuation.section.embedded.begin.php']});
      expect(lines[4][7]).toEqual({value: 'JS', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.js', 'punctuation.section.embedded.begin.php', 'keyword.operator.nowdoc.php']});
      expect(lines[4][8]).toEqual({value: '\'', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.js', 'punctuation.section.embedded.begin.php']});
      expect(lines[5][0].value).toEqual('var');
      expect(lines[5][0].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.js', 'source.js']);
      expect(lines[5][1].value).toEqual(' a ');
      expect(lines[5][1].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.js', 'source.js']);
      expect(lines[5][2].value).toEqual('=');
      expect(lines[5][2].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.js', 'source.js']);
      expect(lines[5][3].value).toEqual(' ');
      expect(lines[5][3].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.js', 'source.js']);
      expect(lines[5][4].value).toEqual('1');
      expect(lines[5][4].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.js', 'source.js']);
      expect(lines[5][5].value).toEqual(';');
      expect(lines[5][5].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.js', 'source.js']);
      expect(lines[6][0]).toEqual({value: 'JS', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.js', 'punctuation.section.embedded.end.php', 'keyword.operator.nowdoc.php']});
      return expect(lines[6][1]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});});
});

  it('should tokenize a heredoc with embedded json correctly', function() {
    waitsForPromise(() => atom.packages.activatePackage('language-json'));

    return runs(function() {
      const lines = grammar.tokenizeLines(`\
$a = <<<JSON
{"a" : 1}
JSON;\
`
      );

      expect(lines[0][0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
      expect(lines[0][1]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
      expect(lines[0][2]).toEqual({value: ' ', scopes: ['source.php']});
      expect(lines[0][3]).toEqual({value: '=', scopes: ['source.php', 'keyword.operator.assignment.php']});
      expect(lines[0][4]).toEqual({value: ' ', scopes: ['source.php']});
      expect(lines[0][5]).toEqual({value: '<<<', scopes: ['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.json', 'punctuation.section.embedded.begin.php', 'punctuation.definition.string.php']});
      expect(lines[0][6]).toEqual({value: 'JSON', scopes: ['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.json', 'punctuation.section.embedded.begin.php', 'keyword.operator.heredoc.php']});
      expect(lines[1][0].value).toEqual('{');
      expect(lines[1][0].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.json', 'source.json']);
      expect(lines[1][1].value).toEqual('"');
      expect(lines[1][1].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.json', 'source.json']);
      expect(lines[1][2].value).toEqual('a');
      expect(lines[1][2].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.json', 'source.json']);
      expect(lines[1][3].value).toEqual('"');
      expect(lines[1][3].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.json', 'source.json']);
      expect(lines[1][4].value).toEqual(' ');
      expect(lines[1][4].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.json', 'source.json']);
      expect(lines[1][5].value).toEqual(':');
      expect(lines[1][5].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.json', 'source.json']);
      expect(lines[1][6].value).toEqual(' ');
      expect(lines[1][6].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.json', 'source.json']);
      expect(lines[1][7].value).toEqual('1');
      expect(lines[1][7].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.json', 'source.json']);
      expect(lines[1][8].value).toEqual('}');
      expect(lines[1][8].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.json', 'source.json']);
      expect(lines[2][0]).toEqual({value: 'JSON', scopes: ['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.json', 'punctuation.section.embedded.end.php', 'keyword.operator.heredoc.php']});
      return expect(lines[2][1]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});});
});

  it('should tokenize a nowdoc with embedded json correctly', function() {
    waitsForPromise(() => atom.packages.activatePackage('language-json'));

    return runs(function() {
      const lines = grammar.tokenizeLines(`\
$a = <<<'JSON'
{"a" : 1}
JSON;\
`
      );

      expect(lines[0][0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
      expect(lines[0][1]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
      expect(lines[0][2]).toEqual({value: ' ', scopes: ['source.php']});
      expect(lines[0][3]).toEqual({value: '=', scopes: ['source.php', 'keyword.operator.assignment.php']});
      expect(lines[0][4]).toEqual({value: ' ', scopes: ['source.php']});
      expect(lines[0][5]).toEqual({value: '<<<', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.json', 'punctuation.section.embedded.begin.php', 'punctuation.definition.string.php']});
      expect(lines[0][6]).toEqual({value: '\'', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.json', 'punctuation.section.embedded.begin.php']});
      expect(lines[0][7]).toEqual({value: 'JSON', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.json', 'punctuation.section.embedded.begin.php', 'keyword.operator.nowdoc.php']});
      expect(lines[0][8]).toEqual({value: '\'', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.json', 'punctuation.section.embedded.begin.php']});
      expect(lines[1][0].value).toEqual('{');
      expect(lines[1][0].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.json', 'source.json']);
      expect(lines[1][1].value).toEqual('"');
      expect(lines[1][1].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.json', 'source.json']);
      expect(lines[1][2].value).toEqual('a');
      expect(lines[1][2].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.json', 'source.json']);
      expect(lines[1][3].value).toEqual('"');
      expect(lines[1][3].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.json', 'source.json']);
      expect(lines[1][4].value).toEqual(' ');
      expect(lines[1][4].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.json', 'source.json']);
      expect(lines[1][5].value).toEqual(':');
      expect(lines[1][5].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.json', 'source.json']);
      expect(lines[1][6].value).toEqual(' ');
      expect(lines[1][6].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.json', 'source.json']);
      expect(lines[1][7].value).toEqual('1');
      expect(lines[1][7].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.json', 'source.json']);
      expect(lines[1][8].value).toEqual('}');
      expect(lines[1][8].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.json', 'source.json']);
      expect(lines[2][0]).toEqual({value: 'JSON', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.json', 'punctuation.section.embedded.end.php', 'keyword.operator.nowdoc.php']});
      return expect(lines[2][1]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});});
});

  it('should tokenize a heredoc with embedded css correctly', function() {
    waitsForPromise(() => atom.packages.activatePackage('language-css'));

    return runs(function() {
      const lines = grammar.tokenizeLines(`\
$a = <<<CSS
body{}
CSS;\
`
      );

      expect(lines[0][0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
      expect(lines[0][1]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
      expect(lines[0][2]).toEqual({value: ' ', scopes: ['source.php']});
      expect(lines[0][3]).toEqual({value: '=', scopes: ['source.php', 'keyword.operator.assignment.php']});
      expect(lines[0][4]).toEqual({value: ' ', scopes: ['source.php']});
      expect(lines[0][5]).toEqual({value: '<<<', scopes: ['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.css', 'punctuation.section.embedded.begin.php', 'punctuation.definition.string.php']});
      expect(lines[0][6]).toEqual({value: 'CSS', scopes: ['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.css', 'punctuation.section.embedded.begin.php', 'keyword.operator.heredoc.php']});
      expect(lines[1][0].value).toEqual('body');
      expect(lines[1][0].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.css', 'source.css']);
      expect(lines[1][1].value).toEqual('{');
      expect(lines[1][1].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.css', 'source.css']);
      expect(lines[1][2].value).toEqual('}');
      expect(lines[1][2].scopes).toContainAll(['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.css', 'source.css']);
      expect(lines[2][0]).toEqual({value: 'CSS', scopes: ['source.php', 'string.unquoted.heredoc.php', 'meta.embedded.css', 'punctuation.section.embedded.end.php', 'keyword.operator.heredoc.php']});
      return expect(lines[2][1]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});});
});

  it('should tokenize a nowdoc with embedded css correctly', function() {
    waitsForPromise(() => atom.packages.activatePackage('language-css'));

    return runs(function() {
      const lines = grammar.tokenizeLines(`\
$a = <<<'CSS'
body{}
CSS;\
`
      );

      expect(lines[0][0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
      expect(lines[0][1]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
      expect(lines[0][2]).toEqual({value: ' ', scopes: ['source.php']});
      expect(lines[0][3]).toEqual({value: '=', scopes: ['source.php', 'keyword.operator.assignment.php']});
      expect(lines[0][4]).toEqual({value: ' ', scopes: ['source.php']});
      expect(lines[0][5]).toEqual({value: '<<<', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.css', 'punctuation.section.embedded.begin.php', 'punctuation.definition.string.php']});
      expect(lines[0][6]).toEqual({value: '\'', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.css', 'punctuation.section.embedded.begin.php']});
      expect(lines[0][7]).toEqual({value: 'CSS', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.css', 'punctuation.section.embedded.begin.php', 'keyword.operator.nowdoc.php']});
      expect(lines[0][8]).toEqual({value: '\'', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.css', 'punctuation.section.embedded.begin.php']});
      expect(lines[1][0].value).toEqual('body');
      expect(lines[1][0].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.css', 'source.css']);
      expect(lines[1][1].value).toEqual('{');
      expect(lines[1][1].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.css', 'source.css']);
      expect(lines[1][2].value).toEqual('}');
      expect(lines[1][2].scopes).toContainAll(['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.css', 'source.css']);
      expect(lines[2][0]).toEqual({value: 'CSS', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'meta.embedded.css', 'punctuation.section.embedded.end.php', 'keyword.operator.nowdoc.php']});
      return expect(lines[2][1]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});});
});

  it('should tokenize a heredoc with embedded regex escaped bracket correctly', function() {
    const lines = grammar.tokenizeLines(`\
$a = <<<REGEX
/\\[/
REGEX;\
`
    );

    expect(lines[0][0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
    expect(lines[0][1]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
    expect(lines[0][2]).toEqual({value: ' ', scopes: ['source.php']});
    expect(lines[0][3]).toEqual({value: '=', scopes: ['source.php', 'keyword.operator.assignment.php']});
    expect(lines[0][4]).toEqual({value: ' ', scopes: ['source.php']});
    expect(lines[0][5]).toEqual({value: '<<<', scopes: ['source.php', 'string.unquoted.heredoc.php', 'punctuation.section.embedded.begin.php', 'punctuation.definition.string.php']});
    expect(lines[0][6]).toEqual({value: 'REGEX', scopes: ['source.php', 'string.unquoted.heredoc.php', 'punctuation.section.embedded.begin.php', 'keyword.operator.heredoc.php']});
    expect(lines[1][0]).toEqual({value: '/', scopes: ['source.php', 'string.unquoted.heredoc.php', 'string.regexp.heredoc.php']});
    expect(lines[1][1]).toEqual({value: '\\[', scopes: ['source.php', 'string.unquoted.heredoc.php', 'string.regexp.heredoc.php', 'constant.character.escape.regex.php']});
    expect(lines[1][2]).toEqual({value: '/', scopes: ['source.php', 'string.unquoted.heredoc.php', 'string.regexp.heredoc.php']});
    expect(lines[2][0]).toEqual({value: 'REGEX', scopes: ['source.php', 'string.unquoted.heredoc.php', 'punctuation.section.embedded.end.php', 'keyword.operator.heredoc.php']});
    return expect(lines[2][1]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
});

  it('should tokenize a nowdoc with embedded regex escape characters correctly', function() {
    const lines = grammar.tokenizeLines(`\
$a = <<<'REGEX'
/[\\\\\\\\]/
REGEX;\
`
    );

    expect(lines[0][0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
    expect(lines[0][1]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
    expect(lines[0][2]).toEqual({value: ' ', scopes: ['source.php']});
    expect(lines[0][3]).toEqual({value: '=', scopes: ['source.php', 'keyword.operator.assignment.php']});
    expect(lines[0][4]).toEqual({value: ' ', scopes: ['source.php']});
    expect(lines[0][5]).toEqual({value: '<<<', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'punctuation.section.embedded.begin.php', 'punctuation.definition.string.php']});
    expect(lines[0][6]).toEqual({value: '\'', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'punctuation.section.embedded.begin.php']});
    expect(lines[0][7]).toEqual({value: 'REGEX', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'punctuation.section.embedded.begin.php', 'keyword.operator.nowdoc.php']});
    expect(lines[0][8]).toEqual({value: '\'', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'punctuation.section.embedded.begin.php']});
    expect(lines[1][0]).toEqual({value: '/', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'string.regexp.nowdoc.php']});
    expect(lines[1][1]).toEqual({value: '[', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'string.regexp.nowdoc.php', 'string.regexp.character-class.php', 'punctuation.definition.character-class.php']});
    expect(lines[1][2]).toEqual({value: '\\\\', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'string.regexp.nowdoc.php', 'string.regexp.character-class.php', 'constant.character.escape.php']});
    expect(lines[1][3]).toEqual({value: '\\\\', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'string.regexp.nowdoc.php', 'string.regexp.character-class.php', 'constant.character.escape.php']});
    expect(lines[1][4]).toEqual({value: ']', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'string.regexp.nowdoc.php', 'string.regexp.character-class.php', 'punctuation.definition.character-class.php']});
    expect(lines[1][5]).toEqual({value: '/', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'string.regexp.nowdoc.php']});
    expect(lines[2][0]).toEqual({value: 'REGEX', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'punctuation.section.embedded.end.php', 'keyword.operator.nowdoc.php']});
    return expect(lines[2][1]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
});

  it('should tokenize a nowdoc with embedded regex escaped bracket correctly', function() {
    const lines = grammar.tokenizeLines(`\
$a = <<<'REGEX'
/\\[/
REGEX;\
`
    );

    expect(lines[0][0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
    expect(lines[0][1]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
    expect(lines[0][2]).toEqual({value: ' ', scopes: ['source.php']});
    expect(lines[0][3]).toEqual({value: '=', scopes: ['source.php', 'keyword.operator.assignment.php']});
    expect(lines[0][4]).toEqual({value: ' ', scopes: ['source.php']});
    expect(lines[0][5]).toEqual({value: '<<<', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'punctuation.section.embedded.begin.php', 'punctuation.definition.string.php']});
    expect(lines[0][6]).toEqual({value: '\'', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'punctuation.section.embedded.begin.php']});
    expect(lines[0][7]).toEqual({value: 'REGEX', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'punctuation.section.embedded.begin.php', 'keyword.operator.nowdoc.php']});
    expect(lines[0][8]).toEqual({value: '\'', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'punctuation.section.embedded.begin.php']});
    expect(lines[1][0]).toEqual({value: '/', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'string.regexp.nowdoc.php']});
    expect(lines[1][1]).toEqual({value: '\\[', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'string.regexp.nowdoc.php', 'constant.character.escape.regex.php']});
    expect(lines[1][2]).toEqual({value: '/', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'string.regexp.nowdoc.php']});
    expect(lines[2][0]).toEqual({value: 'REGEX', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'punctuation.section.embedded.end.php', 'keyword.operator.nowdoc.php']});
    return expect(lines[2][1]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
});

  it('should tokenize a heredoc with embedded regex escape characters correctly', function() {
    const lines = grammar.tokenizeLines(`\
$a = <<<REGEXP
/[\\\\\\\\]/
REGEXP;\
`
    );

    expect(lines[0][0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
    expect(lines[0][1]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
    expect(lines[0][2]).toEqual({value: ' ', scopes: ['source.php']});
    expect(lines[0][3]).toEqual({value: '=', scopes: ['source.php', 'keyword.operator.assignment.php']});
    expect(lines[0][4]).toEqual({value: ' ', scopes: ['source.php']});
    expect(lines[0][5]).toEqual({value: '<<<', scopes: ['source.php', 'string.unquoted.heredoc.php', 'punctuation.section.embedded.begin.php', 'punctuation.definition.string.php']});
    expect(lines[0][6]).toEqual({value: 'REGEXP', scopes: ['source.php', 'string.unquoted.heredoc.php', 'punctuation.section.embedded.begin.php', 'keyword.operator.heredoc.php']});
    expect(lines[1][0]).toEqual({value: '/', scopes: ['source.php', 'string.unquoted.heredoc.php', 'string.regexp.heredoc.php']});
    expect(lines[1][1]).toEqual({value: '[', scopes: ['source.php', 'string.unquoted.heredoc.php', 'string.regexp.heredoc.php', 'string.regexp.character-class.php', 'punctuation.definition.character-class.php']});
    expect(lines[1][2]).toEqual({value: '\\\\', scopes: ['source.php', 'string.unquoted.heredoc.php', 'string.regexp.heredoc.php', 'string.regexp.character-class.php', 'constant.character.escape.php']});
    expect(lines[1][3]).toEqual({value: '\\\\', scopes: ['source.php', 'string.unquoted.heredoc.php', 'string.regexp.heredoc.php', 'string.regexp.character-class.php', 'constant.character.escape.php']});
    expect(lines[1][4]).toEqual({value: ']', scopes: ['source.php', 'string.unquoted.heredoc.php', 'string.regexp.heredoc.php', 'string.regexp.character-class.php', 'punctuation.definition.character-class.php']});
    expect(lines[1][5]).toEqual({value: '/', scopes: ['source.php', 'string.unquoted.heredoc.php', 'string.regexp.heredoc.php']});
    expect(lines[2][0]).toEqual({value: 'REGEXP', scopes: ['source.php', 'string.unquoted.heredoc.php', 'punctuation.section.embedded.end.php', 'keyword.operator.heredoc.php']});
    return expect(lines[2][1]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
});

  it('should tokenize a heredoc with embedded regex escaped bracket correctly', function() {
    const lines = grammar.tokenizeLines(`\
$a = <<<REGEXP
/\\[/
REGEXP;\
`
    );

    expect(lines[0][0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
    expect(lines[0][1]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
    expect(lines[0][2]).toEqual({value: ' ', scopes: ['source.php']});
    expect(lines[0][3]).toEqual({value: '=', scopes: ['source.php', 'keyword.operator.assignment.php']});
    expect(lines[0][4]).toEqual({value: ' ', scopes: ['source.php']});
    expect(lines[0][5]).toEqual({value: '<<<', scopes: ['source.php', 'string.unquoted.heredoc.php', 'punctuation.section.embedded.begin.php', 'punctuation.definition.string.php']});
    expect(lines[0][6]).toEqual({value: 'REGEXP', scopes: ['source.php', 'string.unquoted.heredoc.php', 'punctuation.section.embedded.begin.php', 'keyword.operator.heredoc.php']});
    expect(lines[1][0]).toEqual({value: '/', scopes: ['source.php', 'string.unquoted.heredoc.php', 'string.regexp.heredoc.php']});
    expect(lines[1][1]).toEqual({value: '\\[', scopes: ['source.php', 'string.unquoted.heredoc.php', 'string.regexp.heredoc.php', 'constant.character.escape.regex.php']});
    expect(lines[1][2]).toEqual({value: '/', scopes: ['source.php', 'string.unquoted.heredoc.php', 'string.regexp.heredoc.php']});
    expect(lines[2][0]).toEqual({value: 'REGEXP', scopes: ['source.php', 'string.unquoted.heredoc.php', 'punctuation.section.embedded.end.php', 'keyword.operator.heredoc.php']});
    return expect(lines[2][1]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
});

  it('should tokenize a nowdoc with embedded regex escape characters correctly', function() {
    const lines = grammar.tokenizeLines(`\
$a = <<<'REGEXP'
/[\\\\\\\\]/
REGEXP;\
`
    );

    expect(lines[0][0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
    expect(lines[0][1]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
    expect(lines[0][2]).toEqual({value: ' ', scopes: ['source.php']});
    expect(lines[0][3]).toEqual({value: '=', scopes: ['source.php', 'keyword.operator.assignment.php']});
    expect(lines[0][4]).toEqual({value: ' ', scopes: ['source.php']});
    expect(lines[0][5]).toEqual({value: '<<<', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'punctuation.section.embedded.begin.php', 'punctuation.definition.string.php']});
    expect(lines[0][6]).toEqual({value: '\'', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'punctuation.section.embedded.begin.php']});
    expect(lines[0][7]).toEqual({value: 'REGEXP', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'punctuation.section.embedded.begin.php', 'keyword.operator.nowdoc.php']});
    expect(lines[0][8]).toEqual({value: '\'', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'punctuation.section.embedded.begin.php']});
    expect(lines[1][0]).toEqual({value: '/', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'string.regexp.nowdoc.php']});
    expect(lines[1][1]).toEqual({value: '[', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'string.regexp.nowdoc.php', 'string.regexp.character-class.php', 'punctuation.definition.character-class.php']});
    expect(lines[1][2]).toEqual({value: '\\\\', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'string.regexp.nowdoc.php', 'string.regexp.character-class.php', 'constant.character.escape.php']});
    expect(lines[1][3]).toEqual({value: '\\\\', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'string.regexp.nowdoc.php', 'string.regexp.character-class.php', 'constant.character.escape.php']});
    expect(lines[1][4]).toEqual({value: ']', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'string.regexp.nowdoc.php', 'string.regexp.character-class.php', 'punctuation.definition.character-class.php']});
    expect(lines[1][5]).toEqual({value: '/', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'string.regexp.nowdoc.php']});
    expect(lines[2][0]).toEqual({value: 'REGEXP', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'punctuation.section.embedded.end.php', 'keyword.operator.nowdoc.php']});
    return expect(lines[2][1]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
});

  it('should tokenize a nowdoc with embedded regex escaped bracket correctly', function() {
    const lines = grammar.tokenizeLines(`\
$a = <<<'REGEXP'
/\\[/
REGEXP;\
`
    );

    expect(lines[0][0]).toEqual({value: '$', scopes: ['source.php', 'variable.other.php', 'punctuation.definition.variable.php']});
    expect(lines[0][1]).toEqual({value: 'a', scopes: ['source.php', 'variable.other.php']});
    expect(lines[0][2]).toEqual({value: ' ', scopes: ['source.php']});
    expect(lines[0][3]).toEqual({value: '=', scopes: ['source.php', 'keyword.operator.assignment.php']});
    expect(lines[0][4]).toEqual({value: ' ', scopes: ['source.php']});
    expect(lines[0][5]).toEqual({value: '<<<', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'punctuation.section.embedded.begin.php', 'punctuation.definition.string.php']});
    expect(lines[0][6]).toEqual({value: '\'', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'punctuation.section.embedded.begin.php']});
    expect(lines[0][7]).toEqual({value: 'REGEXP', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'punctuation.section.embedded.begin.php', 'keyword.operator.nowdoc.php']});
    expect(lines[0][8]).toEqual({value: '\'', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'punctuation.section.embedded.begin.php']});
    expect(lines[1][0]).toEqual({value: '/', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'string.regexp.nowdoc.php']});
    expect(lines[1][1]).toEqual({value: '\\[', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'string.regexp.nowdoc.php', 'constant.character.escape.regex.php']});
    expect(lines[1][2]).toEqual({value: '/', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'string.regexp.nowdoc.php']});
    expect(lines[2][0]).toEqual({value: 'REGEXP', scopes: ['source.php', 'string.unquoted.nowdoc.php', 'punctuation.section.embedded.end.php', 'keyword.operator.nowdoc.php']});
    return expect(lines[2][1]).toEqual({value: ';', scopes: ['source.php', 'punctuation.terminator.expression.php']});
});

  return describe('punctuation', function() {
    it('tokenizes brackets', function() {
      let {tokens} = grammar.tokenizeLine('{}');

      expect(tokens[0]).toEqual({value: '{', scopes: ['source.php', 'punctuation.definition.begin.bracket.curly.php']});
      expect(tokens[1]).toEqual({value: '}', scopes: ['source.php', 'punctuation.definition.end.bracket.curly.php']});

      ({tokens} = grammar.tokenizeLine('{/* stuff */}'));

      expect(tokens[0]).toEqual({value: '{', scopes: ['source.php', 'punctuation.definition.begin.bracket.curly.php']});
      expect(tokens[4]).toEqual({value: '}', scopes: ['source.php', 'punctuation.definition.end.bracket.curly.php']});

      // Make sure that nested brackets close correctly
      const lines = grammar.tokenizeLines(`\
class Test {
  {}
}\
`
      );

      expect(lines[0][4]).toEqual({value: '{', scopes: ['source.php', 'meta.class.php', 'punctuation.definition.class.begin.bracket.curly.php']});
      expect(lines[1][1]).toEqual({value: '{', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'punctuation.definition.begin.bracket.curly.php']});
      expect(lines[1][2]).toEqual({value: '}', scopes: ['source.php', 'meta.class.php', 'meta.class.body.php', 'punctuation.definition.end.bracket.curly.php']});
      return expect(lines[2][0]).toEqual({value: '}', scopes: ['source.php', 'meta.class.php', 'punctuation.definition.class.end.bracket.curly.php']});
  });

    return it('tokenizes parentheses', function() {
      let {tokens} = grammar.tokenizeLine('()');

      expect(tokens[0]).toEqual({value: '(', scopes: ['source.php', 'punctuation.definition.begin.bracket.round.php']});
      expect(tokens[1]).toEqual({value: ')', scopes: ['source.php', 'punctuation.definition.end.bracket.round.php']});

      ({tokens} = grammar.tokenizeLine('(/* stuff */)'));

      expect(tokens[0]).toEqual({value: '(', scopes: ['source.php', 'punctuation.definition.begin.bracket.round.php']});
      return expect(tokens[4]).toEqual({value: ')', scopes: ['source.php', 'punctuation.definition.end.bracket.round.php']});
  });
});
});

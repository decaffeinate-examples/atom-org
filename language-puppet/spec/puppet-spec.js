/** @babel */
/* eslint-disable
    no-return-assign,
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
describe('Puppet grammar', function () {
  let grammar = null

  beforeEach(function () {
    waitsForPromise(() => atom.packages.activatePackage('language-puppet'))

    return runs(() => grammar = atom.grammars.grammarForScopeName('source.puppet'))
  })

  it('parses the grammar', function () {
    expect(grammar).toBeTruthy()
    return expect(grammar.scopeName).toBe('source.puppet')
  })

  describe('separators', function () {
    it('tokenizes attribute separator', function () {
      const { tokens } = grammar.tokenizeLine('ensure => present')
      return expect(tokens[1]).toEqual({ value: '=>', scopes: ['source.puppet', 'punctuation.separator.key-value.puppet'] })
    })

    return it('tokenizes attribute separator with string values', function () {
      const { tokens } = grammar.tokenizeLine('ensure => "present"')
      return expect(tokens[1]).toEqual({ value: '=>', scopes: ['source.puppet', 'punctuation.separator.key-value.puppet'] })
    })
  })

  return describe('blocks', function () {
    it('tokenizes single quoted node', function () {
      const { tokens } = grammar.tokenizeLine("node 'hostname' {")
      return expect(tokens[0]).toEqual({ value: 'node', scopes: ['source.puppet', 'meta.definition.class.puppet', 'storage.type.puppet'] })
    })

    it('tokenizes double quoted node', function () {
      const { tokens } = grammar.tokenizeLine('node "hostname" {')
      return expect(tokens[0]).toEqual({ value: 'node', scopes: ['source.puppet', 'meta.definition.class.puppet', 'storage.type.puppet'] })
    })

    it('tokenizes non-default class parameters', function () {
      const { tokens } = grammar.tokenizeLine('class "classname" ($myvar) {')
      expect(tokens[5]).toEqual({ value: '$', scopes: ['source.puppet', 'meta.definition.class.puppet', 'meta.function.argument.no-default.untyped.puppet', 'variable.other.puppet', 'punctuation.definition.variable.puppet'] })
      return expect(tokens[6]).toEqual({ value: 'myvar', scopes: ['source.puppet', 'meta.definition.class.puppet', 'meta.function.argument.no-default.untyped.puppet', 'variable.other.puppet'] })
    })

    it('tokenizes default class parameters', function () {
      const { tokens } = grammar.tokenizeLine('class "classname" ($myvar = "myval") {')
      expect(tokens[5]).toEqual({ value: '$', scopes: ['source.puppet', 'meta.definition.class.puppet', 'meta.function.argument.default.untyped.puppet', 'variable.other.puppet', 'punctuation.definition.variable.puppet'] })
      return expect(tokens[6]).toEqual({ value: 'myvar', scopes: ['source.puppet', 'meta.definition.class.puppet', 'meta.function.argument.default.untyped.puppet', 'variable.other.puppet'] })
    })

    it('tokenizes non-default class parameter types', function () {
      const { tokens } = grammar.tokenizeLine('class "classname" (String $myvar) {')
      return expect(tokens[5]).toEqual({ value: 'String', scopes: ['source.puppet', 'meta.definition.class.puppet', 'meta.function.argument.no-default.typed.puppet', 'storage.type.puppet'] })
    })

    it('tokenizes default class parameter types', function () {
      const { tokens } = grammar.tokenizeLine('class "classname" (String $myvar = "myval") {')
      return expect(tokens[5]).toEqual({ value: 'String', scopes: ['source.puppet', 'meta.definition.class.puppet', 'meta.function.argument.default.typed.puppet', 'storage.type.puppet'] })
    })

    it('tokenizes include as an include function', function () {
      const { tokens } = grammar.tokenizeLine('contain foo')
      return expect(tokens[0]).toEqual({ value: 'contain', scopes: ['source.puppet', 'meta.include.puppet', 'keyword.control.import.include.puppet'] })
    })

    it('tokenizes contain as an include function', function () {
      const { tokens } = grammar.tokenizeLine('include foo')
      return expect(tokens[0]).toEqual({ value: 'include', scopes: ['source.puppet', 'meta.include.puppet', 'keyword.control.import.include.puppet'] })
    })

    it('tokenizes resource type and string title', function () {
      const { tokens } = grammar.tokenizeLine("package {'foo':}")
      expect(tokens[0]).toEqual({ value: 'package', scopes: ['source.puppet', 'meta.definition.resource.puppet', 'storage.type.puppet'] })
      return expect(tokens[2]).toEqual({ value: "'foo'", scopes: ['source.puppet', 'meta.definition.resource.puppet', 'entity.name.section.puppet'] })
    })

    it('tokenizes resource type and variable title', function () {
      const { tokens } = grammar.tokenizeLine('package {$foo:}')
      expect(tokens[0]).toEqual({ value: 'package', scopes: ['source.puppet', 'meta.definition.resource.puppet', 'storage.type.puppet'] })
      return expect(tokens[2]).toEqual({ value: '$foo', scopes: ['source.puppet', 'meta.definition.resource.puppet', 'entity.name.section.puppet'] })
    })

    it('tokenizes require classname as an include', function () {
      const { tokens } = grammar.tokenizeLine('require ::foo')
      return expect(tokens[0]).toEqual({ value: 'require', scopes: ['source.puppet', 'meta.include.puppet', 'keyword.control.import.include.puppet'] })
    })

    it('tokenizes require => variable as a parameter', function () {
      const { tokens } = grammar.tokenizeLine("require => Class['foo']")
      return expect(tokens[0]).toEqual({ value: 'require ', scopes: ['source.puppet', 'constant.other.key.puppet'] })
    })

    it('tokenizes regular variables', function () {
      let { tokens } = grammar.tokenizeLine('$foo')
      expect(tokens[0]).toEqual({ value: '$', scopes: ['source.puppet', 'variable.other.readwrite.global.puppet', 'punctuation.definition.variable.puppet'] })
      expect(tokens[1]).toEqual({ value: 'foo', scopes: ['source.puppet', 'variable.other.readwrite.global.puppet'] });

      ({ tokens } = grammar.tokenizeLine('$_foo'))
      expect(tokens[0]).toEqual({ value: '$', scopes: ['source.puppet', 'variable.other.readwrite.global.puppet', 'punctuation.definition.variable.puppet'] })
      expect(tokens[1]).toEqual({ value: '_foo', scopes: ['source.puppet', 'variable.other.readwrite.global.puppet'] });

      ({ tokens } = grammar.tokenizeLine('$_foo_'))
      expect(tokens[0]).toEqual({ value: '$', scopes: ['source.puppet', 'variable.other.readwrite.global.puppet', 'punctuation.definition.variable.puppet'] })
      expect(tokens[1]).toEqual({ value: '_foo_', scopes: ['source.puppet', 'variable.other.readwrite.global.puppet'] });

      ({ tokens } = grammar.tokenizeLine('$::foo'))
      expect(tokens[0]).toEqual({ value: '$', scopes: ['source.puppet', 'variable.other.readwrite.global.puppet', 'punctuation.definition.variable.puppet'] })
      return expect(tokens[1]).toEqual({ value: '::foo', scopes: ['source.puppet', 'variable.other.readwrite.global.puppet'] })
    })

    return it('tokenizes resource types correctly', function () {
      let { tokens } = grammar.tokenizeLine("file {'/var/tmp':}")
      expect(tokens[0]).toEqual({ value: 'file', scopes: ['source.puppet', 'meta.definition.resource.puppet', 'storage.type.puppet'] });

      ({ tokens } = grammar.tokenizeLine("package {'foo':}"))
      return expect(tokens[0]).toEqual({ value: 'package', scopes: ['source.puppet', 'meta.definition.resource.puppet', 'storage.type.puppet'] })
    })
  })
})

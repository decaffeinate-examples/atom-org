/** @babel */
/* eslint-disable
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
describe('Language C# package', function () {
  beforeEach(() => waitsForPromise(() => atom.packages.activatePackage('language-csharp')))

  describe('C# Script grammar', () => it('parses the grammar', function () {
    const grammar = atom.grammars.grammarForScopeName('source.csx')
    expect(grammar).toBeDefined()
    return expect(grammar.scopeName).toBe('source.csx')
  }))

  return describe('C# Cake grammar', () => it('parses the grammar', function () {
    const grammar = atom.grammars.grammarForScopeName('source.cake')
    expect(grammar).toBeDefined()
    return expect(grammar.scopeName).toBe('source.cake')
  }))
})

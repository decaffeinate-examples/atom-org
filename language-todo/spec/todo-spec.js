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
describe('TODO grammar', function () {
  let grammar = null

  beforeEach(function () {
    waitsForPromise(() => atom.packages.activatePackage('language-todo'))

    return runs(() => grammar = atom.grammars.grammarForScopeName('text.todo'))
  })

  return it('parses the grammar', function () {
    expect(grammar).toBeTruthy()
    return expect(grammar.scopeName).toBe('text.todo')
  })
})

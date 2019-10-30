/** @babel */
/* eslint-disable
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Public: The base class for all nodes.
//
let Node
module.exports = (Node = class Node {
  // Public: Find an ancestor node by type.
  //
  // type - The type name (a {String})
  // node - The CoffeeScript node to search on (a {Base})
  findAncestor (type, node) {
    if (node == null) {
      ({
        node
      } = this)
    }
    if (node.ancestor) {
      if (node.ancestor.constructor.name === type) {
        return node.ancestor
      } else {
        return this.findAncestor(type, node.ancestor)
      }
    } else {
      return undefined
    }
  }
})

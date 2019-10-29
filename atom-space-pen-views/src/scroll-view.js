/** @babel */
/* eslint-disable
    no-undef,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ScrollView
const { View } = require('space-pen')

// Extended: Represents a view that scrolls.
//
// Handles several core events to update scroll position:
//
// * `core:move-up` Scrolls the view up
// * `core:move-down` Scrolls the view down
// * `core:page-up` Scrolls the view up by the height of the page
// * `core:page-down` Scrolls the view down by the height of the page
// * `core:move-to-top` Scrolls the editor to the top
// * `core:move-to-bottom` Scroll the editor to the bottom
//
// Subclasses must call `super` if overriding the `initialize` method.
//
// ## Examples
//
// ```coffee
// {ScrollView} = require 'atom'
//
// class MyView extends ScrollView
//   @content: ->
//     @div()
//
//   initialize: ->
//     super
//     @text('super long content that will scroll')
// ```
//
module.exports =
(ScrollView = class ScrollView extends View {
  initialize () {
    return atom.commands.add(this.element, {
      'core:move-up': () => this.scrollUp(),
      'core:move-down': () => this.scrollDown(),
      'core:page-up': () => this.pageUp(),
      'core:page-down': () => this.pageDown(),
      'core:move-to-top': () => this.scrollToTop(),
      'core:move-to-bottom': () => this.scrollToBottom()
    }
    )
  }
})

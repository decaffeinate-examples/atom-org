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
 * DS202: Simplify dynamic range loops
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let SelectListView
const { $, View } = require('space-pen')
const TextEditorView = require('./text-editor-view')

let fuzzyFilter = null // defer until used

atom.themes.requireStylesheet(require.resolve('../stylesheets/select-list.less'))

module.exports =
(SelectListView = (function () {
  SelectListView = class SelectListView extends View {
    static initClass () {
      this.prototype.maxItems = Infinity
      this.prototype.scheduleTimeout = null
      this.prototype.inputThrottle = 50
      this.prototype.cancelling = false
    }

    static content () {
      return this.div({ class: 'select-list' }, () => {
        this.subview('filterEditorView', new TextEditorView({ mini: true }))
        this.div({ class: 'error-message', outlet: 'error' })
        this.div({ class: 'loading', outlet: 'loadingArea' }, () => {
          this.span({ class: 'loading-message', outlet: 'loading' })
          return this.span({ class: 'badge', outlet: 'loadingBadge' })
        })
        return this.ol({ class: 'list-group', outlet: 'list' })
      })
    }

    /*
    Section: Construction
    */

    // Essential: Initialize the select list view.
    //
    // This method can be overridden by subclasses but `super` should always
    // be called.
    initialize () {
      this.filterEditorView.getModel().getBuffer().onDidChange(() => {
        return this.schedulePopulateList()
      })

      this.filterEditorView.on('blur', e => {
        if (!this.cancelling && !!document.hasFocus()) { return this.cancel() }
      })

      atom.commands.add(this.element, {
        'core:move-up': event => {
          this.selectPreviousItemView()
          return event.stopPropagation()
        },

        'core:move-down': event => {
          this.selectNextItemView()
          return event.stopPropagation()
        },

        'core:move-to-top': event => {
          this.selectItemView(this.list.find('li:first'))
          this.list.scrollToTop()
          return event.stopPropagation()
        },

        'core:move-to-bottom': event => {
          this.selectItemView(this.list.find('li:last'))
          this.list.scrollToBottom()
          return event.stopPropagation()
        },

        'core:confirm': event => {
          this.confirmSelection()
          return event.stopPropagation()
        },

        'core:cancel': event => {
          this.cancel()
          return event.stopPropagation()
        }
      }
      )

      // This prevents the focusout event from firing on the filter editor view
      // when the list is scrolled by clicking the scrollbar and dragging.
      this.list.on('mousedown', ({ target }) => {
        if (target === this.list[0]) { return false }
      })

      this.list.on('mousedown', 'li', e => {
        this.selectItemView($(e.target).closest('li'))
        e.preventDefault()
        return false
      })

      return this.list.on('mouseup', 'li', e => {
        if ($(e.target).closest('li').hasClass('selected')) { this.confirmSelection() }
        e.preventDefault()
        return false
      })
    }

    /*
    Section: Methods that must be overridden
    */

    // Essential: Create a view for the given model item.
    //
    // This method must be overridden by subclasses.
    //
    // This is called when the item is about to appended to the list view.
    //
    // * `item` The model item being rendered. This will always be one of the items
    //   previously passed to {::setItems}.
    //
    // Returns a String of HTML, DOM element, jQuery object, or View.
    viewForItem (item) {
      throw new Error('Subclass must implement a viewForItem(item) method')
    }

    // Essential: Callback function for when an item is selected.
    //
    // This method must be overridden by subclasses.
    //
    // * `item` The selected model item. This will always be one of the items
    //   previously passed to {::setItems}.
    //
    // Returns a DOM element, jQuery object, or {View}.
    confirmed (item) {
      throw new Error('Subclass must implement a confirmed(item) method')
    }

    /*
    Section: Managing the list of items
    */

    // Essential: Set the array of items to display in the list.
    //
    // This should be model items not actual views. {::viewForItem} will be
    // called to render the item when it is being appended to the list view.
    //
    // * `items` The {Array} of model items to display in the list (default: []).
    setItems (items) {
      if (items == null) { items = [] }
      this.items = items
      this.populateList()
      return this.setLoading()
    }

    // Essential: Get the model item that is currently selected in the list view.
    //
    // Returns a model item.
    getSelectedItem () {
      return this.getSelectedItemView().data('select-list-item')
    }

    // Extended: Get the property name to use when filtering items.
    //
    // This method may be overridden by classes to allow fuzzy filtering based
    // on a specific property of the item objects.
    //
    // For example if the objects you pass to {::setItems} are of the type
    // `{"id": 3, "name": "Atom"}` then you would return `"name"` from this method
    // to fuzzy filter by that property when text is entered into this view's
    // editor.
    //
    // Returns the property name to fuzzy filter by.
    getFilterKey () {}

    // Extended: Get the filter query to use when fuzzy filtering the visible
    // elements.
    //
    // By default this method returns the text in the mini editor but it can be
    // overridden by subclasses if needed.
    //
    // Returns a {String} to use when fuzzy filtering the elements to display.
    getFilterQuery () {
      return this.filterEditorView.getText()
    }

    // Extended: Set the maximum numbers of items to display in the list.
    //
    // * `maxItems` The maximum {Number} of items to display.
    setMaxItems (maxItems) {
      this.maxItems = maxItems
    }

    // Extended: Populate the list view with the model items previously set by
    // calling {::setItems}.
    //
    // Subclasses may override this method but should always call `super`.
    populateList () {
      let filteredItems
      if (this.items == null) { return }

      const filterQuery = this.getFilterQuery()
      if (filterQuery.length) {
        if (fuzzyFilter == null) { fuzzyFilter = require('fuzzaldrin').filter }
        filteredItems = fuzzyFilter(this.items, filterQuery, { key: this.getFilterKey() })
      } else {
        filteredItems = this.items
      }

      this.list.empty()
      if (filteredItems.length) {
        this.setError(null)

        for (let i = 0, end = Math.min(filteredItems.length, this.maxItems), asc = end >= 0; asc ? i < end : i > end; asc ? i++ : i--) {
          const item = filteredItems[i]
          const itemView = $(this.viewForItem(item))
          itemView.data('select-list-item', item)
          this.list.append(itemView)
        }

        return this.selectItemView(this.list.find('li:first'))
      } else {
        return this.setError(this.getEmptyMessage(this.items.length, filteredItems.length))
      }
    }

    /*
    Section: Messages to the user
    */

    // Essential: Set the error message to display.
    //
    // * `message` The {String} error message (default: '').
    setError (message) {
      if (message == null) { message = '' }
      if (message.length === 0) {
        return this.error.text('').hide()
      } else {
        this.setLoading()
        return this.error.text(message).show()
      }
    }

    // Essential: Set the loading message to display.
    //
    // * `message` The {String} loading message (default: '').
    setLoading (message) {
      if (message == null) { message = '' }
      if (message.length === 0) {
        this.loading.text('')
        this.loadingBadge.text('')
        return this.loadingArea.hide()
      } else {
        this.setError()
        this.loading.text(message)
        return this.loadingArea.show()
      }
    }

    // Extended: Get the message to display when there are no items.
    //
    // Subclasses may override this method to customize the message.
    //
    // * `itemCount` The {Number} of items in the array specified to {::setItems}
    // * `filteredItemCount` The {Number} of items that pass the fuzzy filter test.
    //
    // Returns a {String} message (default: 'No matches found').
    getEmptyMessage (itemCount, filteredItemCount) { return 'No matches found' }

    /*
    Section: View Actions
    */

    // Essential: Cancel and close this select list view.
    //
    // This restores focus to the previously focused element if
    // {::storeFocusedElement} was called prior to this view being attached.
    cancel () {
      this.list.empty()
      this.cancelling = true
      const filterEditorViewFocused = this.filterEditorView.hasFocus()
      if (typeof this.cancelled === 'function') {
        this.cancelled()
      }
      this.filterEditorView.setText('')
      if (filterEditorViewFocused) { this.restoreFocus() }
      this.cancelling = false
      return clearTimeout(this.scheduleTimeout)
    }

    // Extended: Focus the fuzzy filter editor view.
    focusFilterEditor () {
      return this.filterEditorView.focus()
    }

    // Extended: Store the currently focused element. This element will be given
    // back focus when {::cancel} is called.
    storeFocusedElement () {
      return this.previouslyFocusedElement = $(document.activeElement)
    }

    /*
    Section: Private
    */

    selectPreviousItemView () {
      let view = this.getSelectedItemView().prev()
      if (!view.length) { view = this.list.find('li:last') }
      return this.selectItemView(view)
    }

    selectNextItemView () {
      let view = this.getSelectedItemView().next()
      if (!view.length) { view = this.list.find('li:first') }
      return this.selectItemView(view)
    }

    selectItemView (view) {
      if (!view.length) { return }
      this.list.find('.selected').removeClass('selected')
      view.addClass('selected')
      return this.scrollToItemView(view)
    }

    scrollToItemView (view) {
      const scrollTop = this.list.scrollTop()
      const desiredTop = view.position().top + scrollTop
      const desiredBottom = desiredTop + view.outerHeight()

      if (desiredTop < scrollTop) {
        return this.list.scrollTop(desiredTop)
      } else if (desiredBottom > this.list.scrollBottom()) {
        return this.list.scrollBottom(desiredBottom)
      }
    }

    restoreFocus () {
      return (this.previouslyFocusedElement != null ? this.previouslyFocusedElement.focus() : undefined)
    }

    getSelectedItemView () {
      return this.list.find('li.selected')
    }

    confirmSelection () {
      const item = this.getSelectedItem()
      if (item != null) {
        return this.confirmed(item)
      } else {
        return this.cancel()
      }
    }

    schedulePopulateList () {
      clearTimeout(this.scheduleTimeout)
      const populateCallback = () => {
        if (this.isOnDom()) { return this.populateList() }
      }
      return this.scheduleTimeout = setTimeout(populateCallback, this.inputThrottle)
    }
  }
  SelectListView.initClass()
  return SelectListView
})())

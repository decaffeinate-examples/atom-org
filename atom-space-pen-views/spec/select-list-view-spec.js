/** @babel */
/* eslint-disable
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const { $, $$ } = require('space-pen')
const SelectListView = require('../src/select-list-view')

describe('SelectListView', function () {
  let [selectList, items, list, filterEditorView] = Array.from([])

  beforeEach(function () {
    items = [
      ['A', 'Alpha'], ['B', 'Bravo'], ['C', 'Charlie'],
      ['D', 'Delta'], ['E', 'Echo'], ['F', 'Foxtrot']
    ]

    selectList = new SelectListView()
    selectList.setMaxItems(4)
    selectList.getFilterKey = () => 1
    selectList.viewForItem = item => $$(function () { return this.li(item[1], { class: item[0] }) })

    selectList.confirmed = jasmine.createSpy('confirmed hook')
    selectList.cancelled = jasmine.createSpy('cancelled hook')

    selectList.setItems(items)
    return ({ list, filterEditorView } = selectList)
  })

  describe('when an array is assigned', () => it('populates the list with up to maxItems items, based on the liForElement function', function () {
    expect(list.find('li').length).toBe(selectList.maxItems)
    expect(list.find('li:eq(0)')).toHaveText('Alpha')
    return expect(list.find('li:eq(0)')).toHaveClass('A')
  }))

  describe('viewForItem(item)', function () {
    it('allows raw DOM elements to be returned', function () {
      selectList.viewForItem = function (item) {
        const li = document.createElement('li')
        li.classList.add(item[0])
        li.innerText = item[1]
        return li
      }

      selectList.setItems(items)

      expect(list.find('li').length).toBe(selectList.maxItems)
      expect(list.find('li:eq(0)')).toHaveText('Alpha')
      expect(list.find('li:eq(0)')).toHaveClass('A')
      return expect(selectList.getSelectedItem()).toBe(items[0])
    })

    return it('allows raw HTML to be returned', function () {
      selectList.viewForItem = item => `<li>${item}</li>`

      selectList.setItems(['Bermuda', 'Bahama'])

      expect(list.find('li:eq(0)')).toHaveText('Bermuda')
      return expect(selectList.getSelectedItem()).toBe('Bermuda')
    })
  })

  describe('when the text of the mini editor changes', function () {
    beforeEach(() => $('#jasmine-content').append(selectList))

    it('filters the elements in the list based on the scoreElement function and selects the first item', function () {
      filterEditorView.getModel().insertText('la')
      window.advanceClock(selectList.inputThrottle)

      expect(list.find('li').length).toBe(2)
      expect(list.find('li:contains(Alpha)')).toExist()
      expect(list.find('li:contains(Delta)')).toExist()
      expect(list.find('li:first')).toHaveClass('selected')
      return expect(selectList.error).not.toBeVisible()
    })

    it('displays an error if there are no matches, removes error when there are matches', function () {
      filterEditorView.getModel().insertText('nothing will match this')
      window.advanceClock(selectList.inputThrottle)

      expect(list.find('li').length).toBe(0)
      expect(selectList.error).not.toBeHidden()

      filterEditorView.getModel().setText('la')
      window.advanceClock(selectList.inputThrottle)

      expect(list.find('li').length).toBe(2)
      return expect(selectList.error).not.toBeVisible()
    })

    return it('displays no elements until the array has been set on the list', function () {
      selectList.items = null
      selectList.list.empty()
      filterEditorView.getModel().insertText('la')
      window.advanceClock(selectList.inputThrottle)

      expect(list.find('li').length).toBe(0)
      expect(selectList.error).toBeHidden()
      selectList.setItems(items)
      return expect(list.find('li').length).toBe(2)
    })
  })

  describe('when core:move-up / core:move-down are triggered on the filterEditorView', function () {
    it('selects the previous / next item in the list, or wraps around to the other side', function () {
      expect(list.find('li:first')).toHaveClass('selected')

      atom.commands.dispatch(filterEditorView.element, 'core:move-up')

      expect(list.find('li:first')).not.toHaveClass('selected')
      expect(list.find('li:last')).toHaveClass('selected')

      atom.commands.dispatch(filterEditorView.element, 'core:move-down')

      expect(list.find('li:first')).toHaveClass('selected')
      expect(list.find('li:last')).not.toHaveClass('selected')

      atom.commands.dispatch(filterEditorView.element, 'core:move-down')

      expect(list.find('li:eq(0)')).not.toHaveClass('selected')
      expect(list.find('li:eq(1)')).toHaveClass('selected')

      atom.commands.dispatch(filterEditorView.element, 'core:move-down')

      expect(list.find('li:eq(1)')).not.toHaveClass('selected')
      expect(list.find('li:eq(2)')).toHaveClass('selected')

      atom.commands.dispatch(filterEditorView.element, 'core:move-up')

      expect(list.find('li:eq(2)')).not.toHaveClass('selected')
      return expect(list.find('li:eq(1)')).toHaveClass('selected')
    })

    return it('scrolls to keep the selected item in view', function () {
      $('#jasmine-content').append(selectList)
      const itemHeight = list.find('li').outerHeight()
      list.height(itemHeight * 2)

      atom.commands.dispatch(filterEditorView.element, 'core:move-down')
      atom.commands.dispatch(filterEditorView.element, 'core:move-down')
      expect(list.scrollBottom()).toBe(itemHeight * 3)

      atom.commands.dispatch(filterEditorView.element, 'core:move-down')
      expect(list.scrollBottom()).toBe(itemHeight * 4)

      atom.commands.dispatch(filterEditorView.element, 'core:move-up')
      atom.commands.dispatch(filterEditorView.element, 'core:move-up')
      return expect(list.scrollTop()).toBe(itemHeight)
    })
  })

  describe('the core:confirm event', function () {
    describe('when there is an item selected (because the list in not empty)', () => it('triggers the selected hook with the selected array element', function () {
      atom.commands.dispatch(filterEditorView.element, 'core:move-down')
      atom.commands.dispatch(filterEditorView.element, 'core:move-down')
      atom.commands.dispatch(filterEditorView.element, 'core:confirm')
      return expect(selectList.confirmed).toHaveBeenCalledWith(items[2])
    }))

    return describe('when there is no item selected (because the list is empty)', function () {
      beforeEach(() => $('#jasmine-content').append(selectList))

      it('does not trigger the confirmed hook', function () {
        filterEditorView.getModel().insertText('i will never match anything')
        window.advanceClock(selectList.inputThrottle)

        expect(list.find('li')).not.toExist()
        atom.commands.dispatch(filterEditorView.element, 'core:confirm')
        return expect(selectList.confirmed).not.toHaveBeenCalled()
      })

      return it('does trigger the cancelled hook', function () {
        filterEditorView.getModel().insertText('i will never match anything')
        window.advanceClock(selectList.inputThrottle)

        expect(list.find('li')).not.toExist()
        atom.commands.dispatch(filterEditorView.element, 'core:confirm')
        return expect(selectList.cancelled).toHaveBeenCalled()
      })
    })
  })

  describe('when a list item is clicked', () => it('selects the item on mousedown and confirms it on mouseup', function () {
    const item = list.find('li:eq(1)')

    item.mousedown()
    expect(item).toHaveClass('selected')
    item.mouseup()

    return expect(selectList.confirmed).toHaveBeenCalledWith(items[1])
  }))

  describe('the core:cancel event', () => it('triggers the cancelled hook and empties the select list', function () {
    spyOn(selectList, 'detach')
    atom.commands.dispatch(filterEditorView.element, 'core:cancel')
    expect(selectList.cancelled).toHaveBeenCalled()
    return expect(selectList.list).toBeEmpty()
  }))

  describe('when the mini editor loses focus', () => it('triggers the cancelled hook and detaches the select list', function () {
    filterEditorView.element.dispatchEvent(new FocusEvent('blur'))
    return expect(selectList.cancelled).toHaveBeenCalled()
  }))

  describe('the core:move-to-top event', () => it('scrolls to the top, selects the first element, and does not bubble the event', function () {
    $('#jasmine-content').append(selectList)
    const moveToTopHandler = jasmine.createSpy('moveToTopHandler')
    atom.commands.add('#jasmine-content', { 'core:move-to-top': moveToTopHandler })

    atom.commands.dispatch(selectList.element, 'core:move-down')
    expect(list.find('li:eq(1)')).toHaveClass('selected')
    atom.commands.dispatch(selectList.element, 'core:move-to-top')
    expect(list.find('li:first')).toHaveClass('selected')
    return expect(moveToTopHandler).not.toHaveBeenCalled()
  }))

  return describe('the core:move-to-bottom event', () => it('scrolls to the bottom, selects the last element, and does not bubble the event', function () {
    $('#jasmine-content').append(selectList)

    const moveToBottomHandler = jasmine.createSpy('moveToBottomHandler')
    atom.commands.add('#jasmine-content', { 'core:move-to-bottom': moveToBottomHandler })

    expect(list.find('li:first')).toHaveClass('selected')
    atom.commands.dispatch(selectList.element, 'core:move-to-bottom')
    expect(list.find('li:last')).toHaveClass('selected')
    return expect(moveToBottomHandler).not.toHaveBeenCalled()
  }))
})

/** @babel */
/* eslint-disable
    no-return-assign,
    no-undef,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ProjectRingProjectSelectView
const { $, View } = require('atom-space-pen-views')

module.exports =
(ProjectRingProjectSelectView = class ProjectRingProjectSelectView extends View {
  static content () {
    return this.div({ class: 'project-ring-project-select overlay from-top' }, () => {
      this.div({ class: 'controls' }, () => {
        this.input({ type: 'button', class: 'right confirm', value: '' })
        this.input({ type: 'button', class: 'right cancel', value: 'Cancel' })
        this.input({ type: 'button', class: 'left select-all', value: 'Select All' })
        return this.input({ type: 'button', class: 'left deselect-all', value: 'Deselect All' })
      })
      return this.div({ class: 'entries' })
    })
  }

  initialize (projectRing) {
    return this.projectRing = this.projectRing || projectRing
  }

  getEntryView (key) {
    const $entry = $('<div></div>', { class: 'entry' })
    $entry.append($('<input />', { type: 'checkbox', 'data-key': key }).on('click', function (event) {
      event.preventDefault()
      event.returnValue = false
      const $this = $(this)
      if (!$this.is('.checked')) {
        $this.addClass('checked')
      } else {
        $this.removeClass('checked')
      }
      return event.returnValue
    })
    )
    return $entry.append($('<div></div>', { class: 'title', text: key }))
  }

  attach (viewModeParameters, items) {
    this.viewModeParameters = viewModeParameters
    this.self = atom.workspace.addModalPanel({ item: this })
    const $content = $(atom.views.getView(atom.workspace)).find('.project-ring-project-select')
    if (!this.isInitialized) {
      const $controls = $content.find('.controls')
      $controls.find('input:button.confirm').on('click', () => this.confirmed())
      $controls.find('input:button.cancel').on('click', () => this.destroy())
      $controls.find('input:button.select-all').on('click', () => this.setAllEntriesSelected(true))
      $controls.find('input:button.deselect-all').on('click', () => this.setAllEntriesSelected(false))
      this.isInitialized = true
    }
    $content.find('.controls .confirm').val(this.viewModeParameters.confirmValue)
    const $entries = $content.find('.entries').empty()
    if (!items.length) {
      $entries.append(($('<div>There are no projects available for opening.</div>')).addClass('empty'))
      return
    }
    return Array.from(items).map((key) =>
      $entries.append(this.getEntryView(key)))
  }

  destroy () {
    return this.self.destroy()
  }

  confirmed () {
    const keys = []
    $(atom.views.getView(atom.workspace)).find('.project-ring-project-select .entries input:checkbox.checked').each((index, element) => keys.push($(element).attr('data-key')))
    this.destroy()
    return this.projectRing.handleProjectRingProjectSelectViewSelection(this.viewModeParameters, keys)
  }

  setAllEntriesSelected (allSelected) {
    const $checkboxes = $(atom.views.getView(atom.workspace)).find('.project-ring-project-select .entries input:checkbox')
    if (allSelected) {
      return $checkboxes.removeClass('checked').addClass('checked')
    } else {
      return $checkboxes.removeClass('checked')
    }
  }
})

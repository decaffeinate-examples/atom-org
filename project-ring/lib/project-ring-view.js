/** @babel */
/* eslint-disable
    constructor-super,
    no-constant-condition,
    no-eval,
    no-mixed-spaces-and-tabs,
    no-tabs,
    no-this-before-super,
    no-undef,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ProjectRingView
const lib = require('./project-ring-lib')
const { $, $$, SelectListView } = require('atom-space-pen-views')

module.exports =
(ProjectRingView = class ProjectRingView extends SelectListView {
  constructor (...args) {
    {
		  // Hack: trick Babel/TypeScript into allowing this before super.
		  if (false) { super() }
		  const thisFn = (() => { return this }).toString()
		  const thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1]
		  eval(`${thisName} = this;`)
    }
    this.getEmptyMessage = this.getEmptyMessage.bind(this)
    super(...args)
  }

  initialize (projectRing) {
    super.initialize(...arguments)
    this.projectRing = this.projectRing || projectRing
    return this.addClass('project-ring-project-select overlay from-top')
  }

  serialize () {}

  attach (viewModeParameters, items, titleKey) {
    this.viewModeParameters = viewModeParameters
    if (!this.isInitialized) {
      const openInNewWindowLabel = $('<label class="new-window-label">Open in a new window? <input type="checkbox" class="new-window" /></label>')
      openInNewWindowLabel.css({
        display: 'inline-block', 'font-size': '12px', 'letter-spacing': '0px', position: 'absolute', right: '15px'
      }).find('.new-window').css({ 'vertical-align': 'sub', width: '12px', height: '12px' })
      this.filterEditorView[0].shadowRoot.appendChild(openInNewWindowLabel[0])
      this.filterEditorView[0].shadowRoot.querySelector('.new-window').addEventListener('click', () => this.filterEditorView.focus())
      this.filterEditorView.after(
        $('<div class="key-bindings-guide-label">' +
				'<div>Delete selected project: <strong>alt-shift-delete</strong></div>' +
				'<div>Unload current project: <strong>alt-shift-u</strong></div>' +
				'</div>'
        )
      )
      this.filterEditorView.on('keydown', keydownEvent => this.onKeydown(keydownEvent))
      this.isInitialized = true
    }
    if (viewModeParameters.viewMode === 'project') {
      this.filterEditorView.next('.key-bindings-guide-label').show()
    } else {
      this.filterEditorView.next('.key-bindings-guide-label').hide()
    }
    const itemsArray = []
    const iterable = Object.keys(items).filter(key => key !== lib.defaultProjectCacheKey).sort()
    for (let i = 0; i < iterable.length; i++) {
      const key = iterable[i]
      const index = (i + 1).toString()
      itemsArray.push({
        index,
        title: items[key][titleKey],
        query: index + ': ' + items[key][titleKey],
        data: items[key],
        isCurrent: items[key] === this.viewModeParameters.currentItem
      })
    }
    this.setItems(itemsArray)
    this.self = atom.workspace.addModalPanel({ item: this })
    this.filterEditorView.getModel().setPlaceholderText(this.viewModeParameters.placeholderText)
    return this.filterEditorView.focus()
  }

  getEmptyMessage (itemCount, filteredItemCount) {
    return 'No items in the list or no matching items.'
  }

  viewForItem ({ index, title, isCurrent }) {
    return $$(function () {
      return this.li({ class: 'project-ring-item' + (isCurrent ? ' project-ring-item-current' : '') }, () => {
        return this.div({ class: 'project-ring-item-title' }, index + ': ' + title)
      })
    })
  }

  getFilterKey () {
    return 'query'
  }

  confirmed ({ data }) {
    this.destroy()
    return this.projectRing.handleProjectRingViewSelection(this.viewModeParameters, {
      projectState: data, openInNewWindow: this.filterEditorView[0].shadowRoot.querySelector('.new-window').checked
    })
  }

  onKeydown (keydownEvent) {
    return this.projectRing.handleProjectRingViewKeydown(keydownEvent, this.viewModeParameters, this.getSelectedItem())
  }

  destroy () {
    return this.cancel()
  }

  cancelled () {
    return this.self.destroy()
  }
})

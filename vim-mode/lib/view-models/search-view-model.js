/** @babel */
/* eslint-disable
    constructor-super,
    no-constant-condition,
    no-eval,
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
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let SearchViewModel
const { ViewModel } = require('./view-model')

module.exports =
(SearchViewModel = class SearchViewModel extends ViewModel {
  constructor (searchMotion) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super() }
      const thisFn = (() => { return this }).toString()
      const thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1]
      eval(`${thisName} = this;`)
    }
    this.increaseHistorySearch = this.increaseHistorySearch.bind(this)
    this.decreaseHistorySearch = this.decreaseHistorySearch.bind(this)
    this.confirm = this.confirm.bind(this)
    this.searchMotion = searchMotion
    super(this.searchMotion, { class: 'search' })
    this.historyIndex = -1

    atom.commands.add(this.view.editorElement, 'core:move-up', this.increaseHistorySearch)
    atom.commands.add(this.view.editorElement, 'core:move-down', this.decreaseHistorySearch)
  }

  restoreHistory (index) {
    return this.view.editorElement.getModel().setText(this.history(index))
  }

  history (index) {
    return this.vimState.getSearchHistoryItem(index)
  }

  increaseHistorySearch () {
    if (this.history(this.historyIndex + 1) != null) {
      this.historyIndex += 1
      return this.restoreHistory(this.historyIndex)
    }
  }

  decreaseHistorySearch () {
    if (this.historyIndex <= 0) {
      // get us back to a clean slate
      this.historyIndex = -1
      return this.view.editorElement.getModel().setText('')
    } else {
      this.historyIndex -= 1
      return this.restoreHistory(this.historyIndex)
    }
  }

  confirm (view) {
    const repeatChar = this.searchMotion.initiallyReversed ? '?' : '/'
    if ((this.view.value === '') || (this.view.value === repeatChar)) {
      const lastSearch = this.history(0)
      if (lastSearch != null) {
        this.view.value = lastSearch
      } else {
        this.view.value = ''
        atom.beep()
      }
    }
    super.confirm(view)
    return this.vimState.pushSearchHistory(this.view.value)
  }

  update (reverse) {
    if (reverse) {
      this.view.classList.add('reverse-search-input')
      return this.view.classList.remove('search-input')
    } else {
      this.view.classList.add('search-input')
      return this.view.classList.remove('reverse-search-input')
    }
  }
})

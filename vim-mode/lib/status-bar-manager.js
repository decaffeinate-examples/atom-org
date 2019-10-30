/** @babel */
/* eslint-disable
    no-cond-assign,
    no-return-assign,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let StatusBarManager
const ContentsByMode = {
  insert: ['status-bar-vim-mode-insert', 'Insert'],
  'insert.replace': ['status-bar-vim-mode-insert', 'Replace'],
  normal: ['status-bar-vim-mode-normal', 'Normal'],
  visual: ['status-bar-vim-mode-visual', 'Visual'],
  'visual.characterwise': ['status-bar-vim-mode-visual', 'Visual'],
  'visual.linewise': ['status-bar-vim-mode-visual', 'Visual Line'],
  'visual.blockwise': ['status-bar-vim-mode-visual', 'Visual Block']
}

module.exports =
(StatusBarManager = class StatusBarManager {
  constructor () {
    this.element = document.createElement('div')
    this.element.id = 'status-bar-vim-mode'

    this.container = document.createElement('div')
    this.container.className = 'inline-block'
    this.container.appendChild(this.element)
  }

  initialize (statusBar) {
    this.statusBar = statusBar
  }

  update (currentMode, currentSubmode) {
    let newContents
    if (currentSubmode != null) { currentMode = currentMode + '.' + currentSubmode }
    if (newContents = ContentsByMode[currentMode]) {
      const [klass, text] = Array.from(newContents)
      this.element.className = klass
      return this.element.textContent = text
    } else {
      return this.hide()
    }
  }

  hide () {
    return this.element.className = 'hidden'
  }

  // Private

  attach () {
    return this.tile = this.statusBar.addRightTile({ item: this.container, priority: 20 })
  }

  detach () {
    return this.tile.destroy()
  }
})

/** @babel */
/* eslint-disable
    constructor-super,
    no-cond-assign,
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
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let CopyDialog
const path = require('path')
const fs = require('fs-plus')
const Dialog = require('./dialog')
const { repoForPath } = require('./helpers')

module.exports =
(CopyDialog = class CopyDialog extends Dialog {
  constructor (initialPath, { onCopy }) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super() }
      const thisFn = (() => { return this }).toString()
      const thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1]
      eval(`${thisName} = this;`)
    }
    this.initialPath = initialPath
    this.onCopy = onCopy
    super({
      prompt: 'Enter the new path for the duplicate.',
      initialPath: atom.project.relativize(this.initialPath),
      select: true,
      iconClass: 'icon-arrow-right'
    })
  }

  onConfirm (newPath) {
    newPath = newPath.replace(/\s+$/, '') // Remove trailing whitespace
    if (!path.isAbsolute(newPath)) {
      const [rootPath] = Array.from(atom.project.relativizePath(this.initialPath))
      newPath = path.join(rootPath, newPath)
      if (!newPath) { return }
    }

    if (this.initialPath === newPath) {
      this.close()
      return
    }

    if (!this.isNewPathValid(newPath)) {
      this.showError(`'${newPath}' already exists.`)
      return
    }

    let activeEditor = atom.workspace.getActiveTextEditor()
    if ((activeEditor != null ? activeEditor.getPath() : undefined) !== this.initialPath) { activeEditor = null }
    try {
      let repo
      if (fs.isDirectorySync(this.initialPath)) {
        fs.copySync(this.initialPath, newPath)
        if (typeof this.onCopy === 'function') {
          this.onCopy({ initialPath: this.initialPath, newPath })
        }
      } else {
        fs.copy(this.initialPath, newPath, () => {
          if (typeof this.onCopy === 'function') {
            this.onCopy({ initialPath: this.initialPath, newPath })
          }
          return atom.workspace.open(newPath, {
            activatePane: true,
            initialLine: (activeEditor != null ? activeEditor.getLastCursor().getBufferRow() : undefined),
            initialColumn: (activeEditor != null ? activeEditor.getLastCursor().getBufferColumn() : undefined)
          }
          )
        })
      }
      if (repo = repoForPath(newPath)) {
        repo.getPathStatus(this.initialPath)
        repo.getPathStatus(newPath)
      }
      return this.close()
    } catch (error) {
      return this.showError(`${error.message}.`)
    }
  }

  isNewPathValid (newPath) {
    try {
      const oldStat = fs.statSync(this.initialPath)
      const newStat = fs.statSync(newPath)

      // New path exists so check if it points to the same file as the initial
      // path to see if the case of the file name is being changed on a on a
      // case insensitive filesystem.
      return (this.initialPath.toLowerCase() === newPath.toLowerCase()) &&
        (oldStat.dev === newStat.dev) &&
        (oldStat.ino === newStat.ino)
    } catch (error) {
      return true // new path does not exist so it is valid
    }
  }
})

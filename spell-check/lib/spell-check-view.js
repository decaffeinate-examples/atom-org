/** @babel */
/* eslint-disable
    no-cond-assign,
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
 * DS103: Rewrite code to no longer use __guard__
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let SpellCheckView
const _ = require('underscore-plus')
const { CompositeDisposable } = require('atom')
const SpellCheckTask = require('./spell-check-task')

let CorrectionsView = null

module.exports =
(SpellCheckView = class SpellCheckView {
  constructor (editor, spellCheckModule, manager) {
    this.addContextMenuEntries = this.addContextMenuEntries.bind(this)
    this.makeCorrection = this.makeCorrection.bind(this)
    this.editor = editor
    this.spellCheckModule = spellCheckModule
    this.manager = manager
    this.disposables = new CompositeDisposable()
    this.initializeMarkerLayer()

    this.taskWrapper = new SpellCheckTask(this.manager)

    this.correctMisspellingCommand = atom.commands.add(atom.views.getView(this.editor), 'spell-check:correct-misspelling', () => {
      let marker
      if (marker = this.markerLayer.findMarkers({ containsBufferPosition: this.editor.getCursorBufferPosition() })[0]) {
        if (CorrectionsView == null) { CorrectionsView = require('./corrections-view') }
        if (this.correctionsView != null) {
          this.correctionsView.destroy()
        }
        this.correctionsView = new CorrectionsView(this.editor, this.getCorrections(marker), marker, this, this.updateMisspellings)
        return this.correctionsView.attach()
      }
    })

    atom.views.getView(this.editor).addEventListener('contextmenu', this.addContextMenuEntries)

    this.disposables.add(this.editor.onDidChangePath(() => {
      return this.subscribeToBuffer()
    })
    )

    this.disposables.add(this.editor.onDidChangeGrammar(() => {
      return this.subscribeToBuffer()
    })
    )

    this.disposables.add(atom.config.onDidChange('editor.fontSize', () => {
      return this.subscribeToBuffer()
    })
    )

    this.disposables.add(atom.config.onDidChange('spell-check.grammars', () => {
      return this.subscribeToBuffer()
    })
    )

    this.subscribeToBuffer()

    this.disposables.add(this.editor.onDidDestroy(this.destroy.bind(this)))
  }

  initializeMarkerLayer () {
    this.markerLayer = this.editor.addMarkerLayer({ maintainHistory: false })
    return this.markerLayerDecoration = this.editor.decorateMarkerLayer(this.markerLayer, {
      type: 'highlight',
      class: 'spell-check-misspelling',
      deprecatedRegionClass: 'misspelling'
    })
  }

  destroy () {
    this.unsubscribeFromBuffer()
    this.disposables.dispose()
    this.taskWrapper.terminate()
    this.markerLayer.destroy()
    this.markerLayerDecoration.destroy()
    this.correctMisspellingCommand.dispose()
    if (this.correctionsView != null) {
      this.correctionsView.destroy()
    }
    return this.clearContextMenuEntries()
  }

  unsubscribeFromBuffer () {
    this.destroyMarkers()

    if (this.buffer != null) {
      this.bufferDisposable.dispose()
      return this.buffer = null
    }
  }

  subscribeToBuffer () {
    this.unsubscribeFromBuffer()

    if (this.spellCheckCurrentGrammar()) {
      this.buffer = this.editor.getBuffer()
      this.bufferDisposable = new CompositeDisposable(
        this.buffer.onDidStopChanging(() => this.updateMisspellings(),
          this.editor.onDidTokenize(() => this.updateMisspellings()))
      )
      return this.updateMisspellings()
    }
  }

  spellCheckCurrentGrammar () {
    const grammar = this.editor.getGrammar().scopeName
    return _.contains(atom.config.get('spell-check.grammars'), grammar)
  }

  destroyMarkers () {
    this.markerLayer.destroy()
    this.markerLayerDecoration.destroy()
    return this.initializeMarkerLayer()
  }

  addMarkers (misspellings) {
    return (() => {
      const result = []
      for (const misspelling of Array.from(misspellings)) {
        const scope = this.editor.scopeDescriptorForBufferPosition(misspelling[0])
        if (!this.scopeIsExcluded(scope)) {
          result.push(this.markerLayer.markBufferRange(misspelling, { invalidate: 'touch' }))
        } else {
          result.push(undefined)
        }
      }
      return result
    })()
  }

  updateMisspellings () {
    return this.taskWrapper.start(this.editor, misspellings => {
      this.destroyMarkers()
      if (this.buffer != null) { return this.addMarkers(misspellings) }
    })
  }

  getCorrections (marker) {
    // Build up the arguments object for this buffer and text.
    let projectPath = null
    let relativePath = null
    if (__guard__(this.buffer != null ? this.buffer.file : undefined, x => x.path)) {
      [projectPath, relativePath] = Array.from(atom.project.relativizePath(this.buffer.file.path))
    }
    const args = {
      projectPath,
      relativePath
    }

    // Get the misspelled word and then request corrections.
    const misspelling = this.editor.getTextInBufferRange(marker.getBufferRange())
    return this.manager.suggest(args, misspelling)
  }

  addContextMenuEntries (mouseEvent) {
    let marker
    this.clearContextMenuEntries()
    // Get buffer position of the right click event. If the click happens outside
    // the boundaries of any text, the method defaults to the buffer position of
    // the last character in the editor.
    const currentScreenPosition = atom.views.getView(this.editor).component.screenPositionForMouseEvent(mouseEvent)
    const currentBufferPosition = this.editor.bufferPositionForScreenPosition(currentScreenPosition)

    // Check to see if the selected word is incorrect.
    if (marker = this.markerLayer.findMarkers({ containsBufferPosition: currentBufferPosition })[0]) {
      const corrections = this.getCorrections(marker)
      if (corrections.length > 0) {
        this.spellCheckModule.contextMenuEntries.push({
          menuItem: atom.contextMenu.add({ 'atom-text-editor': [{ type: 'separator' }] })
        })

        let correctionIndex = 0
        for (const correction of Array.from(corrections)) {
          const contextMenuEntry = {}
          // Register new command for correction.
          var commandName = 'spell-check:correct-misspelling-' + correctionIndex
          contextMenuEntry.command = ((correction, contextMenuEntry) => {
            return atom.commands.add(atom.views.getView(this.editor), commandName, () => {
              this.makeCorrection(correction, marker)
              return this.clearContextMenuEntries()
            })
          })(correction, contextMenuEntry)

          // Add new menu item for correction.
          contextMenuEntry.menuItem = atom.contextMenu.add({
            'atom-text-editor': [{ label: correction.label, command: commandName }]
          })
          this.spellCheckModule.contextMenuEntries.push(contextMenuEntry)
          correctionIndex++
        }

        return this.spellCheckModule.contextMenuEntries.push({
          menuItem: atom.contextMenu.add({ 'atom-text-editor': [{ type: 'separator' }] })
        })
      }
    }
  }

  makeCorrection (correction, marker) {
    if (correction.isSuggestion) {
      // Update the buffer with the correction.
      this.editor.setSelectedBufferRange(marker.getBufferRange())
      return this.editor.insertText(correction.suggestion)
    } else {
      // Build up the arguments object for this buffer and text.
      let projectPath = null
      let relativePath = null
      if (__guard__(this.editor.buffer != null ? this.editor.buffer.file : undefined, x => x.path)) {
        [projectPath, relativePath] = Array.from(atom.project.relativizePath(this.editor.buffer.file.path))
      }
      const args = {
        id: this.id,
        projectPath,
        relativePath
      }

      // Send the "add" request to the plugin.
      correction.plugin.add(args, correction)

      // Update the buffer to handle the corrections.
      return this.updateMisspellings.bind(this)()
    }
  }

  clearContextMenuEntries () {
    for (const entry of Array.from(this.spellCheckModule.contextMenuEntries)) {
      if (entry.command != null) {
        entry.command.dispose()
      }
      if (entry.menuItem != null) {
        entry.menuItem.dispose()
      }
    }

    return this.spellCheckModule.contextMenuEntries = []
  }

  scopeIsExcluded (scopeDescriptor, excludedScopes) {
    return this.spellCheckModule.excludedScopeRegexLists.some(regexList => scopeDescriptor.scopes.some(scopeName => regexList.every(regex => regex.test(scopeName))))
  }
})

function __guard__ (value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined
}

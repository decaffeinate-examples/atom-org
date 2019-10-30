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
 * DS103: Rewrite code to no longer use __guard__
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ScrollMarker
const ScrollLine = require('./scroll-line')
const ScrollSearch = require('./scroll-searcher-view')
const { CompositeDisposable, Emitter } = require('event-kit')
module.exports =
(ScrollMarker = (function () {
  ScrollMarker = class ScrollMarker {
    static initClass () {
      this.prototype.editor = null
      this.prototype.model = null
      this.prototype.scrollHeight = null
    }

    constructor (argModel, main) {
      this.updateModel = this.updateModel.bind(this)
      this.createMarker = this.createMarker.bind(this)
      this.updateMarkers = this.updateMarkers.bind(this)
      this.main = main
      this.markers = {}
      this.subscriptions = new CompositeDisposable()
      this.emitter = new Emitter()
      this.model = argModel
      this.editor = atom.workspace.getActiveTextEditor()
      // Check if current version of Atom supports find-and-replace API
      this.hasApi = parseFloat(atom.packages.getLoadedPackage('find-and-replace').metadata.version) >= 0.194
    }

    onDidDestroy (callback) {
      return this.emitter.on('did-destroy', callback)
    }

    onDidUpdateMarkers (callback) {
      return this.emitter.on('did-update-markers', callback)
    }

    destroy () {
      this.markers = {}
      this.subscriptions.dispose()
      return this.emitter.emit('did-destroy')
    }

    updateModel (argModel) {
      // Update the find-and-replace model
      this.model = argModel
      this.subscriptions.dispose()
      this.subscriptions = new CompositeDisposable()
      return this.subscriptions.add(this.model.mainModule.findModel.resultsMarkerLayer.onDidCreateMarker(this.createMarker.bind(this)))
    }

    // Create an new scroll-marker for every newly formed find-and-replace marker
    createMarker (marker) {
      let line, lineClass, scrollMarker
      this.editor = atom.workspace.getActiveTextEditor()
      const newScrollHeight = this.editor.getScrollHeight()
      if (newScrollHeight !== this.scrollHeight) {
        this.updateMarkers()
        return
      }
      const displayHeight = this.editor.displayBuffer.height
      const lineHeight = this.editor.displayBuffer.getLineHeightInPixels()
      const {
        row
      } = marker.getScreenRange().start
      // Set the position of scroll-searcher according to configured settings
      if (atom.config.get('scroll-searcher.size') === 1) {
        scrollMarker = Math.round((row * lineHeight * displayHeight) / this.scrollHeight)
      } else {
        if (atom.config.get('scroll-searcher.size') === 2) {
          scrollMarker = Math.floor((row * lineHeight * displayHeight) / this.scrollHeight)
        } else {
          scrollMarker = Math.round((row * lineHeight * displayHeight) / this.scrollHeight) - 1
        }
      }
      if (!this.markers[scrollMarker]) {
        this.markers[scrollMarker] = 1
      } else {
        this.markers[scrollMarker] = this.markers[scrollMarker] + 1
      }
      this.scrollView = __guard__(atom.views.getView(this.editor).rootElement, x => x.querySelector('.scroll-searcher'))
      if (this.scrollView) {
        // Create a new scroll line with the position given by scrollMarker variable
        lineClass = new ScrollLine(scrollMarker, this.markers, marker, this)
        line = lineClass.getElement()
        return this.scrollView.appendChild(line)
      } else {
        // If scroll-searcher class doesn't exist, then create a new class (This can be the case when a new editor window is opened or switched to)
        this.scrollClass = new ScrollSearch(this.main)
        this.scrollView = this.scrollClass.getElement()
        this.editorView = __guard__(atom.views.getView(this.editor).component.rootElement, x1 => x1.firstChild)
        this.editorView.appendChild(this.scrollClass.getElement())
        const verticalScrollbar = __guard__(atom.views.getView(this.editor).component.rootElement, x2 => x2.querySelector('.vertical-scrollbar'))
        verticalScrollbar.style.opacity = '0.65'
        lineClass = new ScrollLine(scrollMarker, this.markers, marker, this)
        line = lineClass.getElement()
        return this.scrollView.appendChild(line)
      }
    }

    updateMarkers () {
      // emit destroy signal to delete previous scroll-searchers
      this.emitter.emit('did-destroy')
      this.editor = atom.workspace.getActiveTextEditor()
      this.markers = {}
      let updatedMarkers = {}
      // Get the updated markers from find-and-replace results
      if (this.hasApi) {
        return atom.packages.serviceHub.consume('find-and-replace', '0.0.1', fnr => {
          let displayHeight, line, lineClass, lineHeight, marker, row, scrollMarker, verticalScrollbar
          if (fnr) {
            this.layer = fnr.resultsMarkerLayerForTextEditor(this.editor)
            updatedMarkers = this.layer.findMarkers()
            this.scrollHeight = this.editor.getScrollHeight()
            displayHeight = this.editor.displayBuffer.height
            lineHeight = this.editor.displayBuffer.getLineHeightInPixels()
            this.scrollView = __guard__(atom.views.getView(this.editor).rootElement, x => x.querySelector('.scroll-searcher'))
            for (marker of Array.from(updatedMarkers)) {
              ({
                row
              } = marker.getScreenRange().start)
              if (atom.config.get('scroll-searcher.size') === 1) {
                scrollMarker = Math.round((row * lineHeight * displayHeight) / this.scrollHeight)
              } else {
                if (atom.config.get('scroll-searcher.size') === 2) {
                  scrollMarker = Math.floor((row * lineHeight * displayHeight) / this.scrollHeight)
                } else {
                  scrollMarker = Math.round((row * lineHeight * displayHeight) / this.scrollHeight) - 1
                }
              }

              if (this.markers[scrollMarker]) {
                this.markers[scrollMarker] = this.markers[scrollMarker] + 1
              } else {
                this.markers[scrollMarker] = 1
              }
              lineClass = new ScrollLine(scrollMarker, this.markers, marker, this)
              line = lineClass.getElement()
              if (this.scrollView) {
                this.scrollView.appendChild(line)
              } else {
                this.scrollClass = new ScrollSearch(this.main)
                this.scrollView = this.scrollClass.getElement()
                this.editorView = __guard__(atom.views.getView(this.editor).component.rootElement, x1 => x1.firstChild)
                verticalScrollbar = __guard__(atom.views.getView(this.editor).component.rootElement, x2 => x2.querySelector('.vertical-scrollbar'))
                verticalScrollbar.style.opacity = '0.65'
                this.editorView.appendChild(this.scrollClass.getElement())
                this.scrollView.appendChild(line)
              }
            }
            // notify that markers have been updated
            return this.emitter.emit('did-update-markers')
          } else {
            updatedMarkers = this.model.mainModule.findModel.resultsMarkerLayer.findMarkers({ class: 'find-result' })
            this.scrollHeight = this.editor.getScrollHeight()
            displayHeight = this.editor.displayBuffer.height
            lineHeight = this.editor.displayBuffer.getLineHeightInPixels()
            this.scrollView = __guard__(atom.views.getView(this.editor).rootElement, x3 => x3.querySelector('.scroll-searcher'))
            for (marker of Array.from(updatedMarkers)) {
              ({
                row
              } = marker.getScreenRange().start)
              if (atom.config.get('scroll-searcher.size') === 1) {
                scrollMarker = Math.round((row * lineHeight * displayHeight) / this.scrollHeight)
              } else {
                if (atom.config.get('scroll-searcher.size') === 2) {
                  scrollMarker = Math.floor((row * lineHeight * displayHeight) / this.scrollHeight)
                } else {
                  scrollMarker = Math.round((row * lineHeight * displayHeight) / this.scrollHeight) - 1
                }
              }

              if (this.markers[scrollMarker]) {
                this.markers[scrollMarker] = this.markers[scrollMarker] + 1
              } else {
                this.markers[scrollMarker] = 1
              }
              lineClass = new ScrollLine(scrollMarker, this.markers, marker, this)
              line = lineClass.getElement()
              if (this.scrollView) {
                this.scrollView.appendChild(line)
              } else {
                this.scrollClass = new ScrollSearch(this.main)
                this.scrollView = this.scrollClass.getElement()
                this.editorView = __guard__(atom.views.getView(this.editor).component.rootElement, x4 => x4.firstChild)
                verticalScrollbar = __guard__(atom.views.getView(this.editor).component.rootElement, x5 => x5.querySelector('.vertical-scrollbar'))
                verticalScrollbar.style.opacity = '0.65'
                this.editorView.appendChild(this.scrollClass.getElement())
                this.scrollView.appendChild(line)
              }
            }
            // notify that markers have been updated
            return this.emitter.emit('did-update-markers')
          }
        })
      }
    }
  }
  ScrollMarker.initClass()
  return ScrollMarker
})())

function __guard__ (value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined
}

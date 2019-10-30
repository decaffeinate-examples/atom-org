/** @babel */
/* eslint-disable
    no-class-assign,
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
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const { CompositeDisposable, Disposable } = require('event-kit')
const { AncestorsMethods, SpacePenDSL, EventsDelegation } = require('atom-utils')

class FinderTool extends HTMLElement {
  static initClass () {
    EventsDelegation.includeInto(this)
    SpacePenDSL.includeInto(this)

    this.prototype.debug = false
    this.prototype.nameWidth = 200
    this.prototype.sizeWidth = 80
    this.prototype.mdateWidth = 180
    this.prototype.minWidth = 40
    this.prototype.sortKey = 'name'
    this.prototype.sortOrder = 'ascent'
  }

  static content () {
    return this.tag('atom-panel', { class: 'tree-view-finder-tool tool-panel' }, () => {
      return this.div({ outlet: 'toolBar', class: 'btn-group' }, () => {
        this.div({ outlet: 'backBtn', class: 'btn disable', id: 'back-btn' }, '<')
        this.div({ outlet: 'forwBtn', class: 'btn disable', id: 'forw-btn' }, '>')
        this.div({ outlet: 'homeBtn', class: 'btn disable', id: 'home-btn' }, 'Home')
        this.div({ outlet: 'name', class: 'btn', id: 'name' }, () => {
          return this.span({ class: 'finder-tool-btn-label', id: 'name-btn-label' }, 'Name')
        })
        this.div({ outlet: 'nameRsz', class: 'btn rsz', id: 'name-rsz' }, '')
        this.div({ outlet: 'size', class: 'btn', id: 'size' }, () => {
          return this.span({ class: 'finder-tool-btn-label', id: 'size-btn-label' }, 'Size')
        })
        this.div({ outlet: 'sizeRsz', class: 'btn rsz', id: 'size-rsz' }, '')
        this.div({ outlet: 'mdate', class: 'btn', id: 'mdate' }, () => {
          return this.span({ class: 'finder-tool-btn-label', id: 'mdate-btn-label' }, 'Date Modified')
        })
        return this.div({ outlet: 'mdateRsz', class: 'btn rsz', id: 'mdate-rsz' }, '')
      })
    })
  }

  initialize (treeViewFinder) {
    if (this.debug) { console.log('finder-tool: initialize', treeViewFinder) }
    this.treeViewFinder = treeViewFinder
    this.subscriptions = new CompositeDisposable()
    this.updateButtonStatus()

    this.name.calcOptWidth = () => {
      const btnWidth = this.backBtn.offsetWidth + this.forwBtn.offsetWidth +
        this.homeBtn.offsetWidth
      let optWidth = this.treeViewFinder.fileInfo.calcOptWidthName()
      optWidth -= btnWidth
      if (optWidth < 0) {
        optWidth = 0
      }
      return optWidth
    }
    this.size.calcOptWidth = () => {
      return this.treeViewFinder.fileInfo.calcOptWidthSize()
    }
    this.mdate.calcOptWidth = () => {
      return this.treeViewFinder.fileInfo.calcOptWidthMdate()
    }
    this.name.sortKey = 'name'
    this.size.sortKey = 'size'
    this.mdate.sortKey = 'mdate'

    this.subscriptions.add(this.subscribeTo(this.toolBar, '.btn', {
      click: e => {
        if (this.debug) { console.log('finder-tool: click:', e.target.id, e) }
        //
        // history, back and forth
        //
        if (e.target === this.backBtn) {
          this.treeViewFinder.history.back()
        }
        if (e.target === this.forwBtn) {
          this.treeViewFinder.history.forw()
        }
        if (e.target === this.homeBtn) {
          this.treeViewFinder.history.goHome()
        }
        //
        // sort by name, size and date
        //
        let {
          target
        } = e
        if (!target.classList.contains('btn')) {
          target = target.parentElement
        }
        if (target.sortKey) {
          e.stopPropagation()
          if (target.sortKey === this.sortKey) {
            if (this.sortOrder === 'ascent') {
              this.sortOrder = 'descent'
            } else {
              this.sortOrder = 'ascent'
            }
          } else {
            this.sortKey = target.sortKey
          }
        }
        this.updateButtonStatus()
        return this.treeViewFinder.fileInfo.sort(this.sortKey, this.sortOrder)
      }
    }
    )
    )

    const state = __guard__(treeViewFinder != null ? treeViewFinder.state : undefined, x => x.finderTool)
    if (state) {
      if (this.debug) { console.log('finde-tool: initiliaze: state =', state) }
      if (state.nameWidth) {
        this.nameWidth = state.nameWidth
      }
      if (state.sizeWidth) {
        this.sizeWidth = state.sizeWidth
      }
      if (state.mdateWidth) {
        this.mdateWidth = state.mdateWidth
      }
    }

    this.name.style.width = this.nameWidth + 'px'
    this.size.style.width = this.sizeWidth + 'px'
    this.mdate.style.width = this.mdateWidth + 'px'

    let drag = null

    const getTargetRsz = e => {
      if (e.target.id === 'name-rsz') { return this.name }
      if (e.target.id === 'size-rsz') { return this.size }
      if (e.target.id === 'mdate-rsz') { return this.mdate }
      return null
    }

    this.subscriptions.add(this.subscribeTo(this.toolBar, '.rsz', {
      dblclick: e => {
        let target
        if (this.debug) { console.log('finder-tool: double click:', e.target.id, e) }
        // optimize column width
        if (!(target = getTargetRsz(e))) { return }
        if (this.debug) {
          console.log('finder-tool: opt width:', target.id,
            target.calcOptWidth())
        }
        target.style.width = Math.max(target.calcOptWidth(), this.minWidth) + 'px'
        return this.updateFileInfo()
      },
      mousedown: e => {
        let target
        if (this.debug) { console.log('finder-tool: drag:', e.target.id, e) }
        if (!(target = getTargetRsz(e))) { return }
        return drag = {
          x: e.clientX,
          y: e.clientY,
          target,
          originalWidth: target.offsetWidth
        }
      }
    }))
    const updateButtonWidths = e => {
      let d = e.clientX - drag.x
      if ((drag.originalWidth + d) < this.minWidth) {
        d = this.minWidth - drag.originalWidth
      }
      return drag.target.style.width = drag.originalWidth + d + 'px'
    }

    document.onmousemove = e => {
      if (drag) {
        updateButtonWidths(e)
        return this.updateFileInfo()
      }
    }

    return document.onmouseup = e => {
      if (drag) {
        updateButtonWidths(e)
        if (this.debug) { console.log('finder-tool: ', drag.target.id, drag.target.offsetLeft + drag.target.offsetWidth) }
        this.updateFileInfo()
        return drag = null
      }
    }
  }

  updateButtonStatus () {
    let label
    if (this.debug) {
      console.log('finder-tool: updateButtonStatus:',
        this.treeViewFinder.history.canBack(),
        this.treeViewFinder.history.canForw(),
        this.treeViewFinder.history.canGoHome())
    }
    if (this.treeViewFinder.history.canBack()) {
      this.backBtn.classList.remove('disable')
    } else {
      this.backBtn.classList.add('disable')
    }
    if (this.treeViewFinder.history.canForw()) {
      this.forwBtn.classList.remove('disable')
    } else {
      this.forwBtn.classList.add('disable')
    }
    if (this.treeViewFinder.history.canGoHome()) {
      this.homeBtn.classList.remove('disable')
    } else {
      this.homeBtn.classList.add('disable')
    }

    if (this.debug) {
      console.log('finder-tool: sort:',
        'key =', this.sortKey, ', order =', this.sortOrder)
    }
    for (label of Array.from(this.toolBar.querySelectorAll('.finder-tool-btn-label'))) {
      label.classList.remove('finder-tool-btn-label-ascent')
      label.classList.remove('finder-tool-btn-label-descent')
      label.classList.add('finder-tool-btn-label-nosort')
    }
    if (label = this.toolBar.querySelector('#' + this.sortKey + '-btn-label')) {
      label.classList.remove('finder-tool-btn-label-nosort')
      return label.classList.add('finder-tool-btn-label-' + this.sortOrder)
    }
  }

  serialize () {
    return {
      nameWidth: this.nameWidth,
      sizeWidth: this.sizeWidth,
      mdateWidth: this.mdateWidth
    }
  }

  updateFileInfo () {
    this.nameWidth = this.size.offsetLeft - this.name.offsetLeft
    this.sizeWidth = this.mdate.offsetLeft - this.size.offsetLeft
    this.mdateWidth = this.mdate.offsetWidth
    if (this.debug) { console.log('finder-tool: updateFileInfo: ', this.nameWidth, this.sizeWidth, this.mdateWidth) }
    return this.treeViewFinder.fileInfo.updateWidth(
      this.name.offsetLeft + this.nameWidth,
      this.sizeWidth,
      this.mdateWidth)
  }

  attach () {
    if (this.debug) { console.log('finder-tool: attach') }
    const workspace = atom.views.getView(atom.workspace)
    this.treeViewResizer = workspace.querySelector('.tree-view-resizer')
    this.treeViewScroller = workspace.querySelector('.tree-view-scroller')
    this.treeView = workspace.querySelector('.tree-view')
    if (!this.treeViewResizer) { return }
    this.treeViewResizer.insertBefore(this, this.treeViewScroller)
    this.treeViewScroller.classList.add('with-finder')
    this.updateFileInfo()
    this.attached = true
    return this.scrollSubscription = this.subscribeTo(this.treeViewScroller, '.tree-view-scroller', {
      scroll: e => {
        const treeViewScrollerLeft = this.treeViewScroller.getBoundingClientRect().left
        const treeViewLeft = this.treeView.getBoundingClientRect().left
        return this.toolBar.style.left = (treeViewLeft - treeViewScrollerLeft) + 'px'
      }
    }
    )
  }

  detach () {
    if (this.debug) { console.log('finder-tool: detach') }
    if (!this.treeViewResizer) { return }
    this.scrollSubscription.dispose()
    this.treeViewScroller.classList.remove('with-finder')
    this.treeViewResizer.removeChild(this)
    this.attached = false
    return this.treeViewResizer = null
  }

  destroy () {
    return this.detach()
  }
}
FinderTool.initClass()

module.exports = (FinderTool = document.registerElement('tree-view-finder-tool', { prototype: FinderTool.prototype }))

function __guard__ (value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined
}

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
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const _ = require('underscore-plus')
const { $ } = require('atom-space-pen-views')
describe('Main', function () {
  let [workspaceElement, editorView, editor, activationPromise, scrollActivationPromise, scrollMarker, findViews] = Array.from([])

  beforeEach(function () {
    waitsForPromise(() => atom.workspace.open('sample.js'))

    return runs(function () {
      workspaceElement = atom.views.getView(atom.workspace)
      jasmine.attachToDOM(workspaceElement)
      editor = atom.workspace.getActiveTextEditor()
      editorView = atom.views.getView(editor)
      activationPromise = atom.packages.activatePackage('find-and-replace').then(function ({ mainModule }) {
        mainModule.createViews()
        return findViews = mainModule
      })
      return scrollActivationPromise = atom.packages.activatePackage('scroll-searcher').then(({ mainModule }) => scrollMarker = mainModule.scrollMarker)
    })
  })

  describe('when find-and-replace is activated', function () {
    beforeEach(function () {
      atom.commands.dispatch(editorView, 'find-and-replace:show')
      return waitsForPromise(() => activationPromise)
    })

    return describe('when scroll-searcher is toggled', function () {
      beforeEach(function () {
        atom.commands.dispatch(editorView, 'scroll-searcher:toggle')

        return waitsForPromise(() => scrollActivationPromise)
      })
      it('attaches scroll-searcher to the root view', () => expect(editorView.rootElement.querySelector('.scroll-searcher')).toExist())
      it('destroys scroll-searchers when toggled twice', function () {
        atom.commands.dispatch(editorView, 'scroll-searcher:toggle')
        return expect(editorView.rootElement.querySelector('.scroll-searcher')).not.toExist()
      })

      it('updates scroll markers when window height is changed', function () {
        editor = atom.workspace.getActiveTextEditor()
        editor.setHeight(400)
        const spy = jasmine.createSpy('updateMarkers')
        scrollMarker.onDidUpdateMarkers(spy)
        editor.setHeight(200)
        return expect(spy).toHaveBeenCalled()
      })
      describe('when editor is filled', function () {
        beforeEach(function () {
          editor.setText(`\
aaa aaa bbb
aaabb ccccc
Aaa ddd ccc\
`
          )
          return findViews.findModel.search('aaa')
        })
        it('creates scroll-markers appropriately', () => expect(scrollMarker.markers).toEqual({
          0: 2,
          24: 1,
          48: 1
        }))
        it('creates scroll-marker when find-and-replace marker is created', function () {
          editor.setCursorBufferPosition([2, 11])
          editor.insertNewline()
          advanceClock(editor.buffer.stoppedChangingDelay)
          editor.setCursorBufferPosition([3, 0])
          editor.insertText('aaa')
          advanceClock(editor.buffer.stoppedChangingDelay)
          return expect(scrollMarker.markers).toEqual({
            0: 2,
            24: 1,
            48: 1,
            72: 1
          })
        })
        it('decrements scroll-marker when find-and-replace marker is destroyed', function () {
          editor.setCursorBufferPosition([0, 1])
          editor.insertText('.')
          advanceClock(editor.buffer.stoppedChangingDelay)
          return expect(scrollMarker.markers).toEqual({
            0: 1,
            24: 1,
            48: 1
          })
        })
        it('increments scroll-marker when find-and-replace marker is created in a row already containing find-and-replace markers', function () {
          editor.setCursorBufferPosition([2, 0])
          editor.insertText('aaa')
          advanceClock(editor.buffer.stoppedChangingDelay)
          return expect(scrollMarker.markers).toEqual({
            0: 2,
            24: 1,
            48: 2
          })
        })
        it('destroys scroll-marker when all find-and-replace markers are destroyed in a row', function () {
          editor.setCursorBufferPosition([1, 1])
          editor.insertText('.')
          advanceClock(editor.buffer.stoppedChangingDelay)
          return expect(scrollMarker.markers).toEqual({
            0: 2,
            48: 1
          })
        })

        it('changes scroll-markers when find-and-replace marker is changed', function () {
          editor.setCursorBufferPosition([1, 0])
          editor.insertNewline()
          advanceClock(editor.buffer.stoppedChangingDelay)
          return expect(scrollMarker.markers).toEqual({
            0: 2,
            48: 1,
            72: 1
          })
        })

        it('creates appropriate scroll-markers when search is case sensitive', function () {
          findViews.findModel.search('aaa',
            { caseSensitive: true })
          return expect(scrollMarker.markers).toEqual({
            0: 2,
            24: 1
          })
        })
        it('creates appropriate scroll-markers when regex is used', function () {
          findViews.findModel.search('b+',
            { useRegex: true })
          return expect(scrollMarker.markers).toEqual({
            0: 1,
            24: 1
          })
        })
        it('creates appropriate scroll-markers when whole word is searched', function () {
          findViews.findModel.search('aaa',
            { wholeWord: true })
          return expect(scrollMarker.markers).toEqual({
            0: 2,
            48: 1
          })
        })

        return it('updates scroll-markers when scroll height is changed', function () {
          const scrollHeight = editor.getScrollHeight()
          while (true) {
            const preScrollHeight = editor.getScrollHeight()
            if (preScrollHeight > scrollHeight) {
              break
            }
            editor.insertNewline()
            advanceClock(editor.buffer.stoppedChangingDelay)
          }
          const spy = jasmine.createSpy('updateMarkers')
          scrollMarker.onDidUpdateMarkers(spy)
          editor.insertNewline()
          advanceClock(editor.buffer.stoppedChangingDelay)
          return expect(spy).toHaveBeenCalled()
        })
      })

      return describe('when new editor is opened', function () {
        beforeEach(() => waitsForPromise(() => atom.workspace.open('sample2.js')))
        it('attaches scroll-searcher to the root view when new editor is opened', function () {
          const editors = atom.workspace.getTextEditors()
          return (() => {
            const result = []
            for (editor of Array.from(editors)) {
              const ev = atom.views.getView(editor)
              result.push(expect(ev.rootElement.querySelector('.scroll-searcher')).toExist())
            }
            return result
          })()
        })
        return it('updates scroll markers when next editor is activated', function () {
          const spy = jasmine.createSpy('updateMarkers')
          scrollMarker.onDidUpdateMarkers(spy)
          atom.commands.dispatch(editorView, 'pane:show-next-item')
          return expect(spy).toHaveBeenCalled()
        })
      })
    })
  })
  return describe('when find-and-replace is not toggled', () => describe('when scroll-searcher is toggled', function () {
    beforeEach(function () {
      atom.commands.dispatch(editorView, 'scroll-searcher:toggle')

      return waitsForPromise(() => scrollActivationPromise)
    })
    it('does not attach scroll-searchers to root view', () => expect(editorView.rootElement.querySelector('.scroll-searcher')).not.toExist())

    return it('attaches scroll-searchers to root view when find-and-replace is toggled', function () {
      atom.commands.dispatch(editorView, 'find-and-replace:show')
      waitsForPromise(() => activationPromise)
      return runs(() => expect(editorView.rootElement.querySelector('.scroll-searcher')).toExist())
    })
  }))
})

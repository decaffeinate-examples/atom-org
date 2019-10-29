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
const DOMListener = require('../src/dom-listener')

describe('DOMListener', function () {
  let [parent, child, grandchild, listener] = Array.from([])

  beforeEach(function () {
    grandchild = document.createElement('div')
    grandchild.classList.add('grandchild')
    child = document.createElement('div')
    child.classList.add('child')
    parent = document.createElement('div')
    parent.classList.add('parent')
    child.appendChild(grandchild)
    parent.appendChild(child)

    document.querySelector('#jasmine-content').appendChild(parent)

    return listener = new DOMListener(parent)
  })

  describe('when an event is dispatched on an element covered by the listener', function () {
    it("invokes callbacks associated with matching selectors along the event's bubble path", function () {
      const calls = []

      listener.add('.parent', 'event', function (event) {
        expect(this).toBe(parent)
        expect(event.type).toBe('event')
        expect(event.detail).toBe('detail')
        expect(event.target).toBe(grandchild)
        expect(event.currentTarget).toBe(parent)
        expect(event.eventPhase).toBe(Event.BUBBLING_PHASE)
        expect(event.customProperty).toBe('foo')
        return calls.push('parent')
      })

      listener.add('.child', 'event', function (event) {
        expect(this).toBe(child)
        expect(event.type).toBe('event')
        expect(event.detail).toBe('detail')
        expect(event.target).toBe(grandchild)
        expect(event.currentTarget).toBe(child)
        expect(event.eventPhase).toBe(Event.BUBBLING_PHASE)
        expect(event.customProperty).toBe('foo')
        return calls.push('child')
      })

      listener.add('.grandchild', 'event', function (event) {
        expect(this).toBe(grandchild)
        expect(event.type).toBe('event')
        expect(event.detail).toBe('detail')
        expect(event.target).toBe(grandchild)
        expect(event.currentTarget).toBe(grandchild)
        expect(event.eventPhase).toBe(Event.BUBBLING_PHASE)
        expect(event.customProperty).toBe('foo')
        return calls.push('grandchild')
      })

      const dispatchedEvent = new CustomEvent('event', { bubbles: true, detail: 'detail' })
      dispatchedEvent.customProperty = 'foo'
      grandchild.dispatchEvent(dispatchedEvent)

      return expect(calls).toEqual(['grandchild', 'child', 'parent'])
    })

    it('invokes multiple matching callbacks for the same element by selector specificity, then recency', function () {
      child.classList.add('foo', 'bar')
      const calls = []

      listener.add('.child.foo.bar', 'event', () => calls.push('b'))
      listener.add('.child.foo.bar', 'event', () => calls.push('a'))
      listener.add('.child.foo', 'event', () => calls.push('c'))
      listener.add('.child', 'event', () => calls.push('d'))

      grandchild.dispatchEvent(new CustomEvent('event', { bubbles: true }))

      return expect(calls).toEqual(['a', 'b', 'c', 'd'])
    })

    it('invokes inline listeners before selector-based listeners', function () {
      const calls = []

      listener.add('.grandchild', 'event', () => calls.push('grandchild selector'))
      listener.add(child, 'event', function (event) {
        expect(event.eventPhase).toBe(Event.BUBBLING_PHASE)
        expect(event.currentTarget).toBe(child)
        expect(event.target).toBe(grandchild)
        return calls.push('child inline 1')
      })
      listener.add(child, 'event', function (event) {
        expect(event.eventPhase).toBe(Event.BUBBLING_PHASE)
        expect(event.currentTarget).toBe(child)
        expect(event.target).toBe(grandchild)
        return calls.push('child inline 2')
      })
      listener.add('.child', 'event', () => calls.push('child selector'))

      grandchild.dispatchEvent(new CustomEvent('event', { bubbles: true }))

      return expect(calls).toEqual(['grandchild selector', 'child inline 1', 'child inline 2', 'child selector'])
    })

    it('stops invoking listeners on ancestors when .stopPropagation() is called on the synthetic event', function () {
      const calls = []
      listener.add('.parent', 'event', () => calls.push('parent'))
      listener.add('.child', 'event', function (event) { calls.push('child'); return event.stopPropagation() })
      listener.add('.grandchild', 'event', () => calls.push('grandchild'))

      const dispatchedEvent = new CustomEvent('event', { bubbles: true })
      spyOn(dispatchedEvent, 'stopPropagation')
      grandchild.dispatchEvent(dispatchedEvent)

      expect(calls).toEqual(['grandchild', 'child'])
      return expect(dispatchedEvent.stopPropagation).toHaveBeenCalled()
    })

    it('stops invoking listeners entirely when .stopImmediatePropagation() is called on the synthetic event', function () {
      let calls = []
      listener.add('.parent', 'event', () => calls.push('parent'))
      listener.add('.child', 'event', () => calls.push('child 2'))
      listener.add('.child', 'event', function (event) { calls.push('child 1'); return event.stopImmediatePropagation() })
      listener.add('.grandchild', 'event', () => calls.push('grandchild'))

      let dispatchedEvent = new CustomEvent('event', { bubbles: true })
      spyOn(dispatchedEvent, 'stopImmediatePropagation')
      grandchild.dispatchEvent(dispatchedEvent)

      expect(calls).toEqual(['grandchild', 'child 1'])
      expect(dispatchedEvent.stopImmediatePropagation).toHaveBeenCalled()
      calls = []

      // also works on inline listeners
      listener.add(child, 'event', function (event) { calls.push('inline child'); return event.stopImmediatePropagation() })

      dispatchedEvent = new CustomEvent('event', { bubbles: true })
      spyOn(dispatchedEvent, 'stopImmediatePropagation')
      grandchild.dispatchEvent(dispatchedEvent)
      expect(calls).toEqual(['grandchild', 'inline child'])
      return expect(dispatchedEvent.stopImmediatePropagation).toHaveBeenCalled()
    })

    return it('forwards .preventDefault() calls to the original event', function () {
      listener.add('.child', 'event', function (event) {
        event.preventDefault()
        return expect(event.defaultPrevented).toBe(true)
      })

      const dispatchedEvent = new CustomEvent('event', { bubbles: true })
      spyOn(dispatchedEvent, 'preventDefault')
      grandchild.dispatchEvent(dispatchedEvent)
      return expect(dispatchedEvent.preventDefault).toHaveBeenCalled()
    })
  })

  it('allows listeners to be removed via disposables returned from ::add', function () {
    const calls = []

    const disposable1 = listener.add('.child', 'event', () => calls.push('selector 1'))
    const disposable2 = listener.add('.child', 'event', () => calls.push('selector 2'))
    const disposable3 = listener.add(child, 'event', () => calls.push('inline 1'))
    const disposable4 = listener.add(child, 'event', () => calls.push('inline 2'))

    disposable2.dispose()
    disposable4.dispose()

    grandchild.dispatchEvent(new CustomEvent('event', { bubbles: true }))

    return expect(calls).toEqual(['inline 1', 'selector 1'])
  })

  return it('removes all listeners when DOMListener::destroy() is called', function () {
    const calls = []
    listener.add('.child', 'event', () => calls.push('selector'))
    listener.add(child, 'event', () => calls.push('inline'))
    listener.destroy()
    grandchild.dispatchEvent(new CustomEvent('event', { bubbles: true }))
    return expect(calls).toEqual([])
  })
})

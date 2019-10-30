/** @babel */
/* eslint-disable
    no-multi-str,
    no-return-assign,
    no-undef,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const tv = require('../src/television')
const createElement = require('virtual-dom/create-element')

const attachToDocument = element => document.getElementById('jasmine-content').appendChild(element)

describe('television', function () {
  let elementConstructor = null

  afterEach(function () {
    if (elementConstructor != null) {
      elementConstructor.unregisterElement()
    }
    elementConstructor = null
    return document.getElementById('jasmine-content').innerHTML = ''
  })

  describe('.registerElement(name, properties)', function () {
    it('registers a custom element that updates based on the virtual DOM', function () {
      const { div, TelevisionTest } = tv.buildTagFunctions('TelevisionTest')

      elementConstructor = tv.registerElement('television-test', {
        subject: 'World',

        render () {
          return TelevisionTest(
            div(`Hello ${this.subject}!`),
            this.includeSubtitle ? div({ className: 'subtitle' }, 'How Are You?') : undefined
          )
        }
      }
      )

      const element = document.createElement('television-test')
      attachToDocument(element)
      expect(element.outerHTML).toBe('\
<television-test><div>Hello World!</div></television-test>\
'
      )

      element.subject = 'Moon'
      element.updateSync()
      expect(element.outerHTML).toBe('\
<television-test><div>Hello Moon!</div></television-test>\
'
      )

      element.includeSubtitle = true
      element.updateSync()
      return expect(element.outerHTML).toBe('\
<television-test><div>Hello Moon!</div><div class="subtitle">How Are You?</div></television-test>\
'
      )
    })

    it('calls lifecyle hooks on the custom element', function () {
      const { div, TelevisionTest } = tv.buildTagFunctions('TelevisionTest')

      elementConstructor = tv.registerElement('television-test', {
        didCreateHookCalled: false,
        didAttachHookCalled: false,
        didDetachHookCalled: false,

        render () {
          return TelevisionTest(div('Hello World!'))
        },

        didCreate () {
          return this.didCreateHookCalled = true
        },

        didAttach () {
          return this.didAttachHookCalled = true
        },

        didDetach () {
          return this.didDetachHookCalled = true
        }
      }
      )

      const element = document.createElement('television-test')
      expect(element.didCreateHookCalled).toBe(true)
      expect(element.didAttachHookCalled).toBe(false)
      expect(element.didDetachHookCalled).toBe(false)

      attachToDocument(element)
      expect(element.didCreateHookCalled).toBe(true)
      expect(element.didAttachHookCalled).toBe(true)
      expect(element.didDetachHookCalled).toBe(false)

      element.remove()
      expect(element.didCreateHookCalled).toBe(true)
      expect(element.didAttachHookCalled).toBe(true)
      return expect(element.didDetachHookCalled).toBe(true)
    })

    it("assigns references to DOM nodes based on 'ref' attributes", function () {
      const { div, TelevisionTest } = tv.buildTagFunctions('TelevisionTest')

      elementConstructor = tv.registerElement('television-test', {
        foo: true,

        render () {
          return TelevisionTest(
            div({ ref: 'div1', className: 'div-1' }),
            this.foo ? div({ ref: 'div2', className: 'div-2' }) : undefined
          )
        }
      }
      )

      const element = document.createElement('television-test')
      attachToDocument(element)

      expect(element.refs.div1.classList.contains('div-1')).toBe(true)
      expect(element.refs.div2.classList.contains('div-2')).toBe(true)

      element.foo = false
      element.updateSync()
      expect(element.refs.div1.classList.contains('div-1')).toBe(true)
      return expect(element.refs.div2).toBeUndefined()
    })

    it('interacts with the assigned DOM update scheduler on calls to ::update to update and read the DOM', function () {
      const { div, TelevisionTest } = tv.buildTagFunctions('TelevisionTest')

      elementConstructor = tv.registerElement('television-test', {
        updateSyncCalled: false,
        readSyncCalled: false,

        updateSync () {
          return this.updateSyncCalled = true
        },

        readSync () {
          return this.readSyncCalled = true
        }
      }
      )

      const element = document.createElement('television-test')

      const updateFns = []
      const readFns = []

      tv.setDOMScheduler({
        updateDocument (fn) { return updateFns.push(fn) },
        readDocument (fn) { return readFns.push(fn) }
      })

      element.update()
      expect(updateFns.length).toBe(1)
      expect(readFns.length).toBe(1)

      expect(element.updateSyncCalled).toBe(false)
      expect(element.readSyncCalled).toBe(false)

      updateFns[0]()
      expect(element.updateSyncCalled).toBe(true)
      expect(element.readSyncCalled).toBe(false)

      readFns[0]()
      expect(element.updateSyncCalled).toBe(true)
      return expect(element.readSyncCalled).toBe(true)
    })

    return it('throws an exception if the same element name is registered without the previous being unregistered', function () {
      const { TelevisionTest } = tv.buildTagFunctions('TelevisionTest')
      elementConstructor = tv.registerElement('television-test', { render () { return TelevisionTest('Hello') } })
      expect(() => tv.registerElement('television-test', { render () { return TelevisionTest('Goodbye') } })).toThrow()
      elementConstructor.unregisterElement()
      expect(() => elementConstructor.unregisterElement()).toThrow()
      return elementConstructor = tv.registerElement('television-test', { render () { return TelevisionTest('Hello Again') } })
    })
  })

  return describe('.buildTagFunctions(tagNames...)', () => it('returns an object with functions for all the HTML tags, plus any named custom tags', function () {
    const { ChatPanel, div, span, img } = tv.buildTagFunctions('ChatPanel')

    expect(createElement(ChatPanel()).outerHTML).toBe('\
<chat-panel></chat-panel>\
'
    )
    expect(createElement(div({ className: 'hello' }, span('hello'))).outerHTML).toBe('\
<div class="hello"><span>hello</span></div>\
'
    )

    return expect(createElement(img({ src: '/foo/bar.png' })).outerHTML).toBe('\
<img src="/foo/bar.png">\
'
    )
  }))
})

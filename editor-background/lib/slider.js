/** @babel */
/* eslint-disable
    no-return-assign,
    no-unused-expressions,
    no-unused-vars,
    no-useless-call,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

var Slider = (function () {
  let originInput
  let inputStyle
  let input
  let element
  let area
  let button
  let labelStr
  let label
  input = undefined
  let parent
  let min
  let max
  let mouseState
  let mousePos
  let mouseOffset
  let buttonPos
  Slider = class Slider {
    static initClass () {
      originInput = null
      inputStyle = null
      input = null
      element = null
      area = null
      button = null
      labelStr = ''
      label = null
      input = null
      parent = null
      min = 0
      max = 100

      mouseState = false
      mousePos = null
      mouseOffset = null
      buttonPos = null
    }

    constructor (args) {
      if (((args != null ? args.input : undefined) == null)) { return }

      this.mouseState = false
      this.mousePos = null
      this.mouseOffset = null

      this.originInput = args.input
      this.inputStyle = window.getComputedStyle(this.originInput)
      this.originInput.style.display = 'none'

      this.input = document.createElement('input')
      this.input.type = 'text'
      this.input.style.margin = this.inputStyle.margin
      this.input.style.width = '40px'
      this.input.style.textAlign = 'center'
      this.input.value = this.originInput.value

      this.element = document.createElement('div')
      this.element.className = 'slider-element'
      this.element.style.height = this.inputStyle.height
      this.element.style.overflow = 'hidden'

      this.area = document.createElement('div')
      this.area.className = 'slider-area'
      this.area.style.float = 'right'
      this.area.style.height = '10px'
      this.area.style.border = '1px solid ' + this.inputStyle.borderColor
      this.area.style.borderRadius = '10px'
      this.button = document.createElement('div')
      this.button.className = 'slider-button btn btn-default'
      this.buttonPos = { x: 0, y: 0 }
      this.label = document.createElement('label')

      this.left = document.createElement('div')
      this.left.style.float = 'left'
      this.left.appendChild(this.label)
      this.left.appendChild(this.input)

      if (args.min != null) { this.min = args.min }
      if (args.max != null) { this.max = args.max }
      if (args.label != null) { this.labelStr = args.label }

      this.label.innerText = this.labelStr

      this.area.style.position = 'relative'
      this.area.style.height = '10px'
      this.area.style.minWidth = '110px'
      this.area.style.width = this.inputStyle.width
      this.area.style.top = '10px'
      this.area.style.verticalAlign = 'middle'
      this.area.style.boxShadow = 'inset 2px 2px 2px rgba(0,0,0,0.2)'

      this.button.style.width = '10px'
      this.buttonWidth = 10
      this.button.style.height = '12px'
      this.button.style.padding = '0'
      if (this.originInput.value != null) {
        if (this.originInput.value !== '') {
          this.value = /[0-9]+/gi.exec(this.originInput.value)[0]
        }
      }

      this.button.style.left = this.positionFromValue(this.value)
      this.button.style.top = '-2px'
      this.button.style.borderRadius = '3px'
      this.button.style.position = 'absolute'
      this.button.style.transform = 'scale(1,1.4)'
      this.button.addEventListener('mousedown', ev => this.mouseDown.apply(this, [ev]))
      window.addEventListener('mouseup', ev => this.mouseUp.apply(this, [ev]))
      window.addEventListener('mousemove', ev => this.mouseMove.apply(this, [ev]))

      this.area.appendChild(this.button)
      this.element.appendChild(this.left)
      this.element.appendChild(this.area)
      this.parent = this.originInput.parentElement
      this.prev = this.originInput.previousElementSibling
      this.next = this.originInput.nextElementSibling
      this

      if (this.prev != null) {
        this.parent.insertBefore(this.element, this.prev.nextElementSibling)
      } else {
        if (this.next != null) {
          this.parent.insertBefore(this.element, this.next)
        } else {
          this.parent.appendChild(this.element)
        }
      }
      this
    }

    positionFromValue (value) {
      const w = this.getAreaWidth()
      const left = Math.round((value / 100) * w)
      return left + 'px'
    }

    getAreaWidth () {
      const comptd = window.getComputedStyle(this.area)
      const w1 = /[0-9]+/gi.exec(comptd.width)
      const w2 = /[0-9]+/gi.exec(comptd.minWidth)
      if ((w1 != null ? w1[0] : undefined) != null) {
        this.areaWidth = w1[0]
      } else {
        if ((w2 != null ? w2[0] : undefined) != null) {
          this.areaWidth = w2[0]
        } else {
          this.areaWidth = 110
        }
      }
      return this.areaWidth
    }

    mouseDown (ev) {
      return this.mouseState = true
    }

    mouseUp (ev) {
      this.mouseState = false
      return this.mousePos = null
    }

    mouseMove (ev) {
      if (this.mouseState) {
        ev.preventDefault()
        const pos = { x: ev.x, y: ev.y }
        if (this.mousePos != null) {
          const diff = { x: pos.x - this.mousePos.x, y: pos.y - this.mousePos.y }
          this.buttonPos.x += diff.x

          this.areaWidth = this.getAreaWidth()

          if (this.buttonPos.x < 0) { this.buttonPos.x = 0 }
          if ((this.buttonPos.x + this.buttonWidth) > this.areaWidth) {
            this.buttonPos.x = this.areaWidth - this.buttonWidth
          }
          this.button.style.left = this.buttonPos.x + 'px'
          const range = this.areaWidth - this.buttonWidth
          this.value = Math.round((this.buttonPos.x / range) * 100)
          this.input.value = this.value
          this.originInput.value = this.value
        }
        return this.mousePos = pos
      }
    }
  }
  Slider.initClass()
  return Slider
})()

module.exports = Slider

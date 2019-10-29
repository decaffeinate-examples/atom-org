/** @babel */
/* eslint-disable
    no-return-assign,
    no-use-before-define,
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
/*
 jQuery Simple Slider

 Copyright (c) 2012 James Smith (http://loopj.com)

 Licensed under the MIT license (http://mit-license.org/)
*/
const {
  $
} = require('atom-space-pen-views');

(function ($, window) {
  //
  // Main slider class
  //

  class SimpleSlider {
    // Build a slider object.
    // Exposed via el.numericalSlider(options)
    constructor (input, options) {
      // Load in the settings
      this.input = input
      this.defaultOptions = {
        animate: true,
        snapMid: false,
        classPrefix: null,
        classSuffix: null,
        theme: null,
        highlight: false
      }

      this.settings = $.extend({}, this.defaultOptions, options)
      if (this.settings.theme) { this.settings.classSuffix = `-${this.settings.theme}` }

      // Hide the original input
      this.input.hide()

      // Create the slider canvas
      this.slider = $('<div>')
        .addClass('slider' + (this.settings.classSuffix || ''))
        .css({
          position: 'relative',
          userSelect: 'none',
          boxSizing: 'border-box'
        }).insertBefore(this.input)
      if (this.input.attr('id')) { this.slider.attr('id', this.input.attr('id') + '-slider') }

      this.track = this.createDivElement('track')
        .css({ width: '100%' })

      if (this.settings.highlight) {
        // Create the highlighting track on top of the track
        this.highlightTrack = this.createDivElement('highlight-track')
          .css({ width: '0' })
      }

      // Create the slider drag target
      this.dragger = this.createDivElement('dragger')

      // Adjust dimensions now elements are in the DOM
      this.slider.css({
        minHeight: this.dragger.outerHeight(),
        marginLeft: this.dragger.outerWidth() / 2,
        marginRight: this.dragger.outerWidth() / 2
      })

      this.track.css({ marginTop: this.track.outerHeight() / -2 })

      if (this.settings.highlight) {
        this.highlightTrack.css({ marginTop: this.track.outerHeight() / -2 })
      }

      this.dragger.css({
        marginTop: this.dragger.outerHeight() / -2,
        marginLeft: this.dragger.outerWidth() / -2
      })

      // Hook up drag/drop mouse events
      this.track
        .mousedown(e => {
          return this.trackEvent(e)
        })

      if (this.settings.highlight) {
        this.highlightTrack
          .mousedown(e => {
            return this.trackEvent(e)
          })
      }

      this.dragger
        .mousedown(e => {
          if (e.which !== 1) { return }

          // We've started moving
          this.dragging = true
          this.dragger.addClass('dragging')

          // Update the slider position
          this.domDrag(e.pageX, e.pageY)

          return false
        })

      $('body')
        .mousemove(e => {
          if (this.dragging) {
            // Update the slider position
            this.domDrag(e.pageX, e.pageY)

            // Always show a pointer when dragging
            return $('body').css({ cursor: 'pointer' })
          }
        }).mouseup(e => {
          if (this.dragging) {
            // Finished dragging
            this.dragging = false
            this.dragger.removeClass('dragging')

            // Revert the cursor
            return $('body').css({ cursor: 'auto' })
          }
        })

      // Set slider initial position
      this.pagePos = 0

      // Fill in initial slider value
      if (this.input.val() === '') {
        this.value = this.getRange().min
        this.input.val(this.value)
      } else {
        this.value = this.nearestValidValue(this.input.val())
      }

      this.setSliderPositionFromValue(this.value)

      // We are ready to go
      const ratio = this.valueToRatio(this.value)
      this.input.trigger('slider-ready', {
        value: this.value,
        ratio,
        position: ratio * this.slider.outerWidth(),
        el: this.slider
      }
      )
    }

    // Create the basis of the track-div(s)
    createDivElement (classname) {
      const item = $('<div>')
        .addClass(classname)
        .css({
          position: 'absolute',
          top: '50%',
          userSelect: 'none',
          cursor: 'pointer'
        }).appendTo(this.slider)
      return item
    }

    // Set the ratio (value between 0 and 1) of the slider.
    // Exposed via el.slider("setRatio", ratio)
    setRatio (ratio) {
      // Range-check the ratio
      ratio = Math.min(1, ratio)
      ratio = Math.max(0, ratio)

      // Work out the value
      const value = this.ratioToValue(ratio)

      // Update the position of the slider on the screen
      this.setSliderPositionFromValue(value)

      // Trigger value changed events
      return this.valueChanged(value, ratio, 'setRatio')
    }

    // Set the value of the slider
    // Exposed via el.slider("setValue", value)
    setValue (value) {
      // Snap value to nearest step or allowedValue
      value = this.nearestValidValue(value)

      // Work out the ratio
      const ratio = this.valueToRatio(value)

      // Update the position of the slider on the screen
      this.setSliderPositionFromValue(value)

      // Trigger value changed events
      return this.valueChanged(value, ratio, 'setValue')
    }

    // Respond to an event on a track
    trackEvent (e) {
      if (e.which !== 1) { return }

      this.domDrag(e.pageX, e.pageY, true)
      this.dragging = true
      return false
    }

    // Respond to a dom drag event
    domDrag (pageX, pageY, animate) {
      // Normalize position within allowed range
      if (animate == null) { animate = false }
      let pagePos = pageX - this.slider.offset().left
      pagePos = Math.min(this.slider.outerWidth(), pagePos)
      pagePos = Math.max(0, pagePos)

      // If the element position has changed, do stuff
      if (this.pagePos !== pagePos) {
        this.pagePos = pagePos

        // Set the percentage value of the slider
        const ratio = pagePos / this.slider.outerWidth()

        // Trigger value changed events
        const value = this.ratioToValue(ratio)
        this.valueChanged(value, ratio, 'domDrag')

        // Update the position of the slider on the screen
        if (this.settings.snap) {
          return this.setSliderPositionFromValue(value, animate)
        } else {
          return this.setSliderPosition(pagePos, animate)
        }
      }
    }

    // Set the slider position given a slider canvas position
    setSliderPosition (position, animate) {
      if (animate == null) { animate = false }
      if (animate && this.settings.animate) {
        this.dragger.animate({ left: position }, 200)
        if (this.settings.highlight) { return this.highlightTrack.animate({ width: position }, 200) }
      } else {
        this.dragger.css({ left: position })
        if (this.settings.highlight) { return this.highlightTrack.css({ width: position }) }
      }
    }

    // Set the slider position given a value
    setSliderPositionFromValue (value, animate) {
      // Get the slide ratio from the value
      if (animate == null) { animate = false }
      const ratio = this.valueToRatio(value)

      // Set the slider position
      return this.setSliderPosition(ratio * this.slider.outerWidth(), animate)
    }

    // Get the valid range of values
    getRange () {
      if (this.settings.allowedValues) {
        return {
          min: Math.min(...Array.from(this.settings.allowedValues || [])),
          max: Math.max(...Array.from(this.settings.allowedValues || []))
        }
      } else if (this.settings.range) {
        return {
          min: parseFloat(this.settings.range[0]),
          max: parseFloat(this.settings.range[1])
        }
      } else {
        return {
          min: 0,
          max: 1
        }
      }
    }

    // Find the nearest valid value, checking allowedValues and step settings
    nearestValidValue (rawValue) {
      const range = this.getRange()

      // Range-check the value
      rawValue = Math.min(range.max, rawValue)
      rawValue = Math.max(range.min, rawValue)

      // Apply allowedValues or step settings
      if (this.settings.allowedValues) {
        let closest = null
        $.each(this.settings.allowedValues, function () {
          if ((closest === null) || (Math.abs(this - rawValue) < Math.abs(closest - rawValue))) {
            return closest = this
          }
        })

        return closest
      } else if (this.settings.step) {
        const maxSteps = (range.max - range.min) / this.settings.step
        let steps = Math.floor((rawValue - range.min) / this.settings.step)
        if ((((rawValue - range.min) % this.settings.step) > (this.settings.step / 2)) && (steps < maxSteps)) { steps += 1 }

        return (steps * this.settings.step) + range.min
      } else {
        return rawValue
      }
    }

    // Convert a value to a ratio
    valueToRatio (value) {
      if (this.settings.equalSteps) {
        // Get slider ratio for equal-step
        let closestIdx
        for (let idx = 0; idx < this.settings.allowedValues.length; idx++) {
          const allowedVal = this.settings.allowedValues[idx]
          if ((closest == null) || (Math.abs(allowedVal - value) < Math.abs(closest - value))) {
            var closest = allowedVal
            closestIdx = idx
          }
        }

        if (this.settings.snapMid) {
          return (closestIdx + 0.5) / this.settings.allowedValues.length
        } else {
          return (closestIdx) / (this.settings.allowedValues.length - 1)
        }
      } else {
        // Get slider ratio for continuous values
        const range = this.getRange()
        return (value - range.min) / (range.max - range.min)
      }
    }

    // Convert a ratio to a valid value
    ratioToValue (ratio) {
      if (this.settings.equalSteps) {
        const steps = this.settings.allowedValues.length
        const step = Math.round((ratio * steps) - 0.5)
        const idx = Math.min(step, this.settings.allowedValues.length - 1)

        return this.settings.allowedValues[idx]
      } else {
        const range = this.getRange()
        const rawValue = (ratio * (range.max - range.min)) + range.min

        return this.nearestValidValue(rawValue)
      }
    }

    // Trigger value changed events
    valueChanged (value, ratio, trigger) {
      if (value.toString() === this.value.toString()) { return }

      // Save the new value
      this.value = value

      // Construct event data and fire event
      const eventData = {
        value,
        ratio,
        position: ratio * this.slider.outerWidth(),
        trigger,
        el: this.slider
      }

      return this.input
        .val(value)
        .trigger($.Event('change', eventData))
        .trigger('sliderchanged', eventData)
    }
  }

  //
  // Expose as jQuery Plugin
  //

  return $.extend($.fn, {
    simpleSlider (settingsOrMethod, ...params) {
      const publicMethods = ['setRatio', 'setValue']
      $(this).each(function () {
        if (settingsOrMethod && Array.from(publicMethods).includes(settingsOrMethod)) {
          const obj = $(this).data('slider-object')

          return obj[settingsOrMethod].apply(obj, params)
        } else {
          const settings = settingsOrMethod
          return $(this).data('slider-object', new SimpleSlider($(this), settings))
        }
      })

      //
      // Attach unobtrusive JS hooks
      //

      return $('[data-slider]').each(function () {
        const $el = $(this)

        // Build options object from data attributes
        const settings = {}

        const allowedValues = $el.data('slider-values')
        if (allowedValues) { settings.allowedValues = (Array.from(allowedValues.split(',')).map((x) => parseFloat(x))) }
        if ($el.data('slider-range')) { settings.range = $el.data('slider-range').split(',') }
        if ($el.data('slider-step')) { settings.step = $el.data('slider-step') }
        settings.snap = $el.data('slider-snap')
        settings.equalSteps = $el.data('slider-equal-steps')
        if ($el.data('slider-theme')) { settings.theme = $el.data('slider-theme') }
        if ($el.attr('data-slider-highlight')) { settings.highlight = $el.data('slider-highlight') }
        if ($el.data('slider-animate') != null) { settings.animate = $el.data('slider-animate') }

        // Activate the plugin
        return $el.simpleSlider(settings)
      })
    }
  })
})($, window)

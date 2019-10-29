/** @babel */
/* eslint-disable
    no-return-assign,
    no-undef,
    no-unmodified-loop-condition,
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
let StatsTracker
const { $ } = require('atom-space-pen-views')

module.exports =
(StatsTracker = (function () {
  StatsTracker = class StatsTracker {
    static initClass () {
      this.prototype.startDate = new Date()
      this.prototype.hours = 6
      this.prototype.eventLog = {}
    }

    constructor () {
      const date = new Date(this.startDate)
      const future = new Date(date.getTime() + (36e5 * this.hours))
      this.eventLog[this.time(date)] = 0

      while (date < future) {
        this.eventLog[this.time(date)] = 0
      }

      const workspaceView = atom.views.getView(atom.workspace)
      $(workspaceView).on('keydown', () => this.track())
      $(workspaceView).on('mouseup', () => this.track())
    }

    clear () {
      return this.eventLog = {}
    }

    track () {
      const date = new Date()
      const times = this.time(date)
      if (this.eventLog[times] == null) { this.eventLog[times] = 0 }
      this.eventLog[times] += 1
      if (this.eventLog.length > (this.hours * 60)) { return this.eventLog.shift() }
    }

    time (date) {
      date.setTime(date.getTime() + 6e4)
      const hour = date.getHours()
      const minute = date.getMinutes()
      return `${hour}:${minute}`
    }
  }
  StatsTracker.initClass()
  return StatsTracker
})())

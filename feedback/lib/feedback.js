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
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const { CompositeDisposable } = require('atom')
let FeedbackAPI = null
let Reporter = null

module.exports = {
  config: {
    alwaysShowInDevMode: {
      type: 'boolean',
      default: false
    }
  },

  feedbackSource: 'survey-2015-1',

  activate () {
    this.statusBarPromise = new Promise(resolve => {
      return this.resolveStatusBarPromise = resolve
    })

    return process.nextTick(() => {
      FeedbackAPI = require('./feedback-api')
      return this.checkShouldRequestFeedback().then(shouldRequestFeedback => {
        if (Reporter == null) { Reporter = require('./reporter') }
        if (shouldRequestFeedback) {
          this.addStatusBarItem()
          this.subscriptions = new CompositeDisposable()
          this.subscriptions.add(atom.commands.add('atom-workspace', 'feedback:show', () => this.showModal()))
          return Reporter.sendEvent('did-show-status-bar-link')
        }
      })
    })
  },

  consumeStatusBar (statusBar) {
    return this.resolveStatusBarPromise(statusBar)
  },

  consumeReporter (realReporter) {
    if (Reporter == null) { Reporter = require('./reporter') }
    return Reporter.setReporter(realReporter)
  },

  getStatusBar () {
    return this.statusBarPromise
  },

  addStatusBarItem () {
    if (this.statusBarTile != null) { return }
    const FeedbackStatusElement = require('./feedback-status-element')
    const workspaceElement = atom.views.getView(atom.workspace)

    return this.getStatusBar().then(statusBar => {
      const item = new FeedbackStatusElement()
      item.initialize({ feedbackSource: this.feedbackSource })
      return this.statusBarTile = statusBar.addRightTile({ item, priority: -1 })
    })
  },

  showModal () {
    if (this.modal == null) {
      const FeedbackModalElement = require('./feedback-modal-element')
      this.modal = new FeedbackModalElement()
      this.modal.initialize({ feedbackSource: this.feedbackSource })
      this.modal.onDidStartSurvey(() => this.detectCompletedSurvey())
    }
    return this.modal.show()
  },

  checkShouldRequestFeedback () {
    const client = FeedbackAPI.getClientID()
    return FeedbackAPI.fetchSurveyMetadata(this.feedbackSource).then(metadata => {
      return new Promise(resolve => {
        const shouldRequest = (() => {
          if (atom.inSpecMode() || (atom.inDevMode() && atom.config.get('feedback.alwaysShowInDevMode'))) {
            return true
          } else if (client) {
            const { crc32 } = require('crc')
            const checksum = crc32(client + this.feedbackSource + metadata.display_seed)
            return (checksum % 100) < (metadata.display_percent != null ? metadata.display_percent : 0)
          } else {
            return false
          }
        })()

        if (shouldRequest) {
          return FeedbackAPI.fetchDidCompleteFeedback(this.feedbackSource).then(function (didCompleteSurvey) {
            if (Reporter == null) { Reporter = require('./reporter') }
            if (didCompleteSurvey) { Reporter.sendEvent('already-finished-survey') }
            return resolve(!didCompleteSurvey)
          })
        } else {
          return resolve(false)
        }
      })
    })
  },

  detectCompletedSurvey () {
    return FeedbackAPI.detectDidCompleteFeedback(this.feedbackSource).then(() => {
      if (Reporter == null) { Reporter = require('./reporter') }
      Reporter.sendEvent('did-finish-survey')
      return this.statusBarTile.destroy()
    })
  },

  deactivate () {
    if (this.subscriptions != null) {
      this.subscriptions.dispose()
    }
    if (this.statusBarTile != null) {
      this.statusBarTile.destroy()
    }
    this.statusBarTile = null
    if (this.modal != null) {
      this.modal.destroy()
    }
    return this.modal = null
  }
}

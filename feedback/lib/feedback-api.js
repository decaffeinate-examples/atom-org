/** @babel */
/* eslint-disable
    no-return-assign,
    no-undef,
    standard/no-callback-literal,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const $ = require('jquery')

const SurveyURL = 'https://atom.io/survey'

module.exports = {
  PollInterval: 10000,

  getClientID () {
    return localStorage.getItem('metrics.userId')
  },

  getSurveyURL (source) {
    return `${SurveyURL}/${source}/${this.getClientID()}`
  },

  fetchSurveyMetadata (source) {
    return new Promise(function (resolve) {
      const url = `https://atom.io/api/feedback/${source}`
      return $.ajax(url, {
        accept: 'application/json',
        contentType: 'application/json',
        success (data) { return resolve(data) },
        error () {
          return resolve({
            display_seed: 'none',
            display_percent: 0
          })
        }
      }
      )
    })
  },

  fetchDidCompleteFeedback (source) {
    return new Promise(resolve => {
      const url = `https://atom.io/api/feedback/${source}/${this.getClientID()}`
      return $.ajax(url, {
        accept: 'application/json',
        contentType: 'application/json',
        success (data) { return resolve(data.completed) }
      }
      )
    })
  },

  detectDidCompleteFeedback (source) {
    var detectCompleted = callback => {
      this.cancelDidCompleteFeedbackDetection()
      return this.detectionTimeout = setTimeout(() => {
        return this.fetchDidCompleteFeedback(source).then(function (didCompleteFeedback) {
          if (didCompleteFeedback) {
            return callback(true)
          } else {
            return detectCompleted(callback)
          }
        })
      }
      , this.PollInterval)
    }

    return new Promise(resolve => detectCompleted(completed => resolve(completed)))
  },

  cancelDidCompleteFeedbackDetection () {
    clearTimeout(this.detectionTimeout)
    return this.detectionTimeout = null
  }
}

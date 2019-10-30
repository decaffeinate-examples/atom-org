/** @babel */
/* eslint-disable
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let FeedbackModalElement
const { Emitter } = require('atom')

const Template = `\
<h1>Help Improve Atom</h1>
<p>
  Our engineers and designers are interested in how you use Atom and where we
  can improve the experience.
</p>
<p>
  We'll share what we learn in a blog post.
</p>
<div class="btn-toolbar">
  <a href="{{SurveyURL}}" class="btn btn-primary">1-minute survey</a>
  <a href="#" class="btn btn-cancel">Not right now</a>
</div>\
`

module.exports =
(FeedbackModalElement = class FeedbackModalElement extends HTMLElement {
  initialize ({ feedbackSource }) {
    this.emitter = new Emitter()
    const Reporter = require('./reporter')
    const FeedbackAPI = require('./feedback-api')

    this.innerHTML = Template.replace('{{SurveyURL}}', FeedbackAPI.getSurveyURL(feedbackSource))
    this.querySelector('.btn-primary').addEventListener('click', () => {
      Reporter.sendEvent('did-click-modal-cta')
      this.emitter.emit('did-start-survey')
      return this.hide()
    })
    return this.querySelector('.btn-cancel').addEventListener('click', () => {
      Reporter.sendEvent('did-click-modal-cancel')
      return this.hide()
    })
  }

  onDidStartSurvey (callback) {
    return this.emitter.on('did-start-survey', callback)
  }

  show () {
    if (this.modalPanel == null) { this.modalPanel = atom.workspace.addModalPanel({ item: this }) }
    return this.modalPanel.show()
  }

  hide () {
    return this.modalPanel.hide()
  }

  destroy () {
    if (this.modalPanel != null) {
      this.modalPanel.destroy()
    }
    this.modalPanel = null
    return this.emitter.dispose()
  }
})

module.exports = document.registerElement('feedback-modal',
  { prototype: FeedbackModalElement.prototype })

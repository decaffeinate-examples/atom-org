/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let FeedbackStatusElement;
const Template = `\
<a href="#" class="inline-block">1-minute survey</a>\
`;

module.exports =
(FeedbackStatusElement = class FeedbackStatusElement extends HTMLElement {
  initialize({feedbackSource}) {
    this.feedbackSource = feedbackSource;
  }

  attachedCallback() {
    this.innerHTML = Template;
    atom.tooltips.add(this, {title: "Help us improve Atom by giving feedback"});

    if (!localStorage.getItem(`hasClickedSurveyLink-${this.feedbackSource}`)) {
      this.classList.add('promote');
    }

    return this.querySelector('a').addEventListener('click', e => {
      localStorage.setItem(`hasClickedSurveyLink-${this.feedbackSource}`, true);
      this.classList.remove('promote');

      const Reporter = require('./reporter');
      Reporter.sendEvent('did-click-status-bar-link');

      e.preventDefault();
      return atom.commands.dispatch(this, 'feedback:show');
    });
  }
});

module.exports = document.registerElement('feedback-status',
  {prototype: FeedbackStatusElement.prototype});

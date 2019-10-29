/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
module.exports = {
  queue: [],
  source: 'survey-2015-1',

  setReporter(reporter) {
    this.reporter = reporter;
    for (let event of Array.from(this.queue)) {
      this.reporter.sendEvent.apply(this.reporter, event);
    }
    return this.queue = null;
  },

  sendEvent(action, label, value) {
    if (this.reporter) {
      return this.reporter.sendEvent(this.source, action, label, value);
    } else {
      return this.queue.push([this.source, action, label, value]);
    }
  }
};

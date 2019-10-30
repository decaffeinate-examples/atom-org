/** @babel */
/* eslint-disable
    no-undef,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ProjectRingNotification
module.exports =
(ProjectRingNotification = class ProjectRingNotification {
  notify (message) {
    if (!this.isEnabled || !message) { return }
    return atom.notifications.addSuccess(message)
  }

  warn (message, autoDismiss) {
    if (!this.isEnabled || !message) { return }
    return atom.notifications.addWarning(message, { dismissable: !autoDismiss })
  }

  alert (message) {
    if (!message) { return }
    return atom.notifications.addError(message, { dismissable: true })
  }
})

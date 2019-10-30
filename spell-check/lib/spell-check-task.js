/** @babel */
/* eslint-disable
    no-return-assign,
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS202: Simplify dynamic range loops
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let SpellCheckTask
let idCounter = 0

module.exports =
(SpellCheckTask = (function () {
  SpellCheckTask = class SpellCheckTask {
    static initClass () {
      this.handler = null
      this.jobs = []
    }

    constructor (manager) {
      this.manager = manager
      this.id = idCounter++
    }

    terminate () {
      return this.constructor.removeFromArray(this.constructor.jobs, function (j) { return j.args.id === this.id })
    }

    start (editor, onDidSpellCheck) {
      // Figure out the paths since we need that for checkers that are project-specific.
      const buffer = editor.getBuffer()
      let projectPath = null
      let relativePath = null
      if (__guard__(buffer != null ? buffer.file : undefined, x => x.path)) {
        [projectPath, relativePath] = Array.from(atom.project.relativizePath(buffer.file.path))
      }

      // Remove old jobs for this SpellCheckTask from the shared jobs list.
      this.constructor.removeFromArray(this.constructor.jobs, function (j) { return j.args.id === this.id })

      // Create an job that contains everything we'll need to do the work.
      const job = {
        manager: this.manager,
        callbacks: [onDidSpellCheck],
        editorId: editor.id,
        args: {
          id: this.id,
          projectPath,
          relativePath,
          text: buffer.getText()
        }
      }

      // If we already have a job for this work piggy-back on it with our callback.
      if (this.constructor.piggybackExistingJob(job)) { return }

      // Do the work now if not busy or queue it for later.
      this.constructor.jobs.unshift(job)
      if (this.constructor.jobs.length === 1) { return this.constructor.startNextJob() }
    }

    static piggybackExistingJob (newJob) {
      if (this.jobs.length > 0) {
        for (const job of Array.from(this.jobs)) {
          if (this.isDuplicateRequest(job, newJob)) {
            job.callbacks = job.callbacks.concat(newJob.callbacks)
            return true
          }
        }
      }
      return false
    }

    static isDuplicateRequest (a, b) {
      return (a.args.projectPath === b.args.projectPath) && (a.args.relativePath === b.args.relativePath)
    }

    static removeFromArray (array, predicate) {
      if (array.length > 0) {
        for (let i = 0, end = array.length - 1, asc = end >= 0; asc ? i <= end : i >= end; asc ? i++ : i--) {
          if (predicate(array[i])) {
            const found = array[i]
            array.splice(i, 1)
            return found
          }
        }
      }
    }

    static startNextJob () {
      const activeEditorId = __guard__(atom.workspace.getActiveTextEditor(), x => x.id)
      const job = this.jobs.find(j => j.editorId === activeEditorId) || this.jobs[0]

      return job.manager.check(job.args, job.args.text).then(results => {
        this.removeFromArray(this.jobs, j => j.args.id === job.args.id)
        for (const callback of Array.from(job.callbacks)) { callback(results.misspellings) }

        if (this.jobs.length > 0) { return this.startNextJob() }
      })
    }

    static clear () {
      return this.jobs = []
    }
  }
  SpellCheckTask.initClass()
  return SpellCheckTask
})())

function __guard__ (value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined
}

/** @babel */
/* eslint-disable
    no-return-assign,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
module.exports = function (jasmine) {
  let CallbackCompletion
  const originalExecute = jasmine.WaitsForBlock.prototype.execute

  jasmine.WaitsForBlock.prototype.execute = function (onComplete) {
    if (this.latchFunction.length > 0) {
      return this.waitForCallback(onComplete)
    } else {
      return originalExecute.call(this, onComplete)
    }
  }

  jasmine.WaitsForBlock.prototype.waitForCallback = function (onComplete) {
    const onTimeout = () => {
      this.spec.fail({
        name: 'timeout',
        message: 'timed out after ' + this.timeout + ' ms waiting for ' + (this.message != null ? this.message : 'something to happen')
      })
      callbackCompletion.cancelled = true
      this.abort = true
      return onComplete()
    }

    const timeoutHandle = this.env.setTimeout(onTimeout, this.timeout)
    var callbackCompletion = new CallbackCompletion(this.latchFunction.length, this.env, onComplete, timeoutHandle)

    try {
      return this.latchFunction.apply(this.spec, callbackCompletion.completionFunctions)
    } catch (e) {
      this.spec.fail(e)
      onComplete()
    }
  }

  return CallbackCompletion = class CallbackCompletion {
    constructor (count, env, onComplete, timeoutHandle) {
      this.count = count
      this.env = env
      this.onComplete = onComplete
      this.timeoutHandle = timeoutHandle
      this.completionStatuses = new Array(this.count)
      this.completionFunctions = new Array(this.count)
      for (let i = 0, end = count, asc = end >= 0; asc ? i < end : i > end; asc ? i++ : i--) {
        this.completionStatuses[i] = false
        this.completionFunctions[i] = this.buildCompletionFunction(i)
      }
    }

    attemptCompletion () {
      if (this.cancelled) { return }
      for (const status of Array.from(this.completionStatuses)) {
        if (status === false) { return }
      }
      this.env.clearTimeout(this.timeoutHandle)
      return this.onComplete()
    }

    buildCompletionFunction (i) {
      let alreadyCalled = false
      return () => {
        if (alreadyCalled) { return }
        alreadyCalled = true
        this.completionStatuses[i] = true
        return this.attemptCompletion()
      }
    }
  }
}

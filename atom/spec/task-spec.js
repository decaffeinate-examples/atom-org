/** @babel */
/* eslint-disable
    no-return-assign,
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
const Task = require('../src/task')
const Grim = require('grim')

describe('Task', function () {
  describe('@once(taskPath, args..., callback)', () => it('terminates the process after it completes', function () {
    let handlerResult = null
    const task = Task.once(require.resolve('./fixtures/task-spec-handler'), result => handlerResult = result)

    let processErrored = false
    const {
      childProcess
    } = task
    spyOn(childProcess, 'kill').andCallThrough()
    task.childProcess.on('error', () => processErrored = true)

    waitsFor(() => handlerResult != null)

    return runs(function () {
      expect(handlerResult).toBe('hello')
      expect(childProcess.kill).toHaveBeenCalled()
      return expect(processErrored).toBe(false)
    })
  }))

  it('calls listeners registered with ::on when events are emitted in the task', function () {
    const task = new Task(require.resolve('./fixtures/task-spec-handler'))

    const eventSpy = jasmine.createSpy('eventSpy')
    task.on('some-event', eventSpy)

    waitsFor(done => task.start(done))

    return runs(() => expect(eventSpy).toHaveBeenCalledWith(1, 2, 3))
  })

  it('unregisters listeners when the Disposable returned by ::on is disposed', function () {
    const task = new Task(require.resolve('./fixtures/task-spec-handler'))

    const eventSpy = jasmine.createSpy('eventSpy')
    const disposable = task.on('some-event', eventSpy)
    disposable.dispose()

    waitsFor(done => task.start(done))

    return runs(() => expect(eventSpy).not.toHaveBeenCalled())
  })

  it('reports deprecations in tasks', function () {
    jasmine.snapshotDeprecations()
    const handlerPath = require.resolve('./fixtures/task-handler-with-deprecations')
    const task = new Task(handlerPath)

    waitsFor(done => task.start(done))

    return runs(function () {
      const deprecations = Grim.getDeprecations()
      expect(deprecations.length).toBe(1)
      expect(deprecations[0].getStacks()[0][1].fileName).toBe(handlerPath)
      return jasmine.restoreDeprecationsSnapshot()
    })
  })

  it('adds data listeners to standard out and error to report output', function () {
    const task = new Task(require.resolve('./fixtures/task-spec-handler'))
    const { stdout, stderr } = task.childProcess

    task.start()
    task.start()
    expect(stdout.listeners('data').length).toBe(1)
    expect(stderr.listeners('data').length).toBe(1)

    task.terminate()
    expect(stdout.listeners('data').length).toBe(0)
    return expect(stderr.listeners('data').length).toBe(0)
  })

  it('does not throw an error for forked processes missing stdout/stderr', function () {
    spyOn(require('child_process'), 'fork').andCallFake(function () {
      const Events = require('events')
      const fakeProcess = new Events()
      fakeProcess.send = function () {}
      fakeProcess.kill = function () {}
      return fakeProcess
    })

    const task = new Task(require.resolve('./fixtures/task-spec-handler'))
    expect(() => task.start()).not.toThrow()
    return expect(() => task.terminate()).not.toThrow()
  })

  return describe('::cancel()', function () {
    it("dispatches 'task:cancelled' when invoked on an active task", function () {
      const task = new Task(require.resolve('./fixtures/task-spec-handler'))
      const cancelledEventSpy = jasmine.createSpy('eventSpy')
      task.on('task:cancelled', cancelledEventSpy)
      const completedEventSpy = jasmine.createSpy('eventSpy')
      task.on('task:completed', completedEventSpy)

      expect(task.cancel()).toBe(true)
      expect(cancelledEventSpy).toHaveBeenCalled()
      return expect(completedEventSpy).not.toHaveBeenCalled()
    })

    return it("does not dispatch 'task:cancelled' when invoked on an inactive task", function () {
      let handlerResult = null
      const task = Task.once(require.resolve('./fixtures/task-spec-handler'), result => handlerResult = result)

      waitsFor(() => handlerResult != null)

      return runs(function () {
        const cancelledEventSpy = jasmine.createSpy('eventSpy')
        task.on('task:cancelled', cancelledEventSpy)
        expect(task.cancel()).toBe(false)
        return expect(cancelledEventSpy).not.toHaveBeenCalled()
      })
    })
  })
})

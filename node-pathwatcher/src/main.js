/** @babel */
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const binding = require('../build/Release/pathwatcher.node')
const { HandleMap } = binding
const { Emitter } = require('event-kit')
const fs = require('fs')
const path = require('path')

let handleWatchers = null

class HandleWatcher {
  constructor (path1) {
    this.path = path1
    this.emitter = new Emitter()
    this.start()
  }

  onEvent (event, filePath, oldFilePath) {
    if (filePath) { filePath = path.normalize(filePath) }
    if (oldFilePath) { oldFilePath = path.normalize(oldFilePath) }

    switch (event) {
      case 'rename':
        // Detect atomic write.
        this.close()
        var detectRename = () => {
          return fs.stat(this.path, err => {
            if (err) { // original file is gone it's a rename.
              this.path = filePath
              // On OS X files moved to ~/.Trash should be handled as deleted.
              if ((process.platform === 'darwin') && (/\/\.Trash\//).test(filePath)) {
                this.emitter.emit('did-change', { event: 'delete', newFilePath: null })
                return this.close()
              } else {
                this.start()
                return this.emitter.emit('did-change', { event: 'rename', newFilePath: filePath })
              }
            } else { // atomic write.
              this.start()
              return this.emitter.emit('did-change', { event: 'change', newFilePath: null })
            }
          })
        }
        return setTimeout(detectRename, 100)
      case 'delete':
        this.emitter.emit('did-change', { event: 'delete', newFilePath: null })
        return this.close()
      case 'unknown':
        throw new Error(`Received unknown event for path: ${this.path}`)
      default:
        return this.emitter.emit('did-change', { event, newFilePath: filePath, oldFilePath })
    }
  }

  onDidChange (callback) {
    return this.emitter.on('did-change', callback)
  }

  start () {
    this.handle = binding.watch(this.path)
    if (handleWatchers.has(this.handle)) {
      const troubleWatcher = handleWatchers.get(this.handle)
      troubleWatcher.close()
      console.error(`The handle(${this.handle}) returned by watching ${this.path} is the same with an already watched path(${troubleWatcher.path})`)
    }
    return handleWatchers.add(this.handle, this)
  }

  closeIfNoListener () {
    if (this.emitter.getTotalListenerCount() === 0) { return this.close() }
  }

  close () {
    if (handleWatchers.has(this.handle)) {
      binding.unwatch(this.handle)
      return handleWatchers.remove(this.handle)
    }
  }
}

class PathWatcher {
  static initClass () {
    this.prototype.isWatchingParent = false
    this.prototype.path = null
    this.prototype.handleWatcher = null
  }

  constructor (filePath, callback) {
    this.path = filePath
    this.emitter = new Emitter()

    // On Windows watching a file is emulated by watching its parent folder.
    if (process.platform === 'win32') {
      const stats = fs.statSync(filePath)
      this.isWatchingParent = !stats.isDirectory()
    }

    if (this.isWatchingParent) { filePath = path.dirname(filePath) }
    for (const watcher of Array.from(handleWatchers.values())) {
      if (watcher.path === filePath) {
        this.handleWatcher = watcher
        break
      }
    }

    if (this.handleWatcher == null) { this.handleWatcher = new HandleWatcher(filePath) }

    this.onChange = ({ event, newFilePath, oldFilePath }) => {
      switch (event) {
        case 'rename': case 'change': case 'delete':
          if (event === 'rename') { this.path = newFilePath }
          if (typeof callback === 'function') { callback.call(this, event, newFilePath) }
          return this.emitter.emit('did-change', { event, newFilePath })
        case 'child-rename':
          if (this.isWatchingParent) {
            if (this.path === oldFilePath) { return this.onChange({ event: 'rename', newFilePath }) }
          } else {
            return this.onChange({ event: 'change', newFilePath: '' })
          }
          break
        case 'child-delete':
          if (this.isWatchingParent) {
            if (this.path === newFilePath) { return this.onChange({ event: 'delete', newFilePath: null }) }
          } else {
            return this.onChange({ event: 'change', newFilePath: '' })
          }
          break
        case 'child-change':
          if (this.isWatchingParent && (this.path === newFilePath)) { return this.onChange({ event: 'change', newFilePath: '' }) }
          break
        case 'child-create':
          if (!this.isWatchingParent) { return this.onChange({ event: 'change', newFilePath: '' }) }
          break
      }
    }

    this.disposable = this.handleWatcher.onDidChange(this.onChange)
  }

  onDidChange (callback) {
    return this.emitter.on('did-change', callback)
  }

  close () {
    this.emitter.dispose()
    this.disposable.dispose()
    return this.handleWatcher.closeIfNoListener()
  }
}
PathWatcher.initClass()

exports.watch = function (pathToWatch, callback) {
  if (handleWatchers == null) {
    handleWatchers = new HandleMap()
    binding.setCallback(function (event, handle, filePath, oldFilePath) {
      if (handleWatchers.has(handle)) { return handleWatchers.get(handle).onEvent(event, filePath, oldFilePath) }
    })
  }

  return new PathWatcher(path.resolve(pathToWatch), callback)
}

exports.closeAllWatchers = function () {
  if (handleWatchers != null) {
    for (const watcher of Array.from(handleWatchers.values())) { watcher.close() }
    return handleWatchers.clear()
  }
}

exports.getWatchedPaths = function () {
  const paths = []
  if (handleWatchers != null) {
    for (const watcher of Array.from(handleWatchers.values())) { paths.push(watcher.path) }
  }
  return paths
}

exports.File = require('./file')
exports.Directory = require('./directory')

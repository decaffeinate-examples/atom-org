/** @babel */
/* eslint-disable
    node/no-deprecated-api,
    standard/no-callback-literal,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require('fs')
const path = require('path')
const util = require('util')

class ArchiveEntry {
  constructor (path1, type) {
    this.path = path1
    this.type = type
    if (this.isDirectory()) { this.children = [] }
  }

  add (entry) {
    if (!this.isParentOf(entry)) { return false }

    const segments = entry.getPath().substring(this.getPath().length + 1).split(path.sep)
    if (segments.length === 0) { return false }

    if (segments.length === 1) {
      this.children.push(entry)
      return true
    } else {
      const name = segments[0]
      let child = findEntryWithName(this.children, name)
      if (child == null) {
        child = new ArchiveEntry(`${this.getPath()}${path.sep}${name}`, 5)
        this.children.push(child)
      }
      if (child.isDirectory()) {
        return child.add(entry)
      } else {
        return false
      }
    }
  }

  isParentOf (entry) {
    return this.isDirectory() && (entry.getPath().indexOf(`${this.getPath()}${path.sep}`) === 0)
  }

  getPath () { return this.path }
  getName () { return this.name != null ? this.name : (this.name = path.basename(this.path)) }
  isFile () { return this.type === 0 }
  isDirectory () { return this.type === 5 }
  isSymbolicLink () { return this.type === 2 }
  toString () { return this.getPath() }
}

var findEntryWithName = function (entries, name) {
  for (const entry of Array.from(entries)) { if (name === entry.getName()) { return entry } }
}

const convertToTree = function (entries) {
  const rootEntries = []
  for (const entry of Array.from(entries)) {
    const segments = entry.getPath().split(path.sep)
    if (segments.length === 1) {
      rootEntries.push(entry)
    } else {
      const name = segments[0]
      let parent = findEntryWithName(rootEntries, name)
      if (parent == null) {
        parent = new ArchiveEntry(name, 5)
        rootEntries.push(parent)
      }
      parent.add(entry)
    }
  }
  return rootEntries
}

const wrapCallback = function (callback) {
  let called = false
  return function (error, data) {
    if (!called) {
      if ((error != null) && !util.isError(error)) { error = new Error(error) }
      called = true
      return callback(error, data)
    }
  }
}

const listZip = function (archivePath, options, callback) {
  const yauzl = require('yauzl')
  let entries = []
  return yauzl.open(archivePath, { lazyEntries: true }, function (error, zipFile) {
    if (error) { return callback(error) }
    zipFile.readEntry()
    zipFile.on('error', callback)
    zipFile.on('entry', function (entry) {
      let entryPath, entryType
      if (entry.fileName.slice(-1) === '/') {
        entryPath = entry.fileName.slice(0, -1)
        entryType = 5
      } else {
        entryPath = entry.fileName
        entryType = 0
      }
      entryPath = entryPath.replace(/\//g, path.sep)
      entries.push(new ArchiveEntry(entryPath, entryType))
      return zipFile.readEntry()
    })
    return zipFile.on('end', function () {
      if (options.tree) { entries = convertToTree(entries) }
      return callback(null, entries)
    })
  })
}

const listGzip = function (archivePath, options, callback) {
  const zlib = require('zlib')
  const fileStream = fs.createReadStream(archivePath)
  fileStream.on('error', callback)
  const gzipStream = fileStream.pipe(zlib.createGunzip())
  gzipStream.on('error', callback)
  return listTarStream(gzipStream, options, callback)
}

const listTar = function (archivePath, options, callback) {
  const fileStream = fs.createReadStream(archivePath)
  fileStream.on('error', callback)
  return listTarStream(fileStream, options, callback)
}

var listTarStream = function (inputStream, options, callback) {
  let entries = []
  const tarStream = inputStream.pipe(require('tar').Parse())
  tarStream.on('error', callback)
  tarStream.on('entry', function (entry) {
    let entryPath
    if (entry.props.path.slice(-1) === '/') {
      entryPath = entry.props.path.slice(0, -1)
    } else {
      entryPath = entry.props.path
    }
    const entryType = parseInt(entry.props.type)
    entryPath = entryPath.replace(/\//g, path.sep)
    return entries.push(new ArchiveEntry(entryPath, entryType))
  })
  return tarStream.on('end', function () {
    if (options.tree) { entries = convertToTree(entries) }
    return callback(null, entries)
  })
}

const readFileFromZip = function (archivePath, filePath, callback) {
  const yauzl = require('yauzl')
  return yauzl.open(archivePath, { lazyEntries: true }, function (error, zipFile) {
    if (error) { return callback(error) }
    zipFile.readEntry()
    zipFile.on('error', callback)
    zipFile.on('end', () => callback(`${filePath} does not exist in the archive: ${archivePath}`))
    return zipFile.on('entry', function (entry) {
      if (filePath !== entry.fileName.replace(/\//g, path.sep)) { return zipFile.readEntry() }

      if (filePath.slice(-1) !== path.sep) {
        return zipFile.openReadStream(entry, function (error, entryStream) {
          if (error) { return callback(error) }
          return readEntry(entryStream, callback)
        })
      } else {
        return callback(`${filePath} is not a normal file in the archive: ${archivePath}`)
      }
    })
  })
}

const readFileFromGzip = function (archivePath, filePath, callback) {
  const fileStream = fs.createReadStream(archivePath)
  fileStream.on('error', callback)
  const gzipStream = fileStream.pipe(require('zlib').createGunzip())
  gzipStream.on('error', callback)
  gzipStream.on('end', () => callback(`${filePath} does not exist in the archive: ${archivePath}`))
  return readFileFromTarStream(gzipStream, archivePath, filePath, callback)
}

const readFileFromTar = function (archivePath, filePath, callback) {
  const fileStream = fs.createReadStream(archivePath)
  fileStream.on('error', callback)
  fileStream.on('end', () => callback(`${filePath} does not exist in the archive: ${archivePath}`))
  return readFileFromTarStream(fileStream, archivePath, filePath, callback)
}

var readFileFromTarStream = function (inputStream, archivePath, filePath, callback) {
  const tar = require('tar')
  const tarStream = inputStream.pipe(tar.Parse())

  tarStream.on('error', callback)
  return tarStream.on('entry', function (entry) {
    if (filePath !== entry.props.path.replace(/\//g, path.sep)) { return }

    if (entry.props.type === '0') {
      return readEntry(entry, callback)
    } else {
      return callback(`${filePath} is not a normal file in the archive: ${archivePath}`)
    }
  })
}

var readEntry = function (entry, callback) {
  const contents = []
  entry.on('data', data => contents.push(data))
  return entry.on('end', () => callback(null, Buffer.concat(contents)))
}

const isTarPath = archivePath => path.extname(archivePath) === '.tar'

const isZipPath = function (archivePath) {
  const extension = path.extname(archivePath)
  return ['.epub', '.jar', '.love', '.war', '.zip', '.egg', '.whl', '.xpi', '.nupkg'].includes(extension)
}

const isGzipPath = archivePath => (path.extname(archivePath) === '.tgz') ||
  (path.extname(path.basename(archivePath, '.gz')) === '.tar')

module.exports = {
  isPathSupported (archivePath) {
    if (!archivePath) { return false }
    return isTarPath(archivePath) || isZipPath(archivePath) || isGzipPath(archivePath)
  },

  list (archivePath, options, callback) {
    if (options == null) { options = {} }
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    if (isTarPath(archivePath)) {
      listTar(archivePath, options, wrapCallback(callback))
    } else if (isGzipPath(archivePath)) {
      listGzip(archivePath, options, wrapCallback(callback))
    } else if (isZipPath(archivePath)) {
      listZip(archivePath, options, wrapCallback(callback))
    } else {
      callback(new Error(`'${path.extname(archivePath)}' files are not supported`))
    }
    return undefined
  },

  readFile (archivePath, filePath, callback) {
    if (isTarPath(archivePath)) {
      readFileFromTar(archivePath, filePath, wrapCallback(callback))
    } else if (isGzipPath(archivePath)) {
      readFileFromGzip(archivePath, filePath, wrapCallback(callback))
    } else if (isZipPath(archivePath)) {
      readFileFromZip(archivePath, filePath, wrapCallback(callback))
    } else {
      callback(new Error(`'${path.extname(archivePath)}' files are not supported`))
    }
    return undefined
  },

  readGzip (gzipArchivePath, callback) {
    callback = wrapCallback(callback)

    const zlib = require('zlib')
    const fileStream = fs.createReadStream(gzipArchivePath)
    fileStream.on('error', callback)
    const gzipStream = fileStream.pipe(zlib.createGunzip())
    gzipStream.on('error', callback)

    const chunks = []
    gzipStream.on('data', chunk => chunks.push(chunk))
    return gzipStream.on('end', () => callback(null, Buffer.concat(chunks)))
  }
}

/** @babel */
/* eslint-disable
    constructor-super,
    no-constant-condition,
    no-eval,
    no-this-before-super,
    no-unused-vars,
    node/no-deprecated-api,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ChunkedLineReader
const fs = require('fs')
const isBinaryFile = require('isbinaryfile')
const { Readable } = require('stream')
const { StringDecoder } = require('string_decoder')

const lastIndexOf = function (buffer, length, char) {
  let i = length
  while (i--) {
    if (buffer[i] === char) { return i }
  }
  return -1
}

// Will ensure data will be read on a line boundary. So this will always do the
// right thing:
//
//   lines = []
//   reader = new ChunkedLineReader('some/file.txt')
//   reader.on 'data', (chunk) ->
//     line = chunk.toString().replace(/\r?\n?$/, '')
//     lines = lines.concat(line.split(/\r\n|\n|\r/))
//
// This will collect all the lines in the file, or you can process each line in
// the data handler for more efficiency.
module.exports =
(ChunkedLineReader = (function () {
  ChunkedLineReader = class ChunkedLineReader extends Readable {
    static initClass () {
      this.CHUNK_SIZE = 10240
      this.chunkedBuffer = null
      this.headerBuffer = new Buffer(256)
    }

    constructor (filePath, options) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super() }
        const thisFn = (() => { return this }).toString()
        const thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1]
        eval(`${thisName} = this;`)
      }
      this.filePath = filePath
      this.encoding = (options != null ? options.encoding : undefined) != null ? (options != null ? options.encoding : undefined) : 'utf8'
      super()
    }

    isBinaryFile () {
      const fd = fs.openSync(this.filePath, 'r')
      const isBin = isBinaryFile(this.constructor.headerBuffer, fs.readSync(fd, this.constructor.headerBuffer, 0, 256))
      fs.closeSync(fd)
      return isBin
    }

    _read () {
      let fd
      try {
        fd = fs.openSync(this.filePath, 'r')
        const line = 0
        let offset = 0
        let remainder = ''
        const chunkSize = this.constructor.CHUNK_SIZE
        if (isBinaryFile(this.constructor.headerBuffer, fs.readSync(fd, this.constructor.headerBuffer, 0, 256))) { return }

        if (this.constructor.chunkedBuffer == null) { this.constructor.chunkedBuffer = new Buffer(chunkSize) }
        const {
          chunkedBuffer
        } = this.constructor
        let bytesRead = fs.readSync(fd, chunkedBuffer, 0, chunkSize, 0)
        const decoder = new StringDecoder(this.encoding)

        while (bytesRead) {
          // Scary looking. Uses very few new objects
          var newRemainder, str
          const char = 10
          const index = lastIndexOf(chunkedBuffer, bytesRead, char)

          if (index < 0) {
            // no newlines here, the whole thing is a remainder
            newRemainder = decoder.write(chunkedBuffer.slice(0, bytesRead))
            str = null
          } else if ((index > -1) && (index === (bytesRead - 1))) {
            // the last char is a newline
            newRemainder = ''
            str = decoder.write(chunkedBuffer.slice(0, bytesRead))
          } else {
            str = decoder.write(chunkedBuffer.slice(0, index + 1))
            newRemainder = decoder.write(chunkedBuffer.slice(index + 1, bytesRead))
          }

          if (str) {
            if (remainder) { str = remainder + str }
            this.push(str)
            remainder = newRemainder
          } else {
            remainder = remainder + newRemainder
          }

          offset += bytesRead
          bytesRead = fs.readSync(fd, chunkedBuffer, 0, chunkSize, offset)
        }

        if (remainder) { return this.push(remainder) }
      } catch (error) {
        return this.emit('error', error)
      } finally {
        if (fd != null) { fs.closeSync(fd) }
        this.push(null)
      }
    }
  }
  ChunkedLineReader.initClass()
  return ChunkedLineReader
})())

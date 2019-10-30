/** @babel */
/* eslint-disable
    camelcase,
    handle-callback-err,
    no-multi-str,
    no-return-assign,
    no-undef,
    no-unused-vars,
    no-useless-escape,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require('fs')
const request = require('request')
const itag_formats = require('./formats.js')
const { Emitter } = require('event-kit')
const mp4 = require('./iso_boxer.js')

var YouTube = (function () {
  let INFO_URL
  let VIDEO_EURL
  let HEADER_SIZE
  let ytid
  let videoInfo
  let formats
  let duration
  YouTube = class YouTube {
    static initClass () {
      INFO_URL = 'https://www.youtube.com/api_video_info?html5=1&hl=en_US&c=WEB&cplayer=UNIPLAYER&cver=html5&el=embedded&video_id='
      VIDEO_EURL = 'https://youtube.googleapis.com/v/'
      HEADER_SIZE = 438

      ytid = ''
      videoInfo = {}
      formats = []
      duration = 0
    }

    constructor (url) {
      this.ytid = this.getYTId(url)
      this.emitter = new Emitter()
    }
    // console.log 'youtube lib initialized',@ytid

    getYTId (url) {
      if (url !== '') {
        const ytreg = new RegExp('(?:youtube\\.com\\/(?:[^\\/]+\\/.+\\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)\
|youtu\\.be\\/)([^"&?\\/]{11})', 'i')
        const ytidregres = ytreg.exec(url)
        if ((ytidregres != null ? ytidregres.length : undefined) > 0) {
          return ytid = ytidregres[1]
        }
      }
    }

    parseTime (time) {
      // console.log 'parseTime',time
      const timeRegexp = /(?:(\d+)h)?(?:(\d+)m(?!s))?(?:(\d+)s)?(?:(\d+)(?:ms)?)?/
      const result = timeRegexp.exec(time.toString())
      const hours = result[1] || 0
      const mins = result[2] || 0
      const secs = result[3] || 0
      const ms = result[4] || 0
      const res = (hours * 3600000) + (mins * 60000) + (secs * 1000) + parseInt(ms, 10)
      // console.log 'res',res
      return res
    }

    on (event, func) {
      return this.emitter.on(event, func)
    }

    getMap (map) {
      const streamMap = map.split(',')
      const streams = []
      for (let i = 0; i < streamMap.length; i++) {
        map = streamMap[i]
        const streamData = map.split('&')
        for (const data of Array.from(streamData)) {
          const [key, value] = Array.from(data.split('='))
          if ((streams[i] == null)) { streams[i] = {} }
          streams[i][key] = unescape(value)
        }
      }
      return streams
    }

    getVideoInfo (url, next) {
      if (url != null) {
        this.ytid = this.getYTId(url)
      }
      if (this.ytid === '') { return }
      const reqUrl = INFO_URL + this.ytid
      // console.log 'reqUrl',reqUrl
      return request(reqUrl, (err, response, body) => {
        let key, param, value
        if (err != null) {
          // console.log 'error',err
          return
        }
        const info = body.split('&')

        const temp = {}
        for (param of Array.from(info)) {
          [key, value] = Array.from(param.split('='))
          value = unescape(value)

          if (!Array.isArray(temp[key]) && (temp[key] != null)) {
            const old = temp[key]
            temp[key] = []
            temp[key].push(old)
          }

          if (Array.isArray(temp[key])) {
            temp[key].push(unescape(value))
          }

          if ((temp[key] == null)) {
            temp[key] = value
          }
        }

        if (temp.status !== 'ok') {
          // console.log 'error',temp.reason
          const msg = temp.reason.toString('UTF-8').replace(/\+/gi, ' ')
          atom.notifications.addWarning(msg)
          return
        }

        this.basicStreams = this.getMap(temp.url_encoded_fmt_stream_map)
        this.adaptiveStreams = this.getMap(temp.adaptive_fmts)

        // console.log temp

        this.formats = {}
        for (const adaptive of Array.from(this.adaptiveStreams)) {
          const {
            itag
          } = adaptive
          if (adaptive.type.substr(0, 9) === 'video/mp4') {
            let paramStr
            this.formats[itag] = adaptive
            if (this.formats[itag].size != null) {
              const size = this.formats[itag].size.split('x')
              this.formats[itag].width = size[0]
              this.formats[itag].height = size[1]
            }

            this.formats[itag].urlDecoded = unescape(adaptive.url)
            const urlDec = this.formats[itag].urlDecoded;
            [url, paramStr] = Array.from(/^https?\:\/\/[^?]+\?(.*)$/gi.exec(urlDec))
            const params = paramStr.split('&')
            const urlParams = {}
            for (param of Array.from(params)) {
              [key, value] = Array.from(param.split('='))
              urlParams[key] = unescape(value)
            }
            this.formats[itag].urlParams = urlParams
          }
        }

        // console.log 'formats finished',@formats
        this.emitter.emit('formats', this.formats)
        this.emitter.emit('ready')
        if (next != null) {
          return next(this.formats)
        }
      })
    }

    parseRange (range) {
      if (range != null) {
        const [start, end] = Array.from(range.split('-'))
        const startMs = this.parseTime(start)
        const endMs = this.parseTime(end)
        if (!stratS < endS) {
          // console.error 'Range is invalid'
          return
        }
        return [startMs, endMs]
      }
    }

    findChunks (start, end, next) {
      const chunks = []
      this.downloadIndexes = []
      start = (start / 1000) * this.timescale
      end = (end / 1000) * this.timescale
      // console.log 'start,end',start,end
      for (let i = 0; i < this.chunks.length; i++) {
        // console.log chunk.startTime,chunk.endTime
        const chunk = this.chunks[i]
        if ((start < chunk.endTime) && (chunk.startTime < end)) {
          chunks.push(chunk)
          this.downloadIndexes.push(i)
        }
      }
      this.chunksToDownload = chunks
      // console.log 'chunksToDownload',chunks
      if (next != null) { return next(chunks) }
    }

    getChunk (index) {
      const chunk = this.chunksToDownload[index]
      if (chunk != null) {
        const range = chunk.startByte + '-' + chunk.endByte
        const url = this.formats[this.itag].urlDecoded + '&range=' + range
        // console.log 'getting range',range
        const host = /^https?\:\/\/([^\/]+)\/.*/gi.exec(url)
        // console.log 'host',host[1]
        const reqObj = { url, headers: { Host: host[1] }, encoding: 'binary' }
        return request(reqObj, (err, res, body) => {
          let asc, i
          let end
          const buff = new Uint8Array(body.length)
          for (i = 0, end = body.length, asc = end >= 0; asc ? i <= end : i >= end; asc ? i++ : i--) {
            buff[i] = body.charCodeAt(i)
          }
          const percent = (index / this.chunksToDownload.length) * 100
          this.emitter.emit('data', { current: index, all: this.chunksToDownload.length, data: buff, percent })
          this.chunks[index].data = body
          this.chunks[index].dataArray = buff.buffer
          this.downloadedChunks.push(this.chunks[index])
          if (index === (this.chunksToDownload.length - 1)) {
            return this.fileStream.end(body, 'binary', err => {
              if ((err == null)) { return this.emitter.emit('done', this.downloadedChunks) }
            })
          } else {
            return this.fileStream.write(body, 'binary', err => {
              if ((err == null)) { return this.getChunk(index + 1) }
            })
          }
        })
      } else {
        return this.emitter.emit('done', this.downloadedChunks)
      }
    }

    getChunks () {
      this.downloadedChunks = []
      return this.getChunk(0)
    }

    parseTimes (obj) {
      // console.log 'calculatingChunks',obj
      this.start = 0
      this.end = this.parseTime('10s')
      if (obj.time != null) {
        this.start = (obj.time.start = this.parseTime(obj.time.start))
        return this.end = (obj.time.end = this.parseTime(obj.time.end))
      }
    }

    int32toBuff8 (number) {
      const int32 = new Uint32Array(1)
      int32[0] = number
      const buff8temp = new Uint8Array(int32.buffer.slice(0, 4))
      const buff8 = new Uint8Array(4)
      for (let i = 0; i <= 3; i++) {
        buff8[i] = buff8temp[3 - i]
      }
      return buff8
    }

    makeNewHeader (next) {
      let byte, i
      let asc1, end1
      let asc2, end2
      const sidx = this.newHeader.fetch('sidx')
      const refCount = sidx.reference_count
      // console.log 'downloadIndexes',@downloadIndexes
      // 12 is size of reference chunk
      // console.log 'sidx.size',sidx.size
      const newRefsSize = this.downloadIndexes.length * 12
      const delRefsSize = (sidx.reference_count * 12) - newRefsSize
      // console.log 'newRefsSize,delRefsSize',newRefsSize,delRefsSize

      const newSidxSize = sidx.size - delRefsSize
      const newHeaderSize = this.newHeader._raw.byteLength - delRefsSize
      // console.log 'newSidxSize,newHeaderSize',newSidxSize,newHeaderSize

      sidx._raw.setUint32(0, newSidxSize) // sidx size changed
      sidx._raw.setUint16(30, this.downloadIndexes.length) // reference_count

      // console.log 'sidx.size',sidx._raw.getUint32(0)
      // console.log 'sidx.reference_count',sidx._raw.getUint16(30)

      const newReferences = new Uint8Array(newRefsSize)

      let y = 0
      for (const index of Array.from(this.downloadIndexes)) {
        // console.log 'copying index',index
        for (let start = index * 12, j = start, end = (index * 12) + 11, asc = start <= end; asc ? j <= end : j >= end; asc ? j++ : j--) {
          byte = sidx._raw.getUint8(j + 32) // 32 is references data offset
          // console.log 'j,byte',j,byte
          newReferences[y] = byte
          y++
        }
      }

      const headerData = new Uint8Array(newHeaderSize)

      // console.log 'copying all header data'
      // full header clone
      for (i = 0, end1 = newHeaderSize - 1, asc1 = end1 >= 0; asc1 ? i <= end1 : i >= end1; asc1 ? i++ : i--) {
        headerData[i] = this.newHeader._raw.getUint8(i)
      }

      const referencesOffset = sidx._offset + 32 // 32 = sidx header without references
      // console.log 'copying references at offset',referencesOffset
      for (i = 0, end2 = newRefsSize - 1, asc2 = end2 >= 0; asc2 ? i <= end2 : i >= end2; asc2 ? i++ : i--) {
        byte = newReferences[i]
        // console.log 'newReferences[i],i,referencesOffset+i',byte,i,i+referencesOffset,'"'+String.fromCharCode(byte)+'"'
        headerData[i + referencesOffset] = byte
      }

      // tkhd and mvhd durations must be updated too

      const tkhd = this.newHeader.fetch('tkhd')
      // tkhd
      // full box 12bytes size(4)|tkhd(4)|ver(1)|flags(3)
      // size(4)|tkhd(4)|ver(1)|flags(3)|creation_time(4)|modification_time(4)|track_ID(4)|reserver(4)|duration(4) ...
      const mvhd = this.newHeader.fetch('mvhd')
      // mvhd
      // full box 12bytes size(4)|mvhd(4)|ver(1)|flags(3)
      // size(4)|mvhd(4)|ver(1)|flags(3)|creation_time(4)|modification_time(4)|timescale(4)|duration(4) ...
      const mdhd = this.newHeader.fetch('mdhd')
      // mdhd
      // full box 12bytes size(4)|mdhd(4)|ver(1)|flags(3)
      // size(4)|mdhd(4)|ver(1)|flags(3)|creation_time(4)|modification_time(4)|timescale(4)|duration(4) ...
      // console.log 'tkhd,mvhd,mdhd',tkhd,mvhd,mdhd

      let newDuration = 0
      for (const chunk of Array.from(this.chunksToDownload)) {
        newDuration += chunk.duration
      }
      // console.log 'newDuration',newDuration,'real',newDuration/@timescale

      const buff8 = this.int32toBuff8(newDuration)
      for (i = 0; i <= 3; i++) {
        headerData[mvhd._offset + 24 + i] = buff8[i]
      }
      for (i = 0; i <= 3; i++) {
        headerData[tkhd._offset + 28 + i] = buff8[i]
      }
      for (i = 0; i <= 3; i++) {
        headerData[mdhd._offset + 24 + i] = buff8[i]
      }

      // console.log 'buff8[i]',buff8[i]

      // console.log 'headerData',headerData.buffer.byteLength
      const checkNewHeader = mp4.parseBuffer(headerData.buffer)
      // console.log 'checkNewHeader',checkNewHeader
      const newHeaderStr = String.fromCharCode.apply(null, headerData)
      // console.log 'newHeaderStr',newHeaderStr.length,newHeaderStr
      return this.fileStream.write(newHeaderStr, 'binary', err => {
        if (err != null) {
          // console.error err
          return
        }
        return next()
      })
    }

    getHeader (next) {
      const initRange = this.formats[this.itag].init.split('-')
      const indexRange = this.formats[this.itag].index.split('-')
      const range = '0-' + indexRange[1]
      const url = this.formats[this.itag].urlDecoded + '&range=' + range
      // console.log 'init',url
      const host = /^https?\:\/\/([^\/]+)\/.*/gi.exec(url)
      const reqObj = { url, headers: { Host: host[1] }, encoding: 'binary' }
      return request(reqObj, (err, res, body) => {
        let asc, i
        let end
        this.fileStream = fs.createWriteStream(this.filename)
        const buff = new Uint8Array(body.length)
        const text = ''
        for (i = 0, end = body.length, asc = end >= 0; asc ? i <= end : i >= end; asc ? i++ : i--) {
          buff[i] = body.charCodeAt(i)
        }

        const box = mp4.parseBuffer(buff.buffer)

        this.newHeader = mp4.parseBuffer(buff.buffer)

        // console.log 'box',box
        this.sidx = box.fetch('sidx')
        this.mvhd = box.fetch('mvhd')
        this.timescale = this.mvhd.timescale
        // console.log 'timescale',@timescale
        this.references = this.sidx.references

        this.chunks = []
        let offset = parseInt(indexRange[1]) + 1 // end of header
        let time = 0
        for (const reference of Array.from(this.references)) {
          const startTime = time
          const endTime = (time + reference.subsegment_duration) - 1
          duration = reference.subsegment_duration
          const chunk = {
            startByte: offset,
            endByte: (offset + reference.referenced_size) - 1,
            startTime,
            endTime,
            size: reference.referenced_size,
            duration
          }
          this.chunks.push(chunk)
          offset += reference.referenced_size
          time += reference.subsegment_duration
        }
        // console.log @chunks

        this.findChunks(this.start, this.end)

        return this.makeNewHeader(() => {
          return next()
        })
      })
    }

    // range = 10s-20s or 1h10m0s-1h15m0s
    download (obj) {
      if (obj.filename != null) {
        this.filename = obj.filename
      } else {
        // console.error 'no filename specified'
        return
      }

      if ((obj.itag == null)) {
        // console.error 'No format specified'
        return
      }

      this.itag = obj.itag
      if ((this.formats[this.itag] == null)) {
        // console.error 'Wrong format specified'
        return
      }

      this.parseTimes(obj)
      return this.getHeader(() => {
        return this.getChunks()
      })
    }

    destroy () {
      return this.emitter.dispose()
    }
  }
  YouTube.initClass()
  return YouTube
})()

module.exports = YouTube

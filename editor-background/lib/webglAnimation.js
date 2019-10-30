/** @babel */
/* eslint-disable
    no-multi-str,
    no-return-assign,
    no-undef,
    no-unused-vars,
    no-useless-call,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require('fs')

class WebGLAnimation {
  static initClass () {
    this.prototype.ytid = ''
    this.prototype.homeDir = ''
    this.prototype.videoDir = ''
    this.prototype.animPath = ''
    this.prototype.frames = []
    this.prototype.currentFrame = 0
    this.prototype.fadeOut = 50
  }

  constructor (ytid) {
    this.loaded = 0
    this.playing = false
    this.speed = atom.config.get('editor-background.animationSpeed')
    atom.config.observe('editor-background.animationSpeed', speed => {
      return this.setSpeed(speed)
    })
    this.homeDir = atom.packages.resolvePackagePath('editor-background')
    this.videoDir = this.homeDir + '/youtube-videos'
    if (ytid != null) {
      this.ytid = ytid
    } else {
      const url = atom.config.get('editor-background.youTubeUrl')
      if (url != null) { this.ytid = this.getYTid(url) }
    }
    if (this.ytid) { this.animPath = this.videoDir + '/' + this.ytid + '_images/' }
  }

  setSpeed (speed) {
    return this.speed = speed
  }

  getYTId (url) {
    if (url !== '') {
      const ytreg = new RegExp('(?:youtube\\.com\\/(?:[^\\/]+\\/.+\\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)\
|youtu\\.be\\/)([^"&?\\/]{11})', 'i')
      const ytidregres = ytreg.exec(url)
      if ((ytidregres != null ? ytidregres.length : undefined) > 0) {
        let ytid
        return ytid = ytidregres[1]
      }
    }
  }

  imageLoaded (file, img, event) {
    this.loaded++
    if (this.loaded === this.frames.length) {
      this.createCanvas()
      this.naturalWidth = img.naturalWidth
      this.naturalHeight = img.naturalHeight
      this.playing = true
      return this.animate()
    }
  }

  addFrame (file) {
    const img = new Image()
    img.addEventListener('load', event => {
      return this.imageLoaded.apply(this, [file, img, event])
    })
    img.src = this.animPath + file
    return this.frames.push(img)
  }

  start (element, before) {
    this.frames = []
    this.element = element
    this.before = before
    try {
      return fs.readdir(this.animPath, (err, files) => {
        if (err) {
          return console.log(err)
        } else {
          const reg = new RegExp('^[0-9]+\\.jpg$')
          files.sort((a, b) => parseInt(reg.exec(a)) - parseInt(reg.exec(b)))
          return Array.from(files).map((file) => this.addFrame(file))
        }
      })
    } catch (e) {
      return console.log(e)
    }
  }

  drawFrame () {
    let alpha, index
    if ((this.currentFrame + 1) >= (this.frames.length - this.fadeOut)) {
      this.currentFrame = 0
    }
    if (this.currentFrame < this.fadeOut) {
      const lastFrame = this.frames.length - 1
      const diff = this.fadeOut - this.currentFrame
      index = lastFrame - diff
      alpha = parseFloat((diff / this.fadeOut).toFixed(2))
    }
    const frame = this.frames[this.currentFrame]
    this.ctx.globalAlpha = 1
    this.ctx.drawImage(frame, 0, 0)
    if (this.currentFrame < this.fadeOut) {
      this.ctx.globalAlpha = alpha
      this.ctx.drawImage(this.frames[index], 0, 0)
    }
    return this.currentFrame++
  }

  animate () {
    if (this.playing) {
      this.drawFrame()
      return setTimeout(() => {
        return this.animate()
      }
      , this.speed)
    }
  }

  createCanvas () {
    this.canvas = document.createElement('canvas')
    const width = this.frames[0].naturalWidth
    const height = this.frames[0].naturalHeight
    // console.log 'frames',@frames.length
    this.canvas.width = width
    this.canvas.height = height
    const width2 = Math.floor(width / 2)
    const height2 = Math.floor(height / 2)
    const body = document.querySelector('body')
    const bdW_ = window.getComputedStyle(body).width
    const bdW = /([0-9]+)/gi.exec(bdW_)[1]
    const ratio = (bdW / width).toFixed(2)
    this.canvas.className = 'editor-background-animation'
    this.canvas.style.cssText = `\
position:absolute; \
left:calc(50% - ${width2}px); \
top:calc(50% - ${height2}px); \
width:${width}px; \
height:${height}px; \
transform:scale(${ratio}) translate3d(0,0,0);\
`
    atom.config.observe('editor-background.blurRadius', radius => {
      return this.canvas.style.webkitFilter = `blur(${radius}px)`
    })

    this.ctx = canvas.getContext('webgl')
    if (!this.ctx) {
      this.ctx = canvas.getContext('experimental-webgl')
    }
    const vertexShader = createShaderFromScriptElement(gl, '2d-vertex-shader')
    const fragmentShader = createShaderFromScriptElement(gl, '2d-fragment-shader')
    const program = createProgram(gl, [vertexShader, fragmentShader])
    gl.useProgram(program)
    const positionLocation = gl.getAttribLocation(program, 'a_position')
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    if (this.before != null) {
      return this.element.insertBefore(this.canvas, this.before)
    } else {
      return this.element.appendChild(this.canvas)
    }
  }

  stop () {
    this.canvas.remove()
    this.frames = []
    return this.currentFrame = 0
  }
}
WebGLAnimation.initClass()

module.exports = Animation

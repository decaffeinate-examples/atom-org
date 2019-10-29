/** @babel */
/* eslint-disable
    new-cap,
    no-multi-str,
    no-return-assign,
    no-undef,
    no-unused-expressions,
    no-unused-vars,
    no-useless-call,
    no-useless-escape,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let EditorBackground
const { CompositeDisposable } = require('atom')
const fs = require('fs')
const blur = require('./StackBlur.js')
const animation = require('./animation')
const yt = require('./youtube')
const popup = require('./popup')
const configWindow = require('./config')
const path = require('path')
const elementResizeEvent = require('element-resize-event')

const qr = selector => document.querySelector(selector)
const style = element => document.defaultView.getComputedStyle(element)
const inline = (element, style) => element.style.cssText += style
const escapeHTML = text => text
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;')

const blobToBase64 = function (blob, cb) {
  const reader = new FileReader()
  reader.onload = function () {
    const dataUrl = reader.result
    const base64 = dataUrl.split(',')[1]
    return cb(base64)
  }
  return reader.readAsDataURL(blob)
}

const shadowDomAlert = false

const planeInitialCss =
  'position:absolute; \
left:0; \
top:0; \
width:100%; \
height:100%; \
background:transparent; \
pointer-events:none; \
z-index:0;'

const colorToArray = function (str) {
  let result = str.replace(/[^\d,\.]/g, '')
  result = result.split(',')
  return result
}

module.exports = (EditorBackground = {
  config: {
    useConfigWindow: {
      type: 'string',
      description: 'USE PACKAGE CONFIG WINDOW INSTEAD OF THIS SETTINGS ( CTRL + SHIFT + E ) TO OPEN',
      toolbox: 'ignore',
      default: '',
      order: 0
    },
    image: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          toolbox: 'file',
          title: 'Image URL',
          default: 'atom://editor-background/bg.jpg',
          description: 'URL of your image. It can be http://... \
or just /home/yourname/image.jpg'
        },
        blurRadius: {
          type: 'integer',
          description: 'Background image blur. 0 = none',
          default: 0,
          minimim: 0,
          maximum: 200
        },
        backgroundSize: {
          type: 'string',
          default: 'original',
          enum: ['original', '100%', 'cover', 'manual'],
          description: 'Background size'
        },
        manualBackgroundSize: {
          type: 'string',
          default: '',
          description: "'100px 100px' or '50%' try something..."
        },
        backgroundPosition: {
          type: 'string',
          default: 'center',
          description: 'Background position'
        },
        repeat: {
          type: 'string',
          default: 'no-repeat',
          enum: ['no-repeat', 'repeat', 'repeat-x', 'repeat-y'],
          description: 'Background repeat'
        },
        customOverlayColor: {
          type: 'boolean',
          default: false,
          description: 'Do you want different color on top of background?'
        },
        overlayColor: {
          type: 'color',
          default: 'rgba(0,0,0,0)',
          description: 'Color used to overlay background image'
        },
        opacity: {
          type: 'integer',
          default: 100,
          description: 'Background image visibility percent 1-100',
          minimum: 0,
          maximum: 100
        },
        style: {
          type: 'string',
          toolbox: 'text',
          default: 'background:radial-gradient(rgba(0,0,0,0) 30%,rgba(0,0,0,0.75));',
          description: 'Your custom css rules :]'
        }
      }
    },
    text: {
      type: 'object',
      properties: {
        color: {
          type: 'color',
          default: 'rgba(0,0,0,1)',
          description: 'background color for text/code'
        },
        opacity: {
          type: 'integer',
          default: 100,
          minimum: 0,
          maximum: 100
        },
        blur: {
          type: 'integer',
          default: 5,
          minimum: 0,
          maximum: 50
        },
        expand: {
          type: 'integer',
          default: 4,
          description: 'If you want larger area under text - try 4 or 10',
          minimum: 0,
          maximum: 200
        },
        shadow: {
          type: 'string',
          default: 'none',
          description: 'Add a little text shadow to code like \
\'0px 2px 2px rgba(0,0,0,0.3)\' '
        }
      }
    },
    video: {
      type: 'object',
      properties: {
        youTubeURL: {
          type: 'string',
          default: '',
          description: 'Search for \'background loop\', \
\'background animation\' or similar on youtube and paste url here.'
        },
        playAnimation: {
          type: 'boolean',
          default: false,
          description: 'enable or disable animation'
        },
        animationSpeed: {
          type: 'integer',
          default: 75,
          description: 'animation speed in ms (original is 50), \
LOWER VALUE = HIGHER CPU USAGE'
        },
        opacity: {
          type: 'integer',
          default: 75,
          minimum: 0,
          maximum: 100,
          description: 'video opacity'
        },
        startTime: {
          type: 'string',
          default: '0s',
          description: 'video start time like 1h30m10s or 10s'
        },
        endTime: {
          type: 'string',
          default: '20s',
          description: 'video end time like 1h30m30s or 30s'
        }
      }
    },
    other: {
      type: 'object',
      properties: {
        treeViewOpacity: {
          type: 'integer',
          default: '35',
          description: 'Tree View can be transparent too :)',
          minimum: 0,
          maximum: 100
        },
        transparentTabBar: {
          type: 'boolean',
          default: true,
          desctiption: 'Transparent background under file tabs'
        }
      }
    },
    box3d: {
      type: 'object',
      properties: {
        depth: {
          type: 'integer',
          default: 0,
          minimum: 0,
          maximum: 2000,
          description: 'This is pseudo 3D Cube. Try 500 or 1500 or \
something similar...'
        },
        shadowOpacity: {
          type: 'integer',
          default: 30,
          minimum: 0,
          maximum: 100,
          description: 'shadow that exists in every corner of the box'
        },
        mouseFactor: {
          type: 'integer',
          default: 0,
          description: 'move background with mouse (higher value = slower) \
try 8 or 4 for 3dbox or 20 for wallpaper'
        }
      }
    }
  },

  packagesLoaded: false,
  initialized: false,
  elements: {},
  colors: {},
  state: {},
  mouseX: 0,
  mouseY: 0,
  editorStyles: [],
  editor: {},

  activate (state) {
    this.subs = new CompositeDisposable()
    this.subs.add(atom.commands.add('atom-workspace',
      { 'editor-background:toggle': () => this.toggle() })
    )
    this.subs.add(atom.config.observe('editor-background',
      conf => this.applyBackground.apply(this, [conf])))
    this.subs.add(atom.config.observe('editor-background.image.url', url => {
      return this.blurImage.apply(this, [url])
    }))
    this.subs.add(atom.config.observe('editor-background.video.youTubeURL', url => {
      return this.startYouTube.apply(this, [url])
    }))
    this.subs.add(atom.config.observe('editor-background.video.playAnimation', play => {
      if (play === false) {
        return this.removeVideo()
      } else {
        return this.startYouTube.apply(this, [])
      }
    }))

    return this.initializePackage()
  },

  deactivate () {
    if (this.subs != null) {
      this.subs.dispose()
    }
    if ((this.elements != null ? this.elements.main : undefined) != null) {
      return this.elements.main.remove()
    }
  },

  appendCss () {
    const css = ''
    const cssstyle = document.createElement('style')
    cssstyle.type = 'text/css'
    cssstyle.setAttribute('id', '#editor-background-css')
    this.elements.main.appendChild(cssstyle)
    return this.elements.css = cssstyle
  },

  createBox (depth) {
    let boxStyle
    const {
      body
    } = this.elements
    const jest = qr('body .eb-box-wrapper')
    if ((jest == null) || (jest.length === 0)) {
      const left = document.createElement('div')
      const top = document.createElement('div')
      const right = document.createElement('div')
      const bottom = document.createElement('div')
      const back = document.createElement('div')
      const wrapper = document.createElement('div')
      wrapper.appendChild(left)
      wrapper.appendChild(top)
      wrapper.appendChild(right)
      wrapper.appendChild(bottom)
      wrapper.appendChild(back)
      wrapper.setAttribute('class', 'eb-box-wrapper')
      left.setAttribute('class', 'eb-left')
      top.setAttribute('class', 'eb-top')
      right.setAttribute('class', 'eb-right')
      bottom.setAttribute('class', 'eb-bottom')
      back.setAttribute('class', 'eb-back')

      boxStyle = document.createElement('style')
      boxStyle.type = 'text/css'
      this.elements.main.appendChild(boxStyle)

      this.elements.main.appendChild(wrapper)
    }
    return boxStyle
  },

  mouseMove (ev) {
    const conf = this.configWnd.get('editor-background')
    if (conf.box3d.mouseFactor > 0) {
      this.mouseX = ev.pageX
      this.mouseY = ev.pageY
      if (conf.box3d.depth > 0) { return this.updateBox() } else { return this.updateBgPos() }
    }
  },

  activateMouseMove () {
    const {
      body
    } = this.elements
    return body.addEventListener('mousemove', ev => this.mouseMove.apply(this, [ev]))
  },

  insertMain () {
    const main = document.createElement('div')
    main.id = 'editor-background-main'
    this.elements.main = main
    document.querySelector('#editor-background-main'.remove)
    this.elements.body.insertBefore(main, this.elements.body.firstChild)
    this.elements.itemViews = document.querySelectorAll('.item-views')
    return Array.from(this.elements.itemViews).map((el) =>
      (el.style.cssText = 'background:transparent !important'))
  },

  insertTextBackgroundCss () {
    // CSS for background text
    const txtBgCss = document.createElement('style')
    txtBgCss.type = 'text/css'
    const bgColor =
    (txtBgCss.cssText = '\
.editor-background-line{ \
background:black; \
color:white; \
} \
atom-pane-container atom-pane .item-views{ \
background:transparent !important; \
background-color:transparent !important; \
}\
')
    this.elements.textBackgroundCss = txtBgCss
    return this.elements.main.appendChild(txtBgCss)
  },

  insertTextBackground () {
    // container of the background text
    const txtBg = document.createElement('div')
    txtBg.style.cssText = '\
position:absolute; \
z-index:-1;\
'
    this.elements.textBackground = txtBg
    return this.elements.main.appendChild(txtBg)
  },

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
  },

  timer: {},
  frames: [],
  frame: 0,
  videoWidth: 0,
  videoHeight: 0,
  playing: true,

  getFrame (canvas, ctx, video, w, h) {
    this.frame++
    const tick = 50
    // console.log 'getFrame time',@time
    if ((this.frame * tick) >= (this.time.end - this.time.start)) {
      return this.getImagesDone
    }
    const frame = document.querySelector('#editor-background-frame')
    frame.innerText = this.frame
    ctx.drawImage(video, 0, 0)
    video.pause()
    if (this.playing) {
      this.frames.push(canvas.toDataURL('image/jpeg'))
      video.play()
      if (this.playing) {
        return setTimeout(() => {
          return this.getFrame.apply(this, [canvas, ctx, video, w, h])
        }
        , tick)
      }
    }
  },

  getImages () {
    this.playing = true
    this.frame = 0
    // console.log 'getting images...'
    const {
      video
    } = this.elements
    const canvas = this.elements.videoCanvas
    const context = canvas.getContext('2d')
    const ytid = this.getYTId(this.configWnd.get('editor-background.video.youTubeURL'))

    const html = '\
<div id=\'editor-background-modal\' style=\'overflow:hidden\'> \
Getting Frame: <span id=\'editor-background-frame\'>0</span><br> \
Please be patient.</div>'
    const title = 'Editor background - frames'
    const args = {
      buttons: {
        Cancel: ev => this.getImagesDone()
      },
      title,
      content: html
    }
    this.popup.show(args)

    const w = this.videoWidth
    const h = this.videoHeight
    return this.getFrame(canvas, context, video, w, h)
  },

  getImagesDone () {
    this.playing = false
    const {
      ytid
    } = this.elements

    const imagesFolder = this.elements.videoPath + ytid + '_images/'
    try {
      fs.mkdirSync(imagesFolder, 0o777)
    } catch (error) {}
    // console.log error
    let i = 0
    for (const frame of Array.from(this.frames)) {
      const base64 = frame.replace(/^data:image\/jpeg;base64,/, '')
      try {
        fs.writeFileSync(imagesFolder + i + '.jpg', base64, 'base64')
      } catch (error1) {}
      // console.log error
      i++
    }
    this.elements.videoCanvas.remove()
    this.elements.video.remove()
    atom.config.set('editor-background.blurRadius', 0)
    atom.config.set('editor-background.imageURL', '')
    this.popup.hide()
    return this.initAnimation(ytid)
  },

  decodeVideo () {
    // console.log 'decoding video',@elements.video
    this.frames = []
    const {
      video
    } = this.elements
    video.addEventListener('ended', () => {
      return this.getImagesDone()
    })
    return video.addEventListener('canplay', () => {
      return this.getImages()
    })
  },

  insertVideo (savePath) {
    const data = fs.readFileSync(savePath)
    const videoCanvas = document.createElement('canvas')
    const {
      videoWidth
    } = this
    const {
      videoHeight
    } = this
    videoCanvas.width = videoWidth
    videoCanvas.height = videoHeight
    videoCanvas.id = 'editor-background-videoCanvas'
    const conf = this.configWnd.get('editor-background')
    const videoOpacity = (conf.video.opacity / 100).toFixed(2)
    videoCanvas.style.cssText = `\
position:absolute; \
top:0px; \
left:0px; \
display:none; \
width:${videoWidth}px; \
height:${videoHeight}px; \
opacity:${videoOpacity};\
`
    this.elements.videoCanvas = videoCanvas
    this.elements.main.insertBefore(videoCanvas, this.elements.textBackground)
    return this.decodeVideo()
  },

  createVideoElement (src) {
    const video = document.createElement('video')
    const source = document.createElement('source')
    this.elements.video = video
    this.elements.source = source
    video.appendChild(source)
    source.type = 'video/' + this.elements.videoFormat
    source.src = src
    video.style.cssText = '\
position:absolute; \
left:0; \
top:0; \
width:100%; \
height:100%;\
'
    return this.elements.main.insertBefore(video, this.elements.textBackground)
  },

  chooseFormat (formats, next) {
    let itag
    console.log('choose format?')
    let html = '\
<div style="font-size:1.1em;text-align:center;margin-bottom:20px;"> \
Choose video format</div> \
<div style="text-align:center;margin-bottom:30px;"> \
<select id="background-format" name="format">'
    // console.log 'formatChooser'
    const formatKeys = Object.keys(formats)
    for (itag of Array.from(formatKeys)) {
      const format = formats[itag]
      // console.log 'format',format
      html += `<option value=\"${format.itag}\">Size: ${format.size}</option>`
    }
    html += '</select></div> \
</div> \
<br><br> \
</div>'

    const args = {
      buttons: {
        OK: (ev, popup) => {
          const bgf = document.querySelector('#background-format')
          itag = bgf.value
          this.popup.hide()
          return next(itag)
        }
      },
      content: html,
      title: 'Editor Background - Video format'
    }
    // console.log 'show popup?'
    return this.popup.show(args)
  },

  downloadYTVideo (url) {
    // console.log 'download yt video?',url
    const {
      videoExt
    } = this.elements
    const {
      videoFormat
    } = this.elements
    if (url !== '') {
      const ytid = this.getYTId(url)
      this.elements.ytid = ytid
      const savePath = this.elements.videoPath + ytid + videoExt

      let alreadyExists = false
      try {
        const downloaded = fs.statSync(savePath)
        alreadyExists = downloaded.isFile()
      } catch (error) {}
      // console.log error

      try {
        const dirExists = fs.statSync(this.elements.videoPath)
        if (dirExists != null) {
          if (!dirExists.isDirectory()) {
            fs.mkdirSync(this.elements.videoPath, 0o777)
          }
        } else {
          fs.mkdirSync(this.elements.videoPath, 0o777)
        }
      } catch (e) {}
      // console.log e.stack

      if (!alreadyExists) {
        this.yt = new yt(url)
        this.yt.on('formats', formats => {})
        // console.log 'formats',formats
        this.yt.on('data', data => {
          const html = '<div style="text-align:center;font-size:1.1em;"> \
Downloading: ' + (data.percent).toFixed(2) + ' % \
</div>'
          const title = 'Editor Background - download'
          const args = {
            title: 'Editor Background - downloading...',
            content: html
          }
          return this.popup.show(args)
        })

        this.yt.on('done', chunks => {
          this.popup.hide()
          this.createVideoElement(savePath)
          return this.insertVideo.apply(this, [savePath])
        })

        this.yt.on('ready', () => {
          console.log('get video info ready')
          const conf = this.configWnd.get('editor-background')
          this.time = {
            start: conf.video.startTime,
            end: conf.video.endTime
          }
          return this.chooseFormat(this.yt.formats, format => {
            console.log('we chosen format', format)
            this.videoWidth = this.yt.formats[format].width
            this.videoHeight = this.yt.formats[format].height
            return this.yt.download({ filename: savePath, itag: format, time: this.time })
          })
        })
        console.log('getting video info')
        return this.yt.getVideoInfo()
      } else {
        return this.initAnimation(ytid)
      }
    } else {
      return this.removeVideo()
    }
  },

  removeVideo () {
    if (this.animation != null) {
      this.animation.stop()
      return delete this.animation
    }
  },

  startYouTube () {
    if (this.packagesLoaded) {
      this.removeVideo()
      const conf = this.configWnd.get('editor-background')
      if (((conf.video.youTubeURL != null) !== '') && conf.video.playAnimation) {
        if ((this.animation == null)) {
          return this.downloadYTVideo(conf.video.youTubeURL)
        }
      } else {
        return this.removeVideo()
      }
    } else {
      return setTimeout(() => this.startYouTube.apply(this, []), 1000)
    }
  },

  initAnimation (ytid) {
    if ((this.animation == null)) {
      atom.notifications.add('notice', 'starting animation...')
      this.animation = new animation(ytid)
      this.animation.start(this.elements.main, this.elements.textBackground)
      const conf = this.configWnd.get('editor-background')
      const videoOpacity = (conf.video.opacity / 100).toFixed(2)
      if ((this.animation != null ? this.animation.canvas : undefined) != null) {
        return inline(this.animation.canvas, `opacity:${videoOpacity};`)
      }
    }
  },

  getOffset (element, offset) {
    ({ left: 0, top: 0 })
    if (element != null) {
      if ((offset == null)) { offset = { left: 0, top: 0 } }
      offset.left += element.offsetLeft
      offset.top += element.offsetTop
      if (element.offsetParent != null) {
        return this.getOffset(element.offsetParent, offset)
      } else {
        return offset
      }
    }
  },

  drawLine (tokenizedLine, attrs) {
    let marginLeft
    const line = document.createElement('div')
    line.className = 'editor-background-line'
    let text = tokenizedLine.text.trim()
    text = escapeHTML(text)
    text = text.replace(/[\s]{1}/gi,
      '<span class="editor-background-white"></span>')
    text = text.replace(/[\t]{1}/gi,
      '<span class="editor-background-tab"></span>')
    line.innerHTML = text
    if (tokenizedLine.indentLevel != null) {
      marginLeft = tokenizedLine.indentLevel *
        tokenizedLine.tabLength * attrs.charWidth
    } else {
      marginLeft = attrs.tokenizedBuffer.indentLevelForLine(tokenizedLine.text) *
        attrs.tokenizedBuffer.getTabLength() * attrs.charWidth
    }
    marginLeft -= attrs.scrollLeft
    line.style.cssText = `\
margin-left:${marginLeft}px;\
`
    return this.elements.textBackground.appendChild(line)
  },

  drawLines (attrs) {
    if (attrs != null) {
      if ((attrs.editorElement != null) && (attrs.screenLines != null)) {
        this.elements.textBackground.innerText = ''
        let editor = attrs.editorElement
        if (editor.constructor.name === 'atom-text-editor') {
          let bottom, charWidth, left, lineHeight, right, tabWidth, top
          const conf = this.configWnd.get('editor-background')
          // console.log 'conf',conf
          const textBlur = conf.text.blur
          const opacity = (conf.text.opacity / 100).toFixed(2)
          const color = conf.text.color.toHexString()
          const {
            expand
          } = conf.text

          const root = editor.shadowRoot
          const scrollView = root.querySelector('.scroll-view')
          if (scrollView != null) {
            const offset = this.getOffset(scrollView)
            top = offset.top - attrs.offsetTop;
            ({
              left
            } = offset)
            right = left + scrollView.width + textBlur
            bottom = top + scrollView.height
            const {
              activeEditor
            } = attrs
            const {
              displayBuffer
            } = attrs;
            ({
              lineHeight
            } = attrs)
            charWidth = displayBuffer.getDefaultCharWidth()
            tabWidth = displayBuffer.getTabLength() * charWidth
          }

          editor = atom.workspace.getActiveTextEditor()
          editor = atom.views.getView(editor)

          if (editor != null) {
            const computedStyle = window.getComputedStyle(editor)

            let {
              fontFamily
            } = computedStyle
            let {
              fontSize
            } = computedStyle
            if (atom.config.settings.editor != null) {
              const editorSetting = atom.config.settings.editor
              if (editorSetting.fontFamily != null) {
                ({
                  fontFamily
                } = editorSetting)
              }
              if (editorSetting.fontSize != null) {
                ({
                  fontSize
                } = editorSetting)
              }
            }

            if (!/[0-9]+px$/.test(fontSize)) {
              fontSize += 'px'
            }

            const scaleX = 1 + parseFloat((expand / 100).toFixed(2))
            const scaleY = 1 + parseFloat((expand / 10).toFixed(2))

            const css = this.elements.textBackgroundCss

            css.innerText = `\
.editor-background-line{ \
font-family:${fontFamily}; \
font-size:${fontSize}; \
height:${lineHeight}px; \
display:block; \
color:transparent; \
background:${color}; \
width:auto; \
border-radius:10px; \
transform:translate3d(0,0,0) scale(${scaleX},${scaleY}); \
float:left; \
clear:both; \
} \
.editor-background-white{ \
width:${charWidth}px; \
display:inline-block; \
} \
.editor-background-tab{ \
width:${tabWidth}px; \
display:inline-block; \
}\
`
            this.elements.textBackground.style.cssText = `\
top:${top}px; \
left:${left}px; \
right:${right}px; \
bottom:${bottom}px; \
position:absolute; \
overflow:hidden; \
z-index:0; \
pointer-events:none; \
opacity:${opacity}; \
transform:translate3d(0,0,0); \
-webkit-filter:blur(${textBlur}px);\
`

            const attrsForward = {
              charWidth,
              scrollLeft: attrs.scrollLeft,
              tokenizedLines: attrs.tokenizedLines,
              tokenizedBuffer: attrs.tokenizedBuffer
            }
            return (() => {
              const result = []
              for (const line of Array.from(attrs.screenLines)) {
              // editor.displayBuffer is undocumented, it's .splice function
              // might return an empty array with a non-zero length
              // Make sure that if that happens, @drawLine doesn't get passed
              // `undefined` (CoffeeScript happily indexes non-existing array
              // indices in a `for-in` loop, as the for loop it expands to only
              // uses the `.length` property to determine the array's domain.)
                if (line != null) { result.push(this.drawLine(line, attrsForward)) } else {
                  result.push(undefined)
                }
              }
              return result
            })()
          }
        }
      }
    }
  },

  activeEditor: {},

  removeBgLines () {
    return this.elements.textBackground.innerText = ''
  },

  drawBackground (event, editor) {
    // no editors left
    if ((event != null ? event.destroy : undefined) != null) {
      if (event.destroy.pane.items.length === 0) {
        this.removeBgLines()
        return
      }
    }
    // changed active editor

    this.activeEditor = atom.workspace.getActiveTextEditor()
    if ((event != null ? event.active : undefined) != null) {
      this.activeEditor = editor
      if (editor != null) {
        process.nextTick(() => this.drawBackground.apply(this, []))
      } else {
        this.removeBgLines()
      }
      return
    }
    const {
      activeEditor
    } = this

    if (((activeEditor != null ? activeEditor.displayBuffer : undefined) == null)) {
      this.removeBgLines()
    }
    if ((activeEditor != null ? activeEditor.displayBuffer : undefined) != null) {
      const {
        displayBuffer
      } = activeEditor
      if (displayBuffer != null) {
        let tokenizedLines
        let editorElement = atom.views.getView(activeEditor)
        let actualLines = activeEditor.getVisibleRowRange()
        if (displayBuffer.getTokenizedLines != null) {
          tokenizedLines = displayBuffer.getTokenizedLines()
        } else {
          ({
            tokenizedLines
          } = displayBuffer.tokenizedBuffer)
        }
        if ((actualLines == null)) {
          this.removeBgLines()
          actualLines = [0, 1]
        }
        // we must display text bg even if visibleRowRange returns null
        // because there may be some characters that user is typing

        if ((actualLines != null ? actualLines.length : undefined) === 2) {
          if ((actualLines != null) && (actualLines[0] != null) && (actualLines[1] != null)) {
            const screenLines = tokenizedLines.slice(actualLines[0], +actualLines[1] + 1 || undefined)

            const scrollTop = activeEditor.getScrollTop()
            const scrollLeft = activeEditor.getScrollLeft()
            const lineHeight = activeEditor.getLineHeightInPixels()
            const offsetTop = scrollTop - (Math.round(scrollTop / lineHeight) * lineHeight)
            editorElement = atom.views.getView(activeEditor)
            if (editorElement != null) {
              if (editorElement.constructor.name === 'atom-text-editor') {
                const editorRect = editorElement.getBoundingClientRect()
                const attrs =
                  {
                    editorElement,
                    activeEditor,
                    lineHeight,
                    displayBuffer,
                    screenLines,
                    offsetTop,
                    scrollTop,
                    scrollLeft,
                    visibleBuffer: actualLines,
                    tokenizedLines,
                    tokenizedBuffer: displayBuffer.tokenizedBuffer
                  }
                return this.drawLines(attrs)
              }
            }
          }
        }
      }
    }
  },

  watchEditor (editor) {
    this.subs.add(editor.onDidChangeScrollTop(scroll => {
      return this.drawBackground.apply(this, [{ scrollTop: scroll }, editor])
    }))
    this.subs.add(editor.onDidChangeScrollLeft(scroll => {
      return this.drawBackground.apply(this, [{ scrolLeft: scroll }, editor])
    }))
    this.subs.add(editor.onDidChange(change => {
      return this.drawBackground.apply(this, [{ change }, editor])
    }))
    const element = editor.getElement()
    const model = element.getModel()
    const editorElement = model.editorElement.component.domNodeValue
    // little hack because of no "resize" event on textEditor
    return elementResizeEvent(editorElement, () => {
      return this.drawBackground.apply(this, [{ resize: editorElement }, editor])
    })
  },

  watchEditors () {
    this.subs.add(atom.workspace.observeTextEditors(editor => {
      return this.watchEditor.apply(this, [editor])
    }))
    this.subs.add(atom.workspace.observeActivePaneItem(editor => {
      return this.drawBackground.apply(this, [{ active: editor }, editor])
    }))
    this.subs.add(atom.workspace.onDidDestroyPaneItem(pane => {
      return this.drawBackground.apply(this, [{ destroy: pane }])
    }))
    this.subs.add(atom.workspace.onDidDestroyPane(pane => {
      return this.drawBackground.apply(this, [{ destroy: pane }])
    }))
    // another hack to be notified when new editor comes in place
    return this.subs.add(atom.workspace.emitter.on('did-add-text-editor', ev => {
      const editor = ev.textEditor
      return this.drawBackground.apply(this, [{ active: editor }, editor])
    }))
  },
  // @subs.add atom.workspace.onDidInsertText (text)=>

  initializePackage () {
    this.elements.body = qr('body')
    this.elements.workspace = qr('atom-workspace')
    this.elements.editor = null
    if (this.elements.workspace != null) {
      const activeEditor = atom.workspace.getActiveTextEditor()
      this.elements.editor = atom.views.getView(activeEditor)
    }
    this.elements.treeView = qr('.tree-view')
    this.elements.left = qr('.left')
    this.elements.leftPanel = qr('.panel-left')
    this.elements.resizer = qr('.tree-view-resizer')
    this.elements.tabBar = qr('.tab-bar')
    this.elements.insetPanel = qr('.inset-panel')

    const keys = Object.keys(this.elements)
    const loaded = ((() => {
      const result = []
      for (const k of Array.from(keys)) {
        if (this.elements[k] != null) {
          result.push(this.elements[k])
        }
      }
      return result
    })())
    // console.log 'keys',keys,loaded
    if (loaded.length === keys.length) {
      this.insertMain()
      this.popup = new popup()
      const confOptions = {
        onChange: () => {
          return this.drawBackground()
        }
      }
      this.configWnd = new configWindow('editor-background', confOptions)
      this.activateMouseMove()

      const conf = this.configWnd.get('editor-background')

      this.elements.image = document.createElement('img')
      this.elements.image.id = 'editor-background-image'
      this.elements.image.setAttribute('src', conf.image.url)

      this.elements.blurredImage = conf.image.url

      this.insertTextBackgroundCss()

      if (conf.box3d.mouseFactor > 0) { this.activateMouseMove() }

      this.appendCss()
      this.watchEditors()

      this.elements.bg = document.createElement('div')
      this.elements.bg.style.cssText = 'position:absolute;width:100%;height:100%;'
      this.elements.main.appendChild(this.elements.bg)

      this.elements.boxStyle = this.createBox()

      this.elements.plane = document.createElement('div')
      this.elements.plane.style.cssText = planeInitialCss
      this.elements.main.appendChild(this.elements.plane)

      this.insertTextBackground()

      this.colors.workspaceBgColor = style(this.elements.editor).backgroundColor
      this.colors.treeOriginalRGB = style(this.elements.treeView).backgroundColor
      this.packagesLoaded = true

      const videoOpacity = (conf.video.opacity / 100).toFixed(2)
      if ((this.animation != null ? this.animation.canvas : undefined) != null) {
        inline(this.animation.canvas, `opacity:${videoOpacity};`)
      }

      this.blurImage()
      this.elements.videoPath = this.pluginPath() + '/youtube-videos/'
      this.elements.libPath = this.pluginPath() + '/lib/'
      this.elements.videoExt = '.mp4'
      this.elements.videoFormat = 'mp4'
      try {
        fs.mkdirSync(this.elements.videoPath, 0o777)
      } catch (error) {}

      return this.applyBackground.apply(this)
    } else {
      return setTimeout(() => this.initializePackage.apply(this), 1000)
    }
  },

  updateBgPos () {
    const conf = this.configWnd.get('editor-background')
    const {
      body
    } = this.elements
    const factor = conf.box3d.mouseFactor
    const polowaX = Math.floor(body.clientWidth / 2)
    const polowaY = Math.floor(body.clientHeight / 2)
    const offsetX = this.mouseX - polowaX
    const offsetY = this.mouseY - polowaY
    const x = (Math.floor(offsetX / factor))
    const y = (Math.floor(offsetY / factor))
    return inline(this.elements.bg, `background-position:${x}px ${y}px !important;`)
  },

  updateBox (depth) {
    const conf = this.configWnd.get('editor-background')
    if ((depth == null)) {
      ({
        depth
      } = conf.box3d)
    }
    const depth2 = Math.floor(depth / 2)
    const background = this.elements.blurredImage
    const opacity = (conf.box3d.shadowOpacity / 100).toFixed(2)
    const imgOpacity = conf.image.opacity / 100
    const range = 300
    const range2 = Math.floor(range / 3)
    let bgSize = conf.image.backgroundSize
    if (bgSize === 'manual') { bgSize = conf.image.manualBackgroundSize }
    if (bgSize === 'original') { bgSize = 'auto' }
    const {
      body
    } = this.elements
    const factor = conf.box3d.mouseFactor
    const polowaX = Math.floor(body.clientWidth / 2)
    const polowaY = Math.floor(body.clientHeight / 2)
    const offsetX = this.mouseX - polowaX
    const offsetY = this.mouseY - polowaY
    const x = polowaX + (Math.floor(offsetX / factor))
    const y = polowaY + (Math.floor(offsetY / factor))
    inline(this.elements.bg, 'opacity:0;')
    const position = conf.image.backgroundPosition
    const {
      repeat
    } = conf.image
    const boxCss = `\
.eb-box-wrapper{ \
perspective:1000px; \
perspective-origin:${x}px ${y}px; \
backface-visibility: hidden; \
position:fixed; \
top:0; \
left:0; \
width:100%; \
height:100%; \
opacity:${imgOpacity}; \
} \
.eb-left,.eb-top,.eb-right,.eb-bottom,.eb-back{ \
position:fixed; \
transform-origin:50% 50%; \
box-shadow:inset 0px 0px ${range}px rgba(0,0,0,${opacity}), \
inset 0px 0px ${range2}px rgba(0,0,0,${opacity}); \
background-image:url('${background}'); \
background-size:${bgSize}; \
backface-visibility: hidden; \
background-position:${position}; \
background-repeat:${repeat}; \
} \
.eb-left,.eb-right{ \
width:${depth}px; \
height:100%; \
} \
.eb-top,.eb-bottom{ \
width:100%; \
height:${depth}px; \
} \
.eb-left{ \
transform: translate3d(-50%,0,0) rotateY(-90deg); \
left:0; \
} \
.eb-top{ \
transform: translate3d(0,-50%,0) rotateX(90deg); \
top:0; \
} \
.eb-right{ \
transform: translate3d(50%,0,0) rotateY(-90deg); \
right:0; \
} \
.eb-bottom{ \
transform: translate3d(0,50%,0) rotateX(90deg); \
bottom:0; \
} \
.eb-back{ \
transform: translate3d(0,0,-${depth2}px); \
width:100%; \
height:100%; \
}\
`
    this.elements.boxStyle.innerText = boxCss
    if (depth === 0) {
      return this.elements.boxStyle.innerText = '.eb-box-wrapper{display:none;}'
    }
  },

  pluginPath () {
    let _path = atom.packages.resolvePackagePath('editor-background')
    if (!_path) {
      _path = path.resolve(__dirname)
    }
    return _path
  },

  blurImage () {
    if (this.packagesLoaded) {
      let imageData
      const conf = this.configWnd.get('editor-background')
      this.elements.image.setAttribute('src', conf.image.url)
      let applyBlur = false
      if (conf.image.blurRadius > 0) {
        if (this.elements.image != null) {
          if (this.elements.image.complete) {
            applyBlur = true
          } else {
            setTimeout(() => this.blurImage.apply(this), 1000)
          }
        }
      }
      if (applyBlur && conf.image.url) {
        imageData = blur.stackBlurImage(this.elements.image, conf.image.blurRadius, false)
        const base64Data = imageData.replace(/^data:image\/png;base64,/, '')
        let filename = this.pluginPath() + '/blur.png'
        filename = filename.replace(/\\/gi, '/')

        fs.writeFileSync(filename, base64Data, { mode: 0o777, encoding: 'base64' })
        imageData = filename + '?timestamp=' + Date.now()
      } else {
        imageData = conf.image.url
      }
      this.elements.blurredImage = imageData
      if (conf.box3d.depth > 0) {
        return this.updateBox()
      } else {
        const opacity = conf.image.opacity / 100
        const position = conf.image.backgroundPosition
        const {
          repeat
        } = conf.image
        inline(this.elements.bg, `background-image: url('${imageData}') !important;`)
        inline(this.elements.bg, `opacity:${opacity};`)
        inline(this.elements.bg, `background-position:${position};`)
        return inline(this.elements.bg, `background-repeat:${repeat};`)
      }
    }
  },

  applyBackground () {
    if (this.packagesLoaded) {
      let _newColor
      const workspaceView = this.elements.workspace
      // console.log 'workspaceView',workspaceView
      if (workspaceView != null) {
        if (workspaceView.className.indexOf('editor-background') === -1) {
          workspaceView.className += ' editor-background'
        }
      }
      const conf = this.configWnd.get('editor-background')
      const opacity = 100 - conf.image.opacity
      const alpha = (opacity / 100).toFixed(2)

      let rgb = colorToArray(this.colors.workspaceBgColor)
      let newColor = 'rgba( ' + rgb[0] + ' , ' + rgb[1] + ' , ' + rgb[2] + ' , ' + alpha + ')'

      const treeOpacity = conf.other.treeViewOpacity
      const treeAlpha = (treeOpacity / 100).toFixed(2)
      const treeRGB = colorToArray(this.colors.treeOriginalRGB)

      let newTreeRGBA =
        'rgba(' + treeRGB[0] + ',' + treeRGB[1] + ',' + treeRGB[2] + ',' + treeAlpha + ')'

      if (conf.image.customOverlayColor) {
        _newColor = conf.image.overlayColor.toRGBAString()
        rgb = colorToArray(_newColor)
        newColor = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + alpha + ')'
        newTreeRGBA = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + treeAlpha + ')'
      } else {
        _newColor = this.colors.workspaceBgColor
      }
      this.elements.css.innerText += `body{background:${_newColor} !important;}`

      // @elements.css.innerText+="\natom-pane-container atom-pane .item-views{background:transparent !important;}"

      if (conf.text.shadow) {
        this.elements.css.innerText += '\natom-text-editor::shadow .line{text-shadow:' +
        conf.text.shadow + ' !important;}'
      }

      if (conf.box3d.depth > 0) {
        this.updateBox(conf.box3d.depth)
      } else {
        this.elements.boxStyle.innerText = '.eb-box-wrapper{display:none;}'
      }

      // console.log 'conf.image.size',conf.image.backgroundSize
      if (conf.image.backgroundSize !== 'original') {
        inline(this.elements.bg, 'background-size:' + conf.image.backgroundSize +
        ' !important;'
        )
      } else {
        inline(this.elements.bg, 'background-size:auto !important')
      }
      if (conf.image.backgroundSize === 'manual') {
        inline(this.elements.bg, 'background-size:' + conf.image.manualBackgroundSize +
        ' !important;'
        )
      }

      if (conf.image.style) {
        this.elements.plane.style.cssText += conf.image.style
      }

      this.blurImage()

      if (conf.other.transparentTabBar) {
        inline(this.elements.tabBar, 'background:rgba(0,0,0,0) !important;')
        inline(this.elements.insetPanel, 'background:rgba(0,0,0,0) !important;')
      }

      if (conf.other.treeViewOpacity > 0) {
        inline(this.elements.treeView, 'background:' + newTreeRGBA + ' !important;')
        inline(this.elements.left, 'background:transparent !important;')
        inline(this.elements.resizer, 'background:transparent !important;')
        return inline(this.elements.leftPanel, 'background:transparent !important;')
      }
    }
  },

  // show config window
  toggle () {
    if (!this.configWnd) {
      return atom.notifications.add('warning', 'Editor-background is only available after you open some files.')
    } else {
      if (!this.configWnd.visible) {
        return this.configWnd.show()
      } else {
        return this.popup.hide()
      }
    }
  }
})

{requirePackages} = require 'atom-utils'
fs = require 'fs-plus'

module.exports =
class FileInfo
  visible: false
  debug: false
  sortKey: 'name'
  sortOrder: 'ascent'

  constructor: () ->

  destroy: ->

  initialize: ->
    console.log 'file-info: initialize' if @debug

  show: (treeView) ->
    console.log 'file-info: show: treeView =', treeView if @debug
    return if not treeView
    @treeView = treeView
    @visible = true
    @update()

  hide: ->
    console.log 'file-info: hide' if @debug
    @visible = false
    @update()
    @treeView = null

  update: ->
    if @treeView?
      if @visible
        @add()
      else
        @delete()

  delete:->
    console.log 'file-info: delete' if @debug
    elements = @treeView.element.querySelectorAll '.entry .file-info'
    for element in elements
      element.classList.remove('file-info')
      element.classList.remove('file-info-debug') if @debug
    elements = @treeView.element.querySelectorAll '.entry .file-info-added'
    for element in elements
      element.remove()

  add: ->
      console.log 'file-info: add' if @debug
      @updateWidth()

  updateWidth: (nameWidth = @nameWidth, sizeWidth = @sizeWidth, mdateWidth = @mdateWidth) ->
    console.log 'file-info: updateWidth:', nameWidth, sizeWidth, mdateWidth if @debug
    @nameWidth = nameWidth
    @sizeWidth = sizeWidth
    @mdateWidth = mdateWidth

    if @treeView and @visible
      ol = @treeView.element.querySelector '.tree-view'
      if @debug
        console.log "file-info: updateWidth: querySelector('.tree-view') =",
          ol, ol.getBoundingClientRect()
      @offset = ol.getBoundingClientRect().left
      @fileEntries = @treeView.element.querySelectorAll '.entry'
      @fileEntryIndex = 0
      clearInterval(@timer)
      console.log 'file-info: update thread...' if @debug
      console.log 'file-info: update thread...', @updateThread if @debug
      @timer = setInterval(@updateThread, 1)

  updateThread: =>
      if not @treeView or not @visible
        clearInterval(@timer)
        @timer = null
        @fileEntries = null
        return

      cost = 0
      added = 0
      while fileEntry = @fileEntries[@fileEntryIndex++]
        name = fileEntry.querySelector 'span.name'
        if not name.classList.contains('file-info')
          added++
          name.classList.add('file-info')
          name.classList.add('file-info-debug') if @debug
          stat = fs.statSyncNoException(name.dataset.path)

          padding = document.createElement('span')
          padding.textContent = '\u00A0'  # XXX
          fileEntry.dataset.name = name.textContent.toLowerCase()  # use for sorting
          padding.classList.add('file-info-added')
          padding.classList.add('file-info-padding')
          padding.classList.add('file-info-debug') if @debug
          name.parentNode.appendChild(padding)

          size = document.createElement('span')
          innerSize = document.createElement('span')
          if fileEntry.classList.contains('file')
            innerSize.textContent = @toSizeString(stat.size)
            fileEntry.dataset.size = stat.size  # use for sorting
          else
            innerSize.textContent = '--'
            fileEntry.dataset.size = -1  # use for sorting
          innerSize.classList.add('file-info-inner-size')
          innerSize.classList.add('file-info-debug') if @debug
          size.appendChild(innerSize)
          size.classList.add('file-info-added')
          size.classList.add('file-info-size')
          size.classList.add('file-info-debug') if @debug
          name.parentNode.appendChild(size)

          date = document.createElement('span')
          innerDate = document.createElement('span')
          innerDate.textContent = @toDateString(stat.mtime)
          fileEntry.dataset.mdate = stat.mtime.getTime()  # use for sorting
          innerDate.classList.add('file-info-inner-mdate')
          innerDate.classList.add('file-info-debug') if @debug
          date.appendChild(innerDate)
          date.classList.add('file-info-added')
          date.classList.add('file-info-mdate')
          date.classList.add('file-info-debug') if @debug
          name.parentNode.appendChild(date)

        name = fileEntry.querySelector 'span.name'
        [padding] = name.parentNode.querySelectorAll '.file-info-padding'
        [size] = name.parentNode.querySelectorAll '.file-info-size'
        [mdate] = name.parentNode.querySelectorAll '.file-info-mdate'

        rect = name.getBoundingClientRect()
        margin = @nameWidth - (rect.left - @offset + rect.width)
        if margin < 10
          padding.style.marginRight = margin + 'px'
          padding.style.width = '0px'
        else
          padding.style.marginRight = '0px'
          padding.style.width = margin + 'px'
        if @debug
          console.log 'file-info: updateWidth:', @fileEntryIndex-1 + ':',
            padding.style.width, padding.style.marginRight,
            '(' + @nameWidth + ' - ' + (rect.left - @offset) + ' - ' + rect.width + ')'
        size.style.width = @sizeWidth + 'px'
        mdate.style.width = @mdateWidth+ 'px'
        if 50 < ++cost
          @sort(@sortKey, @sortOrder) if added
          return

      console.log 'file-info: update thread...done' if @debug
      clearInterval(@timer)
      @sort(@sortKey, @sortOrder) if added

  toSizeString: (size) ->
    if size < 1
      return 'Zero bytes'
    if size < 2
      return '1 byte'
    if size < 1000
      return size + ' bytes'
    if size < 999500
      return Math.round(size/1000)/1 + ' KB'
    if size < 999950000
      return Math.round(size/100000)/10 + ' MB'
    return Math.round(size/10000000)/100 + ' GB'

  toDateString: (date) ->
    shortMonth = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    res = new Date(date + '')
    shortMonth[res.getMonth()] + ' ' + res.getDate() + ', ' + 
      res.getFullYear() + ', ' + res.getHours() + ':' + res.getMinutes()

  calcOptWidthName: =>
    ol = @treeView.element.querySelector '.tree-view'
    offset = ol.getBoundingClientRect().left
    elems = @treeView.element.querySelectorAll '.entry span.name'
    maxWidth = 0
    for elem in elems
      rect = elem.getBoundingClientRect()
      width = (rect.left - @offset + rect.width)
      maxWidth = Math.max(width, maxWidth)
    maxWidth

  calcOptWidthSize: =>
    @calcOptWidth '.entry .file-info-inner-size'

  calcOptWidthMdate: =>
    @calcOptWidth '.entry .file-info-inner-mdate'

  calcOptWidth: (selector) ->
    elems = @treeView.element.querySelectorAll selector
    maxWidth = 0
    for elem in elems
      maxWidth = Math.max(elem.offsetWidth, maxWidth)
    maxWidth + 16

  # XXX, messy...
  sort: (key='name', order='ascent') ->
    return if not @treeView
    @sortKey = key
    @sortOrder = order
    if @debug
      console.log 'file-info: sort:',
        'key =', @sortKey, ', order =', @sortOrder
    ols = @treeView.element.querySelectorAll 'ol.entries.list-tree'
    for ol in ols
      # if ol.childNodes.length
      #   console.log '====================', ol, ol.childNodes
      ar = []
      for li in ol.childNodes
        # console.log li.dataset['name'], 'value =', li.dataset[key]
        ar.push li
      for li in ar
        ol.removeChild(li)
      if order is 'ascent'
        bWin = -1
        aWin = 1
      else
        bWin = 1
        aWin = -1
      stringCompFunc = (a, b, key = 'name') ->
        if a.dataset[key] < b.dataset[key]
          return bWin
        if a.dataset[key] > b.dataset[key]
          return aWin
        return 0
      numberCompFunc = (a, b, key = 'name') ->
        return (a.dataset[key] - b.dataset[key]) * aWin
      if key is 'name'
        ar.sort (a, b) ->
          stringCompFunc(a, b, key)
      else
        ar.sort (a, b) ->
          if (res = numberCompFunc(a, b, key)) == 0
            res = stringCompFunc(a, b, 'name')
          res
      for li in ar
        ol.appendChild(li)
      ar = null

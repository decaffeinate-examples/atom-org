#!/usr/bin/env node
/** @babel */
/* eslint-disable
    no-return-assign,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

const Fs = require('fs')
const Path = require('path')
const marked = require('marked')
const emoji = require('emoji-images')
const taskLists = require('task-lists')
const toc = require('toc')

const emojiFolder = Path.join(Path.dirname(require.resolve('emoji-images')), 'pngs')

module.exports = function (file, opts, callback) {
  const options = {
    isFile: false,
    header: '<h<%= level %>><a name="<%= anchor %>" class="anchor" href="#<%= anchor %>"><span class="octicon octicon-link"></span></a><%= header %></h<%= level %>>',
    anchorMin: 1
  }

  const conversion = function (data) {
    const emojified = emoji(data, emojiFolder, 20).replace(/\\</g, '&lt;')
    const mdToHtml = marked(emojified)
    let contents = taskLists(mdToHtml)
    return contents = toc.process(contents, options)
  }

  if (typeof opts === 'function') {
    callback = opts
  } else {
    for (const key in opts) {
      options[key] = opts[key]
    }
  }

  marked.setOptions(options)

  if (options.isFile) {
    return Fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        return callback(err, null)
      } else {
        return callback(null, conversion(data))
      }
    })
  } else {
    return callback(null, conversion(file))
  }
}

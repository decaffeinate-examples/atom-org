#!/usr/bin/env node
/** @babel */
/* eslint-disable
    camelcase,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

const cheerio = require('cheerio')

module.exports = function (content) {
  const $ = cheerio.load(content)

  const render_item_checkbox = function (html, checked) {
    const label = html.slice(3, +(html.length - 1) + 1 || undefined)

    return `\
<label>
  <input type="checkbox"
  class="task-list-item-checkbox"
  ${checked}/>
  ${label}
</label>\
`
  }

  const list_iterator = function (item) {
    const srcHtml = $(item).html()

    if (/^\[x\]/.test(srcHtml)) {
      return $(item).html(render_item_checkbox(srcHtml, 'checked'))
    } else if (/^\[ \]/.test(srcHtml)) {
      return $(item).html(render_item_checkbox(srcHtml, ''))
    }
  }

  const listItems = $('li')

  for (let i = 0; i < listItems.length; i++) {
    const item = listItems[i]
    const child = $(item).children().first()['0']
    list_iterator(item)

    if (child) {
      if (child.name === 'p') {
        list_iterator(child)
      }
    }
  }

  return $.html()
}

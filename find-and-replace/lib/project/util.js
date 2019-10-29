/** @babel */
/* eslint-disable
    no-useless-escape,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const _ = require('underscore-plus')

let escapeNode = null

const escapeHtml = function (str) {
  if (escapeNode == null) { escapeNode = document.createElement('div') }
  escapeNode.innerText = str
  return escapeNode.innerHTML
}

const escapeRegex = str => str.replace(/[.?*+^$[\]\\(){}|-]/g, match => '\\' + match)

const sanitizePattern = function (pattern) {
  pattern = escapeHtml(pattern)
  return pattern.replace(/\n/g, '\\n').replace(/\t/g, '\\t')
}

const getReplacementResultsMessage = function ({ findPattern, replacePattern, replacedPathCount, replacementCount }) {
  if (replacedPathCount) {
    return `<span class=\"text-highlight\">Replaced <span class=\"highlight-error\">${sanitizePattern(findPattern)}</span> with <span class=\"highlight-success\">${sanitizePattern(replacePattern)}</span> ${_.pluralize(replacementCount, 'time')} in ${_.pluralize(replacedPathCount, 'file')}</span>`
  } else {
    return '<span class="text-highlight">Nothing replaced</span>'
  }
}

const getSearchResultsMessage = function (results) {
  if ((results != null ? results.findPattern : undefined) != null) {
    const { findPattern, matchCount, pathCount, replacedPathCount } = results
    if (matchCount) {
      return `${_.pluralize(matchCount, 'result')} found in ${_.pluralize(pathCount, 'file')} for <span class=\"highlight-info\">${sanitizePattern(findPattern)}</span>`
    } else {
      return `No ${(replacedPathCount != null) ? 'more' : ''} results found for '${sanitizePattern(findPattern)}'`
    }
  } else {
    return ''
  }
}

const showIf = function (condition) {
  if (condition) {
    return null
  } else {
    return { display: 'none' }
  }
}

module.exports = {
  escapeHtml,
  escapeRegex,
  sanitizePattern,
  getReplacementResultsMessage,
  getSearchResultsMessage,
  showIf
}

/** @babel */
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/*
Copyright (c) 2014, Groupon, Inc.
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:

Redistributions of source code must retain the above copyright notice,
this list of conditions and the following disclaimer.

Redistributions in binary form must reproduce the above copyright
notice, this list of conditions and the following disclaimer in the
documentation and/or other materials provided with the distribution.

Neither the name of GROUPON nor the names of its contributors may be
used to endorse or promote products derived from this software without
specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

// There are multiple ways to express the same thing in CSON, so trying to
// make `CSON.stringify(CSON.parse(str)) == str` work is doomed to fail
// but we can at least make output look a lot nicer than JSON.stringify's.
const jsIdentifierRE = /^[a-z_$][a-z0-9_$]*$/i
const tripleQuotesRE = new RegExp("'''", 'g') // some syntax hilighters hate on /'''/g

const SPACES = '          ' // 10 spaces

const newlineWrap = str => str && `\n${str}\n`

const isObject = obj => (typeof obj === 'object') && (obj !== null) && !Array.isArray(obj)

// See:
// http://www.ecma-international.org/ecma-262/5.1/#sec-15.12.3
module.exports = function (data, visitor, indent) {
  if (['undefined', 'function'].includes(typeof data)) { return undefined }

  // pick an indent style much as JSON.stringify does
  indent = (() => {
    switch (typeof indent) {
      case 'string': return indent.slice(0, 10)

      case 'number':
        var n = Math.min(10, Math.floor(indent))
        if (!Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).includes(n)) { n = 0 } // do not bail on NaN and similar
        return SPACES.slice(0, n)

      default: return 0
    }
  })()

  if (!indent) { return JSON.stringify(data, visitor, indent) }

  const indentLine = line => indent + line

  const indentLines = function (str) {
    if (str === '') { return str }
    return str.split('\n').map(indentLine).join('\n')
  }

  // have the native JSON serializer do visitor transforms & normalization for us
  const normalized = JSON.parse(JSON.stringify(data, visitor))

  const visitString = function (str) {
    if (str.indexOf('\n') === -1) {
      return JSON.stringify(str)
    } else {
      const string = str.replace(tripleQuotesRE, "\\'''")
      return `'''${newlineWrap(indentLines(string))}'''`
    }
  }

  const visitArray = function (arr) {
    const items = arr.map(function (value) {
      const serializedValue = visitNode(value)
      if (isObject(value)) {
        return `{${newlineWrap(indentLines(serializedValue))}}`
      } else {
        return serializedValue
      }
    })

    const array = items.join('\n')
    return `[${newlineWrap(indentLines(array))}]`
  }

  const visitObject = function (obj) {
    const keypairs = (() => {
      const result = []
      for (let key in obj) {
        const value = obj[key]
        if (!key.match(jsIdentifierRE)) { key = JSON.stringify(key) }
        const serializedValue = visitNode(value)
        if (isObject(value)) {
          if (serializedValue === '') {
            result.push(`${key}: {}`)
          } else {
            result.push(`${key}:\n${indentLines(serializedValue)}`)
          }
        } else {
          result.push(`${key}: ${serializedValue}`)
        }
      }
      return result
    })()

    return keypairs.join('\n')
  }

  var visitNode = function (node) {
    switch (typeof node) {
      case 'boolean': return `${node}`

      case 'number':
        if (isFinite(node)) {
          return `${node}`
        } else { return 'null' } // NaN, Infinity and -Infinity

      case 'string': return visitString(node)

      case 'object':
        if (node === null) {
          return 'null'
        } else if (Array.isArray(node)) {
          return visitArray(node)
        } else { return visitObject(node) }
    }
  }

  const out = visitNode(normalized)
  if (out === '') {
    return '{}' // the only thing that serializes to '' is an empty object
  } else { return out }
}

/** @babel */
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const path = require('path')
const fs = require('fs')
const request = require('request')

const mdnCSSURL = 'https://developer.mozilla.org/en-US/docs/Web/CSS'
const mdnJSONAPI = 'https://developer.mozilla.org/en-US/search.json?topic=css&highlight=false'
const PropertiesURL = 'https://raw.githubusercontent.com/adobe/brackets/master/src/extensions/default/CSSCodeHints/CSSProperties.json'

const fetch = function () {
  const propertiesPromise = new Promise(resolve => request({ json: true, url: PropertiesURL }, function (error, response, properties) {
    if (error != null) {
      console.error(error.message)
      resolve(null)
    }

    if (response.statusCode !== 200) {
      console.error(`Request for CSSProperties.json failed: ${response.statusCode}`)
      resolve(null)
    }

    return resolve(properties)
  }))

  return propertiesPromise.then(function (properties) {
    if (properties == null) { return }

    const MAX = 10
    const queue = Object.keys(properties)
    const running = []
    const docs = {}

    return new Promise(function (resolve) {
      const checkEnd = function () {
        if ((queue.length === 0) && (running.length === 0)) { return resolve(docs) }
      }

      const removeRunning = function (propertyName) {
        const index = running.indexOf(propertyName)
        if (index > -1) { return running.splice(index, 1) }
      }

      const runNext = function () {
        checkEnd()
        if (queue.length !== 0) {
          const propertyName = queue.pop()
          running.push(propertyName)
          return run(propertyName)
        }
      }

      var run = function (propertyName) {
        const url = `${mdnJSONAPI}&q=${propertyName}`
        return request({ json: true, url }, function (error, response, searchResults) {
          if ((error == null) && (response.statusCode === 200)) {
            handleRequest(propertyName, searchResults)
          } else {
            console.error(`Req failed ${url}; ${response.statusCode}, ${error}`)
          }
          removeRunning(propertyName)
          checkEnd()
          return runNext()
        })
      }

      var handleRequest = function (propertyName, searchResults) {
        if (searchResults.documents != null) {
          for (const doc of Array.from(searchResults.documents)) {
            if (doc.url === `${mdnCSSURL}/${propertyName}`) {
              docs[propertyName] = filterExcerpt(propertyName, doc.excerpt)
              break
            }
          }
        }
      }

      for (let i = 0, end = MAX, asc = end >= 0; asc ? i <= end : i >= end; asc ? i++ : i--) { runNext() }
    })
  })
}

var filterExcerpt = function (propertyName, excerpt) {
  const beginningPattern = /^the (css )?[a-z-]+ (css )?property (is )?(\w+)/i
  excerpt = excerpt.replace(beginningPattern, function (match) {
    const matches = beginningPattern.exec(match)
    const firstWord = matches[4]
    return firstWord[0].toUpperCase() + firstWord.slice(1)
  })
  const periodIndex = excerpt.indexOf('.')
  if (periodIndex > -1) { excerpt = excerpt.slice(0, periodIndex + 1) }
  return excerpt
}

// Save a file if run from the command line
if (require.main === module) {
  fetch().then(function (docs) {
    if (docs != null) {
      return fs.writeFileSync(path.join(__dirname, 'property-docs.json'), `${JSON.stringify(docs, null, '  ')}\n`)
    } else {
      return console.error('No docs')
    }
  })
}

module.exports = fetch

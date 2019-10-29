/** @babel */
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Run this to update the static list of properties stored in the properties.json
// file at the root of this repository.

const path = require('path')
const fs = require('fs')
const request = require('request')

const requestOptions = {
  url: 'https://raw.githubusercontent.com/github/gemoji/master/db/emoji.json',
  json: true
}

request(requestOptions, function (error, response, items) {
  if (error != null) {
    console.error(error.message)
    return process.exit(1)
  }

  if (response.statusCode !== 200) {
    console.error(`Request for emoji.json failed: ${response.statusCode}`)
    return process.exit(1)
  }

  const properties = {}
  for (const item of Array.from(items)) {
    if (item.emoji != null) {
      for (const alias of Array.from(item.aliases)) {
        properties[alias] =
          { emoji: item.emoji }
      }
    }
  }
  // description: item.description
  // tags: item.tags if item.tags?.length > 1

  return fs.writeFileSync(path.join(__dirname, 'properties.json'), `${JSON.stringify(properties, null, 0)}\n`)
})

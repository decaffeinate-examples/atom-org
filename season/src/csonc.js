/** @babel */
/* eslint-disable
    no-return-assign,
    no-undef,
    no-unreachable,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require('fs')
const path = require('path')
const yargs = require('yargs')
const CSON = require('cson-parser')

module.exports = function (argv) {
  if (argv == null) { argv = [] }
  const options = yargs(argv)
  options.usage(`\
Usage: csonc [options] cson_file --output json_file
       csonc [options] < cson_file [> json_file]

Compiles CSON to JSON.

If no input file is specified then the CSON is read from standard in.

If no output file is specified then the JSON is written to standard out.\
`
  )
  options.alias('h', 'help').describe('help', 'Print this help message')
  options.alias('r', 'root').boolean('root').describe('root', 'Require that the input file contain an object at the root').default('root', false)
  options.alias('o', 'output').string('output').describe('output', 'File path to write the JSON output to')
  options.alias('v', 'version').describe('version', 'Print the version');

  ({ argv } = options)
  let [inputFile] = Array.from(argv._)
  if (inputFile) { inputFile = path.resolve(inputFile) }

  if (argv.version) {
    const { version } = require('../package.json')
    console.log(version)
    return
  }

  if (argv.help) {
    options.showHelp()
    return
  }

  const parseData = function (data) {
    let error, object
    try {
      object = CSON.parse(data)

      if (argv.r && (!_.isObject(object) || _.isArray(object))) {
        console.error('CSON data does not contain a root object')
        process.exit(1)
        return
      }
    } catch (error1) {
      error = error1
      console.error(`Parsing data failed: ${error.message}`)
      process.exit(1)
    }

    const json = JSON.stringify(object, undefined, 2) + '\n'
    if (argv.output) {
      const outputFile = path.resolve(argv.output)
      try {
        return fs.writeFileSync(outputFile, json)
      } catch (error2) {
        error = error2
        return console.error(`Writing ${outputFile} failed: ${error.code != null ? error.code : error}`)
      }
    } else {
      return process.stdout.write(json)
    }
  }

  if (inputFile) {
    try {
      return parseData(fs.readFileSync(inputFile, 'utf8'))
    } catch (error1) {
      const error = error1
      console.error(`Reading ${inputFile} failed: ${error.code != null ? error.code : error}`)
      return process.exit(1)
    }
  } else {
    process.stdin.resume()
    process.stdin.setEncoding('utf8')
    let data = ''
    process.stdin.on('data', chunk => data += chunk.toString())
    return process.stdin.on('end', () => parseData(data))
  }
}

/** @babel */
/* eslint-disable
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const { ArgumentParser } = require('argparse')
const PathSearcher = require('./path-searcher')
const PathScanner = require('./path-scanner')
const PathReplacer = require('./path-replacer')
const path = require('path')

const SingleProcess = require('./single-process-search')
const { search, replace } = SingleProcess
const singleProcessScanMain = SingleProcess.scanMain
const singleProcessSearchMain = SingleProcess.searchMain
const singleProcessReplaceMain = SingleProcess.replaceMain

/*
This CLI is mainly for benchmarking. While there may be useful data output to
the console, it will probably change. The options will probably change as
well.
*/
const main = function () {
  const argParser = new ArgumentParser({
    version: require('../package.json').version,
    addHelp: true,
    description: 'List paths, search, and replace in a directory'
  })

  argParser.addArgument(['-e', '--excludeVcsIgnores'], { action: 'storeTrue' })
  argParser.addArgument(['-o', '--verbose'], { action: 'storeTrue' })
  argParser.addArgument(['-d', '--dryReplace'], { action: 'storeTrue' })
  argParser.addArgument(['-s', '--search'])
  argParser.addArgument(['-r', '--replace'])
  argParser.addArgument(['pathToScan'])

  const options = argParser.parseArgs()

  if (options.search && options.replace) {
    return singleProcessReplaceMain(options)
  } else if (options.search) {
    return singleProcessSearchMain(options)
  } else {
    return singleProcessScanMain(options)
  }
}

module.exports = { main, search, replace, PathSearcher, PathScanner, PathReplacer }

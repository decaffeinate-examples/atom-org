/** @babel */
/* eslint-disable
    camelcase,
    no-multi-str,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require('fs')
const util = require('util')
const path = require('path')
const walkdir = require('walkdir')
const Async = require('async')
const _ = require('underscore')
const CoffeeScript = require('coffee-script')

const Parser = require('./parser')
const Metadata = require('./metadata')
const { exec } = require('child_process')

const SRC_DIRS = ['src', 'lib', 'app']
const BLACKLIST_FILES = ['Gruntfile.coffee']

const main = function () {
  const optimist = require('optimist')
    .usage('\
Usage: $0 [options] [source_files]\
')
    .options('o', {
      alias: 'output-dir',
      describe: 'The output directory',
      default: './doc'
    }
    )
    .options('d', {
      alias: 'debug',
      describe: 'Show stacktraces and converted CoffeeScript source',
      boolean: true,
      default: false
    }
    )
    .options('h', {
      alias: 'help',
      describe: 'Show the help'
    }
    )

  const {
    argv
  } = optimist

  if (argv.h) {
    console.log(optimist.help())
    return
  }

  const options = {
    inputs: argv._,
    output: argv.o
  }

  return writeMetadata(generateMetadata(options.inputs), options.output)
}

var generateMetadata = function (inputs) {
  const metadataSlugs = []

  for (const input of Array.from(inputs)) {
    var error, filename
    if (!(fs.existsSync || path.existsSync)(input)) { continue }
    const parser = new Parser()

    // collect probable package.json path
    const packageJsonPath = path.join(input, 'package.json')
    const stats = fs.lstatSync(input)
    const absoluteInput = path.resolve(process.cwd(), input)

    if (stats.isDirectory()) {
      for (filename of Array.from(walkdir.sync(input))) {
        if (isAcceptableFile(filename) && isInAcceptableDir(absoluteInput, filename)) {
          try {
            parser.parseFile(filename, absoluteInput)
          } catch (error1) {
            error = error1
            logError(filename, error)
          }
        }
      }
    } else {
      if (isAcceptableFile(input)) {
        try {
          parser.parseFile(input, path.dirname(input))
        } catch (error2) {
          error = error2
          logError(filename, error)
        }
      }
    }

    metadataSlugs.push(generateMetadataSlug(packageJsonPath, parser))
  }

  return metadataSlugs
}

var logError = function (filename, error) {
  if (error.location != null) {
    return console.warn(`Cannot parse file ${filename}@${error.location.first_line}: ${error.message}`)
  } else {
    return console.warn(`Cannot parse file ${filename}: ${error.message}`)
  }
}

var isAcceptableFile = function (filePath) {
  try {
    if (fs.statSync(filePath).isDirectory()) { return false }
  } catch (error) {}

  for (const file of Array.from(BLACKLIST_FILES)) {
    if (new RegExp(file + '$').test(filePath)) { return false }
  }

  return filePath.match(/\._?coffee$/)
}

var isInAcceptableDir = function (inputPath, filePath) {
  // is in the root of the input?
  let dir
  if (path.join(inputPath, path.basename(filePath)) === filePath) { return true }

  // is under src, lib, or app?
  const acceptableDirs = ((() => {
    const result = []
    for (dir of Array.from(SRC_DIRS)) {
      result.push(path.join(inputPath, dir))
    }
    return result
  })())
  for (dir of Array.from(acceptableDirs)) {
    if (filePath.indexOf(dir) === 0) { return true }
  }

  return false
}

var writeMetadata = (metadataSlugs, output) => fs.writeFileSync(path.join(output, 'metadata.json'), JSON.stringify(metadataSlugs, null, '    '))

// Public: Builds and writes to metadata.json
var generateMetadataSlug = function (packageJsonPath, parser) {
  let packageJson
  if (fs.existsSync(packageJsonPath)) {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
  }

  const metadata = new Metadata((packageJson != null ? packageJson.dependencies : undefined) != null ? (packageJson != null ? packageJson.dependencies : undefined) : {}, parser)
  const slug = {
    main: findMainFile(packageJsonPath, packageJson != null ? packageJson.main : undefined),
    repository: __guard__(packageJson != null ? packageJson.repository : undefined, x => x.url) != null ? __guard__(packageJson != null ? packageJson.repository : undefined, x => x.url) : (packageJson != null ? packageJson.repository : undefined),
    version: (packageJson != null ? packageJson.version : undefined),
    files: {}
  }

  for (const filename in parser.iteratedFiles) {
    const content = parser.iteratedFiles[filename]
    metadata.generate(CoffeeScript.nodes(content))
    populateSlug(slug, filename, metadata)
  }

  return slug
}

// Public: Parse and collect metadata slugs
var populateSlug = function (slug, filename, { defs: unindexedObjects, exports }) {
  let key, startLineNumber, value
  let prop
  const objects = {}
  for (key in unindexedObjects) {
    value = unindexedObjects[key]
    startLineNumber = value.range[0][0]
    const startColNumber = value.range[0][1]
    if (objects[startLineNumber] == null) { objects[startLineNumber] = {} }
    objects[startLineNumber][startColNumber] = value
    // Update the classProperties/prototypeProperties to be line numbers
    if (value.type === 'class') {
      value.classProperties = ((() => {
        const result = []
        for (prop of Array.from(_.clone(value.classProperties))) {
          result.push([prop.range[0][0], prop.range[0][1]])
        }
        return result
      })())
      value.prototypeProperties = ((() => {
        const result1 = []
        for (prop of Array.from(_.clone(value.prototypeProperties))) {
          result1.push([prop.range[0][0], prop.range[0][1]])
        }
        return result1
      })())
    }
  }

  if (exports._default != null) {
    if (exports._default.range != null) { exports = exports._default.range[0][0] }
  } else {
    for (key in exports) {
      value = exports[key]
      exports[key] = value.startLineNumber
    }
  }

  slug.files[filename] = { objects, exports }
  return slug
}

var findMainFile = function (packageJsonPath, main_file) {
  if (main_file == null) { return }

  if (main_file.match(/\.js$/)) {
    main_file = main_file.replace(/\.js$/, '.coffee')
  } else {
    main_file += '.coffee'
  }

  const filename = path.basename(main_file)
  const filepath = path.dirname(packageJsonPath)

  for (const dir of Array.from(SRC_DIRS)) {
    const composite_main = path.normalize(path.join(filepath, dir, filename))

    if (fs.existsSync(composite_main)) {
      let file = path.relative(packageJsonPath, composite_main)
      if (file.match(/^\.\./)) { file = file.substring(1, file.length) }
      return file
    }
  }
}

// TODO: lessen the suck enough to remove generateMetadataSlug and populateSlug. They really shouldnt be necessary.
module.exports = { Parser, Metadata, main, generateMetadata, generateMetadataSlug, populateSlug }

function __guard__ (value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined
}

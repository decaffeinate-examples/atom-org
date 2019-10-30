/** @babel */
/* eslint-disable
    handle-callback-err,
    no-cond-assign,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Rebuild
const path = require('path')

const _ = require('underscore-plus')
const yargs = require('yargs')

const config = require('./apm')
const Command = require('./command')
const fs = require('./fs')
const Install = require('./install')

module.exports =
(Rebuild = (function () {
  Rebuild = class Rebuild extends Command {
    static initClass () {
      this.commandNames = ['rebuild']
    }

    constructor () {
      super()
      this.atomDirectory = config.getAtomDirectory()
      this.atomNodeDirectory = path.join(this.atomDirectory, '.node-gyp')
      this.atomNpmPath = require.resolve('npm/bin/npm-cli')
    }

    parseOptions (argv) {
      const options = yargs(argv).wrap(Math.min(100, yargs.terminalWidth()))
      options.usage(`\

Usage: apm rebuild [<name> [<name> ...]]

Rebuild the given modules currently installed in the node_modules folder
in the current working directory.

All the modules will be rebuilt if no module names are specified.\
`
      )
      return options.alias('h', 'help').describe('help', 'Print this usage message')
    }

    forkNpmRebuild (options, callback) {
      let vsArgs
      process.stdout.write('Rebuilding modules ')

      const rebuildArgs = ['--globalconfig', config.getGlobalConfigPath(), '--userconfig', config.getUserConfigPath(), 'rebuild']
      rebuildArgs.push(...Array.from(this.getNpmBuildFlags() || []))
      rebuildArgs.push(...Array.from(options.argv._ || []))

      if (vsArgs = this.getVisualStudioFlags()) {
        rebuildArgs.push(vsArgs)
      }

      fs.makeTreeSync(this.atomDirectory)

      const env = _.extend({}, process.env, { HOME: this.atomNodeDirectory, RUSTUP_HOME: config.getRustupHomeDirPath() })
      this.addBuildEnvVars(env)

      return this.fork(this.atomNpmPath, rebuildArgs, { env }, callback)
    }

    run (options) {
      const { callback } = options
      options = this.parseOptions(options.commandArgs)

      return config.loadNpm((error, npm) => {
        this.npm = npm
        return this.loadInstalledAtomMetadata(() => {
          return this.forkNpmRebuild(options, (code, stderr) => {
            if (stderr == null) { stderr = '' }
            if (code === 0) {
              this.logSuccess()
              return callback()
            } else {
              this.logFailure()
              return callback(stderr)
            }
          })
        })
      })
    }
  }
  Rebuild.initClass()
  return Rebuild
})())

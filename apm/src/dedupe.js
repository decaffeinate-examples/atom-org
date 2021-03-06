/** @babel */
/* eslint-disable
    no-cond-assign,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Dedupe
const path = require('path')

const async = require('async')
const _ = require('underscore-plus')
const yargs = require('yargs')

const config = require('./apm')
const Command = require('./command')
const fs = require('./fs')

module.exports =
(Dedupe = (function () {
  Dedupe = class Dedupe extends Command {
    static initClass () {
      this.commandNames = ['dedupe']
    }

    constructor () {
      super()
      this.atomDirectory = config.getAtomDirectory()
      this.atomPackagesDirectory = path.join(this.atomDirectory, 'packages')
      this.atomNodeDirectory = path.join(this.atomDirectory, '.node-gyp')
      this.atomNpmPath = require.resolve('npm/bin/npm-cli')
    }

    parseOptions (argv) {
      const options = yargs(argv).wrap(Math.min(100, yargs.terminalWidth()))
      options.usage(`\

Usage: apm dedupe [<package_name>...]

Reduce duplication in the node_modules folder in the current directory.

This command is experimental.\
`
      )
      return options.alias('h', 'help').describe('help', 'Print this usage message')
    }

    dedupeModules (options, callback) {
      process.stdout.write('Deduping modules ')

      return this.forkDedupeCommand(options, (...args) => {
        return this.logCommandResults(callback, ...Array.from(args))
      })
    }

    forkDedupeCommand (options, callback) {
      let vsArgs
      const dedupeArgs = ['--globalconfig', config.getGlobalConfigPath(), '--userconfig', config.getUserConfigPath(), 'dedupe']
      dedupeArgs.push(...Array.from(this.getNpmBuildFlags() || []))
      if (options.argv.silent) { dedupeArgs.push('--silent') }
      if (options.argv.quiet) { dedupeArgs.push('--quiet') }

      if (vsArgs = this.getVisualStudioFlags()) {
        dedupeArgs.push(vsArgs)
      }

      for (const packageName of Array.from(options.argv._)) { dedupeArgs.push(packageName) }

      fs.makeTreeSync(this.atomDirectory)

      const env = _.extend({}, process.env, { HOME: this.atomNodeDirectory, RUSTUP_HOME: config.getRustupHomeDirPath() })
      this.addBuildEnvVars(env)

      const dedupeOptions = { env }
      if (options.cwd) { dedupeOptions.cwd = options.cwd }

      return this.fork(this.atomNpmPath, dedupeArgs, dedupeOptions, callback)
    }

    createAtomDirectories () {
      fs.makeTreeSync(this.atomDirectory)
      return fs.makeTreeSync(this.atomNodeDirectory)
    }

    run (options) {
      const { callback, cwd } = options
      options = this.parseOptions(options.commandArgs)
      options.cwd = cwd

      this.createAtomDirectories()

      const commands = []
      commands.push(callback => this.loadInstalledAtomMetadata(callback))
      commands.push(callback => this.dedupeModules(options, callback))
      return async.waterfall(commands, callback)
    }
  }
  Dedupe.initClass()
  return Dedupe
})())

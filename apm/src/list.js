/** @babel */
/* eslint-disable
    camelcase,
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
 * DS103: Rewrite code to no longer use __guard__
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let List
const path = require('path')

const _ = require('underscore-plus')
const CSON = require('season')
const yargs = require('yargs')

const Command = require('./command')
const fs = require('./fs')
const config = require('./apm')
const tree = require('./tree')
const { getRepository } = require('./packages')

module.exports =
(List = (function () {
  List = class List extends Command {
    static initClass () {
      this.commandNames = ['list', 'ls']
    }

    constructor () {
      let configPath
      super()
      this.userPackagesDirectory = path.join(config.getAtomDirectory(), 'packages')
      this.devPackagesDirectory = path.join(config.getAtomDirectory(), 'dev', 'packages')
      if (configPath = CSON.resolve(path.join(config.getAtomDirectory(), 'config'))) {
        try {
          this.disabledPackages = __guard__(__guard__(__guard__(CSON.readFileSync(configPath), x2 => x2['*']), x1 => x1.core), x => x.disabledPackages)
        } catch (error) {}
      }
      if (this.disabledPackages == null) { this.disabledPackages = [] }
    }

    parseOptions (argv) {
      const options = yargs(argv).wrap(Math.min(100, yargs.terminalWidth()))
      options.usage(`\

Usage: apm list
       apm list --themes
       apm list --packages
       apm list --installed
       apm list --installed --enabled
       apm list --installed --bare > my-packages.txt
       apm list --json

List all the installed packages and also the packages bundled with Atom.\
`
      )
      options.alias('b', 'bare').boolean('bare').describe('bare', 'Print packages one per line with no formatting')
      options.alias('e', 'enabled').boolean('enabled').describe('enabled', 'Print only enabled packages')
      options.alias('d', 'dev').boolean('dev').default('dev', true).describe('dev', 'Include dev packages')
      options.boolean('disabled').describe('disabled', 'Print only disabled packages')
      options.alias('h', 'help').describe('help', 'Print this usage message')
      options.alias('i', 'installed').boolean('installed').describe('installed', 'Only list installed packages/themes')
      options.alias('j', 'json').boolean('json').describe('json', 'Output all packages as a JSON object')
      options.alias('l', 'links').boolean('links').default('links', true).describe('links', 'Include linked packages')
      options.alias('t', 'themes').boolean('themes').describe('themes', 'Only list themes')
      return options.alias('p', 'packages').boolean('packages').describe('packages', 'Only list packages')
    }

    isPackageDisabled (name) {
      return this.disabledPackages.indexOf(name) !== -1
    }

    logPackages (packages, options) {
      let packageLine
      if (options.argv.bare) {
        for (const pack of Array.from(packages)) {
          packageLine = pack.name
          if (pack.version != null) { packageLine += `@${pack.version}` }
          console.log(packageLine)
        }
      } else {
        tree(packages, pack => {
          packageLine = pack.name
          if (pack.version != null) { packageLine += `@${pack.version}` }
          if ((pack.apmInstallSource != null ? pack.apmInstallSource.type : undefined) === 'git') {
            const repo = getRepository(pack)
            let shaLine = `#${pack.apmInstallSource.sha.substr(0, 8)}`
            if (repo != null) { shaLine = repo + shaLine }
            packageLine += ` (${shaLine})`.grey
          }
          if (this.isPackageDisabled(pack.name) && !options.argv.disabled) { packageLine += ' (disabled)' }
          return packageLine
        })
      }
      return console.log()
    }

    checkExclusiveOptions (options, positive_option, negative_option, value) {
      if (options.argv[positive_option]) {
        return value
      } else if (options.argv[negative_option]) {
        return !value
      } else {
        return true
      }
    }

    isPackageVisible (options, manifest) {
      return this.checkExclusiveOptions(options, 'themes', 'packages', manifest.theme) &&
      this.checkExclusiveOptions(options, 'disabled', 'enabled', this.isPackageDisabled(manifest.name))
    }

    listPackages (directoryPath, options) {
      const packages = []
      for (const child of Array.from(fs.list(directoryPath))) {
        var manifestPath
        if (!fs.isDirectorySync(path.join(directoryPath, child))) { continue }
        if (child.match(/^\./)) { continue }
        if (!options.argv.links) {
          if (fs.isSymbolicLinkSync(path.join(directoryPath, child))) { continue }
        }

        let manifest = null
        if (manifestPath = CSON.resolve(path.join(directoryPath, child, 'package'))) {
          try {
            manifest = CSON.readFileSync(manifestPath)
          } catch (error) {}
        }
        if (manifest == null) { manifest = {} }
        manifest.name = child

        if (!this.isPackageVisible(options, manifest)) { continue }
        packages.push(manifest)
      }

      return packages
    }

    listUserPackages (options, callback) {
      const userPackages = this.listPackages(this.userPackagesDirectory, options)
        .filter(pack => !pack.apmInstallSource)
      if (!options.argv.bare && !options.argv.json) {
        console.log(`Community Packages (${userPackages.length})`.cyan, `${this.userPackagesDirectory}`)
      }
      return (typeof callback === 'function' ? callback(null, userPackages) : undefined)
    }

    listDevPackages (options, callback) {
      if (!options.argv.dev) { return (typeof callback === 'function' ? callback(null, []) : undefined) }

      const devPackages = this.listPackages(this.devPackagesDirectory, options)
      if (devPackages.length > 0) {
        if (!options.argv.bare && !options.argv.json) {
          console.log(`Dev Packages (${devPackages.length})`.cyan, `${this.devPackagesDirectory}`)
        }
      }
      return (typeof callback === 'function' ? callback(null, devPackages) : undefined)
    }

    listGitPackages (options, callback) {
      const gitPackages = this.listPackages(this.userPackagesDirectory, options)
        .filter(pack => (pack.apmInstallSource != null ? pack.apmInstallSource.type : undefined) === 'git')
      if (gitPackages.length > 0) {
        if (!options.argv.bare && !options.argv.json) {
          console.log(`Git Packages (${gitPackages.length})`.cyan, `${this.userPackagesDirectory}`)
        }
      }
      return (typeof callback === 'function' ? callback(null, gitPackages) : undefined)
    }

    listBundledPackages (options, callback) {
      return config.getResourcePath(resourcePath => {
        let _atomPackages
        let metadata
        try {
          const metadataPath = path.join(resourcePath, 'package.json');
          ({ _atomPackages } = JSON.parse(fs.readFileSync(metadataPath)))
        } catch (error) {}
        if (_atomPackages == null) { _atomPackages = {} }
        let packages = ((() => {
          const result = []
          for (const packageName in _atomPackages) {
            ({ metadata } = _atomPackages[packageName])
            result.push(metadata)
          }
          return result
        })())

        packages = packages.filter(metadata => {
          return this.isPackageVisible(options, metadata)
        })

        if (!options.argv.bare && !options.argv.json) {
          if (options.argv.themes) {
            console.log(`${'Built-in Atom Themes'.cyan} (${packages.length})`)
          } else {
            console.log(`${'Built-in Atom Packages'.cyan} (${packages.length})`)
          }
        }

        return (typeof callback === 'function' ? callback(null, packages) : undefined)
      })
    }

    listInstalledPackages (options) {
      return this.listDevPackages(options, (error, packages) => {
        if (packages.length > 0) { this.logPackages(packages, options) }

        return this.listUserPackages(options, (error, packages) => {
          this.logPackages(packages, options)

          return this.listGitPackages(options, (error, packages) => {
            if (packages.length > 0) { return this.logPackages(packages, options) }
          })
        })
      })
    }

    listPackagesAsJson (options, callback) {
      if (callback == null) { callback = function () {} }
      const output = {
        core: [],
        dev: [],
        git: [],
        user: []
      }

      return this.listBundledPackages(options, (error, packages) => {
        if (error) { return callback(error) }
        output.core = packages
        return this.listDevPackages(options, (error, packages) => {
          if (error) { return callback(error) }
          output.dev = packages
          return this.listUserPackages(options, (error, packages) => {
            if (error) { return callback(error) }
            output.user = packages
            return this.listGitPackages(options, function (error, packages) {
              if (error) { return callback(error) }
              output.git = packages
              console.log(JSON.stringify(output))
              return callback()
            })
          })
        })
      })
    }

    run (options) {
      const { callback } = options
      options = this.parseOptions(options.commandArgs)

      if (options.argv.json) {
        return this.listPackagesAsJson(options, callback)
      } else if (options.argv.installed) {
        this.listInstalledPackages(options)
        return callback()
      } else {
        return this.listBundledPackages(options, (error, packages) => {
          this.logPackages(packages, options)
          this.listInstalledPackages(options)
          return callback()
        })
      }
    }
  }
  List.initClass()
  return List
})())

function __guard__ (value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined
}

/** @babel */
/* eslint-disable
    standard/no-callback-literal,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Develop
const fs = require('fs')
const path = require('path')

const _ = require('underscore-plus')
const async = require('async')
const yargs = require('yargs')

const config = require('./apm')
const Command = require('./command')
const Install = require('./install')
const git = require('./git')
const Link = require('./link')
const request = require('./request')

module.exports =
(Develop = (function () {
  Develop = class Develop extends Command {
    static initClass () {
      this.commandNames = ['dev', 'develop']
    }

    constructor () {
      super()
      this.atomDirectory = config.getAtomDirectory()
      this.atomDevPackagesDirectory = path.join(this.atomDirectory, 'dev', 'packages')
    }

    parseOptions (argv) {
      const options = yargs(argv).wrap(Math.min(100, yargs.terminalWidth()))

      options.usage(`\
Usage: apm develop <package_name> [<directory>]

Clone the given package's Git repository to the directory specified,
install its dependencies, and link it for development to
~/.atom/dev/packages/<package_name>.

If no directory is specified then the repository is cloned to
~/github/<package_name>. The default folder to clone packages into can
be overridden using the ATOM_REPOS_HOME environment variable.

Once this command completes you can open a dev window from atom using
cmd-shift-o to run the package out of the newly cloned repository.\
`
      )
      return options.alias('h', 'help').describe('help', 'Print this usage message')
    }

    getRepositoryUrl (packageName, callback) {
      const requestSettings = {
        url: `${config.getAtomPackagesUrl()}/${packageName}`,
        json: true
      }
      return request.get(requestSettings, function (error, response, body) {
        if (body == null) { body = {} }
        if (error != null) {
          return callback(`Request for package information failed: ${error.message}`)
        } else if (response.statusCode === 200) {
          let repositoryUrl
          if ((repositoryUrl = body.repository.url)) {
            return callback(null, repositoryUrl)
          } else {
            return callback(`No repository URL found for package: ${packageName}`)
          }
        } else {
          const message = request.getErrorMessage(response, body)
          return callback(`Request for package information failed: ${message}`)
        }
      })
    }

    cloneRepository (repoUrl, packageDirectory, options, callback) {
      if (callback == null) { callback = function () {} }
      return config.getSetting('git', command => {
        if (command == null) { command = 'git' }
        const args = ['clone', '--recursive', repoUrl, packageDirectory]
        if (!options.argv.json) { process.stdout.write(`Cloning ${repoUrl} `) }
        git.addGitToEnv(process.env)
        return this.spawn(command, args, (...args) => {
          if (options.argv.json) {
            return this.logCommandResultsIfFail(callback, ...Array.from(args))
          } else {
            return this.logCommandResults(callback, ...Array.from(args))
          }
        })
      })
    }

    installDependencies (packageDirectory, options, callback) {
      if (callback == null) { callback = function () {} }
      process.chdir(packageDirectory)
      const installOptions = _.clone(options)
      installOptions.callback = callback

      return new Install().run(installOptions)
    }

    linkPackage (packageDirectory, options, callback) {
      const linkOptions = _.clone(options)
      if (callback) {
        linkOptions.callback = callback
      }
      linkOptions.commandArgs = [packageDirectory, '--dev']
      return new Link().run(linkOptions)
    }

    run (options) {
      let left
      const packageName = options.commandArgs.shift()

      if (!((packageName != null ? packageName.length : undefined) > 0)) {
        return options.callback('Missing required package name')
      }

      let packageDirectory = (left = options.commandArgs.shift()) != null ? left : path.join(config.getReposDirectory(), packageName)
      packageDirectory = path.resolve(packageDirectory)

      if (fs.existsSync(packageDirectory)) {
        return this.linkPackage(packageDirectory, options)
      } else {
        return this.getRepositoryUrl(packageName, (error, repoUrl) => {
          if (error != null) {
            return options.callback(error)
          } else {
            const tasks = []
            tasks.push(callback => this.cloneRepository(repoUrl, packageDirectory, options, callback))

            tasks.push(callback => this.installDependencies(packageDirectory, options, callback))

            tasks.push(callback => this.linkPackage(packageDirectory, options, callback))

            return async.waterfall(tasks, options.callback)
          }
        })
      }
    }
  }
  Develop.initClass()
  return Develop
})())

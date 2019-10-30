/** @babel */
/* eslint-disable
    no-undef,
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
const spellchecker = require('spellchecker')
const pathspec = require('atom-pathspec')

class SystemChecker {
  static initClass () {
    this.prototype.spellchecker = null
    this.prototype.locale = null
    this.prototype.enabled = true
    this.prototype.reason = null
    this.prototype.paths = null
  }

  constructor (locale, paths) {
    this.locale = locale
    this.paths = paths
  }

  deactivate () {
  }

  getId () { return 'spell-check:' + this.locale.toLowerCase().replace('_', '-') }
  getName () { return 'System Dictionary (' + this.locale + ')' }
  getPriority () { return 100 } // System level data, has no user input.
  isEnabled () { return this.enabled }
  getStatus () {
    if (this.enabled) {
      return 'Working correctly.'
    } else {
      return this.reason
    }
  }

  providesSpelling (args) { return true }
  providesSuggestions (args) { return true }
  providesAdding (args) { return false } // Users shouldn't be adding to the system dictionary.

  check (args, text) {
    this.deferredInit()
    return this.spellchecker.checkSpellingAsync(text).then(incorrect => ({
      invertIncorrectAsCorrect: true,
      incorrect
    }))
  }

  suggest (args, word) {
    this.deferredInit()
    return this.spellchecker.getCorrectionsForMisspelling(word)
  }

  deferredInit () {
    // If we already have a spellchecker, then we don't have to do anything.
    let path
    if (this.spellchecker) {
      return
    }

    // Initialize the spell checker which can take some time.
    this.spellchecker = new spellchecker.Spellchecker()

    // Build up a list of paths we are checking so we can report them fully
    // to the user if we fail.
    const searchPaths = []

    // Windows uses its own API and the paths are unimportant, only attempting
    // to load it works.
    if (/win32/.test(process.platform)) {
      searchPaths.push('C:\\')
    }

    // Check the paths supplied by the user.
    for (path of Array.from(this.paths)) {
      searchPaths.push(pathspec.getPath(path))
    }

    // For Linux, we have to search the directory paths to find the dictionary.
    if (/linux/.test(process.platform)) {
      searchPaths.push('/usr/share/hunspell')
      searchPaths.push('/usr/share/myspell')
      searchPaths.push('/usr/share/myspell/dicts')
    }

    // OS X uses the following paths.
    if (/darwin/.test(process.platform)) {
      searchPaths.push('/')
      searchPaths.push('/System/Library/Spelling')
    }

    // Try the packaged library inside the node_modules. `getDictionaryPath` is
    // not available, so we have to fake it. This will only work for en-US.
    searchPaths.push(spellchecker.getDictionaryPath())

    // Attempt to load all the paths for the dictionary until we find one.
    for (path of Array.from(searchPaths)) {
      if (this.spellchecker.setDictionary(this.locale, path)) {
        return
      }
    }

    // If we fell through all the if blocks, then we couldn't load the dictionary.
    this.enabled = false
    this.reason = 'Cannot load the system dictionary for `' + this.locale + '`.'
    const message = 'The package `spell-check` cannot load the ' +
      'system dictionary for `' +
      this.locale + '`.' +
      ' See the settings for ways of changing the languages used, ' +
      ' resolving missing dictionaries, or hiding this warning.'

    let searches = '\n\nThe plugin checked the following paths for dictionary files:\n* ' +
      searchPaths.join('\n* ')

    if (/(win32|darwin)/.test(process.platform && !process.env.SPELLCHECKER_PREFER_HUNSPELL)) {
      searches = '\n\nThe plugin tried to use the system dictionaries to find the locale.'
    }

    const noticesMode = atom.config.get('spell-check.noticesMode')

    if ((noticesMode === 'console') || (noticesMode === 'both')) {
      console.log(this.getId(), (message + searches))
    }
    if ((noticesMode === 'popup') || (noticesMode === 'both')) {
      return atom.notifications.addWarning(
        message,
        {
          buttons: [
            {
              className: 'btn',
              onDidClick () { return atom.workspace.open('atom://config/packages/spell-check') },
              text: 'Settings'
            }
          ]
        }
      )
    }
  }
}
SystemChecker.initClass()

module.exports = SystemChecker

/** @babel */
/* eslint-disable
    no-unused-vars,
    no-useless-escape,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS104: Avoid inline assignments
 * DS202: Simplify dynamic range loops
 * DS204: Change includes calls to have a more natural evaluation order
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let PathFilter
const { Minimatch } = require('minimatch')
const GitUtils = require('git-utils')
const path = require('path')
const fs = require('fs')

// Public: {PathFilter} makes testing for path inclusion easy.
module.exports =
(PathFilter = (function () {
  PathFilter = class PathFilter {
    static initClass () {
      this.MINIMATCH_OPTIONS = { matchBase: true, dot: true }
    }

    static escapeRegExp (str) {
      return str.replace(/([\/'*+?|()\[\]{}.\^$])/g, '\\$1')
    }

    // Public: Construct a {PathFilter}
    //
    // * `rootPath` {String} top level directory to scan. eg. `/Users/ben/somedir`
    // * `options` {Object} options hash
    //   * `excludeVcsIgnores` {Boolean}; default false; true to exclude paths
    //      defined in a .gitignore. Uses git-utils to check ignred files.
    //   * `inclusions` {Array} of patterns to include. Uses minimatch with a couple
    //      additions: `['dirname']` and `['dirname/']` will match all paths in
    //      directory dirname.
    //   * `exclusions` {Array} of patterns to exclude. Same matcher as inclusions.
    //   * `globalExclusions` {Array} of patterns to exclude. These patterns can be
    //      overridden by `inclusions` if the inclusion is a duplicate or a
    //      subdirectory of the exclusion. Same matcher as inclusions.
    //   * `includeHidden` {Boolean} default false; true includes hidden files
    constructor (rootPath, options) {
      this.rootPath = rootPath
      if (options == null) { options = {} }
      const { includeHidden, excludeVcsIgnores } = options
      const { inclusions, exclusions, globalExclusions } = this.sanitizePaths(options)

      this.inclusions = this.createMatchers(inclusions, { deepMatch: true })
      this.exclusions = this.createMatchers(exclusions, { deepMatch: false })
      this.globalExclusions = this.createMatchers(globalExclusions, { deepMatch: false, disallowDuplicatesFrom: this.inclusions })

      if (excludeVcsIgnores) { this.repo = GitUtils.open(this.rootPath) }

      if (includeHidden !== true) { this.excludeHidden() }
    }

    /*
    Section: Testing For Acceptance
    */

    // Public: Test if the `filepath` is accepted as a file based on the
    // constructing options.
    //
    // * `filepath` {String} path to a file. File should be a file and should exist
    //
    // Returns {Boolean} true if the file is accepted
    isFileAccepted (filepath) {
      return this.isDirectoryAccepted(filepath) &&
        !this.isPathExcluded('file', filepath) &&
        this.isPathIncluded('file', filepath) &&
        !this.isPathGloballyExcluded('file', filepath)
    }

    // Public: Test if the `filepath` is accepted as a directory based on the
    // constructing options.
    //
    // * `filepath` {String} path to a directory. File should be a file or directory
    //   and should exist
    //
    // Returns {Boolean} true if the directory is accepted
    isDirectoryAccepted (filepath) {
      if (this.isPathExcluded('directory', filepath) === true) { return false }

      const matchingInclusions = this.getMatchingItems(this.inclusions.directory, filepath)

      // Matching global exclusions will be overriden if there is a matching
      // inclusion for a subdirectory of the exclusion.
      // For example: if node_modules is globally excluded but mode_modules/foo is
      // explicitly included, then the global exclusion is overridden for
      // node_modules/foo
      const matchingGlobalExclusions = this.overrideGlobalExclusions(
        this.getMatchingItems(this.globalExclusions.directory, filepath), matchingInclusions)

      // Don't accept if there's a matching global exclusion
      if (matchingGlobalExclusions.length) { return false }

      // A matching explicit local inclusion will override any Git exclusions
      if (matchingInclusions.length) { return true }

      // Don't accept if there Were inclusions specified that didn't match
      if (this.inclusions.directory != null ? this.inclusions.directory.length : undefined) { return false }

      // Finally, check for Git exclusions
      return !this.isPathExcludedByGit(filepath)
    }

    /*
    Section: Private Methods
    */

    isPathIncluded (fileOrDirectory, filepath) {
      let stopAfterFirst
      if (!(this.inclusions[fileOrDirectory] != null ? this.inclusions[fileOrDirectory].length : undefined)) { return true }
      return __guard__(this.getMatchingItems(this.inclusions[fileOrDirectory], filepath,
        (stopAfterFirst = true)), x => x.length) > 0
    }

    isPathExcluded (fileOrDirectory, filepath) {
      let stopAfterFirst
      return __guard__(this.getMatchingItems(this.exclusions[fileOrDirectory], filepath,
        (stopAfterFirst = true)), x => x.length) > 0
    }

    isPathGloballyExcluded (fileOrDirectory, filepath) {
      let stopAfterFirst
      return __guard__(this.getMatchingItems(this.globalExclusions[fileOrDirectory], filepath,
        (stopAfterFirst = true)), x => x.length) > 0
    }

    // Given an array of `matchers`, return an array containing only those that
    // match `filepath`.
    getMatchingItems (matchers, filepath, stopAfterFirst) {
      if (stopAfterFirst == null) { stopAfterFirst = false }
      let index = matchers.length
      const result = []
      while (index--) {
        if (matchers[index].match(filepath)) {
          result.push(matchers[index])
          if (stopAfterFirst) { return result }
        }
      }
      return result
    }

    isPathExcludedByGit (filepath) {
      return (this.repo != null ? this.repo.isIgnored(this.repo.relativize(path.join(this.rootPath, filepath))) : undefined)
    }

    // Given an array of `globalExclusions`, filter out any which have an
    // `inclusion` defined for a subdirectory
    overrideGlobalExclusions (globalExclusions, inclusions) {
      const result = []
      let exclusionIndex = globalExclusions.length
      while (exclusionIndex--) {
        let inclusionIndex = inclusions.length
        let requiresOverride = false

        // Check if an inclusion is specified for a subdirectory of this globalExclusion
        while (inclusionIndex--) {
          if (this.isSubpathMatcher(globalExclusions[exclusionIndex], inclusions[inclusionIndex])) {
            requiresOverride = true
          }
        }

        if (!requiresOverride) { result.push(globalExclusions[exclusionIndex]) }
      }
      return result
    }

    // Returns true if the `child` matcher is a subdirectory of the `parent` matcher
    isSubpathMatcher (parent, child) {
      // Strip off trailing wildcards from the parent pattern
      let parentPattern = parent.pattern
      const directoryPattern = new RegExp(`\
${'\\' + path.sep}\\*$|\
${'\\' + path.sep}\\*\\*$\
`)
      const matchIndex = parentPattern.search(directoryPattern)
      if (matchIndex > -1) { parentPattern = parentPattern.slice(0, matchIndex) }

      return child.pattern.substr(0, parentPattern.length) === parentPattern
    }

    sanitizePaths (options) {
      if (!(options.inclusions != null ? options.inclusions.length : undefined)) { return options }
      const inclusions = []
      for (const includedPath of Array.from(options.inclusions)) {
        if (includedPath && (includedPath[0] === '!')) {
          if (options.exclusions == null) { options.exclusions = [] }
          options.exclusions.push(includedPath.slice(1))
        } else if (includedPath) {
          inclusions.push(includedPath)
        }
      }
      options.inclusions = inclusions
      return options
    }

    excludeHidden () {
      const matcher = new Minimatch('.*', PathFilter.MINIMATCH_OPTIONS)
      this.exclusions.file.push(matcher)
      return this.exclusions.directory.push(matcher)
    }

    createMatchers (patterns, param) {
      if (patterns == null) { patterns = [] }
      if (param == null) { param = {} }
      const { deepMatch, disallowDuplicatesFrom } = param
      const addFileMatcher = (matchers, pattern) => {
        if ((disallowDuplicatesFrom != null) && this.containsPattern(disallowDuplicatesFrom, 'file', pattern)) { return }
        return matchers.file.push(new Minimatch(pattern, PathFilter.MINIMATCH_OPTIONS))
      }

      var addDirectoryMatcher = (matchers, pattern, deepMatch) => {
        // It is important that we keep two permutations of directory patterns:
        //
        // * 'directory/anotherdir'
        // * 'directory/anotherdir/**'
        //
        // Minimatch will return false if we were to match 'directory/anotherdir'
        // against pattern 'directory/anotherdir/*'. And it will return false
        // matching 'directory/anotherdir/file.txt' against pattern
        // 'directory/anotherdir'.

        if (pattern[pattern.length - 1] === path.sep) {
          pattern += '**'
        }

        // When the user specifies to include a nested directory, we need to
        // specify matchers up to the nested directory
        //
        // * User specifies 'some/directory/anotherdir/**'
        // * We need to break it up into multiple matchers
        //   * 'some'
        //   * 'some/directory'
        //
        // Otherwise, we'll hit the 'some' directory, and if there is no matcher,
        // it'll fail and have no chance at hitting the
        // 'some/directory/anotherdir/**' matcher the user originally specified.
        if (deepMatch) {
          let needle
          const paths = pattern.split(path.sep)
          let lastIndex = paths.length - 2
          if ((needle = paths[paths.length - 1], ['*', '**'].includes(needle))) { lastIndex-- }

          if (lastIndex >= 0) {
            let deepPath = ''
            for (let i = 0, end = lastIndex, asc = end >= 0; asc ? i <= end : i >= end; asc ? i++ : i--) {
              deepPath = path.join(deepPath, paths[i])
              addDirectoryMatcher(matchers, deepPath)
            }
          }
        }

        const directoryPattern = new RegExp(`\
${'\\' + path.sep}\\*$|\
${'\\' + path.sep}\\*\\*$\
`)
        const matchIndex = pattern.search(directoryPattern)
        if (matchIndex > -1) { addDirectoryMatcher(matchers, pattern.slice(0, matchIndex)) }

        if ((disallowDuplicatesFrom != null) && this.containsPattern(disallowDuplicatesFrom, 'directory', pattern)) { return }
        return matchers.directory.push(new Minimatch(pattern, PathFilter.MINIMATCH_OPTIONS))
      }

      let pattern = null
      const matchers = {
        file: [],
        directory: []
      }

      let r = patterns.length
      while (r--) {
        pattern = patterns[r].trim()
        if ((pattern.length === 0) || (pattern[0] === '#')) { continue }

        const endsWithSeparatorOrStar = new RegExp(`\
${'\\' + path.sep}$|\
${'\\' + path.sep}\\**$\
`)
        if (endsWithSeparatorOrStar.test(pattern)) {
          // Is a dir if it ends in a '/' or '/*'
          addDirectoryMatcher(matchers, pattern, deepMatch)
        } else if (pattern.indexOf('*') < 0) {
          var stat
          try {
            // Try our best to check if it's a directory
            stat = fs.statSync(path.join(this.rootPath, pattern))
          } catch (e) {
            stat = null
          }

          if ((stat != null ? stat.isFile() : undefined)) {
            addFileMatcher(matchers, pattern)
          } else {
            addDirectoryMatcher(matchers, pattern + path.sep + '**', deepMatch)
          }
        } else {
          addFileMatcher(matchers, pattern)
        }
      }

      return matchers
    }

    containsPattern (matchers, fileOrDirectory, pattern) {
      for (const matcher of Array.from(matchers[fileOrDirectory])) {
        if (matcher.pattern === pattern) { return true }
      }
      return false
    }
  }
  PathFilter.initClass()
  return PathFilter
})())

function __guard__ (value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined
}

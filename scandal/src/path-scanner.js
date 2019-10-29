/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let PathScanner;
const fs = require("fs");
const path = require("path");
const {EventEmitter} = require("events");
const PathFilter = require("./path-filter");

const DIR_SEP = path.sep;

// Public: Scans a directory and emits events when paths matching input options
// have been found.
//
// Note: `PathScanner` keeps no state. You must consume paths via the {::path-found} event.
//
// ## Examples
//
// ```coffee
// {PathScanner} = require 'scandal'
// scanner = new PathScanner('/Users/me/myDopeProject', includeHidden: false)
//
// scanner.on 'path-found', (path) ->
//   console.log(path)
//
// scanner.on 'finished-scanning', ->
//   console.log('All done!')
//
// scanner.scan()
// ```
//
// ## Events
//
// * `path-found` Emit when a path has been found
//   * `pathName` {String} name of the path
// * `finished-scanning` Emit when the scanner is finished
//
module.exports =
(PathScanner = class PathScanner extends EventEmitter {

  // Public: Create a {PathScanner} object.
  //
  // * `rootPath` {String} top level directory to scan. eg. `/Users/ben/somedir`
  // * `options` {Object} options hash
  //   * `excludeVcsIgnores` {Boolean}; default false; true to exclude paths
  //      defined in a .gitignore. Uses git-utils to check ignred files.
  //   * `inclusions` {Array} of patterns to include. Uses minimatch with a couple
  //      additions: `['dirname']` and `['dirname/']` will match all paths in
  //      directory dirname.
  //   * `exclusions` {Array} of patterns to exclude. Same matcher as inclusions.
  //   * `includeHidden` {Boolean} default false; true includes hidden files
  constructor(rootPath, options) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }
      let thisFn = (() => { return this; }).toString();
      let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
      eval(`${thisName} = this;`);
    }
    this.rootPath = rootPath;
    if (options == null) { options = {}; }
    this.options = options;
    this.asyncCallsInProgress = 0;
    this.realPathCache = {};
    this.rootPath = path.resolve(this.rootPath);
    this.rootPathLength = this.rootPath.length;
    this.pathFilter = new PathFilter(this.rootPath, this.options);
  }

  /*
  Section: Scanning
  */

  // Public: Begin the scan
  scan() {
    return this.readDir(this.rootPath);
  }

  readDir(filePath) {
    this.asyncCallStarting();
    return fs.readdir(filePath, (err, files) => {
      if (!files) { return this.asyncCallDone(); }

      let fileCount = files.length;
      const prefix = filePath + DIR_SEP;
      while (fileCount--) {
        const file = files.shift();
        const filename = prefix + file;
        this.processFile(filename);
      }

      return this.asyncCallDone();
    });
  }

  relativize(filePath) {
    const len = filePath.length;
    let i = this.rootPathLength;
    while (i < len) {
      if (filePath[i] !== DIR_SEP) { break; }
      i++;
    }

    return filePath.slice(i);
  }

  processFile(filePath) {
    const relPath = this.relativize(filePath);
    const stat = this.stat(filePath);
    if (!stat) { return; }

    if (stat.isFile() && this.pathFilter.isFileAccepted(relPath)) {
      return this.emit('path-found', filePath);
    } else if (stat.isDirectory() && this.pathFilter.isDirectoryAccepted(relPath)) {
      return this.readDir(filePath);
    }
  }

  stat(filePath) {
    // lstat is SLOW, but what other way to determine if something is a directory or file ?
    // also, sync is about 200ms faster than async...
    let stat = fs.lstatSync(filePath);

    if (this.options.follow && stat.isSymbolicLink()) {
      if (this.isInternalSymlink(filePath)) {
        return null;
      }
      try {
        stat = fs.statSync(filePath);
      } catch (e) {
        return null;
      }
    }

    return stat;
  }

  isInternalSymlink(filePath) {
    let realPath = null;
    try {
      realPath = fs.realpathSync(filePath, this.realPathCache);
    } catch (error) {}
       // ignore
    return (realPath != null ? realPath.search(this.rootPath) : undefined) === 0;
  }

  asyncCallStarting() {
    return this.asyncCallsInProgress++;
  }

  asyncCallDone() {
    if (--this.asyncCallsInProgress === 0) {
      return this.emit('finished-scanning', this);
    }
  }
});

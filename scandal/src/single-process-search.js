/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const PathSearcher = require('./path-searcher');
const PathScanner = require('./path-scanner');
const PathReplacer = require('./path-replacer');
const ChunkedScanner = require('./chunked-scanner');

/*
Single Process
*/

const globalizeRegex = function(regex) {
  if (!regex.global) {
    let flags = "g";
    if (regex.ignoreCase) { flags += "i"; }
    if (regex.multiline) { flags += "m"; }
    regex = new RegExp(regex.source, flags);
  }
  return regex;
};


//# Searching

const search = function(regex, scanner, searcher, doneCallback) {
  regex = globalizeRegex(regex);
  const execPathFn = (filePath, callback) => searcher.searchPath(regex, filePath, callback);

  return new ChunkedScanner(scanner, execPathFn).execute(doneCallback);
};

const searchMain = function(options) {
  const searcher = new PathSearcher();
  const scanner = new PathScanner(options.pathToScan, options);
  console.time('Single Process Search');

  let count = 0;
  let resultCount = 0;
  let pathCount = 0;

  scanner.on('path-found', path => pathCount++);

  searcher.on('results-found', function(results) {
    count++;
    if (options.verbose) { console.log(results.filePath); }

    return (() => {
      const result = [];
      for (let match of Array.from(results.matches)) {
        resultCount++;
        if (options.verbose) {
          result.push(console.log('  ', match.range[0][0] + ":", match.matchText, 'at', match.range));
        } else {
          result.push(undefined);
        }
      }
      return result;
    })();
  });

  return search(new RegExp(options.search, 'gi'), scanner, searcher, function() {
    console.timeEnd('Single Process Search');
    return console.log(`${resultCount} matches in ${count} files. Searched ${pathCount} files`);
  });
};


//# Replacing

const replace = function(regex, replacement, scanner, replacer, doneCallback) {
  regex = globalizeRegex(regex);
  const execPathFn = (filePath, callback) => replacer.replacePath(regex, replacement, filePath, callback);

  return new ChunkedScanner(scanner, execPathFn).execute(doneCallback);
};

const replaceMain = function(options) {
  const scanner = new PathScanner(options.pathToScan, options);
  const replacer = new PathReplacer({dryReplace: options.dryReplace});
  const regex = new RegExp(options.search, 'gi');

  console.time('Single Process Search + Replace');

  const paths = [];
  scanner.on('path-found', p => paths.push(p));

  let totalReplacements = 0;
  let totalFiles = 0;
  replacer.on('path-replaced', function({filePath, replacements}) {
    totalFiles++;
    totalReplacements += replacements;
    if (options.verbose) { return console.log('Replaced', replacements, 'in', filePath); }
  });

  return replace(regex, options.replace, scanner, replacer, function() {
    console.timeEnd('Single Process Search + Replace');
    return console.log(`Replaced ${totalReplacements} matches in ${totalFiles} files`);
  });
};


//# Scanning

const scanMain = function(options) {
  const scanner = new PathScanner(options.pathToScan, options);
  console.time('Single Process Scan');

  let count = 0;
  scanner.on('path-found', function(path) {
    count++;
    if (options.verbose) { return console.log(path); }
  });

  scanner.on('finished-scanning', function() {
    console.timeEnd('Single Process Scan');
    return console.log(`Found ${count} paths`);
  });

  return scanner.scan();
};

module.exports = {scanMain, searchMain, replaceMain, search, replace};

/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let LessCache;
const crypto = require('crypto');
const {basename, dirname, extname, join, relative} = require('path');

const _ = require('underscore-plus');
const fs = require('fs-plus');
let less = null; // Defer until it is actually used
let lessFs = null; // Defer until it is actually used
const walkdir = require('walkdir').sync;

const cacheVersion = 1;

module.exports =
(LessCache = class LessCache {
  static digestForContent(content) {
    return crypto.createHash('SHA1').update(content, 'utf8').digest('hex');
  }

  // Create a new Less cache with the given options.
  //
  // options - An object with following keys
  //   * cacheDir: A string path to the directory to store cached files in (required)
  //
  //   * importPaths: An array of strings to configure the Less parser with (optional)
  //
  //   * resourcePath: A string path to use for relativizing paths. This is useful if
  //                   you want to make caches transferable between directories or
  //                   machines. (optional)
  //
  //   * fallbackDir: A string path to a directory containing a readable cache to read
  //                  from an entry is not found in this cache (optional)
  constructor(params) {
    if (params == null) { params = {}; }
    ({
      cacheDir: this.cacheDir, importPaths: this.importPaths, resourcePath: this.resourcePath, fallbackDir: this.fallbackDir, syncCaches: this.syncCaches,
      lessSourcesByRelativeFilePath: this.lessSourcesByRelativeFilePath, importedFilePathsByRelativeImportPath: this.importedFilePathsByRelativeImportPath
    } = params);

    if (this.lessSourcesByRelativeFilePath == null) { this.lessSourcesByRelativeFilePath = {}; }
    if (this.importedFilePathsByRelativeImportPath == null) { this.importedFilePathsByRelativeImportPath = {}; }
    this.importsCacheDir = this.cacheDirectoryForImports(this.importPaths);
    if (this.fallbackDir) {
      this.importsFallbackDir = join(this.fallbackDir, basename(this.importsCacheDir));
    }

    try {
      ({importedFiles: this.importedFiles} = this.readJson(join(this.importsCacheDir, 'imports.json')));
    } catch (error) {}

    this.setImportPaths(this.importPaths);

    this.stats = {
      hits: 0,
      misses: 0
    };
  }

  cacheDirectoryForImports(importPaths) {
    if (importPaths == null) { importPaths = []; }
    if (this.resourcePath) {
      importPaths = importPaths.map(importPath => {
        return this.relativize(this.resourcePath, importPath);
      });
    }
    return join(this.cacheDir, LessCache.digestForContent(importPaths.join('\n')));
  }

  getDirectory() { return this.cacheDir; }

  getImportPaths() { return _.clone(this.importPaths); }

  getImportedFiles(importPaths) {
    let importedFiles = [];
    for (let absoluteImportPath of Array.from(importPaths)) {
      let importPath = null;
      if (this.resourcePath != null) {
        importPath = this.relativize(this.resourcePath, absoluteImportPath);
      } else {
        importPath = absoluteImportPath;
      }

      const importedFilePaths = this.importedFilePathsByRelativeImportPath[importPath];
      if (importedFilePaths != null) {
        importedFiles = importedFiles.concat(importedFilePaths);
      } else {
        try {
          walkdir(absoluteImportPath, {no_return: true}, (filePath, stat) => {
            if (!stat.isFile()) { return; }
            if (this.resourcePath != null) {
              return importedFiles.push(this.relativize(this.resourcePath, filePath));
            } else {
              return importedFiles.push(filePath);
            }
          });
        } catch (error) {
          continue;
        }
      }
    }

    return importedFiles;
  }

  setImportPaths(importPaths) {
    if (importPaths == null) { importPaths = []; }
    const importedFiles = this.getImportedFiles(importPaths);

    const pathsChanged = !_.isEqual(this.importPaths, importPaths);
    const filesChanged = !_.isEqual(this.importedFiles, importedFiles);
    if (pathsChanged) {
      this.importsCacheDir = this.cacheDirectoryForImports(importPaths);
      if (this.fallbackDir) {
        this.importsFallbackDir = join(this.fallbackDir, basename(this.importsCacheDir));
      }
    } else if (filesChanged) {
      try {
        fs.removeSync(this.importsCacheDir);
      } catch (error) {
        if ((error != null ? error.code : undefined) === 'ENOENT') {
          try {
            fs.removeSync(this.importsCacheDir); // Retry once
          } catch (error1) {}
        }
      }
    }

    this.writeJson(join(this.importsCacheDir, 'imports.json'), {importedFiles});

    this.importedFiles = importedFiles;
    return this.importPaths = importPaths;
  }

  observeImportedFilePaths(callback) {
    const importedPaths = [];
    if (lessFs == null) { lessFs = require('less/lib/less-node/fs.js'); }
    const originalFsReadFileSync = lessFs.readFileSync;
    lessFs.readFileSync = (filePath, ...args) => {
      let relativeFilePath;
      if (this.resourcePath) { relativeFilePath = this.relativize(this.resourcePath, filePath); }
      const lessSource = this.lessSourcesByRelativeFilePath[relativeFilePath];
      let content = null;
      let digest = null;
      if (lessSource != null) {
        ({
          content
        } = lessSource);
        ({
          digest
        } = lessSource);
      } else {
        content = originalFsReadFileSync(filePath, ...Array.from(args));
        digest = LessCache.digestForContent(content);
      }

      importedPaths.push({path: relativeFilePath != null ? relativeFilePath : filePath, digest});
      return content;
    };

    try {
      callback();
    } finally {
      lessFs.readFileSync = originalFsReadFileSync;
    }

    return importedPaths;
  }

  readJson(filePath) { return JSON.parse(fs.readFileSync(filePath)); }

  writeJson(filePath, object) { return fs.writeFileSync(filePath, JSON.stringify(object)); }

  digestForPath(relativeFilePath) {
    const lessSource = this.lessSourcesByRelativeFilePath[relativeFilePath];
    if (lessSource != null) {
      return lessSource.digest;
    } else {
      let absoluteFilePath = null;
      if (this.resourcePath && !fs.isAbsolute(relativeFilePath)) {
        absoluteFilePath = join(this.resourcePath, relativeFilePath);
      } else {
        absoluteFilePath = relativeFilePath;
      }
      return LessCache.digestForContent(fs.readFileSync(absoluteFilePath));
    }
  }

  relativize(from, to) {
    const relativePath = relative(from, to);
    if (relativePath.indexOf('..') === 0) {
      return to;
    } else {
      return relativePath;
    }
  }

  getCachePath(directory, filePath) {
    const cacheFile = `${basename(filePath, extname(filePath))}.json`;
    let directoryPath = dirname(filePath);
    if (this.resourcePath) { directoryPath = this.relativize(this.resourcePath, directoryPath); }
    if (directoryPath) { directoryPath = LessCache.digestForContent(directoryPath); }
    return join(directory, 'content', directoryPath, cacheFile);
  }

  getCachedCss(filePath, digest) {
    let cacheEntry, error, fallbackDirUsed;
    let path;
    try {
      cacheEntry = this.readJson(this.getCachePath(this.importsCacheDir, filePath));
    } catch (error1) {
      error = error1;
      if (this.importsFallbackDir != null) {
        try {
          cacheEntry = this.readJson(this.getCachePath(this.importsFallbackDir, filePath));
          fallbackDirUsed = true;
        } catch (error3) {}
      }
    }

    if (digest !== (cacheEntry != null ? cacheEntry.digest : undefined)) { return; }

    for ({path, digest} of Array.from(cacheEntry.imports)) {
      try {
        if (this.digestForPath(path) !== digest) { return; }
      } catch (error2) {
        error = error2;
        return;
      }
    }

    if (this.syncCaches) {
      if (fallbackDirUsed) {
        this.writeJson(this.getCachePath(this.importsCacheDir, filePath), cacheEntry);
      } else if (this.importsFallbackDir != null) {
        this.writeJson(this.getCachePath(this.importsFallbackDir, filePath), cacheEntry);
      }
    }

    return cacheEntry.css;
  }

  putCachedCss(filePath, digest, css, imports) {
    const cacheEntry = {digest, css, imports, version: cacheVersion};
    this.writeJson(this.getCachePath(this.importsCacheDir, filePath), cacheEntry);

    if (this.syncCaches && (this.importsFallbackDir != null)) {
      return this.writeJson(this.getCachePath(this.importsFallbackDir, filePath), cacheEntry);
    }
  }

  parseLess(filePath, contents) {
    let css = null;
    const options = {filename: filePath, syncImport: true, paths: this.importPaths};
    if (less == null) { less = require('less'); }
    const imports = this.observeImportedFilePaths(() => less.render(contents, options, function(error, result) {
      if (error != null) {
        throw error;
      } else {
        return ({css} = result);
      }
    }));
    return {imports, css};
  }

  // Read the Less file at the current path and return either the cached CSS or the newly
  // compiled CSS. This method caches the compiled CSS after it is generated. This cached
  // CSS will be returned as long as the Less file and any of its imports are unchanged.
  //
  // filePath: A string path to a Less file.
  //
  // Returns the compiled CSS for the given path.
  readFileSync(absoluteFilePath) {
    let lessSource = null;
    if (this.resourcePath && fs.isAbsolute(absoluteFilePath)) {
      const relativeFilePath = this.relativize(this.resourcePath, absoluteFilePath);
      lessSource = this.lessSourcesByRelativeFilePath[relativeFilePath];
    }

    if (lessSource != null) {
      return this.cssForFile(absoluteFilePath, lessSource.content, lessSource.digest);
    } else {
      return this.cssForFile(absoluteFilePath, fs.readFileSync(absoluteFilePath, 'utf8'));
    }
  }

  // Return either cached CSS or the newly
  // compiled CSS from `lessContent`. This method caches the compiled CSS after it is generated. This cached
  // CSS will be returned as long as the Less file and any of its imports are unchanged.
  //
  // filePath: A string path to the Less file.
  // lessContent: The contents of the filePath
  //
  // Returns the compiled CSS for the given path and lessContent
  cssForFile(filePath, lessContent, digest) {
    let imports;
    if (digest == null) { digest = LessCache.digestForContent(lessContent); }
    let css = this.getCachedCss(filePath, digest);
    if (css != null) {
      this.stats.hits++;
      return css;
    }

    this.stats.misses++;
    ({imports, css} = this.parseLess(filePath, lessContent));
    this.putCachedCss(filePath, digest, css, imports);
    return css;
  }
});

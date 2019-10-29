/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const crypto = require('crypto');
const path = require('path');

const fs = require('fs-plus');
let CSON = null; // defer until used

let csonCache = null;

let stats = {
  hits: 0,
  misses: 0
};

const getCachePath = function(cson) {
  const digest = crypto.createHash('sha1').update(cson, 'utf8').digest('hex');
  return path.join(csonCache, `${digest}.json`);
};

const writeCacheFileSync = function(cachePath, object) {
  try {
    return fs.writeFileSync(cachePath, JSON.stringify(object));
  } catch (error) {}
};

const writeCacheFile = (cachePath, object) => fs.writeFile(cachePath, JSON.stringify(object), function() {});

const parseObject = function(objectPath, contents, options) {
  if (path.extname(objectPath) === '.cson') {
    if (CSON == null) { CSON = require('cson-parser'); }
    try {
      const parsed = CSON.parse(contents, (options != null ? options.allowDuplicateKeys : undefined) === false ? detectDuplicateKeys : undefined);
      stats.misses++;
      return parsed;
    } catch (error) {
      if (isAllCommentsAndWhitespace(contents)) {
        return null;
      } else {
        throw error;
      }
    }
  } else {
    return JSON.parse(contents);
  }
};

const parseCacheContents = function(contents) {
  const parsed = JSON.parse(contents);
  stats.hits++;
  return parsed;
};

const parseContentsSync = function(objectPath, cachePath, contents, options) {
  let object;
  try {
    object = parseObject(objectPath, contents, options);
  } catch (parseError) {
    if (parseError.path == null) { parseError.path = objectPath; }
    if (parseError.filename == null) { parseError.filename = objectPath; }
    throw parseError;
  }

  if (cachePath) { writeCacheFileSync(cachePath, object); }
  return object;
};

var isAllCommentsAndWhitespace = function(contents) {
  const lines = contents.split('\n');
  while (lines.length > 0) {
    const line = lines[0].trim();
    if ((line.length === 0) || (line[0] === '#')) {
      lines.shift();
    } else {
      return false;
    }
  }
  return true;
};

const parseContents = function(objectPath, cachePath, contents, options, callback) {
  let object;
  try {
    object = parseObject(objectPath, contents, options);
  } catch (parseError) {
    parseError.path = objectPath;
    if (parseError.filename == null) { parseError.filename = objectPath; }
    parseError.message = `${objectPath}: ${parseError.message}`;
    if (typeof callback === 'function') {
      callback(parseError);
    }
    return;
  }

  if (cachePath) { writeCacheFile(cachePath, object); }
  if (typeof callback === 'function') {
    callback(null, object);
  }
};

module.exports = {
  setCacheDir(cacheDirectory) { return csonCache = cacheDirectory; },

  isObjectPath(objectPath) {
    if (!objectPath) { return false; }

    const extension = path.extname(objectPath);
    return (extension === '.cson') || (extension === '.json');
  },

  resolve(objectPath) {
    if (objectPath == null) { objectPath = ''; }
    if (!objectPath) { return null; }

    if (this.isObjectPath(objectPath) && fs.isFileSync(objectPath)) { return objectPath; }

    const jsonPath = `${objectPath}.json`;
    if (fs.isFileSync(jsonPath)) { return jsonPath; }

    const csonPath = `${objectPath}.cson`;
    if (fs.isFileSync(csonPath)) { return csonPath; }

    return null;
  },

  readFileSync(objectPath, options) {
    let cachePath;
    if (options == null) { options = {}; }
    const parseOptions =
      {allowDuplicateKeys: options.allowDuplicateKeys};
    delete options.allowDuplicateKeys;

    const fsOptions = Object.assign({encoding: 'utf8'}, options);

    const contents = fs.readFileSync(objectPath, fsOptions);
    if (contents.trim().length === 0) { return null; }
    if (csonCache && (path.extname(objectPath) === '.cson')) {
      cachePath = getCachePath(contents);
      if (fs.isFileSync(cachePath)) {
        try {
          return parseCacheContents(fs.readFileSync(cachePath, 'utf8'));
        } catch (error) {}
      }
    }

    return parseContentsSync(objectPath, cachePath, contents, parseOptions);
  },

  readFile(objectPath, options, callback) {
    if (arguments.length < 3) {
      callback = options;
      options = {};
    }

    const parseOptions =
      {allowDuplicateKeys: options.allowDuplicateKeys};
    delete options.allowDuplicateKeys;

    const fsOptions = Object.assign({encoding: 'utf8'}, options);

    return fs.readFile(objectPath, fsOptions, (error, contents) => {
      if (error != null) { return (typeof callback === 'function' ? callback(error) : undefined); }
      if (contents.trim().length === 0) { return (typeof callback === 'function' ? callback(null, null) : undefined); }

      if (csonCache && (path.extname(objectPath) === '.cson')) {
        const cachePath = getCachePath(contents);
        return fs.stat(cachePath, function(error, stat) {
          if ((stat != null ? stat.isFile() : undefined)) {
            return fs.readFile(cachePath, 'utf8', function(error, cached) {
              let parsed;
              try {
                parsed = parseCacheContents(cached);
              } catch (error1) {
                error = error1;
                try {
                  parseContents(objectPath, cachePath, contents, parseOptions, callback);
                } catch (error2) {}
                return;
              }
              return (typeof callback === 'function' ? callback(null, parsed) : undefined);
            });
          } else {
            return parseContents(objectPath, cachePath, contents, parseOptions, callback);
          }
        });
      } else {
        return parseContents(objectPath, null, contents, parseOptions, callback);
      }
    });
  },

  writeFile(objectPath, object, options, callback) {
    let contents;
    if (arguments.length < 4) {
      callback = options;
      options = {};
    }
    if (callback == null) { callback = function() {}; }

    try {
      contents = this.stringifyPath(objectPath, object);
    } catch (error) {
      callback(error);
      return;
    }

    return fs.writeFile(objectPath, `${contents}\n`, options, callback);
  },

  writeFileSync(objectPath, object, options) {
    if (options == null) { options = undefined; }
    return fs.writeFileSync(objectPath, `${this.stringifyPath(objectPath, object)}\n`, options);
  },

  stringifyPath(objectPath, object, visitor, space) {
    if (path.extname(objectPath) === '.cson') {
      return this.stringify(object, visitor, space);
    } else {
      return JSON.stringify(object, undefined, 2);
    }
  },

  stringify(object, visitor, space) {
    if (space == null) { space = 2; }
    if (CSON == null) { CSON = require('cson-parser'); }
    return CSON.stringify(object, visitor, space);
  },

  parse(str, reviver) {
    if (CSON == null) { CSON = require('cson-parser'); }
    return CSON.parse(str, reviver);
  },

  getCacheHits() { return stats.hits; },

  getCacheMisses() { return stats.misses; },

  resetCacheStats() {
    return stats = {
      hits: 0,
      misses: 0
    };
  }
};

var detectDuplicateKeys = function(key, value) {
  if (this.hasOwnProperty(key) && (this[key] !== value)) {
    throw new Error(`Duplicate key '${key}'`);
  } else {
    return value;
  }
};

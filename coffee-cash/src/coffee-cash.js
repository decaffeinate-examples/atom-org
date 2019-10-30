/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS204: Change includes calls to have a more natural evaluation order
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const crypto = require('crypto');
const path = require('path');

let CoffeeScript = null; // defer until used
const fs = require('fs-plus');

let stats = {
  hits: 0,
  misses: 0
};
let cacheDirectory = null;

const getCachePath = function(coffee) {
  const digest = crypto.createHash('sha1').update(coffee, 'utf8').digest('hex');
  return path.join(cacheDirectory, `${digest}.js`);
};

const getCachedJavaScript = function(cachePath) {
  if (fs.isFileSync(cachePath)) {
    try {
      const cachedJavaScript = fs.readFileSync(cachePath, 'utf8');
      stats.hits++;
      return cachedJavaScript;
    } catch (error) {}
  }
};

const convertFilePath = function(filePath) {
  if (process.platform === 'win32') {
    filePath = `/${path.resolve(filePath).replace(/\\/g, '/')}`;
  }
  return encodeURI(filePath);
};

const loadCoffeeScript = function() {
  const coffee = require('coffee-script');

  // Work around for https://github.com/jashkenas/coffeescript/issues/3890
  const coffeePrepareStackTrace = Error.prepareStackTrace;
  if (coffeePrepareStackTrace != null) {
    Error.prepareStackTrace = function(error, stack) {
      try {
        return coffeePrepareStackTrace(error, stack);
      } catch (coffeeError) {
        return stack;
      }
    };
  }

  return coffee;
};

const compileCoffeeScript = function(coffee, filePath, cachePath) {
  if (CoffeeScript == null) { CoffeeScript = loadCoffeeScript(); }
  const compileOptions = {
    filename: filePath,
    literate: isLiterate(filePath),
    sourceMap: true
  };
  let {js, v3SourceMap} = CoffeeScript.compile(coffee, compileOptions);
  stats.misses++;

  if ((typeof btoa !== 'undefined' && btoa !== null) && (typeof unescape !== 'undefined' && unescape !== null) && (typeof encodeURIComponent !== 'undefined' && encodeURIComponent !== null)) {
    js = `\
${js}
//# sourceMappingURL=data:application/json;base64,${btoa(unescape(encodeURIComponent(v3SourceMap)))}
//# sourceURL=${convertFilePath(filePath)}\
`;
  }

  try {
    fs.writeFileSync(cachePath, js);
  } catch (error) {}
  return js;
};

var isLiterate = function(filePath) { let needle;
return (needle = path.extname(filePath), ['.litcoffee', '.md'].includes(needle)); };

const requireCoffeeScript = function(module, filePath) {
  let left;
  const coffee = fs.readFileSync(filePath, 'utf8');
  const cachePath = getCachePath(coffee);
  const js = (left = getCachedJavaScript(cachePath)) != null ? left : compileCoffeeScript(coffee, filePath, cachePath);
  return module._compile(js, filePath);
};

exports.register = function() {
  const propertyConfig = {
    enumerable: true,
    value: requireCoffeeScript,
    writable: false
  };

  Object.defineProperty(require.extensions, '.coffee', propertyConfig);
  Object.defineProperty(require.extensions, '.litcoffee', propertyConfig);
  Object.defineProperty(require.extensions, '.coffee.md', propertyConfig);

};

exports.getCacheMisses = () => stats.misses;

exports.getCacheHits = () => stats.hits;

exports.resetCacheStats = () => stats = {
  hits: 0,
  misses: 0
};

exports.setCacheDirectory = newCacheDirectory => cacheDirectory = newCacheDirectory;

exports.getCacheDirectory = () => cacheDirectory;

exports.addPathToCache = function(filePath) {
  const coffee = fs.readFileSync(filePath, 'utf8');
  const cachePath = getCachePath(coffee);
  compileCoffeeScript(coffee, filePath, cachePath);
};

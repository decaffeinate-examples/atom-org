/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Run this to update the list of builtin less functions

const path = require('path');
const request = require('request');
const Promise = require('bluebird');
const CSON = require('season');

const FunctionsURL = 'https://raw.githubusercontent.com/less/less-docs/master/content/functions/data/functions.json';

const functionsPromise = new Promise(resolve => request({json: true, url: FunctionsURL}, function(error, response, properties) {
  if (error != null) {
    console.error(error.message);
    resolve(null);
  }
  if (response.statusCode !== 200) {
    console.error(`Request failed: ${response.statusCode}`);
    resolve(null);
  }
  return resolve(properties);
}));

functionsPromise.then(function(results) {
  const suggestions = [];
  for (let functionType in results) {
    const functions = results[functionType];
    for (let func of Array.from(functions)) {
      suggestions.push({
        type: 'function',
        rightLabel: 'Less Builtin',
        snippet: sanitizeFunc(func.example),
        description: func.description,
        descriptionMoreURL: `http://lesscss.org/functions/#${functionType}-${func.name}`
      });
    }
  }

  const configPath = path.join(__dirname, 'settings', 'language-less.cson');
  const config = CSON.readFileSync(configPath);
  const {
    builtins
  } = config['.source.css.less .meta.property-value'].autocomplete.symbols;
  builtins.suggestions = suggestions;
  return CSON.writeFileSync(configPath, config);
});

var sanitizeFunc = function(functionExample) {
  functionExample = functionExample.replace(';', '');
  functionExample = functionExample.replace(/\[, /g, ', [');
  functionExample = functionExample.replace(/\,] /g, '], ');

  const argsRe = /\(([^\)]+)\)/;
  functionExample = functionExample.replace(argsRe, function(args) {
    let index;
    args = argsRe.exec(args)[1];
    args = args.split(',');
    args = ((() => {
      const result = [];
      for (index = 0; index < args.length; index++) {
        const arg = args[index];
        result.push(`\${${index + 1}:${arg.trim()}}`);
      }
      return result;
    })());
    return `(${args.join(', ')})\${${index+1}:;}`;
  });

  return `${functionExample}$0`;
};

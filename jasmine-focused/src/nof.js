/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS204: Change includes calls to have a more natural evaluation order
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require('fs');
const path = require('path');
const _ = require('underscore-plus');
const walkdir = require('walkdir');

module.exports = function(...specPaths) {
  specPaths = _.flatten(specPaths);
  if (specPaths.length === 0) { specPaths = ['spec']; }
  specPaths = specPaths.map(directory => path.resolve(directory));

  const pattern = /^(\s*)f+(it|describe)((\s+)|(\s*\())/gm;

  return (() => {
    const result = [];
    for (var specDirectory of Array.from(specPaths)) {
      var error;
      try {
        if (!fs.statSync(specDirectory).isDirectory()) { continue; }
      } catch (error1) {
        error = error1;
        continue;
      }

      result.push((() => {
        const result1 = [];
        for (let specPath of Array.from(walkdir.sync(specDirectory))) {
          var needle;
          try {
            const stats = fs.statSync(specPath);
            if (!stats.isFile()) { continue; }
            if (stats.size === 0) { continue; }
          } catch (error2) {
            error = error2;
            continue;
          }


          if ((needle = path.extname(specPath), !['.coffee', '.js'].includes(needle))) { continue; }

          const specContents = fs.readFileSync(specPath, 'utf8');
          result1.push(fs.writeFileSync(specPath, specContents.replace(pattern, '$1$2$3')));
        }
        return result1;
      })());
    }
    return result;
  })();
};

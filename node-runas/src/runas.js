/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const runas = require('../build/Release/runas.node');

const searchCommand = function(command) {
  if (command[0] === '/') { return command; }

  const fs = require('fs');
  const path = require('path');
  const paths = process.env.PATH.split(path.delimiter);
  for (let p of Array.from(paths)) {
    try {
      const filename = path.join(p, command);
      if (fs.statSync(filename).isFile()) { return filename; }
    } catch (e) {}
  }
  return '';
};

module.exports = function(command, args, options) {
  if (args == null) { args = []; }
  if (options == null) { options = {}; }
  if (options.hide == null) { options.hide = true; }
  if (options.admin == null) { options.admin = false; }

  // Convert command to its full path when using authorization service
  if ((process.platform === 'darwin') && (options.admin === true)) {
    command = searchCommand(command);
  }

  return runas.runas(command, args, options);
};

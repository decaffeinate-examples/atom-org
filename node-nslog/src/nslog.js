/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const NSLog = require('../build/Release/nslog.node');
const util = require('util');

module.exports = (...args) => NSLog.log(util.format(...Array.from(args || [])));

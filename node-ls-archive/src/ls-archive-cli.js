/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const path = require('path');
const async = require('async');
const colors = require('colors');
const optimist = require('optimist');
const archive = require('./ls-archive');

module.exports = function() {
  const cli = optimist.usage( `\
Usage: lsa [file ...]

List the files and folders inside an archive file.

Supports .zip, .tar, .tar.gz, and .tgz files.\
`)
    .describe('colors', 'Enable colored output').default('colors', true).boolean('colors')
    .describe('help', 'Show this message').alias('h', 'help')
    .demand(1);

  if (cli.argv.help) {
    cli.showHelp();
    return;
  }

  if (!cli.argv.colors) {
    colors.setTheme({
      cyan: 'stripColors',
      red: 'stripColors'
    });
  }

  const queue = async.queue((archivePath, callback) => ((archivePath => archive.list(archivePath, function(error, files) {
    if (error != null) {
      console.error(`Error reading: ${archivePath}`.red);
    } else {
      console.log(`${archivePath.cyan} (${files.length})`);
      for (let index = 0; index < files.length; index++) {
        var prefix;
        const file = files[index];
        if (index === (files.length - 1)) {
          prefix = '\u2514\u2500\u2500 ';
        } else {
          prefix = '\u251C\u2500\u2500 ';
        }
        console.log(`${prefix}${file.getPath()}`);
      }
      console.log();
    }
    return callback();
  })))(archivePath));

  const files = cli.argv._;
  return files.forEach(file => queue.push(path.resolve(process.cwd(), file)));
};

/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const path = require('path');
const fs = require('fs-plus');
const yargs = require('yargs');
const Highlights = require('./highlights');

module.exports = function() {
  let html;
  const {
    argv
  } = yargs.describe('i', 'Path to file or folder of grammars to include').alias('i', 'include').string('i')
    .describe('o', 'File path to write the HTML output to').alias('o', 'output').string('o')
    .describe('s', 'Scope name of the grammar to use').alias('s', 'scope').string('s')
    .describe('f', 'File path to use for grammar detection when reading from stdin').alias('f', 'file-path').string('f')
    .help('h').alias('h', 'help')
    .usage(`\
Usage: highlights [options] [file]

Output the syntax highlighted HTML for a file.

If no input file is specified then the text to highlight is read from standard in.

If no output file is specified then the HTML is written to standard out.\
`).version().alias('v', 'version');

  let [filePath] = Array.from(argv._);

  let outputPath = argv.output;
  if (outputPath) { outputPath = path.resolve(outputPath); }

  if (filePath) {
    filePath = path.resolve(filePath);
    if (!fs.isFileSync(filePath)) {
      console.error(`Specified path is not a file: ${filePath}`);
      process.exit(1);
      return;
    }

    html = new Highlights().highlightSync({filePath, scopeName: argv.scope});
    if (outputPath) {
      return fs.writeFileSync(outputPath, html);
    } else {
      return console.log(html);
    }
  } else {
    filePath = argv.f;
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    let fileContents = '';
    process.stdin.on('data', chunk => fileContents += chunk.toString());
    return process.stdin.on('end', function() {
      html = new Highlights().highlightSync({filePath, fileContents, scopeName: argv.scope});
      if (outputPath) {
        return fs.writeFileSync(outputPath, html);
      } else {
        return console.log(html);
      }
    });
  }
};

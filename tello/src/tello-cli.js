/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require('fs');
const {digest} = require('./digester');

const getArgs = function() {
  const optimist = require('optimist')
    .usage(`\
Usage: $0 [options] [source_files]\
`)
    .options('o', {
      alias: 'output-file',
      describe: 'The output directory',
      default: './api.json'
    }
    )
    .options('i', {
      alias: 'input-file',
      describe: 'The output directory',
      default: './metadata.json'
    }
    )
    .options('h', {
      alias: 'help',
      describe: 'Show the help'
    }
    );
  const {
    argv
  } = optimist;

  if (argv.h) {
    return console.log(optimist.help());
  } else {
    return {
      input: argv.i,
      output: argv.o
    };
  }
};

const main = function() {
  let args;
  if (!(args = getArgs())) { return; }

  const metadata = JSON.parse(fs.readFileSync(args.input, 'utf8'));
  const json = digest(metadata);
  return fs.writeFileSync(args.output, JSON.stringify(json, null, '  '));
};

module.exports = {main};

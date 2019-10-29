/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {join} = require('path');
const temp = require('temp');
const {File} = require('pathwatcher');
const TextBuffer = require('../src/text-buffer');
const SampleText = readFileSync(join(__dirname, 'fixtures', 'sample.js'), 'utf8');

describe("TextBuffer", function() {
  let buffer = null;

  return afterEach(() => buffer = null);
});

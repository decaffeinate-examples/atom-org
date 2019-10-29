/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const path = require('path');
const fs = require('fs-plus');
const temp = require('temp');
const csonc = require('../lib/csonc');

describe("CSON compilation to JSON", function() {
  let [compileDir, inputFile, outputFile] = Array.from([]);

  beforeEach(function() {
    compileDir = temp.mkdirSync('season-compile-dir-');
    inputFile = path.join(compileDir, 'input.cson');
    outputFile = path.join(compileDir, 'input.json');
    spyOn(process, 'exit');
    return spyOn(console, 'error');
  });

  it("writes the output file to the input file's directory with the same base name and .json extension", function() {
    fs.writeFileSync(inputFile, 'deadmau: 5');
    csonc([inputFile, '--output', outputFile]);
    return expect(fs.readFileSync(outputFile, {encoding: 'utf8'})).toBe('{\n  "deadmau": 5\n}\n');
  });

  describe("when a valid CSON file is specified", () => it("converts the file to JSON and writes it out", function() {
    fs.writeFileSync(inputFile, 'a: 3');
    csonc([inputFile, '--output', outputFile]);
    return expect(fs.readFileSync(outputFile, {encoding: 'utf8'})).toBe('{\n  "a": 3\n}\n');
  }));

  describe("when an input CSON file is invalid CoffeeScript", () => it("logs an error and exits", function() {
    fs.writeFileSync(inputFile, '<->');
    csonc([inputFile, '--output', outputFile]);
    expect(process.exit.mostRecentCall.args[0]).toBe(1);
    return expect(console.error.mostRecentCall.args[0].length).toBeGreaterThan(0);
  }));

  describe("when the input CSON file does not exist", () => it("logs an error and exits", function() {
    csonc([inputFile]);
    expect(process.exit.mostRecentCall.args[0]).toBe(1);
    return expect(console.error.mostRecentCall.args[0].length).toBeGreaterThan(0);
  }));

  return describe("when the root option is set", function() {
    describe("when the input CSON file contains a root object", () => it("converts the file to JSON and writes it out", function() {
      fs.writeFileSync(inputFile, 'a: 3');
      csonc(['--root', inputFile, '--output', outputFile]);
      return expect(fs.readFileSync(outputFile, {encoding: 'utf8'})).toBe('{\n  "a": 3\n}\n');
    }));

    return describe("when the input CSON file contains a root array", () => it("logs and error and exits", function() {
      fs.writeFileSync(inputFile, '[1,2,3]');
      csonc(['--root', inputFile, '--output', outputFile]);
      expect(process.exit.mostRecentCall.args[0]).toBe(1);
      return expect(console.error.mostRecentCall.args[0].length).toBeGreaterThan(0);
    }));
  });
});

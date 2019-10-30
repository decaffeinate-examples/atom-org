/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const archive = require('../lib/ls-archive');
const path = require('path');

describe("Common behavior", function() {
  describe(".list()", function() {
    it("calls back with an error for unsupported extensions", function() {
      let pathError = null;
      const callback = error => pathError = error;
      archive.list(path.join('tmp', 'file.txt'), callback);
      waitsFor(() => pathError != null);
      return runs(() => expect(pathError.message).not.toBeNull());
    });

    return it("returns undefined", () => expect(archive.list(path.join('tmp', 'file.zip'), function() {})).toBeUndefined());
  });

  describe(".readFile()", function() {
    it("calls back with an error for unsupported extensions", function() {
      let pathError = null;
      const callback = error => pathError = error;
      archive.readFile(path.join('tmp', 'file.txt'), 'file.txt', callback);
      waitsFor(() => pathError != null);
      return runs(() => expect(pathError.message).not.toBeNull());
    });

    return it("returns undefined", () => expect(archive.readFile(path.join('tmp', 'file.txt'), 'file.txt', function() {})).toBeUndefined());
  });

  return describe(".isPathSupported()", () => it("returns true for supported path extensions", function() {
    expect(archive.isPathSupported(`${path.sep}a.epub`)).toBe(true);
    expect(archive.isPathSupported(`${path.sep}a.zip`)).toBe(true);
    expect(archive.isPathSupported(`${path.sep}a.jar`)).toBe(true);
    expect(archive.isPathSupported(`${path.sep}a.war`)).toBe(true);
    expect(archive.isPathSupported(`${path.sep}a.tar`)).toBe(true);
    expect(archive.isPathSupported(`${path.sep}a.tgz`)).toBe(true);
    expect(archive.isPathSupported(`${path.sep}a.tar.gz`)).toBe(true);
    expect(archive.isPathSupported(`${path.sep}a.whl`)).toBe(true);
    expect(archive.isPathSupported(`${path.sep}a.egg`)).toBe(true);
    expect(archive.isPathSupported(`${path.sep}a.xpi`)).toBe(true);
    expect(archive.isPathSupported(`${path.sep}a.nupkg`)).toBe(true);
    expect(archive.isPathSupported(`${path.sep}a.bar.gz`)).toBe(false);
    expect(archive.isPathSupported(`${path.sep}a.txt`)).toBe(false);
    expect(archive.isPathSupported(`${path.sep}`)).toBe(false);
    expect(archive.isPathSupported('')).toBe(false);
    expect(archive.isPathSupported(null)).toBe(false);
    return expect(archive.isPathSupported()).toBe(false);
  }));
});

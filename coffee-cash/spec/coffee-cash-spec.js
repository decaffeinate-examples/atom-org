/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require('fs');
const path = require('path');
const temp = require('temp');
const CoffeeCache = require('../src/coffee-cash');

temp.track();

describe("Coffee Cache", function() {
  let cachePath = null;

  beforeEach(function() {
    cachePath = temp.mkdirSync('coffee-cash');
    CoffeeCache.setCacheDirectory(cachePath);
    CoffeeCache.resetCacheStats();
    CoffeeCache.register();

    expect(CoffeeCache.getCacheMisses()).toBe(0);
    expect(CoffeeCache.getCacheHits()).toBe(0);
    return expect(CoffeeCache.getCacheDirectory()).toBe(cachePath);
  });

  it("caches the compiled CoffeeScript", function() {
    const sample = require('./fixtures/sample');
    expect(sample(2)).toBe(4);
    expect(CoffeeCache.getCacheMisses()).toBe(1);
    expect(CoffeeCache.getCacheHits()).toBe(0);

    const duplicateSample = require('./fixtures/duplicate');
    expect(duplicateSample).not.toBe(sample);
    expect(duplicateSample(2)).toBe(4);
    expect(CoffeeCache.getCacheMisses()).toBe(1);
    return expect(CoffeeCache.getCacheHits()).toBe(1);
  });

  it("caches the compiled literate CoffeeScript", function() {
    let sample = require('./fixtures/sample.litcoffee');
    expect(sample(10)).toBe(20);
    expect(CoffeeCache.getCacheMisses()).toBe(1);
    expect(CoffeeCache.getCacheHits()).toBe(0);

    const duplicateSample = require('./fixtures/duplicate.litcoffee');
    expect(duplicateSample).not.toBe(sample);
    expect(duplicateSample(10)).toBe(20);
    expect(CoffeeCache.getCacheMisses()).toBe(1);
    expect(CoffeeCache.getCacheHits()).toBe(1);

    sample = require('./fixtures/sample.coffee.md');
    expect(sample(10)).toBe(8);
    expect(CoffeeCache.getCacheMisses()).toBe(2);
    return expect(CoffeeCache.getCacheHits()).toBe(1);
  });

  it("prevents errors from being thrown by CoffeeScript's Error.prepareStackTrace", function() {
    const filePath = path.join(temp.mkdirSync(), 'file.coffee');
    fs.writeFileSync(filePath, "module.exports = -> throw new Error('hello world')");
    const throwsAnError = require(filePath);
    fs.unlinkSync(filePath);

    let caughtError = null;
    try {
      throwsAnError();
    } catch (error) {
      caughtError = error;
    }
    expect(caughtError.message).toBe('hello world');
    expect(() => caughtError.stack).not.toThrow();
    return expect(caughtError.stack.toString()).toContain(filePath);
  });

  return describe("addPathToCache", () => it("compiles the file and caches it", function() {
    const filePath = path.join(__dirname, 'fixtures', 'added.coffee');
    CoffeeCache.addPathToCache(filePath);
    expect(CoffeeCache.getCacheMisses()).toBe(1);
    expect(CoffeeCache.getCacheHits()).toBe(0);

    const added = require(filePath);
    expect(added(5)).toBe(6);
    expect(CoffeeCache.getCacheMisses()).toBe(1);
    return expect(CoffeeCache.getCacheHits()).toBe(1);
  }));
});

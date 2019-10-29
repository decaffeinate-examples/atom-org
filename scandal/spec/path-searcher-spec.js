/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require('fs');
const path = require('path');
const PathSearcher = require('../src/path-searcher');
const PathScanner = require('../src/path-scanner');

describe("PathSearcher", function() {
  let [searcher, rootPath] = Array.from([]);

  beforeEach(function() {
    searcher = new PathSearcher();
    return rootPath = fs.realpathSync(path.join("spec", "fixtures", "many-files"));
  });

  describe("findWordBreak()", function() {
    it("finds the first index", () => expect(searcher.findWordBreak('this is some text', 2, -1)).toBe(0));

    it("finds the last index", () => expect(searcher.findWordBreak('text', 2, 1)).toBe(3));

    it("finds the end of the word", () => expect(searcher.findWordBreak('text and stuff', 1, 1)).toBe(3));

    return it("finds the beginning of the word", () => expect(searcher.findWordBreak('text and stuff', 6, -1)).toBe(5));
  });

  describe("searchLine()", function() {
    let regex = null;
    beforeEach(() => regex = /ite[m]+s/gi);

    it("returns null when no results", () => expect(searcher.searchLine(regex, 'nope')).toBe(null));

    it("returns matches when more than one", function() {
      const line = 'this thing has items and itemmmms as well!';
      const matches = searcher.searchLine(regex, line, 10);

      expect(matches.length).toBe(2);

      expect(matches[0].lineText).toBe(line);
      expect(matches[0].matchText).toBe('items');
      expect(matches[0].range).toEqual([[10, 15], [10, 20]]);

      expect(matches[1].lineText).toBe(line);
      expect(matches[1].matchText).toBe('itemmmms');
      return expect(matches[1].range).toEqual([[10, 25], [10, 33]]);
  });

    it("resets the regex between lines", function() {
      let matches = searcher.searchLine(regex, 'has items and items!', 0);
      expect(matches.length).toBe(2);
      expect(matches[0].range).toEqual([[0, 4], [0, 9]]);
      expect(matches[1].range).toEqual([[0, 14], [0, 19]]);

      matches = searcher.searchLine(regex, 'another with itemmms!', 0);
      expect(matches.length).toBe(1);
      expect(matches[0].range).toEqual([[0, 13], [0, 20]]);

      matches = searcher.searchLine(regex, 'nothing here');
      return expect(matches).toBe(null);
    });

    return describe("with really long lines", () => it("truncates around each match", function() {
      const line = "Gentrify ITEMS yr swag salvia mcsweeney's sustainable skateboard hoodie craft beer. Sartorial mixtape marfa trust fund, cliche seitan 3 wolf moon banh mi keffiyeh. Food truck small batch chillwave photo booth blog ethnic, fap +1 american apparel. Portland semiotics post-ironic etsy cliche photo booth. Wolf bicycle rights yr, keffiyeh godard odd future marfa. Yr authentic raw denim, DIY portland photo booth banh ITEMS hoodie before they sold out PBR mumblecore vinyl blog direct trade mixtape. Ethical twee forage vice ethnic beard food truck, organic Austin authentic kale chips ITEMS thundercats.";
      const matches = searcher.searchLine(regex, line, 1);
      expect(matches.length).toBe(3);

      // Match at the beginning of the line
      expect(matches[0].range).toEqual([[1, 9], [1, 14]]);
      expect(matches[0].lineTextOffset).toEqual(0);
      expect(matches[0].lineText).toEqual("Gentrify ITEMS yr swag salvia mcsweeney's sustainable skateboard hoodie craft beer. Sartorial mixtape");
      expect(matches[0].matchText).toEqual('ITEMS');

      expect(matches[1].range).toEqual([[1, 415], [1, 420]]);
      expect(matches[1].lineTextOffset).toEqual(364);
      expect(matches[1].lineText).toEqual("authentic raw denim, DIY portland photo booth banh ITEMS hoodie before they sold out PBR mumblecore vinyl");
      expect(matches[1].matchText).toEqual('ITEMS');

      expect(matches[2].range).toEqual([[1, 583], [1, 588]]);
      expect(matches[2].lineTextOffset).toEqual(497);
      expect(matches[2].lineText).toEqual("Ethical twee forage vice ethnic beard food truck, organic Austin authentic kale chips ITEMS thundercats.");
      return expect(matches[2].matchText).toEqual('ITEMS');
    }));
  });

  describe("searchPath()", function() {
    let filePath = null;

    describe("When the file doesnt exist", () => it("returns error in the doneCallback and emits an 'error' event when the path does not exist", function() {
      let errorHandler, finishedHandler, resultsHandler;
      searcher.on('file-error', (errorHandler = jasmine.createSpy()));
      searcher.on('results-found', (resultsHandler = jasmine.createSpy()));
      searcher.searchPath(/nope/gi, '/this-does-not-exist.js', (finishedHandler = jasmine.createSpy()));

      waitsFor(() => finishedHandler.callCount > 0);

      return runs(function() {
        expect(resultsHandler).not.toHaveBeenCalled();
        expect(finishedHandler).toHaveBeenCalled();
        expect(finishedHandler.mostRecentCall.args[1].code).toBe('ENOENT');

        expect(errorHandler).toHaveBeenCalled();
        expect(errorHandler.mostRecentCall.args[0].path).toBe('/this-does-not-exist.js');
        return expect(errorHandler.mostRecentCall.args[0].code).toBe('ENOENT');
      });
    }));

    describe("With unix line endings", function() {
      beforeEach(() => filePath = path.join(rootPath, 'sample.js'));

      it("does not call results-found when there are no results found", function() {
        let finishedHandler, resultsHandler;
        searcher.on('results-found', (resultsHandler = jasmine.createSpy()));
        searcher.searchPath(/nounicorns/gi, filePath, (finishedHandler = jasmine.createSpy()));

        waitsFor(() => finishedHandler.callCount > 0);

        return runs(() => expect(resultsHandler).not.toHaveBeenCalled());
      });

      it("finds matches in a file", function() {
        let finishedHandler, resultsHandler;
        searcher.on('results-found', (resultsHandler = jasmine.createSpy()));
        searcher.searchPath(/items/gi, filePath, (finishedHandler = jasmine.createSpy()));

        waitsFor(() => finishedHandler.callCount > 0);

        return runs(function() {
          expect(resultsHandler.callCount).toBe(1);

          const results = resultsHandler.mostRecentCall.args[0];
          expect(results.filePath).toBe(filePath);
          expect(results.matches.length).toBe(6);

          expect(results.matches[0].lineText).toBe('  var sort = function(items) {  # followed by a pretty long comment which is used to check the maxLineLength');
          expect(results.matches[0].matchText).toBe('items');
          expect(results.matches[0].range).toEqual([[1, 22], [1, 27]]);
          expect(results.matches[0].leadingContextLines.length).toBe(0);
          return expect(results.matches[0].trailingContextLines.length).toBe(0);
        });
      });

      return it("finds matches with context lines in a file", function() {
        let finishedHandler, resultsHandler;
        searcher = new PathSearcher({leadingContextLineCount: 2, trailingContextLineCount: 3});
        searcher.on('results-found', (resultsHandler = jasmine.createSpy()));
        searcher.searchPath(/\)/gi, filePath, (finishedHandler = jasmine.createSpy()));

        waitsFor(() => finishedHandler.callCount > 0);

        return runs(function() {
          expect(resultsHandler.callCount).toBe(1);

          const results = resultsHandler.mostRecentCall.args[0];
          expect(results.filePath).toBe(filePath);
          expect(results.matches.length).toBe(14);

          expect(results.matches[0].lineText).toBe('var quicksort = function () {');
          expect(results.matches[0].matchText).toBe(')');
          expect(results.matches[0].range).toEqual([[0, 26], [0, 27]]);
          expect(results.matches[0].leadingContextLines.length).toBe(0);
          expect(results.matches[0].trailingContextLines.length).toBe(3);
          expect(results.matches[0].trailingContextLines[0]).toBe('  var sort = function(items) {  # followed by a pretty long comment which is used to check the maxLi');
          expect(results.matches[0].trailingContextLines[1]).toBe('    if (items.length <= 1) return items;');
          expect(results.matches[0].trailingContextLines[2]).toBe('    var pivot = items.shift(), current, left = [], right = [];');

          expect(results.matches[1].lineText).toBe('  var sort = function(items) {  # followed by a pretty long comment which is used to check the maxLineLength');
          expect(results.matches[1].matchText).toBe(')');
          expect(results.matches[1].range).toEqual([[1, 27], [1, 28]]);
          expect(results.matches[1].leadingContextLines.length).toBe(1);
          expect(results.matches[1].leadingContextLines[0]).toBe('var quicksort = function () {');
          expect(results.matches[1].trailingContextLines.length).toBe(3);
          expect(results.matches[1].trailingContextLines[0]).toBe('    if (items.length <= 1) return items;');
          expect(results.matches[1].trailingContextLines[1]).toBe('    var pivot = items.shift(), current, left = [], right = [];');
          expect(results.matches[1].trailingContextLines[2]).toBe('    while(items.length > 0) {');

          expect(results.matches[2].lineText).toBe('    if (items.length <= 1) return items;');
          expect(results.matches[2].matchText).toBe(')');
          expect(results.matches[2].range).toEqual([[2, 25], [2, 26]]);
          expect(results.matches[2].leadingContextLines.length).toBe(2);
          expect(results.matches[2].leadingContextLines[0]).toBe('var quicksort = function () {');
          expect(results.matches[2].leadingContextLines[1]).toBe('  var sort = function(items) {  # followed by a pretty long comment which is used to check the maxLi');
          expect(results.matches[2].trailingContextLines.length).toBe(3);
          expect(results.matches[2].trailingContextLines[0]).toBe('    var pivot = items.shift(), current, left = [], right = [];');
          expect(results.matches[2].trailingContextLines[1]).toBe('    while(items.length > 0) {');
          expect(results.matches[2].trailingContextLines[2]).toBe('      current = items.shift();');

          expect(results.matches[13].lineText).toBe('  return sort(Array.apply(this, arguments));');
          expect(results.matches[13].matchText).toBe(')');
          expect(results.matches[13].range).toEqual([[11, 42], [11, 43]]);
          expect(results.matches[13].leadingContextLines.length).toBe(2);
          expect(results.matches[13].leadingContextLines[0]).toBe('  };');
          expect(results.matches[13].leadingContextLines[1]).toBe('');
          expect(results.matches[13].trailingContextLines.length).toBe(1);
          return expect(results.matches[13].trailingContextLines[0]).toBe('};');
        });
      });
    });

    return describe("With windows line endings", function() {
      beforeEach(() => filePath = path.join(rootPath, 'sample-with-windows-line-endings.js'));

      return it("finds matches in a file", function() {
        let finishedHandler, resultsHandler;
        searcher.on('results-found', (resultsHandler = jasmine.createSpy()));
        searcher.searchPath(/sort/gi, filePath, (finishedHandler = jasmine.createSpy()));

        waitsFor(() => finishedHandler.callCount > 0);

        return runs(function() {
          expect(resultsHandler.callCount).toBe(1);

          const results = resultsHandler.mostRecentCall.args[0];
          expect(results.filePath).toBe(filePath);
          expect(results.matches.length).toBe(5);

          expect(results.matches[0].lineText).toBe('var quicksort = function () {');
          expect(results.matches[0].matchText).toBe('sort');
          expect(results.matches[0].range).toEqual([[0, 9], [0, 13]]);

          expect(results.matches[1].lineText).toBe('  var sort = function(items) {');
          expect(results.matches[1].matchText).toBe('sort');
          return expect(results.matches[1].range).toEqual([[1, 6], [1, 10]]);});
    });
  });
});

  return describe("searchPaths()", function() {
    let filePaths = null;

    beforeEach(function() {
      rootPath = fs.realpathSync(path.join("spec", "fixtures", "git"));
      return filePaths = [
        path.join(rootPath, 'file.txt'),
        path.join(rootPath, 'other.txt')
      ];});

    describe("when a file doesnt exist", function() {
      beforeEach(function() {
        filePaths.push('/doesnt-exist.js');
        return filePaths.push('/nope-not-this.js');
      });

      return it("calls the done callback with a list of errors", function() {
        let finishedHandler, noResultsHandler, resultsHandler;
        searcher.on('results-not-found', (noResultsHandler = jasmine.createSpy()));
        searcher.on('results-found', (resultsHandler = jasmine.createSpy()));
        searcher.searchPaths(/nounicorns/gi, filePaths, (finishedHandler = jasmine.createSpy()));

        waitsFor(() => finishedHandler.callCount > 0);

        return runs(function() {
          expect(resultsHandler).not.toHaveBeenCalled();
          expect(noResultsHandler.callCount).toBe(4);
          expect(noResultsHandler.argsForCall[0][0]).toBe(filePaths[0]);
          expect(noResultsHandler.argsForCall[1][0]).toBe(filePaths[1]);
          expect(noResultsHandler.argsForCall[1][0]).toBe(filePaths[1]);

          const errors = finishedHandler.mostRecentCall.args[1];
          expect(errors.length).toBe(2);
          return expect(errors[0].code).toBe('ENOENT');
        });
      });
    });

    it("emits results-not-found when there are no results found", function() {
      let finishedHandler, noResultsHandler, resultsHandler;
      searcher.on('results-not-found', (noResultsHandler = jasmine.createSpy()));
      searcher.on('results-found', (resultsHandler = jasmine.createSpy()));
      searcher.searchPaths(/nounicorns/gi, filePaths, (finishedHandler = jasmine.createSpy()));

      waitsFor(() => finishedHandler.callCount > 0);

      return runs(function() {
        expect(resultsHandler).not.toHaveBeenCalled();
        expect(noResultsHandler.callCount).toBe(2);
        expect(noResultsHandler.argsForCall[0][0]).toBe(filePaths[0]);
        return expect(noResultsHandler.argsForCall[1][0]).toBe(filePaths[1]);});
  });

    return it("emits results-found event for multiple paths when there are results found", function() {
      let finishedHandler, noResultsHandler, resultsHandler;
      searcher.on('results-not-found', (noResultsHandler = jasmine.createSpy()));
      searcher.on('results-found', (resultsHandler = jasmine.createSpy()));
      searcher.searchPaths(/text/gi, filePaths, (finishedHandler = jasmine.createSpy()));

      waitsFor(() => finishedHandler.callCount > 0);

      return runs(function() {
        expect(noResultsHandler).not.toHaveBeenCalled();
        expect(resultsHandler.callCount).toBe(2);
        expect(resultsHandler.argsForCall[0][0].filePath).toBe(filePaths[0]);
        expect(resultsHandler.argsForCall[1][0].filePath).toBe(filePaths[1]);

        // should have all the results as an arg in the done callback
        const results = [
          resultsHandler.argsForCall[0][0],
          resultsHandler.argsForCall[1][0]
        ];
        return expect(finishedHandler.mostRecentCall.args[0]).toEqual(results);
      });
    });
  });
});

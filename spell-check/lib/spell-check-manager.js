/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class SpellCheckerManager {
  static initClass() {
    this.prototype.checkers = [];
    this.prototype.checkerPaths = [];
    this.prototype.locales = [];
    this.prototype.localePaths = [];
    this.prototype.useLocales = false;
    this.prototype.localeCheckers = null;
    this.prototype.knownWords = [];
    this.prototype.addKnownWords = false;
    this.prototype.knownWordsChecker = null;
  }

  setGlobalArgs(data) {
    // We need underscore to do the array comparisons.
    const _ = require("underscore-plus");

    // Check to see if any values have changed. When they have, they clear out
    // the applicable checker which forces a reload.
    let removeLocaleCheckers = false;
    let removeKnownWordsChecker = false;

    if (!_.isEqual(this.locales, data.locales)) {
      // If the locales is blank, then we always create a default one. However,
      // any new data.locales will remain blank.
      if (!this.localeCheckers || ((data.locales != null ? data.locales.length : undefined) !== 0)) {
        this.locales = data.locales;
        removeLocaleCheckers = true;
      }
    }
    if (!_.isEqual(this.localePaths, data.localePaths)) {
      this.localePaths = data.localePaths;
      removeLocaleCheckers = true;
    }
    if (this.useLocales !== data.useLocales) {
      this.useLocales = data.useLocales;
      removeLocaleCheckers = true;
    }
    if (!_.isEqual(this.knownWords, data.knownWords)) {
      this.knownWords = data.knownWords;
      removeKnownWordsChecker = true;
    }
    if (this.addKnownWords !== data.addKnownWords) {
      this.addKnownWords = data.addKnownWords;
      removeKnownWordsChecker = true;
    }

    // If we made a change to the checkers, we need to remove them from the
    // system so they can be reinitialized.
    if (removeLocaleCheckers && this.localeCheckers) {
      const checkers = this.localeCheckers;
      for (let checker of Array.from(checkers)) {
        this.removeSpellChecker(checker);
      }
      this.localeCheckers = null;
    }

    if (removeKnownWordsChecker && this.knownWordsChecker) {
      this.removeSpellChecker(this.knownWordsChecker);
      return this.knownWordsChecker = null;
    }
  }

  addCheckerPath(checkerPath) {
    // Load the given path via require.
    let checker = require(checkerPath);

    // If this a ES6 module, then we need to construct it. We require
    // the coders to export it as `default` since we don't have another
    // way of figuring out which object to instantiate.
    if (checker.default) {
      checker = new checker.default();
    }

    // Add in the resulting checker.
    return this.addPluginChecker(checker);
  }

  addPluginChecker(checker) {
    // Add the spell checker to the list.
    return this.addSpellChecker(checker);
  }

  addSpellChecker(checker) {
    return this.checkers.push(checker);
  }

  removeSpellChecker(spellChecker) {
    return this.checkers = this.checkers.filter(plugin => plugin !== spellChecker);
  }

  check(args, text) {
    // Make sure our deferred initialization is done.
    this.init();

    // We need a couple packages.
    const multirange = require('multi-integer-range');

    // For every registered spellchecker, we need to find out the ranges in the
    // text that the checker confirms are correct or indicates is a misspelling.
    // We keep these as separate lists since the different checkers may indicate
    // the same range for either and we need to be able to remove confirmed words
    // from the misspelled ones.
    const correct = new multirange.MultiRange([]);
    const incorrects = [];

    const promises = [];
    for (let checker of Array.from(this.checkers)) {
      // We only care if this plugin contributes to checking spelling.
      if (!checker.isEnabled() || !checker.providesSpelling(args)) {
        continue;
      }

      // Get the possibly asynchronous results which include positive
      // (correct) and negative (incorrect) ranges. If we have an incorrect
      // range but no correct, everything not in incorrect is considered correct.
      promises.push(Promise.resolve(checker.check(args, text)));
    }

    return Promise.all(promises).then(allResults => {
      let range;
      for (let results of Array.from(allResults)) {
        if (results.invertIncorrectAsCorrect && results.incorrect) {
          // We need to add the opposite of the incorrect as correct elements in
          // the list. We do this by creating a subtraction.
          const invertedCorrect = new multirange.MultiRange([[0, text.length]]);
          const removeRange = new multirange.MultiRange([]);
          for (range of Array.from(results.incorrect)) {
            removeRange.appendRange(range.start, range.end);
          }
          invertedCorrect.subtract(removeRange);

          // Everything in `invertedCorrect` is correct, so add it directly to
          // the list.
          correct.append(invertedCorrect);
        } else if (results.correct) {
          for (range of Array.from(results.correct)) {
            correct.appendRange(range.start, range.end);
          }
        }

        if (results.incorrect) {
          const newIncorrect = new multirange.MultiRange([]);
          incorrects.push(newIncorrect);

          for (range of Array.from(results.incorrect)) {
            newIncorrect.appendRange(range.start, range.end);
          }
        }
      }

      // If we don't have any incorrect spellings, then there is nothing to worry
      // about, so just return and stop processing.
      if (incorrects.length === 0) {
        return {misspellings: []};
      }

      // Build up an intersection of all the incorrect ranges. We only treat a word
      // as being incorrect if *every* checker that provides negative values treats
      // it as incorrect. We know there are at least one item in this list, so pull
      // that out. If that is the only one, we don't have to do any additional work,
      // otherwise we compare every other one against it, removing any elements
      // that aren't an intersection which (hopefully) will produce a smaller list
      // with each iteration.
      let intersection = null;

      for (let incorrect of Array.from(incorrects)) {
        if (intersection === null) {
          intersection = incorrect;
        } else {
          intersection.append(incorrect);
        }
      }

      // If we have no intersection, then nothing to report as a problem.
      if (intersection.length === 0) {
        return {misspellings: []};
      }

      // Remove all of the confirmed correct words from the resulting incorrect
      // list. This allows us to have correct-only providers as opposed to only
      // incorrect providers.
      if (correct.ranges.length > 0) {
        intersection.subtract(correct);
      }

      // Convert the text ranges (index into the string) into Atom buffer
      // coordinates ( row and column).
      let row = 0;
      let rangeIndex = 0;
      let lineBeginIndex = 0;
      const misspellings = [];
      while ((lineBeginIndex < text.length) && (rangeIndex < intersection.ranges.length)) {
        // Figure out where the next line break is. If we hit -1, then we make sure
        // it is a higher number so our < comparisons work properly.
        let lineEndIndex = text.indexOf('\n', lineBeginIndex);
        if (lineEndIndex === -1) {
          lineEndIndex = Infinity;
        }

        // Loop through and get all the ranegs for this line.
        while (true) {
          range = intersection.ranges[rangeIndex];
          if (range && (range[0] < lineEndIndex)) {
            // Figure out the character range of this line. We need this because
            // @addMisspellings doesn't handle jumping across lines easily and the
            // use of the number ranges is inclusive.
            const lineRange = new multirange.MultiRange([]).appendRange(lineBeginIndex, lineEndIndex);
            const rangeRange = new multirange.MultiRange([]).appendRange(range[0], range[1]);
            lineRange.intersect(rangeRange);

            // The range we have here includes whitespace between two concurrent
            // tokens ("zz zz zz" shows up as a single misspelling). The original
            // version would split the example into three separate ones, so we
            // do the same thing, but only for the ranges within the line.
            this.addMisspellings(misspellings, row, lineRange.ranges[0], lineBeginIndex, text);

            // If this line is beyond the limits of our current range, we move to
            // the next one, otherwise we loop again to reuse this range against
            // the next line.
            if (lineEndIndex >= range[1]) {
              rangeIndex++;
            } else {
              break;
            }
          } else {
            break;
          }
        }

        lineBeginIndex = lineEndIndex + 1;
        row++;
      }

      // Return the resulting misspellings.
      return {misspellings};
  });
  }

  suggest(args, word) {
    // Make sure our deferred initialization is done.
    let checker, index, key, priority, suggestion;
    this.init();

    // Gather up a list of corrections and put them into a custom object that has
    // the priority of the plugin, the index in the results, and the word itself.
    // We use this to intersperse the results together to avoid having the
    // preferred answer for the second plugin below the least preferred of the
    // first.
    const suggestions = [];

    for (checker of Array.from(this.checkers)) {
      // We only care if this plugin contributes to checking to suggestions.
      if (!checker.isEnabled() || !checker.providesSuggestions(args)) {
        continue;
      }

      // Get the suggestions for this word.
      index = 0;
      priority = checker.getPriority();

      for (suggestion of Array.from(checker.suggest(args, word))) {
        suggestions.push({isSuggestion: true, priority, index: index++, suggestion, label: suggestion});
      }
    }

    // Once we have the suggestions, then sort them to intersperse the results.
    let keys = Object.keys(suggestions).sort(function(key1, key2) {
      const value1 = suggestions[key1];
      const value2 = suggestions[key2];
      const weight1 = value1.priority + value1.index;
      const weight2 = value2.priority + value2.index;

      if (weight1 !== weight2) {
        return weight1 - weight2;
      }

      return value1.suggestion.localeCompare(value2.suggestion);
    });

    // Go through the keys and build the final list of suggestions. As we go
    // through, we also want to remove duplicates.
    const results = [];
    const seen = [];
    for (key of Array.from(keys)) {
      const s = suggestions[key];
      if (seen.hasOwnProperty(s.suggestion)) {
        continue;
      }
      results.push(s);
      seen[s.suggestion] = 1;
    }

    // We also grab the "add to dictionary" listings.
    const that = this;
    keys = Object.keys(this.checkers).sort(function(key1, key2) {
      const value1 = that.checkers[key1];
      const value2 = that.checkers[key2];
      return value1.getPriority() - value2.getPriority();
    });

    for (key of Array.from(keys)) {
      // We only care if this plugin contributes to checking to suggestions.
      checker = this.checkers[key];
      if (!checker.isEnabled() || !checker.providesAdding(args)) {
        continue;
      }

      // Add all the targets to the list.
      const targets = checker.getAddingTargets(args);
      for (let target of Array.from(targets)) {
        target.plugin = checker;
        target.word = word;
        target.isSuggestion = false;
        results.push(target);
      }
    }

    // Return the resulting list of options.
    return results;
  }

  addMisspellings(misspellings, row, range, lineBeginIndex, text) {
    // Get the substring of text, if there is no space, then we can just return
    // the entire result.
    const substring = text.substring(range[0], range[1]);

    if (/\s+/.test(substring)) {
      // We have a space, to break it into individual components and push each
      // one to the misspelling list.
      const parts = substring.split(/(\s+)/);
      let substringIndex = 0;
      for (let part of Array.from(parts)) {
        if (!/\s+/.test(part)) {
          const markBeginIndex = (range[0] - lineBeginIndex) + substringIndex;
          const markEndIndex = markBeginIndex + part.length;
          misspellings.push([[row, markBeginIndex], [row, markEndIndex]]);
        }

        substringIndex += part.length;
      }

      return;
    }

    // There were no spaces, so just return the entire list.
    return misspellings.push([
      [row, range[0] - lineBeginIndex],
      [row, range[1] - lineBeginIndex]
    ]);
  }

  init() {
    // See if we need to initialize the system checkers.
    if (this.localeCheckers === null) {
      // Initialize the collection. If we aren't using any, then stop doing anything.
      this.localeCheckers = [];

      if (this.useLocales) {
        // If we have a blank location, use the default based on the process. If
        // set, then it will be the best language.
        let defaultLocale;
        if (!this.locales.length) {
          defaultLocale = process.env.LANG;
          if (defaultLocale) {
            this.locales = [defaultLocale.split('.')[0]];
          }
        }

        // If we can't figure out the language from the process, check the
        // browser. After testing this, we found that this does not reliably
        // produce a proper IEFT tag for languages; on OS X, it was providing
        // "English" which doesn't work with the locale selection. To avoid using
        // it, we use some tests to make sure it "looks like" an IEFT tag.
        if (!this.locales.length) {
          defaultLocale = navigator.language;
          if (defaultLocale && (defaultLocale.length === 5)) {
            const separatorChar = defaultLocale.charAt(2);
            if ((separatorChar === '_') || (separatorChar === '-')) {
              this.locales = [defaultLocale];
            }
          }
        }

        // If we still can't figure it out, use US English. It isn't a great
        // choice, but it is a reasonable default not to mention is can be used
        // with the fallback path of the `spellchecker` package.
        if (!this.locales.length) {
          this.locales = ['en_US'];
        }

        // Go through the new list and create new locale checkers.
        const SystemChecker = require("./system-checker");
        for (let locale of Array.from(this.locales)) {
          const checker = new SystemChecker(locale, this.localePaths);
          this.addSpellChecker(checker);
          this.localeCheckers.push(checker);
        }
      }
    }

    // See if we need to reload the known words.
    if (this.knownWordsChecker === null) {
      const KnownWordsChecker = require('./known-words-checker');
      this.knownWordsChecker = new KnownWordsChecker(this.knownWords);
      this.knownWordsChecker.enableAdd = this.addKnownWords;
      return this.addSpellChecker(this.knownWordsChecker);
    }
  }

  deactivate() {
    this.checkers = [];
    this.locales = [];
    this.localePaths = [];
    this.useLocales=  false;
    this.localeCheckers = null;
    this.knownWords = [];
    this.addKnownWords = false;
    return this.knownWordsChecker = null;
  }

  reloadLocales() {
    if (this.localeCheckers) {
      for (let localeChecker of Array.from(this.localeCheckers)) {
        this.removeSpellChecker(localeChecker);
      }
      return this.localeCheckers = null;
    }
  }

  reloadKnownWords() {
    if (this.knownWordsChecker) {
      this.removeSpellChecker(this.knownWordsChecker);
      return this.knownWordsChecker = null;
    }
  }
}
SpellCheckerManager.initClass();

const manager = new SpellCheckerManager;
module.exports = manager;

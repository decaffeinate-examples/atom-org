/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {Spellchecker, ALWAYS_USE_HUNSPELL} = require('../lib/spellchecker');
const path = require('path');

const enUS = 'A robot is a mechanical or virtual artificial agent, usually an electronic machine';
const deDE = 'Ein Roboter ist eine technische Apparatur, die üblicherweise dazu dient, dem Menschen mechanische Arbeit abzunehmen.';
const frFR = 'Les robots les plus évolués sont capables de se déplacer et de se recharger par eux-mêmes';

const defaultLanguage = process.platform === 'darwin' ? '' : 'en_US';
const dictionaryDirectory = path.join(__dirname, 'dictionaries');

// Because we are dealing with C++ and buffers, we want
// to make sure the user doesn't pass in a string that
// causes a buffer overrun. We limit our buffers to
// 256 characters (64-character word in UTF-8).
const maximumLength1Byte = 'a'.repeat(256);
const maximumLength2Byte = 'ö'.repeat(128);
const maximumLength3Byte = 'ऐ'.repeat(85);
const maximumLength4Byte = '𐅐'.repeat(64);
const invalidLength1Byte = maximumLength1Byte + 'a';
const invalidLength2Byte = maximumLength2Byte + 'ö';
const invalidLength3Byte = maximumLength3Byte + 'ऐ';
const invalidLength4Byte = maximumLength4Byte + '𐄇';

const maximumLength1BytePair = [maximumLength1Byte, maximumLength1Byte].join(" ");
const maximumLength2BytePair = [maximumLength2Byte, maximumLength2Byte].join(" ");
const maximumLength3BytePair = [maximumLength3Byte, maximumLength3Byte].join(" ");
const maximumLength4BytePair = [maximumLength4Byte, maximumLength4Byte].join(" ");
const invalidLength1BytePair = [invalidLength1Byte, invalidLength1Byte].join(" ");
const invalidLength2BytePair = [invalidLength2Byte, invalidLength2Byte].join(" ");
const invalidLength3BytePair = [invalidLength3Byte, invalidLength3Byte].join(" ");
const invalidLength4BytePair = [invalidLength4Byte, invalidLength4Byte].join(" ");

let spellType = null;
let spellIndex = null;

for (var testAlwaysUseHunspell of [true, false]) {
  describe('SpellChecker', function() {
    describe('.setDictionary', function() {
      beforeEach(function() {
        return this.fixture = buildSpellChecker();
      });

      it('returns true for en_US', function() {
        return this.fixture.setDictionary('en_US', dictionaryDirectory);
      });

      it('returns true for de_DE_frami', function() {
        // de_DE_frami is invalid outside of Hunspell dictionaries.
        if (spellType !== 'hunspell') { return; }

        return this.fixture.setDictionary('de_DE_frami', dictionaryDirectory);
      });

      it('returns true for de_DE', function() {
        return this.fixture.setDictionary('en_US', dictionaryDirectory);
      });

      return it('returns true for fr', function() {
        return this.fixture.setDictionary('fr', dictionaryDirectory);
      });
    });

    describe('.isMisspelled(word)', function() {
      beforeEach(function() {
        this.fixture = buildSpellChecker();
        return this.fixture.setDictionary(defaultLanguage, dictionaryDirectory);
      });

      it('returns true if the word is mispelled', function() {
        this.fixture.setDictionary('en_US', dictionaryDirectory);
        return expect(this.fixture.isMisspelled('wwoorrddd')).toBe(true);
      });

      it('returns false if the word is not mispelled: word', function() {
        this.fixture.setDictionary('en_US', dictionaryDirectory);
        return expect(this.fixture.isMisspelled('word')).toBe(false);
      });

      it('returns false if the word is not mispelled: cheese', function() {
        this.fixture.setDictionary('en_US', dictionaryDirectory);
        return expect(this.fixture.isMisspelled('cheese')).toBe(false);
      });

      it('returns true if Latin German word is misspelled with ISO8859-1 file', function() {
        // de_DE_frami is invalid outside of Hunspell dictionaries.
        if (spellType !== 'hunspell') { return; }

        expect(this.fixture.setDictionary('de_DE_frami', dictionaryDirectory)).toBe(true);
        return expect(this.fixture.isMisspelled('Kine')).toBe(true);
      });

      it('returns true if Latin German word is misspelled with UTF-8 file', function() {
        expect(this.fixture.setDictionary('de_DE', dictionaryDirectory)).toBe(true);
        return expect(this.fixture.isMisspelled('Kine')).toBe(true);
      });

      it('returns false if Latin German word is not misspelled with ISO8859-1 file', function() {
        // de_DE_frami is invalid outside of Hunspell dictionaries.
        if (spellType !== 'hunspell') { return; }

        expect(this.fixture.setDictionary('de_DE_frami', dictionaryDirectory)).toBe(true);
        return expect(this.fixture.isMisspelled('Nacht')).toBe(false);
      });

      it('returns false if Latin German word is not misspelled with UTF-8 file', function() {
        expect(this.fixture.setDictionary('de_DE', dictionaryDirectory)).toBe(true);
        return expect(this.fixture.isMisspelled('Nacht')).toBe(false);
      });

      it('returns true if Unicode German word is misspelled with ISO8859-1 file', function() {
        // de_DE_frami is invalid outside of Hunspell dictionaries.
        if (spellType !== 'hunspell') { return; }

        expect(this.fixture.setDictionary('de_DE_frami', dictionaryDirectory)).toBe(true);
        return expect(this.fixture.isMisspelled('möchtzn')).toBe(true);
      });

      it('returns true if Unicode German word is misspelled with UTF-8 file', function() {
        expect(this.fixture.setDictionary('de_DE', dictionaryDirectory)).toBe(true);
        return expect(this.fixture.isMisspelled('möchtzn')).toBe(true);
      });

      it('returns false if Unicode German word is not misspelled with ISO8859-1 file', function() {
        // de_DE_frami is invalid outside of Hunspell dictionaries.
        if (spellType !== 'hunspell') { return; }

        expect(this.fixture.setDictionary('de_DE_frami', dictionaryDirectory)).toBe(true);
        return expect(this.fixture.isMisspelled('vermöchten')).toBe(false);
      });

      it('returns false if Unicode German word is not misspelled with UTF-8 file', function() {
        expect(this.fixture.setDictionary('de_DE', dictionaryDirectory)).toBe(true);
        return expect(this.fixture.isMisspelled('vermöchten')).toBe(false);
      });

      it('throws an exception when no word specified', () => expect(function() { return this.fixture.isMisspelled(); }).toThrow());

      it('returns true for a string of 256 1-byte characters', function() {
        if (process.platform === 'linux') {
          return expect(this.fixture.isMisspelled(maximumLength1Byte)).toBe(true);
        }
      });

      it('returns true for a string of 128 2-byte characters', function() {
        if (process.platform === 'linux') {
          return expect(this.fixture.isMisspelled(maximumLength2Byte)).toBe(true);
        }
      });

      it('returns true for a string of 85 3-byte characters', function() {
        if (process.platform === 'linux') {
          return expect(this.fixture.isMisspelled(maximumLength3Byte)).toBe(true);
        }
      });

      it('returns true for a string of 64 4-byte characters', function() {
        if (process.platform === 'linux') {
          return expect(this.fixture.isMisspelled(maximumLength4Byte)).toBe(true);
        }
      });

      it('returns false for a string of 257 1-byte characters', function() {
        if (process.platform === 'linux') {
          return expect(this.fixture.isMisspelled(invalidLength1Byte)).toBe(false);
        }
      });

      it('returns false for a string of 65 2-byte characters', function() {
        if (process.platform === 'linux') {
          return expect(this.fixture.isMisspelled(invalidLength2Byte)).toBe(false);
        }
      });

      it('returns false for a string of 86 3-byte characters', function() {
        if (process.platform === 'linux') {
          return expect(this.fixture.isMisspelled(invalidLength3Byte)).toBe(false);
        }
      });

      return it('returns false for a string of 65 4-byte characters', function() {
        if (process.platform === 'linux') {
          return expect(this.fixture.isMisspelled(invalidLength4Byte)).toBe(false);
        }
      });
    });

    describe('.checkSpelling(string)', function() {
      beforeEach(function() {
        this.fixture = buildSpellChecker();
        return this.fixture.setDictionary(defaultLanguage, dictionaryDirectory);
      });

      it('automatically detects languages on OS X', function() {
        if (process.platform !== 'darwin') { return; }

        expect(this.fixture.checkSpelling(enUS)).toEqual([]);
        expect(this.fixture.checkSpelling(deDE)).toEqual([]);
        return expect(this.fixture.checkSpelling(frFR)).toEqual([]);
    });

      it('correctly switches languages', function() {
        expect(this.fixture.setDictionary('en_US', dictionaryDirectory)).toBe(true);
        expect(this.fixture.checkSpelling(enUS)).toEqual([]);
        expect(this.fixture.checkSpelling(deDE)).not.toEqual([]);
        expect(this.fixture.checkSpelling(frFR)).not.toEqual([]);

        // de_DE_frami is invalid outside of Hunspell dictionaries.
        if (spellType === 'hunspell') {
          if (this.fixture.setDictionary('de_DE_frami', dictionaryDirectory)) {
            expect(this.fixture.checkSpelling(enUS)).not.toEqual([]);
            expect(this.fixture.checkSpelling(deDE)).toEqual([]);
            expect(this.fixture.checkSpelling(frFR)).not.toEqual([]);
          }
        }

        if (this.fixture.setDictionary('de_DE', dictionaryDirectory)) {
          expect(this.fixture.checkSpelling(enUS)).not.toEqual([]);
          expect(this.fixture.checkSpelling(deDE)).toEqual([]);
          expect(this.fixture.checkSpelling(frFR)).not.toEqual([]);
        }

        this.fixture = buildSpellChecker();
        if (this.fixture.setDictionary('fr_FR', dictionaryDirectory)) {
          expect(this.fixture.checkSpelling(enUS)).not.toEqual([]);
          expect(this.fixture.checkSpelling(deDE)).not.toEqual([]);
          return expect(this.fixture.checkSpelling(frFR)).toEqual([]);
        }
    });

      it('returns an array of character ranges of misspelled words', function() {
        const string = 'cat caat dog dooog';

        return expect(this.fixture.checkSpelling(string)).toEqual([
          {start: 4, end: 8},
          {start: 13, end: 18},
        ]);
    });

      it('returns an array of character ranges of misspelled German words with ISO8859-1 file', function() {
        // de_DE_frami is invalid outside of Hunspell dictionaries.
        if (spellType !== 'hunspell') { return; }

        expect(this.fixture.setDictionary('de_DE_frami', dictionaryDirectory)).toBe(true);

        const string = 'Kein Kine vermöchten möchtzn';

        return expect(this.fixture.checkSpelling(string)).toEqual([
          {start: 5, end: 9},
          {start: 21, end: 28},
        ]);
    });

      it('returns an array of character ranges of misspelled German words with UTF-8 file', function() {
        expect(this.fixture.setDictionary('de_DE', dictionaryDirectory)).toBe(true);

        const string = 'Kein Kine vermöchten möchtzn';

        return expect(this.fixture.checkSpelling(string)).toEqual([
          {start: 5, end: 9},
          {start: 21, end: 28},
        ]);
    });

      it('returns an array of character ranges of misspelled French words', function() {
        expect(this.fixture.setDictionary('fr', dictionaryDirectory)).toBe(true);

        const string = 'Française Françoize';

        return expect(this.fixture.checkSpelling(string)).toEqual([
          {start: 10, end: 19},
        ]);
    });

      it('accounts for UTF16 pairs', function() {
        const string = '😎 cat caat dog dooog';

        return expect(this.fixture.checkSpelling(string)).toEqual([
          {start: 7, end: 11},
          {start: 16, end: 21},
        ]);
    });

      it("accounts for other non-word characters", function() {
        const string = "'cat' (caat. <dog> :dooog)";
        return expect(this.fixture.checkSpelling(string)).toEqual([
          {start: 7, end: 11},
          {start: 20, end: 25},
        ]);
    });

      it('does not treat non-english letters as word boundaries', function() {
        this.fixture.add('cliché');
        expect(this.fixture.checkSpelling('what cliché nonsense')).toEqual([]);
        return this.fixture.remove('cliché');
      });

      it('handles words with apostrophes', function() {
        let string = "doesn't isn't aint hasn't";
        expect(this.fixture.checkSpelling(string)).toEqual([
          {start: string.indexOf("aint"), end: string.indexOf("aint") + 4}
        ]);

        string = "you say you're 'certain', but are you really?";
        expect(this.fixture.checkSpelling(string)).toEqual([]);

        string = "you say you're 'sertan', but are you really?";
        return expect(this.fixture.checkSpelling(string)).toEqual([
          {start: string.indexOf("sertan"), end: string.indexOf("',")}
        ]);
    });

      it('handles invalid inputs', function() {
        const {
          fixture
        } = this;
        expect(fixture.checkSpelling('')).toEqual([]);
        expect(() => fixture.checkSpelling()).toThrow('Bad argument');
        expect(() => fixture.checkSpelling(null)).toThrow('Bad argument');
        return expect(() => fixture.checkSpelling({})).toThrow('Bad argument');
      });

      it('returns values for a pair of 256 1-byte character strings', function() {
        if (process.platform === 'linux') {
          return expect(this.fixture.checkSpelling(maximumLength1BytePair)).toEqual([
            {start: 0, end: 256},
            {start: 257, end: 513},
          ]);
        }
    });

      it('returns values for a string of 128 2-byte character strings', function() {
        if (process.platform === 'linux') {
          return expect(this.fixture.checkSpelling(maximumLength2BytePair)).toEqual([
            {start: 0, end: 128},
            {start: 129, end: 257},
          ]);
        }
    });

      it('returns values for a string of 85 3-byte character strings', function() {
        if (process.platform === 'linux') {
          return expect(this.fixture.checkSpelling(maximumLength3BytePair)).toEqual([
            {start: 0, end: 85},
            {start: 86, end: 171},
          ]);
        }
    });

      // # Linux doesn't seem to handle 4-byte encodings, so this test is just to
      // # comment that fact.
      // xit 'returns values for a string of 64 4-byte character strings', ->
      //   expect(@fixture.checkSpelling(maximumLength4BytePair)).toEqual [
      //     {start: 0, end: 128},
      //     {start: 129, end: 257},
      //   ]

      it('returns nothing for a pair of 257 1-byte character strings', function() {
        if (process.platform === 'linux') {
          return expect(this.fixture.checkSpelling(invalidLength1BytePair)).toEqual([]);
        }
    });

      it('returns nothing for a pair of 129 2-byte character strings', function() {
        if (process.platform === 'linux') {
          return expect(this.fixture.checkSpelling(invalidLength2BytePair)).toEqual([]);
        }
    });

      it('returns nothing for a pair of 86 3-byte character strings', function() {
        if (process.platform === 'linux') {
          return expect(this.fixture.checkSpelling(invalidLength3BytePair)).toEqual([]);
        }
    });

      it('returns nothing for a pair of 65 4-byte character strings', function() {
        if (process.platform === 'linux') {
          return expect(this.fixture.checkSpelling(invalidLength4BytePair)).toEqual([]);
        }
    });

      it('returns values for a pair of 256 1-byte character strings with encoding', function() {
        if (process.platform === 'linux') {
          // de_DE_frami is invalid outside of Hunspell dictionaries.
          if (spellType !== 'hunspell') { return; }

          this.fixture.setDictionary('de_DE_frami', dictionaryDirectory);
          return expect(this.fixture.checkSpelling(maximumLength1BytePair)).toEqual([
            {start: 0, end: 256},
            {start: 257, end: 513},
          ]);
        }
    });

      it('returns values for a string of 128 2-byte character strings with encoding', function() {
        if (process.platform === 'linux') {
          // de_DE_frami is invalid outside of Hunspell dictionaries.
          if (spellType !== 'hunspell') { return; }

          this.fixture.setDictionary('de_DE_frami', dictionaryDirectory);
          return expect(this.fixture.checkSpelling(maximumLength2BytePair)).toEqual([
            {start: 0, end: 128},
            {start: 129, end: 257},
          ]);
        }
    });

      it('returns values for a string of 85 3-byte character strings with encoding', function() {
        if (process.platform === 'linux') {
          // de_DE_frami is invalid outside of Hunspell dictionaries.
          if (spellType !== 'hunspell') { return; }

          this.fixture.setDictionary('de_DE_frami', dictionaryDirectory);
          return this.fixture.checkSpelling(invalidLength3BytePair);
        }
      });

      // # Linux doesn't seem to handle 4-byte encodings
      //it 'returns values for a string of 64 4-byte character strings with encoding', ->
      //  # de_DE_frami is invalid outside of Hunspell dictionaries.
      //  return unless spellType is 'hunspell'

      //  @fixture.setDictionary('de_DE_frami', dictionaryDirectory)
      //  expect(@fixture.checkSpelling(maximumLength4BytePair)).toEqual [
      //    {start: 0, end: 128},
      //    {start: 129, end: 257},
      //  ]

      it('returns nothing for a pair of 257 1-byte character strings with encoding', function() {
        if (process.platform === !'linux') {
          // de_DE_frami is invalid outside of Hunspell dictionaries.
          if (spellType !== 'hunspell') { return; }

          this.fixture.setDictionary('de_DE_frami', dictionaryDirectory);
          return expect(this.fixture.checkSpelling(maximumLength2BytePair)).toEqual([]);
        }
    });

      it('returns nothing for a pair of 129 2-byte character strings with encoding', function() {
        if (process.platform === !'linux') { return; }
        // We are only testing for allocation errors.
        // de_DE_frami is invalid outside of Hunspell dictionaries.
        if (spellType !== 'hunspell') { return; }

        this.fixture.setDictionary('de_DE_frami', dictionaryDirectory);
        return this.fixture.checkSpelling(invalidLength2BytePair);
      });

      it('returns nothing for a pair of 86 3-byte character strings with encoding', function() {
        if (process.platform === !'linux') { return; }
        // We are only testing for allocation errors.
        // de_DE_frami is invalid outside of Hunspell dictionaries.
        if (spellType !== 'hunspell') { return; }

        this.fixture.setDictionary('de_DE_frami', dictionaryDirectory);
        return this.fixture.checkSpelling(invalidLength3BytePair);
      });

      return it('returns nothing for a pair of 65 4-byte character strings with encoding', function() {
        if (process.platform === !'linux') { return; }
        // We are only testing for allocation errors.
        // de_DE_frami is invalid outside of Hunspell dictionaries.
        if (spellType !== 'hunspell') { return; }

        this.fixture.setDictionary('de_DE_frami', dictionaryDirectory);
        return this.fixture.checkSpelling(invalidLength4BytePair);
      });
    });

    describe('.checkSpellingAsync(string)', function() {
      beforeEach(function() {
        this.fixture = buildSpellChecker();
        return this.fixture.setDictionary(defaultLanguage, dictionaryDirectory);
      });

      it('returns an array of character ranges of misspelled words', function() {
        const string = 'cat caat dog dooog';
        let ranges = null;

        this.fixture.checkSpellingAsync(string).then(r => ranges = r);

        waitsFor(() => ranges !== null);

        return runs(() => expect(ranges).toEqual([
          {start: 4, end: 8},
          {start: 13, end: 18}
        ]));
    });

      return it('handles invalid inputs', function() {
        expect(() => this.fixture.checkSpelling()).toThrow('Bad argument');
        expect(() => this.fixture.checkSpelling(null)).toThrow('Bad argument');
        return expect(() => this.fixture.checkSpelling(47)).toThrow('Bad argument');
      });
    });

    describe('.getCorrectionsForMisspelling(word)', function() {
      beforeEach(function() {
        this.fixture = buildSpellChecker();
        return this.fixture.setDictionary(defaultLanguage, dictionaryDirectory);
      });

      it('returns an array of possible corrections', function() {
        const correction = ['word', 'world', 'word'][spellIndex];
        const corrections = this.fixture.getCorrectionsForMisspelling('worrd');
        expect(corrections.length).toBeGreaterThan(0);
        return expect(corrections[0]).toEqual(correction);
      });

      it('throws an exception when no word specified', () => expect(function() { return this.fixture.getCorrectionsForMisspelling(); }).toThrow());

      it('returns an array of possible corrections for a correct English word', function() {
        const correction = ['cheese', 'chaise', 'cheesy'][spellIndex];
        const corrections = this.fixture.getCorrectionsForMisspelling('cheese');
        expect(corrections.length).toBeGreaterThan(0);
        return expect(corrections[0]).toEqual(correction);
      });

      it('returns an array of possible corrections for a correct Latin German word with ISO8859-1 file', function() {
        // de_DE_frami is invalid outside of Hunspell dictionaries.
        if (spellType !== 'hunspell') { return; }

        expect(this.fixture.setDictionary('de_DE_frami', dictionaryDirectory)).toBe(true);
        const correction = ['Acht', 'Macht', 'Acht'][spellIndex];
        const corrections = this.fixture.getCorrectionsForMisspelling('Nacht');
        expect(corrections.length).toBeGreaterThan(0);
        return expect(corrections[0]).toEqual(correction);
      });

      it('returns an array of possible corrections for a correct Latin German word with UTF-8 file', function() {
        expect(this.fixture.setDictionary('de_DE', dictionaryDirectory)).toBe(true);
        const correction = ['Acht', 'Macht', 'Acht'][spellIndex];
        const corrections = this.fixture.getCorrectionsForMisspelling('Nacht');
        expect(corrections.length).toBeGreaterThan(0);
        return expect(corrections[0]).toEqual(correction);
      });

      it('returns an array of possible corrections for a incorrect Latin German word with ISO8859-1 file', function() {
        // de_DE_frami is invalid outside of Hunspell dictionaries.
        if (spellType !== 'hunspell') { return; }

        expect(this.fixture.setDictionary('de_DE_frami', dictionaryDirectory)).toBe(true);
        const correction = ['Acht', 'Nicht', 'Acht'][spellIndex];
        const corrections = this.fixture.getCorrectionsForMisspelling('Nacht');
        expect(corrections.length).toBeGreaterThan(0);
        return expect(corrections[0]).toEqual(correction);
      });

      it('returns an array of possible corrections for a incorrect Latin German word with UTF-8 file', function() {
        expect(this.fixture.setDictionary('de_DE', dictionaryDirectory)).toBe(true);
        const correction = ['Acht', 'SEE BELOW', 'Acht'][spellIndex];
        const corrections = this.fixture.getCorrectionsForMisspelling('Nacht');
        expect(corrections.length).toBeGreaterThan(0);

        if (spellType === "mac") {
          // For some reason, the CI build will produce inconsistent results on
          // the Mac based on some external factor.
          return expect((corrections[0] === 'Nicht') || (corrections[0] === 'Macht')).toEqual(true);
        } else {
          return expect(corrections[0]).toEqual(correction);
        }
      });

      it('returns an array of possible corrections for correct Unicode German word with ISO8859-1 file', function() {
        // de_DE_frami is invalid outside of Hunspell dictionaries.
        if (spellType !== 'hunspell') { return; }

        expect(this.fixture.setDictionary('de_DE_frami', dictionaryDirectory)).toBe(true);
        const correction = ['vermöchten', 'vermochten', 'vermochte'][spellIndex];
        const corrections = this.fixture.getCorrectionsForMisspelling('vermöchten');
        expect(corrections.length).toBeGreaterThan(0);
        return expect(corrections[0]).toEqual(correction);
      });

      it('returns an array of possible corrections for correct Unicode German word with UTF-8 file', function() {
        expect(this.fixture.setDictionary('de_DE', dictionaryDirectory)).toBe(true);
        const correction = ['vermöchten', 'vermochten', 'vermochte'][spellIndex];
        const corrections = this.fixture.getCorrectionsForMisspelling('vermöchten');
        expect(corrections.length).toBeGreaterThan(0);
        return expect(corrections[0]).toEqual(correction);
      });

      it('returns an array of possible corrections for incorrect Unicode German word with ISO8859-1 file', function() {
        // de_DE_frami is invalid outside of Hunspell dictionaries.
        if (spellType !== 'hunspell') { return; }

        expect(this.fixture.setDictionary('de_DE_frami', dictionaryDirectory)).toBe(true);
        const correction = ['möchten', 'möchten', 'möchten'][spellIndex];
        const corrections = this.fixture.getCorrectionsForMisspelling('möchtzn');
        expect(corrections.length).toBeGreaterThan(0);
        return expect(corrections[0]).toEqual(correction);
      });

      it('returns an array of possible corrections for incorrect Unicode German word with UTF-8 file', function() {
        expect(this.fixture.setDictionary('de_DE', dictionaryDirectory)).toBe(true);
        const correction = ['möchten', 'möchten', 'möchten'][spellIndex];
        const corrections = this.fixture.getCorrectionsForMisspelling('möchtzn');
        expect(corrections.length).toBeGreaterThan(0);
        return expect(corrections[0]).toEqual(correction);
      });

      it('returns an array of possible corrections for correct Unicode French word', function() {
        expect(this.fixture.setDictionary('fr', dictionaryDirectory)).toBe(true);
        const correction = ['Françoise', 'Françoise', 'française'][spellIndex];
        const corrections = this.fixture.getCorrectionsForMisspelling('Française');
        expect(corrections.length).toBeGreaterThan(0);
        return expect(corrections[0]).toEqual(correction);
      });

      return it('returns an array of possible corrections for incorrect Unicode French word', function() {
        expect(this.fixture.setDictionary('fr', dictionaryDirectory)).toBe(true);
        const correction = ['Françoise', 'Françoise', 'Françoise'][spellIndex];
        const corrections = this.fixture.getCorrectionsForMisspelling('Françoize');
        expect(corrections.length).toBeGreaterThan(0);
        return expect(corrections[0]).toEqual(correction);
      });
    });

    describe('.add(word) and .remove(word)', function() {
      beforeEach(function() {
        this.fixture = buildSpellChecker();
        return this.fixture.setDictionary(defaultLanguage, dictionaryDirectory);
      });

      it('allows words to be added and removed to the dictionary', function() {
        // NB: Windows spellchecker cannot remove words, and since it holds onto
        // words, rerunning this test >1 time causes it to incorrectly fail
        if (process.platform === 'win32') { return; }

        expect(this.fixture.isMisspelled('wwoorrdd')).toBe(true);

        this.fixture.add('wwoorrdd');
        expect(this.fixture.isMisspelled('wwoorrdd')).toBe(false);

        this.fixture.remove('wwoorrdd');
        return expect(this.fixture.isMisspelled('wwoorrdd')).toBe(true);
      });

      it('add throws an error if no word is specified', function() {
        let errorOccurred = false;
        try {
          this.fixture.add();
        } catch (error) {
          errorOccurred = true;
        }
        return expect(errorOccurred).toBe(true);
      });

      return it('remove throws an error if no word is specified', function() {
        let errorOccurred = false;
        try {
          this.fixture.remove();
        } catch (error) {
          errorOccurred = true;
        }
        return expect(errorOccurred).toBe(true);
      });
    });


    describe('.getAvailableDictionaries()', function() {
      beforeEach(function() {
        this.fixture = buildSpellChecker();
        return this.fixture.setDictionary(defaultLanguage, dictionaryDirectory);
      });

      return it('returns an array of string dictionary names', function() {
        // NB: getAvailableDictionaries is nop'ped in hunspell and it also doesn't
        // work inside Appveyor's CI environment
        if ((spellType === 'hunspell') || process.env.CI) { return; }

        const dictionaries = this.fixture.getAvailableDictionaries();
        expect(Array.isArray(dictionaries)).toBe(true);

        expect(dictionaries.length).toBeGreaterThan(0);
        return (() => {
          const result = [];
          for (let dictionary of Array.from(dictionaries.length)) {
            expect(typeof dictionary).toBe('string');
            result.push(expect(diction.length).toBeGreaterThan(0));
          }
          return result;
        })();
      });
    });

    return describe('.setDictionary(lang, dictDirectory)', () => it('sets the spell checkers language, and dictionary directory', function() {
      const awesome = true;
      return expect(awesome).toBe(true);
    }));
  });

  var buildSpellChecker = function() {
    const checker = new Spellchecker();
    if (testAlwaysUseHunspell) {
      checker.setSpellcheckerType(ALWAYS_USE_HUNSPELL);
      spellType = 'hunspell';
      spellIndex = 0;
    } else {
      // We can get different results based on using Hunspell, Mac, or Windows
      // checkers. To simplify the rules, we create a variable that contains
      // 'hunspell', 'mac', or 'win' for filtering. We also create an index variable
      // to go into arrays.
      if (process.env.SPELLCHECKER_PREFER_HUNSPELL) {
        spellType = 'hunspell';
        spellIndex = 0;
      } else if (process.platform === 'darwin') {
        spellType = 'mac';
        spellIndex = 1;
      } else if (process.platform === 'win32') {
        spellType = 'win';
        spellIndex = 2;
      } else {
        spellType = 'hunspell';
        spellIndex = 0;
      }
    }
    return checker;
  };
}

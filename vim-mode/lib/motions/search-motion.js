/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const _ = require('underscore-plus');
const {MotionWithInput} = require('./general-motions');
const SearchViewModel = require('../view-models/search-view-model');
const {Input} = require('../view-models/view-model');
const {Point, Range} = require('atom');
const settings = require('../settings');

class SearchBase extends MotionWithInput {
  constructor(editor, vimState, options) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }
      let thisFn = (() => { return this; }).toString();
      let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
      eval(`${thisName} = this;`);
    }
    this.reversed = this.reversed.bind(this);
    this.editor = editor;
    this.vimState = vimState;
    if (options == null) { options = {}; }
    super(this.editor, this.vimState);
    this.reverse = (this.initiallyReversed = false);
    if (!options.dontUpdateCurrentSearch) { this.updateCurrentSearch(); }
  }

  reversed() {
    this.initiallyReversed = (this.reverse = true);
    this.updateCurrentSearch();
    return this;
  }

  moveCursor(cursor, count) {
    if (count == null) { count = 1; }
    const ranges = this.scan(cursor);
    if (ranges.length > 0) {
      const range = ranges[(count - 1) % ranges.length];
      return cursor.setBufferPosition(range.start);
    } else {
      return atom.beep();
    }
  }

  scan(cursor) {
    if (this.input.characters === "") { return []; }

    const currentPosition = cursor.getBufferPosition();

    const [rangesBefore, rangesAfter] = Array.from([[], []]);
    this.editor.scan(this.getSearchTerm(this.input.characters), ({range}) => {
      const isBefore = this.reverse ?
        range.start.compare(currentPosition) < 0
      :
        range.start.compare(currentPosition) <= 0;

      if (isBefore) {
        return rangesBefore.push(range);
      } else {
        return rangesAfter.push(range);
      }
    });

    if (this.reverse) {
      return rangesAfter.concat(rangesBefore).reverse();
    } else {
      return rangesAfter.concat(rangesBefore);
    }
  }

  getSearchTerm(term) {
    const modifiers = {'g': true};

    if (!term.match('[A-Z]') && settings.useSmartcaseForSearch()) {
      modifiers['i'] = true;
    }

    if (term.indexOf('\\c') >= 0) {
      term = term.replace('\\c', '');
      modifiers['i'] = true;
    }

    const modFlags = Object.keys(modifiers).join('');

    try {
      return new RegExp(term, modFlags);
    } catch (error) {
      return new RegExp(_.escapeRegExp(term), modFlags);
    }
  }

  updateCurrentSearch() {
    this.vimState.globalVimState.currentSearch.reverse = this.reverse;
    return this.vimState.globalVimState.currentSearch.initiallyReversed = this.initiallyReversed;
  }

  replicateCurrentSearch() {
    this.reverse = this.vimState.globalVimState.currentSearch.reverse;
    return this.initiallyReversed = this.vimState.globalVimState.currentSearch.initiallyReversed;
  }
}

class Search extends SearchBase {
  constructor(editor, vimState) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }
      let thisFn = (() => { return this; }).toString();
      let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
      eval(`${thisName} = this;`);
    }
    this.reversed = this.reversed.bind(this);
    this.editor = editor;
    this.vimState = vimState;
    super(this.editor, this.vimState);
    this.viewModel = new SearchViewModel(this);
    this.updateViewModel();
  }

  reversed() {
    this.initiallyReversed = (this.reverse = true);
    this.updateCurrentSearch();
    this.updateViewModel();
    return this;
  }

  updateViewModel() {
    return this.viewModel.update(this.initiallyReversed);
  }
}

class SearchCurrentWord extends SearchBase {
  static initClass() {
    this.keywordRegex = null;
  }

  constructor(editor, vimState) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }
      let thisFn = (() => { return this; }).toString();
      let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
      eval(`${thisName} = this;`);
    }
    this.editor = editor;
    this.vimState = vimState;
    super(this.editor, this.vimState);

    // FIXME: This must depend on the current language
    const defaultIsKeyword = "[@a-zA-Z0-9_\-]+";
    const userIsKeyword = atom.config.get('vim-mode.iskeyword');
    this.keywordRegex = new RegExp(userIsKeyword || defaultIsKeyword);

    const searchString = this.getCurrentWordMatch();
    this.input = new Input(searchString);
    if (searchString !== this.vimState.getSearchHistoryItem()) { this.vimState.pushSearchHistory(searchString); }
  }

  getCurrentWord() {
    const cursor = this.editor.getLastCursor();
    let wordStart = cursor.getBeginningOfCurrentWordBufferPosition({wordRegex: this.keywordRegex, allowPrevious: false});
    let wordEnd   = cursor.getEndOfCurrentWordBufferPosition(({wordRegex: this.keywordRegex, allowNext: false}));
    const cursorPosition = cursor.getBufferPosition();

    if (wordEnd.column === cursorPosition.column) {
      // either we don't have a current word, or it ends on cursor, i.e. precedes it, so look for the next one
      wordEnd = cursor.getEndOfCurrentWordBufferPosition(({wordRegex: this.keywordRegex, allowNext: true}));
      if (wordEnd.row !== cursorPosition.row) { return ""; } // don't look beyond the current line

      cursor.setBufferPosition(wordEnd);
      wordStart = cursor.getBeginningOfCurrentWordBufferPosition({wordRegex: this.keywordRegex, allowPrevious: false});
    }

    cursor.setBufferPosition(wordStart);

    return this.editor.getTextInBufferRange([wordStart, wordEnd]);
  }

  cursorIsOnEOF(cursor) {
    const pos = cursor.getNextWordBoundaryBufferPosition({wordRegex: this.keywordRegex});
    const eofPos = this.editor.getEofBufferPosition();
    return (pos.row === eofPos.row) && (pos.column === eofPos.column);
  }

  getCurrentWordMatch() {
    const characters = this.getCurrentWord();
    if (characters.length > 0) {
      if (/\W/.test(characters)) { return `${characters}\\b`; } else { return `\\b${characters}\\b`; }
    } else {
      return characters;
    }
  }

  isComplete() { return true; }

  execute(count) {
    if (count == null) { count = 1; }
    if (this.input.characters.length > 0) { return super.execute(count); }
  }
}
SearchCurrentWord.initClass();

const OpenBrackets = ['(', '{', '['];
const CloseBrackets = [')', '}', ']'];
const AnyBracket = new RegExp(OpenBrackets.concat(CloseBrackets).map(_.escapeRegExp).join("|"));

class BracketMatchingMotion extends SearchBase {
  static initClass() {
    this.prototype.operatesInclusively = true;
  }

  isComplete() { return true; }

  searchForMatch(startPosition, reverse, inCharacter, outCharacter) {
    let depth = 0;
    const point = startPosition.copy();
    let lineLength = this.editor.lineTextForBufferRow(point.row).length;
    const eofPosition = this.editor.getEofBufferPosition().translate([0, 1]);
    const increment = reverse ? -1 : 1;

    while (true) {
      const character = this.characterAt(point);
      if (character === inCharacter) { depth++; }
      if (character === outCharacter) { depth--; }

      if (depth === 0) { return point; }

      point.column += increment;

      if (depth < 0) { return null; }
      if (point.isEqual([0, -1])) { return null; }
      if (point.isEqual(eofPosition)) { return null; }

      if (point.column < 0) {
        point.row--;
        lineLength = this.editor.lineTextForBufferRow(point.row).length;
        point.column = lineLength - 1;
      } else if (point.column >= lineLength) {
        point.row++;
        lineLength = this.editor.lineTextForBufferRow(point.row).length;
        point.column = 0;
      }
    }
  }

  characterAt(position) {
    return this.editor.getTextInBufferRange([position, position.translate([0, 1])]);
  }

  getSearchData(position) {
    let index;
    const character = this.characterAt(position);
    if ((index = OpenBrackets.indexOf(character)) >= 0) {
      return [character, CloseBrackets[index], false];
    } else if ((index = CloseBrackets.indexOf(character)) >= 0) {
      return [character, OpenBrackets[index], true];
    } else {
      return [];
    }
  }

  moveCursor(cursor) {
    let matchPosition;
    let startPosition = cursor.getBufferPosition();

    let [inCharacter, outCharacter, reverse] = Array.from(this.getSearchData(startPosition));

    if (inCharacter == null) {
      const restOfLine = [startPosition, [startPosition.row, Infinity]];
      this.editor.scanInBufferRange(AnyBracket, restOfLine, function({range, stop}) {
        startPosition = range.start;
        return stop();
      });
    }

    [inCharacter, outCharacter, reverse] = Array.from(this.getSearchData(startPosition));

    if (inCharacter == null) { return; }

    if (matchPosition = this.searchForMatch(startPosition, reverse, inCharacter, outCharacter)) {
      return cursor.setBufferPosition(matchPosition);
    }
  }
}
BracketMatchingMotion.initClass();

class RepeatSearch extends SearchBase {
  constructor(editor, vimState) {
    let left;
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }
      let thisFn = (() => { return this; }).toString();
      let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
      eval(`${thisName} = this;`);
    }
    this.editor = editor;
    this.vimState = vimState;
    super(this.editor, this.vimState, {dontUpdateCurrentSearch: true});
    this.input = new Input((left = this.vimState.getSearchHistoryItem(0)) != null ? left : "");
    this.replicateCurrentSearch();
  }

  isComplete() { return true; }

  reversed() {
    this.reverse = !this.initiallyReversed;
    return this;
  }
}


module.exports = {Search, SearchCurrentWord, BracketMatchingMotion, RepeatSearch};

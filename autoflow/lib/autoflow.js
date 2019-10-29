/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const _ = require('underscore-plus');

const CharacterPattern = new RegExp(`\
[\
^\\s\
]\
`);

module.exports = {
  activate() {
    return this.commandDisposable = atom.commands.add('atom-text-editor', {
      'autoflow:reflow-selection': event => {
        return this.reflowSelection(event.currentTarget.getModel());
      }
    }
    );
  },

  deactivate() {
    if (this.commandDisposable != null) {
      this.commandDisposable.dispose();
    }
    return this.commandDisposable = null;
  },

  reflowSelection(editor) {
    let range = editor.getSelectedBufferRange();
    if (range.isEmpty()) { range = editor.getCurrentParagraphBufferRange(); }
    if (range == null) { return; }

    const reflowOptions = {
        wrapColumn: this.getPreferredLineLength(editor),
        tabLength: this.getTabLength(editor)
      };
    const reflowedText = this.reflow(editor.getTextInRange(range), reflowOptions);
    return editor.getBuffer().setTextInRange(range, reflowedText);
  },

  reflow(text, {wrapColumn, tabLength}) {
    let tabLengthInSpaces;
    const paragraphs = [];
    // Convert all \r\n and \r to \n. The text buffer will normalize them later
    text = text.replace(/\r\n?/g, '\n');

    let leadingVerticalSpace = text.match(/^\s*\n/);
    if (leadingVerticalSpace) {
      text = text.substr(leadingVerticalSpace.length);
    } else {
      leadingVerticalSpace = '';
    }

    let trailingVerticalSpace = text.match(/\n\s*$/);
    if (trailingVerticalSpace) {
      text = text.substr(0, text.length - trailingVerticalSpace.length);
    } else {
      trailingVerticalSpace = '';
    }

    const paragraphBlocks = text.split(/\n\s*\n/g);
    if (tabLength) {
      tabLengthInSpaces = Array(tabLength + 1).join(' ');
    } else {
      tabLengthInSpaces = '';
    }

    for (let block of Array.from(paragraphBlocks)) {

      // TODO: this could be more language specific. Use the actual comment char.
      // Remember that `-` has to be the last character in the character class.
      let linePrefix = block.match(/^\s*(\/\/|\/\*|;;|#'|\|\|\||--|[#%*>-])?\s*/g)[0];
      let linePrefixTabExpanded = linePrefix;
      if (tabLengthInSpaces) {
        linePrefixTabExpanded = linePrefix.replace(/\t/g, tabLengthInSpaces);
      }
      let blockLines = block.split('\n');

      if (linePrefix) {
        var escapedLinePrefix = _.escapeRegExp(linePrefix);
        blockLines = blockLines.map(blockLine => blockLine.replace(new RegExp(`^${escapedLinePrefix}`), ''));
      }

      blockLines = blockLines.map(blockLine => blockLine.replace(/^\s+/, ''));

      const lines = [];
      let currentLine = [];
      let currentLineLength = linePrefixTabExpanded.length;

      const wrappedLinePrefix = linePrefix
        .replace(/^(\s*)\/\*/, '$1  ')
        .replace(/^(\s*)-(?!-)/, '$1 ');

      let firstLine = true;
      for (let segment of Array.from(this.segmentText(blockLines.join(' ')))) {
        if (this.wrapSegment(segment, currentLineLength, wrapColumn)) {

          // Independent of line prefix don't mess with it on the first line
          if (firstLine !== true) {
            // Handle C comments
            if ((linePrefix.search(/^\s*\/\*/) !== -1) || (linePrefix.search(/^\s*-(?!-)/) !== -1)) {
              linePrefix = wrappedLinePrefix;
            }
          }
          lines.push(linePrefix + currentLine.join(''));
          currentLine = [];
          currentLineLength = linePrefixTabExpanded.length;
          firstLine = false;
        }
        currentLine.push(segment);
        currentLineLength += segment.length;
      }
      lines.push(linePrefix + currentLine.join(''));

      paragraphs.push(lines.join('\n').replace(/\s+\n/g, '\n'));
    }

    return leadingVerticalSpace + paragraphs.join('\n\n') + trailingVerticalSpace;
  },

  getTabLength(editor) {
    let left;
    return (left = atom.config.get('editor.tabLength', {scope: editor.getRootScopeDescriptor()})) != null ? left : 2;
  },

  getPreferredLineLength(editor) {
    return atom.config.get('editor.preferredLineLength', {scope: editor.getRootScopeDescriptor()});
  },

  wrapSegment(segment, currentLineLength, wrapColumn) {
    return CharacterPattern.test(segment) &&
      ((currentLineLength + segment.length) > wrapColumn) &&
      ((currentLineLength > 0) || (segment.length < wrapColumn));
  },

  segmentText(text) {
    let match;
    const segments = [];
    const re = /[\s]+|[^\s]+/g;
    while ((match = re.exec(text))) { segments.push(match[0]); }
    return segments;
  }
};

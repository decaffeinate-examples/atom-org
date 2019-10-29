/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const emojiCheatSheet = require('../lib/emoji-cheat-sheet');

const packagesToTest = {
  gfm: {
    name: 'language-gfm',
    file: 'test.md'
  }
};

describe("Emojis autocompletions", function() {
  let [editor, provider] = Array.from([]);

  const getCompletions = function() {
    const cursor = editor.getLastCursor();
    const start = cursor.getBeginningOfCurrentWordBufferPosition();
    const end = cursor.getBufferPosition();
    const prefix = editor.getTextInRange([start, end]);
    const request = {
      editor,
      bufferPosition: end,
      scopeDescriptor: cursor.getScopeDescriptor(),
      prefix
    };
    return provider.getSuggestions(request);
  };

  beforeEach(function() {
    waitsForPromise(() => atom.packages.activatePackage('autocomplete-emojis'));

    runs(() => provider = atom.packages.getActivePackage('autocomplete-emojis').mainModule.getProvider());

    return waitsFor(() => Object.keys(provider.properties).length > 0);
  });

  Object.keys(packagesToTest).forEach(packageLabel => describe(`${packageLabel} files`, function() {
    beforeEach(function() {
      atom.config.set('autocomplete-emojis.enableUnicodeEmojis', true);
      atom.config.set('autocomplete-emojis.enableMarkdownEmojis', true);

      waitsForPromise(() => atom.packages.activatePackage(packagesToTest[packageLabel].name));
      waitsForPromise(() => atom.workspace.open(packagesToTest[packageLabel].file));
      return runs(() => editor = atom.workspace.getActiveTextEditor());
    });

    it("returns no completions without a prefix", function() {
      editor.setText('');
      return expect(getCompletions().length).toBe(0);
    });

    it("returns no completions with an improper prefix", function() {
      editor.setText(':');
      editor.setCursorBufferPosition([0, 0]);
      expect(getCompletions().length).toBe(0);
      editor.setCursorBufferPosition([0, 1]);
      expect(getCompletions().length).toBe(0);

      editor.setText(':*');
      editor.setCursorBufferPosition([0, 1]);
      return expect(getCompletions().length).toBe(0);
    });

    it("autocompletes emojis with a proper prefix", function() {
      editor.setText(`\
:sm\
`
      );
      editor.setCursorBufferPosition([0, 3]);
      let completions = getCompletions();
      expect(completions.length).toBe(96);
      expect(completions[ 0].text).toBe('😄');
      expect(completions[ 0].replacementPrefix).toBe(':sm');
      expect(completions[49].text).toBe(':smirk:');
      expect(completions[49].replacementPrefix).toBe(':sm');
      expect(completions[49].rightLabelHTML).toMatch(/smirk\.png/);
      expect(completions[50].text).toBe(':smile:');
      expect(completions[50].replacementPrefix).toBe(':sm');
      expect(completions[50].rightLabelHTML).toMatch(/smile\.png/);

      editor.setText(`\
:+\
`
      );
      editor.setCursorBufferPosition([0, 2]);
      completions = getCompletions();
      expect(completions.length).toBe(2);
      expect(completions[0].text).toBe('👍');
      expect(completions[0].replacementPrefix).toBe(':+');
      expect(completions[1].text).toBe(':+1:');
      expect(completions[1].replacementPrefix).toBe(':+');
      return expect(completions[1].rightLabelHTML).toMatch(/\+1\.png/);
    });

    it("autocompletes markdown emojis with '::'", function() {
      editor.setText(`\
::sm\
`
      );
      editor.setCursorBufferPosition([0, 4]);
      const completions = getCompletions();
      expect(completions.length).toBe(47);
      expect(completions[0].text).toBe(':smirk:');
      expect(completions[0].replacementPrefix).toBe('::sm');
      expect(completions[0].rightLabelHTML).toMatch(/smirk\.png/);
      expect(completions[1].text).toBe(':smile:');
      expect(completions[1].replacementPrefix).toBe('::sm');
      return expect(completions[1].rightLabelHTML).toMatch(/smile\.png/);
    });

    it("autocompletes unicode emojis with a proper prefix", function() {
      atom.config.set('autocomplete-emojis.enableUnicodeEmojis', true);
      atom.config.set('autocomplete-emojis.enableMarkdownEmojis', false);

      editor.setText(`\
:sm\
`
      );
      editor.setCursorBufferPosition([0, 3]);
      const completions = getCompletions();
      expect(completions.length).toBe(49);
      expect(completions[ 0].text).toBe('😄');
      return expect(completions[ 0].replacementPrefix).toBe(':sm');
    });

    it("autocompletes markdown emojis with a proper prefix", function() {
      atom.config.set('autocomplete-emojis.enableUnicodeEmojis', false);
      atom.config.set('autocomplete-emojis.enableMarkdownEmojis', true);

      editor.setText(`\
:sm\
`
      );
      editor.setCursorBufferPosition([0, 3]);
      const completions = getCompletions();
      expect(completions.length).toBe(47);
      expect(completions[ 0].text).toBe(':smirk:');
      return expect(completions[ 0].replacementPrefix).toBe(':sm');
    });

    return it("autocompletes no emojis", function() {
      atom.config.set('autocomplete-emojis.enableUnicodeEmojis', false);
      atom.config.set('autocomplete-emojis.enableMarkdownEmojis', false);

      editor.setText(`\
:sm\
`
      );
      editor.setCursorBufferPosition([0, 3]);
      const completions = getCompletions();
      return expect(completions.length).toBe(0);
    });
  }));

  return describe('when the autocomplete-emojis:showCheatSheet event is triggered', function() {
    let workspaceElement = null;
    beforeEach(() => workspaceElement = atom.views.getView(atom.workspace));

    return it('opens Emoji Cheat Sheet in browser', function() {
      spyOn(emojiCheatSheet, 'openUrlInBrowser');

      atom.commands.dispatch(workspaceElement, 'autocomplete-emojis:show-cheat-sheet');

      return expect(emojiCheatSheet.openUrlInBrowser).toHaveBeenCalledWith('http://www.emoji-cheat-sheet.com/');
    });
  });
});

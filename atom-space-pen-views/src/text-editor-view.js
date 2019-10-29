/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let TextEditorView;
const {View, $} = require('space-pen');

module.exports =
(TextEditorView = class TextEditorView extends View {
  // The constructor for setting up an `TextEditorView` instance.
  constructor(params) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }
      let thisFn = (() => { return this; }).toString();
      let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
      eval(`${thisName} = this;`);
    }
    if (params == null) { params = {}; }
    let {mini, placeholderText, attributes, editor} = params;
    if (attributes == null) { attributes = {}; }
    if (mini != null) { attributes['mini'] = mini; }
    if (placeholderText != null) { attributes['placeholder-text'] = placeholderText; }

    if (editor != null) {
      this.element = atom.views.getView(editor);
    } else {
      this.element = document.createElement('atom-text-editor');
    }

    for (let name in attributes) { const value = attributes[name]; this.element.setAttribute(name, value); }
    if (this.element.__spacePenView != null) {
      this.element.__spacePenView = this;
      this.element.__allowViewAccess = true;
    }

    super(...arguments);

    this.setModel(this.element.getModel());
  }

  setModel(model) {
    this.model = model;
  }

  // Public: Get the underlying editor model for this view.
  //
  // Returns a `TextEditor`
  getModel() { return this.model; }

  // Public: Get the text of the editor.
  //
  // Returns a `String`.
  getText() {
    return this.model.getText();
  }

  // Public: Set the text of the editor as a `String`.
  setText(text) {
    return this.model.setText(text);
  }

  // Public: Determine whether the editor is or contains the active element.
  //
  // Returns a `Boolean`.
  hasFocus() {
    return this.element.hasFocus();
  }
});

/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const Template = `\
<h1>Exercise the TextEditor HTML</h1>

<h2>Unconstrainred writable editor</h2>

<atom-text-editor>
  This editor
  grows
  as you
  add more
  text
</atom-text-editor>

<p>Use <code>cmd-enter</code> to confirm. Confirmed <span>0</span> times</p>

<h2>Height constrained</h2>

<atom-text-editor style="height: 100px">
  Some text
</atom-text-editor>

<p>Use <code>cmd-enter</code> to confirm. Confirmed <span>0</span> times</p>

<h2>With <code>gutter-hidden</code> attribute</h2>

<atom-text-editor gutter-hidden style="height: 100px">
  This one has no gutter
</atom-text-editor>

<p>Use <code>cmd-enter</code> to confirm. Confirmed <span>0</span> times</p>

<h2>With <code>mini</code> attribute</h2>

<atom-text-editor mini></atom-text-editor>

<p>Use <code>enter</code> to confirm. Confirmed <span>0</span> times</p>\
`;

class AtomTextEditorExerciseView extends HTMLElement {
  createdCallback() {
    this.innerHTML = Template;

    return atom.commands.add('atom-text-editor-exercise atom-text-editor', {
      'core:confirm'(event) {
        const span = this.nextSibling.nextSibling.querySelector('span');
        span.textContent = parseInt(span.textContent) + 1;
        return console.log('Confirmed', this, event, this.getModel().getText());
      }
    }
    );
  }

  getTitle() {
    return 'TextEditor Exercise';
  }
}

module.exports = document.registerElement('atom-text-editor-exercise', {prototype: AtomTextEditorExerciseView.prototype});

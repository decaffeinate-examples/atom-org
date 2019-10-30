/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ProjectRingInputView;
const { View, TextEditorView } = require('atom-space-pen-views');

module.exports =
(ProjectRingInputView = class ProjectRingInputView extends View {
	static content() {
		return this.div({class: 'project-ring-input overlay from-top'}, () => {
			return this.div({class: 'editor-container', outlet: 'editorContainer'}, () => {
				return this.subview('editor', new TextEditorView({mini: true}));
			});
		});
	}

	initialize(projectRing) {
		return this.projectRing = this.projectRing || projectRing;
	}

	attach(viewModeParameters, placeholderText, text) {
		this.viewModeParameters = viewModeParameters;
		if (!this.isInitialized) {
			atom.commands.add(this.editor[0], {
				'core:confirm': () => this.confirmed(),
				'core:cancel': () => this.destroy()
			}
			);
			this.isInitialized = true;
		}
		this.editor.find('input').off('blur');
		this.editor.getModel().setPlaceholderText(placeholderText);
		this.editor.setText(text || '');
		this.editor.getModel().selectAll();
		this.self = atom.workspace.addModalPanel({item: this});
		this.editor.focus();
		return this.editor.find('input').on('blur', () => this.destroy());
	}

	destroy() {
		this.editor.find('input').off('blur');
		return this.self.destroy();
	}

	confirmed() {
		this.destroy();
		return this.projectRing.handleProjectRingInputViewInput(this.viewModeParameters, this.editor.getText());
	}
});

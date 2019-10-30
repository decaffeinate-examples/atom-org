/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ProjectRingFileSelectView;
const { $, View } = require('atom-space-pen-views');

module.exports =
(ProjectRingFileSelectView = class ProjectRingFileSelectView extends View {
	static content() {
		return this.div({class: 'project-ring-file-select overlay from-top'}, () => {
			this.div({class: 'controls'}, () => {
				this.input({type: 'button', class: 'right confirm', value: ''});
				this.input({type: 'button', class: 'right cancel', value: 'Cancel'});
				this.input({type: 'button', class: 'left select-all', value: 'Select All'});
				return this.input({type: 'button', class: 'left deselect-all', value: 'Deselect All'});
			});
			return this.div({class: 'entries'});
		});
	}

	initialize(projectRing) {
		return this.projectRing = this.projectRing || projectRing;
	}

	getEntryView({ title, description, path }) {
		const $entry = $('<div></div>', {class: 'entry'});
		const $checkAll = $('<input />', {type: 'checkbox', 'data-path': path});

		$entry.append($('<input />', {type: 'checkbox', 'data-path': path}).on('click', function(event) {
			event.preventDefault();
			event.returnValue = false;
			const $this = $(this);
			if (!$this.is('.checked')) {
				$this.addClass('checked');
			} else {
				$this.removeClass('checked');
			}
			return event.returnValue;
		})
		);
		$entry.append($('<div></div>', {class: 'title', text: title}));
		return $entry.append($('<div></div>', {class: 'description', text: description}));
	}

	attach(viewModeParameters, items) {
		this.viewModeParameters = viewModeParameters;
		this.self = atom.workspace.addModalPanel({item: this});
		const $content = $(atom.views.getView(atom.workspace)).find('.project-ring-file-select');
		if (!this.isInitialized) {
			const $controls = $content.find('.controls');
			$controls.find('input:button.confirm').on('click', () => this.confirmed());
			$controls.find('input:button.cancel').on('click', () => this.destroy());
			$controls.find('input:button.select-all').on('click', () => this.setAllEntriesSelected(true));
			$controls.find('input:button.deselect-all').on('click', () => this.setAllEntriesSelected(false));
			this.isInitialized = true;
		}
		$content.find('.controls .confirm').val(this.viewModeParameters.confirmValue);
		const $entries = $content.find('.entries').empty();
		if (!items.length) {
			$entries.append(($('<div>There are no files available for opening.</div>')).addClass('empty'));
			return;
		}
		return (() => {
			const result = [];
			for (let { title, description, path } of Array.from(items)) {
				result.push($entries.append(this.getEntryView({title, description, path})));
			}
			return result;
		})();
	}

	destroy() {
		return this.self.destroy();
	}

	confirmed() {
		const bufferPaths = [];
		$(atom.views.getView(atom.workspace)).find('.project-ring-file-select .entries input:checkbox.checked').each((index, element) => bufferPaths.push($(element).attr('data-path')));
		this.destroy();
		return this.projectRing.handleProjectRingFileSelectViewSelection(this.viewModeParameters, bufferPaths);
	}

	setAllEntriesSelected(allSelected) {
		const $checkboxes = $(atom.views.getView(atom.workspace)).find('.project-ring-file-select .entries input:checkbox');
		if (allSelected) {
			return $checkboxes.removeClass('checked').addClass('checked');
		} else {
			return $checkboxes.removeClass('checked');
		}
	}
});

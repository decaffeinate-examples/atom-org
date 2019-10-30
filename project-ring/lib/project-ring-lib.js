/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const projectReceiverKey = Symbol('projectReceiverKey');
const workspaceReceiverKey = Symbol('workspaceReceiverKey');
const permanentEventKey = Symbol('permanentEventKey');
const onceEventKey = Symbol('onceEventKey');
const statesCacheInitializedEventKey = Symbol('statesCacheInitializedEventKey');
const changedPathsEventKey = Symbol('changedPathsEventKey');
const addedBufferEventKey = Symbol('addedBufferEventKey');
const addedTextEditorEventKey = Symbol('addedTextEditorEventKey');
const destroyedBufferEventKey = Symbol('destroyedBufferEventKey');
const savedBufferEventKey = Symbol('savedBufferEventKey');
const eventCallbacks = new Map();

const isPermanentReceiver = receiver => (receiver === projectReceiverKey) || (receiver === workspaceReceiverKey);

const initializeEventCallbacks = function() {
	let eventKey;
	eventCallbacks.set(projectReceiverKey, new Map());
	for (eventKey of [ statesCacheInitializedEventKey, changedPathsEventKey, addedBufferEventKey ]) {
		eventCallbacks.get(projectReceiverKey).set(eventKey, new Map());
		eventCallbacks.get(projectReceiverKey).get(eventKey).set(permanentEventKey, []);
		eventCallbacks.get(projectReceiverKey).get(eventKey).set(onceEventKey, []);
	}
	eventCallbacks.set(workspaceReceiverKey, new Map());
	return (() => {
		const result = [];
		for (eventKey of [ addedTextEditorEventKey ]) {
			eventCallbacks.get(workspaceReceiverKey).set(eventKey, new Map());
			eventCallbacks.get(workspaceReceiverKey).get(eventKey).set(permanentEventKey, []);
			result.push(eventCallbacks.get(workspaceReceiverKey).get(eventKey).set(onceEventKey, []));
		}
		return result;
	})();
};

const addEventCallbackReceiver = function(receiver, eventKey) {
	if (!receiver) { return; }
	if (!eventCallbacks.has(receiver)) { eventCallbacks.set(receiver, new Map()); }
	if (eventCallbacks.get(receiver).has(eventKey)) { return; }
	eventCallbacks.get(receiver).set(eventKey, new Map());
	eventCallbacks.get(receiver).get(eventKey).set(permanentEventKey, []);
	return eventCallbacks.get(receiver).get(eventKey).set(onceEventKey, []);
};

const isCallbackReceiver = function(receiver) {
	if (!eventCallbacks.has(receiver)) { return false; }
	const ekIter = eventCallbacks.get(receiver).values();
	let ek = ekIter.next();
	while (!ek.done) {
		if (ek.value.get(permanentEventKey).size || ek.value.get(onceEventKey).size) { return true; }
		ek = ekIter.next();
	}
	return false;
};

const removeEventCallbackReceiver = function(receiver, eventKey) {
	if (!receiver || !eventCallbacks.has(receiver)) { return; }
	if (typeof eventKey === 'undefined') {
		if (!isPermanentReceiver(receiver)) { return eventCallbacks.delete(receiver); }
	} else {
		if (isPermanentReceiver(receiver)) { return; }
		eventCallbacks.get(receiver).delete(eventKey);
		if (!isCallbackReceiver(receiver)) { return eventCallbacks.delete(receiver); }
	}
};

const addEventCallback = function(receiver, eventKey, once, callback) {
	if (typeof callback !== 'function') { return; }
	addEventCallbackReceiver(receiver, eventKey);
	return eventCallbacks.get(receiver).get(eventKey).get(once ? onceEventKey : permanentEventKey).push(callback);
};

const removeEventCallback = function(receiver, eventKey, callback) {
	if (!eventCallbacks.has(receiver)) { return; }
	if (typeof callback !== 'function') {
		removeEventCallbackReceiver(receiver, eventKey);
		return;
	} else {
		let e, i;
		if (!eventCallbacks.get(receiver).has(eventKey)) { return; }
		const pi = []; const oi = [];
		const iterable = eventCallbacks.get(receiver).get(eventKey).get(permanentEventKey);
		for (i = 0; i < iterable.length; i++) {
			e = iterable[i];
			if (e === callback) { pi.push(i); }
		}
		const iterable1 = eventCallbacks.get(receiver).get(eventKey).get(onceEventKey);
		for (i = 0; i < iterable1.length; i++) {
			e = iterable1[i];
			if (e === callback) { oi.push(i); }
		}
		for (i of Array.from(pi)) { eventCallbacks.get(receiver).get(eventKey).get(permanentEventKey).splice(i, 1); }
		return (() => {
			const result = [];
			for (i of Array.from(oi)) { 				result.push(eventCallbacks.get(receiver).get(eventKey).get(onceEventKey).splice(i, 1));
			}
			return result;
		})();
	}
};

const onPreSetEventHandlerFactory = (receiver, eventKey) => (function() {
    let callback;
    if (!eventCallbacks.has(receiver) || !eventCallbacks.get(receiver).has(eventKey)) { return; }
    for (callback of Array.from(eventCallbacks.get(receiver).get(eventKey).get(permanentEventKey))) {
        if (typeof callback === 'function') { callback.apply(null, arguments); }
    }
    for (callback of Array.from(eventCallbacks.get(receiver).get(eventKey).get(onceEventKey))) {
        if (typeof callback === 'function') { callback.apply(null, arguments); }
    }
    eventCallbacks.get(receiver).get(eventKey).set(onceEventKey, []);
    return removeEventCallbackReceiver(receiver, eventKey);
});

const setupPreSetEventHandling = function() {
	initializeEventCallbacks();
	atom.project.emitter.on('project-ring-states-cache-initialized', onPreSetEventHandlerFactory(projectReceiverKey, statesCacheInitializedEventKey));
	atom.project.onDidChangePaths(onPreSetEventHandlerFactory(projectReceiverKey, changedPathsEventKey));
	atom.project.onDidAddBuffer(onPreSetEventHandlerFactory(projectReceiverKey, addedBufferEventKey));
	return atom.workspace.onDidAddTextEditor(onPreSetEventHandlerFactory(workspaceReceiverKey, addedTextEditorEventKey));
};

const regExpEscapesRegExp = /[\$\^\*\(\)\[\]\{\}\|\\\.\?\+]/g;
const defaultProjectRingId = 'default';
let projectRingId = undefined;
let projectRingConfigurationWatcher = undefined;

module.exports = Object.freeze({
	//############################
	// Public Variables -- Start #
	//############################

	projectToLoadAtStartUpConfigurationKeyPath: 'project-ring.projectToLoadAtStartUp',
	defaultProjectCacheKey: '<~>',

	//##########################
	// Public Variables -- END #
	//##########################

	//###################################
	// Public Helper Functions -- Start #
	//###################################

	setProjectRingId(id) {
		return projectRingId = (id != null ? id.trim() : undefined) || defaultProjectRingId;
	},

	getProjectRingId() {
		return projectRingId || defaultProjectRingId;
	},

	stripConfigurationKeyPath(keyPath) {
		return (keyPath || '').replace(/^project-ring\./, '');
	},

	getConfigurationPath() {
		const _path = require('path');
		const path = _path.join(process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'], '.atom-project-ring');
		const _fs = require('fs');
		if (!_fs.existsSync(path)) { _fs.mkdirSync(path); }
		return path;
	},

	getConfigurationFilePath(path) {
		const _path = require('path');
		return _path.join(this.getConfigurationPath(), path);
	},

	getCSONFilePath() {
		if (!projectRingId) { return; }
		return this.getConfigurationFilePath(projectRingId + '_project_ring.cson');
	},

	getDefaultProjectSpecFilePath(_projectRingId) {
		if (!_projectRingId && !projectRingId) { return; }
		return this.getConfigurationFilePath((_projectRingId || projectRingId) + '_project_ring.default_project_spec');
	},

	getDefaultProjectToLoadAtStartUp(_projectRingId) {
		let defaultProjectToLoadAtStartUp = undefined;
		const _fs = require('fs');
		try {
			defaultProjectToLoadAtStartUp = _fs.readFileSync(this.getDefaultProjectSpecFilePath(_projectRingId), 'utf8');
		} catch (error) {
			return undefined;
		}
		return (defaultProjectToLoadAtStartUp != null ? defaultProjectToLoadAtStartUp.trim() : undefined);
	},

	setDefaultProjectToLoadAtStartUp(key, onlyUpdateSpecFile) {
		let error;
		if (typeof key !== 'string') { return; }
		if (!onlyUpdateSpecFile) {
			try {
				atom.config.set(this.projectToLoadAtStartUpConfigurationKeyPath, key);
			} catch (error1) {
				error = error1;
				return error;
			}
		}
		const defaultProjectToLoadAtStartUpFilePath = this.getDefaultProjectSpecFilePath();
		const _fs = require('fs');
		if (!key) {
			try {
				if (_fs.existsSync(defaultProjectToLoadAtStartUpFilePath)) { _fs.unlinkSync(defaultProjectToLoadAtStartUpFilePath); }
				return;
			} catch (error2) {
				error = error2;
				return error;
			}
		}
		try {
			return _fs.writeFileSync(defaultProjectToLoadAtStartUpFilePath, key, 'utf8');
		} catch (error3) {
			error = error3;
			return error;
		}
	},

	setProjectRingConfigurationWatcher(watcher) {
		projectRingConfigurationWatcher = watcher;
		return undefined;
	},

	unsetProjectRingConfigurationWatcher() {
		if (projectRingConfigurationWatcher != null) {
			projectRingConfigurationWatcher.close();
		}
		return projectRingConfigurationWatcher = undefined;
	},

	updateDefaultProjectConfiguration(selectedProject, allProjects, oldSelectedProjectCondition, oldSelectedProject) {
		let left;
		if (!selectedProject || (typeof selectedProject !== 'string')) { selectedProject = ''; }
		if (!(allProjects instanceof Array)) { allProjects = [ '' ]; }
		if (!Array.from(allProjects).includes('')) { allProjects.unshift(''); }
		allProjects = this.filterFromArray(allProjects, this.defaultProjectCacheKey);
		allProjects.sort();
		let projectKeyToLoadAtStartUp = (left = this.getDefaultProjectToLoadAtStartUp()) != null ? left : '';
		if (oldSelectedProjectCondition === true) {
			if (oldSelectedProject !== projectKeyToLoadAtStartUp) { selectedProject = projectKeyToLoadAtStartUp; }
		} else if (oldSelectedProjectCondition === false) {
			let left1;
			projectKeyToLoadAtStartUp = (left1 = this.getDefaultProjectToLoadAtStartUp()) != null ? left1 : '';
			if (oldSelectedProject === projectKeyToLoadAtStartUp) { selectedProject = projectKeyToLoadAtStartUp; }
		} else {
			selectedProject = projectKeyToLoadAtStartUp;
		}
		if (!Array.from(allProjects).includes(selectedProject)) { selectedProject = ''; }
		atom.config.setSchema( 
			this.projectToLoadAtStartUpConfigurationKeyPath,
			{ type: 'string', default: selectedProject, enum: allProjects, description: 'The project name to load at startup' });
		return this.setDefaultProjectToLoadAtStartUp(selectedProject);
	},

	openFiles(filePathSpec, newWindow) {
		filePathSpec = filePathSpec instanceof Array ? filePathSpec : [ filePathSpec ];
		newWindow = typeof newWindow === 'boolean' ? newWindow : false;
		const defer = require('q').defer();
		defer.resolve();
		let {
            promise
        } = defer;
		if (newWindow) {
			atom.open({pathsToOpen: filePathSpec, newWindow: true});
		} else {
			for (let filePath of Array.from(filePathSpec)) { promise = promise.finally(((filePath => atom.workspace.open(filePath))).bind(null, filePath)); }
		}
		return promise;
	},

	findInArray(array, value, valueModFunc, extraModFuncArgs) {
		if (!(array instanceof Array)) { return undefined; }
		const isValidFunc = typeof valueModFunc === 'function';
		extraModFuncArgs = extraModFuncArgs instanceof Array ? extraModFuncArgs : [];
		for (let val of Array.from(array)) {
			if ((isValidFunc ? valueModFunc.apply(val, extraModFuncArgs) : val) === value) { return val; }
		}
		return undefined;
	},

	filterFromArray(array, value, valueModFunc) {
		if (!(array instanceof Array)) { return array; }
		const isValidFunc = typeof valueModFunc === 'function';
		return array = array.filter(val => (isValidFunc ? valueModFunc.call(val) : val) !== value);
	},

	makeArrayElementsDistinct(array, valueModFunc) {
		if (!(array instanceof Array)) { return array; }
		const isValidFunc = typeof valueModFunc === 'function';
		const distinctElements = new Map();
		array.forEach(val => distinctElements.set((isValidFunc ? valueModFunc.call(val) : val), val));
		array = [];
		const iter = distinctElements.values();
		let iterVal = iter.next();
		while (!iterVal.done) {
			array.push(iterVal.value);
			iterVal = iter.next();
		}
		return array;
	},

	getProjectRootDirectories() {
		return atom.project.getPaths();
	},

	getProjectKey(keySpec) {
		return (keySpec != null ? keySpec.trim() : undefined);
	},

	turnToPathRegExp(path) {
		if (!path) { return ''; }
		return path.replace(regExpEscapesRegExp, match => '\\' + match);
	},

	filePathIsInProject(filePath, projectRootDirectories) {
		projectRootDirectories = projectRootDirectories instanceof Array ? projectRootDirectories : this.getProjectRootDirectories();
		for (let rootDirectory of Array.from(projectRootDirectories)) {
			if (new RegExp('^' + this.turnToPathRegExp(rootDirectory), 'i').test(filePath)) { return true; }
		}
		return false;
	},

	getTextEditorFilePaths() {
		return (atom.workspace.getTextEditors().filter(editor => editor.buffer.file)).map(editor => editor.buffer.file.path);
	},

	//#################
	// Event Handling #
	//#################

	//################################
	// ---- Event Handling - Generic #
	//################################

	setupEventHandling() { return setupPreSetEventHandling(); },

	//################################
	// ---- Event Handling - Project #
	//################################

	onChangedPaths(callback) {
		if (typeof callback !== 'function') { return; }
		return addEventCallback(projectReceiverKey, changedPathsEventKey, false, callback);
	},

	onceChangedPaths(callback) {
		if (typeof callback !== 'function') { return; }
		return addEventCallback(projectReceiverKey, changedPathsEventKey, true, callback);
	},

	onAddedBuffer(callback) {
		if (typeof callback !== 'function') { return; }
		return addEventCallback(projectReceiverKey, addedBufferEventKey, false, callback);
	},

	offAddedBuffer(callback) {
		return removeEventCallback(projectReceiverKey, addedBufferEventKey, callback);
	},

	onceAddedBuffer(callback) {
		if (typeof callback !== 'function') { return; }
		return addEventCallback(projectReceiverKey, addedBufferEventKey, true, callback);
	},

	onceStatesCacheInitialized(callback) {
		if (typeof callback !== 'function') { return; }
		return addEventCallback(projectReceiverKey, statesCacheInitializedEventKey, true, callback);
	},

	emitStatesCacheInitialized() {
		return atom.project.emitter.emit('project-ring-states-cache-initialized');
	},

	//###############################
	// ---- Event Handling - Buffer #
	//###############################

	offDestroyedBuffer(buffer, callback) {
		if (!buffer) { return; }
		return removeEventCallback(buffer, destroyedBufferEventKey, callback);
	},

	onceDestroyedBuffer(buffer, callback) {
		if (!buffer || (typeof callback !== 'function')) { return; }
		addEventCallback(buffer, destroyedBufferEventKey, true, callback);
		if (!buffer.onDidDestroyProjectRingEventSet) {
			buffer.onDidDestroy(onPreSetEventHandlerFactory(buffer, destroyedBufferEventKey));
			return buffer.onDidDestroyProjectRingEventSet = true;
		}
	},

	onceSavedBuffer(buffer, callback) {
		if (!buffer || (typeof callback !== 'function')) { return; }
		addEventCallback(buffer, savedBufferEventKey, true, callback);
		if (!buffer.onDidSaveProjectRingEventSet) {
			buffer.onDidSave(onPreSetEventHandlerFactory(buffer, savedBufferEventKey));
			return buffer.onDidSaveProjectRingEventSet = true;
		}
	},

	//##################################
	// ---- Event Handling - Workspace #
	//##################################

	onceAddedTextEditor(callback) {
		if (typeof callback !== 'function') { return; }
		return addEventCallback(workspaceReceiverKey, addedTextEditorEventKey, true, callback);
	},

	onAddedPane(callback) {
		if (typeof callback !== 'function') { return; }
		atom.workspace.paneContainer.emitter.on('did-add-pane', callback);
		if (typeof atom.workspace.paneContainer.projectRingOnAddedPaneCallback === 'function') {
			atom.workspace.paneContainer.emitter.off('did-add-pane', atom.workspace.paneContainer.projectRingOnAddedPaneCallback);
		}
		return atom.workspace.paneContainer.projectRingOnAddedPaneCallback = callback;
	},

	onDestroyedPane(callback) {
		if (typeof callback !== 'function') { return; }
		atom.workspace.paneContainer.emitter.on('did-destroy-pane', callback);
		if (typeof atom.workspace.paneContainer.projectRingOnDestroyedPaneCallback === 'function') {
			atom.workspace.paneContainer.emitter.off('did-destroy-pane', atom.workspace.paneContainer.projectRingOnDestroyedPaneCallback);
		}
		return atom.workspace.paneContainer.projectRingOnDestroyedPaneCallback = callback;
	},

	onDestroyedPaneItem(callback) {
		if (typeof callback !== 'function') { return; }
		atom.workspace.paneContainer.emitter.on('did-destroy-pane-item', callback);
		if (typeof atom.workspace.paneContainer.projectRingOnDestroyedPaneItemCallback === 'function') {
			atom.workspace.paneContainer.emitter.off('did-destroy-pane-item', atom.workspace.paneContainer.projectRingOnDestroyedPaneItemCallback);
		}
		return atom.workspace.paneContainer.projectRingOnDestroyedPaneItemCallback = callback;
	},

	offAddedPane() {
		if (typeof atom.workspace.paneContainer.projectRingOnAddedPaneCallback !== 'function') { return; }
		atom.workspace.paneContainer.emitter.off('did-add-pane', atom.workspace.paneContainer.projectRingOnAddedPaneCallback);
		return delete atom.workspace.paneContainer.projectRingOnAddedPaneCallback;
	},

	offDestroyedPane() {
		if (typeof atom.workspace.paneContainer.projectRingOnDestroyedPaneCallback !== 'function') { return; }
		atom.workspace.paneContainer.emitter.off('did-destroy-pane', atom.workspace.paneContainer.projectRingOnDestroyedPaneCallback);
		return delete atom.workspace.paneContainer.projectRingOnDestroyedPaneCallback;
	},

	offDestroyedPaneItem() {
		if (typeof atom.workspace.paneContainer.projectRingOnDestroyedPaneItemCallback !== 'function') { return; }
		atom.workspace.paneContainer.emitter.off('did-destroy-pane-item', atom.workspace.paneContainer.projectRingOnDestroyedPaneItemCallback);
		return delete atom.workspace.paneContainer.projectRingOnDestroyedPaneItemCallback;
	},

	//####################
	// Pane Manipulation #
	//####################

	getFirstNonEmptyPane() {
		return atom.workspace.getPanes().filter(pane => pane.getItems().length)[0];
	},

	getRestPanes() {
		const firstNonEmptyPane = this.getFirstNonEmptyPane();
		return atom.workspace.getPanes().filter(pane => pane !== firstNonEmptyPane);
	},

	selectFirstNonEmptyPane() {
		const firstNonEmptyPane = this.getFirstNonEmptyPane();
		if (!firstNonEmptyPane) { return undefined; }
		while (firstNonEmptyPane !== atom.workspace.getActivePane()) { atom.workspace.activateNextPane(); }
		return firstNonEmptyPane;
	},

	moveAllEditorsToFirstNonEmptyPane() {
		const firstNonEmptyPane = this.getFirstNonEmptyPane();
		return this.getRestPanes().forEach(pane => {
			return pane.getItems().forEach(item => {
				if (!item.buffer) { return; }
				if (item.buffer.file) {
					const itemBufferFilePath = item.buffer.file.path.toLowerCase();
					if (this.findInArray(firstNonEmptyPane.getItems(), itemBufferFilePath, (
						function() { return this.buffer && this.buffer.file && (this.buffer.file.path.toLowerCase() === itemBufferFilePath);
					 }))) {
						pane.removeItem(item);
						return;
					}
				}
				return pane.moveItemToPane(item, firstNonEmptyPane);
			});
		});
	},

	destroyEmptyPanes() {
		const panes = atom.workspace.getPanes();
		if (panes.length === 1) { return; }
		return panes.forEach(function(pane) {
			if (atom.workspace.getPanes().length === 1) { return; }
			if (!pane.items.length) { return pane.destroy(); }
		});
	},

	destroyRestPanes(allowEditorDestructionEvent) {
		return this.getRestPanes().forEach(function(pane) {
			pane.getItems().forEach(function(item) {
				if (!item.buffer || !item.buffer.file) { return; }
				if (!allowEditorDestructionEvent) { return item.emitter.off('did-destroy'); }
			});
			return pane.destroy();
		});
	},

	buildPanesMap(mappableFilePaths) {
		const { $ } = require('atom-space-pen-views');
		mappableFilePaths = mappableFilePaths instanceof Array ? mappableFilePaths : [];
		const panesMap = { root: {} };
		const currentNode = panesMap.root;
		const _getPaneMappableFilePaths = function($pane, mappableFilePaths) {
			const pane = atom.workspace.getPanes().filter(pane => atom.views.getView(pane) === $pane[0])[0];
			if (!pane) { return []; }
			return pane
				.getItems()
				.filter(item => item.buffer && item.buffer.file && mappableFilePaths.some(filePath => filePath === item.buffer.file.path))
				.map(textEditor => textEditor.buffer.file.path);
		};
		var _fillPanesMap = function($axis, currentNode) {
			if (!$axis.length) {
				currentNode.type = 'pane';
				currentNode.filePaths = _getPaneMappableFilePaths($('atom-pane-container > atom-pane'), mappableFilePaths);
				return;
			}
			const $axisChildren = $axis.children('atom-pane-axis, atom-pane');
			const isHorizontalAxis = $axis.is('.horizontal');
			currentNode.type = 'axis';
			currentNode.children = [];
			currentNode.orientation = isHorizontalAxis ? 'horizontal' : 'vertical';
			$axisChildren.each(function() {
				const $child = $(this);
				let flexGrow = parseFloat($child.css('flex-grow'));
				if (isNaN(flexGrow)) { flexGrow = undefined; }
				if ($child.is('atom-pane-axis')) {
					return currentNode.children.push({type: 'axis', children: [], orientation: null, flexGrow});
				} else if ($child.is('atom-pane')) {
					return currentNode.children.push({type: 'pane', filePaths: _getPaneMappableFilePaths($child, mappableFilePaths), flexGrow});
				}
			});
			return currentNode.children.forEach(function(child, index) {
				if (child.type !== 'axis') { return; }
				return _fillPanesMap($($axisChildren[index]), child);
			});
		};
		_fillPanesMap($('atom-pane-container > atom-pane-axis'), currentNode);
		return panesMap.root;
	},

	buildPanesLayout(panesMap) {
		const _openPaneFiles = pane => this.openFiles(pane.filePaths);
		if (panesMap.type === 'pane') { return _openPaneFiles(panesMap); }
		const _q = require('q');
		const { $ } = require('atom-space-pen-views');
		var _buildAxisLayout = function(axis) {
			const defer = _q.defer();
			defer.resolve();
			let {
                promise
            } = defer;
			const axisPaneCache = [];
			axis.children.forEach((child, index) => promise = promise.finally((function(axis, child, index) {
                if (index > 0) {
                    if (axis.orientation === 'horizontal') {
                        atom.workspace.getActivePane().splitRight();
                    } else {
                        atom.workspace.getActivePane().splitDown();
                    }
                }
                const $child = $(atom.views.getView(atom.workspace.getActivePane()));
                const $parent = 	$child.parent('atom-pane-axis');
                if ((typeof axis.flexGrow === 'number') && isNaN(parseFloat($parent.attr('data-project-ring-flex-grow')))) {
                    $parent.attr('data-project-ring-flex-grow', axis.flexGrow);
                }
                if ((typeof child.flexGrow === 'number') && isNaN(parseFloat($child.attr('data-project-ring-flex-grow')))) {
                    $child.attr('data-project-ring-flex-grow', child.flexGrow);
                }
                if (child.type === 'axis') {
                    axisPaneCache.push(atom.workspace.getActivePane());
                    const _defer = _q.defer();
                    _defer.resolve();
                    return _defer.promise;
                } else {
                    return _openPaneFiles(child);
                }
            }).bind(null, axis, child, index)
            ));
			axis.children.forEach(child => promise = promise.finally((function(child) {
                const _defer = _q.defer();
                _defer.resolve();
                if (child.type !== 'axis') { return _defer.promise; }
                axisPaneCache.shift().activate();
                return _buildAxisLayout(child);
            }).bind(null, child)
            ));
			return promise;
		};
		let axisLayoutBuildPromise = _buildAxisLayout(panesMap);
		return axisLayoutBuildPromise = axisLayoutBuildPromise.finally(function() {
			setTimeout((() => $('atom-pane-container > atom-pane-axis atom-pane-axis, atom-pane-container > atom-pane-axis atom-pane').each(function() {
                const flexGrowAttr = 'data-project-ring-flex-grow';
                const $this = $(this);
                const flexGrow = parseFloat($this.attr(flexGrowAttr));
                $this.removeAttr(flexGrowAttr);
                if (isNaN(flexGrow)) { return; }
                return $this.css('flex-grow', flexGrow);})), 0);
			const __defer = _q.defer();
			__defer.resolve();
			return __defer.promise;
		});
	},

	fixPanesMapFilePaths(panesMap) {
		if (!panesMap || (typeof panesMap !== 'object') || (typeof panesMap.length !== 'undefined')) { return; }
		const _fs = require('fs');
		if (panesMap.type === 'pane') {
			panesMap.filePaths = panesMap.filePaths.filter(filePath => _fs.existsSync(filePath));
			panesMap.filePaths = this.makeArrayElementsDistinct(panesMap.filePaths);
			return;
		}
		var _fixPanesAxisFilePaths = axis => {
			return axis.children.forEach(child => {
				if (child.type === 'pane') {
					child.filePaths = child.filePaths.filter(filePath => _fs.existsSync(filePath));
					return child.filePaths = this.makeArrayElementsDistinct(child.filePaths);
				} else {
					return _fixPanesAxisFilePaths(child);
				}
			});
		};
		return _fixPanesAxisFilePaths(panesMap);
	}
});

	//#################################
	// Public Helper Functions -- END #
	//#################################

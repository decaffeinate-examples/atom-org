/** @babel */
/* eslint-disable
    no-mixed-spaces-and-tabs,
    no-return-assign,
    no-sequences,
    no-tabs,
    no-undef,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS104: Avoid inline assignments
 * DS204: Change includes calls to have a more natural evaluation order
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const lib = require('./project-ring-lib')

const globals = {
  projectRingInitialized: false,
  changedPathsUpdateDelay: 250,
  failedWatchRetryTimeoutDelay: 250,
  bufferDestroyedTimeoutDelay: 250,
  statesCacheReady: false
}

module.exports = {
  config: {
    closePreviousProjectFiles: { type: 'boolean', default: true, description: 'Close the files of other projects when switching to a project' },
    filePatternToHide: { type: 'string', default: '', description: 'The pattern of file names to hide in the Tree View' },
    filePatternToExcludeFromHiding: { type: 'string', default: '', description: 'The pattern of file names to exclude from hiding' },
    keepAllOpenFilesRegardlessOfProject: { type: 'boolean', default: false, description: 'Keep any file that is opened regardless of the current project' },
    keepOutOfPathOpenFilesInCurrentProject: { type: 'boolean', default: false, description: 'Keep any file that is opened in the current project' },
    makeTheCurrentProjectTheDefaultAtStartUp: {
      type: 'boolean', default: false, description: 'Always make the currently chosen project the default at startup'
    },
    /*
		projectToLoadAtStartUp: { type: 'string', default: '', enum: [ '' ], description: 'The project name to load at startup' }
		*/
    doNotSaveAndRestoreOpenProjectFiles: {
      type: 'boolean', default: false, description: 'Do not automatically handle the save and restoration of open files for projects'
    },
    saveAndRestoreThePanesLayout: { type: 'boolean', default: false, description: 'Automatically save and restore the panes layout' },
    useFilePatternHiding: { type: 'boolean', default: false, description: 'Use file name pattern hiding' },
    useNotifications: { type: 'boolean', default: true, description: 'Use notifications for important events' }
  },

  activate (state) {
    return setTimeout(() => this.initialize(state), 0)
  },

  consumeStatusBar (statusBar) {
    if (this.statusBarTile) { return }
    const statusBarTileElement = document.createElement('div')
    statusBarTileElement.classList.add('project-ring-status-bar-tile')
    statusBarTileElement.textContent = 'Project Ring'
    this.statusBarTile = statusBar.addRightTile({ item: statusBarTileElement, priority: 0 })
    return this.statusBarTile.item.addEventListener('click', () => this.toggle())
  },

  updateStatusBar () {
    if (!this.statusBarTile) { return }
    let text = 'Project Ring'
    if (this.checkIfInProject(true)) {
      text += ' (' + this.currentProjectState.key + ')'
    }
    return this.statusBarTile.item.textContent = text
  },

  serialize () {},

  deactivate () {
    if (this.projectRingView) { this.projectRingView.destroy() }
    if (this.projectRingInputView) { this.projectRingInputView.destroy() }
    if (this.projectRingProjectSelectView) { this.projectRingProjectSelectView.destroy() }
    if (this.projectRingFileSelectView) { this.projectRingFileSelectView.destroy() }
    if (this.statusBarTile != null) {
      this.statusBarTile.destroy()
    }
    return this.statusBarTile = null
  },

  initialize (state) {
    if (globals.projectRingInitialized) { return }
    globals.projectRingInitialized = true
    this.currentlySavingConfiguration = { csonFile: false }
    lib.setupEventHandling()
    this.setupProjectRingNotification()
    this.setupAutomaticProjectFileSaving()
    this.setupAutomaticPanesLayoutSaving()
    this.setupAutomaticRootDirectoryAndTreeViewStateSaving()
    atom.config.observe('project-ring.makeTheCurrentProjectTheDefaultAtStartUp', makeTheCurrentProjectTheDefaultAtStartUp => {
      if (!makeTheCurrentProjectTheDefaultAtStartUp || !this.currentProjectState) { return }
      return lib.setDefaultProjectToLoadAtStartUp(this.currentProjectState.key)
    })
    const projectKeyToLoadAtStartUp = lib.getDefaultProjectToLoadAtStartUp(lib.getProjectRingId())
    lib.onceStatesCacheInitialized(() => {
      const defaultProjectState = this.getProjectState(lib.defaultProjectCacheKey)
      if (defaultProjectState.files.open.length) {
        const currentlyOpenFilePaths = this.getOpenFilePaths().map(openFilePath => openFilePath.toLowerCase())
        const filePathsToOpen = defaultProjectState.files.open.filter(function (filePathToOpen) {
          let needle
          return (needle = filePathToOpen.toLowerCase(), !Array.from(currentlyOpenFilePaths).includes(needle))
        })
        for (const filePath of Array.from(filePathsToOpen)) { lib.openFiles(filePath) }
      }
      return setTimeout(() => {
        atom.config.observe(lib.projectToLoadAtStartUpConfigurationKeyPath, projectToLoadAtStartUp => {
          return lib.setDefaultProjectToLoadAtStartUp(projectToLoadAtStartUp, true)
        })
        if (projectKeyToLoadAtStartUp && this.getProjectState(projectKeyToLoadAtStartUp)) { return }
        if (!this.projectLoadedByPathMatch) { return this.projectRingNotification.warn('No project has been loaded', true) }
      }
      , 0)
    })
    const treeView = atom.packages.getLoadedPackage('tree-view')
    if (treeView) {
      if (!__guard__(treeView != null ? treeView.mainModule.treeView : undefined, x => x.updateRoots)) {
        treeView.activate().then(() => {
          return setTimeout(() => {
            treeView.mainModule.createView()
            treeView.mainModule.treeView.find('.tree-view').on('click keydown', event => {
              return setTimeout(() => {
                this.add({ updateRootDirectoriesAndTreeViewStateOnly: true })
                return this.runFilePatternHiding()
              }
              , 0)
            })
            return this.setProjectRing('default', projectKeyToLoadAtStartUp)
          }
          , 0)
        })
      } else {
        treeView.mainModule.treeView.find('.tree-view').on('click keydown', event => {
          return setTimeout(() => {
            this.add({ updateRootDirectoriesAndTreeViewStateOnly: true })
            return this.runFilePatternHiding()
          }
          , 0)
        })
        this.setProjectRing('default', projectKeyToLoadAtStartUp)
      }
      atom.config.observe('project-ring.useFilePatternHiding', useFilePatternHiding => this.runFilePatternHiding(useFilePatternHiding))
      atom.config.observe('project-ring.filePatternToHide', filePatternToHide => this.runFilePatternHiding())
      atom.config.observe('project-ring.filePatternToExcludeFromHiding', filePatternToExcludeFromHiding => this.runFilePatternHiding())
    } else {
      this.setProjectRing('default', projectKeyToLoadAtStartUp)
    }
    atom.commands.add('atom-workspace', 'tree-view:toggle', () => this.runFilePatternHiding())
    atom.commands.add('atom-workspace', 'project-ring:add-project', () => this.addAs())
    atom.commands.add('atom-workspace', 'project-ring:rename-current-project', () => this.addAs(true))
    atom.commands.add('atom-workspace', 'project-ring:toggle', () => this.toggle())
    atom.commands.add('atom-workspace', 'project-ring:open-project-files', () => this.toggle(true))
    atom.commands.add('atom-workspace', 'project-ring:open-multiple-projects', () => this.openMultipleProjects())
    atom.commands.add('atom-workspace', 'project-ring:add-current-file-to-current-project', () => this.addOpenFilePathToProject(null, true))
    atom.commands.add('atom-workspace', 'project-ring:add-files-to-current-project', () => this.addFilesToProject())
    atom.commands.add('atom-workspace', 'project-ring:ban-current-file-from-current-project', () => this.banOpenFilePathFromProject())
    atom.commands.add('atom-workspace', 'project-ring:ban-files-from-current-project', () => this.banFilesFromProject())
    atom.commands.add('atom-workspace', 'project-ring:always-open-current-file', () => this.alwaysOpenFilePath())
    atom.commands.add('atom-workspace', 'project-ring:always-open-files', () => this.alwaysOpenFiles())
    atom.commands.add('atom-workspace', 'project-ring:unload-current-project', () => this.unloadCurrentProject())
    atom.commands.add('atom-workspace', 'project-ring:delete-current-project', () => this.deleteCurrentProject())
    atom.commands.add('atom-workspace', 'project-ring:delete-project-ring', () => this.deleteProjectRing())
    atom.commands.add('atom-workspace', 'project-ring:edit-key-bindings', () => this.editKeyBindings())
    return atom.commands.add('atom-workspace', 'project-ring:close-project-unrelated-files', () => this.closeProjectUnrelatedFiles())
  },

  setupProjectRingNotification () {
    this.projectRingNotification = new (require('./project-ring-notification'))()
    return atom.config.observe('project-ring.useNotifications', useNotifications => { return this.projectRingNotification.isEnabled = useNotifications })
  },

  setupAutomaticProjectFileSaving () {
    return atom.config.observe('project-ring.doNotSaveAndRestoreOpenProjectFiles', doNotSaveAndRestoreOpenProjectFiles => {
      if (doNotSaveAndRestoreOpenProjectFiles) {
        lib.offAddedBuffer()
        atom.project.buffers.forEach(buffer => lib.offDestroyedBuffer(buffer))
        if (!this.currentProjectState) { return }
        this.currentProjectState.files.open = []
        return this.saveProjectRing()
      } else {
        const onBufferDestroyedProjectRingEventHandlerFactory = bufferDestroyed => {
          return () => {
            if (!bufferDestroyed.file) { return }
            return setTimeout(() => {
              if (bufferDestroyed.projectRingFSWatcher) { bufferDestroyed.projectRingFSWatcher.close() }
              const bufferDestroyedPathProxy = bufferDestroyed.file.path.toLowerCase()
              const defaultProjectState = this.getProjectState(lib.defaultProjectCacheKey)
              if (!defaultProjectState) { return }
              if (lib.findInArray(defaultProjectState.files.open, bufferDestroyedPathProxy, String.prototype.toLowerCase)) {
                defaultProjectState.files.open =
									lib.filterFromArray(defaultProjectState.files.open, bufferDestroyedPathProxy, String.prototype.toLowerCase)
                this.saveProjectRing()
                return
              }
              if (!this.checkIfInProject()) { return }
              if (lib.findInArray(this.currentProjectState.files.open, bufferDestroyedPathProxy, String.prototype.toLowerCase)) {
                this.currentProjectState.files.open =
									lib.filterFromArray(this.currentProjectState.files.open, bufferDestroyedPathProxy, String.prototype.toLowerCase)
                return this.mapPanesLayout(() => this.saveProjectRing())
              }
            }
            , globals.bufferDestroyedTimeoutDelay)
          }
        }
        atom.project.buffers.forEach(buffer => {
          lib.offDestroyedBuffer(buffer)
          return lib.onceDestroyedBuffer(buffer, onBufferDestroyedProjectRingEventHandlerFactory(buffer))
        })
        const onAddedBufferDoSetup = (openProjectBuffer, deferedManualSetup) => {
          if (!deferedManualSetup) { lib.offDestroyedBuffer(openProjectBuffer) }
          lib.onceDestroyedBuffer(openProjectBuffer, onBufferDestroyedProjectRingEventHandlerFactory(openProjectBuffer))
          let openProjectBufferFilePath = openProjectBuffer.file.path
          const _fs = require('fs')
          if (_fs.existsSync(openProjectBufferFilePath)) {
            openProjectBuffer.projectRingFSWatcher = _fs.watch(openProjectBufferFilePath, (event, filename) => {
              if (event !== 'rename') { return }
              const affectedProjectKeys = this.filterProjectRingFilePaths()
              if (Array.from(affectedProjectKeys).includes(lib.defaultProjectCacheKey)) {
                if (!this.fixOpenFilesToCurrentProjectAssociations()) { openProjectBuffer.projectRingFSWatcher.close() }
                this.projectRingNotification.warn('File "' + openProjectBufferFilePath + '" has been removed from the list of files to always open')
              } else if (!this.fixOpenFilesToCurrentProjectAssociations()) {
                openProjectBuffer.projectRingFSWatcher.close()
                if (this.checkIfInProject() && lib.findInArray(this.currentProjectState.files.open, openProjectBufferFilePath.toLowerCase(), String.prototype.toLowerCase)) {
                  this.projectRingNotification.warn('File "' + openProjectBufferFilePath + '" has been removed from the current project')
                }
              }
              return openProjectBufferFilePath = openProjectBuffer.file.path
            })
          }
          if (atom.config.get('project-ring.keepAllOpenFilesRegardlessOfProject')) {
            this.alwaysOpenFilePath(openProjectBuffer.file.path, true)
            return
          }
          if
          (!atom.config.get('project-ring.keepOutOfPathOpenFilesInCurrentProject') &&
						!lib.filePathIsInProject(openProjectBuffer.file.path)) { return }
          if (!deferedManualSetup) {
            return this.addOpenFilePathToProject(openProjectBuffer.file.path)
          } else {
            return this.addOpenFilePathToProject(openProjectBuffer.file.path, true, true)
          }
        }
        return lib.onAddedBuffer(openProjectBuffer => {
          if (openProjectBuffer.file) {
            return onAddedBufferDoSetup(openProjectBuffer, false)
          } else {
            return lib.onceSavedBuffer(openProjectBuffer, () => onAddedBufferDoSetup(openProjectBuffer, true))
          }
        })
      }
    })
  },

  setupAutomaticPanesLayoutSaving () {
    return atom.config.observe('project-ring.saveAndRestoreThePanesLayout', saveAndRestoreThePanesLayout => {
      const { $ } = require('atom-space-pen-views')
      const setTabBarHandlers = () => {
        return setTimeout(() => {
          return $('.tab-bar').off('drop.project-ring').on('drop.project-ring', () => setTimeout(() => this.add({ updateOpenFilePathPositionsOnly: true }), 0))
        }
        , 0)
      }
      const setPaneResizeHandleHandlers = () => {
        return setTimeout(() => {
          $(window).off('mouseup.project-ring-on-pane-resize mouseleave.project-ring-on-pane-resize')
          return $('atom-pane-container atom-pane-resize-handle')
            .off('mousedown.project-ring dblclick.project-ring')
            .on('mousedown.project-ring', () => {
              return $(window).one('mouseup.project-ring-on-pane-resize mouseleave.project-ring-on-pane-resize', () => {
                $(window).off('mouseup.project-ring-on-pane-resize mouseleave.project-ring-on-pane-resize')
                return this.mapPanesLayout(() => this.saveProjectRing())
              })
            })
            .on('dblclick.project-ring', () => this.mapPanesLayout(() => this.saveProjectRing()))
        }
        , 0)
      }
      const onPanesLayoutChanged = () => {
        return this.mapPanesLayout(() => {
          this.saveProjectRing()
          setTabBarHandlers()
          return setPaneResizeHandleHandlers()
        })
      }
      if (saveAndRestoreThePanesLayout) {
        lib.onAddedPane(onPanesLayoutChanged)
        lib.onDestroyedPane(onPanesLayoutChanged)
        lib.onDestroyedPaneItem(onPanesLayoutChanged)
        onPanesLayoutChanged()
      } else {
        lib.offAddedPane()
        lib.offDestroyedPane()
        lib.offDestroyedPaneItem()
        if (this.statesCache) { for (const key of Array.from(Object.keys(this.statesCache))) { delete this.statesCache[key].panesMap } }
        this.saveProjectRing()
      }
      return setTabBarHandlers()
    })
  },

  setupAutomaticRootDirectoryAndTreeViewStateSaving () {
    return lib.onChangedPaths(rootDirectories => {
      return setTimeout(() => {
        if (!this.checkIfInProject() || !!this.currentlySettingProjectRootDirectories) { return }
        this.add({ updateRootDirectoriesAndTreeViewStateOnly: true })
        return this.runFilePatternHiding()
      }
      , globals.changedPathsUpdateDelay)
    })
  },

  runFilePatternHiding (useFilePatternHiding) {
    return setTimeout(() => {
      let left
      useFilePatternHiding =
				typeof useFilePatternHiding !== 'undefined' ? useFilePatternHiding : atom.config.get('project-ring.useFilePatternHiding')
      const entries = (left = __guard__(__guard__(atom.packages.getLoadedPackage('tree-view'), x1 => x1.mainModule.treeView), x => x.find('.tree-view > .directory > .entries')
        .find('.directory, .file'))) != null ? left : []
      if (!entries.length) { return }
      const { $ } = require('atom-space-pen-views')
      if (useFilePatternHiding) {
        let error
        let filePattern = atom.config.get('project-ring.filePatternToHide')
        if (filePattern && !/^\s*$/.test(filePattern)) {
          try {
            filePattern = new RegExp(filePattern, 'i')
          } catch (error1) {
            error = error1
            filePattern = null
          }
        } else {
          filePattern = null
        }
        if (!filePattern) {
          this.runFilePatternHiding(false)
          return
        }
        let reverseFilePattern = atom.config.get('project-ring.filePatternToExcludeFromHiding')
        if (reverseFilePattern && !/^\s*$/.test(reverseFilePattern)) {
          try {
            reverseFilePattern = new RegExp(reverseFilePattern, 'i')
          } catch (error2) {
            error = error2
            reverseFilePattern = null
          }
        } else {
          reverseFilePattern = null
        }
        return entries.each(function () {
          const $$ = $(this)
          const $fileMetadata = $$.find('.name')
          const filePath = $fileMetadata.attr('data-path').replace(/\\/g, '/')
          if (filePattern.test(filePath) && !(reverseFilePattern && reverseFilePattern.test(filePath))) {
            return $$.removeAttr('data-project-ring-filtered').attr('data-project-ring-filtered', 'true').css('display', 'none')
          } else {
            return $$.removeAttr('data-project-ring-filtered').css('display', '')
          }
        })
      } else {
        return (entries.filter(function () { return $(this).attr('data-project-ring-filtered') === 'true' })).each(function () {
          return $(this).removeAttr('data-project-ring-filtered').css('display', '')
        })
      }
    }
    , 0)
  },

  setProjectState (cacheKey, projectState) {
    if ((typeof cacheKey !== 'string') || (typeof projectState !== 'object')) { return }
    if (atom.config.get('project-ring.doNotSaveAndRestoreOpenProjectFiles')) {
      projectState.files.open = []
      projectState.files.banned = []
    }
    if (typeof this.statesCache !== 'object') { this.statesCache = {} }
    return this.statesCache[lib.getProjectKey(cacheKey)] = projectState
  },

  getProjectState (cacheKey) {
    if (!globals.statesCacheReady) { return undefined }
    return this.statesCache[lib.getProjectKey(cacheKey)]
  },

  unsetProjectState (cacheKey) {
    if (((typeof cacheKey !== 'string') && (cacheKey !== null)) || (typeof this.statesCache !== 'object')) { return }
    return delete this.statesCache[lib.getProjectKey(cacheKey)]
  },

  setCurrentProjectState (projectState) {
    this.currentProjectState = projectState
    return this.updateStatusBar()
  },

  watchProjectRingConfiguration (watch) {
    clearTimeout(this.watchProjectRingConfiguration.clearFailedWatchRetryTimeoutId)
    if (!lib.getProjectRingId()) { return }
    if (watch) {
      const csonFilePath = lib.getCSONFilePath()
      const _fs = require('fs')
      if (!csonFilePath || !_fs.existsSync(csonFilePath)) {
        this.watchProjectRingConfiguration.clearFailedWatchRetryTimeoutId = setTimeout(() => this.watchProjectRingConfiguration(true), globals.failedWatchRetryTimeoutDelay)
        return
      }
      return lib.setProjectRingConfigurationWatcher(_fs.watch(csonFilePath, (event, filename) => {
        if (this.currentlySavingConfiguration.csonFile) {
          this.currentlySavingConfiguration.csonFile = false
          return
        }
        return this.setProjectRing(lib.getProjectRingId(), undefined, true)
      })
      )
    } else {
      return lib.unsetProjectRingConfigurationWatcher()
    }
  },

  setProjectRing (id, projectKeyToLoad, fromConfigWatchCallback) {
    this.watchProjectRingConfiguration(false)
    const validConfigurationOptions = Object.keys(this.config)
    validConfigurationOptions.push(lib.stripConfigurationKeyPath(lib.projectToLoadAtStartUpConfigurationKeyPath))
    let configurationChanged = false
    const projectRingConfigurationSettings = atom.config.settings['project-ring'] || {}
    for (const configurationOption of Array.from(Object.keys(projectRingConfigurationSettings))) {
      if (Array.from(validConfigurationOptions).includes(configurationOption)) { continue }
      delete projectRingConfigurationSettings[configurationOption]
      configurationChanged = true
    }
    if (configurationChanged) { atom.config.save() }
    lib.setProjectRingId(id)
    this.loadProjectRing(projectKeyToLoad, fromConfigWatchCallback)
    return this.watchProjectRingConfiguration(true)
  },

  filterProjectRingFilePaths () {
    if (!globals.statesCacheReady) { return }
    const _fs = require('fs')
    const statesCacheKeysFixed = []
    for (const key of Array.from(Object.keys(this.statesCache))) {
      let statesCacheHasBeenFixed = false
      const projectState = this.getProjectState(key)
      const rootDirectories = projectState.rootDirectories.filter(rootDirectory => _fs.existsSync(rootDirectory))
      if (rootDirectories.length !== projectState.rootDirectories.length) {
        projectState.rootDirectories = rootDirectories
        statesCacheHasBeenFixed = true
      }
      const openFilePaths = projectState.files.open.filter(openFilePath => _fs.existsSync(openFilePath))
      if (openFilePaths.length !== projectState.files.open.length) {
        projectState.files.open = openFilePaths
        statesCacheHasBeenFixed = true
      }
      const bannedFilePaths = projectState.files.banned.filter(bannedFilePath => _fs.existsSync(bannedFilePath))
      if (bannedFilePaths.length !== projectState.files.banned.length) {
        projectState.files.banned = bannedFilePaths
        statesCacheHasBeenFixed = true
      }
      if (statesCacheHasBeenFixed) { statesCacheKeysFixed.push(key) }
    }
    if (statesCacheKeysFixed.length) { this.saveProjectRing() }
    return statesCacheKeysFixed
  },

  loadProjectRing (projectKeyToLoad, fromConfigWatchCallback) {
    globals.statesCacheReady = false
    const currentProjectStateKey = this.currentProjectState != null ? this.currentProjectState.key : undefined
    this.setCurrentProjectState(undefined)
    if (!lib.getProjectRingId()) { return }
    const csonFilePath = lib.getCSONFilePath()
    if (!csonFilePath) { return }
    const defaultProjectState = {
      key: lib.defaultProjectCacheKey,
      isDefault: true,
      rootDirectories: [],
      files: { open: [], banned: [] },
      treeViewState: null
    }
    const _fs = require('fs')
    if (!_fs.existsSync(csonFilePath) || (_fs.statSync(csonFilePath).size === 0)) {
      this.setProjectState(lib.defaultProjectCacheKey, defaultProjectState)
      globals.statesCacheReady = true
      this.saveProjectRing()
      globals.statesCacheReady = false
    }
    try {
      let key
      const _cson = require('season')
      const currentFilesToAlwaysOpen = __guard__(this.statesCache != null ? this.statesCache[lib.defaultProjectCacheKey] : undefined, x => x.files.open)
      let configRead = false
      while (!configRead) {
        this.statesCache = _cson.readFileSync(csonFilePath)
        if (!this.statesCache) { continue }
        configRead = true
      }
      globals.statesCacheReady = true
      let projectToLoad
      if (!fromConfigWatchCallback) {
        this.filterProjectRingFilePaths()
        const rootDirectoriesSpec = atom.project.getPaths().map(path => path.toLowerCase().trim()).sort().join('')
        if (rootDirectoriesSpec) {
          for (key of Array.from(Object.keys(this.statesCache))) {
            if (key === lib.defaultProjectCacheKey) { continue }
            if (rootDirectoriesSpec === this.getProjectState(key).rootDirectories.map(path => path.toLowerCase().trim()).sort().join('')) {
              projectKeyToLoad = key
              this.projectLoadedByPathMatch = true
              break
            }
          }
        }
        projectToLoad = this.getProjectState(projectKeyToLoad)
      } else if (currentFilesToAlwaysOpen && currentFilesToAlwaysOpen.length) {
        const filesToResetToAlwaysOpen = atom.workspace.getTextEditors().filter(textEditor => textEditor.buffer.file).map(textEditor => textEditor.buffer.file.path)
          .filter(textEditorPath => {
            const textEditorPathProxy = textEditorPath.toLowerCase()
            return lib.findInArray(currentFilesToAlwaysOpen, textEditorPathProxy, String.prototype.toLowerCase) &&
						!lib.findInArray(this.getProjectState(lib.defaultProjectCacheKey).files.open, textEditorPathProxy, String.prototype.toLowerCase)
          })
        if (filesToResetToAlwaysOpen.length) {
          this.getProjectState(lib.defaultProjectCacheKey).files.open = this.getProjectState(lib.defaultProjectCacheKey).files.open.concat(filesToResetToAlwaysOpen)
          this.saveProjectRing()
        }
      }
      if (projectToLoad && !projectToLoad.isDefault) {
        setTimeout(() => {
          this.processProjectRingViewProjectSelection({ projectState: this.getProjectState(projectToLoad.key) })
          return this.runFilePatternHiding()
        }
        , 0)
      }
    } catch (error) {
      this.projectRingNotification.alert('Could not load the project ring data for id: "' + lib.getProjectRingId() + '" (' + error + ')')
      return
    }
    if (!this.getProjectState(lib.defaultProjectCacheKey)) { this.setProjectState(lib.defaultProjectCacheKey, defaultProjectState) }
    if (currentProjectStateKey) { this.setCurrentProjectState(this.getProjectState(currentProjectStateKey)) }
    lib.updateDefaultProjectConfiguration(projectKeyToLoad, Object.keys(this.statesCache))
    return lib.emitStatesCacheInitialized()
  },

  saveProjectRing () {
    if (!lib.getProjectRingId() || !globals.statesCacheReady || !this.statesCache) { return }
    const csonFilePath = lib.getCSONFilePath()
    if (!csonFilePath) { return }
    try {
      this.currentlySavingConfiguration.csonFile = true
      const _cson = require('season')
      return _cson.writeFileSync(csonFilePath, this.statesCache)
    } catch (error) {
      this.currentlySavingConfiguration.csonFile = false
      this.projectRingNotification.alert('Could not save the project ring data for id: "' + lib.getProjectRingId() + '" (' + error + ')')
    }
  },

  loadProjectRingView () {
    if (!this.projectRingView) { return this.projectRingView = new (require('./project-ring-view'))(this) }
  },

  loadProjectRingInputView () {
    if (!this.projectRingInputView) { return this.projectRingInputView = new (require('./project-ring-input-view'))(this) }
  },

  loadProjectRingProjectSelectView () {
    if (!this.projectRingProjectSelectView) { return this.projectRingProjectSelectView = new (require('./project-ring-project-select-view'))(this) }
  },

  loadProjectRingFileSelectView () {
    if (!this.projectRingFileSelectView) { return this.projectRingFileSelectView = new (require('./project-ring-file-select-view'))(this) }
  },

  getOpenFilePaths () {
    if (!atom.config.get('project-ring.doNotSaveAndRestoreOpenProjectFiles')) { return lib.getTextEditorFilePaths() }
    return []
  },

  checkIfInProject (omitNotification) {
    if (!globals.statesCacheReady) { return undefined }
    if (!this.currentProjectState && (!(omitNotification != null ? omitNotification : true))) {
      this.projectRingNotification.alert('No project has been loaded')
    }
    return this.currentProjectState
  },

  addOpenFilePathToProject (openFilePathToAdd, manually, omitNotification) {
    if (!this.checkIfInProject(!manually || omitNotification)) { return }
    const deferedAddition = !!(openFilePathToAdd && !manually)
    if (!openFilePathToAdd) { openFilePathToAdd = __guard__(__guard__(atom.workspace.getActiveTextEditor(), x1 => x1.buffer.file), x => x.path) }
    if (!openFilePathToAdd) { return }
    openFilePathToAdd = openFilePathToAdd.toLowerCase()
    const defaultProjectState = this.getProjectState(lib.defaultProjectCacheKey)
    if
    (lib.findInArray(this.currentProjectState.files.open, openFilePathToAdd, String.prototype.toLowerCase) ||
			(!manually &&
			 lib.findInArray(this.currentProjectState.files.banned, openFilePathToAdd, String.prototype.toLowerCase))) { return }
    if (manually) {
      defaultProjectState.files.open =
				lib.filterFromArray(defaultProjectState.files.open, openFilePathToAdd, String.prototype.toLowerCase)
    }
    if (!lib.findInArray(this.currentProjectState.files.open, openFilePathToAdd, String.prototype.toLowerCase)) {
      const onceAddedTextEditorHandler = () => {
        return setTimeout(() => {
          this.currentProjectState.files.banned =
						lib.filterFromArray(this.currentProjectState.files.banned, openFilePathToAdd, String.prototype.toLowerCase)
          const newOpenFilePaths = this.getOpenFilePaths().filter(openFilePathInAll => {
            return (openFilePathInAll.toLowerCase() === openFilePathToAdd) ||
						lib.findInArray(this.currentProjectState.files.open, openFilePathInAll.toLowerCase(), String.prototype.toLowerCase)
          })
          this.currentProjectState.files.open = newOpenFilePaths
          this.mapPanesLayout(() => this.saveProjectRing())
          if (manually && ((typeof omitNotification === 'undefined') || !omitNotification)) {
            return this.projectRingNotification.notify(
              'File "' + require('path').basename(openFilePathToAdd) + '" has been added to project "' + this.currentProjectState.key + '"')
          }
        }
        , 0)
      }
      if (deferedAddition) {
        return lib.onceAddedTextEditor(onceAddedTextEditorHandler)
      } else {
        return onceAddedTextEditorHandler()
      }
    }
  },

  banOpenFilePathFromProject (openFilePathToBan) {
    if (!this.checkIfInProject(false)) { return }
    if (!openFilePathToBan) { openFilePathToBan = __guard__(__guard__(atom.workspace.getActiveTextEditor(), x1 => x1.buffer.file), x => x.path) }
    if (!openFilePathToBan) { return }
    const openFilePathToBanProxy = openFilePathToBan.toLowerCase()
    if (!lib.findInArray(this.currentProjectState.files.banned, openFilePathToBanProxy, String.prototype.toLowerCase)) {
      this.currentProjectState.files.open =
				lib.filterFromArray(this.currentProjectState.files.open, openFilePathToBanProxy, String.prototype.toLowerCase)
      this.currentProjectState.files.banned.push(openFilePathToBan)
      this.mapPanesLayout(() => this.saveProjectRing())
      return this.projectRingNotification.notify(
        'File "' + require('path').basename(openFilePathToBan) + '" has been banned from project "' + this.currentProjectState.key + '"')
    }
  },

  alwaysOpenFilePath (filePathToAlwaysOpen, omitNotification) {
    if (!filePathToAlwaysOpen) { filePathToAlwaysOpen = __guard__(__guard__(atom.workspace.getActiveTextEditor(), x1 => x1.buffer.file), x => x.path) }
    const filePathToAlwaysOpenProxy = filePathToAlwaysOpen != null ? filePathToAlwaysOpen.toLowerCase() : undefined
    const defaultProjectState = this.getProjectState(lib.defaultProjectCacheKey)
    if
    (!filePathToAlwaysOpen ||
			!!lib.findInArray(defaultProjectState.files.open, filePathToAlwaysOpenProxy, String.prototype.toLowerCase)) { return }
    for (const stateKey of Array.from(Object.keys(this.statesCache))) {
      const projectState = this.getProjectState(stateKey)
      if (projectState.isDefault) { continue }
      projectState.files.open =
				lib.filterFromArray(projectState.files.open, filePathToAlwaysOpenProxy, String.prototype.toLowerCase)
    }
    defaultProjectState.files.open.push(filePathToAlwaysOpen)
    this.mapPanesLayout(() => this.saveProjectRing())
    if (omitNotification != null ? omitNotification : true) {
      return this.projectRingNotification.notify('File "' + require('path').basename(filePathToAlwaysOpen) + '" has been marked to always open')
    }
  },

  add (options) {
    options = options || {}
    if (this.projectRingView) { this.projectRingView.destroy() }
    const treeViewState = __guard__(atom.packages.getLoadedPackage('tree-view'), x => x.serialize()) || null
    if (options.updateRootDirectoriesAndTreeViewStateOnly) {
      if (!this.checkIfInProject()) { return }
      this.currentProjectState.rootDirectories = lib.getProjectRootDirectories()
      this.currentProjectState.treeViewState = treeViewState
      this.saveProjectRing()
      this.fixOpenFilesToCurrentProjectAssociations()
      return
    }
    if (options.updateOpenFilePathPositionsOnly) {
      if (!this.checkIfInProject()) { return }
      const currentProjectOpenFilePaths = this.currentProjectState.files.open.map(openFilePath => openFilePath.toLowerCase())
      this.currentProjectState.files.open = this.getOpenFilePaths().filter(function (openFilePath) {
        let needle
        return (needle = openFilePath.toLowerCase(), Array.from(currentProjectOpenFilePaths).includes(needle))
      })
      this.mapPanesLayout(() => this.saveProjectRing())
      return
    }
    let key = lib.getProjectKey(options.key || (this.currentProjectState != null ? this.currentProjectState.key : undefined) || 'Project')
    if (key.length > 100) { key = '...' + key.substr(key.length - 97) }
    if (!this.currentProjectState) {
      let needle
      let salt = 0
      let keyTemp = key
      while ((needle = keyTemp, Array.from(Object.keys(this.statesCache)).includes(needle))) {
        keyTemp = key + (++salt).toString()
      }
      key = keyTemp
    }
    const projectKeyToLoadAtStartUp = lib.getDefaultProjectToLoadAtStartUp() || ''
    if
    (this.currentProjectState &&
			(key !== this.currentProjectState.key) &&
			(key.toLowerCase() === projectKeyToLoadAtStartUp.toLowerCase())) {
      lib.setDefaultProjectToLoadAtStartUp(key)
    }
    if (options.renameOnly) {
      if (!this.checkIfInProject(false)) { return }
      if (this.currentProjectState) {
        const oldKey = this.currentProjectState.key
        this.currentProjectState.key = key
        this.unsetProjectState(oldKey)
        this.setProjectState(key, this.currentProjectState)
        this.saveProjectRing()
        lib.updateDefaultProjectConfiguration(key, Object.keys(this.statesCache), true, oldKey)
        this.projectRingNotification.notify('Project "' + oldKey + '" is now known as "' + key + '"')
      }
      return
    }
    const filePathsToAlwaysOpen = this.getProjectState(lib.defaultProjectCacheKey).files.open.map(openFilePath => openFilePath.toLowerCase())
    this.setCurrentProjectState({
      key,
      isDefault: false,
      rootDirectories: lib.getProjectRootDirectories(),
      files: {
        open: this.getOpenFilePaths().filter(function (openFilePath) {
          let needle1
          return (needle1 = openFilePath.toLowerCase(), !Array.from(filePathsToAlwaysOpen).includes(needle1))
        }),
        banned: []
      },
      treeViewState
    })
    this.setProjectState(key, this.currentProjectState)
    this.mapPanesLayout(() => this.saveProjectRing())
    lib.updateDefaultProjectConfiguration(key, Object.keys(this.statesCache), true, key)
    return this.projectRingNotification.notify('Project "' + key + '" has been created/updated')
  },

  addAs (renameOnly) {
    if (renameOnly && !this.checkIfInProject(false)) { return }
    this.loadProjectRingInputView()
    if (!this.projectRingInputView.isVisible()) {
      let key
      if (this.currentProjectState) {
        ({
          key
        } = this.currentProjectState)
      } else { key = undefined }
      return this.projectRingInputView.attach({ viewMode: 'project', renameOnly }, 'Project name', key)
    }
  },

  mapPanesLayout (callback) {
    if (!this.checkIfInProject() || !atom.config.get('project-ring.saveAndRestoreThePanesLayout') || !!this.currentlyChangingPanesLayout) {
      if (typeof callback === 'function') { callback() }
      return
    }
    return setTimeout(() => {
      this.currentProjectState.panesMap = lib.buildPanesMap(this.currentProjectState.files.open)
      if (typeof callback === 'function') { return callback() }
    }
    , 0)
  },

  toggle (openProjectFilesOnly) {
    if (!globals.statesCacheReady) { return }
    let deleteKeyBinding = lib.findInArray(atom.keymaps.getKeyBindings(), 'project-ring:add', function () { return this.command })
    if (deleteKeyBinding) {
      deleteKeyBinding =
			' (delete selected: ' + deleteKeyBinding.keystrokes.split(/\s+/)[0].replace(/-[^-]+$/, '-') + 'delete)'
    } else { deleteKeyBinding = '' }
    if (this.projectRingView && this.projectRingView.isVisible()) {
      return this.projectRingView.destroy()
    } else {
      this.loadProjectRingView()
      return this.projectRingView.attach({
        viewMode: 'project',
        currentItem: this.checkIfInProject(),
        openProjectFilesOnly,
        placeholderText:
					!openProjectFilesOnly
					  ? 'Load project...' + deleteKeyBinding
					  : 'Load files only...' + deleteKeyBinding
      }, this.statesCache, 'key')
    }
  },

  openMultipleProjects () {
    if (!globals.statesCacheReady) { return }
    this.loadProjectRingProjectSelectView()
    if (!this.projectRingProjectSelectView.isVisible()) {
      const projectKeysToOfferForOpening = []
      Object.keys(this.statesCache).forEach(key => {
        const currentProjectState = this.checkIfInProject()
        if ((key === lib.defaultProjectCacheKey) || (currentProjectState && (key === currentProjectState.key))) { return }
        return projectKeysToOfferForOpening.push(key)
      })
      return this.projectRingProjectSelectView.attach({ viewMode: 'open', confirmValue: 'Open' }, projectKeysToOfferForOpening.sort())
    }
  },

  addFilesToProject () {
    if (!this.checkIfInProject(false)) { return }
    this.loadProjectRingFileSelectView()
    if (!this.projectRingFileSelectView.isVisible()) {
      const fileSpecsToOfferForAddition = []
      const openFilesOfCurrentProject = this.currentProjectState.files.open.map(openFilePath => openFilePath.toLowerCase())
      Object.keys(this.statesCache).filter(key => {
        return !this.getProjectState(key).isDefault &&
				(key !== this.currentProjectState.key)
      }).forEach(key => {
        const projectState = this.getProjectState(key)
        return projectState.files.open.filter(function (openFilePath) {
          const openFilePathProxy = openFilePath.toLowerCase()
          return !Array.from(openFilesOfCurrentProject).includes(openFilePathProxy) &&
					!lib.findInArray(fileSpecsToOfferForAddition, openFilePathProxy, function () { return this.path.toLowerCase() })
        }).forEach(openFilePath => {
          let description = openFilePath
          if (description.length > 40) {
            description = '...' + description.substr(description.length - 37)
          }
          return fileSpecsToOfferForAddition.push({ title: key, description, path: openFilePath })
        })
      })
      atom.project.buffers.filter(function (buffer) {
        const filePathProxy = buffer.file != null ? buffer.file.path.toLowerCase() : undefined
        return buffer.file &&
				!Array.from(openFilesOfCurrentProject).includes(filePathProxy) &&
				!lib.findInArray(fileSpecsToOfferForAddition, filePathProxy, function () { return this.path.toLowerCase() })
      }).forEach(function (buffer) {
        let description = buffer.file.path
        if (description.length > 40) { description = '...' + description.substr(description.length - 37) }
        return fileSpecsToOfferForAddition.push({ title: 'Not In Project', description, path: buffer.file.path })
      })
      fileSpecsToOfferForAddition.sort(function (bufferPathSpec1, bufferPathSpec2) {
        if ((bufferPathSpec1.title === 'Not In Project') && (bufferPathSpec2.title === 'Not In Project')) {
          return bufferPathSpec1.title.toLowerCase() <= bufferPathSpec2.title.toLowerCase()
        }
        if (bufferPathSpec1.title === 'Not In Project') { return true }
        if (bufferPathSpec2.title === 'Not in Project') { return false }
        return bufferPathSpec1.title.toLowerCase() <= bufferPathSpec2.title.toLowerCase()
      })
      return this.projectRingFileSelectView.attach({ viewMode: 'add', confirmValue: 'Add' }, fileSpecsToOfferForAddition)
    }
  },

  fixOpenFilesToCurrentProjectAssociations () {
    if (!this.checkIfInProject() || !!atom.config.get('project-ring.doNotSaveAndRestoreOpenProjectFiles')) { return false }
    const filePathsToAlwaysOpen = this.getProjectState(lib.defaultProjectCacheKey).files.open.map(openFilePath => openFilePath.toLowerCase())
    let projectRelatedFilePaths = {}
    Object.keys(this.statesCache).filter(key => key !== lib.defaultProjectCacheKey).forEach(key => {
      return this.getProjectState(key).files.open.forEach(openFilePath => projectRelatedFilePaths[openFilePath.toLowerCase()] = null)
    })
    projectRelatedFilePaths = Object.keys(projectRelatedFilePaths)
    let associationsFixed = false
    atom.project.buffers.filter(buffer => {
      const bufferPath = buffer.file != null ? buffer.file.path.toLowerCase() : undefined
      return bufferPath &&
			!Array.from(filePathsToAlwaysOpen).includes(bufferPath) &&
			!Array.from(projectRelatedFilePaths).includes(bufferPath) &&
			!lib.findInArray(this.currentProjectState.files.banned, bufferPath, String.prototype.toLowerCase)
    }).forEach(buffer => {
      const bufferFilePathProxy = buffer.file.path.toLowerCase()
      if (lib.filePathIsInProject(bufferFilePathProxy)) {
        this.addOpenFilePathToProject(buffer.file.path, true, true)
        return associationsFixed = true
      }
    })
    /*
		currentProjectRelatedFilePaths = @currentProjectState.files.open.map (filePath) -> filePath.toLowerCase()
		currentProjectRelatedFilePaths.forEach (filePath) =>
			unless lib.filePathIsInProject filePath, @currentProjectState.rootDirectories
				@currentProjectState.files.open = lib.filterFromArray @currentProjectState.files.open, filePath.toLowerCase(), String.prototype.toLowerCase
		@saveProjectRing() if @currentProjectState.files.open.length isnt currentProjectRelatedFilePaths.length
		*/
    if (associationsFixed) { this.saveProjectRing() }
    return associationsFixed
  },

  banFilesFromProject () {
    if (!this.checkIfInProject(false)) { return }
    this.loadProjectRingFileSelectView()
    if (!this.projectRingFileSelectView.isVisible()) {
      const filePathsToOfferForBanning = []
      atom.project.buffers.filter(buffer => buffer.file &&
            !lib.findInArray(filePathsToOfferForBanning, buffer.file.path.toLowerCase(), function () { return this.path.toLowerCase() })).forEach(function (buffer) {
        let description = buffer.file.path
        if (description.length > 40) { description = '...' + description.substr(description.length - 37) }
        return filePathsToOfferForBanning.push({ title: require('path').basename(buffer.file.path, { description, path: buffer.file.path }) })
      })
      filePathsToOfferForBanning.sort()
      return this.projectRingFileSelectView.attach({ viewMode: 'ban', confirmValue: 'Ban' }, filePathsToOfferForBanning)
    }
  },

  alwaysOpenFiles () {
    if (!this.checkIfInProject(false)) { return }
    this.loadProjectRingFileSelectView()
    if (!this.projectRingFileSelectView.isVisible()) {
      const filePathsToOfferForAlwaysOpening = []
      atom.project.buffers.filter(buffer => buffer.file &&
            !lib.findInArray(filePathsToOfferForAlwaysOpening, buffer.file.path.toLowerCase(), function () { return this.path.toLowerCase() })).forEach(function (buffer) {
        let description = buffer.file.path
        if (description.length > 40) { description = '...' + description.substr(description.length - 37) }
        return filePathsToOfferForAlwaysOpening.push({
          title: require('path').basename(buffer.file.path),
          description,
          path: buffer.file.path
        })
      })
      filePathsToOfferForAlwaysOpening.sort()
      return this.projectRingFileSelectView.attach({ viewMode: 'always-open', confirmValue: 'Always Open' }, filePathsToOfferForAlwaysOpening)
    }
  },

  unloadCurrentProject (doNotShowNotification, doNotAffectAtom) {
    if (!this.checkIfInProject(false)) { return }
    if (this.projectRingView) { this.projectRingView.destroy() }
    if (!doNotAffectAtom) {
      try {
        __guardMethod__(__guard__(__guard__(atom.packages.getLoadedPackage('tree-view'), x1 => x1.mainModule), x => x.treeView), 'detach', o => o.detach())
      } catch (error) {}
      this.currentlySettingProjectRootDirectories = true
      atom.project.rootDirectories.filter(rootDirectory => rootDirectory.projectRingFSWatcher).forEach(rootDirectory => rootDirectory.projectRingFSWatcher.close())
      atom.project.setPaths([])
      this.currentlySettingProjectRootDirectories = false
    }
    this.setCurrentProjectState(undefined)
    if (!doNotShowNotification) { return this.projectRingNotification.warn('No project has been loaded', true) }
  },

  deleteCurrentProject () {
    if (this.projectRingView) { this.projectRingView.destroy() }
    if (!this.currentProjectState) { return }
    const {
      key
    } = this.currentProjectState
    this.setCurrentProjectState(undefined)
    if (key) { this.unsetProjectState(key) }
    this.saveProjectRing()
    lib.updateDefaultProjectConfiguration('', Object.keys(this.statesCache), true, key)
    return this.projectRingNotification.notify('Project "' + key + '" has been deleted')
  },

  deleteProjectRing () {
    if (!lib.getProjectRingId() || !!/^\s*$/.test(lib.getProjectRingId())) { return }
    if (this.projectRingView) { this.projectRingView.destroy() }
    const csonFilePath = lib.getCSONFilePath()
    const _fs = require('fs')
    if (_fs.existsSync(csonFilePath)) { _fs.unlinkSync(csonFilePath) }
    this.setProjectRing('default')
    this.setCurrentProjectState(undefined)
    lib.updateDefaultProjectConfiguration('', [''])
    return this.projectRingNotification.notify('All project ring data has been deleted')
  },

  handleProjectRingViewKeydown (keydownEvent, viewModeParameters, selectedItem) {
    if (!keydownEvent || !selectedItem) { return }
    if
    ((viewModeParameters.viewMode === 'project') &&
			keydownEvent.altKey &&
			keydownEvent.shiftKey) {
      switch (keydownEvent.which) {
        case 8: return this.processProjectRingViewProjectDeletion(selectedItem.data) // alt-shift-backspace
        case 85: return this.unloadCurrentProject()
      }
    }
  }, // alt-shift-u

  processProjectRingViewProjectDeletion (projectState) {
    if (!projectState || !this.statesCache) { return }
    projectState = this.getProjectState(projectState.key)
    if (!projectState) { return }
    if (this.projectRingView) { this.projectRingView.destroy() }
    if (projectState.key === (this.currentProjectState != null ? this.currentProjectState.key : undefined)) {
      this.setCurrentProjectState(undefined)
    }
    this.unsetProjectState(projectState.key)
    this.saveProjectRing()
    lib.updateDefaultProjectConfiguration('', Object.keys(this.statesCache), true, projectState.key)
    return this.projectRingNotification.notify('Project "' + projectState.key + '" has been deleted')
  },

  handleProjectRingViewSelection (viewModeParameters, data) {
    switch (viewModeParameters.viewMode) {
      case 'project':
        if (!data.openInNewWindow) {
          return this.processProjectRingViewProjectSelection({ projectState: data.projectState, openProjectFilesOnly: viewModeParameters.openProjectFilesOnly })
        } else {
          return this.processProjectRingProjectSelectViewSelection([data.projectState.key], 'open')
        }
      default: break
    }
  },

  closeProjectBuffersOnBufferCreate () {
    const filePathsToAlwaysOpen = this.getProjectState(lib.defaultProjectCacheKey).files.open.map(openFilePath => openFilePath.toLowerCase())
    let projectRelatedBufferPaths = {}
    Object.keys(this.statesCache).filter(key => key !== lib.defaultProjectCacheKey).forEach(key => {
      return this.getProjectState(key).files.open.forEach(openFilePath => projectRelatedBufferPaths[openFilePath.toLowerCase()] = null)
    })
    projectRelatedBufferPaths = Object.keys(projectRelatedBufferPaths)
    const projectUnrelatedBufferPaths = []
    atom.project.buffers.filter(buffer => buffer.file).forEach(buffer => {
      const bufferFilePathProxy = buffer.file.path.toLowerCase()
      if (!Array.from(projectRelatedBufferPaths).includes(bufferFilePathProxy)) { return projectUnrelatedBufferPaths.push(bufferFilePathProxy) }
    })
    return atom.project.buffers.filter(function (buffer) {
      const bufferPath = buffer.file != null ? buffer.file.path.toLowerCase() : undefined
      return bufferPath &&
			!Array.from(filePathsToAlwaysOpen).includes(bufferPath) &&
			!Array.from(projectUnrelatedBufferPaths).includes(bufferPath)
    }).forEach(function (buffer) {
      lib.offDestroyedBuffer(buffer)
      lib.onceSavedBuffer(buffer, () => buffer.destroy())
      return buffer.save()
    })
  },

  processProjectRingViewProjectSelection (options) {
    options = options || {}
    if (!this.getProjectState(options.projectState != null ? options.projectState.key : undefined)) { return }
    const usePanesMap = !options.openProjectFilesOnly && atom.config.get('project-ring.saveAndRestoreThePanesLayout')
    if (usePanesMap) { this.currentlyChangingPanesLayout = true }
    let _fs = require('fs')
    options.projectState.rootDirectories = options.projectState.rootDirectories.filter(filePath => _fs.existsSync(filePath))
    options.projectState.files.open = options.projectState.files.open.filter(filePath => _fs.existsSync(filePath))
    options.projectState.files.open = lib.makeArrayElementsDistinct(options.projectState.files.open)
    options.projectState.files.banned = options.projectState.files.banned.filter(filePath => _fs.existsSync(filePath))
    options.projectState.files.banned = lib.makeArrayElementsDistinct(options.projectState.files.banned)
    lib.fixPanesMapFilePaths(options.projectState.panesMap)
    if (usePanesMap && !options.projectState.panesMap) { options.projectState.panesMap = { type: 'pane', filePaths: options.projectState.files.open } }
    this.saveProjectRing()
    const oldKey = this.currentProjectState != null ? this.currentProjectState.key : undefined
    if (!options.openProjectFilesOnly) {
      if
      ((options.projectState.key !== oldKey) ||
				!!options.isAsynchronousProjectPathChange) {
        this.currentlySettingProjectRootDirectories = true
        atom.project.rootDirectories.filter(rootDirectory => rootDirectory.projectRingFSWatcher).forEach(rootDirectory => rootDirectory.projectRingFSWatcher.close())
        const treeView = atom.packages.getLoadedPackage('tree-view')
        lib.onceChangedPaths(() => {
          this.currentlySettingProjectRootDirectories = false
          atom.project.rootDirectories.forEach(rootDirectory => {
            _fs = require('fs')
            return rootDirectory.projectRingFSWatcher = _fs.watch(rootDirectory.path, (event, filename) => {
              if (event !== 'rename') { return }
              this.add({ updateRootDirectoriesAndTreeViewStateOnly: true })
              return this.runFilePatternHiding()
            })
          })
          __guardMethod__(treeView != null ? treeView.mainModule.treeView : undefined, 'show', o => o.show())
          setTimeout(() => {
            __guardMethod__(treeView != null ? treeView.mainModule.treeView : undefined, 'updateRoots', o1 => o1.updateRoots((options.projectState.treeViewState != null ? options.projectState.treeViewState.directoryExpansionStates : undefined) || null))
            return this.runFilePatternHiding()
          }
          , 0)
          this.setCurrentProjectState(options.projectState)
          this.fixOpenFilesToCurrentProjectAssociations()
          return this.projectRingNotification.notify('Project "' + options.projectState.key + '" has been loaded')
        })
        atom.project.setPaths(options.projectState.rootDirectories)
      } else {
        this.setCurrentProjectState(options.projectState)
        this.fixOpenFilesToCurrentProjectAssociations()
        this.projectRingNotification.notify('Project "' + options.projectState.key + '" has been loaded')
      }
      if (atom.config.get('project-ring.makeTheCurrentProjectTheDefaultAtStartUp')) {
        lib.setDefaultProjectToLoadAtStartUp(options.projectState.key)
      }
    }
    if
    (!options.openProjectFilesOnly &&
			(!oldKey ||
			 (oldKey !== options.projectState.key) ||
			 options.isAsynchronousProjectPathChange) &&
			atom.project.buffers.length &&
			atom.config.get('project-ring.closePreviousProjectFiles')) {
      this.closeProjectBuffersOnBufferCreate()
    }
    const removeEmptyBuffers = bufferCreated => {
      if (bufferCreated && !bufferCreated.file) { return }
      return setTimeout(() => (atom.project.buffers.filter(buffer => !buffer.file && (buffer.cachedText === ''))).forEach(function (buffer) {
        if
        ((bufferCreated === buffer) ||
                    ((atom.project.buffers.length === 1) &&
                     !atom.project.buffers[0].file &&
                     (atom.project.buffers[0].cachedText === '') &&
                     atom.config.get('core.destroyEmptyPanes'))) { return }
        lib.offDestroyedBuffer(buffer)
        return buffer.destroy()
      }), 0)
    }
    const filesCurrentlyOpen = this.getOpenFilePaths().map(filePath => filePath.toLowerCase())
    const filesToOpen = options.projectState.files.open.filter(function (filePath) {
      let needle
      return (needle = filePath.toLowerCase(), !Array.from(filesCurrentlyOpen).includes(needle))
    })
    const _q = require('q')
    const filesOpenedDefer = _q.defer()
    filesOpenedDefer.resolve()
    let filesOpenedPromise = filesOpenedDefer.promise
    if (options.openProjectFilesOnly) {
      if (filesToOpen.length) { filesOpenedPromise = lib.openFiles(filesToOpen) }
      if (usePanesMap) { return this.currentlyChangingPanesLayout = false }
    } else if (!atom.config.get('project-ring.doNotSaveAndRestoreOpenProjectFiles')) {
      lib.moveAllEditorsToFirstNonEmptyPane()
      lib.destroyEmptyPanes()
      lib.selectFirstNonEmptyPane()
      if (filesToOpen.length) { lib.onceAddedBuffer(removeEmptyBuffers) }
      if (usePanesMap) {
        filesOpenedPromise = lib.buildPanesLayout(options.projectState.panesMap)
        return filesOpenedPromise.finally(() => {
          this.currentlyChangingPanesLayout = false
          this.mapPanesLayout(() => this.saveProjectRing())
          const defer = _q.defer()
          defer.resolve()
          return defer.promise
        })
      } else if (filesToOpen.length) {
        lib.openFiles(filesToOpen)
        if (usePanesMap) { return this.currentlyChangingPanesLayout = false }
      }
    } else if (atom.config.get('project-ring.closePreviousProjectFiles')) {
      removeEmptyBuffers()
      if (usePanesMap) { return this.currentlyChangingPanesLayout = false }
    }
  },

  handleProjectRingInputViewInput (viewModeParameters, data) {
    switch (viewModeParameters.viewMode) {
      case 'project': return this.processProjectRingInputViewProjectKey(data, viewModeParameters.renameOnly)
      default: break
    }
  },

  processProjectRingInputViewProjectKey (key, renameOnly) {
    if (!key || !!/^\s*$/.test(key)) { return }
    return this.add({ key, renameOnly })
  },

  handleProjectRingProjectSelectViewSelection (viewModeParameters, data) {
    switch (viewModeParameters.viewMode) {
      case 'open': return this.processProjectRingProjectSelectViewSelection(data, 'open')
      default: break
    }
  },

  processProjectRingProjectSelectViewSelection (keys, action) {
    let configurationSet, didOpenOne, openInCurrentWindow
    if (!keys || !keys.length) { return }
    switch (action) {
      case 'open': return (openInCurrentWindow = !this.checkIfInProject()),
      (didOpenOne = false),
      (configurationSet = false),
      keys.forEach(key => {
        const projectState = this.getProjectState(key)
        if (!projectState || !!projectState.isDefault) { return }
        if (openInCurrentWindow) {
          this.processProjectRingViewProjectSelection({ projectState })
          openInCurrentWindow = false
          didOpenOne = true
        } else if (projectState.rootDirectories.length) {
          lib.openFiles(projectState.rootDirectories, true)
          didOpenOne = true
        }
        if (didOpenOne && !configurationSet) {
          if (atom.config.get('project-ring.makeTheCurrentProjectTheDefaultAtStartUp')) {
            atom.config.set('project-ring.makeTheCurrentProjectTheDefaultAtStartUp', false)
          }
          return configurationSet = true
        }
      })
      default: break
    }
  },

  handleProjectRingFileSelectViewSelection (viewModeParameters, data) {
    switch (viewModeParameters.viewMode) {
      case 'add': return this.processProjectRingFileSelectViewSelection(data, true)
      case 'ban': return this.processProjectRingFileSelectViewSelection(data, false, true)
      case 'always-open': return this.processProjectRingFileSelectViewSelection(data, false, false, true)
      default: break
    }
  },

  processProjectRingFileSelectViewSelection (paths, add, ban, alwaysOpen) {
    if (!paths || !paths.length || (!(add || ban ? this.checkIfInProject(false) : true))) { return }
    if (add) {
      return paths.forEach(path => this.addOpenFilePathToProject(path, true))
    } else if (ban) {
      return paths.forEach(path => this.banOpenFilePathFromProject(path))
    } else if (alwaysOpen) {
      return paths.forEach(path => this.alwaysOpenFilePath(path))
    }
  },

  editKeyBindings () {
    const _path = require('path')
    const keyBindingsFilePath = _path.join(atom.packages.getLoadedPackage('project-ring').path, 'keymaps', 'project-ring.cson')
    const _fs = require('fs')
    if (!_fs.existsSync(keyBindingsFilePath)) {
      this.projectRingNotification.alert('Could not find the default Project Ring key bindings file')
      return
    }
    return lib.openFiles(keyBindingsFilePath)
  },

  closeProjectUnrelatedFiles () {
    if (!globals.statesCacheReady) { return }
    const openFilePaths = lib.getTextEditorFilePaths()
    const projectFilePaths =
			(this.checkIfInProject(false) ? this.currentProjectState.files.open : []).concat(
			  this.getProjectState(lib.defaultProjectCacheKey).files.open)
    const filesToClose = openFilePaths.filter(path => !lib.findInArray(projectFilePaths, path.toLowerCase(), String.prototype.toLowerCase))
    atom.project.getBuffers().filter(buffer => buffer.file && lib.findInArray(filesToClose, buffer.file.path)).forEach(buffer => buffer.destroy())
    return undefined
  }
}

function __guard__ (value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined
}
function __guardMethod__ (obj, methodName, transform) {
  if (typeof obj !== 'undefined' && obj !== null && typeof obj[methodName] === 'function') {
    return transform(obj, methodName)
  } else {
    return undefined
  }
}

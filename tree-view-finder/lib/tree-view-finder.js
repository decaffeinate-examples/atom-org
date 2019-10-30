/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let TreeViewFinder;
const $ = require('jquery');
const FinderTool = require('./finder-tool');
const {CompositeDisposable} = require('atom');
const FileInfo = require('./file-info');
const xorTap = require('./doubleTap.js/xorTap');
let open = null;
let fs = null;

module.exports = (TreeViewFinder = {
  config: {
    entireWindow: {
      type: 'boolean',
      default: false,
      title: 'Use entire window'
    },
    debugTreeViewFinder: {
      type: 'boolean',
      default: false,
      title: 'Enable debug information from tree-view-finder.coffee'
    },
    debugFinderTool: {
      type: 'boolean',
      default: false,
      title: 'Enable debug information from finder-tool.coffee'
    },
    debugFileInfo: {
      type: 'boolean',
      default: false,
      title: 'Enable debug information from file-info.coffee'
    },
    debugHistory: {
      type: 'boolean',
      default: false,
      title: 'Enable debug information from history'
    }
  },

  subscriptions: null,
  treeView: null,
  visible: false,
  xorhandler: null,
  isFit: false,
  history: null,
  subscriptionOnPanelDestroy: null,

  activate(state) {
    this.state = state;
    this.history = new history;
    this.finderTool = new FinderTool();
    this.fileInfo = new FileInfo();
    this.updateDebugFlags();
    if (this.debug) {
      console.log('tree-view-finder: activate:',
        'should attach =', this.state.shouldAttach);
    }
    if (this.state.shouldAttach == null) { this.state.shouldAttach = false; }

    this.subscriptions = new CompositeDisposable;

    this.history.initialize();
    this.finderTool.initialize(this);
    this.fileInfo.initialize();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {'tree-view-finder:toggle': () => this.toggle()}));

    // Install event handlers which don't depend on TreeView panel status.
    this.subscriptions.add(atom.project.onDidChangePaths(() => {
      return this.updateRoots();
    })
    );

    this.subscriptions.add(atom.config.onDidChange('tree-view-finder.debugTreeViewFinder', () => {
      return this.updateDebugFlags();
    })
    );
    this.subscriptions.add(atom.config.onDidChange('tree-view-finder.debugFinderTool', () => {
      return this.updateDebugFlags();
    })
    );
    this.subscriptions.add(atom.config.onDidChange('tree-view-finder.debugFileInfo', () => {
      return this.updateDebugFlags();
    })
    );
    this.subscriptions.add(atom.config.onDidChange('tree-view-finder.debugHistory', () => {
      return this.updateDebugFlags();
    })
    );

    this.subscriptions.add(atom.config.onDidChange('tree-view-finder.entireWindow', () => {
      return this.updateEntireWindowCongig();
    })
    );

    window.onresize = () => {
      if (this.debug) { console.log('Window innerWidth:', window.innerWidth); }
      return this.updateWidth();
    };

    atom.packages.activatePackage('tree-view').then(treeViewPkg => {
      this.treeView = treeViewPkg.mainModule.createView();
      if (this.debug) {
        console.log('tree-view-finder: attaching on activation: should attach =',
          this.state.shouldAttach);
      }
      if (this.state.shouldAttach) { return this.attach(); }
    });
    return $('body').on('focus', '.tree-view', () => {
      if (this.debug) {
        console.log('tree-view-finder: .tree-view got focus: should attach =',
          this.state.shouldAttach);
      }
      if (this.state.shouldAttach) { return this.attach(); }
    });
  },

  deactivate() {
    if (this.debug) { console.log('tree-view-finder: deactivate'); }
    this._hide();
    this.subscriptions.dispose();
    return this.finderTool.destroy();
  },

  serialize() {
    if (this.debug) {
      console.log('tree-view-finder: serialize:',
        'should attach =', this.state.shouldAttach);
    }
    return {
      finderTool: this.finderTool.serialize(),
      shouldAttach: this.state.shouldAttach
    };
  },

  toggle() {
    if (!this.treeView.isVisible()) { return; }
    if (this.visible) {
      return this.detach();
    } else {
      return this.attach();
    }
  },

  attach() {
    this.state.shouldAttach = true;
    return this._show();
  },

  detach() {
    this.state.shouldAttach = false;
    return this._hide();
  },

  _show() {
    if (this.debug) { console.log('tree-view-finder: show()'); }

    const treeViewPkg = atom.packages.getLoadedPackage('tree-view');
    if (this.debug) { console.log('tree-view-finder: create TreeView'); }
    this.treeView = treeViewPkg.mainModule.createView();

    // XXX, check if there is the tree-view
    if (!this.treeView.isVisible()) {
      console.log('tree-view-finder: show(): @treeView.isVisiple() =',
        this.debug ? this.treeView.isVisible() : undefined);
      return; 
    }

    this.visible = true;
    this.finderTool.attach();

    this.fileInfo.show(this.treeView);
    this.updateEntireWindowCongig();
    return this.hookTreeViewEvents();
  },

  _hide() {
    if (this.debug) { console.log('tree-view-finder: hide()'); }
    this.visible = false;
    this.fileInfo.hide();
    this.finderTool.detach();
    this.unfitWidth();
    return this.unhookTreeViewEvents();
  },

  fitWidth() {
    if (this.debug) { console.log('tree-view-finder: fitWidth...'); }
    if (!this.visible) { return; }
    if (this.isFit) { return; }
    this.resizer = atom.views.getView(atom.workspace).querySelector('.tree-view-resizer');
    if (!this.resizer) { return; }
    const ws = atom.views.getView(atom.workspace);
    const vertical = ws.querySelector('atom-workspace-axis.vertical');
    vertical.classList.add('tree-view-finder-fit');
    this.resizerOriginalWidth = this.resizer.style.width;
    this.isFit = true;
    if (this.debug) { console.log('tree-view-finder: fitWidth...succeeded'); }
    return this.updateWidth();
  },

  updateWidth() {
    if (this.resizer && this.isFit) {
      return this.resizer.style.width = window.innerWidth + 'px';
    }
  },

  unfitWidth() {
    if (this.debug) { console.log('tree-view-finder: unfitWidth'); }
    if (this.resizer && this.isFit) {
      this.resizer.style.width = this.resizerOriginalWidth;
    }
    this.resizer = null;
    const ws = atom.views.getView(atom.workspace);
    const vertical = ws.querySelector('atom-workspace-axis.vertical');
    vertical.classList.remove('tree-view-finder-fit');
    return this.isFit = false;
  },

  hookTreeViewEvents() {
    if (this.debug) { console.log('tree-view-finder: hookTreeViewEvents: install click handler'); }
    this.treeView.off('click');
    if (this.xorhandler == null) { this.xorhandler = new xorTap(
      e => {
        if (this.debug) { console.log('tree-view-finder: click!', e); }
        this.treeView.entryClicked(e);
        return this.fileInfo.update();
      }
      ,
      e => {
        if (this.debug) { console.log('tree-view-finder: double click!', e, e.currentTarget.classList); }
        if (e.currentTarget.classList.contains('directory') &&
           !e.currentTarget.classList.contains('project-root')) {
          let name, targetProject;
          if (this.debug) { console.log('tree-view-finder: cd ' + e.target.dataset.path); }
          const targetPath = e.target.dataset.path;
          const oldPaths = atom.project.getPaths();
          let p = e.target;
          while (!p.classList.contains('tree-view')) {
            if (name = p.querySelector(':scope > div > span.name')) {
              if (this.debug) {
                console.log('tree-view-finder:', p.tagName, name.dataset.path);
              }
            }
            targetProject = p;
            p = p.parentNode;
          }
          // p is ol.tree-view
          if (p.children.length !== oldPaths.length) {
            console.log('ERROR:',
              'num of projects =', p.children.length, 
              ', num of nodes =', this.debug ? oldPaths.length : undefined);
          }
          let i = 0;
          const newPaths = [];
          for (let root of Array.from(p.children)) {
            if (name = p.children[i].querySelector(':scope > div > span.name')) {
              if (root === targetProject) {
                if (this.debug) {
                  console.log('tree-view-finder:', i+':', name.dataset.path, 
                    '==> ' + targetPath);
                }
                newPaths.push(targetPath);
              } else {
                if (this.debug) {
                  console.log('tree-view-finder:', i+':', name.dataset.path);
                }
                newPaths.push(oldPaths[i]);
              }
            }
            i++;
          }
          if (this.debug) { console.log('tree-view-finder:'); }
          if (this.debug) { console.log('  old:', oldPaths); }
          if (this.debug) { console.log('  new:', newPaths); }
          this.history.push(newPaths);
          return this.finderTool.updateButtonStatus();
        } else if (e.currentTarget.classList.contains('file')) {
          if (this.debug) { console.log('tree-view-finder: double click: file'); }
          return this.openUri(e.target.dataset.path);
        }
      }); }
    //click_ts = 0
    this.treeView.on('click', '.entry', e => {
      //console.log 'tree-view-finder: click event', e if @debug
      //if (click_ts != e.timeStamp)
      //  click_ts = e.timeStamp
        let name;
        if (e.target.classList.contains('entries')) { return; }
        if (e.shiftKey || e.metaKey || e.ctrlKey) { return; }
        e.stopPropagation();
        if (name = e.target.querySelector('.icon-file-directory')) {
          if (this.debug) {
            console.log('tree-vire-finder: click w/o double click.',
              name.getBoundingClientRect().left, e.offsetX, 
              e.offsetX < name.getBoundingClientRect().left);
          }
          if (e.offsetX < name.getBoundingClientRect().left) {
            this.treeView.entryClicked(e);
            this.fileInfo.update();
            return;
          }
        }
        return this.xorhandler(e);
    });

    // XXX, in case that @treeView.panel is not available. (I donno why.)
    const panel = atom.workspace.panelForItem(this.treeView);

    // hook destroy event of the panel to detect deatching the tree view.
    return this.subscriptionOnPanelDestroy = panel.onDidDestroy(() => {
      if (this.debug) { console.log('tree-view-finder: treeView.panel was destroyed.'); }
      return this._hide();
    });
  },

  unhookTreeViewEvents() {
    if (this.debug) { console.log('tree-view-finder: UnhookTreeViewEvents'); }
    this.treeView.off('click');
    //
    // XXX, this code was came from TreeView.handleEvents
    //
    this.treeView.on('click', '.entry', e => {
      if (e.target.classList.contains('entries')) { return; }
      if (!e.shiftKey && !e.metaKey && !e.ctrlKey) { return this.treeView.entryClicked(e); }
    });

    if (this.subscriptionOnPanelDestroy) {
      this.subscriptionOnPanelDestroy.dispose();
      return this.subscriptionOnPanelDestroy = null;
    }
  },

  updateRoots() {
    let newi;
    const oldPaths = this.history.getCurrentPaths();
    const newPaths = atom.project.getPaths();
    if (this.debug) { console.log('tree-view-finder: updateRoots: ', oldPaths, newPaths); }
    let oldi = (newi = 0);
    while ((oldi < oldPaths.length) || (newi < newPaths.length)) {
      // console.log "updateRoots: ", oldi, oldPaths[oldi], newi, newPaths[newi]
      if (oldPaths[oldi] !== newPaths[newi]) {
        if (oldPaths[oldi]) {
          if (this.debug) {
            console.log('tree-view-finder: updateRoots:', 
              'REMOVE project folder:', oldi + ': ' + oldPaths[oldi]);
          }
          this.history.removePath(oldi);
          newi--;
        } else {
          if (this.debug) {
            console.log('tree-view-finder: updateRoots:',
              'ADD project folder:', newPaths[newi]);
          }
          this.history.addPath(newPaths[newi]);
          oldi--;
        }
        this.finderTool.updateButtonStatus();
      }
      oldi++;
      newi++;
    }
    return this.fileInfo.update();
  },

  openUri(uri) {
    if (this.debug) { console.log('openUrl: ' + uri); }
    if (fs == null) { fs = require('fs'); }
    return fs.exists(uri, function(exists) {
      if (exists) {
        if (open == null) { open = require('open'); }
        return open(uri);
      }
    });
  },

  updateEntireWindowCongig() {
    if (atom.config.get('tree-view-finder.entireWindow')) {
      return this.fitWidth();
    } else {
      return this.unfitWidth();
    }
  },

  updateDebugFlags() {
      this.debug = atom.config.get('tree-view-finder.debugTreeViewFinder');
      this.fileInfo.debug = atom.config.get('tree-view-finder.debugFileInfo');
      this.finderTool.debug = atom.config.get('tree-view-finder.debugFinderTool');
      return this.history.debug = atom.config.get('tree-view-finder.debugHistory');
    }
});

var history = function() {
  return {
    index: 0,
    stack: [],
    debug: false,

    initialize() {
      this.stack.push(atom.project.getPaths());
      if (this.debug) { console.log('tree-view-finder: history.initialize:'); }
      if (this.debug) { return this.printStatus('  stack:'); }
    },

    push(paths) {
      if (this.debug) { console.log('tree-view-finder: history.push:'); }
      if (this.debug) { this.printStatus('  stack:'); }
      this.stack.length = this.index + 1;  // truncate forward history
      this.stack.push(paths);
      this.index = this.stack.length - 1;
      atom.project.setPaths(paths);
      if (this.debug) { return this.printStatus('     ==>'); }
    },

    canBack() {
      return 0 < this.index;
    },
    back() {
      if (this.debug) { console.log('tree-view-finder: history.back:'); }
      if (this.debug) { this.printStatus('  stack:'); }
      if (this.canBack()) {
        this.index--;
        atom.project.setPaths(this.stack[this.index]);
        if (this.debug) { return this.printStatus('     ==>'); }
      }
    },

    canForw() {
      return this.index < (this.stack.length - 1);
    },
    forw() {
      if (this.debug) { console.log('tree-view-finder: history.forw:'); }
      if (this.debug) { this.printStatus('  stack:'); }
      if (this.canForw()) {
        this.index++;
        atom.project.setPaths(this.stack[this.index]);
        if (this.debug) { return this.printStatus('     ==>'); }
      }
    },

    canGoHome() {
      return 0 < this.index;
    },
    goHome() {
      if (this.debug) { console.log('tree-view-finder: history.goHome:'); }
      if (this.debug) { this.printStatus('  stack:'); }
      if (this.canGoHome()) {
        this.index = 0;
        atom.project.setPaths(this.stack[this.index]);
        if (this.debug) { return this.printStatus('     ==>'); }
      }
    },

    addPath(path) {
      if (this.debug) { console.log('tree-view-finder: history.addPath:'); }
      if (this.debug) { this.printStatus('  stack:'); }
      for (let paths of Array.from(this.stack)) {
        paths.push(path);
      }
      if (this.debug) { return this.printStatus('     ==>'); }
    },

    removePath(idx) {
      if (this.debug) { console.log('tree-view-finder: history.removePath:'); }
      if (this.debug) { this.printStatus('  stack:'); }
      for (let paths of Array.from(this.stack)) {
        paths.splice(idx, 1);
      }
      if (this.debug) { return this.printStatus('     ==>'); }
    },

    getCurrentPaths() {
      return this.stack[this.index].slice(0);
    },  // return clone of the array

    printStatus(header) {
      return console.log(header,
        'length =', this.stack.length, ', index=', this.index, ', @stack =', this.stack);
    }
  };
};

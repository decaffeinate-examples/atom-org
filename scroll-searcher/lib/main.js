/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const ScrollSearch = require('./scroll-searcher-view');
const ScrollMarker = require('./scroll-marker');
const {CompositeDisposable, Emitter} = require('event-kit');
const {TextEditor} = require('atom');

class Main {
  constructor() {
    this.hide = this.hide.bind(this);
    this.show = this.show.bind(this);
    this.isPackageActive = this.isPackageActive.bind(this);
    this.markOnHeightUpdate = this.markOnHeightUpdate.bind(this);
    this.markOnEditorChange = this.markOnEditorChange.bind(this);
    this.on = this.on.bind(this);
  }

  static initClass() {
    this.prototype.editor = null;
    this.prototype.subscriptions = null;
    this.prototype.model = null;
    this.prototype.scrollMarker = null;
    this.prototype.previousHeight = null;
    this.prototype.previousScrollHeight = null;
    this.prototype.activated = false;
    // configuration settings. It includes color, size and opacity of scroll searchers.
    this.prototype.config = {
      color: {
        type: 'color',
        default: '#4de5ff',
        title: 'Set the color of scroll-searchers',
        description: 'Pick a color for scroll-searchers from the color box'
      },
      size: {
        type: 'integer',
        default:1,
        enum: [1, 2, 3],
        title: 'Set the size of scroll-searchers',
        description: 'Pick a size for scroll-searchers from the drop-down list'
      },
      scrOpacity: {
        type: 'integer',
        default: 65,
        title: 'Scrollbar Opacity',
        minimum: 0,
        maximum: 80,
        description: 'Set the scrollbar opacity for better visibility'
      },
      findAndReplace: {
        type: 'boolean',
        default : false,
        title: 'Retain markers on hiding find-and-replace bar',
        description : 'Set this property to true if you want to retain the markers after closing the find-and-replace pane'
      }
    };
  }

  activate(state) {
    //Activate the package. The package is automatically activated once the text editor is opened
    this.emitter = new Emitter;
    this.previousHeight = 0;
    this.subs = new CompositeDisposable;
    this.subscriptions = new CompositeDisposable;
    this.subs.add(atom.commands.add('atom-workspace', {
      'scroll-searcher:toggle': () => this.toggle(),
      'core:close': () => this.deactivate(),
      'core:cancel': () => this.hide(),
      'find-and-replace:show': () => this.show()
    }
    )
    );
    return this.toggle();
  }

  hide() {
    // emits hide signal when find-and-replace bar is hidden
    if (!atom.config.get('scroll-searcher.findAndReplace')) {
      if (!this.model.mainModule.findPanel.visible) {
        return this.emitter.emit('did-hide');
      }
    }
  }

  show() {
    return this.emitter.emit('did-show');
  }

  deactivate() {
    this.subscriptions.dispose();
    this.subs.dispose();
    if (this.scrollMarker) {
      this.scrollMarker.destroy();
    }
    this.emitter.emit('did-deacitvate');
    return this.activated = false;
  }

  isPackageActive(findPackage) {
    if (findPackage.name === 'find-and-replace') {
      return this.initializePackage();
    }
  }

  initializePackage() {
    if (this.activated) {
      // Check for active find-and-replace package
      this.model = atom.packages.getActivePackage('find-and-replace');
      if (this.model) {
        // Initiate an new scroll-marker class if an active find-and-replace model is found
        this.scrollMarker = new ScrollMarker(this.model,this);
        // Toggle with the view of find-and-replace
        atom.config.observe('scroll-searcher.findAndReplace', value => {
          if (value) {
            return this.show();
          } else {
            return this.hide();
          }
        });
      } else {
        return;
      }
      // Observe change in active text editor window
      this.subscriptions.add(atom.workspace.observePaneItems(this.on));
      return this.subscriptions.add(atom.workspace.observeActivePaneItem(this.markOnEditorChange));
    }
  }

  toggle() {
    if (!this.activated) {
      this.activated = true;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.packages.onDidActivatePackage(this.isPackageActive));
      return this.initializePackage();
    } else {
      this.activated = false;
      this.subscriptions.dispose();
      if (this.scrollMarker != null) {
        this.scrollMarker.destroy();
      }
      return this.emitter.emit('did-deacitvate');
    }
  }

  onDidDeactivate(callback) {
    return this.emitter.on('did-deacitvate', callback);
  }

  onDidShow(callback) {
    return this.emitter.on('did-show', callback);
  }

  onDidHide(callback) {
    return this.emitter.on('did-hide', callback);
  }

  // Change scroll searchers on change in height of editor
  markOnHeightUpdate() {
    if (this.editor != null) {
      if (this.editor instanceof TextEditor) {
        // If old height does not match new height than update markers
        if (this.editor.displayBuffer.height !== this.previousHeight) {
          this.previousHeight = this.editor.displayBuffer.height;
          return this.scrollMarker.updateMarkers();
        }
      } else {
        return;
      }
    }
  }

  // Update scroll-searchers if current editor window is switched with another
  markOnEditorChange(editor) {
    this.editor = editor;
    if (this.editor instanceof TextEditor) {
      this.model = atom.packages.getActivePackage('find-and-replace');
      if (this.model) {
        this.scrollMarker.updateModel(this.model);
        this.scrollMarker.updateMarkers();
        // Get the scrollbar domnode of new editor window
        this.verticalScrollbar = __guard__(atom.views.getView(editor).component.rootElement, x => x.querySelector('.vertical-scrollbar'));
        if (this.verticalScrollbar) {
          return this.verticalScrollbar.style.opacity = `0.${atom.config.get('scroll-searcher.scrOpacity')}`;
        }
      }
    } else {
      return;
    }
  }

  on(editor) {
    if (editor instanceof TextEditor) {
      // Initiate scroll-searcher class if it doesn't exist already
      if (this.scrollSearcherExists(editor)) {
        this.subscriptions.add(atom.views.getView(editor).component.presenter.onDidUpdateState(this.markOnHeightUpdate.bind(this)));
        const scrollSearch = new ScrollSearch(this);
        this.editorView = __guard__(atom.views.getView(editor).component.rootElement, x => x.firstChild);
        this.editorView.appendChild(scrollSearch.getElement());
        this.verticalScrollbar = __guard__(atom.views.getView(editor).component.rootElement, x1 => x1.querySelector('.vertical-scrollbar'));
        return this.verticalScrollbar.style.opacity = "0.65";
      }
    }
  }


  scrollSearcherExists(editor) {
    this.scrollView = __guard__(atom.views.getView(editor).rootElement, x => x.querySelector('.scroll-searcher'));
    if (this.scrollView != null) {
      return false;
    } else {
      return true;
    }
  }
}
Main.initClass();

module.exports = new Main();

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
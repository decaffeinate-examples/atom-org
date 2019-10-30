/** @babel */
/* eslint-disable
    no-return-assign,
    no-throw-literal,
    no-undef,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/* IMPORTS */
// core
const fs = require('fs')
const path = require('path')

// atom
const { $ } = require('atom')

// notebook
const Notepads = require('./notepads.coffee')

/* EXPORTS */
module.exports = {
  /* CONFIGURATION */
  configDefaults: {
    // Auto Save - default to true, good to have it this way
    autosaveEnabled: true,
    // Auto Remove Empty Notepads - default to true, don't bother keeping empty files around
    removeEmptyNotepadsAutomatically: true,
    // Remove notepads which are saved to project - default to false, notepad still remains
    removeNotepadOnSavingToProject: false
  },

  /* ATTRIBUTES */
  notepads: null,

  /* DEACTIVATE */
  activate (state) {
    // We only want to activate the package if there is a valid project
    // Not handling atom being loaded without a project at this point - TODO
    if (atom.project.getPath()) {
      // Setup the Notepads object
      this.notepads = new Notepads()

      // Call initializePackage to setup commands & event handlers
      return this.initializePackage()
    } else {
      // Throw an error for the benefit of package manager activePackage
      throw { stack: '- Notebook is active & functional only with a valid project open' }
    }
  },

  /* INITIALIZE */
  initializePackage () {
    // Setup the commands
    // Notepad Core Actions
    atom.workspaceView.command('notebook:new-notepad', () => this.notepads.new())
    atom.workspaceView.command('notebook:open-notepads', () => this.notepads.open())
    atom.workspaceView.command('notebook:close-notepads', () => this.notepads.close())
    atom.workspaceView.command('notebook:delete-notepad', () => this.notepads.delete())
    atom.workspaceView.command('notebook:purge-notepads', () => this.notepads.purge())

    // Notepad Convenience Actions
    atom.workspaceView.command('notebook:save-to-project', () => this.notepads.saveToProject())

    // Setup event handlers
    return $(window).on('ready', () => {
      // Attach the event handle for the editor/buffer changes to render notepad paths
      return (atom.workspaceView.statusBar != null ? atom.workspaceView.statusBar.on('active-buffer-changed', () => this.notepads.activatePathUpdater()) : undefined)
    })
  },

  /* DEACTIVATE */
  deactivate () {
    // Destroy the notepads object at this point
    return this.notepads = null
  },

  /* SERIALIZE */
  serialize () {}
}

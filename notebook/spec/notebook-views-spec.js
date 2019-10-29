/** @babel */
/* eslint-disable
    no-return-assign,
    no-undef,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/* IMPORTS */
// core
const path = require('path')
const fs = require('fs')

// atom
const { WorkspaceView } = require('atom')

// notebook
const Notepads = require('../lib/notepads.coffee')

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('Notebook Views', function () {
  /* ATTRIBUTES */
  let activationPromise = null
  const notepads = null

  /* SETUP */
  beforeEach(function () {
    // Create the workspace to be used
    atom.workspaceView = new WorkspaceView()

    // Setup the activation for the package
    activationPromise = atom.packages.activatePackage('notebook')

    // Create the notepads object
    return this.notepads = new Notepads()
  })

  /* TEARDOWN */
  afterEach(function () {
    // Purge all note pads we might have used in tests
    return this.notepads.purge()
  })

  /* SAVE TO PROJECT VIEW */
  return describe('Save To Project', function () {
    /* TEST */
    // Triggering save to project when a notepad is not the current active editor does nothing
    it('does nothing when the current active editor in workspace is not a notepad', function () {
      // There should be no open editors at this point
      expect(atom.workspace.getEditors().length).toEqual(0)

      // Wait for package to be activated and functional
      waitsForPromise(() => {
        // Waits for the activation
        return activationPromise
      })

      // Verify that there is no save to project view
      return runs(() => {
        // Run the save to project command now
        atom.workspaceView.trigger('notebook:save-to-project')

        // We should have no save to project view even now
        return expect(atom.workspaceView.find('.notebook .save-to-project')).not.toExist()
      })
    })

    // Triggering save to project when a notepad is open should present the save dialog
    return it('displays the save dialog when save to project is triggered with a notepad as the current active item in the workspace', function () {
      // There should be no open editors at this point
      expect(atom.workspace.getEditors().length).toEqual(0)

      // Wait for package to be activated and functional
      waitsForPromise(() => {
        // Waits for the activation
        return activationPromise
      })

      // Verify that there is a save to project dialog shown
      return runs(() => {
        // Run the new notepad now to get a notepad open
        waitsForPromise(() => {
          // Execute the method in the notepads object
          return this.notepads.new()
        })

        // Verify nothing actually happened
        return runs(() => {
          // There should be one open editor notepad at this point
          expect(atom.workspace.getEditors().length).toEqual(1)

          // Run the save to project command
          atom.workspaceView.trigger('notebook:save-to-project')

          // We should have no save to project view even now
          return expect(atom.workspaceView.find('.notebook .save-to-project')).toExist()
        })
      })
    })
  })
})

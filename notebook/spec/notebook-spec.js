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

describe('Notebook', function () {
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

  /* NEW NOTEPAD */
  describe('New Notepad', function () {
    /* TEST */
    // Open a new notepad buffer/editor
    it('creates a new notepad buffer/editor', function () {
      // There should be no open editors at this point
      expect(atom.workspace.getEditors().length).toEqual(0)

      // Wait for package to be activated and functional
      waitsForPromise(() => {
        // Waits for the activation
        return activationPromise
      })

      // Verify that there is one new editor that opened the notepad
      return runs(() => {
        // Wait for new notepad to be triggered
        waitsForPromise(() => {
          // Trigger the new notepad command at this point
          return this.notepads.new()
        })

        // Runs the test to verify
        return runs(() => {
          // At this point we should have a new editor open
          return expect(atom.workspace.getEditors().length).toEqual(1)
        })
      })
    })

    // Notepad does not persist until content added/modified
    it('creates a new notepad buffer/editor but does not save until there is content', function () {
      // There should be no notepads for the project
      expect(this.notepads.getSaved().length).toEqual(0)

      // Wait for package to be activated and functional
      waitsForPromise(() => {
        // Waits for the activation
        return activationPromise
      })

      // Verify that there is one new editor that opened the notepad
      return runs(() => {
        // Wait for new notepad to be triggered
        waitsForPromise(() => {
          // Trigger the new notepad command at this point
          return this.notepads.new()
        })

        // Runs the test to verify
        return runs(() => {
          // At this point we should have a new editor open
          expect(this.notepads.getOpen().length).toEqual(1)

          // There should still be no saved notepads
          return expect(this.notepads.getSaved().length).toEqual(0)
        })
      })
    })

    // Notepads should only be created if there are no unsaved notepads open
    return it('only creates a new notepad buffer/editor if there are no unsaved notepads open', function () {
      // There should be no notepads for the project
      expect(this.notepads.getSaved().length).toEqual(0)

      // Wait for package to be activated and functional
      waitsForPromise(() => {
        // Waits for the activation
        return activationPromise
      })

      // Verify that there is one new editor that opened the notepad
      return runs(() => {
        // Wait for new notepad to be triggered
        waitsForPromise(() => {
          // Trigger the new notepad command at this point
          return this.notepads.new()
        })

        // Runs the test to verify
        return runs(() => {
          // At this point we should have a new editor open
          expect(this.notepads.getOpen().length).toEqual(1)

          // Trigger another new notepad command at this point
          // No wait for promise
          this.notepads.new()

          // There should still be only one notepad open
          return expect(this.notepads.getOpen().length).toEqual(1)
        })
      })
    })
  })

  /* SAVE NOTEPAD */
  describe('Save Notepad', function () {
    /* TEST */
    // Content modification in notepad editor should save to disk
    it('content change in notepad buffer/editor should persist it to disk', function () {
      // Wait for package to be activated and functional
      waitsForPromise(() => {
        // Waits for the activation
        return activationPromise
      })

      // Verify that there is one new editor that opened the notepad
      return runs(() => {
        // Wait for new notepad to be triggered
        waitsForPromise(() => {
          // Trigger the new notepad command at this point
          return this.notepads.new()
        })

        // Runs the test to verify
        return runs(() => {
          // At this point we should have a new editor open
          expect(atom.workspace.getEditors().length).toEqual(1)

          // Add some content to the notepad editor
          atom.workspace.getEditors()[0].setText('Notepad save on content change test')

          // There should be one saved notepad at this point for the project
          return expect(this.notepads.getSaved().length).toEqual(1)
        })
      })
    })

    // Content modification in notepad editor should save to disk only if auto save enabled
    return it('content change in notepad buffer/editor should not save if auto-save disabled', function () {
      // Wait for package to be activated and functional
      waitsForPromise(() => {
        // Waits for the activation
        return activationPromise
      })

      // Verify that there is one new editor that opened the notepad
      return runs(() => {
        // Set the auto save to false before opening a new notepad
        this.notepads.autosave = false

        // Wait for new notepad to be triggered
        waitsForPromise(() => {
          // Trigger the new notepad command at this point
          return this.notepads.new()
        })

        // Runs the test to verify
        return runs(() => {
          // At this point we should have a new editor open
          expect(atom.workspace.getEditors().length).toEqual(1)

          // Add some content to the notepad editor
          atom.workspace.getEditors()[0].setText('Notepad no save with auto-save false')

          // There should still be 0 saved notepads
          return expect(this.notepads.getSaved().length).toEqual(0)
        })
      })
    })
  })

  /* OPEN NOTEPADS */
  describe('Open Notepads', function () {
    /* TEST */
    // Open a new notepad when there are no saved notepads to open
    it('creates/opens a new notepad when there are no saved notepads', function () {
      // There should be no open editors at this point
      expect(atom.workspace.getEditors().length).toEqual(0)

      // Wait for package to be activated and functional
      waitsForPromise(() => {
        // Waits for the activation
        return activationPromise
      })

      // Verify that there is one new editor that opened the notepad
      return runs(() => {
        // Wait for new notepad to be triggered
        waitsForPromise(() => {
          // Trigger the new notepad command at this point
          return this.notepads.open()
        })

        // Runs the test to verify
        return runs(() => {
          // At this point we should have a new editor open
          expect(atom.workspace.getEditors().length).toEqual(1)

          // There should be one open notepad at this point for the project
          expect(this.notepads.getOpen().length).toEqual(1)

          // But still no saved notepads
          return expect(this.notepads.getSaved().length).toEqual(0)
        })
      })
    })

    // Opens all saved notepads
    it('opens all saved notepads', function () {
      // There should be no open editors at this point
      expect(atom.workspace.getEditors().length).toEqual(0)

      // Write a note pad file
      fs.writeFileSync(this.notepads.getPath('notepad-1'), 'Saved Notepad', { encoding: 'utf8' })

      // Wait for package to be activated and functional
      waitsForPromise(() => {
        // Waits for the activation
        return activationPromise
      })

      // Verify that there is one new editor that opened the notepad
      return runs(() => {
        // There should be one saved notepad
        expect(this.notepads.getSaved().length).toEqual(1)

        // Open notepads now
        waitsForPromise(() => {
          // Trigger the notepads open, and use the first one
          return this.notepads.open()[0]
        })

        // Verify that it opened one notepad which was saved earlier
        return runs(() => {
          // At this point we should have a new editor open
          expect(atom.workspace.getEditors().length).toBeGreaterThan(0)

          // There should be one open notepad at this point for the project
          expect(this.notepads.getOpen().length).toBeGreaterThan(0)

          // But still be the saved notepad
          expect(this.notepads.getSaved().length).toEqual(1)

          // The paths of notepads should match from our manual save & open notepad
          expect(atom.workspace.getEditors()[0].getPath()).toEqual(this.notepads.getPath('notepad-1'))

          // The content of the notepads should also match exactly
          return expect(atom.workspace.getEditors()[0].getText()).toEqual('Saved Notepad')
        })
      })
    })

    // Opens only saved notepads which have valid content in them - isNotepadEmpty return false
    it('opens only saved notepads which have valid content - isNotepadEmpty returns false', function () {
      // There should be no open editors at this point
      expect(atom.workspace.getEditors().length).toEqual(0)

      // Write a note pad file - valid content
      fs.writeFileSync(this.notepads.getPath('notepad-1'), 'Saved Notepad', { encoding: 'utf8' })

      // Write a notepad file - invalid/empty content
      fs.writeFileSync(this.notepads.getPath('notepad-2'), '', { encoding: 'utf8' })

      // Wait for package to be activated and functional
      waitsForPromise(() => {
        // Waits for the activation
        return activationPromise
      })

      // Verify that there is one new editor that opened the notepad
      return runs(() => {
        // There should be one saved notepad
        expect(this.notepads.getSaved().length).toEqual(2)

        // Open notepads now
        waitsForPromise(() => {
          // Trigger the notepads open, and use the first one
          return this.notepads.open()[0]
        })

        // Verify that it opened one notepad which was saved earlier
        return runs(() => {
          // At this point we should have a new editor open
          expect(atom.workspace.getEditors().length).toEqual(1)

          // There should be one open notepad at this point for the project
          expect(this.notepads.getOpen().length).toEqual(1)

          // The other saved notepad file must be deleted at this point
          return expect(this.notepads.getSaved().length).toEqual(1)
        })
      })
    })

    // Opens saved notepads which might not have valid content - auto remove is false
    return it('opens saved notepads even without valid content - when auto remove is false', function () {
      // There should be no open editors at this point
      expect(atom.workspace.getEditors().length).toEqual(0)

      // Write a notepad file - invalid/empty content
      fs.writeFileSync(this.notepads.getPath('notepad-1'), '', { encoding: 'utf8' })

      // Wait for package to be activated and functional
      waitsForPromise(() => {
        // Waits for the activation
        return activationPromise
      })

      // Verify that there is one new editor that opened the notepad
      return runs(() => {
        // Set the auto remove of empty to false
        this.notepads.autoRemoveEmpty = false

        // There should be one saved notepad
        expect(this.notepads.getSaved().length).toEqual(1)

        // Open notepads now
        waitsForPromise(() => {
          // Trigger the notepads open
          return this.notepads.open()[0]
        })

        // Verify that it opened one notepad which was saved earlier
        return runs(() => {
          // At this point we should have a new editor open
          expect(atom.workspace.getEditors().length).toBeGreaterThan(0)

          // There should be two open notepads now one without valid content
          return expect(this.notepads.getOpen().length).toBeGreaterThan(0)
        })
      })
    })
  })

  /* CLOSE NOTEPADS */
  describe('Close Notepads', function () {
    /* TEST */
    // Close all notepad editors/buffers open currently
    it('closes any open notepad editors/buffers', function () {
      // There should be no open editors at this point
      expect(atom.workspace.getEditors().length).toEqual(0)

      // Wait for package to be activated and functional
      waitsForPromise(() => {
        // Waits for the activation
        return activationPromise
      })

      // Verify that there is one new editor that opened the notepad
      return runs(() => {
        // Try to open some notepads
        waitsForPromise(() => {
          // Trigger the open notepads command at this point
          return this.notepads.open()
        })

        // Runs the test to verify
        return runs(() => {
          // At this point we should have a new editor open
          expect(atom.workspace.getEditors().length).toEqual(1)

          // There should be one open notepad at this point for the project
          expect(this.notepads.getOpen().length).toEqual(1)

          // Trigger the close notepads
          this.notepads.close()

          // There should be no open editors at this point
          expect(atom.workspace.getEditors().length).toEqual(0)

          // There should be no open notepads at this point for the project
          return expect(this.notepads.getOpen().length).toEqual(0)
        })
      })
    })

    // Close all notepad editors/buffers open currently, removing any permanently without
    // valid non-empty content in them
    it('closes any open notepad editors/buffers removing any without valid content', function () {
      // There should be no open editors at this point
      expect(atom.workspace.getEditors().length).toEqual(0)

      // Wait for package to be activated and functional
      waitsForPromise(() => {
        // Waits for the activation
        return activationPromise
      })

      // Verify that there is one new editor that opened the notepad
      return runs(() => {
        // Try to open some notepads
        waitsForPromise(() => {
          // Trigger the open notepads command at this point
          return this.notepads.open()
        })

        // Runs the test to verify
        return runs(() => {
          // At this point we should have a new editor open
          expect(atom.workspace.getEditors().length).toEqual(1)

          // There should be one open notepad at this point for the project
          expect(this.notepads.getOpen().length).toEqual(1)

          // Add some content to the notepad editor
          atom.workspace.getEditors()[0].setText('Notepad should get persisted now')

          // There should be one saved notepad at this point for the project
          expect(this.notepads.getSaved().length).toEqual(1)

          // Reset the content in the notepad to nothing
          atom.workspace.getEditors()[0].setText('')

          // Trigger the close notepads
          this.notepads.close()

          // There should be no open editors at this point
          expect(atom.workspace.getEditors().length).toEqual(0)

          // There should be no open notepads at this point for the project
          expect(this.notepads.getOpen().length).toEqual(0)

          // There should be no saved notepads at this point either
          return expect(this.notepads.getSaved().length).toEqual(0)
        })
      })
    })

    // Close all notepad editors/buffers open currently, not removing any empty notepads when
    // auto remove is set to false
    return it('closes any open notepad editors/buffers without removing it when auto remove false', function () {
      // There should be no open editors at this point
      expect(atom.workspace.getEditors().length).toEqual(0)

      // Wait for package to be activated and functional
      waitsForPromise(() => {
        // Waits for the activation
        return activationPromise
      })

      // Verify that there is one new editor that opened the notepad
      return runs(() => {
        // Set the auto remove of empty to false
        this.notepads.autoRemoveEmpty = false

        // Try to open some notepads
        waitsForPromise(() => {
          // Trigger the open notepads command at this point
          return this.notepads.open()
        })

        // Runs the test to verify
        return runs(() => {
          // At this point we should have a new editor open
          expect(atom.workspace.getEditors().length).toEqual(1)

          // There should be one open notepad at this point for the project
          expect(this.notepads.getOpen().length).toEqual(1)

          // Add some content to the notepad editor
          atom.workspace.getEditors()[0].setText('Notepad should get persisted now')

          // There should be one saved notepad at this point for the project
          expect(this.notepads.getSaved().length).toEqual(1)

          // Reset the content in the notepad to nothing
          atom.workspace.getEditors()[0].setText('')
          atom.workspace.getEditors()[0].save()

          // Trigger the close notepads
          this.notepads.close()

          // There should be no open editors at this point
          expect(atom.workspace.getEditors().length).toEqual(0)

          // There should be no open notepads at this point for the project
          expect(this.notepads.getOpen().length).toEqual(0)

          // There should be the one saved notepad even though it is empty
          return expect(this.notepads.getSaved().length).toEqual(1)
        })
      })
    })
  })

  /* DELETE NOTEPAD */
  describe('Delete Notepad', function () {
    /* TEST */
    // Delete the currently open/focused/active notepad completely
    it('deletes current open/active notepad and removes file if it is a saved notepad', function () {
      // There should be no open editors at this point
      expect(atom.workspace.getEditors().length).toEqual(0)

      // Write a note pad file
      fs.writeFileSync(this.notepads.getPath('notepad-1'), 'Saved Notepad', { encoding: 'utf8' })

      // Wait for package to be activated and functional
      waitsForPromise(() => {
        // Waits for the activation
        return activationPromise
      })

      // Now try to open the saved notepad
      return runs(() => {
        // There should be one saved notepad
        expect(this.notepads.getSaved().length).toEqual(1)

        // Open notepads now
        waitsForPromise(() => {
          // Trigger the notepads open, and use the first one
          return this.notepads.open()[0]
        })

        // Verify that it opened one notepad which was saved earlier
        return runs(() => {
          // At this point we should have a new editor open
          expect(atom.workspace.getEditors().length).toEqual(1)

          // There should be one open notepad at this point for the project
          expect(this.notepads.getOpen().length).toEqual(1)

          // But still be the saved notepad
          expect(this.notepads.getSaved().length).toEqual(1)

          // Call the delete notepad
          this.notepads.delete()

          // Verify that the editor closed and there is no saved notepad
          // There should be no open editors at this point
          expect(atom.workspace.getEditors().length).toEqual(0)

          // There should be no open notepad at this point for the project
          expect(this.notepads.getOpen().length).toEqual(0)

          // But should be no saved notepad
          expect(this.notepads.getSaved().length).toEqual(0)

          // Make sure that the notepad file no longer exists
          const notepadExists = fs.existsSync(this.notepads.getPath('notepad-1'))

          // The above exists should evaluate to false
          return expect(notepadExists).toEqual(false)
        })
      })
    })

    // Delete the currently open/focused/active notepad completely
    return it('simply closes the current notepad editor/buffer if it is not saved', function () {
      // There should be no open editors at this point
      expect(atom.workspace.getEditors().length).toEqual(0)

      // Wait for package to be activated and functional
      waitsForPromise(() => {
        // Waits for the activation
        return activationPromise
      })

      // Now try to open the saved notepad
      return runs(() => {
        // Create new notepad now
        waitsForPromise(() => {
          // Trigger the new notepad to get one in the workspace
          return this.notepads.new()
        })

        // Verify that it opened one notepad
        return runs(() => {
          // At this point we should have a new editor open
          expect(atom.workspace.getEditors().length).toEqual(1)

          // There should be one open notepad at this point for the project
          expect(this.notepads.getOpen().length).toEqual(1)

          // Call the delete notepad
          this.notepads.delete()

          // Verify that the editor closed and no open notepads are there
          // There should be no open editors at this point
          expect(atom.workspace.getEditors().length).toEqual(0)

          // There should be no open notepad at this point for the project
          return expect(this.notepads.getOpen().length).toEqual(0)
        })
      })
    })
  })

  /* PURGE NOTEPADS */
  return describe('Purge Notepads', function () {
    /* TEST */
    // Delete all saved notepads completely even if they are not open
    it('deletes all saved notepads even if they are not open', function () {
      // There should be no open editors at this point
      expect(atom.workspace.getEditors().length).toEqual(0)

      // Write a note pad file
      fs.writeFileSync(this.notepads.getPath('notepad-1'), 'Saved Notepad 1', { encoding: 'utf8' })

      // Write a note pad file
      fs.writeFileSync(this.notepads.getPath('notepad-2'), 'Saved Notepad 2', { encoding: 'utf8' })

      // Wait for package to be activated and functional
      waitsForPromise(() => {
        // Waits for the activation
        return activationPromise
      })

      // Start the tests
      return runs(() => {
        // There should be no open notepad at this point
        expect(this.notepads.getOpen().length).toEqual(0)

        // But should be 2 saved notepad
        expect(this.notepads.getSaved().length).toEqual(2)

        // There should be 0 open notepad editors as well
        expect(atom.workspace.getEditors().length).toEqual(0)

        // Call the purge method
        this.notepads.purge()

        // There should be no open notepad at this point
        expect(this.notepads.getOpen().length).toEqual(0)

        // But should be 0 saved notepad
        expect(this.notepads.getSaved().length).toEqual(0)

        // There should be 0 open editors as well
        expect(atom.workspace.getEditors().length).toEqual(0)

        // Make sure that the first notepad file no longer exists
        let notepadExists = fs.existsSync(this.notepads.getPath('notepad-1'))

        // The above exists should evaluate to false
        expect(notepadExists).toEqual(false)

        // Make sure that the second notepad file no longer exists
        notepadExists = fs.existsSync(this.notepads.getPath('notepad-2'))

        // The above exists should evaluate to false
        return expect(notepadExists).toEqual(false)
      })
    })

    // Delete all saved notepads completely
    it('deletes all saved notepads even when they are open', function () {
      // There should be no open editors at this point
      expect(atom.workspace.getEditors().length).toEqual(0)

      // Write a note pad file
      fs.writeFileSync(this.notepads.getPath('notepad-1'), 'Saved Notepad 1', { encoding: 'utf8' })

      // Write a note pad file
      fs.writeFileSync(this.notepads.getPath('notepad-2'), 'Saved Notepad 2', { encoding: 'utf8' })

      // Wait for package to be activated and functional
      waitsForPromise(() => {
        // Waits for the activation
        return activationPromise
      })

      // Start the tests
      return runs(() => {
        // There should be no open notepad at this point
        expect(this.notepads.getOpen().length).toEqual(0)

        // But should be 2 saved notepad
        expect(this.notepads.getSaved().length).toEqual(2)

        // Now open the notepads up
        waitsForPromise(() => {
          // Trigger the open notepads and wait for the last notepad to be open
          return this.notepads.open()[1]
        })

        // Verify that we got open notepads
        return runs(() => {
          // There should be 2 open notepads now
          expect(this.notepads.getOpen().length).toEqual(2)

          // There should be 2 open editors as well
          expect(atom.workspace.getEditors().length).toEqual(2)

          // Call the purge method
          this.notepads.purge()

          // There should be no open notepad at this point
          expect(this.notepads.getOpen().length).toEqual(0)

          // But should be 0 saved notepad
          expect(this.notepads.getSaved().length).toEqual(0)

          // There should be 0 open editors as well
          expect(atom.workspace.getEditors().length).toEqual(0)

          // Make sure that the first notepad file no longer exists
          let notepadExists = fs.existsSync(this.notepads.getPath('notepad-1'))

          // The above exists should evaluate to false
          expect(notepadExists).toEqual(false)

          // Make sure that the second notepad file no longer exists
          notepadExists = fs.existsSync(this.notepads.getPath('notepad-2'))

          // The above exists should evaluate to false
          return expect(notepadExists).toEqual(false)
        })
      })
    })

    // Calling purge when there are no saved notepads but unsaved open ones should close them
    return it('closes out all unsaved notepad editors/buffers when there are no saved notepads', function () {
      // There should be no open editors at this point
      expect(atom.workspace.getEditors().length).toEqual(0)

      // Wait for package to be activated and functional
      waitsForPromise(() => {
        // Waits for the activation
        return activationPromise
      })

      // Start the tests
      return runs(() => {
        // There should be no open notepad at this point
        expect(this.notepads.getOpen().length).toEqual(0)

        // But should be no saved notepad
        expect(this.notepads.getSaved().length).toEqual(0)

        // Now open the notepads up
        waitsForPromise(() => {
          // Trigger the open notepads
          return this.notepads.open()
        })

        // Verify that an unsaved notepad is around now
        return runs(() => {
          // There should be no open notepad at this point
          expect(this.notepads.getOpen().length).toEqual(1)

          // But should be 2 saved notepad
          expect(this.notepads.getSaved().length).toEqual(0)

          // There should be 0 open notepad editors as well
          expect(atom.workspace.getEditors().length).toEqual(1)

          // Call the purge method
          this.notepads.purge()

          // There should be no open notepad at this point
          expect(this.notepads.getOpen().length).toEqual(0)

          // But should be 0 saved notepad
          expect(this.notepads.getSaved().length).toEqual(0)

          // There should be 0 open editors as well
          return expect(atom.workspace.getEditors().length).toEqual(0)
        })
      })
    })
  })
})

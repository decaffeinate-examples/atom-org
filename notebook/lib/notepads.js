/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/* IMPORTS */
// core
let Notepads;
const fs = require("fs");
const path = require("path");

// notebook
let SaveToProjectView = null;

/* EXPORTS */
module.exports =
    (Notepads = (function() {
        Notepads = class Notepads {
            static initClass() {
                /* ATTRIBUTES */
                this.prototype.storagePath = null;
                this.prototype.projectNotepadsPath = null;
                this.prototype.currentProject = null;
                this.prototype.pathUpdater = null;
            }

            /* CONSTRUCTOR */
            constructor( notepadsPath ) {
                // Setup the current project
                this.currentProject = atom.project.getPath();

                // Setup some paths
                this.storagePath = notepadsPath || null;

                // Call the setStoragePath
                this.setStoragePath();

                // Call the setProjectNotepadsPath
                this.setProjectNotepadsPath();

                // Do status bar updates only in normal mode, none for spec mode
                if (atom.mode !== "spec") {
                    // Set the hook for content save
                    this.saveHook = "contents-modified";
                } else {
                    // Different hook for spec running
                    this.saveHook = "changed";
                }

                // Setup auto save configuration
                this.autosave = atom.config.get( "notebook.autosaveEnabled" );

                // Remove empty notepads automatically
                this.autoRemoveEmpty = atom.config.get( "notebook.removeEmptyNotepadsAutomatically" );
            }

            /* ACTIONS */
            /* NEW */
            new() {
                // Get the next notepad file name
                const notepadFile = this.getNewNotepadFileName();

                // Set the title and the note pad file path
                const notepadPath = this.getPath( notepadFile );

                // Check if perhaps we already have this notepad open, don't open nultiple buffers
                // Set a flag to use for notepad being open
                let notepadAlreadyOpen = false;

                // Get the current open editors
                const currentEditors = atom.workspace.getEditors();

                // Find all the open editors and see if they match a notepad path
                // If they match, close out that editor
                // Loop through the editors
                for (let currentEditor of Array.from(currentEditors)) {
                    // Check if base path of this editor path matches notepads base path
                    if (currentEditor.getPath() === notepadPath) {
                        // Set the notepad already open flag
                        notepadAlreadyOpen = true;

                        // Just switch to that editor which is the notepad and be done
                        atom.workspace.getActivePane().activateItem( currentEditor );

                        // We are done here, so just exit out
                        break;
                    }
                }

                // Create a new editor for the notepad only if not already open
                if (notepadAlreadyOpen === false) {
                    // Create a note pad
                    return atom.project.open( notepadPath ).then(notepadEditor => {
                        // Render the notepad editor now
                        atom.workspace.getActivePane().activateItem( notepadEditor );

                        // Auto-save on change - switch to contents-modified
                        // Only do auto-save if enabled
                        if (this.autosave === true) {
                            // Attach save hooks based on atom mode
                            if (atom.mode !== "spec") {
                                // Do auto-saves on contents being modified
                                notepadEditor.on("contents-modified", () => this.save( notepadEditor ));
                            } else {
                                // Do auto-saves on contents being modified
                                notepadEditor.buffer.on("changed", () => this.save( notepadEditor ));
                            }
                        }

                        // Check for auto removal on destroyed
                        return notepadEditor.buffer.on("destroyed", () => this.autoRemove( notepadPath ));
                    });
                }
            }

            /* OPEN */
            open() {
                // Get the saved notepads for the project
                const savedNotepads = this.getSaved();

                // Get the current open Notepads
                const openNotepads = this.getOpen();

                // Make sure we have saved notepads to open
                if (savedNotepads.length > 0) {
                    // Loop through them, and open them up
                    return (() => {
                        const result = [];
                        for (let notepadFile of Array.from(savedNotepads)) {
                        // Setup the notepad file path for open
                            var notepadFilePath = this.getPath( notepadFile );

                            // Check if this notepad is already open by any chance
                            if (!Array.from(openNotepads).includes(notepadFile)) {
                                // Check for automatic removal
                                const notepadRemoved = this.autoRemove( notepadFilePath );

                                // Open the note pad if available - auto remove could remove it potentially
                                if (notepadRemoved === false) {
                                    // Notepad can be opened up now
                                    result.push(atom.project.open( notepadFilePath ).then(notepadEditor => {
                                        // Activate the note pad
                                        atom.workspace.getActivePane().activateItem( notepadEditor );

                                        // Auto-save on change - switch to contents-modified
                                        // Only do auto-save if enabled
                                        if (this.autosave === true) {
                                            // Attach save hooks based on atom mode
                                            if (atom.mode !== "spec") {
                                                // Do auto-saves on contents being modified
                                                notepadEditor.on("contents-modified", () => this.save( notepadEditor ));
                                            } else {
                                                // Do auto-saves on contents being modified
                                                notepadEditor.buffer.on("changed", () => this.save( notepadEditor ));
                                            }
                                        }

                                        // Check for auto removal on destroyed
                                        return notepadEditor.buffer.on("destroyed", () => this.autoRemove( notepadFilePath ));
                                    }));
                                } else {
                                    result.push(undefined);
                                }
                            } else {
                                result.push(undefined);
                            }
                        }
                        return result;
                    })();
                } else {
                    // Check if there are unsaved notepad buffers, if there are
                    // just switch to the first one there, don't open another one
                    // If there are no open unsaved notepad buffers, we want to open a new
                    // one, both the cases are handled properly by the `notebook:new-notepad`
                    // so just call it
                    return this.new();
                }
            }

            /* CLOSE */
            close() {
                // Get the current open editors
                const currentEditors = atom.workspace.getEditors();

                // Find all the open editors and see if they match a notepad path
                // If they match, close out that editor
                // Loop through the editors
                return (() => {
                    const result = [];
                    for (let currentEditor of Array.from(currentEditors)) {
                    // Check if base path of this editor path matches notepads base path
                        if (path.dirname( currentEditor.getPath() ) === this.getProjectNotepadsPath()) {
                            // Close the item in the pane
                            result.push(atom.workspace.getActivePane().destroyItem( currentEditor ));
                        } else {
                            result.push(undefined);
                        }
                    }
                    return result;
                })();
            }

            /* DELETE */
            delete() {
                // Get the active editor item if available
                const currentActiveEditorItem = atom.workspace.getActiveEditor();

                // Check first if our active item is an editor, otherwise we have nothing to do
                if (currentActiveEditorItem) {
                    // Check if the current editor is actually a notepad, otherwise we don't
                    // want to or have to do anything
                    if (path.dirname( currentActiveEditorItem.getPath() ) === this.getProjectNotepadsPath()) {
                        // Setup the open notepad file name
                        const currentOpenNotepadFile = path.basename( currentActiveEditorItem.getPath() );

                        // Get the saved notepads for the project
                        const savedNotepads = this.getSaved();

                        // Check if we have saved notepads, only then do we need to some additional work
                        if (savedNotepads.length === 0) {
                            // The current open notepad is unsaved, just close the editor and be done
                            return atom.workspace.getActivePane().destroyItem( currentActiveEditorItem );
                        } else {
                            // We have saved notepads, and this has to be one of them
                            // In spec mode do not do confirmations
                            let deleteConfirmation;
                            if (atom.mode === "spec") {
                                // Set delete confirmation to true
                                deleteConfirmation = true;
                            } else {
                                // Add the confirmation dialog before full delete
                                deleteConfirmation = atom.confirm({
                                    // Confirm dialog options
                                    message: `Delete ${currentOpenNotepadFile}?`,
                                    detailedMessage: "This action is irreversible, and the notepad will be permanently deleted. Are you sure?",
                                    buttons: {
                                        Yes() {
                                            // Delete has been confirmed
                                            return true;
                                        },
                                        No() {
                                            // Return false, since the delete was canceled
                                            return false;
                                        }
                                    }
                                });
                            }

                            // Check if the delete was confirmed
                            if (deleteConfirmation === true) {
                                // Close the item in the pane
                                atom.workspace.getActivePane().destroyItem( currentActiveEditorItem );

                                // Call the remove notepad, and let it handle the file removal
                                return this.remove( currentActiveEditorItem.getPath() );
                            }
                        }
                    }
                }
            }

            /* PURGE */
            purge() {
                // Close out all the notepads, in case there are open ones
                this.close();

                // Get the saved notepads for the project
                const savedNotepads = this.getSaved();

                // Make sure there are notepads to remove
                if (savedNotepads.length > 0) {
                    // In spec mode do not do confirmations
                    let purgeConfirmation;
                    if (atom.mode === "spec") {
                        // Set purge confirmation to true
                        purgeConfirmation = true;
                    } else {
                        // Add the confirmation dialog before purging notepads
                        purgeConfirmation = atom.confirm({
                            // Confirm dialog options
                            message: "Purge All Project Notepads?",
                            detailedMessage: "This action is irreversible, and all saved notepads will be permanently deleted. Are you sure?",
                            buttons: {
                                Yes() {
                                    // Purge has been confirmed
                                    return true;
                                },
                                No() {
                                    // Return false, since the purge was canceled
                                    return false;
                                }
                            }
                        });
                    }

                    // Check if the purge was confirmed
                    if (purgeConfirmation === true) {
                        // Loop through the notepads and build the paths
                        return Array.from(savedNotepads).map((notepadFile) =>
                            // Purge the notepad completely
                            this.remove( this.getPath( notepadFile ) ));
                    }
                }
            }

            /* INTERNAL ACTIONS */
            /* SAVE */
            save( notepadToSave ) {
                // Save the notepad
                return notepadToSave.save();
            }

            /* SAVE TO PROJECT */
            saveToProject() {
                // Get the current active pane item
                const currentActivePaneItem = atom.workspace.getActivePane().getActiveItem();

                // Check if we have a notepad file
                if (path.dirname( __guardMethod__(currentActivePaneItem, 'getPath', o => o.getPath() )) === this.getProjectNotepadsPath()) {
                    // Create a new save to project dialog view
                    if (SaveToProjectView == null) { SaveToProjectView = require("./views/save-to-project.coffee"); }

                    // Create the view object
                    const saveToProjectView = new SaveToProjectView( currentActivePaneItem.getPath() );

                    // Attach to the workspace view
                    return saveToProjectView.attach();
                }
            }

            /* REMOVE */
            remove( notepadFilePath ) {
                // Redundancy check to make sure notepad actually exists
                // If it exists, let us remove
                if (this.isNotepadSaved( notepadFilePath ) === true) {
                    // Destroy the notepad completely
                    return fs.unlinkSync(notepadFilePath);
                }
            }

            /* AUTO REMOVE */
            autoRemove( notepadFilePath ) {
                // Let us check here if the notepad just closed has any actual content, we are
                // going to clean it up if it has no verifiable content -> non-whitespace
                // characters in it, this is to avoid keeping around notepads with empty content,
                // and them always opening up on notebook:open-notepads.
                //
                // This happens only for saved notepads, which are not yet open. If the
                // empty saved notepad is already open, we don't touch it and leave it as is
                if ((this.isNotepadSaved( notepadFilePath ) === true) && (this.isNotepadEmpty( notepadFilePath ) === true)) {
                    // Check if we have auto remove empty set to true
                    if (this.autoRemoveEmpty === true) {
                        // This is possibly? an empty notepad with no valid content, let us
                        // not open it, and go one step further and remove it as well to
                        // tidy up and unclutter the notepads storage
                        this.remove( notepadFilePath );

                        // We have removed the notepad, return true
                        return true;
                    }
                }

                // Return false by default
                return false;
            }

            /* ACTIVATE PATH UPDATER */
            activatePathUpdater() {
                // Get the current active pane item
                const currentActivePaneItem = atom.workspace.getActivePane().getActiveItem();

                // Check if we have a notepad file
                if (path.dirname( __guardMethod__(currentActivePaneItem, 'getPath', o => o.getPath() )) === this.getProjectNotepadsPath()) {
                    // Check if we have the path updater already working
                    if (this.pathUpdater === null) {
                        // We need to start the path updater
                        return this.pathUpdater = setInterval(( () => this.updateDisplayPath() ), 5);
                    }
                } else {
                    // We are not a notepad related pane item, remove the path updater
                    // Clear the path updater
                    clearTimeout(this.pathUpdater);

                    // Set it back to null
                    return this.pathUpdater = null;
                }
            }

            /* VIEWS */
            /* UPDATE DISPLAY PATH */
            updateDisplayPath() {
                // Get the status bar file info path object
                const fileInfoElement = atom.workspaceView.find( ".status-bar .file-info .current-path" );

                // Make sure we have a valid one
                if (fileInfoElement) {
                    // Check if base path of file info status matches notepads base path
                    if (path.dirname( fileInfoElement.text() ) === this.getProjectNotepadsPath()) {
                        // Get the current active editor
                        const currentActiveEditorItem = atom.workspace.getActivePane().getActiveItem();

                        // Update the path to only display file name/title, no need for full path
                        return fileInfoElement.text( currentActiveEditorItem.getTitle() );
                    }
                }
            }

            /* COLLECTIONS */
            /* GET SAVED */
            getSaved() {
                // Set the notepads for the current project
                const projectNotepads = fs.readdirSync( this.getProjectNotepadsPath() );

                // Return the notepads
                return projectNotepads;
            }

            /* GET OPEN */
            getOpen( openType ) {
                // Setup the open type flag, if available otherwise default to all
                // Flags:
                //  - all: saved and temp notepads
                //  - saved: saved notepads only
                //  - temp: temp notepads only
                if (openType == null) { openType = "all"; }

                // Setup the return notepads
                const openNotepads = [];

                // Get the current open editors
                const currentEditors = atom.workspace.getEditors();

                // We want to get a list of currently opened notepads, even if they
                // aren't saved/persisted
                // Loop through the editors
                for (let currentEditor of Array.from(currentEditors)) {
                    // Check if base path of this editor path is same as the project notepads path
                    if (path.dirname( currentEditor.getPath() ) === this.getProjectNotepadsPath()) {
                        // Depending on the open type, determine whether to add to open notepads or not
                        if (openType === "all") {
                            // Add this editor object to the open notepads
                            openNotepads.push(path.basename( currentEditor.getPath() ));
                        } else if (openType === "saved") {
                            // Check if this open notepad is a saved one
                            if (this.isNotepadSaved( currentEditor.getPath() ) === true) {
                                // The open notepad is a saved notepad, add to open notepads return list
                                openNotepads.push(path.basename( currentEditor.getPath() ));
                            }
                        } else if (openType === "temp") {
                            // Check if this open notepad is an unsaved temp one
                            if (this.isNotepadSaved( currentEditor.getPath() ) === false) {
                                // The open notepad is a temp notepad, add to open notepads return list
                                openNotepads.push(path.basename( currentEditor.getPath() ));
                            }
                        }
                    }
                }

                // Return the open notepads
                return openNotepads;
            }

            /* PROPERTIES */
            /* GET NEW NOTEPAD FILE NAME */
            getNewNotepadFileName() {
                // Get the saved notepads for the project
                let notepadFile;
                const savedNotepads = this.getSaved();

                // Get currently open notepads based on their open type, we only want temp open
                const openTempNotepads = this.getOpen( "temp" );

                // Use Cases:
                //  1 - Currently open unsaved notepad, irrespective of other open/saved notepads
                //      - Behavior: Switch to open unsaved notepad
                //  2 - No open unsaved notepads, and no saved notepads either
                //      Behavior: Open a new notepad starting at 1
                //  3 - No open unsaved notepads, and saved notepads present
                //      Behavior: New notepad with next notepad index higher than last saved

                // Use Case: #1
                if (openTempNotepads.length !== 0) {
                    // We have an open temp notepad, just switch to that, no need to create one
                    // Let us get the sorted open notepads list
                    const sortedOpenTempNotepads = this.sortNotepads( openTempNotepads );

                    // Set the first notepad as the notepad file
                    notepadFile = sortedOpenTempNotepads[0];
                } else {
                    // Use Case: #2
                    if (savedNotepads.length === 0) {
                        // Start at notepad index 1
                        notepadFile = "notepad-1";
                    } else {
                        // Use Case: #3
                        if (savedNotepads.length > 0) {
                            // Let us get the sorted saved notepads in desc order
                            const reverseSortedSavedNotepads = this.sortNotepads( savedNotepads, "DESC" );

                            // Set the next index incremented from the first(highest) saved one
                            notepadFile = `notepad-${parseInt( reverseSortedSavedNotepads[0].split( "-" )[1] ) + 1}`;
                        }
                    }
                }

                // Return the notepad file we should use
                return notepadFile;
            }

            /* IS NOTEPAD SAVED */
            isNotepadSaved( notepadFilePath ) {
                // Just do a call to fs, and check if path is persisted and exists, and return
                return fs.existsSync( notepadFilePath );
            }

            /* IS NOTEPAD EMPTY */
            isNotepadEmpty( notepadFilePath ) {
                // Set notepad empty flag to false by default, safer route
                let notepadEmpty = false;

                // We want to check and see if a saved notepad is actually empty now, in which case
                // let us not keep it around (done elsewhere).
                //
                // The idea is to check if there is at least one non-whitespace character in the
                // contents of the notepad file
                //
                // Let us read in the contents of the notepad file
                const notepadContents = fs.readFileSync(notepadFilePath, { encoding: "utf8" });

                // Let now test to make sure the content is non-empty first, easy check
                if (notepadContents.length === 0) {
                    // The notepad content is an empty string of length 0, mark as empty
                    notepadEmpty = true;
                } else {
                    // The notepad content is not an empty string, and has some length
                    if (/\S/.test( notepadContents ) === false) {
                        // Looks like there is content in the notepad, but none which are non-whitespace
                        // Marking this as empty as well
                        notepadEmpty = true;
                    }
                }

                // Return the notepad empty flag
                return notepadEmpty;
            }

            /* ORDERING */
            /* SORT NOTEPADS */
            sortNotepads( notepadsList, direction ) {
                // Get the sorted version of given notepads list
                const sortedNotepads = notepadsList.sort(function( x, y ) {
                                                        // Get the indexes of the notepads
                                                        const a = parseInt(x.split( "-" )[1]);
                                                        const b = parseInt(y.split( "-" )[1]);

                                                        // Return the comparison
                                                        return a - b;
                });

                // Check if we received a direction, if not default it
                if (direction == null) { direction = "ASC"; }

                // Check the direction of the sort we want
                if (direction === "ASC") {
                    // Return the sorted list as is
                    return sortedNotepads;
                } else {
                    // Return the reverse of the sorted list in DESC case
                    return sortedNotepads.reverse();
                }
            }

            /* PATHS */
            /* GET PATH */
            getPath( notepadFileName ) {
                // Create the full path to the note pad file
                const notepadFilePath = path.join( this.getProjectNotepadsPath(), notepadFileName );

                // Return the path
                return notepadFilePath;
            }

            /* SET PATH */

            /* GET PROJECT NOTEPADS PATH */
            getProjectNotepadsPath() {
                // Return the current project notepads path
                return this.projectNotepadsPath;
            }

            /* SET PROJECT NOTEPADS PATH */
            setProjectNotepadsPath() {
                // Create the full path to the project notepads folder
                this.projectNotepadsPath = path.join(
                                        this.getStoragePath(),
                                        new Buffer( this.currentProject, "utf8" ).toString( "base64" )
                                    );

                // Check if project notepads path exists
                const projectNotepadsPathExists = fs.existsSync(this.projectNotepadsPath);

                // We don't seem to have it, lets try and create it
                if (!projectNotepadsPathExists) {
                    // Create the notepads directory
                    return fs.mkdir(this.projectNotepadsPath, createError => {
                        if (createError) {
                            // The storage path didn't exist and we couldn't create it either
                            console.log(`Project notepads folder '${this.projectNotepadsPath}' could not be created - ${createError}`);

                            // Error out
                            throw createError;
                        }
                    });
                }
            }

            /* GET STORAGE PATH */
            getStoragePath() {
                // Return the current notepads storage path
                return this.storagePath;
            }

            /* SET STORAGE PATH */
            setStoragePath() {
                // Check if we have a valid path provided
                if (!this.storagePath) {
                    // No path was provided, so let us build the default
                    this.storagePath = `${atom.getConfigDirPath()}/.notebook`;
                }

                // THIS IS SPECIAL HANDLING FOR MIGRATION FROM PROTONS
                // WILL BE REMOVED AFTER A CERTAIN PERIOD OF TIME AFTER PROTONS IS COMPLETELY RETIRED
                // Check if Proton existed and if we have any data in it
                const protonNotepadsStorageExists = fs.existsSync(path.join( atom.getConfigDirPath(), ".proton", "notepads" ));

                // Check if storage path exists
                const notepadsSavePathExists = fs.existsSync(this.storagePath);

                // Check if the protons notepads path existed
                if (protonNotepadsStorageExists && !notepadsSavePathExists) {
                    // If it exists, let us move the path to the new notebook storage
                    return fs.renameSync(path.join( atom.getConfigDirPath(), ".proton", "notepads" ), this.storagePath);
                } else {
                    // Doesn't look like proton notepads storage existed, just go ahead as normal
                    // We don't seem to have it, lets try and create it
                    if (!notepadsSavePathExists) {
                        // Create the notepads directory
                        return fs.mkdir(this.storagePath, createError => {
                            if (createError) {
                                // The storage path didn't exist and we couldn't create it either
                                console.log(`Notepads storage folder '${this.storagePath}' could not be created - ${createError}`);

                                // Error out
                                throw createError;
                            }
                        });
                    }
                }
            }
        };
        Notepads.initClass();
        return Notepads;
    })());
function __guardMethod__(obj, methodName, transform) {
  if (typeof obj !== 'undefined' && obj !== null && typeof obj[methodName] === 'function') {
    return transform(obj, methodName);
  } else {
    return undefined;
  }
}
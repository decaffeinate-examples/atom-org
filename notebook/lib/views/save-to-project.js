/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/* IMPORTS */
// core
let SaveToProjectView;
const path = require("path");
const fs = require("fs");

// atom
const {View, EditorView} = require('atom');

/* EXPORTS */
module.exports =
    (SaveToProjectView = class SaveToProjectView extends View {
        /* CONTENT */
        static content() {
            // Setup the wrapper
            return this.div({class: "notebook overlay from-top"}, () => {
                // Setup the container element
                return this.div({class: "dialog save-to-project"}, () => {
                    // Header
                    this.div({class: "header"}, () => {
                        return this.h3("Save To Project");
                    });

                    // Content
                    return this.div({class: "content"}, () => {
                        // Notes
                        this.div({class: "notes info"}, () => {
                            // Header
                            this.h5({outlet: "notesHeader"}, "");

                            // Content
                            return this.p({outlet: "notesContent"}, "");
                        });

                        // Form
                        return this.div({class: "form"}, () => {
                            // Field
                            return this.div({class: "field"}, () => {
                                // Label
                                this.label({for: "savePath"}, "Enter path to save notepad as (relative to project root)");
                                // Control
                                this.subview("savePath", new EditorView({ mini: true }));

                                // Error
                                return this.span({outlet: "saveError", class: "error-message"}, "");
                            });
                        });
                    });
                });
            });
        }

        /* CONSTRUCTOR */
        constructor( notepadFilePath ) {
            // Setup the notepad file path for later usage
            {
              // Hack: trick Babel/TypeScript into allowing this before super.
              if (false) { super(); }
              let thisFn = (() => { return this; }).toString();
              let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
              eval(`${thisName} = this;`);
            }
            this.notepadToSaveFilePath = notepadFilePath;

            // Call the super
            super(...arguments);
        }

        /* INITIALIZE */
        initialize() {
            // Setup the notice message based on current configuration
            const deleteOnSaveToProject = atom.config.get( "notebook.removeNotepadOnSavingToProject" );

            // Check if it is true
            if (deleteOnSaveToProject === true) {
                // Set the content appropriately
                this.notesHeader.text( "This notepad will be deleted after saving to project" );
                this.notesContent.text( "If you would like to keep the notepad, disable 'Remove Notepad On Saving To Project' in the package settings" );
            } else {
                // Set the content appropriately
                this.notesHeader.text( "This notepad will NOT be deleted after saving to project" );
                this.notesContent.text( "If you would like to delete it after save, enable 'Remove Notepad On Saving To Project' in the package settings" );
            }

            // Setup the confirm & cancel event handlers
            this.on("core:confirm", () => this.save( this.savePath.getText() ));
            this.on("core:cancel", () => this.close());

            // If the focus is lost from the save path field, assume cancel
            this.savePath.hiddenInput.on("focusout", () => this.remove());
            return this.savePath.getEditor().getBuffer().on("changed", () => this.error());
        }

        /* ATTACH */
        attach() {
            // Append the view to the workspace now
            atom.workspaceView.append( this );

            // Give focus to the path entry field
            this.savePath.focus();
            return this.savePath.scrollToCursorPosition();
        }

        /* CLOSE */
        close() {
            // Remove the view now
            this.remove();

            // Return back focus to the workspace
            return atom.workspaceView.focus();
        }

        /* SAVE */
        save( relativePathToSave ) {
            // Create the regular expressions for path testing
            const startRegExp = new RegExp( "^" + path.sep );
            const endRegExp = new RegExp( path.sep + "$" );

            // Test for file ending with directory separator
            const startsWithDirectorySeparator = startRegExp.test( relativePathToSave );
            const endsWithDirectorySeparator = endRegExp.test( relativePathToSave );

            // If the path starts with directory separator, remove the starting separator
            if (startsWithDirectorySeparator) {
                // Create the new relative path
                relativePathToSave = relativePathToSave.replace( path.sep, "" );
            }

            // Relativize the path from project root
            const filePathToCreate = atom.project.resolve( relativePathToSave );

            // See if we can get a valid relative path within project
            if (!filePathToCreate) { return; }

            // Wrap the FS to catch any errors
            try {
                // Check if there already exists a file at the path
                if (fs.existsSync( filePathToCreate )) {
                    // Path already exists, cannot/do not overwrite
                    return this.error( `'${filePathToCreate}' already exists` );
                } else {
                    // Verify the slash at end is not present
                    if (endsWithDirectorySeparator) {
                        // Throw error
                        return this.error( `File names must not end with a '${path.sep}' character` );
                    } else {
                        console.log(`Will create the file ${filePathToCreate}`);
                        console.log(`Source notepad file is ${this.notepadToSaveFilePath}`);
                        // We seem to be fine now, let us go ahead and try creating the file
                        fs.writeFileSync( filePathToCreate, fs.readFileSync( this.notepadToSaveFilePath ) );

                        // Open up the newly saved file
                        return atom.project.open( filePathToCreate ).then(newProjectFileEditor => {
                            console.log(`Opened new project file: ${newProjectFileEditor.getPath()}`);

                            // Activate the new project file
                            atom.workspace.getActivePane().activateItem( newProjectFileEditor );

                            // Setup the notice message based on current configuration
                            const deleteOnSaveToProject = atom.config.get( "notebook.removeNotepadOnSavingToProject" );

                            // Check if it is true
                            if (deleteOnSaveToProject === true) {
                                // We need to remove the notepad which we just saved to project
                                // First let us close out the open notepad in the workspace
                                // Get the current open editors
                                const currentEditors = atom.workspace.getEditors();

                                // Find all the open editors and see if they match the saved notepad
                                // If they match, close out that editor
                                // Loop through the editors
                                for (let currentEditor of Array.from(currentEditors)) {
                                    // Check if paths match
                                    if (currentEditor.getPath() === this.notepadToSaveFilePath) {
                                        console.log(`Closing out the notepad now: ${this.notepadToSaveFilePath}`);
                                        // Close the item in the pane
                                        atom.workspace.getActivePane().destroyItem( currentEditor );
                                    }
                                }

                                // Destroy the notepad now completely
                                fs.unlinkSync(this.notepadToSaveFilePath);
                                console.log(`Removed notepad file: ${this.notepadToSaveFilePath}`);
                            }

                            // Close out the save to project view
                            return this.close();
                        });
                    }
                }
            } catch (createError) {
                // Display any error messages we might have gotten
                return this.error( `${createError.message}` );
            }
        }

        /* ERROR */
        error( message ) {
            // Set the error message
            if (message == null) { message = ''; }
            this.saveError.text( message );

            // Flash
            if (message) { return this.flashError(); }
        }
    });
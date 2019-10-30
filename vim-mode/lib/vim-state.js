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
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let VimState
const Grim = require('grim')
const _ = require('underscore-plus')
const { Point, Range } = require('atom')
const { Emitter, Disposable, CompositeDisposable } = require('event-kit')
const settings = require('./settings')

const Operators = require('./operators/index')
const Prefixes = require('./prefixes')
const Motions = require('./motions/index')
const InsertMode = require('./insert-mode')

const TextObjects = require('./text-objects')
const Utils = require('./utils')
const Scroll = require('./scroll')

module.exports =
(VimState = (function () {
  VimState = class VimState {
    static initClass () {
      this.prototype.editor = null
      this.prototype.opStack = null
      this.prototype.mode = null
      this.prototype.submode = null
      this.prototype.destroyed = false
      this.prototype.replaceModeListener = null
    }

    constructor (editorElement, statusBarManager, globalVimState) {
      this.replaceModeInsertHandler = this.replaceModeInsertHandler.bind(this)
      this.replaceModeUndoHandler = this.replaceModeUndoHandler.bind(this)
      this.checkSelections = this.checkSelections.bind(this)
      this.ensureCursorsWithinLine = this.ensureCursorsWithinLine.bind(this)
      this.editorElement = editorElement
      this.statusBarManager = statusBarManager
      this.globalVimState = globalVimState
      this.emitter = new Emitter()
      this.subscriptions = new CompositeDisposable()
      this.editor = this.editorElement.getModel()
      this.opStack = []
      this.history = []
      this.marks = {}
      this.subscriptions.add(this.editor.onDidDestroy(() => this.destroy()))

      this.editorElement.addEventListener('mouseup', this.checkSelections)
      if (atom.commands.onDidDispatch != null) {
        this.subscriptions.add(atom.commands.onDidDispatch(e => {
          if (e.target === this.editorElement) {
            return this.checkSelections()
          }
        })
        )
      }

      this.editorElement.classList.add('vim-mode')
      this.setupNormalMode()
      if (settings.startInInsertMode()) {
        this.activateInsertMode()
      } else {
        this.activateNormalMode()
      }
    }

    destroy () {
      if (!this.destroyed) {
        this.destroyed = true
        this.subscriptions.dispose()
        if (this.editor.isAlive()) {
          this.deactivateInsertMode()
          if (this.editorElement.component != null) {
            this.editorElement.component.setInputEnabled(true)
          }
          this.editorElement.classList.remove('vim-mode')
          this.editorElement.classList.remove('normal-mode')
        }
        this.editorElement.removeEventListener('mouseup', this.checkSelections)
        this.editor = null
        this.editorElement = null
        return this.emitter.emit('did-destroy')
      }
    }

    // Private: Creates the plugin's bindings
    //
    // Returns nothing.
    setupNormalMode () {
      this.registerCommands({
        'activate-normal-mode': () => this.activateNormalMode(),
        'activate-linewise-visual-mode': () => this.activateVisualMode('linewise'),
        'activate-characterwise-visual-mode': () => this.activateVisualMode('characterwise'),
        'activate-blockwise-visual-mode': () => this.activateVisualMode('blockwise'),
        'reset-normal-mode': () => this.resetNormalMode(),
        'repeat-prefix': e => this.repeatPrefix(e),
        'reverse-selections': e => this.reverseSelections(e),
        undo: e => this.undo(e),
        'replace-mode-backspace': () => this.replaceModeUndo(),
        'insert-mode-put': e => this.insertRegister(this.registerName(e)),
        'copy-from-line-above': () => InsertMode.copyCharacterFromAbove(this.editor, this),
        'copy-from-line-below': () => InsertMode.copyCharacterFromBelow(this.editor, this)
      })

      return this.registerOperationCommands({
        'activate-insert-mode': () => new Operators.Insert(this.editor, this),
        'activate-replace-mode': () => new Operators.ReplaceMode(this.editor, this),
        substitute: () => [new Operators.Change(this.editor, this), new Motions.MoveRight(this.editor, this)],
        'substitute-line': () => [new Operators.Change(this.editor, this), new Motions.MoveToRelativeLine(this.editor, this)],
        'insert-after': () => new Operators.InsertAfter(this.editor, this),
        'insert-after-end-of-line': () => new Operators.InsertAfterEndOfLine(this.editor, this),
        'insert-at-beginning-of-line': () => new Operators.InsertAtBeginningOfLine(this.editor, this),
        'insert-above-with-newline': () => new Operators.InsertAboveWithNewline(this.editor, this),
        'insert-below-with-newline': () => new Operators.InsertBelowWithNewline(this.editor, this),
        delete: () => this.linewiseAliasedOperator(Operators.Delete),
        change: () => this.linewiseAliasedOperator(Operators.Change),
        'change-to-last-character-of-line': () => [new Operators.Change(this.editor, this), new Motions.MoveToLastCharacterOfLine(this.editor, this)],
        'delete-right': () => [new Operators.Delete(this.editor, this), new Motions.MoveRight(this.editor, this)],
        'delete-left': () => [new Operators.Delete(this.editor, this), new Motions.MoveLeft(this.editor, this)],
        'delete-to-last-character-of-line': () => [new Operators.Delete(this.editor, this), new Motions.MoveToLastCharacterOfLine(this.editor, this)],
        'toggle-case': () => new Operators.ToggleCase(this.editor, this),
        'upper-case': () => new Operators.UpperCase(this.editor, this),
        'lower-case': () => new Operators.LowerCase(this.editor, this),
        'toggle-case-now': () => new Operators.ToggleCase(this.editor, this, { complete: true }),
        yank: () => this.linewiseAliasedOperator(Operators.Yank),
        'yank-line': () => [new Operators.Yank(this.editor, this), new Motions.MoveToRelativeLine(this.editor, this)],
        'put-before': () => new Operators.Put(this.editor, this, { location: 'before' }),
        'put-after': () => new Operators.Put(this.editor, this, { location: 'after' }),
        join: () => new Operators.Join(this.editor, this),
        indent: () => this.linewiseAliasedOperator(Operators.Indent),
        outdent: () => this.linewiseAliasedOperator(Operators.Outdent),
        'auto-indent': () => this.linewiseAliasedOperator(Operators.Autoindent),
        increase: () => new Operators.Increase(this.editor, this),
        decrease: () => new Operators.Decrease(this.editor, this),
        'move-left': () => new Motions.MoveLeft(this.editor, this),
        'move-up': () => new Motions.MoveUp(this.editor, this),
        'move-down': () => new Motions.MoveDown(this.editor, this),
        'move-right': () => new Motions.MoveRight(this.editor, this),
        'move-to-next-word': () => new Motions.MoveToNextWord(this.editor, this),
        'move-to-next-whole-word': () => new Motions.MoveToNextWholeWord(this.editor, this),
        'move-to-end-of-word': () => new Motions.MoveToEndOfWord(this.editor, this),
        'move-to-end-of-whole-word': () => new Motions.MoveToEndOfWholeWord(this.editor, this),
        'move-to-previous-word': () => new Motions.MoveToPreviousWord(this.editor, this),
        'move-to-previous-whole-word': () => new Motions.MoveToPreviousWholeWord(this.editor, this),
        'move-to-next-paragraph': () => new Motions.MoveToNextParagraph(this.editor, this),
        'move-to-next-sentence': () => new Motions.MoveToNextSentence(this.editor, this),
        'move-to-previous-sentence': () => new Motions.MoveToPreviousSentence(this.editor, this),
        'move-to-previous-paragraph': () => new Motions.MoveToPreviousParagraph(this.editor, this),
        'move-to-first-character-of-line': () => new Motions.MoveToFirstCharacterOfLine(this.editor, this),
        'move-to-first-character-of-line-and-down': () => new Motions.MoveToFirstCharacterOfLineAndDown(this.editor, this),
        'move-to-last-character-of-line': () => new Motions.MoveToLastCharacterOfLine(this.editor, this),
        'move-to-last-nonblank-character-of-line-and-down': () => new Motions.MoveToLastNonblankCharacterOfLineAndDown(this.editor, this),
        'move-to-beginning-of-line': e => this.moveOrRepeat(e),
        'move-to-first-character-of-line-up': () => new Motions.MoveToFirstCharacterOfLineUp(this.editor, this),
        'move-to-first-character-of-line-down': () => new Motions.MoveToFirstCharacterOfLineDown(this.editor, this),
        'move-to-start-of-file': () => new Motions.MoveToStartOfFile(this.editor, this),
        'move-to-line': () => new Motions.MoveToAbsoluteLine(this.editor, this),
        'move-to-top-of-screen': () => new Motions.MoveToTopOfScreen(this.editorElement, this),
        'move-to-bottom-of-screen': () => new Motions.MoveToBottomOfScreen(this.editorElement, this),
        'move-to-middle-of-screen': () => new Motions.MoveToMiddleOfScreen(this.editorElement, this),
        'scroll-down': () => new Scroll.ScrollDown(this.editorElement),
        'scroll-up': () => new Scroll.ScrollUp(this.editorElement),
        'scroll-cursor-to-top': () => new Scroll.ScrollCursorToTop(this.editorElement),
        'scroll-cursor-to-top-leave': () => new Scroll.ScrollCursorToTop(this.editorElement, { leaveCursor: true }),
        'scroll-cursor-to-middle': () => new Scroll.ScrollCursorToMiddle(this.editorElement),
        'scroll-cursor-to-middle-leave': () => new Scroll.ScrollCursorToMiddle(this.editorElement, { leaveCursor: true }),
        'scroll-cursor-to-bottom': () => new Scroll.ScrollCursorToBottom(this.editorElement),
        'scroll-cursor-to-bottom-leave': () => new Scroll.ScrollCursorToBottom(this.editorElement, { leaveCursor: true }),
        'scroll-half-screen-up': () => new Motions.ScrollHalfUpKeepCursor(this.editorElement, this),
        'scroll-full-screen-up': () => new Motions.ScrollFullUpKeepCursor(this.editorElement, this),
        'scroll-half-screen-down': () => new Motions.ScrollHalfDownKeepCursor(this.editorElement, this),
        'scroll-full-screen-down': () => new Motions.ScrollFullDownKeepCursor(this.editorElement, this),
        'scroll-cursor-to-left': () => new Scroll.ScrollCursorToLeft(this.editorElement),
        'scroll-cursor-to-right': () => new Scroll.ScrollCursorToRight(this.editorElement),
        'select-inside-word': () => new TextObjects.SelectInsideWord(this.editor),
        'select-inside-whole-word': () => new TextObjects.SelectInsideWholeWord(this.editor),
        'select-inside-double-quotes': () => new TextObjects.SelectInsideQuotes(this.editor, '"', false),
        'select-inside-single-quotes': () => new TextObjects.SelectInsideQuotes(this.editor, '\'', false),
        'select-inside-back-ticks': () => new TextObjects.SelectInsideQuotes(this.editor, '`', false),
        'select-inside-curly-brackets': () => new TextObjects.SelectInsideBrackets(this.editor, '{', '}', false),
        'select-inside-angle-brackets': () => new TextObjects.SelectInsideBrackets(this.editor, '<', '>', false),
        'select-inside-tags': () => new TextObjects.SelectInsideBrackets(this.editor, '>', '<', false),
        'select-inside-square-brackets': () => new TextObjects.SelectInsideBrackets(this.editor, '[', ']', false),
        'select-inside-parentheses': () => new TextObjects.SelectInsideBrackets(this.editor, '(', ')', false),
        'select-inside-paragraph': () => new TextObjects.SelectInsideParagraph(this.editor, false),
        'select-a-word': () => new TextObjects.SelectAWord(this.editor),
        'select-a-whole-word': () => new TextObjects.SelectAWholeWord(this.editor),
        'select-around-double-quotes': () => new TextObjects.SelectInsideQuotes(this.editor, '"', true),
        'select-around-single-quotes': () => new TextObjects.SelectInsideQuotes(this.editor, '\'', true),
        'select-around-back-ticks': () => new TextObjects.SelectInsideQuotes(this.editor, '`', true),
        'select-around-curly-brackets': () => new TextObjects.SelectInsideBrackets(this.editor, '{', '}', true),
        'select-around-angle-brackets': () => new TextObjects.SelectInsideBrackets(this.editor, '<', '>', true),
        'select-around-square-brackets': () => new TextObjects.SelectInsideBrackets(this.editor, '[', ']', true),
        'select-around-parentheses': () => new TextObjects.SelectInsideBrackets(this.editor, '(', ')', true),
        'select-around-paragraph': () => new TextObjects.SelectAParagraph(this.editor, true),
        'register-prefix': e => this.registerPrefix(e),
        repeat: e => new Operators.Repeat(this.editor, this),
        'repeat-search': e => new Motions.RepeatSearch(this.editor, this),
        'repeat-search-backwards': e => new Motions.RepeatSearch(this.editor, this).reversed(),
        'move-to-mark': e => new Motions.MoveToMark(this.editor, this),
        'move-to-mark-literal': e => new Motions.MoveToMark(this.editor, this, false),
        mark: e => new Operators.Mark(this.editor, this),
        find: e => new Motions.Find(this.editor, this),
        'find-backwards': e => new Motions.Find(this.editor, this).reverse(),
        till: e => new Motions.Till(this.editor, this),
        'till-backwards': e => new Motions.Till(this.editor, this).reverse(),
        'repeat-find': e => { if (this.globalVimState.currentFind) { return new this.globalVimState.currentFind.constructor(this.editor, this, { repeated: true }) } },
        'repeat-find-reverse': e => { if (this.globalVimState.currentFind) { return new this.globalVimState.currentFind.constructor(this.editor, this, { repeated: true, reverse: true }) } },
        replace: e => new Operators.Replace(this.editor, this),
        search: e => new Motions.Search(this.editor, this),
        'reverse-search': e => (new Motions.Search(this.editor, this)).reversed(),
        'search-current-word': e => new Motions.SearchCurrentWord(this.editor, this),
        'bracket-matching-motion': e => new Motions.BracketMatchingMotion(this.editor, this),
        'reverse-search-current-word': e => (new Motions.SearchCurrentWord(this.editor, this)).reversed()
      })
    }

    // Private: Register multiple command handlers via an {Object} that maps
    // command names to command handler functions.
    //
    // Prefixes the given command names with 'vim-mode:' to reduce redundancy in
    // the provided object.
    registerCommands (commands) {
      return (() => {
        const result = []
        for (var commandName in commands) {
          const fn = commands[commandName]
          result.push((fn => {
            return this.subscriptions.add(atom.commands.add(this.editorElement, `vim-mode:${commandName}`, fn))
          })(fn))
        }
        return result
      })()
    }

    // Private: Register multiple Operators via an {Object} that
    // maps command names to functions that return operations to push.
    //
    // Prefixes the given command names with 'vim-mode:' to reduce redundancy in
    // the given object.
    registerOperationCommands (operationCommands) {
      const commands = {}
      for (var commandName in operationCommands) {
        const operationFn = operationCommands[commandName];
        (operationFn => {
          return commands[commandName] = event => this.pushOperations(operationFn(event))
        })(operationFn)
      }
      return this.registerCommands(commands)
    }

    // Private: Push the given operations onto the operation stack, then process
    // it.
    pushOperations (operations) {
      if (operations == null) { return }
      if (!_.isArray(operations)) { operations = [operations] }

      return (() => {
        const result = []
        for (const operation of Array.from(operations)) {
        // Motions in visual mode perform their selections.
          var topOp
          if ((this.mode === 'visual') && (operation instanceof Motions.Motion || operation instanceof TextObjects.TextObject)) {
            operation.execute = operation.select
          }

          // if we have started an operation that responds to canComposeWith check if it can compose
          // with the operation we're going to push onto the stack
          if (((topOp = this.topOperation()) != null) && (topOp.canComposeWith != null) && !topOp.canComposeWith(operation)) {
            this.resetNormalMode()
            this.emitter.emit('failed-to-compose')
            break
          }

          this.opStack.push(operation)

          // If we've received an operator in visual mode, mark the current
          // selection as the motion to operate on.
          if ((this.mode === 'visual') && operation instanceof Operators.Operator) {
            this.opStack.push(new Motions.CurrentSelection(this.editor, this))
          }

          result.push(this.processOpStack())
        }
        return result
      })()
    }

    onDidFailToCompose (fn) {
      return this.emitter.on('failed-to-compose', fn)
    }

    onDidDestroy (fn) {
      return this.emitter.on('did-destroy', fn)
    }

    // Private: Removes all operations from the stack.
    //
    // Returns nothing.
    clearOpStack () {
      return this.opStack = []
    }

    undo () {
      this.editor.undo()
      return this.activateNormalMode()
    }

    // Private: Processes the command if the last operation is complete.
    //
    // Returns nothing.
    processOpStack () {
      if (!(this.opStack.length > 0)) {
        return
      }

      if (!this.topOperation().isComplete()) {
        if ((this.mode === 'normal') && this.topOperation() instanceof Operators.Operator) {
          this.activateOperatorPendingMode()
        }
        return
      }

      const poppedOperation = this.opStack.pop()
      if (this.opStack.length) {
        try {
          this.topOperation().compose(poppedOperation)
          return this.processOpStack()
        } catch (e) {
          if ((e instanceof Operators.OperatorError) || (e instanceof Motions.MotionError)) {
            return this.resetNormalMode()
          } else {
            throw e
          }
        }
      } else {
        if (poppedOperation.isRecordable()) { this.history.unshift(poppedOperation) }
        return poppedOperation.execute()
      }
    }

    // Private: Fetches the last operation.
    //
    // Returns the last operation.
    topOperation () {
      return _.last(this.opStack)
    }

    // Private: Fetches the value of a given register.
    //
    // name - The name of the register to fetch.
    //
    // Returns the value of the given register or undefined if it hasn't
    // been set.
    getRegister (name) {
      let text, type
      if (name === '"') {
        name = settings.defaultRegister()
      }
      if (['*', '+'].includes(name)) {
        text = atom.clipboard.read()
        type = Utils.copyType(text)
        return { text, type }
      } else if (name === '%') {
        text = this.editor.getURI()
        type = Utils.copyType(text)
        return { text, type }
      } else if (name === '_') { // Blackhole always returns nothing
        text = ''
        type = Utils.copyType(text)
        return { text, type }
      } else {
        return this.globalVimState.registers[name.toLowerCase()]
      }
    }

    // Private: Fetches the value of a given mark.
    //
    // name - The name of the mark to fetch.
    //
    // Returns the value of the given mark or undefined if it hasn't
    // been set.
    getMark (name) {
      if (this.marks[name]) {
        return this.marks[name].getBufferRange().start
      } else {
        return undefined
      }
    }

    // Private: Sets the value of a given register.
    //
    // name  - The name of the register to fetch.
    // value - The value to set the register to.
    //
    // Returns nothing.
    setRegister (name, value) {
      if (name === '"') {
        name = settings.defaultRegister()
      }
      if (['*', '+'].includes(name)) {
        return atom.clipboard.write(value.text)
      } else if (name === '_') {
        // Blackhole register, nothing to do
      } else if (/^[A-Z]$/.test(name)) {
        return this.appendRegister(name.toLowerCase(), value)
      } else {
        return this.globalVimState.registers[name] = value
      }
    }

    // Private: append a value into a given register
    // like setRegister, but appends the value
    appendRegister (name, value) {
      const register = this.globalVimState.registers[name] != null ? this.globalVimState.registers[name] : (this.globalVimState.registers[name] = {
        type: 'character',
        text: ''
      })
      if ((register.type === 'linewise') && (value.type !== 'linewise')) {
        return register.text += value.text + '\n'
      } else if ((register.type !== 'linewise') && (value.type === 'linewise')) {
        register.text += '\n' + value.text
        return register.type = 'linewise'
      } else {
        return register.text += value.text
      }
    }

    // Private: Sets the value of a given mark.
    //
    // name  - The name of the mark to fetch.
    // pos {Point} - The value to set the mark to.
    //
    // Returns nothing.
    setMark (name, pos) {
      // check to make sure name is in [a-z] or is `
      let charCode
      if (((charCode = name.charCodeAt(0)) >= 96) && (charCode <= 122)) {
        const marker = this.editor.markBufferRange(new Range(pos, pos), { invalidate: 'never', persistent: false })
        return this.marks[name] = marker
      }
    }

    // Public: Append a search to the search history.
    //
    // Motions.Search - The confirmed search motion to append
    //
    // Returns nothing
    pushSearchHistory (search) {
      return this.globalVimState.searchHistory.unshift(search)
    }

    // Public: Get the search history item at the given index.
    //
    // index - the index of the search history item
    //
    // Returns a search motion
    getSearchHistoryItem (index) {
      if (index == null) { index = 0 }
      return this.globalVimState.searchHistory[index]
    }

    // #############################################################################
    // Mode Switching
    // #############################################################################

    // Private: Used to enable normal mode.
    //
    // Returns nothing.
    activateNormalMode () {
      this.deactivateInsertMode()
      this.deactivateVisualMode()

      this.mode = 'normal'
      this.submode = null

      this.changeModeClass('normal-mode')

      this.clearOpStack()
      for (const selection of Array.from(this.editor.getSelections())) { selection.clear({ autoscroll: false }) }
      this.ensureCursorsWithinLine()

      return this.updateStatusBar()
    }

    // TODO: remove this method and bump the `vim-mode` service version number.
    activateCommandMode () {
      Grim.deprecate('Use ::activateNormalMode instead')
      return this.activateNormalMode()
    }

    // Private: Used to enable insert mode.
    //
    // Returns nothing.
    activateInsertMode (subtype = null) {
      this.mode = 'insert'
      this.editorElement.component.setInputEnabled(true)
      this.setInsertionCheckpoint()
      this.submode = subtype
      this.changeModeClass('insert-mode')
      return this.updateStatusBar()
    }

    activateReplaceMode () {
      this.activateInsertMode('replace')
      this.replaceModeCounter = 0
      this.editorElement.classList.add('replace-mode')
      this.subscriptions.add(this.replaceModeListener = this.editor.onWillInsertText(this.replaceModeInsertHandler))
      return this.subscriptions.add(this.replaceModeUndoListener = this.editor.onDidInsertText(this.replaceModeUndoHandler))
    }

    replaceModeInsertHandler (event) {
      const chars = (event.text != null ? event.text.split('') : undefined) || []
      const selections = this.editor.getSelections()
      for (const char of Array.from(chars)) {
        if (char === '\n') { continue }
        for (const selection of Array.from(selections)) {
          if (!selection.cursor.isAtEndOfLine()) { selection.delete() }
        }
      }
    }

    replaceModeUndoHandler (event) {
      return this.replaceModeCounter++
    }

    replaceModeUndo () {
      if (this.replaceModeCounter > 0) {
        this.editor.undo()
        this.editor.undo()
        this.editor.moveLeft()
        return this.replaceModeCounter--
      }
    }

    setInsertionCheckpoint () {
      if (this.insertionCheckpoint == null) { return this.insertionCheckpoint = this.editor.createCheckpoint() }
    }

    deactivateInsertMode () {
      if (![null, 'insert'].includes(this.mode)) { return }
      this.editorElement.component.setInputEnabled(false)
      this.editorElement.classList.remove('replace-mode')
      this.editor.groupChangesSinceCheckpoint(this.insertionCheckpoint)
      const changes = this.editor.buffer.getChangesSinceCheckpoint(this.insertionCheckpoint)
      const item = this.inputOperator(this.history[0])
      this.insertionCheckpoint = null
      if (item != null) {
        item.confirmChanges(changes)
      }
      for (const cursor of Array.from(this.editor.getCursors())) {
        if (!cursor.isAtBeginningOfLine()) { cursor.moveLeft() }
      }
      if (this.replaceModeListener != null) {
        this.replaceModeListener.dispose()
        this.subscriptions.remove(this.replaceModeListener)
        this.replaceModeListener = null
        this.replaceModeUndoListener.dispose()
        this.subscriptions.remove(this.replaceModeUndoListener)
        return this.replaceModeUndoListener = null
      }
    }

    deactivateVisualMode () {
      if (this.mode !== 'visual') { return }
      return (() => {
        const result = []
        for (const selection of Array.from(this.editor.getSelections())) {
          if (!selection.isEmpty() && !selection.isReversed()) { result.push(selection.cursor.moveLeft()) } else {
            result.push(undefined)
          }
        }
        return result
      })()
    }

    // Private: Get the input operator that needs to be told about about the
    // typed undo transaction in a recently completed operation, if there
    // is one.
    inputOperator (item) {
      if (item == null) { return item }
      if (typeof item.inputOperator === 'function' ? item.inputOperator() : undefined) { return item }
      if (__guardMethod__(item.composedObject, 'inputOperator', o => o.inputOperator())) { return item.composedObject }
    }

    // Private: Used to enable visual mode.
    //
    // type - One of 'characterwise', 'linewise' or 'blockwise'
    //
    // Returns nothing.
    activateVisualMode (type) {
      // Already in 'visual', this means one of following command is
      // executed within `vim-mode.visual-mode`
      //  * activate-blockwise-visual-mode
      //  * activate-characterwise-visual-mode
      //  * activate-linewise-visual-mode
      if (this.mode === 'visual') {
        let end, originalRange, row, selection, start
        if (this.submode === type) {
          this.activateNormalMode()
          return
        }

        this.submode = type
        if (this.submode === 'linewise') {
          for (selection of Array.from(this.editor.getSelections())) {
            // Keep original range as marker's property to get back
            // to characterwise.
            // Since selectLine lost original cursor column.
            var asc, end1
            originalRange = selection.getBufferRange()
            selection.marker.setProperties({ originalRange });
            [start, end] = Array.from(selection.getBufferRowRange())
            for (row = start, end1 = end, asc = start <= end1; asc ? row <= end1 : row >= end1; asc ? row++ : row--) { selection.selectLine(row) }
          }
        } else if (['characterwise', 'blockwise'].includes(this.submode)) {
          // Currently, 'blockwise' is not yet implemented.
          // So treat it as characterwise.
          // Recover original range.
          for (selection of Array.from(this.editor.getSelections())) {
            ({ originalRange } = selection.marker.getProperties())
            if (originalRange) {
              const [startRow, endRow] = Array.from(selection.getBufferRowRange())
              originalRange.start.row = startRow
              originalRange.end.row = endRow
              selection.setBufferRange(originalRange)
            }
          }
        }
      } else {
        this.deactivateInsertMode()
        this.mode = 'visual'
        this.submode = type
        this.changeModeClass('visual-mode')

        if (this.submode === 'linewise') {
          this.editor.selectLinesContainingCursors()
        } else if (this.editor.getSelectedText() === '') {
          this.editor.selectRight()
        }
      }

      return this.updateStatusBar()
    }

    // Private: Used to re-enable visual mode
    resetVisualMode () {
      return this.activateVisualMode(this.submode)
    }

    // Private: Used to enable operator-pending mode.
    activateOperatorPendingMode () {
      this.deactivateInsertMode()
      this.mode = 'operator-pending'
      this.submode = null
      this.changeModeClass('operator-pending-mode')

      return this.updateStatusBar()
    }

    changeModeClass (targetMode) {
      return ['normal-mode', 'insert-mode', 'visual-mode', 'operator-pending-mode'].map((mode) =>
        mode === targetMode
          ? this.editorElement.classList.add(mode)
          : this.editorElement.classList.remove(mode))
    }

    // Private: Resets the normal mode back to it's initial state.
    //
    // Returns nothing.
    resetNormalMode () {
      this.clearOpStack()
      this.editor.clearSelections()
      return this.activateNormalMode()
    }

    // Private: A generic way to create a Register prefix based on the event.
    //
    // e - The event that triggered the Register prefix.
    //
    // Returns nothing.
    registerPrefix (e) {
      return new Prefixes.Register(this.registerName(e))
    }

    // Private: Gets a register name from a keyboard event
    //
    // e - The event
    //
    // Returns the name of the register
    registerName (e) {
      const keyboardEvent = (e.originalEvent != null ? e.originalEvent.originalEvent : undefined) != null ? (e.originalEvent != null ? e.originalEvent.originalEvent : undefined) : e.originalEvent
      let name = atom.keymaps.keystrokeForKeyboardEvent(keyboardEvent)
      if (name.lastIndexOf('shift-', 0) === 0) {
        name = name.slice(6)
      }
      return name
    }

    // Private: A generic way to create a Number prefix based on the event.
    //
    // e - The event that triggered the Number prefix.
    //
    // Returns nothing.
    repeatPrefix (e) {
      const keyboardEvent = (e.originalEvent != null ? e.originalEvent.originalEvent : undefined) != null ? (e.originalEvent != null ? e.originalEvent.originalEvent : undefined) : e.originalEvent
      const num = parseInt(atom.keymaps.keystrokeForKeyboardEvent(keyboardEvent))
      if (this.topOperation() instanceof Prefixes.Repeat) {
        return this.topOperation().addDigit(num)
      } else {
        if (num === 0) {
          return e.abortKeyBinding()
        } else {
          return this.pushOperations(new Prefixes.Repeat(num))
        }
      }
    }

    reverseSelections () {
      const reversed = !this.editor.getLastSelection().isReversed()
      return Array.from(this.editor.getSelections()).map((selection) =>
        selection.setBufferRange(selection.getBufferRange(), { reversed }))
    }

    // Private: Figure out whether or not we are in a repeat sequence or we just
    // want to move to the beginning of the line. If we are within a repeat
    // sequence, we pass control over to @repeatPrefix.
    //
    // e - The triggered event.
    //
    // Returns new motion or nothing.
    moveOrRepeat (e) {
      if (this.topOperation() instanceof Prefixes.Repeat) {
        this.repeatPrefix(e)
        return null
      } else {
        return new Motions.MoveToBeginningOfLine(this.editor, this)
      }
    }

    // Private: A generic way to handle Operators that can be repeated for
    // their linewise form.
    //
    // constructor - The constructor of the operator.
    //
    // Returns nothing.
    linewiseAliasedOperator (constructor) {
      if (this.isOperatorPending(constructor)) {
        return new Motions.MoveToRelativeLine(this.editor, this)
      } else {
        return new constructor(this.editor, this)
      }
    }

    // Private: Check if there is a pending operation of a certain type, or
    // if there is any pending operation, if no type given.
    //
    // constructor - The constructor of the object type you're looking for.
    //
    isOperatorPending (constructor) {
      if (constructor != null) {
        for (const op of Array.from(this.opStack)) {
          if (op instanceof constructor) { return op }
        }
        return false
      } else {
        return this.opStack.length > 0
      }
    }

    updateStatusBar () {
      return this.statusBarManager.update(this.mode, this.submode)
    }

    // Private: insert the contents of the register in the editor
    //
    // name - the name of the register to insert
    //
    // Returns nothing.
    insertRegister (name) {
      const text = __guard__(this.getRegister(name), x => x.text)
      if (text != null) { return this.editor.insertText(text) }
    }

    // Private: ensure the mode follows the state of selections
    checkSelections () {
      if (this.editor == null) { return }
      if (this.editor.getSelections().every(selection => selection.isEmpty())) {
        if (this.mode === 'normal') { this.ensureCursorsWithinLine() }
        if (this.mode === 'visual') { return this.activateNormalMode() }
      } else {
        if (this.mode === 'normal') { return this.activateVisualMode('characterwise') }
      }
    }

    // Private: ensure the cursor stays within the line as appropriate
    ensureCursorsWithinLine () {
      for (const cursor of Array.from(this.editor.getCursors())) {
        const { goalColumn } = cursor
        if (cursor.isAtEndOfLine() && !cursor.isAtBeginningOfLine()) {
          cursor.moveLeft()
        }
        cursor.goalColumn = goalColumn
      }

      return this.editor.mergeCursors()
    }
  }
  VimState.initClass()
  return VimState
})())

function __guardMethod__ (obj, methodName, transform) {
  if (typeof obj !== 'undefined' && obj !== null && typeof obj[methodName] === 'function') {
    return transform(obj, methodName)
  } else {
    return undefined
  }
}
function __guard__ (value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined
}

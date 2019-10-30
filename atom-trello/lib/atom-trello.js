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
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let AtomTrello
const AtomTrelloView = require('./atom-trello-view')
const Trello = require('node-trello')
const Shell = require('shell')
const { CompositeDisposable } = require('atom')

module.exports = (AtomTrello = {
  subscriptions: null,
  atomTrelloView: null,
  hasLoaded: false,
  api: null,

  config: {
    devKey: {
      title: 'Trello Developer Key',
      description: 'get key at https://trello.com/1/appKey/generate',
      type: 'string',
      default: ''
    },
    token: {
      title: 'Token',
      description: 'Add developer key and you will be redirected to get your token. Paste below.',
      type: 'string',
      default: ''
    }
  },

  activate (state) {
    this.subscriptions = new CompositeDisposable()
    this.settingsInit()
    return this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-trello:toggle': () => this.toggle() }))
  },

  deactivate () {
    this.subscriptions.dispose()
    return this.atomTrelloView.destroy()
  },

  // serialize: ->
  //   atomTestViewState: @atomTestView.serialize()

  initializePackage () {
    this.atomTrelloView = new AtomTrelloView()
    this.setApi()
    this.atomTrelloView.setApi(this.api)
    this.getUser(data => {
      return this.atomTrelloView.setUser(data)
    })
    this.atomTrelloView.loadBoards()
    return this.hasLoaded = true
  },

  toggle () {
    if (!this.setApi() || !this.api) {
      atom.notifications.addWarning('Please enter your Trello key and token in the settings')
      return
    }

    if (!this.hasLoaded) {
      this.initializePackage()
      return
    }

    if (this.atomTrelloView.panel.isVisible()) {
      return this.atomTrelloView.panel.hide()
    } else {
      this.atomTrelloView.panel.show()
      this.atomTrelloView.populateList()
      return this.atomTrelloView.focusFilterEditor()
    }
  },

  settingsInit () {
    atom.config.onDidChange('atom-trello.devKey', ({ newValue, oldValue }) => {
      if (newValue && !atom.config.get('atom-trello.token')) {
        return Shell.openExternal(`https://trello.com/1/connect?key=${newValue}&name=AtomTrello&response_type=token&scope=read,write&expiration=never`)
      } else {
        return this.sendWelcome()
      }
    })

    return atom.config.onDidChange('atom-trello.token', ({ newValue, oldValue }) => {
      if (newValue) {
        return this.sendWelcome()
      }
    })
  },

  setApi () {
    this.devKey = atom.config.get('atom-trello.devKey')
    this.token = atom.config.get('atom-trello.token')

    if (!this.devKey || !this.token) {
      return false
    }

    this.api = new Trello(this.devKey, this.token)
    return true
  },

  getUser (callback) {
    return this.api.get('/1/members/me', (err, data) => {
      if (err != null) {
        atom.notifications.addError('Failed to set Trello API, check your credentials')
        this.api = null
        return
      }
      if (data.username) {
        if (callback) {
          return callback(data)
        }
      }
    })
  },

  sendWelcome (callback) {
    if (!this.setApi()) {
      return
    }
    return this.getUser(function (data) {
      if (data.username) {
        atom.notifications.addSuccess(`Hey ${data.fullName} you're good to go!`)
        if (callback) {
          return callback()
        }
      }
    })
  }
})

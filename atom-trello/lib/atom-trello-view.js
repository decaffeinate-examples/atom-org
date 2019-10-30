/** @babel */
/* eslint-disable
    handle-callback-err,
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
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let AtomTrelloView, Entities
const { SelectListView } = require('atom-space-pen-views')
const { $ } = require('space-pen')
const Shell = require('shell',
  (Entities = require('html-entities').AllHtmlEntities))
const Marked = require('marked')

module.exports =

(AtomTrelloView = (function () {
  AtomTrelloView = class AtomTrelloView extends SelectListView {
    static initClass () {
      this.prototype.api = null
      this.prototype.elem = null
      this.prototype.backBtn = null
      this.prototype.activeBoards = null
      this.prototype.activeLanes = null
      this.prototype.currentView = 'boards'
      this.prototype.user = null
      this.prototype.avatarUrl = 'https://trello-avatars.s3.amazonaws.com/'
      this.prototype.entities = new Entities()
    }

    initialize () {
      super.initialize(...arguments)
      this.getFilterKey = () => 'name'

      this.addClass('atom-trello overlay from-top')
      if (this.panel == null) { this.panel = atom.workspace.addModalPanel({ item: this }) }
      this.elem = $(this.panel.item.element)
      this.setButtons()

      return Marked.setOptions({
        sanitize: true
      })
    }

    setApi (api) {
      return this.api = api
    }

    setUser (user) {
      return this.user = user
    }

    encode (str) {
      return str = str.replace()
    }

    viewForItem (item) {
      switch (this.currentView) {
        case 'cards': return this.cardsView(item)
        default: return this.defaultView(item)
      }
    }

    defaultView (item) {
      return `<li>${item.name}</li>`
    }

    itemDescription (description) {
      if (description && this.showDesc) {
        return `<div class='secondary-line'>${Marked(description)}</div>`
      }
    }

    cardsView (item) {
      const avatars = () => {
        let avatarString = ''
        item.members.map(obj => {
          if (obj.avatarHash) {
            return avatarString += `<img class='at-avatar' src='${this.getAvatar(obj.avatarHash)}'/>`
          } else {
            return avatarString += `<span class='at-avatar no-img'>${obj.initials}</span>`
          }
        })
        return avatarString
      }

      if (this.filterMyCards && !Array.from(item.idMembers).includes(this.user.id)) {
        return false
      }

      return `<li class='two-lines'> \
<div class='primary-line'> \
<div class='at-title'>${this.entities.encode(item.name)}</div> \
<div class='at-avatars'>${avatars()}</div> \
</div> \
${this.itemDescription(item.desc)} \
</li>`
    }

    showView (items, showBackBtn) {
      if (showBackBtn == null) { showBackBtn = true }
      this.setItems(items)
      this.focusFilterEditor()
      if (showBackBtn) { return this.backBtn.show() } else { return this.backBtn.hide() }
    }

    loadBoards () {
      this.currentView = 'boards'
      this.activeLanes = null
      this.panel.show()
      this.backBtn.hide()
      this.setLoading('Your Boards are Loading!')

      this.confirmed = board => {
        this.cancel()
        return this.loadLanes(board)
      }

      if (this.activeBoards) {
        this.showView(this.activeBoards, false)
        return
      }

      return this.api.get('/1/members/me/boards', { filter: 'open' }, (err, data) => {
        this.activeBoards = data
        return this.showView(this.activeBoards, false)
      })
    }

    loadLanes (board) {
      this.currentView = 'lanes'
      this.panel.show()
      this.backBtn.hide()
      this.setLoading('Your Lanes are Loading!')

      this.confirmed = lane => {
        this.cancel()
        return this.loadCards(lane)
      }

      if (this.activeLanes) {
        this.showView(this.activeLanes)
        this.backBtn.show()
        return
      }

      return this.api.get('/1/boards/' + board.id + '/lists', { cards: 'open' }, (err, data) => {
        this.activeLanes = data
        this.activeCards = null
        return this.showView(this.activeLanes)
      })
    }

    loadCards (lane) {
      this.currentView = 'cards'
      this.panel.show()
      this.backBtn.hide()
      this.setLoading('Your Cards are Loading!')

      this.confirmed = card => {
        return Shell.openExternal(card.url)
      }

      const {
        user
      } = this

      return this.api.get(`/1/lists/${lane.id}/cards`, { filter: 'open', members: true }, (err, data) => {
        const activeCards = data

        return this.showView(activeCards)
      })
    }

    cardActions (card) {
      this.currentView = 'card'
      this.panel.show()
      this.setLoading('Loading Card')
      return this.api.get('/1/cards/' + card.id, (err, data) => {
        return console.log(data)
      })
    }

    setButtons () {
      this.backBtn = $("<div id='back_btn' class='block'><button class='btn icon icon-arrow-left inline-block-tight'>Back</button></div>")
      this.backBtn
        .appendTo(this.elem)
        .hide()
        .on('mousedown', e => {
          e.preventDefault()
          e.stopPropagation()
          this.cancel()
          switch (this.currentView) {
            case 'card': return this.loadCards()
            case 'cards': return this.loadLanes()
            case 'lanes': return this.loadBoards()
            default: return this.loadBoards()
          }
        })

      this.cardOptions = $('<div class="settings-view at-filter"></div>')

      this.cardFilter = $('<div class="checkbox"><input id="atomTrello_cardFilter" type="checkbox"><div class="setting-title">only my cards</div></div>')
      this.cardFilterInput = this.cardFilter.find('input')
      this.cardFilter.appendTo(this.cardOptions)

      this.cardFilter
        .on('mousedown', e => {
          e.preventDefault()
          e.stopPropagation()
          this.filterMyCards = !this.cardFilterInput.prop('checked')
          this.cardFilterInput.prop('checked', this.filterMyCards)
          return this.populateList()
        }).find('input').on('click change', e => {
          e.preventDefault()
          return e.stopPropagation()
        })

      this.descFilter = $('<div class="checkbox"><input id="atomTrello_descFilter" type="checkbox"><div class="setting-title">show descriptions</div></div>')
      this.descFilterInput = this.descFilter.find('input')
      this.descFilter.appendTo(this.cardOptions)

      this.descFilter
        .on('mousedown', e => {
          e.preventDefault()
          e.stopPropagation()
          this.showDesc = !this.descFilterInput.prop('checked')
          this.descFilterInput.prop('checked', this.showDesc)
          return this.populateList()
        }).find('input').on('click change', e => {
          e.preventDefault()
          return e.stopPropagation()
        })

      return this.cardOptions.appendTo(this.elem)
    }

    getAvatar (id, large) {
      if (large == null) { large = false }
      const size = large ? '170' : '30'
      return this.avatarUrl + id + `/${size}.png`
    }

    cancelled () {
      return this.panel.hide()
    }
  }
  AtomTrelloView.initClass()
  return AtomTrelloView
})())

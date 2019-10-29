describe "Ruby on Rails snippets", ->
  grammar = null

  beforeEach ->
    waitsForPromise ->
      atom.packages.activatePackage("language-ruby-on-rails")

    runs ->
      grammar = atom.grammars.grammarForScopeName("source.ruby.rails")

  it "tokenizes ActionMailer::Base", ->
    railsMailer = 'class RailsMailer < ActionMailer::Base'
    {tokens} = grammar.tokenizeLine railsMailer
    expect(tokens[0]).toEqual value: railsMailer, scopes: ['source.ruby.rails', 'meta.rails.mailer']

  it "tokenizes ApplicationMailer", ->
    rails5Mailer = 'class Rails5Mailer < ApplicationMailer'
    {tokens} = grammar.tokenizeLine rails5Mailer
    expect(tokens[0]).toEqual value: rails5Mailer, scopes: ['source.ruby.rails', 'meta.rails.mailer']

  it "tokenizes ActiveRecord::Base", ->
    railsModel = 'class RailsModel < ActiveRecord::Base'
    {tokens} = grammar.tokenizeLine railsModel
    expect(tokens[0]).toEqual value: railsModel, scopes: ['source.ruby.rails', 'meta.rails.model']

  it "tokenizes ApplicationRecord", ->
    rails5Model = 'class Rails5Model < ApplicationRecord'
    {tokens} = grammar.tokenizeLine rails5Model
    expect(tokens[0]).toEqual value: rails5Model, scopes: ['source.ruby.rails', 'meta.rails.model']

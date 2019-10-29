/** @babel */
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
const Motions = require('./general-motions')
const { Search, SearchCurrentWord, BracketMatchingMotion, RepeatSearch } = require('./search-motion')
const MoveToMark = require('./move-to-mark-motion')
const { Find, Till } = require('./find-motion')

Motions.Search = Search
Motions.SearchCurrentWord = SearchCurrentWord
Motions.BracketMatchingMotion = BracketMatchingMotion
Motions.RepeatSearch = RepeatSearch
Motions.MoveToMark = MoveToMark
Motions.Find = Find
Motions.Till = Till

module.exports = Motions

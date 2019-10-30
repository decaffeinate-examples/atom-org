/** @babel */
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const path = require('path')
const fs = require('fs-plus')
const GrammarRegistry = require('../src/grammar-registry')

const registry = new GrammarRegistry()
const jsGrammar = registry.loadGrammarSync(path.resolve(__dirname, '..', 'spec', 'fixtures', 'javascript.json'))
jsGrammar.maxTokensPerLine = Infinity
const cssGrammar = registry.loadGrammarSync(path.resolve(__dirname, '..', 'spec', 'fixtures', 'css.cson'))
cssGrammar.maxTokensPerLine = Infinity

const tokenize = function (grammar, content, lineCount) {
  const start = Date.now()
  const tokenizedLines = grammar.tokenizeLines(content, false)
  const duration = Date.now() - start
  let tokenCount = 0
  for (const tokenizedLine of Array.from(tokenizedLines)) {
    tokenCount += tokenizedLine.length
  }
  const tokensPerMillisecond = Math.round(tokenCount / duration)
  return console.log(`Generated ${tokenCount} tokens for ${lineCount} lines in ${duration}ms (${tokensPerMillisecond} tokens/ms)`)
}

const tokenizeFile = function (filePath, grammar, message) {
  console.log()
  console.log(message)
  const content = fs.readFileSync(filePath, 'utf8')
  const lineCount = content.split('\n').length
  return tokenize(grammar, content, lineCount)
}

tokenizeFile(path.join(__dirname, 'large.js'), jsGrammar, 'Tokenizing jQuery v2.0.3')
tokenizeFile(path.join(__dirname, 'large.min.js'), jsGrammar, 'Tokenizing jQuery v2.0.3 minified')
tokenizeFile(path.join(__dirname, 'bootstrap.css'), cssGrammar, 'Tokenizing Bootstrap CSS v3.1.1')
tokenizeFile(path.join(__dirname, 'bootstrap.min.css'), cssGrammar, 'Tokenizing Bootstrap CSS v3.1.1 minified')

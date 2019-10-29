#!/usr/bin/env node
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS202: Simplify dynamic range loops
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

const fs = require('fs');
const path = require('path');
const SpanSkipList = require('../src/span-skip-list');
const _ = require('underscore');

let lines = fs.readFileSync(path.join(__dirname, 'large.js'), 'utf8').split('\n');
const offsetIndex = new SpanSkipList('rows', 'characters');

const times = 25;
let count = 0;
let time = 0;

const offsetsToInsert = [];
while (count < times) {
  offsetsToInsert.push(lines.map((line, index) => ({
    rows: 1,
    characters: line.length + 1
  })));
  lines = _.shuffle(lines);
  count++;
}

// Benchmark SpanSkipList::spliceArray
if (typeof console.profile === 'function') {
  console.profile('span-skip-list-insert');
}
let start = Date.now();
for (let offsets of Array.from(offsetsToInsert)) {
  offsetIndex.spliceArray('rows', 0, offsets.length, offsets);
}
time = Date.now() - start;
if (typeof console.profileEnd === 'function') {
  console.profileEnd('span-skip-list-insert');
}

console.log(`Inserting ${lines.length * times} lines took ${time}ms (${Math.round((lines.length * times) / time)} lines/ms)`);

// Benchmark SpanSkipList::totalTo
if (typeof console.profile === 'function') {
  console.profile('span-skip-list-query');
}
start = Date.now();
for (let lineNumber = 0, end = lines.length * times, asc = 0 <= end; asc ? lineNumber < end : lineNumber > end; asc ? lineNumber++ : lineNumber--) {
  offsetIndex.totalTo(lineNumber, 'rows');
  offsetIndex.totalTo(lineNumber, 'characters');
}
time = Date.now() - start;
if (typeof console.profileEnd === 'function') {
  console.profileEnd('span-skip-list-query');
}

console.log(`Querying ${lines.length * times} lines took ${time}ms (${Math.round((lines.length * times) / time)} lines/ms)`);

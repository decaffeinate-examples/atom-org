/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require('fs');
const path = require('path');
const temp = require('temp');
const nof = require('../lib/nof');

describe("nof", function() {
  it("unfocuses all specs in CoffeeScript files", function() {
    const focused = `\
describe 'specs', ->
  fit 'works', ->
    expect(1).toBe 1

  ffit 'works', ->
    expect(2).toBe 2

  fffit 'works', ->
    expect(2).toBe 2

fdescribe 'more specs', ->
  ffdescribe 'even more', ->
    fffdescribe 'even more', ->
      it 'works', ->
        expect(0).toBe 0\
`;

    const specsDirectory = temp.mkdirSync('jasmine-focused-spec-');
    const specPath = path.join(specsDirectory, 'a-spec.coffee');
    fs.writeFileSync(specPath, focused);
    nof(specsDirectory);

    return expect(fs.readFileSync(specPath, 'utf8')).toBe(`\
describe 'specs', ->
  it 'works', ->
    expect(1).toBe 1

  it 'works', ->
    expect(2).toBe 2

  it 'works', ->
    expect(2).toBe 2

describe 'more specs', ->
  describe 'even more', ->
    describe 'even more', ->
      it 'works', ->
        expect(0).toBe 0\
`
    );
  });

  return it("unfocuses all specs in JavaScript files", function() {
    const focused = `\
describe('specs', function() {
  fit('works', function() {
    expect(1).toBe(1)
  });
});

fdescribe('more specs', function() {
  ffdescribe('even more', function() {
    fffdescribe('even more', function() {
      it('works', function() {
        expect(0).toBe(0)
      });
    });
  });
});\
`;

    const specsDirectory = temp.mkdirSync('jasmine-focused-spec-');
    const specPath = path.join(specsDirectory, 'a-spec.js');
    fs.writeFileSync(specPath, focused);
    nof(specsDirectory);

    return expect(fs.readFileSync(specPath, 'utf8')).toBe(`\
describe('specs', function() {
  it('works', function() {
    expect(1).toBe(1)
  });
});

describe('more specs', function() {
  describe('even more', function() {
    describe('even more', function() {
      it('works', function() {
        expect(0).toBe(0)
      });
    });
  });
});\
`
    );
  });
});

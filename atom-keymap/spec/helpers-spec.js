/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {normalizeKeystrokes, keystrokesMatch, isModifierKeyup, isKeyup} = require('../src/helpers');

describe(".normalizeKeystrokes(keystrokes)", () => it("parses and normalizes the keystrokes", function() {
  assert.equal(normalizeKeystrokes('ctrl--'), 'ctrl--');
  assert.equal(normalizeKeystrokes('ctrl-x'), 'ctrl-x');
  assert.equal(normalizeKeystrokes('a'), 'a');
  assert.equal(normalizeKeystrokes('shift-a'), 'shift-A');
  assert.equal(normalizeKeystrokes('shift-9'), 'shift-9');
  assert.equal(normalizeKeystrokes('-'), '-');
  assert.equal(normalizeKeystrokes('- -'), '- -');
  assert.equal(normalizeKeystrokes('a b'), 'a b');
  assert.equal(normalizeKeystrokes('cmd-k cmd-v'), 'cmd-k cmd-v');
  assert.equal(normalizeKeystrokes('cmd-cmd'), 'cmd');
  assert.equal(normalizeKeystrokes('cmd-shift'), 'shift-cmd');
  assert.equal(normalizeKeystrokes('cmd-shift-a'), 'shift-cmd-A');
  assert.equal(normalizeKeystrokes('cmd-ctrl-alt--'), 'ctrl-alt-cmd--');

  assert.equal(normalizeKeystrokes('ctrl-y   ^y'), 'ctrl-y ^y');
  assert.equal(normalizeKeystrokes('ctrl-y ^ctrl-y'), 'ctrl-y ^y');
  assert.equal(normalizeKeystrokes('cmd-shift-y ^cmd-shift-y'), 'shift-cmd-Y ^y');
  assert.equal(normalizeKeystrokes('ctrl-y ^ctrl-y ^ctrl'), 'ctrl-y ^y ^ctrl');
  assert.equal(normalizeKeystrokes('ctrl-y ^ctrl-shift-alt-cmd-y ^ctrl ^shift ^alt ^cmd'), 'ctrl-y ^y ^ctrl ^shift ^alt ^cmd');
  assert.equal(normalizeKeystrokes('a b c ^a ^b ^c'), 'a b c ^a ^b ^c');

  assert.equal(normalizeKeystrokes('a-b'), false);
  assert.equal(normalizeKeystrokes('---'), false);
  assert.equal(normalizeKeystrokes('cmd-a-b'), false);
  assert.equal(normalizeKeystrokes('-a-b'), false);
  assert.equal(normalizeKeystrokes('ctrl-'), false);
  assert.equal(normalizeKeystrokes('--'), false);
  assert.equal(normalizeKeystrokes('- '), false);
  return assert.equal(normalizeKeystrokes('a '), false);
}));

describe(".isModifierKeyup(keystroke)", function() {
  it("returns true for single modifier keyups", function() {
    assert.isTrue(isModifierKeyup('^ctrl'));
    assert.isTrue(isModifierKeyup('^shift'));
    assert.isTrue(isModifierKeyup('^alt'));
    assert.isTrue(isModifierKeyup('^cmd'));
    assert.isTrue(isModifierKeyup('^ctrl-shift'));
    return assert.isTrue(isModifierKeyup('^alt-cmd'));
  });

  return it("returns false for modifier keydowns", function() {
    assert.isFalse(isModifierKeyup('ctrl-x'));
    assert.isFalse(isModifierKeyup('shift-x'));
    assert.isFalse(isModifierKeyup('alt-x'));
    assert.isFalse(isModifierKeyup('cmd-x'));
    assert.isFalse(isModifierKeyup('ctrl-shift-x'));
    return assert.isFalse(isModifierKeyup('alt-cmd-x'));
  });
});

describe(".isKeyup(keystrokes)", function() {
  it("return false for single ^", () => assert.isFalse(isKeyup('^')));

  return it("return true when keystroke starts with ^", function() {
    assert.isTrue(isKeyup('^a'));
    assert.isTrue(isKeyup('^ctrl'));
    return assert.isTrue(isKeyup('^shift'));
  });
});

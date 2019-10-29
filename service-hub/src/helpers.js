/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
exports.getValueAtKeyPath = function(object, keyPath) {
  const keys = splitKeyPath(keyPath);
  for (let key of Array.from(keys)) {
    object = object[key];
    if (object == null) { return; }
  }
  return object;
};

exports.setValueAtKeyPath = function(object, keyPath, value) {
  const keys = splitKeyPath(keyPath);
  while (keys.length > 1) {
    const key = keys.shift();
    if (object[key] == null) { object[key] = {}; }
    object = object[key];
  }
  return object[keys.shift()] = value;
};

var splitKeyPath = function(keyPath) {
  if (keyPath == null) { return []; }
  let startIndex = 0;
  const keys = [];
  for (let i = 0; i < keyPath.length; i++) {
    const char = keyPath[i];
    if ((char === '.') && ((i === 0) || (keyPath[i-1] !== '\\'))) {
      keys.push(keyPath.substring(startIndex, i));
      startIndex = i + 1;
    }
  }
  keys.push(keyPath.substr(startIndex, keyPath.length));
  return keys;
};

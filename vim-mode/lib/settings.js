/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

const settings = {
  config: {
    startInInsertMode: {
      type: 'boolean',
      default: false
    },
    useSmartcaseForSearch: {
      type: 'boolean',
      default: false
    },
    wrapLeftRightMotion: {
      type: 'boolean',
      default: false
    },
    useClipboardAsDefaultRegister: {
      type: 'boolean',
      default: true
    },
    numberRegex: {
      type: 'string',
      default: '-?[0-9]+',
      description: 'Use this to control how Ctrl-A/Ctrl-X finds numbers; use "(?:\\B-)?[0-9]+" to treat numbers as positive if the minus is preceded by a character, e.g. in "identifier-1".'
    }
  }
};

Object.keys(settings.config).forEach(k => settings[k] = () => atom.config.get('vim-mode.'+k));

settings.defaultRegister = function() {
  if (settings.useClipboardAsDefaultRegister()) { return '*'; } else { return '"'; }
};

module.exports = settings;

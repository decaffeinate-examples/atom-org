/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Login;
const _ = require('underscore-plus');
const yargs = require('yargs');
const Q = require('q');
const read = require('read');
const open = require('open');

const auth = require('./auth');
const Command = require('./command');

module.exports =
(Login = (function() {
  Login = class Login extends Command {
    constructor(...args) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      this.welcomeMessage = this.welcomeMessage.bind(this);
      this.getToken = this.getToken.bind(this);
      this.saveToken = this.saveToken.bind(this);
      super(...args);
    }

    static initClass() {
  
      this.commandNames = ['login'];
    }
    static getTokenOrLogin(callback) {
      return auth.getToken(function(error, token) {
        if (error != null) {
          return new Login().run({callback, commandArgs: []});
        } else {
          return callback(null, token);
        }
      });
    }

    parseOptions(argv) {
      const options = yargs(argv).wrap(Math.min(100, yargs.terminalWidth()));

      options.usage(`\
Usage: apm login

Enter your Atom.io API token and save it to the keychain. This token will
be used to identify you when publishing packages to atom.io.\
`
      );
      options.alias('h', 'help').describe('help', 'Print this usage message');
      return options.string('token').describe('token', 'atom.io API token');
    }

    run(options) {
      const {callback} = options;
      options = this.parseOptions(options.commandArgs);
      return Q({token: options.argv.token})
        .then(this.welcomeMessage)
        .then(this.openURL)
        .then(this.getToken)
        .then(this.saveToken)
        .then(token => callback(null, token))
        .catch(callback);
    }

    prompt(options) {
      const readPromise = Q.denodeify(read);
      return readPromise(options);
    }

    welcomeMessage(state) {
      if (state.token) { return Q(state); }

      const welcome = `\
Welcome to Atom!

Before you can publish packages, you'll need an API token.

Visit your account page on Atom.io ${'https://atom.io/account'.underline},
copy the token and paste it below when prompted.
\
`;
      console.log(welcome);

      return this.prompt({prompt: "Press [Enter] to open your account page on Atom.io."});
    }

    openURL(state) {
      if (state.token) { return Q(state); }

      return open('https://atom.io/account');
    }

    getToken(state) {
      if (state.token) { return Q(state); }

      return this.prompt({prompt: 'Token>', edit: true})
        .spread(function(token) {
          state.token = token;
          return Q(state);
      });
    }

    saveToken({token}) {
      if (!token) { throw new Error("Token is required"); }

      process.stdout.write('Saving token to Keychain ');
      auth.saveToken(token);
      this.logSuccess();
      return Q(token);
    }
  };
  Login.initClass();
  return Login;
})());

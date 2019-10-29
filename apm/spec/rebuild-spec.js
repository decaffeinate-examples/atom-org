/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const path = require('path');
const CSON = require('season');
const fs = require('fs-plus');
const temp = require('temp');
const express = require('express');
const http = require('http');
const wrench = require('wrench');
const apm = require('../lib/apm-cli');

describe('apm rebuild', function() {
  let [server, originalPathEnv] = Array.from([]);

  beforeEach(function() {
    spyOnToken();
    silenceOutput();

    const app = express();
    app.get('/node/v0.10.3/node-v0.10.3.tar.gz', (request, response) => response.sendFile(path.join(__dirname, 'fixtures', 'node-v0.10.3.tar.gz')));
    app.get('/node/v0.10.3/node.lib', (request, response) => response.sendFile(path.join(__dirname, 'fixtures', 'node.lib')));
    app.get('/node/v0.10.3/x64/node.lib', (request, response) => response.sendFile(path.join(__dirname, 'fixtures', 'node_x64.lib')));
    app.get('/node/v0.10.3/SHASUMS256.txt', (request, response) => response.sendFile(path.join(__dirname, 'fixtures', 'SHASUMS256.txt')));

    server = http.createServer(app);

    let live = false;
    server.listen(3000, '127.0.0.1', function() {
      const atomHome = temp.mkdirSync('apm-home-dir-');
      process.env.ATOM_HOME = atomHome;
      process.env.ATOM_ELECTRON_URL = "http://localhost:3000/node";
      process.env.ATOM_PACKAGES_URL = "http://localhost:3000/packages";
      process.env.ATOM_ELECTRON_VERSION = 'v0.10.3';
      process.env.ATOM_RESOURCE_PATH = temp.mkdirSync('atom-resource-path-');

      originalPathEnv = process.env.PATH;
      process.env.PATH = "";
      return live = true;
    });
    return waitsFor(() => live);
  });

  afterEach(function() {
    process.env.PATH = originalPathEnv;

    let done = false;
    server.close(() => done = true);
    return waitsFor(() => done);
  });

  it("rebuilds all modules when no module names are specified", function() {
    const packageToRebuild = path.join(__dirname, 'fixtures/package-with-native-deps');

    process.chdir(packageToRebuild);
    const callback = jasmine.createSpy('callback');
    apm.run(['rebuild'], callback);

    waitsFor('waiting for rebuild to complete', 600000, () => callback.callCount === 1);

    return runs(() => expect(callback.mostRecentCall.args[0]).toBeUndefined());
  });

  return it("rebuilds the specified modules", function() {
    const packageToRebuild = path.join(__dirname, 'fixtures/package-with-native-deps');

    process.chdir(packageToRebuild);
    const callback = jasmine.createSpy('callback');
    apm.run(['rebuild', 'native-dep'], callback);

    waitsFor('waiting for rebuild to complete', 600000, () => callback.callCount === 1);

    return runs(() => expect(callback.mostRecentCall.args[0]).toBeUndefined());
  });
});

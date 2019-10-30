/** @babel */
/* eslint-disable
    no-return-assign,
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const path = require('path')
const express = require('express')
const fs = require('fs-plus')
const http = require('http')
const temp = require('temp')
const apm = require('../lib/apm-cli')

describe('apm stars', function () {
  let [atomHome, server] = Array.from([])

  beforeEach(function () {
    silenceOutput()
    spyOnToken()

    const app = express()
    app.get('/stars', (request, response) => response.sendFile(path.join(__dirname, 'fixtures', 'available.json')))
    app.get('/users/hubot/stars', (request, response) => response.sendFile(path.join(__dirname, 'fixtures', 'stars.json')))
    app.get('/node/v0.10.3/node-v0.10.3.tar.gz', (request, response) => response.sendFile(path.join(__dirname, 'fixtures', 'node-v0.10.3.tar.gz')))
    app.get('/node/v0.10.3/node.lib', (request, response) => response.sendFile(path.join(__dirname, 'fixtures', 'node.lib')))
    app.get('/node/v0.10.3/x64/node.lib', (request, response) => response.sendFile(path.join(__dirname, 'fixtures', 'node_x64.lib')))
    app.get('/node/v0.10.3/SHASUMS256.txt', (request, response) => response.sendFile(path.join(__dirname, 'fixtures', 'SHASUMS256.txt')))
    app.get('/tarball/test-module-1.2.0.tgz', (request, response) => response.sendFile(path.join(__dirname, 'fixtures', 'test-module-1.2.0.tgz')))
    app.get('/tarball/test-module2-2.0.0.tgz', (request, response) => response.sendFile(path.join(__dirname, 'fixtures', 'test-module2-2.0.0.tgz')))
    app.get('/packages/test-module', (request, response) => response.sendFile(path.join(__dirname, 'fixtures', 'install-test-module.json')))

    server = http.createServer(app)

    let live = false
    server.listen(3000, '127.0.0.1', function () {
      atomHome = temp.mkdirSync('apm-home-dir-')
      process.env.ATOM_HOME = atomHome
      process.env.ATOM_API_URL = 'http://localhost:3000'
      process.env.ATOM_ELECTRON_URL = 'http://localhost:3000/node'
      process.env.ATOM_PACKAGES_URL = 'http://localhost:3000/packages'
      process.env.ATOM_ELECTRON_VERSION = 'v0.10.3'
      process.env.npm_config_registry = 'http://localhost:3000/'

      return live = true
    })

    return waitsFor(() => live)
  })

  afterEach(function () {
    let closed = false
    server.close(() => closed = true)
    return waitsFor(() => closed)
  })

  describe('when no user flag is specified', () => it('lists your starred packages', function () {
    const callback = jasmine.createSpy('callback')
    apm.run(['stars'], callback)

    waitsFor('waiting for command to complete', () => callback.callCount > 0)

    return runs(function () {
      expect(console.log).toHaveBeenCalled()
      return expect(console.log.argsForCall[1][0]).toContain('beverly-hills')
    })
  }))

  describe('when a user flag is specified', () => it('lists their starred packages', function () {
    const callback = jasmine.createSpy('callback')
    apm.run(['stars', '--user', 'hubot'], callback)

    waitsFor('waiting for command to complete', () => callback.callCount > 0)

    return runs(function () {
      expect(console.log).toHaveBeenCalled()
      return expect(console.log.argsForCall[1][0]).toContain('test-module')
    })
  }))

  describe('when the install flag is specified', () => it('installs all of the stars', function () {
    const testModuleDirectory = path.join(atomHome, 'packages', 'test-module')
    expect(fs.existsSync(testModuleDirectory)).toBeFalsy()
    const callback = jasmine.createSpy('callback')
    apm.run(['stars', '--user', 'hubot', '--install'], callback)

    waitsFor('waiting for command to complete', () => callback.callCount > 0)

    return runs(function () {
      expect(callback.mostRecentCall.args[0]).toBeNull()
      expect(fs.existsSync(path.join(testModuleDirectory, 'index.js'))).toBeTruthy()
      return expect(fs.existsSync(path.join(testModuleDirectory, 'package.json'))).toBeTruthy()
    })
  }))

  return describe('when the theme flag is specified', () => it('only lists themes', function () {
    const callback = jasmine.createSpy('callback')
    apm.run(['stars', '--themes'], callback)

    waitsFor('waiting for command to complete', () => callback.callCount > 0)

    return runs(function () {
      expect(console.log).toHaveBeenCalled()
      expect(console.log.argsForCall[1][0]).toContain('duckblur')
      return expect(console.log.argsForCall[1][0]).not.toContain('beverly-hills')
    })
  }))
})

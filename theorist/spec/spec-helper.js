/** @babel */
/* eslint-disable
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
require('coffee-cache')
jasmine.getEnv().addEqualityTester(require('underscore-plus').isEqual)

const Model = require('../src/model')
beforeEach(() => Model.resetNextInstanceId())

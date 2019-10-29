require('coffee-cache');
jasmine.getEnv().addEqualityTester(require('underscore-plus').isEqual);

const Model = require('../src/model');
beforeEach(() => Model.resetNextInstanceId());

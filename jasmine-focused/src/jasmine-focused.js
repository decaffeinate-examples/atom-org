/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let jasmine;
if (global.jasmine != null) {
  ({
    jasmine
  } = global);
  if (jasmine.TerminalReporter == null) {
    const path = require('path');
    const jasmineNodePath = require.resolve('jasmine-node');
    const reporterPath = path.join(path.dirname(jasmineNodePath), 'reporter');
    const {jasmineNode} = require(reporterPath);
    jasmine.TerminalReporter = jasmineNode.TerminalReporter;
  }
} else {
  jasmine = require('jasmine-node');
}

const setGlobalFocusPriority = function(priority) {
  const env = jasmine.getEnv();
  if (!env.focusPriority) { env.focusPriority = 1; }
  if (priority > env.focusPriority) { return env.focusPriority = priority; }
};

const focusMethods = {
  fdescribe(description, specDefinitions, priority) {
    if (priority == null) { priority = 1; }
    setGlobalFocusPriority(priority);
    const suite = describe(description, specDefinitions);
    suite.focusPriority = priority;
    return suite;
  },

  ffdescribe(description, specDefinitions) {
    return this.fdescribe(description, specDefinitions, 2);
  },

  fffdescribe(description, specDefinitions) {
    return this.fdescribe(description, specDefinitions, 3);
  },

  fit(description, definition, priority) {
    if (priority == null) { priority = 1; }
    setGlobalFocusPriority(priority);
    const spec = it(description, definition);
    spec.focusPriority = priority;
    return spec;
  },

  ffit(description, specDefinitions) {
    return this.fit(description, specDefinitions, 2);
  },

  fffit(description, specDefinitions) {
    return this.fit(description, specDefinitions, 3);
  }
};

const globals  = [];
if (typeof global !== 'undefined' && global !== null) { globals.push(global); }
if (typeof window !== 'undefined' && window !== null) { globals.push(window); }
for (let methodName in focusMethods) {
  const methodBody = focusMethods[methodName];
  for (let object of Array.from(globals)) { object[methodName] = methodBody; }
}

jasmine.getEnv().specFilter = function(spec) {
  const env = jasmine.getEnv();
  const globalFocusPriority = env.focusPriority;
  const parent = spec.parentSuite != null ? spec.parentSuite : spec.suite;

  if (!globalFocusPriority) {
    return true;
  } else if (spec.focusPriority >= globalFocusPriority) {
    return true;
  } else if (!parent) {
    return false;
  } else {
    return env.specFilter(parent);
  }
};

module.exports = jasmine;

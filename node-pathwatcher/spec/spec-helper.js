/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
jasmine.getEnv().setIncludedTags([process.platform]);

global.waitsForPromise = function(...args) {
  let shouldReject;
  if (args.length > 1) {
    ({shouldReject} = args[0]);
  } else {
    shouldReject = false;
  }
  const fn = args[args.length - 1];

  let promiseFinished = false;

  process.nextTick(function() {
    const promise = fn();
    if (shouldReject) {
      promise.catch(() => promiseFinished = true);
      return promise.then(function() {
        jasmine.getEnv().currentSpec.fail("Expected promise to be rejected, but it was resolved");
        return promiseFinished = true;
      });
    } else {
      promise.then(() => promiseFinished = true);
      return promise.catch(function(error) {
        jasmine.getEnv().currentSpec.fail(`Expected promise to be resolved, but it was rejected with ${jasmine.pp(error)}`);
        return promiseFinished = true;
      });
    }
  });

  return global.waitsFor("promise to complete", () => promiseFinished);
};

require('grim').includeDeprecatedAPIs = false;

/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS201: Simplify complex destructure assignments
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const vm = require('vm');

exports.allowUnsafeEval = function(fn) {
  const previousEval = global.eval;
  try {
    global.eval = source => vm.runInThisContext(source);
    return fn();
  } finally {
    global.eval = previousEval;
  }
};

exports.allowUnsafeNewFunction = function(fn) {
  const previousFunction = global.Function;
  try {
    global.Function = exports.Function;
    return fn();
  } finally {
    global.Function = previousFunction;
  }
};

exports.Function = function(...args) {
  const adjustedLength = Math.max(args.length, 1), paramLists = args.slice(0, adjustedLength - 1), body = args[adjustedLength - 1];
  const params = [];
  for (let paramList of Array.from(paramLists)) {
    if (typeof paramList === 'string') {
      paramList = paramList.split(/\s*,\s*/);
    }
    params.push(...Array.from(paramList || []));
  }

  return vm.runInThisContext(`\
(function(${params.join(', ')}) {
  ${body}
})\
`
  );
};

exports.Function.prototype = global.Function.prototype;

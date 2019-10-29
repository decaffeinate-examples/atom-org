const Builder = require('./builder');
const builder = new Builder;

exports.$$ = fn => builder.buildElement(fn);

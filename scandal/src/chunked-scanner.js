/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ChunkedScanner;
const ChunkedExecutor = require('./chunked-executor');

module.exports =
(ChunkedScanner = class ChunkedScanner extends ChunkedExecutor {
  constructor(scanner, execPathFn) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }
      let thisFn = (() => { return this; }).toString();
      let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
      eval(`${thisName} = this;`);
    }
    this.onFinishedScanning = this.onFinishedScanning.bind(this);
    this.scanner = scanner;
    this.finishedScanning = false;
    super([], execPathFn);
  }

  execute(doneCallback) {
    super.execute(doneCallback);

    this.scanner.on('path-found', this.push);
    this.scanner.on('finished-scanning', this.onFinishedScanning);
    return this.scanner.scan();
  }

  onFinishedScanning() {
    this.finishedScanning = true;
    return this.checkIfFinished();
  }

  checkIfFinished() {
    if (!this.finishedScanning) { return false; }
    const isFinished = super.checkIfFinished();

    if (isFinished) {
      this.scanner.removeListener('path-found', this.path);
      this.scanner.removeListener('finished-scanning', this.onFinishedScanning);
    }

    return isFinished;
  }
});

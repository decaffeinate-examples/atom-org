/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ChunkedExecutor;
const MAX_CONCURRENT_CHUNK = 20;

// Public: {ChunkedExecutor} will execute on an {Array} paths in a pathQueue only
// running a max of 20 of them concurrently.
//
// ## Examples
//
//   ```coffee
//   paths = ['/path/to/somefile.coffee', '/path/to/someotherfile.coffee']
//
//   searchPath = (filePath, callback) =>
//     # Do something with the path here...
//     callback()
//
//   executor = new ChunkedExecutor(paths, searchPath).execute ->
//     console.log 'done!'
//
//   # Now you can push more on the queue
//   executor.push '/path/to/lastone.coffee'
//   ```
module.exports =
(ChunkedExecutor = class ChunkedExecutor {

  // Construct a {ChunkedExecutor}
  //
  // * `pathQueue` {Array} of paths
  // * `execPathFn` {Function} that will execute on each path
  //   * `filePath` {String} path to a file from the `pathQueue`
  //   * `callback` {Function} callback your `execPathFn` must call when finished
  //      executing on a path
  constructor(pathQueue, execPathFn) {
    this.push = this.push.bind(this);
    this.execPathFn = execPathFn;
    this.pathQueue = (Array.from(pathQueue)); // copy the original
    this.pathCount = pathQueue.length;
    this.pathsRunning = 0;
  }

  /*
  Section: Execution
  */

  // Public: Begin execution of the `pathQueue`
  //
  // * `doneCallback` {Function} callback that will be called when execution is finished.
  execute(doneCallback) {
    this.doneCallback = doneCallback;
    for (let i = 0, end = MAX_CONCURRENT_CHUNK, asc = 0 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
      this.executeNextPathIfPossible();
    }
  }

  // Public: Push a new path on the queue
  //
  // May or may not execute immediately.
  //
  // * `filePath` {String} path to a file
  push(filePath) {
    this.pathCount++;
    if (this.pathsRunning < MAX_CONCURRENT_CHUNK) {
      return this.executePath(filePath);
    } else {
      return this.pathQueue.push(filePath);
    }
  }

  /*
  Section: Lifecycle Methods
  */

  executeNextPathIfPossible() {
    if ((this.pathsRunning < MAX_CONCURRENT_CHUNK) && this.pathQueue.length) { return this.executePath(this.pathQueue.shift()); }
  }

  executePath(filePath) {
    this.pathsRunning++;
    return this.execPathFn(filePath, () => {
      this.pathCount--;
      this.pathsRunning--;
      return this.checkIfFinished();
    });
  }

  checkIfFinished() {
    this.executeNextPathIfPossible();
    if (this.pathCount === 0) { return this.doneCallback(); }
  }
});

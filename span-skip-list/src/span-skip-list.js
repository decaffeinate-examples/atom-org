/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let SpanSkipList;
module.exports =
(SpanSkipList = (function() {
  SpanSkipList = class SpanSkipList {
    static initClass() {
      this.prototype.maxHeight = 8;
      this.prototype.probability = .25;
    }

    // Public:
    //
    // * dimensions
    //   A list of strings naming the dimensions to be indexed. Elements should
    //   have numeric-valued properties matching each of the indexed dimensions.
    constructor(...args) {
      [...this.dimensions] = Array.from(args);
      this.head = this.createNode(this.maxHeight, this.buildZeroDistance());
      this.tail = this.createNode(this.maxHeight, this.buildZeroDistance());
      let index = 0;
      while (index < this.maxHeight) {
        this.head.next[index] = this.tail;
        this.head.distance[index] = this.buildZeroDistance();
        index++;
      }
    }

    // Public: Returns the total in all dimensions for elements adding up to the
    // given target value in the given dimension.
    totalTo(target, dimension) {
      const totalDistance = this.buildZeroDistance();
      let node = this.head;

      let index = this.maxHeight - 1;
      while (index >= 0) {
        while (true) {
          if (node.next[index] === this.tail) { break; }

          const nextDistanceInTargetDimension =
            totalDistance[dimension] +
              node.distance[index][dimension] +
                (node.next[index].element[dimension] != null ? node.next[index].element[dimension] : 1);

          if (nextDistanceInTargetDimension > target) { break; }

          this.incrementDistance(totalDistance, node.distance[index]);
          this.incrementDistance(totalDistance, node.next[index].element);

          node = node.next[index];
        }
        index--;
      }

      return totalDistance;
    }

    // Public: Splices into the list in a given dimension.
    //
    // * dimension
    //   The dimension in which to interpret the insertion index.
    // * index
    //   The index at which to start removing/inserting elements.
    // * count
    //   The number of elements to remove, starting at the given index.
    // * elements...
    //   Elements to insert, starting at the given index.
    splice(dimension, index, count, ...elements) {
      return this.spliceArray(dimension, index, count, elements);
    }

    // Public: Works just like splice, but takes an array of elements to insert
    // instead of multiple arguments.
    spliceArray(dimension, index, count, elements) {
      const previous = this.buildPreviousArray();
      const previousDistances = this.buildPreviousDistancesArray();

      let nextNode = this.findClosestNode(dimension, index, previous, previousDistances);

      // Remove count nodes and decrement totals for updated pointers
      const removedElements = [];

      while ((count > 0) && (nextNode !== this.tail)) {
        removedElements.push(nextNode.element);
        nextNode = this.removeNode(nextNode, previous, previousDistances);
        count--;
      }

      // Insert new nodes and increment totals for updated pointers
      let i = elements.length - 1;
      while (i >= 0) {
        const newNode = this.createNode(this.getRandomNodeHeight(), elements[i]);
        this.insertNode(newNode, previous, previousDistances);
        i--;
      }

      return removedElements;
    }

    getLength() {
      return this.getElements().length;
    }

    // Public: Returns all elements in the list.
    getElements() {
      const elements = [];
      let node = this.head;
      while (node.next[0] !== this.tail) {
        elements.push(node.next[0].element);
        node = node.next[0];
      }
      return elements;
    }

    // Private: Searches the list in a stairstep descent, following the highest
    // path that doesn't overshoot the index.
    //
    // * previous
    //   An array that will be populated with the last node visited at every level.
    // * previousDistances
    //   An array that will be populated with the distance of forward traversal
    //   at each level.
    //
    // Returns the leftmost node whose running total in the target dimension
    // exceeds the target index
    findClosestNode(dimension, index, previous, previousDistances) {
      const totalDistance = this.buildZeroDistance();
      let node = this.head;
      for (let start = this.maxHeight - 1, i = start, asc = start <= 0; asc ? i <= 0 : i >= 0; asc ? i++ : i--) {
        // Move forward as far as possible while keeping the running total in the
        // target dimension less than or equal to the target index.
        while (true) {
          if (node.next[i] === this.tail) { break; }

          const nextHopDistance = (node.next[i].element[dimension] != null ? node.next[i].element[dimension] : 1) + node.distance[i][dimension];
          if ((totalDistance[dimension] + nextHopDistance) > index) { break; }

          this.incrementDistance(totalDistance, node.distance[i]);
          this.incrementDistance(totalDistance, node.next[i].element);
          this.incrementDistance(previousDistances[i], node.distance[i]);
          this.incrementDistance(previousDistances[i], node.next[i].element);

          node = node.next[i];
        }

        // Record the last node visited at the current level before dropping to the
        // next level.
        previous[i] = node;
      }
      return node.next[0];
    }

    // Private: Inserts the given node in the list and updates distances
    // accordingly.
    //
    // * previous
    //   An array of the last node visited at each level during the traversal to
    //   the insertion site.
    // * previousDistances
    //   An array of the distances traversed at each level during the traversal to
    //   the insertion site.
    insertNode(node, previous, previousDistances) {
      const coveredDistance = this.buildZeroDistance();

      let level = 0;
      while (level < node.height) {
        node.next[level] = previous[level].next[level];
        previous[level].next[level] = node;
        node.distance[level] = this.subtractDistances(previous[level].distance[level], coveredDistance);
        previous[level].distance[level] = this.cloneObject(coveredDistance);
        this.incrementDistance(coveredDistance, previousDistances[level]);
        level++;
      }

      level = node.height;
      while (level < this.maxHeight) {
        this.incrementDistance(previous[level].distance[level], node.element);
        level++;
      }

    }

    // Private: Removes the given node and updates the distances of nodes to the
    // left. Returns the node following the removed node.
    removeNode(node, previous) {
      let level = 0;
      while (level < node.height) {
        previous[level].next[level] = node.next[level];
        this.incrementDistance(previous[level].distance[level], node.distance[level]);
        level++;
      }

      level = node.height;
      while (level < this.maxHeight) {
        this.decrementDistance(previous[level].distance[level], node.element);
        level++;
      }

      return node.next[0];
    }

    // Private: The previous array stores references to the last node visited at
    // each level when traversing to a node.
    buildPreviousArray() {
      const previous = new Array(this.maxHeight);
      let index = 0;
      while (index < this.maxHeight) {
        previous[index] = this.head;
        index++;
      }
      return previous;
    }

    // Private: The previous distances array stores the distance traversed at each
    // level when traversing to a node.
    buildPreviousDistancesArray() {
      const distances = new Array(this.maxHeight);
      let index = 0;
      while (index < this.maxHeight) {
        distances[index] = this.buildZeroDistance();
        index++;
      }
      return distances;
    }

    // Private: Returns a height between 1 and maxHeight (inclusive). Taller heights
    // are logarithmically less probable than shorter heights because each increase
    // in height requires us to win a coin toss weighted by @probability.
    getRandomNodeHeight() {
      let height = 1;
      while ((height < this.maxHeight) && (Math.random() < this.probability)) { height++; }
      return height;
    }

    // Private
    buildZeroDistance() {
      if (this.zeroDistance == null) {
        this.zeroDistance = {elements: 0};
        for (let dimension of Array.from(this.dimensions)) { this.zeroDistance[dimension] = 0; }
      }

      return this.cloneObject(this.zeroDistance);
    }

    // Private
    incrementDistance(distance, delta) {
      distance.elements += delta.elements != null ? delta.elements : 1;
      for (let dimension of Array.from(this.dimensions)) { distance[dimension] += delta[dimension]; }
    }

    // Private
    decrementDistance(distance, delta) {
      distance.elements -= delta.elements != null ? delta.elements : 1;
      for (let dimension of Array.from(this.dimensions)) { distance[dimension] -= delta[dimension]; }
    }

    // Private
    addDistances(a, b) {
      const distance = {elements: (a.elements != null ? a.elements : 1) + (b.elements != null ? b.elements : 1)};
      for (let dimension of Array.from(this.dimensions)) {
        distance[dimension] = a[dimension] + b[dimension];
      }
      return distance;
    }

    // Private
    subtractDistances(a, b) {
      const distance = {elements: (a.elements != null ? a.elements : 1) - (b.elements != null ? b.elements : 1)};
      for (let dimension of Array.from(this.dimensions)) {
        distance[dimension] = a[dimension] - b[dimension];
      }
      return distance;
    }

    // Private: Test only. Verifies that the distances at each level match the
    // combined distances of nodes on the levels below.
    verifyDistanceInvariant() {
      const {isEqual} = require('underscore');
      return (() => {
        const result = [];
        for (var start = this.maxHeight - 1, level = start, asc = start <= 1; asc ? level <= 1 : level >= 1; asc ? level++ : level--) {
          var node = this.head;
          result.push((() => {
            const result1 = [];
            while (node !== this.tail) {
              const distanceOnThisLevel = this.addDistances(node.element, node.distance[level]);
              const distanceOnPreviousLevel = this.distanceBetweenNodesAtLevel(node, node.next[level], level - 1);
              if (!isEqual(distanceOnThisLevel, distanceOnPreviousLevel)) {
                console.log(this.inspect());
                throw new Error(`On level ${level}: Distance ${JSON.stringify(distanceOnThisLevel)} does not match ${JSON.stringify(distanceOnPreviousLevel)}`);
              }
              result1.push(node = node.next[level]);
            }
            return result1;
          })());
        }
        return result;
      })();
    }

    // Private
    distanceBetweenNodesAtLevel(startNode, endNode, level) {
      const distance = this.buildZeroDistance();
      let node = startNode;
      while (node !== endNode) {
        this.incrementDistance(distance, node.element);
        this.incrementDistance(distance, node.distance[level]);
        node = node.next[level];
      }
      return distance;
    }

    createNode(height, element) {
      return {
        height,
        element,
        next: new Array(height),
        distance: new Array(height)
      };
    }

    cloneObject(object) {
      const cloned = {};
      for (let key in object) { const value = object[key]; cloned[key] = value; }
      return cloned;
    }
  };
  SpanSkipList.initClass();
  return SpanSkipList;
})());

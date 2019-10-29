/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let MarkerLayer;
const {clone} = require("underscore-plus");
const {Emitter} = require('event-kit');
const Point = require("./point");
const Range = require("./range");
const Marker = require("./marker");
const {MarkerIndex} = require("superstring");
const {intersectSet} = require("./set-helpers");

const SerializationVersion = 2;

// Public: *Experimental:* A container for a related set of markers.
//
// This API is experimental and subject to change on any release.
module.exports =
(MarkerLayer = class MarkerLayer {
  static deserialize(delegate, state) {
    const store = new MarkerLayer(delegate, 0);
    store.deserialize(state);
    return store;
  }

  static deserializeSnapshot(snapshot) {
    const result = {};
    for (let layerId in snapshot) {
      const markerSnapshots = snapshot[layerId];
      result[layerId] = {};
      for (let markerId in markerSnapshots) {
        const markerSnapshot = markerSnapshots[markerId];
        result[layerId][markerId] = clone(markerSnapshot);
        result[layerId][markerId].range = Range.fromObject(markerSnapshot.range);
      }
    }
    return result;
  }

  /*
  Section: Lifecycle
  */

  constructor(delegate, id, options) {
    this.delegate = delegate;
    this.id = id;
    this.maintainHistory = (options != null ? options.maintainHistory : undefined) != null ? (options != null ? options.maintainHistory : undefined) : false;
    this.destroyInvalidatedMarkers = (options != null ? options.destroyInvalidatedMarkers : undefined) != null ? (options != null ? options.destroyInvalidatedMarkers : undefined) : false;
    this.role = options != null ? options.role : undefined;
    if (this.role === "selections") { this.delegate.registerSelectionsMarkerLayer(this); }
    this.persistent = (options != null ? options.persistent : undefined) != null ? (options != null ? options.persistent : undefined) : false;
    this.emitter = new Emitter;
    this.index = new MarkerIndex;
    this.markersById = {};
    this.markersWithChangeListeners = new Set;
    this.markersWithDestroyListeners = new Set;
    this.displayMarkerLayers = new Set;
    this.destroyed = false;
    this.emitCreateMarkerEvents = false;
  }

  // Public: Create a copy of this layer with markers in the same state and
  // locations.
  copy() {
    const copy = this.delegate.addMarkerLayer({maintainHistory: this.maintainHistory, role: this.role});
    for (let markerId in this.markersById) {
      const marker = this.markersById[markerId];
      const snapshot = marker.getSnapshot(null);
      copy.createMarker(marker.getRange(), marker.getSnapshot());
    }
    return copy;
  }

  // Public: Destroy this layer.
  destroy() {
    if (this.destroyed) { return; }
    this.clear();
    this.delegate.markerLayerDestroyed(this);
    this.displayMarkerLayers.forEach(displayMarkerLayer => displayMarkerLayer.destroy());
    this.displayMarkerLayers.clear();
    this.destroyed = true;
    this.emitter.emit('did-destroy');
    return this.emitter.clear();
  }

  // Public: Remove all markers from this layer.
  clear() {
    this.markersWithDestroyListeners.forEach(marker => marker.destroy());
    this.markersWithDestroyListeners.clear();
    this.markersById = {};
    this.index = new MarkerIndex;
    this.displayMarkerLayers.forEach(layer => layer.didClearBufferMarkerLayer());
    return this.delegate.markersUpdated(this);
  }

  // Public: Determine whether this layer has been destroyed.
  isDestroyed() {
    return this.destroyed;
  }

  isAlive() {
    return !this.destroyed;
  }

  /*
  Section: Querying
  */

  // Public: Get an existing marker by its id.
  //
  // Returns a {Marker}.
  getMarker(id) {
    return this.markersById[id];
  }

  // Public: Get all existing markers on the marker layer.
  //
  // Returns an {Array} of {Marker}s.
  getMarkers() {
    return (() => {
      const result = [];
      for (let id in this.markersById) {
        const marker = this.markersById[id];
        result.push(marker);
      }
      return result;
    })();
  }

  // Public: Get the number of markers in the marker layer.
  //
  // Returns a {Number}.
  getMarkerCount() {
    return Object.keys(this.markersById).length;
  }

  // Public: Find markers in the layer conforming to the given parameters.
  //
  // See the documentation for {TextBuffer::findMarkers}.
  findMarkers(params) {
    let markerIds = null;

    for (let key of Array.from(Object.keys(params))) {
      const value = params[key];
      switch (key) {
        case 'startPosition':
          markerIds = filterSet(markerIds, this.index.findStartingAt(Point.fromObject(value)));
          break;
        case 'endPosition':
          markerIds = filterSet(markerIds, this.index.findEndingAt(Point.fromObject(value)));
          break;
        case 'startsInRange':
          var {start, end} = Range.fromObject(value);
          markerIds = filterSet(markerIds, this.index.findStartingIn(start, end));
          break;
        case 'endsInRange':
          ({start, end} = Range.fromObject(value));
          markerIds = filterSet(markerIds, this.index.findEndingIn(start, end));
          break;
        case 'containsPoint': case 'containsPosition':
          var position = Point.fromObject(value);
          markerIds = filterSet(markerIds, this.index.findContaining(position, position));
          break;
        case 'containsRange':
          ({start, end} = Range.fromObject(value));
          markerIds = filterSet(markerIds, this.index.findContaining(start, end));
          break;
        case 'intersectsRange':
          ({start, end} = Range.fromObject(value));
          markerIds = filterSet(markerIds, this.index.findIntersecting(start, end));
          break;
        case 'startRow':
          markerIds = filterSet(markerIds, this.index.findStartingIn(Point(value, 0), Point(value, Infinity)));
          break;
        case 'endRow':
          markerIds = filterSet(markerIds, this.index.findEndingIn(Point(value, 0), Point(value, Infinity)));
          break;
        case 'intersectsRow':
          markerIds = filterSet(markerIds, this.index.findIntersecting(Point(value, 0), Point(value, Infinity)));
          break;
        case 'intersectsRowRange':
          markerIds = filterSet(markerIds, this.index.findIntersecting(Point(value[0], 0), Point(value[1], Infinity)));
          break;
        case 'containedInRange':
          ({start, end} = Range.fromObject(value));
          markerIds = filterSet(markerIds, this.index.findContainedIn(start, end));
          break;
        default:
          continue;
      }
      delete params[key];
    }

    if (markerIds == null) { markerIds = new Set(Object.keys(this.markersById)); }

    const result = [];
    markerIds.forEach(markerId => {
      const marker = this.markersById[markerId];
      if (!marker.matchesParams(params)) { return; }
      return result.push(marker);
    });
    return result.sort((a, b) => a.compare(b));
  }

  // Public: Get the role of the marker layer e.g. `atom.selection`.
  //
  // Returns a {String}.
  getRole() {
    return this.role;
  }

  /*
  Section: Marker creation
  */

  // Public: Create a marker with the given range.
  //
  // * `range` A {Range} or range-compatible {Array}
  // * `options` A hash of key-value pairs to associate with the marker. There
  //   are also reserved property names that have marker-specific meaning.
  //   * `reversed` (optional) {Boolean} Creates the marker in a reversed
  //     orientation. (default: false)
  //   * `invalidate` (optional) {String} Determines the rules by which changes
  //     to the buffer *invalidate* the marker. (default: 'overlap') It can be
  //     any of the following strategies, in order of fragility:
  //     * __never__: The marker is never marked as invalid. This is a good choice for
  //       markers representing selections in an editor.
  //     * __surround__: The marker is invalidated by changes that completely surround it.
  //     * __overlap__: The marker is invalidated by changes that surround the
  //       start or end of the marker. This is the default.
  //     * __inside__: The marker is invalidated by changes that extend into the
  //       inside of the marker. Changes that end at the marker's start or
  //       start at the marker's end do not invalidate the marker.
  //     * __touch__: The marker is invalidated by a change that touches the marked
  //       region in any way, including changes that end at the marker's
  //       start or start at the marker's end. This is the most fragile strategy.
  //   * `exclusive` {Boolean} indicating whether insertions at the start or end
  //     of the marked range should be interpreted as happening *outside* the
  //     marker. Defaults to `false`, except when using the `inside`
  //     invalidation strategy or when when the marker has no tail, in which
  //     case it defaults to true. Explicitly assigning this option overrides
  //     behavior in all circumstances.
  //
  // Returns a {Marker}.
  markRange(range, options) {
    if (options == null) { options = {}; }
    return this.createMarker(this.delegate.clipRange(range), Marker.extractParams(options));
  }

  // Public: Create a marker at with its head at the given position with no tail.
  //
  // * `position` {Point} or point-compatible {Array}
  // * `options` (optional) An {Object} with the following keys:
  //   * `invalidate` (optional) {String} Determines the rules by which changes
  //     to the buffer *invalidate* the marker. (default: 'overlap') It can be
  //     any of the following strategies, in order of fragility:
  //     * __never__: The marker is never marked as invalid. This is a good choice for
  //       markers representing selections in an editor.
  //     * __surround__: The marker is invalidated by changes that completely surround it.
  //     * __overlap__: The marker is invalidated by changes that surround the
  //       start or end of the marker. This is the default.
  //     * __inside__: The marker is invalidated by changes that extend into the
  //       inside of the marker. Changes that end at the marker's start or
  //       start at the marker's end do not invalidate the marker.
  //     * __touch__: The marker is invalidated by a change that touches the marked
  //       region in any way, including changes that end at the marker's
  //       start or start at the marker's end. This is the most fragile strategy.
  //   * `exclusive` {Boolean} indicating whether insertions at the start or end
  //     of the marked range should be interpreted as happening *outside* the
  //     marker. Defaults to `false`, except when using the `inside`
  //     invalidation strategy or when when the marker has no tail, in which
  //     case it defaults to true. Explicitly assigning this option overrides
  //     behavior in all circumstances.
  //
  // Returns a {Marker}.
  markPosition(position, options) {
    if (options == null) { options = {}; }
    position = this.delegate.clipPosition(position);
    options = Marker.extractParams(options);
    options.tailed = false;
    return this.createMarker(this.delegate.clipRange(new Range(position, position)), options);
  }

  /*
  Section: Event subscription
  */

  // Public: Subscribe to be notified asynchronously whenever markers are
  // created, updated, or destroyed on this layer. *Prefer this method for
  // optimal performance when interacting with layers that could contain large
  // numbers of markers.*
  //
  // * `callback` A {Function} that will be called with no arguments when changes
  //   occur on this layer.
  //
  // Subscribers are notified once, asynchronously when any number of changes
  // occur in a given tick of the event loop. You should re-query the layer
  // to determine the state of markers in which you're interested in. It may
  // be counter-intuitive, but this is much more efficient than subscribing to
  // events on individual markers, which are expensive to deliver.
  //
  // Returns a {Disposable}.
  onDidUpdate(callback) {
    return this.emitter.on('did-update', callback);
  }

  // Public: Subscribe to be notified synchronously whenever markers are created
  // on this layer. *Avoid this method for optimal performance when interacting
  // with layers that could contain large numbers of markers.*
  //
  // * `callback` A {Function} that will be called with a {Marker} whenever a
  //   new marker is created.
  //
  // You should prefer {::onDidUpdate} when synchronous notifications aren't
  // absolutely necessary.
  //
  // Returns a {Disposable}.
  onDidCreateMarker(callback) {
    this.emitCreateMarkerEvents = true;
    return this.emitter.on('did-create-marker', callback);
  }

  // Public: Subscribe to be notified synchronously when this layer is destroyed.
  //
  // Returns a {Disposable}.
  onDidDestroy(callback) {
    return this.emitter.on('did-destroy', callback);
  }

  /*
  Section: Private - TextBuffer interface
  */

  splice(start, oldExtent, newExtent) {
    const invalidated = this.index.splice(start, oldExtent, newExtent);
    return invalidated.touch.forEach(id => {
      const marker = this.markersById[id];
      if (__guard__(invalidated[marker.getInvalidationStrategy()], x => x.has(id))) {
        if (this.destroyInvalidatedMarkers) {
          return marker.destroy();
        } else {
          return marker.valid = false;
        }
      }
    });
  }

  restoreFromSnapshot(snapshots, alwaysCreate) {
    let id, marker;
    if (snapshots == null) { return; }

    const snapshotIds = Object.keys(snapshots);
    const existingMarkerIds = Object.keys(this.markersById);

    for (id of Array.from(snapshotIds)) {
      const snapshot = snapshots[id];
      if (alwaysCreate) {
        this.createMarker(snapshot.range, snapshot, true);
        continue;
      }

      if (marker = this.markersById[id]) {
        marker.update(marker.getRange(), snapshot, true, true);
      } else {
        var range;
        ({marker} = snapshot);
        if (marker) {
          this.markersById[marker.id] = marker;
          ({range} = snapshot);
          this.index.insert(marker.id, range.start, range.end);
          marker.update(marker.getRange(), snapshot, true, true);
          if (this.emitCreateMarkerEvents) { this.emitter.emit('did-create-marker', marker); }
        } else {
          const newMarker = this.createMarker(snapshot.range, snapshot, true);
        }
      }
    }

    return (() => {
      const result = [];
      for (id of Array.from(existingMarkerIds)) {
        if ((marker = this.markersById[id]) && ((snapshots[id] == null))) {
          result.push(marker.destroy(true));
        } else {
          result.push(undefined);
        }
      }
      return result;
    })();
  }

  createSnapshot() {
    const result = {};
    const ranges = this.index.dump();
    for (let id of Array.from(Object.keys(this.markersById))) {
      const marker = this.markersById[id];
      result[id] = marker.getSnapshot(Range.fromObject(ranges[id]));
    }
    return result;
  }

  emitChangeEvents(snapshot) {
    return this.markersWithChangeListeners.forEach(function(marker) {
      if (!marker.isDestroyed()) { // event handlers could destroy markers
        return marker.emitChangeEvent(__guard__(snapshot != null ? snapshot[marker.id] : undefined, x => x.range), true, false);
      }
    });
  }

  serialize() {
    let id;
    const ranges = this.index.dump();
    const markersById = {};
    for (id of Array.from(Object.keys(this.markersById))) {
      const marker = this.markersById[id];
      const snapshot = marker.getSnapshot(Range.fromObject(ranges[id]), false);
      markersById[id] = snapshot;
    }

    return {id: this.id, maintainHistory: this.maintainHistory, role: this.role, persistent: this.persistent, markersById, version: SerializationVersion};
  }

  deserialize(state) {
    if (state.version !== SerializationVersion) { return; }
    this.id = state.id;
    this.maintainHistory = state.maintainHistory;
    this.role = state.role;
    if (this.role === "selections") { this.delegate.registerSelectionsMarkerLayer(this); }
    this.persistent = state.persistent;
    for (let id in state.markersById) {
      const markerState = state.markersById[id];
      const range = Range.fromObject(markerState.range);
      delete markerState.range;
      this.addMarker(id, range, markerState);
    }
  }

  /*
  Section: Private - Marker interface
  */

  markerUpdated() {
    return this.delegate.markersUpdated(this);
  }

  destroyMarker(marker, suppressMarkerLayerUpdateEvents) {
    if (suppressMarkerLayerUpdateEvents == null) { suppressMarkerLayerUpdateEvents = false; }
    if (this.markersById.hasOwnProperty(marker.id)) {
      delete this.markersById[marker.id];
      this.index.remove(marker.id);
      this.markersWithChangeListeners.delete(marker);
      this.markersWithDestroyListeners.delete(marker);
      this.displayMarkerLayers.forEach(displayMarkerLayer => displayMarkerLayer.destroyMarker(marker.id));
      if (!suppressMarkerLayerUpdateEvents) { return this.delegate.markersUpdated(this); }
    }
  }

  hasMarker(id) {
    return !this.destroyed && this.index.has(id);
  }

  getMarkerRange(id) {
    return Range.fromObject(this.index.getRange(id));
  }

  getMarkerStartPosition(id) {
    return Point.fromObject(this.index.getStart(id));
  }

  getMarkerEndPosition(id) {
    return Point.fromObject(this.index.getEnd(id));
  }

  compareMarkers(id1, id2) {
    return this.index.compare(id1, id2);
  }

  setMarkerRange(id, range) {
    let {start, end} = Range.fromObject(range);
    start = this.delegate.clipPosition(start);
    end = this.delegate.clipPosition(end);
    this.index.remove(id);
    return this.index.insert(id, start, end);
  }

  setMarkerIsExclusive(id, exclusive) {
    return this.index.setExclusive(id, exclusive);
  }

  createMarker(range, params, suppressMarkerLayerUpdateEvents) {
    if (suppressMarkerLayerUpdateEvents == null) { suppressMarkerLayerUpdateEvents = false; }
    const id = this.delegate.getNextMarkerId();
    const marker = this.addMarker(id, range, params);
    this.delegate.markerCreated(this, marker);
    if (!suppressMarkerLayerUpdateEvents) { this.delegate.markersUpdated(this); }
    marker.trackDestruction = this.trackDestructionInOnDidCreateMarkerCallbacks != null ? this.trackDestructionInOnDidCreateMarkerCallbacks : false;
    if (this.emitCreateMarkerEvents) { this.emitter.emit('did-create-marker', marker); }
    marker.trackDestruction = false;
    return marker;
  }

  /*
  Section: Internal
  */

  addMarker(id, range, params) {
    range = Range.fromObject(range);
    Point.assertValid(range.start);
    Point.assertValid(range.end);
    this.index.insert(id, range.start, range.end);
    return this.markersById[id] = new Marker(id, this, range, params);
  }

  emitUpdateEvent() {
    return this.emitter.emit('did-update');
  }
});

var filterSet = function(set1, set2) {
  if (set1) {
    intersectSet(set1, set2);
    return set1;
  } else {
    return set2;
  }
};

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let DOMListener;
const {Disposable} = require('event-kit');
const {specificity} = require('clear-cut');
const search = require('binary-search');

const SpecificityCache = {};

module.exports =
(DOMListener = class DOMListener {
  constructor(element) {
    this.dispatchEvent = this.dispatchEvent.bind(this);
    this.element = element;
    this.selectorBasedListenersByEventName = {};
    this.inlineListenersByEventName = {};
    this.nativeEventListeners = {};
  }

  add(target, eventName, handler) {
    if (!this.nativeEventListeners[eventName]) {
      this.element.addEventListener(eventName, this.dispatchEvent);
      this.nativeEventListeners[eventName] = true;
    }

    if (typeof target === 'string') {
      return this.addSelectorBasedListener(target, eventName, handler);
    } else {
      return this.addInlineListener(target, eventName, handler);
    }
  }

  destroy() {
    for (let eventName in this.nativeEventListeners) {
      this.element.removeEventListener(eventName, this.dispatchEvent);
    }
    this.selectorBasedListenersByEventName = {};
    this.inlineListenersByEventName = {};
    return this.nativeEventListeners = {};
  }

  addSelectorBasedListener(selector, eventName, handler) {
    const newListener = new SelectorBasedListener(selector, handler);
    const listeners = (this.selectorBasedListenersByEventName[eventName] != null ? this.selectorBasedListenersByEventName[eventName] : (this.selectorBasedListenersByEventName[eventName] = []));
    let index = search(listeners, newListener, (a, b) => b.specificity - a.specificity);
    if (index < 0) { index = -index - 1; } // index is negative index minus 1 if no exact match is found
    listeners.splice(index, 0, newListener);

    return new Disposable(function() {
      index = listeners.indexOf(newListener);
      return listeners.splice(index, 1);
    });
  }

  addInlineListener(node, eventName, handler) {
    let listeners;
    const listenersByNode = (this.inlineListenersByEventName[eventName] != null ? this.inlineListenersByEventName[eventName] : (this.inlineListenersByEventName[eventName] = new WeakMap));
    if (!(listeners = listenersByNode.get(node))) {
      listeners = [];
      listenersByNode.set(node, listeners);
    }
    listeners.push(handler);

    return new Disposable(function() {
      const index = listeners.indexOf(handler);
      return listeners.splice(index, 1);
    });
  }

  dispatchEvent(event) {
    let currentTarget = event.target;
    let propagationStopped = false;
    let immediatePropagationStopped = false;
    let defaultPrevented = false;

    const descriptor = {
      type: { value: event.type
    },
      detail: { value: event.detail
    },
      eventPhase: { value: Event.BUBBLING_PHASE
    },
      target: { value: currentTarget
    },
      currentTarget: { get() { return currentTarget; }
    },
      stopPropagation: { value() {
        propagationStopped = true;
        return event.stopPropagation();
      }
    },
      stopImmediatePropagation: { value() {
        propagationStopped = true;
        immediatePropagationStopped = true;
        return event.stopImmediatePropagation();
      }
    },
      preventDefault: { value() {
        defaultPrevented = true;
        return event.preventDefault();
      }
    },
      defaultPrevented: { get() { return defaultPrevented; }
    }
    };

    for (let key in event) {
      const value = event[key];
      if (descriptor[key] == null) { descriptor[key] = {value}; }
    }

    const syntheticEvent = Object.create(event.constructor.prototype, descriptor);

    return (() => {
      const result = [];
      while (true) {
        var handler;
        const inlineListeners = this.inlineListenersByEventName[event.type] != null ? this.inlineListenersByEventName[event.type].get(currentTarget) : undefined;
        if (inlineListeners != null) {
          for (handler of Array.from(inlineListeners)) {
            handler.call(currentTarget, syntheticEvent);
            if (immediatePropagationStopped) { break; }
          }
        }

        if (immediatePropagationStopped) { break; }

        const selectorBasedListeners = this.selectorBasedListenersByEventName[event.type];
        if ((selectorBasedListeners != null) && (typeof currentTarget.matches === 'function')) {
          for (let listener of Array.from(selectorBasedListeners)) {
            if (currentTarget.matches(listener.selector)) {
              listener.handler.call(currentTarget, syntheticEvent);
              if (immediatePropagationStopped) { break; }
            }
          }
        }

        if (propagationStopped) { break; }
        if (currentTarget === this.element) { break; }
        result.push(currentTarget = currentTarget.parentNode);
      }
      return result;
    })();
  }
});

class SelectorBasedListener {
  constructor(selector, handler) {
    this.selector = selector;
    this.handler = handler;
    this.specificity = (SpecificityCache[this.selector] != null ? SpecificityCache[this.selector] : (SpecificityCache[this.selector] = specificity(this.selector)));
  }
}

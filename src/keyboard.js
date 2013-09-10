/**
 * The Keyboard module defines an event API for key events.
 * @module core
 * @submodule keyboard
 */

var keyboard = (function() {
  var key = {
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    tab: 9,
    esc: 27,
    backspace: 8,
    'delete': 46,
    enter: 13
  }

  var listeners = {};

  var addListener = function(event, listener) {
    if (listeners[event] === undefined) {
      listeners[event] = [];
    }

    listeners[event].push(listener);
  };

  var notifyListeners = function(event, context) {
    var eventListeners = listeners[event];
    if (eventListeners === undefined) return;

    for (var i=0, len=eventListeners.length; i < len; i++) {
      if(eventListeners[i].apply(
          context,
          Array.prototype.slice.call(arguments).splice(2)
      ) === false)
        break;
    }
  };

  /**
   * Singleton that defines its own API for keyboard events and dispatches
   * keyboard events from the browser to this API.
   * The keyboard API events are handled by {{#crossLink "Dispatcher"}}{{/crossLink}}.
   * @class Keyboard
   * @static
   */
  return {
    dispatchKeyEvent: function(event, target) {
      switch (event.keyCode) {

      case key.left:
        notifyListeners('left', target, event);
        break;

      case key.right:
        notifyListeners('right', target, event);
        break;

      case key.up:
        notifyListeners('up', target, event);
        break;

      case key.down:
        notifyListeners('down', target, event);
        break;

      case key.tab:
        if (event.shiftKey) {
          notifyListeners('shiftTab', target, event);
        } else {
          notifyListeners('tab', target, event);
        }
        break;

      case key.esc:
        notifyListeners('esc', target, event);
        break;

      case key.backspace:
        notifyListeners('backspace', target, event);
        break;

      case key['delete']:
        notifyListeners('delete', target, event);
        break;

      case key.enter:
        if (event.shiftKey) {
          notifyListeners('shiftEnter', target, event);
        } else {
          notifyListeners('enter', target, event);
        }
        break;

      }
    },

    on: function(event, handler) {
      addListener(event, handler);
      return this;
    },

    // export key-codes for testing
    key: key
  };
})();

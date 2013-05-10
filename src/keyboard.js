/**
 * The Keyboard module defines an event API for key events.
 * @module core
 * @submodule keyboard
 */

var keyboard = (function() {
  var KEY_LEFT = 37,
      KEY_UP = 38,
      KEY_RIGHT = 39,
      KEY_DOWN = 40,
      KEY_TAB = 9,
      KEY_ESC = 27,
      KEY_BACKSPACE = 8,
      KEY_DELETE = 46,
      KEY_ENTER = 13;

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

      case KEY_LEFT:
        notifyListeners('left', target, event);
        break;

      case KEY_RIGHT:
        notifyListeners('right', target, event);
        break;

      case KEY_UP:
        notifyListeners('up', target, event);
        break;

      case KEY_DOWN:
        notifyListeners('down', target, event);
        break;

      case KEY_TAB:
        if (event.shiftKey) {
          notifyListeners('shiftTab', target, event);
        } else {
          notifyListeners('tab', target, event);
        }
        break;

      case KEY_ESC:
        notifyListeners('esc', target, event);
        break;

      case KEY_BACKSPACE:
        notifyListeners('backspace', target, event);
        break;

      case KEY_DELETE:
        notifyListeners('delete', target, event);
        break;

      case KEY_ENTER:
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
    }
  };
})();

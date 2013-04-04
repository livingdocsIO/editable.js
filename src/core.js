/**
 * The Core module provides main functionalities of Editable.JS API.
 *
 * @module core
 */

(function() {
  'use strict';

  var EVENTS = [
    /**
     * The focus event is triggered when an element gains focus.
     *
     * @event focus
     * @param {HTMLElement} element The element triggering the event.
     */
    'focus',

    /**
     * The blur event is triggered when an element looses focus.
     *
     * @event blur
     * @param {HTMLElement} element The element triggering the event.
     */
    'blur',

    /**
     * The flow event is triggered when the user starts typing or pause typing.
     *
     * @event flow
     * @param {HTMLElement} element The element triggering the event.
     * @param {String} action The flow action: "start" or "pause".
     */
    'flow',

    /**
     * The selection event is triggered after the user has selected some
     * content.
     *
     * @event selection
     * @param {HTMLElement} element The element triggering the event.
     * @param {Selection} selection The actual Selection object.
     */
    'selection',

    /**
     * The cursor event is triggered after cursor position has changed.
     *
     * @event cursor
     * @param {HTMLElement} element The element triggering the event.
     * @param {Cursor} cursor The actual Cursor object.
     */
    'cursor',

    /**
     * The insert event is triggered when a new block should be inserted. This
     * happens when ENTER key is pressed at the beginning of a block (should
     * insert before) or at the end of a block (should insert after).
     *
     * @event insert
     * @param {HTMLElement} element The element triggering the event.
     * @param {String} direction The insert direction: "before" or "after".
     */
    'insert',

    /**
     * The split event is triggered when a block should be splitted into two
     * blocks. This happens when ENTER is pressed within a non-empty block.
     *
     * @event split
     * @param {HTMLElement} element The element triggering the event.
     * @param {String} before The HTML string before the split.
     * @param {String} after The HTML string after the split.
     */
    'split',

    /**
     * The merge event is triggered when two needs to be merged. This happens
     * when BACKSPACE is pressed at the beginning of a block (should merge with
     * the preceeding block) or DEL is pressed at the end of a block (should
     * merge with the following block).
     *
     * @event merge
     * @param {HTMLElement} element The element triggering the event.
     * @param {String} direction The merge direction: "before" or "after".
     */
    'merge',

    /**
     * The empty event is triggered when a block is emptied.
     *
     * @event empty
     * @param {HTMLElement} element The element triggering the event.
     */
    'empty',

    /**
     * The switch event is triggered when the user switches to another block.
     * This happens when TAB is pressed (move one block after) or SHIFT+TAB
     * is pressed (move one block before).
     *
     * @event switch
     * @param {HTMLElement} element The element triggering the event.
     * @param {String} direction The switch direction: "before" or "after".
     */
    'switch',

    /**
     * The move event is triggered when the user moves a selection in a block.
     * This happens when the user selects some (or all) content in a block and
     * an ARROW key is pressed (up: drag before, down: drag after).
     *
     * @event move
     * @param {HTMLElement} element The element triggering the event.
     * @param {Selection} selection The actual Selection object.
     * @param {String} direction The move direction: "before" or "after".
     */
    'move',

    /**
     * The clipboard event is triggered when the user copies, pastes or cuts
     * a selection within a block.
     *
     * @event clipboard
     * @param {HTMLElement} element The element triggering the event.
     * @param {Selection} selection The actual Selection object.
     * @param {String} action The clipboard action: "copy", "paste", "cut".
     */
    'cliboard'
  ];

  var isInitialized = false;

  var listeners = {};

  var addListener = function(event, listener) {
    if (listeners[event] === undefined) {
      listeners[event] = [];
    }

    listeners[event].push(listener);
  };

  var removeListener = function(event, listener) {
    var eventListeners = listeners[event];
    if (eventListeners === undefined) return;

    for (var i=0, len=eventListeners.length; i < len; i++) {
      if (eventListeners[i] === listener){
        eventListeners.splice(i, 1);
        break;
      }
    }
  };

  var notifyListeners = function(event, context, args) {
    var eventListeners = listeners[event];
    if (eventListeners === undefined) return;

    for (var i=0, len=eventListeners.length; i < len; i++) {
      eventListeners[i].apply(context, args);
    }
  };

  /**
   * @class Editable
   * @static
   */
  Editable = {
    /**
     * Initializes the API.
     *
     * @method init
     * @param {Object} [options={}] Configuration options override.
     * @static
     * @chainable
     */
    init: function(options) {
      if (isInitialized) { return; }
      isInitialized = true;

      events.setup();

      return this;
    },

    /**
     * Adds the API to the given target elements.
     *
     * @method add
     * @param {HTMLElement|Array(HTMLElement)|String} target A HTMLElement, an
     *    array of HTMLElement or a query selector representing the target where
     *    the API should be added on.
     * @param {Object} [options={}] Configuration options override.
     * @static
     * @chainable
     */
    add: function(target, options) {
      $(target).attr('contenteditable', true);
      $(target).addClass('-js-editable');
      // todo: check css whitespace settings
      // todo: much much more obviously...
      return this;
    },

    /**
     * Removes the API from the given target elements.
     *
     * @method remove
     * @param {HTMLElement|Array(HTMLElement)|String} target A HTMLElement, an
     *    array of HTMLElement or a query selector representing the target where
     *    the API should be removed from.
     * @static
     * @chainable
     */
    remove: function(target) {
      $(target).removeAttr('contenteditable');
      $(target).removeClass('-js-editable');
      return this;
    },

    /**
     * Subscribe a callback function to a custom event fired by the API.
     *
     * @method on
     * @param {String} event The name of the event.
     * @param {Function} handler The callback to execute in response to the
     *     event.
     * @static
     * @chainable
     */
    on: function(event, handler) {
      // TODO throw error if event is not one of EVENTS
      // TODO throw error if handler is not a function
      addListener(event, handler);
      return this;
    },

    _trigger: function(event, context, args) {
      // TODO throw error if event is not one of EVENTS
      // TODO context=this if not specified
      // TODO if args is defined use it instead of function arguments
      notifyListeners(event, context, Array.prototype.slice.call(arguments).splice(2));
    },

    /**
     * Unsubscribe a callback function from a custom event fired by the API.
     *
     * @method off
     * @param {String} event The name of the event.
     * @param {Function|Boolean} handler The callback to remove from the
     *     event or the special value false to remove all callbacks.
     * @static
     * @chainable
     */
    off: function(event, handler) {
      // TODO throw error if event is not one of EVENTS
      // TODO if handler is flase remove all callbacks
      removeListener(event, handler);
      return this;
    },

    /**
     * Subscribe to the {{#crossLink "Editable/focus:event"}}{{/crossLink}}
     * event.
     *
     * @method focus
     * @param {Function} handler The callback to execute in response to the
     *   event.
     * @static
     * @chainable
     */
    focus: function(handler) {
      return this;
    },

    /**
     * Subscribe to the {{#crossLink "Editable/blur:event"}}{{/crossLink}}
     * event.
     *
     * @method blur
     * @param {Function} handler The callback to execute in response to the
     *   event.
     * @static
     * @chainable
     */
    blur: function(handler) {
      return this;
    },

    /**
     * Subscribe to the {{#crossLink "Editable/flow:event"}}{{/crossLink}}
     * event.
     *
     * @method flow
     * @param {Function} handler The callback to execute in response to the
     *   event.
     * @static
     * @chainable
     */
    flow: function(handler) {
      return this;
    },

    /**
     * Subscribe to the {{#crossLink "Editable/selection:event"}}{{/crossLink}}
     * event.
     *
     * @method selection
     * @param {Function} handler The callback to execute in response to the
     *   event.
     * @static
     * @chainable
     */
    selection: function(handler) {
      return this;
    },

    /**
     * Subscribe to the {{#crossLink "Editable/cursor:event"}}{{/crossLink}}
     * event.
     *
     * @method cursor
     * @param {Function} handler The callback to execute in response to the
     *   event.
     * @static
     * @chainable
     */
    cursor: function(handler) {
      return this;
    },

    /**
     * Subscribe to the {{#crossLink "Editable/insert:event"}}{{/crossLink}}
     * event.
     *
     * @method insert
     * @param {Function} handler The callback to execute in response to the
     *   event.
     * @static
     * @chainable
     */
    insert: function(handler) {
      return this;
    },

    /**
     * Subscribe to the {{#crossLink "Editable/split:event"}}{{/crossLink}}
     * event.
     *
     * @method split
     * @param {Function} handler The callback to execute in response to the
     *   event.
     * @static
     * @chainable
     */
    split: function(handler) {
      return this;
    },

    /**
     * Subscribe to the {{#crossLink "Editable/merge:event"}}{{/crossLink}}
     * event.
     *
     * @method merge
     * @param {Function} handler The callback to execute in response to the
     *   event.
     * @static
     * @chainable
     */
    merge: function(handler) {
      return this;
    },

    /**
     * Subscribe to the {{#crossLink "Editable/empty:event"}}{{/crossLink}}
     * event.
     *
     * @method empty
     * @param {Function} handler The callback to execute in response to the
     *   event.
     * @static
     * @chainable
     */
    empty: function(handler) {
      return this;
    },

    /**
     * Subscribe to the {{#crossLink "Editable/switch:event"}}{{/crossLink}}
     * event.
     *
     * @method switch
     * @param {Function} handler The callback to execute in response to the
     *   event.
     * @static
     * @chainable
     */
    'switch': function(handler) {
      return this;
    },

    /**
     * Subscribe to the {{#crossLink "Editable/move:event"}}{{/crossLink}}
     * event.
     *
     * @method move
     * @param {Function} handler The callback to execute in response to the
     *   event.
     * @static
     * @chainable
     */
    move: function(handler) {
      return this;
    },

    /**
     * Subscribe to the {{#crossLink "Editable/clipboard:event"}}{{/crossLink}}
     * event.
     *
     * @method clipboard
     * @param {Function} handler The callback to execute in response to the
     *   event.
     * @static
     * @chainable
     */
    clipboard: function(handler) {
      return this;
    }
  };
})();

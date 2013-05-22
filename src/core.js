/**
 * The Core module provides the Editable singleton that defines the Editable.JS
 * API and is the main entry point for Editable.JS.
 * It also provides the cursor module for cross-browser cursors, and the dom
 * submodule.
 *
 * @module core
 */

(function() {
  var isInitialized = false;

  var initialize = function() {
    if (!isInitialized) {
      // TODO check config file integrity

      isInitialized = true;
      dispatcher.setup();
    }
  };

  /**
   * Singleton for the Editable.JS API that is externally visible.
   * Note that the Editable literal is defined
   * first in editable.prefix in order for it to be the only externally visible
   * variable.
   *
   * @class Editable
   * @static
   */
  Editable = {
    /**
     * Adds the Editable.JS API to the given target elements.
     * Opposite of {{#crossLink "Editable/remove"}}{{/crossLink}}.
     * Calls dispatcher.setup to setup all event listeners.
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
      initialize();

      $(target).attr('contenteditable', true);
      $(target).addClass('-js-editable');
      // todo: check css whitespace settings
      // todo: much much more obviously...
      return this;
    },

    /**
     * Removes the Editable.JS API from the given target elements.
     * Opposite of {{#crossLink "Editable/add"}}{{/crossLink}}.
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
     * Opposite of {{#crossLink "Editable/off"}}{{/crossLink}}.
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
      dispatcher.addListener(event, handler);
      return this;
    },

    /**
     * Unsubscribe a callback function from a custom event fired by the API.
     * Opposite of {{#crossLink "Editable/on"}}{{/crossLink}}.
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
      dispatcher.removeListener(event, handler);
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
      return this.on('focus', handler);
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
      return this.on('blur', handler);
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
      return this.on('flow', handler);
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
      return this.on('selection', handler);
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
      return this.on('cursor', handler);
    },

    /**
     * Subscribe to the {{#crossLink "Editable/newline:event"}}{{/crossLink}}
     * event.
     *
     * @method newline
     * @param {Function} handler The callback to execute in response to the
     *   event.
     * @static
     * @chainable
     */
    newline: function(handler) {
      return this.on('newline', handler);
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
      return this.on('insert', handler);
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
      return this.on('split', handler);
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
      return this.on('merge', handler);
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
      return this.on('empty', handler);
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
      return this.on('switch', handler);
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
      return this.on('move', handler);
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
      return this.on('clipboard', handler);
    }
  };
})();

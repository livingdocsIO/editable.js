/**
 * The Core module provides the Editable singleton that defines the Editable.JS
 * API and is the main entry point for Editable.JS.
 * It also provides the cursor module for cross-browser cursors, and the dom
 * submodule.
 *
 * @module core
 */

/**
 * Singleton for the Editable.JS API that is externally visible.
 * Note that the Editable literal is defined
 * first in editable.prefix in order for it to be the only externally visible
 * variable.
 *
 * @class Editable
 */
Editable = function(userConfig) {
  this.config = $.extend(true, {}, config, userConfig);
  this.win = this.config.window || window;
  this.editableSelector = '.' + this.config.editableClass;

  if (!rangy.initialized) {
    rangy.init();
  }

  this.dispatcher = new Dispatcher(this);
  if (this.config.defaultBehavior === true) {
    this.dispatcher.on(createDefaultEvents(this));
  }
};

window.Editable = Editable;

/**
 * Adds the Editable.JS API to the given target elements.
 * Opposite of {{#crossLink "Editable/remove"}}{{/crossLink}}.
 * Calls dispatcher.setup to setup all event listeners.
 *
 * @method add
 * @param {HTMLElement|Array(HTMLElement)|String} target A HTMLElement, an
 *    array of HTMLElement or a query selector representing the target where
 *    the API should be added on.
 * @param {Object} [elementConfiguration={}] Configuration options override.
 * @chainable
 */
Editable.prototype.add = function(target, elementConfiguration) {
  var elemConfig = $.extend(true, {}, config, elementConfiguration);
  // todo: store element configuration
  this.enable($(target));

  // todo: check css whitespace settings
  return this;
};


/**
 * Removes the Editable.JS API from the given target elements.
 * Opposite of {{#crossLink "Editable/add"}}{{/crossLink}}.
 *
 * @method remove
 * @param {HTMLElement|Array(HTMLElement)|String} target A HTMLElement, an
 *    array of HTMLElement or a query selector representing the target where
 *    the API should be removed from.
 * @chainable
 */
Editable.prototype.remove = function(target) {
  var $target = $(target);
  this.disable($target);
  $target.removeClass(config.editableDisabledClass);
  return this;
};


/**
 * Removes the Editable.JS API from the given target elements.
 * The target elements are marked as disabled.
 *
 * @method disable
 * @param { jQuery element | undefined  } target editable root element(s)
 *    If no param is specified all editables are disabled.
 * @chainable
 */
Editable.prototype.disable = function($elem) {
  var body = this.win.document.body;
  $elem = $elem || $('.' + config.editableClass, body);
  $elem
    .removeAttr('contenteditable')
    .removeClass(config.editableClass)
    .addClass(config.editableDisabledClass);

  return this;
};



/**
 * Adds the Editable.JS API to the given target elements.
 *
 * @method enable
 * @param { jQuery element | undefined } target editable root element(s)
 *    If no param is specified all editables marked as disabled are enabled.
 * @chainable
 */
Editable.prototype.enable = function($elem, normalize) {
  var body = this.win.document.body;
  $elem = $elem || $('.' + config.editableDisabledClass, body);
  $elem
    .attr('contenteditable', true)
    .removeClass(config.editableDisabledClass)
    .addClass(config.editableClass);

  if (normalize) {
    $elem.each(function(index, el) {
      content.normalizeTags(el);
      content.normalizeSpaces(el);
    });
  }

  return this;
};

/**
 * Temporarily disable an editable.
 * Can be used to prevent text selction while dragging an element
 * for example.
 *
 * @method suspend
 * @param jQuery object
 */
Editable.prototype.suspend = function($elem) {
  var body = this.win.document.body;
  $elem = $elem || $('.' + config.editableClass, body);
  $elem.removeAttr('contenteditable');
  return this;
};

/**
 * Reverse the effects of suspend()
 *
 * @method continue
 * @param jQuery object
 */
Editable.prototype.continue = function($elem) {
  var body = this.win.document.body;
  $elem = $elem || $('.' + config.editableClass, body);
  $elem.attr('contenteditable', true)
  return this;
};

/**
 * Set the cursor inside of an editable block.
 *
 * @method createCursor
 * @param position 'beginning', 'end', 'before', 'after'
 */
Editable.prototype.createCursor = function(element, position) {
  var cursor;
  var $host = $(element).closest(this.editableSelector);
  position = position || 'beginning';

  if ($host.length) {
    var range = rangy.createRange();

    if (position === 'beginning' || position === 'end') {
      range.selectNodeContents(element);
      range.collapse(position === 'beginning' ? true : false);
    } else if (element !== $host[0]) {
      if (position === 'before') {
        range.setStartBefore(element);
        range.setEndBefore(element);
      } else if (position === 'after') {
        range.setStartAfter(element);
        range.setEndAfter(element);
      }
    } else {
      error('EditableJS: cannot create cursor outside of an editable block.');
    }

    cursor = new Cursor($host[0], range);
  }

  return cursor;
};

Editable.prototype.createCursorAtBeginning = function(element) {
  this.createCursor(element, 'beginning');
};

Editable.prototype.createCursorAtEnd = function(element) {
  this.createCursor(element, 'end');
};

Editable.prototype.createCursorBefore = function(element) {
  this.createCursor(element, 'before');
};

Editable.prototype.createCursorAfter = function(element) {
  this.createCursor(element, 'after');
};


/**
 * Subscribe a callback function to a custom event fired by the API.
 *
 * @param {String} event The name of the event.
 * @param {Function} handler The callback to execute in response to the
 *     event.
 *
 * @chainable
 */
Editable.prototype.on = function(event, handler) {
  // TODO throw error if event is not one of EVENTS
  // TODO throw error if handler is not a function
  this.dispatcher.on(event, handler);
  return this;
};

/**
 * Unsubscribe a callback function from a custom event fired by the API.
 * Opposite of {{#crossLink "Editable/on"}}{{/crossLink}}.
 *
 * @param {String} event The name of the event.
 * @param {Function} handler The callback to remove from the
 *     event or the special value false to remove all callbacks.
 *
 * @chainable
 */
Editable.prototype.off = function(event, handler) {
  var args = Array.prototype.slice.call(arguments);
  this.dispatcher.off.apply(this.dispatcher, args);
  return this;
};

/**
 * Unsubscribe all callbacks and event listeners.
 *
 * @chainable
 */
Editable.prototype.unload = function() {
  this.dispatcher.unload();
  return this;
};

/**
 * Subscribe to the {{#crossLink "Editable/focus:event"}}{{/crossLink}}
 * event.
 *
 * @method focus
 * @param {Function} handler The callback to execute in response to the
 *   event.
 * @chainable
 */
Editable.prototype.focus = function(handler) {
  return this.on('focus', handler);
};

/**
 * Subscribe to the {{#crossLink "Editable/blur:event"}}{{/crossLink}}
 * event.
 *
 * @method blur
 * @param {Function} handler The callback to execute in response to the
 *   event.
 * @chainable
 */
Editable.prototype.blur = function(handler) {
  return this.on('blur', handler);
};

/**
 * Subscribe to the {{#crossLink "Editable/flow:event"}}{{/crossLink}}
 * event.
 *
 * @method flow
 * @param {Function} handler The callback to execute in response to the
 *   event.
 * @chainable
 */
Editable.prototype.flow = function(handler) {
  return this.on('flow', handler);
};

/**
 * Subscribe to the {{#crossLink "Editable/selection:event"}}{{/crossLink}}
 * event.
 *
 * @method selection
 * @param {Function} handler The callback to execute in response to the
 *   event.
 * @chainable
 */
Editable.prototype.selection = function(handler) {
  return this.on('selection', handler);
};

/**
 * Subscribe to the {{#crossLink "Editable/cursor:event"}}{{/crossLink}}
 * event.
 *
 * @method cursor
 * @param {Function} handler The callback to execute in response to the
 *   event.
 * @chainable
 */
Editable.prototype.cursor = function(handler) {
  return this.on('cursor', handler);
};

/**
 * Subscribe to the {{#crossLink "Editable/newline:event"}}{{/crossLink}}
 * event.
 *
 * @method newline
 * @param {Function} handler The callback to execute in response to the
 *   event.
 * @chainable
 */
Editable.prototype.newline = function(handler) {
  return this.on('newline', handler);
};

/**
 * Subscribe to the {{#crossLink "Editable/insert:event"}}{{/crossLink}}
 * event.
 *
 * @method insert
 * @param {Function} handler The callback to execute in response to the
 *   event.
 * @chainable
 */
Editable.prototype.insert = function(handler) {
  return this.on('insert', handler);
};

/**
 * Subscribe to the {{#crossLink "Editable/split:event"}}{{/crossLink}}
 * event.
 *
 * @method split
 * @param {Function} handler The callback to execute in response to the
 *   event.
 * @chainable
 */
Editable.prototype.split = function(handler) {
  return this.on('split', handler);
};

/**
 * Subscribe to the {{#crossLink "Editable/merge:event"}}{{/crossLink}}
 * event.
 *
 * @method merge
 * @param {Function} handler The callback to execute in response to the
 *   event.
 * @chainable
 */
Editable.prototype.merge = function(handler) {
  return this.on('merge', handler);
};

/**
 * Subscribe to the {{#crossLink "Editable/empty:event"}}{{/crossLink}}
 * event.
 *
 * @method empty
 * @param {Function} handler The callback to execute in response to the
 *   event.
 * @chainable
 */
Editable.prototype.empty = function(handler) {
  return this.on('empty', handler);
};

/**
 * Subscribe to the {{#crossLink "Editable/switch:event"}}{{/crossLink}}
 * event.
 *
 * @method switch
 * @param {Function} handler The callback to execute in response to the
 *   event.
 * @chainable
 */
Editable.prototype['switch'] = function(handler) {
  return this.on('switch', handler);
};

/**
 * Subscribe to the {{#crossLink "Editable/move:event"}}{{/crossLink}}
 * event.
 *
 * @method move
 * @param {Function} handler The callback to execute in response to the
 *   event.
 * @chainable
 */
Editable.prototype.move = function(handler) {
  return this.on('move', handler);
};

/**
 * Subscribe to the {{#crossLink "Editable/clipboard:event"}}{{/crossLink}}
 * event.
 *
 * @method clipboard
 * @param {Function} handler The callback to execute in response to the
 *   event.
 * @chainable
 */
Editable.prototype.clipboard = function(handler) {
  return this.on('clipboard', handler);
};


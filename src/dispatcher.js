/**
 * The Dispatcher module is responsible for dealing with events and their handlers.
 *
 * @module core
 * @submodule dispatcher
 */

var Dispatcher = function(editable) {
  var win = editable.win;
  this.$document = $(win.document);
  this.editable = editable;
  this.config = editable.config;
  this.editableSelector = editable.editableSelector;
  this.selectionWatcher = new SelectionWatcher(this, win);
  this.setup();
};


/**
 * Sets up all events that Editable.JS is catching.
 *
 * @method setup
 */
Dispatcher.prototype.setup = function() {
  this.listeners = {};
  var $document = this.$document;

  // setup all events notifications
  this.setupElementEvents();
  this.setupKeyboardEvents();

  if (browserFeatures.selectionchange) {
    this.setupSelectionChangeEvents();
  } else {
    this.setupSelectionChangeFallback();
  }
};

/**
 * Sets up events that are triggered on modifying an element.
 *
 * @method setupElementEvents
 * @param {HTMLElement} $document: The document element.
 * @param {Function} notifier: The callback to be triggered when the event is caught.
 */
Dispatcher.prototype.setupElementEvents = function() {
  var _this = this;
  this.$document.on('focus.editable', _this.editableSelector, function(event) {
    if (this.getAttribute(_this.config.pastingAttribute)) return;
    _this.notify('focus', this);
  }).on('blur.editable', _this.editableSelector, function(event) {
    if (this.getAttribute(_this.config.pastingAttribute)) return;
    _this.notify('blur', this);
  }).on('copy.editable', _this.editableSelector, function(event) {
    log('Copy');
    _this.notify('clipboard', this, 'copy', _this.selectionWatcher.getFreshSelection());
  }).on('cut.editable', _this.editableSelector, function(event) {
    log('Cut');
    _this.notify('clipboard', this, 'cut', _this.selectionWatcher.getFreshSelection());
  }).on('paste.editable', _this.editableSelector, function(event) {
    log('Paste');
    _this.notify('clipboard', this, 'paste', _this.selectionWatcher.getFreshSelection());
  });
};

Dispatcher.prototype.dispatchSwitchEvent = function(event, element, direction) {
  var cursor;
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
    return;

  cursor = this.selectionWatcher.getSelection();
  if (!cursor || cursor.isSelection) return;
  // Detect if the browser moved the cursor in the next tick.
  // If the cursor stays at its position, fire the switch event.
  var dispatcher = this;
  setTimeout(function() {
    var newCursor = dispatcher.selectionWatcher.forceCursor();
    if (newCursor.equals(cursor)) {
      event.preventDefault();
      event.stopPropagation();
      dispatcher.notify('switch', element, direction, newCursor);
    }
  }, 1);
};

/**
 * Sets up events that are triggered on keyboard events.
 * Keyboard definitions are in {{#crossLink "Keyboard"}}{{/crossLink}}.
 *
 * @method setupKeyboardEvents
 * @param {HTMLElement} $document: The document element.
 * @param {Function} notifier: The callback to be triggered when the event is caught.
 */
Dispatcher.prototype.setupKeyboardEvents = function() {
  var _this = this;

  this.$document.on('keydown.editable', this.editableSelector, function(event) {
    keyboard.dispatchKeyEvent(event, this);
  });

  keyboard.on('left', function(event) {
    log('Left key pressed');
    _this.dispatchSwitchEvent(event, this, 'before');
  }).on('up', function(event) {
    log('Up key pressed');
    _this.dispatchSwitchEvent(event, this, 'before');
  }).on('right', function(event) {
    log('Right key pressed');
    _this.dispatchSwitchEvent(event, this, 'after');
  }).on('down', function(event) {
    log('Down key pressed');
    _this.dispatchSwitchEvent(event, this, 'after');
  }).on('tab', function(event) {
    log('Tab key pressed');
  }).on('shiftTab', function(event) {
    log('Shift+Tab key pressed');
  }).on('esc', function(event) {
    log('Esc key pressed');
  }).on('backspace', function(event) {
    log('Backspace key pressed');

    var range = _this.selectionWatcher.getFreshRange();
    if (range.isCursor) {
      var cursor = range.getCursor();
      if ( cursor.isAtBeginning() ) {
        event.preventDefault();
        event.stopPropagation();
        _this.notify('merge', this, 'before', cursor);
      }
    }
  }).on('delete', function(event) {
    log('Delete key pressed');

    var range = _this.selectionWatcher.getFreshRange();
    if (range.isCursor) {
      var cursor = range.getCursor();
      if (cursor.isAtTextEnd()) {
        event.preventDefault();
        event.stopPropagation();
        _this.notify('merge', this, 'after', cursor);
      }
    }
  }).on('enter', function(event) {
    log('Enter key pressed');
    event.preventDefault();
    event.stopPropagation();
    var range = _this.selectionWatcher.getFreshRange();
    var cursor = range.forceCursor();

    if (cursor.isAtTextEnd()) {
      _this.notify('insert', this, 'after', cursor);
    } else if (cursor.isAtBeginning()) {
      _this.notify('insert', this, 'before', cursor);
    } else {
      _this.notify('split', this, cursor.before(), cursor.after(), cursor);
    }

  }).on('shiftEnter', function(event) {
    log('Shift+Enter key pressed');
    event.preventDefault();
    event.stopPropagation();
    var cursor = _this.selectionWatcher.forceCursor();
    _this.notify('newline', this, cursor);
  });
};

/**
 * Sets up events that are triggered on a selection change.
 *
 * @method setupSelectionChangeEvents
 * @param {HTMLElement} $document: The document element.
 * @param {Function} notifier: The callback to be triggered when the event is caught.
 */
Dispatcher.prototype.setupSelectionChangeEvents = function() {
  var selectionDirty = false;
  var suppressSelectionChanges = false;
  var $document = this.$document;
  var selectionWatcher = this.selectionWatcher;
  var _this = this;

  // fires on mousemove (thats probably a bit too much)
  // catches changes like 'select all' from context menu
  $document.on('selectionchange.editable', function(event) {
    if (suppressSelectionChanges) {
      selectionDirty = true;
    } else {
      selectionWatcher.selectionChanged();
    }
  });

  // listen for selection changes by mouse so we can
  // suppress the selectionchange event and only fire the
  // change event on mouseup
  $document.on('mousedown.editable', this.editableSelector, function(event) {
    if (_this.config.mouseMoveSelectionChanges === false) {
      suppressSelectionChanges = true;

      // Without this timeout the previous selection is active
      // until the mouseup event (no. not good).
      setTimeout($.proxy(selectionWatcher, 'selectionChanged'), 0);
    }

    $document.on('mouseup.editableSelection', function(event) {
      $document.off('.editableSelection');
      suppressSelectionChanges = false;

      if (selectionDirty) {
        selectionDirty = false;
        selectionWatcher.selectionChanged();
      }
    });
  });
};


/**
 * Fallback solution to support selection change events on browsers that don't
 * support selectionChange.
 *
 * @method setupSelectionChangeFallback
 * @param {HTMLElement} $document: The document element.
 * @param {Function} notifier: The callback to be triggered when the event is caught.
 */
Dispatcher.prototype.setupSelectionChangeFallback = function() {
  var $document = this.$document;
  var selectionWatcher = this.selectionWatcher;

  // listen for selection changes by mouse
  $document.on('mouseup.editableSelection', function(event) {

    // In Opera when clicking outside of a block
    // it does not update the selection as it should
    // without the timeout
    setTimeout($.proxy(selectionWatcher, 'selectionChanged'), 0);
  });

  // listen for selection changes by keys
  $document.on('keyup.editable', this.editableSelector, function(event) {

    // when pressing Command + Shift + Left for example the keyup is only triggered
    // after at least two keys are released. Strange. The culprit seems to be the
    // Command key. Do we need a workaround?
    selectionWatcher.selectionChanged();
  });
};

Dispatcher.prototype.addListener = function(event, listener) {
  if (this.listeners[event] === undefined) {
    this.listeners[event] = [];
  }

  this.listeners[event].unshift(listener);
};

Dispatcher.prototype.addListeners = function(eventObj) {
  var eventType = null;
  for (eventType in eventObj) {
    this.addListener(eventType, eventObj[eventType]);
  }
};

Dispatcher.prototype.removeListener = function(event, listener) {
  var eventListeners = this.listeners[event];
  if (eventListeners === undefined) return;

  for (var i=0, len=eventListeners.length; i < len; i++) {
    if (eventListeners[i] === listener){
      eventListeners.splice(i, 1);
      break;
    }
  }
};

Dispatcher.prototype.removeListeners = function(event) {
  this.listeners[event] = [];
};

Dispatcher.prototype.off = function(event) {
  this.listeners = {};
  this.$document.off('.editable');
};

Dispatcher.prototype.notify = function(event) {
  var eventListeners = this.listeners[event];
  if (eventListeners === undefined) return;
  for (var i = 0, len = eventListeners.length; i < len; i++) {
    if (eventListeners[i].apply(
        this.editable,
        Array.prototype.slice.call(arguments).splice(1)
    ) === false)
      break;
  }
};

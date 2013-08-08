/**
 * The Dispatcher module is responsible for dealing with events and their handlers.
 *
 * @module core
 * @submodule dispatcher
 */

var dispatcher = (function() {
  /**
   * Contains the list of event listeners grouped by event type.
   *
   * @private
   * @type {Object}
   */
  var listeners = {};

  /**
   * Sets up events that are triggered on modifying an element.
   *
   * @method setupElementEvents
   * @param {HTMLElement} $document: The document element.
   * @param {Function} notifier: The callback to be triggered when the event is caught.
   */
  var setupElementEvents = function($document, notifier) {
    $document.on('focus.editable', '.-js-editable', function(event) {
      notifier('focus', this);
    }).on('blur.editable', '.-js-editable', function(event) {
      notifier('blur', this);
    }).on('copy.editable', '.-js-editable', function(event) {
      log('Copy');
    }).on('cut.editable', '.-js-editable', function(event) {
      log('Cut');
    }).on('paste.editable', '.-js-editable', function(event) {
      log('Paste');
    });
  };

  /**
   * Sets up events that are triggered on keyboard events.
   * Keyboard definitions are in {{#crossLink "Keyboard"}}{{/crossLink}}.
   *
   * @method setupKeyboardEvents
   * @param {HTMLElement} $document: The document element.
   * @param {Function} notifier: The callback to be triggered when the event is caught.
   */
  var setupKeyboardEvents = function($document, notifier) {
    $document.on('keydown.editable', '.-js-editable', function(event) {
      keyboard.dispatchKeyEvent(event, this);
    });

    keyboard.on('left', function(event) {
      log('Left key pressed');
    }).on('up', function(event) {
      log('Up key pressed');
    }).on('right', function(event) {
      log('Right key pressed');
    }).on('down', function(event) {
      log('Down key pressed');
    }).on('tab', function(event) {
      log('Tab key pressed');
    }).on('shiftTab', function(event) {
      log('Shift+Tab key pressed');
    }).on('esc', function(event) {
      log('Esc key pressed');
    }).on('backspace', function(event) {
      log('Backspace key pressed');
    }).on('delete', function(event) {
      log('Delete key pressed');
    }).on('enter', function(event) {
      log('Enter key pressed');

      event.preventDefault();
      event.stopPropagation();
      var cursor = selectionWatcher.getCursor();

      if (cursor.isAtTheEnd()) {
        notifier('insert', this, 'after', cursor);
      } else if(cursor.isAtTheBeginning()) {
        notifier('insert', this, 'before', cursor);
      } else {
        notifier('split', this, cursor.before(), cursor.after(), cursor);
      }

    }).on('shiftEnter', function(event) {
      log('Shift+Enter key pressed');
      event.preventDefault();
      event.stopPropagation();
      var cursor = selectionWatcher.getCursor();
      notifier('newline', this, cursor);
    });
  };

  /**
   * Sets up events that are triggered on a selection change.
   *
   * @method setupSelectionChangeEvents
   * @param {HTMLElement} $document: The document element.
   * @param {Function} notifier: The callback to be triggered when the event is caught.
   */
  var setupSelectionChangeEvents = function($document, notifier) {
    var selectionDirty = false;
    var suppressSelectionChanges = false;

    // fires on mousemove (thats probably a bit too much)
    // catches changes like 'select all' from context menu
    $document.on('selectionchange.editable', function(event) {
      if (suppressSelectionChanges) {
        selectionDirty = true;
      } else {
        notifier();
      }
    });

    // listen for selection changes by mouse so we can
    // suppress the selectionchange event and only fire the
    // change event on mouseup
    $document.on('mousedown.editable', '.-js-editable', function(event) {
      if (config.mouseMoveSelectionChanges === false) {
        suppressSelectionChanges = true;

        // Without this timeout the previous selection is active
        // until the mouseup event (no. not good).
        setTimeout(notifier, 0);
      }

      $document.on('mouseup.editableSelection', function(event) {
        $document.off('.editableSelection');
        suppressSelectionChanges = false;

        if (selectionDirty) {
          selectionDirty = false;
          notifier();
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
  var setupSelectionChangeFallback = function($document, notifier) {
    // listen for selection changes by mouse
    $document.on('mouseup.editableSelection', function(event) {

      // In Opera when clicking outside of a block
      // it does not update the selection as it should
      // without the timeout
      setTimeout(notifier, 0);
    });

    // listen for selection changes by keys
    $document.on('keyup.editable', '.-js-editable', function(event) {

      // when pressing Command + Shift + Left for example the keyup is only triggered
      // after at least two keys are released. Strange. The culprit seems to be the
      // Command key. Do we need a workaround?
      notifier();
    });
  };

  return {
    addListener: function(event, listener) {
      if (listeners[event] === undefined) {
        listeners[event] = [];
      }

      listeners[event].unshift(listener);
    },

    removeListener: function(event, listener) {
      var eventListeners = listeners[event];
      if (eventListeners === undefined) return;

      for (var i=0, len=eventListeners.length; i < len; i++) {
        if (eventListeners[i] === listener){
          eventListeners.splice(i, 1);
          break;
        }
      }
    },

    notifyListeners: function(event) {
      var eventListeners = listeners[event];
      if (eventListeners === undefined) return;

      for (var i=0, len=eventListeners.length; i < len; i++) {
        if(eventListeners[i].apply(
            Editable,
            Array.prototype.slice.call(arguments).splice(1)
        ) === false)
          break;
      }
    },

    /**
     * Sets up all events that Editable.JS is catching.
     *
     * @method setup
     */
    setup: function() {

      var $document = $(document);
      var eventType = null;

      listeners = {};
      // TODO check the config.event object to prevent
      // registering invalid handlers
      for(eventType in config.event) {
        this.addListener(eventType, config.event[eventType]);
      }

      // setup all events notifications
      setupElementEvents($document, this.notifyListeners);
      setupKeyboardEvents($document, this.notifyListeners);

      // cache selectionChanged function for simplicity
      var selectionChanged = selectionWatcher.selectionChanged;

      if (browserFeatures.selectionchange) {
        setupSelectionChangeEvents($document, selectionChanged);
      } else {
        setupSelectionChangeFallback($document, selectionChanged);
      }
    }
  };
})();

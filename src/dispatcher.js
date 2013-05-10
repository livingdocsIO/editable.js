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
   * Singleton that contains all event listeners that Editable.JS is listening
   * to and allows to add, remove, and notify listeners.
   *
   * @class Dispatcher
   */
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
      var _this = this;
      var eventType = null;

      listeners = {};
      // TODO check the Editable.config.event object to prevent
      // registering invalid handlers
      for(eventType in Editable.config.event) {
        _this.addListener(eventType, Editable.config.event[eventType]);
      }

      $document.on('keydown.editable', '.-js-editable', function(event) {
        keyboard.dispatchKeyEvent(event, this);
      }).on('focus.editable', '.-js-editable', function(event) {
        _this.notifyListeners('focus', this);
      }).on('blur.editable', '.-js-editable', function(event) {
        _this.notifyListeners('blur', this);
      }).on('copy.editable', '.-js-editable', function(event) {
        console.log('Copy');
      }).on('cut.editable', '.-js-editable', function(event) {
        console.log('Cut');
      }).on('paste.editable', '.-js-editable', function(event) {
        console.log('Paste');
      });

      keyboard.on('left', function(event) {
        console.log('Left key pressed');
      }).on('up', function(event) {
        console.log('Up key pressed');
      }).on('right', function(event) {
        console.log('Right key pressed');
      }).on('down', function(event) {
        console.log('Down key pressed');
      }).on('tab', function(event) {
        console.log('Tab key pressed');
      }).on('shiftTab', function(event) {
        console.log('Shift+Tab key pressed');
      }).on('esc', function(event) {
        console.log('Esc key pressed');
      }).on('backspace', function(event) {
        console.log('Backspace key pressed');
      }).on('delete', function(event) {
        console.log('Delete key pressed');
      }).on('enter', function(event) {
        console.log('Enter key pressed');
      }).on('shiftEnter', function(event) {
        console.log('Shift+Enter key pressed');
        event.preventDefault();
        event.stopPropagation();
        var freshSelection = selectionWatcher.getFreshSelection(); 
        _this.notifyListeners('newline', this, freshSelection instanceof Cursor ? freshSelection : null, freshSelection instanceof Selection ? freshSelection: null);
      });

      // cache selectionChanged function for simplicity
      var selectionChanged = selectionWatcher.selectionChanged;

      if (browserFeatures.selectionchange) {
        var selectionDirty = false;
        var suppressSelectionChanges = false;

        // fires on mousemove (thats probably a bit too much)
        // catches changes like 'select all' from context menu
        $document.on('selectionchange.editable', function(event) {
          if (suppressSelectionChanges) {
            selectionDirty = true;
          } else {
            selectionChanged();
          }
        });

        // listen for selection changes by mouse so we can
        // suppress the selectionchange event and only fire the
        // change event on mouseup
        $document.on('mousedown.editable', '.-js-editable', function(event) {
          suppressSelectionChanges = true;
          $document.on('mouseup.editableSelection', function(event) {
            $document.off('.editableSelection');
            suppressSelectionChanges = false;

            if (selectionDirty) {
              selectionDirty = false;
              selectionChanged();
            }
          });
        });

      } else {

        // listen for selection changes by mouse
        $document.on('mouseup.editableSelection', function(event) {

          // In Opera when clicking outside of a block
          // it does not update the selection as it should
          // without the timeout
          setTimeout(selectionChanged, 0);

        });

        // listen for selection changes by keys
        $document.on('keyup.editable', '.-js-editable', function(event) {

          // when pressing Command + Shift + Left for example the keyup is only triggered
          // after at least two keys are released. Strange. The culprit seems to be the
          // Command key. Do we need a workaround?
          selectionChanged();
        });

      }

    }
  };
})();

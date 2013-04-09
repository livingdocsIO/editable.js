/**
 * The Dispatcher module is responsible for dealing with events and their handlers.
 *
 * @module dispatcher
 */

var dispatcher = (function() {
  /**
   * Contains the list of event listeners grouped by event type.
   *
   * @private
   * @type {Object}
   */
  var listeners = {};

  var actOnKeyStroke = function(event) {
    switch (event.keyCode) {

    case keyboard.KEY_LEFT:
      console.log('Left arrow');
      return false;

    case keyboard.KEY_RIGHT:
      console.log('Right arrow');
      return false;

    case keyboard.KEY_UP:
      console.log('Up arrow');
      return false;

    case keyboard.KEY_DOWN:
      console.log('Down arrow');
      return false;

    case keyboard.KEY_TAB:
      if (event.shiftKey) {
        console.log('Shift Tab');
        return false;
      } else {
        console.log('Tab');
        return false;
      }
      break;

    case keyboard.KEY_ESC:
      console.log('Escape');
      return false;

    case keyboard.KEY_BACKSPACE:
      console.log('Backspace');
      return false;

    case keyboard.KEY_DELETE:
      console.log('Delete');
      return false;

    case keyboard.KEY_ENTER:
      if (event.shiftKey) {
        console.log('Shift Enter');
        return false;
      } else {
        console.log('Enter');
        return false;
      }
      break;

    default:
      return false;
    }
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

    notifyListeners: function(event, context) {
      var eventListeners = listeners[event];
      if (eventListeners === undefined) return;

      for (var i=0, len=eventListeners.length; i < len; i++) {
        if(eventListeners[i].apply(
            context,
            Array.prototype.slice.call(arguments).splice(2)
        ) === false)
          break;
      }
    },

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
        if (actOnKeyStroke(event)) {
          event.preventDefault();
          event.stopPropagation();
        }
      }).on('focus.editable', '.-js-editable', function(event) {
        _this.notifyListeners('focus', Editable, this);
      }).on('blur.editable', '.-js-editable', function(event) {
        _this.notifyListeners('blur', Editable, this);
      }).on('copy.editable', '.-js-editable', function(event) {
        console.log('Copy');
      }).on('cut.editable', '.-js-editable', function(event) {
        console.log('Cut');
      }).on('paste.editable', '.-js-editable', function(event) {
        console.log('Paste');
      });

      // cache selectionChanged function for simplicity
      var selectionChanged = Editable.selectionWatcher.selectionChanged;

      if (Editable.browserFeatures.selectionchange) {
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

(function(exports, Editable, undefined) {
  'use strict';


  Editable.events = {

    setup: function() {
      var $document = $(document);
      var _this = this;

      $document.on('keydown.editable', '.-js-editable', function(event) {
        if (_this.actOnKeyStroke(event)) {
          event.preventDefault();
          event.stopPropagation();
        }
      }).on('focus.editable', '.-js-editable', function(event) {
        console.log('Focus');
      }).on('blur.editable', '.-js-editable', function(event) {
        console.log('Blur');
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

    },

    actOnKeyStroke: function(event) {
      switch (event.keyCode) {

      // Left
      case 37:
        console.log('Left arrow');
        return false;

      // Right
      case 39:
        console.log('Right arrow');
        return false;

      // Up
      case 38:
        console.log('Up arrow');
        return false;

      // Down
      case 40:
        console.log('Down arrow');
        return false;

      // Tab
      case 9:
        if (event.shiftKey) {
          console.log('Shift Tab');
          return false;
        } else {
          console.log('Tab');
          return false;
        }
        break;

      // Escape
      case 27:
        console.log('Escape');
        return false;

      // Backspace
      case 8:
        console.log('Backspace');
        return false;

      // Delete
      case 46:
        console.log('Delete');
        return false;

      // Enter
      case 13:
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
    }

  };
})(window, window.Editable);

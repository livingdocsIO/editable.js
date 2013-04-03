Editable.events = (function() {
  'use strict';

  return {

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
      });;

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
          selectionChanged();
        });

        // listen for selection changes by keys
        $document.on('keyup.editable', '.-js-editable', function(event) {
          selectionChanged();
        });

      }

    },

    actOnKeyStroke: function(event) {
      switch (event.keyCode) {

      // Left (37), Right (39)
      case 37:
      case 39:
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
})();

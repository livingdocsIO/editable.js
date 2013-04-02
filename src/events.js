Editable.events = (function() {

  return {

    setup: function() {
      $document = $(document);
      _this = this;

      $document.on('keydown.editable', '.-js-editable', function(event) {
        if (_this.actOnKeyStroke(event)) {
          event.preventDefault();
          event.stopPropagation();
        }
      });

      if (Editable.browserFeatures.selectionchange) {

        // fires on mousemove (thats probably a bit too much)
        // catches changes like 'select all' from context menu
        $document.on('selectionchange.editable', function(event) {
          console.log('selection changed');
        });

      } else {

        // listen for selection changes by mouse
        $document.on('mousedown.editable', '.-js-editable', function(event) {
          $document.on('mouseup.editableSelection', function(event) {
            $document.off('.editableSelection');
            console.log('mouseup after mousedown in editable block');
            // test if selection has changed
          });
        });

        // listen for selection changes by keys
        $document.on('keyup.editable', '.-js-editable', function(event) {
          console.log('keyup in editable block');
          // test if selection has changed
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

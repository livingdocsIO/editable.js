/**
 * The Selection module provides a cross-browser abstraction layer for range
 * and selection.
 *
 * @module core
 * @submodule selection
 */

Editable.Selection = (function() {
  // Selection class
  var Selection = function(editableHost, rangyRange) {
    this.host = editableHost;
    this.range = rangyRange;
  };

  Selection.prototype = (function() {
    return {

      text: function() {

      },

      isAllSelected: function() {

      },

      strip: function() {

      },

      deleteContent: function() {

      },

      /**
       * Expand the current selection
       *
       * @param: {String} either of these: 'word', 'sentence', 'tag' or 'block'.
       */
      expand: function(scope) {

      }

    };
  })();

  return Selection;
})();

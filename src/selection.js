/**
 * The Selection module provides a cross-browser abstraction layer for range
 * and selection.
 *
 * @module core
 * @submodule selection
 */

Editable.selection = (function() {
  'use strict';

  var Selection = function(editableHost, rangySelection) {
    this.host = editableHost;
    this.selection = rangySelection;
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

      },

      parentNodes: function() {

      },

      isTheSameAs: function(otherSelection) {
        var self = this.selection;
        var other = otherSelection.selection;
        if (
            self.anchorNode === other.anchorNode &&
            self.anchorOffset === other.anchorOffset &&
            self.focusNode === other.focusNode &&
            self.focusOffset === other.focusOffset
        ) {
          return true;
        } else {
          return false;
        }
      }

    };
  })();

  return {
    Selection: Selection
  };
})();

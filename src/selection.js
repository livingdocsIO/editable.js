/**
 * The Selection module provides a cross-browser abstraction layer for range
 * and selection.
 *
 * @module core
 * @submodule selection
 */

var Selection = (function() {

  // constructor
  var Selection = function(editableHost, rangyRange) {
    this.host = editableHost;
    this.range = rangyRange;
  };

  Selection.prototype = (function() {
    return {

      text: function() {
        return this.range.toString();
      },

      html: function() {
        return this.range.toHtml();
      },

      isAllSelected: function() {

      },

      strip: function() {

      },

      deleteContent: function() {
        this.range.deleteContents();
        return new Cursor(this.host, this.range);
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

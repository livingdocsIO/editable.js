/**
 * The Selection module provides a cross-browser abstraction layer for range
 * and selection.
 *
 * @module core
 * @submodule selection
 */

var Selection = (function() {

  /**
   * Class that represents a selection and provides functionality to access or
   * modify the selection.
   *
   * @class Selection
   * @constructor
   */
  var Selection = function(editableHost, rangyRange) {
    this.host = editableHost;
    this.range = rangyRange;
  };

  Selection.prototype = (function() {
    return {

      /**
       * Get the text inside the selection.
       *
       * @method text
       */
      text: function() {
        return this.range.toString();
      },

      /**
       * Get the html inside the selection.
       *
       * @method html
       */
      html: function() {
        return this.range.toHtml();
      },

      /**
       *
       * @method isAllSelected
       */
      isAllSelected: function() {

      },

      /**
       *
       * @method strip
       */
      strip: function() {

      },

      /**
       *
       * @method deleteContent
       */
      deleteContent: function() {
        this.range.deleteContents();
        return new Cursor(this.host, this.range);
      },

      /**
       * Expand the current selection
       *
       * @method expand
       * @param {String} scope: either of: 'word', 'sentence', 'tag' or 'block'.
       */
      expand: function(scope) {

      }

    };
  })();

  return Selection;
})();

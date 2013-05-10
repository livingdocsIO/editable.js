/**
 * The Cursor module provides a cross-browser abstraction layer for cursor.
 *
 * @module core
 * @submodule cursor
 */

var Cursor = (function() {

  /**
   * Cursor class description
   *
   * @class Cursor
   * @constructor
   */
  var Cursor = function(editableHost, rangyRange) {
    this.host = editableHost;
    this.range = rangyRange;
  };

  Cursor.prototype = (function() {
    return {
      isAtTheEnd: function() {
        
      },

      insertBefore: function(element) {
        //TODO smart check on element type, now
        //assume it is a dom element
        this.range.insertNode(element);
        this.range.setStartAfter(element);
        this.range.setEndAfter(element);
      },

      insertAfter: function(element) {
        //TODO smart check on element type, now
        //assume it is a dom element
        this.range.insertNode(element);
        this.range.setStartBefore(element);
        this.range.setEndBefore(element);
      },

      update: function() {
        var sel = rangy.getSelection();
        sel.removeAllRanges();
        sel.addRange(this.range);
      }      
    };
  })();

  return Cursor;
})();


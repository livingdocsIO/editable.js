/**
 * The Cursor module provides a cross-browser abstraction layer for cursor.
 *
 * @module core
 * @submodule cursor
 */

var Cursor = (function() {

  /**
   * Class for the Cursor module.
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
        return parser.isEndOfHost(
          this.host,
          this.range.endContainer,
          this.range.endOffset);
      },

      isAtTheBeginning: function() {
        return parser.isBeginningOfHost(
          this.host,
          this.range.endContainer,
          this.range.endOffset);
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


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
      isAtEnd: function() {
        return parser.isEndOfHost(
          this.host,
          this.range.endContainer,
          this.range.endOffset);
      },

      isAtBeginning: function() {
        return parser.isBeginningOfHost(
          this.host,
          this.range.startContainer,
          this.range.startOffset);
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
      },

      before: function() {
        var fragment = null;
        var range = this.range.cloneRange();
        range.setStartBefore(this.host);
        fragment = range.cloneContents();
        range.detach();
        return fragment;
      },

      after: function() {
        var fragment = null;
        var range = this.range.cloneRange();
        range.setEndAfter(this.host);
        fragment = range.cloneContents();
        range.detach();
        return fragment;
      },

      /**
       * Get the BoundingClientRect of the cursor.
       * The returned values are absolute to document.body.
       */
      getCoordinates: function() {
        var coords = this.range.nativeRange.getBoundingClientRect();

        // code from mdn: https://developer.mozilla.org/en-US/docs/Web/API/window.scrollX
        var x = (window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft;
        var y = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;

        // translate into absolute positions
        return {
          top: coords.top + y,
          bottom: coords.bottom + y,
          left: coords.left + x,
          right: coords.right + x,
          height: coords.height,
          width: coords.width
        };
      },

      setAsSelection: function() {
        rangy.getSelection().setSingleRange(this.range);
      },

      detach: function() {
        this.range.detach();
      },

      moveBefore: function(element) {
        this.range.setStart(element, 0);
        this.range.setEnd(element, 0);
      },

      moveAfter: function(element) {
        this.range.setStartAfter(element);
        this.range.setEndAfter(element);
      }
    };
  })();

  return Cursor;
})();


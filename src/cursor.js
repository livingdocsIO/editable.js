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
    this.isCursor = true;
  };

  Cursor.prototype = (function() {
    return {
      isAtEnd: function() {
        return parser.isEndOfHost(
          this.host,
          this.range.endContainer,
          this.range.endOffset);
      },

      isAtTextEnd: function() {
        return parser.isTextEndOfHost(
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

      /**
       * Insert content before the cursor
       *
       * @param DOM node or document fragment
       */
      insertBefore: function(element) {
        var preceedingElement = element;

        if (element.nodeType === 11) { // DOCUMENT_FRAGMENT_NODE
          var lastIndex = element.childNodes.length - 1;
          preceedingElement = element.childNodes[lastIndex];
        }

        this.range.insertNode(element);
        this.range.setStartAfter(preceedingElement);
        this.range.setEndAfter(preceedingElement);
      },

      /**
       * Insert content after the cursor
       *
       * @param DOM node or document fragment
       */
      insertAfter: function(element) {
        this.range.insertNode(element);
      },

      setSelection: function() {
        rangy.getSelection().setSingleRange(this.range);
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

      detach: function() {
        this.range.detach();
      },

      moveBefore: function(element) {
        this.range.setStart(element, 0);
        this.range.setEnd(element, 0);
      },

      moveAfter: function(element) {
        this.range.selectNodeContents(element);
        this.range.collapse(false);
      },

      equals: function(cursor) {
        if(!cursor) return false;

        if(!cursor.host) return false;
        if(!cursor.host.isEqualNode(this.host)) return false;

        if(!cursor.range) return false;
        if(!cursor.range.equals(this.range)) return false;

        return true;
      }
    };
  })();

  return Cursor;
})();


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
    this.setHost(editableHost);
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
        if (parser.isDocumentFragmentWithoutChildren(element)) return;

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
        if (parser.isDocumentFragmentWithoutChildren(element)) return;
        this.range.insertNode(element);
      },

      /**
       * Alias for #setVisibleSelection()
       */
      setSelection: function() {
        this.setVisibleSelection();
      },

      setVisibleSelection: function() {
        $(this.host).focus(); // Without setting focus() Firefox is not happy (seems setting a selection is not enough. Probably because Firefox can handle multiple selections)
        rangy.getSelection(this.win).setSingleRange(this.range);
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
       * The returned values are transformed to be absolute
       # (relative to the document).
       */
      getCoordinates: function(positioning) {
        positioning = positioning || 'absolute';

        var coords = this.range.nativeRange.getBoundingClientRect();
        if (positioning === 'fixed') return coords;

        // code from mdn: https://developer.mozilla.org/en-US/docs/Web/API/window.scrollX
        var win = this.win;
        var x = (win.pageXOffset !== undefined) ? win.pageXOffset : (win.document.documentElement || win.document.body.parentNode || win.document.body).scrollLeft;
        var y = (win.pageYOffset !== undefined) ? win.pageYOffset : (win.document.documentElement || win.document.body.parentNode || win.document.body).scrollTop;

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
        this.updateHost(element);
        this.range.setStartBefore(element);
        this.range.setEndBefore(element);
        if (this.isSelection) return new Cursor(this.host, this.range);
      },

      moveAfter: function(element) {
        this.updateHost(element);
        this.range.setStartAfter(element);
        this.range.setEndAfter(element);
        if (this.isSelection) return new Cursor(this.host, this.range);
      },

      /**
       * Move the cursor to the beginning of the host.
       */
      moveAtBeginning: function(element) {
        if (!element) element = this.host;
        this.updateHost(element);
        this.range.selectNodeContents(element);
        this.range.collapse(true);
        if (this.isSelection) return new Cursor(this.host, this.range);
      },

      /**
       * Move the cursor to the end of the host.
       */
      moveAtEnd: function(element) {
        if (!element) element = this.host;
        this.updateHost(element);
        this.range.selectNodeContents(element);
        this.range.collapse(false);
        if (this.isSelection) return new Cursor(this.host, this.range);
      },

      /**
       * Move the cursor after the last visible character of the host.
       */
      moveAtTextEnd: function(element) {
        return this.moveAtEnd(parser.latestChild(element));
      },

      setHost: function(element) {
        if (element.jquery) element = element[0];
        this.host = element;
        this.win = (element === undefined || element === null) ? window : element.ownerDocument.defaultView;
      },

      updateHost: function(element) {
        var host = parser.getHost(element);
        if (!host) {
          error('Can not set cursor outside of an editable block');
        }
        this.setHost(host);
      },

      retainVisibleSelection: function(callback) {
        this.save();
        callback();
        this.restore();
        this.setVisibleSelection();
      },

      save: function() {
        this.savedRangeInfo = rangeSaveRestore.save(this.range);
        this.savedRangeInfo.host = this.host;
      },

      restore: function() {
        if (this.savedRangeInfo) {
          this.host = this.savedRangeInfo.host;
          this.range = rangeSaveRestore.restore(this.host, this.savedRangeInfo);
          this.savedRangeInfo = undefined;
        } else {
          error('Could not restore selection');
        }
      },

      equals: function(cursor) {
        if (!cursor) return false;

        if (!cursor.host) return false;
        if (!cursor.host.isEqualNode(this.host)) return false;

        if (!cursor.range) return false;
        if (!cursor.range.equals(this.range)) return false;

        return true;
      },

      // Currently we call triggerChange manually after format changes.
      // This is to prevent excessive triggering of the change event during
      // merge or split operations or other manipulations by scripts.
      triggerChange: function() {
        $(this.host).trigger('formatEditable');
      }
    };
  })();

  return Cursor;
})();


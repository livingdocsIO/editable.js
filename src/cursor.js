var content = require('./content');
var parser = require('./parser');
var string = require('./util/string');
var nodeType = require('./node-type');
var error = require('./util/error');
var rangeSaveRestore = require('./range-save-restore');

/**
 * The Cursor module provides a cross-browser abstraction layer for cursor.
 *
 * @module core
 * @submodule cursor
 */

var Cursor;
module.exports = Cursor = (function() {

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
       * @param {String, DOM node or document fragment}
       */
      insertBefore: function(element) {
        if ( string.isString(element) ) {
          element = content.createFragmentFromString(element);
        }
        if (parser.isDocumentFragmentWithoutChildren(element)) return;
        element = this.adoptElement(element);

        var preceedingElement = element;
        if (element.nodeType === nodeType.documentFragmentNode) {
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
       * @param {String, DOM node or document fragment}
       */
      insertAfter: function(element) {
        if ( string.isString(element) ) {
          element = content.createFragmentFromString(element);
        }
        if (parser.isDocumentFragmentWithoutChildren(element)) return;
        element = this.adoptElement(element);
        this.range.insertNode(element);
      },

      /**
       * Alias for #setVisibleSelection()
       */
      setSelection: function() {
        this.setVisibleSelection();
      },

      setVisibleSelection: function() {
        // Without setting focus() Firefox is not happy (seems setting a selection is not enough.
        // Probably because Firefox can handle multiple selections).
        if (this.win.document.activeElement !== this.host) {
          $(this.host).focus();
        }
        rangy.getSelection(this.win).setSingleRange(this.range);
      },

      /**
       * Take the following example:
       * (The character '|' represents the cursor position)
       *
       * <div contenteditable="true">fo|o</div>
       * before() will return a document frament containing a text node 'fo'.
       *
       * @returns {Document Fragment} content before the cursor or selection.
       */
      before: function() {
        var fragment = null;
        var range = this.range.cloneRange();
        range.setStartBefore(this.host);
        fragment = content.cloneRangeContents(range);
        return fragment;
      },

      /**
       * Same as before() but returns a string.
       */
      beforeHtml: function() {
        return content.getInnerHtmlOfFragment(this.before());
      },

      /**
       * Take the following example:
       * (The character '|' represents the cursor position)
       *
       * <div contenteditable="true">fo|o</div>
       * after() will return a document frament containing a text node 'o'.
       *
       * @returns {Document Fragment} content after the cursor or selection.
       */
      after: function() {
        var fragment = null;
        var range = this.range.cloneRange();
        range.setEndAfter(this.host);
        fragment = content.cloneRangeContents(range);
        return fragment;
      },

      /**
       * Same as after() but returns a string.
       */
      afterHtml: function() {
        return content.getInnerHtmlOfFragment(this.after());
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

      // Create an element with the correct ownerWindow
      // (see: http://www.w3.org/DOM/faq.html#ownerdoc)
      createElement: function(tagName) {
        return this.win.document.createElement(tagName);
      },

      // Make sure a node has the correct ownerWindow
      // (see: https://developer.mozilla.org/en-US/docs/Web/API/Document/importNode)
      adoptElement: function(node) {
        return content.adoptElement(node, this.win.document);
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


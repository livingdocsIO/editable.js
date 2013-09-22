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
    this.isSelection = true;
  };

  // add Cursor prototpye to Selection prototype chain
  var Base = function() {};
  Base.prototype = Cursor.prototype;
  Selection.prototype = $.extend(new Base(), {
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
      return parser.isBeginningOfHost(
        this.host,
        this.range.startContainer,
        this.range.startOffset) &&
      parser.isTextEndOfHost(
        this.host,
        this.range.endContainer,
        this.range.endOffset);
    },

    /**
     * Get the ClientRects of this selection.
     * Use this if you want more precision than getBoundingClientRect can give.
     */
    getRects: function() {
      var coords = this.range.nativeRange.getClientRects();

      // todo: translate into absolute positions
      // just like Cursor#getCoordinates()
      return coords;
    },

    /**
     *
     * @method link
     */
    link: function(href, attrs) {
      var $link = $('<a>');
      if (href) $link.attr('href', href);
      for (var name in attrs) {
        $link.attr(name, attrs[name]);
      }

      this.range = content.forceWrap(this.host, this.range, $link[0]);
      this.setSelection();
    },

    unlink: function() {
      this.range = content.removeFormatting(this.host, this.range, 'a');
      this.setSelection();
    },

    toggleLink: function(href, attrs) {
      var links = content.getTagsByName(this.host, this.range, 'a');
      if (links.length >= 1) {
        var firstLink = links[0];
        if (content.isExactSelection(this.range, firstLink)) {
          this.unlink();
        } else {
          this.range = content.expandTo(this.host, this.range, firstLink);
          this.setSelection();
        }
      } else {
        this.link(href, attrs);
      }
    },

    toggle: function(elem) {
      this.range = content.toggleTag(this.host, this.range, elem);
      this.setSelection();
    },

    /**
     *
     * @method makeBold
     */
    makeBold: function() {
      var $bold = $(config.boldTag);
      this.range = content.forceWrap(this.host, this.range, $bold[0]);
      this.setSelection();
    },

    toggleBold: function() {
      var $bold = $(config.boldTag);
      this.toggle($bold[0]);
    },

    /**
     *
     * @method giveEmphasis
     */
    giveEmphasis: function() {
      var $em = $(config.italicTag);
      this.range = content.forceWrap(this.host, this.range, $em[0]);
      this.setSelection();
    },

    toggleEmphasis: function() {
      var $italic = $(config.italicTag);
      this.toggle($italic[0]);
    },

    /**
     *
     * @method surround
     */
    surround: function(startCharacter, endCharacter) {
      this.range = content.surround(this.host, this.range, startCharacter, endCharacter);
      this.setSelection();
    },

    toggleSurround: function(startCharacter, endCharacter) {
      if (content.containsString(this.range, startCharacter) &&
        content.containsString(this.range, endCharacter)) {

        this.range = content.deleteCharacter(this.host, this.range, startCharacter);
        this.range = content.deleteCharacter(this.host, this.range, endCharacter);
        this.setSelection();
      } else {
        this.surround(startCharacter, endCharacter);
      }
    },

    /**
     *
     * @method removeFormatting
     */
    removeFormatting: function() {
      this.range = content.removeFormatting(this.host, this.range);
      this.setSelection();
    },

    /**
     *
     * @method deleteContent
     * @return Cursor instance
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
  });

  return Selection;
})();

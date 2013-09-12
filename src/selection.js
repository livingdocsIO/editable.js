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
     * @method strip
     */
    strip: function() {

    },

    /**
     *
     * @method link
     */
    link: function(link, target) {
      var attrs = {
        href: link
      };
      if (target) attrs.target = target;
      this.range = content.link(this.host, this.range, attrs);
      this.update();
    },

    /**
     *
     * @method bold
     */
    makeBold: function() {
      var $bold = $('<strong>');
      this.range = content.forceWrap(this.host, this.range, $bold[0]);
      this.update();
    },

    /**
     *
     * @method emphasis
     */
    giveEmphasis: function() {
      var $em = $('<em>');
      this.range = content.forceWrap(this.host, this.range, $em[0]);
      this.update();
    },

    /**
     *
     * @method surround
     */
    surround: function(startCharacter, endCharacter) {
      content.surround(this.host, this.range, startCharacter, endCharacter);
      this.update();
    },

    /**
     *
     * @method removeFormatting
     */
    removeFormatting: function() {
      content.nuke(this.host, this.range);
      // this.update();
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

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
    return {};
  })();

  return Cursor;
})();


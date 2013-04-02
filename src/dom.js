/**
 * The DOM module provides a cross-browser abstraction layer for DOM
 * manipulations and helpers for common tasks.
 *
 * @module core
 * @submodule dom
 */

Editable.dom = (function() {
  'use strict';

  /**
   * @class DOM
   * @static
   */
  return {

    closest: function(childNode, selector) {
      return $(childNode).closest(selector)[0];
    }

  };
})();

/**
 * The Behavior module defines the behavior triggered in response to the Editable.JS
 * events (see {{#crossLink "Editable"}}{{/crossLink}}).
 * The behavior can be overwritten by a user with the Editable.config object.
 *
 * @module core
 * @submodule behavior
 */


var behavior = (function() {
  /**
    * Singleton for the behavior module.
    * Provides default behavior of the Editable.JS API.
    *
    * @class Behavior
    * @static
    */
  return {
    focus: function(element) {
      console.log('Default focus behavior');
    },

    blur: function(element) {
      console.log('Default blur behavior');
      element.innerHTML = content.cleanInternals(element.innerHTML);
    },

    flow: function(element, action) {
      console.log('Default flow behavior');
    },

    selection: function(element, selection) {
      if (selection) {
        console.log('Default selection behavior');
      } else {
        console.log('Default selection empty behavior');
      }
    },

    cursor: function(element, cursor) {
      if (cursor) {
        console.log('Default cursor behavior');
      } else {
        console.log('Default cursor empty behavior');
      }
    },

    newline: function(element, cursor) {
      console.log(cursor);
      console.log('Default newline behavior');

      var atTheEnd = cursor.isAtTheEnd();
      var br = document.createElement('br');
      cursor.insertBefore(br);

      if(atTheEnd) {
        console.log('at the end');

        var noWidthSpace = document.createTextNode('\u200B');
        cursor.insertAfter(noWidthSpace);

        // var trailingBr = document.createElement('br');
        // trailingBr.setAttribute('type', '-editablejs');
        // cursor.insertAfter(trailingBr);

      } else {
        console.log('not at the end');
      }

      cursor.update();
    },

    insert: function(element, direction) {
      console.log('Default insert behavior');
    },

    split: function(element, before, after) {
      console.log('Default split behavior');
    },

    merge: function(element, direction) {
      console.log('Default merge behavior');
    },

    empty: function(element) {
      console.log('Default empty behavior');
    },

    'switch': function(element, direction) {
      console.log('Default switch behavior');
    },

    move: function(element, selection, direction) {
      console.log('Default move behavior');
    },

    clipboard: function(element, selection, action) {
      console.log('Default clipboard behavior');
    }
  };
})();

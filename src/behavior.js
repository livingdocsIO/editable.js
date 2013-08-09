/**
 * The Behavior module defines the behavior triggered in response to the Editable.JS
 * events (see {{#crossLink "Editable"}}{{/crossLink}}).
 * The behavior can be overwritten by a user with Editable.init() or on
 * Editable.add() per element.
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
      log('Default focus behavior');
    },

    blur: function(element) {
      log('Default blur behavior');
      element.innerHTML = content.cleanInternals(element.innerHTML);
    },

    flow: function(element, action) {
      log('Default flow behavior');
    },

    selection: function(element, selection) {
      if (selection) {
        log('Default selection behavior');
      } else {
        log('Default selection empty behavior');
      }
    },

    cursor: function(element, cursor) {
      if (cursor) {
        log('Default cursor behavior');
      } else {
        log('Default cursor empty behavior');
      }
    },

    newline: function(element, cursor) {
      log(cursor);
      log('Default newline behavior');

      var atTheEnd = cursor.isAtTheEnd();
      var br = document.createElement('br');
      cursor.insertBefore(br);

      if(atTheEnd) {
        log('at the end');

        var noWidthSpace = document.createTextNode('\u200B');
        cursor.insertAfter(noWidthSpace);

        // var trailingBr = document.createElement('br');
        // trailingBr.setAttribute('type', '-editablejs');
        // cursor.insertAfter(trailingBr);

      } else {
        log('not at the end');
      }

      cursor.update();
    },

    insert: function(element, direction, cursor) {
      log('Default insert ' + direction + ' behavior');
      var parent = element.parentNode;
      var newElement = element.cloneNode(false);
      if(newElement.id) newElement.removeAttribute('id');

      switch(direction) {
        case 'before':
          parent.insertBefore(newElement, element);
          break;
        case 'after':
          parent.insertBefore(newElement, element.nextSibling);
          break;            
      }

      newElement.focus();
    },

    split: function(element, before, after, cursor) {
      var parent = element.parentNode;
      var newStart = after.firstChild;
      parent.insertBefore(before, element);
      parent.replaceChild(after, element);
      newStart.focus();
    },

    merge: function(element, direction) {
      log('Default merge behavior');
    },

    empty: function(element) {
      log('Default empty behavior');
    },

    'switch': function(element, direction) {
      log('Default switch behavior');
    },

    move: function(element, selection, direction) {
      log('Default move behavior');
    },

    clipboard: function(element, selection, action) {
      log('Default clipboard behavior');
    }
  };
})();

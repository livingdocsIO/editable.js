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
      content.normalizeSpaces(element);
      content.removeEmptyTags(element);
    },

    blur: function(element) {
      log('Default blur behavior');
      content.normalizeTags(element);
      content.cleanInternals(element);
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

    cursor: function(element, cursor) {
      if (cursor) {
        log('Default cursor behavior');
      } else {
        log('Default cursor empty behavior');
      }
    },

    newline: function(element, cursor) {
      log(cursor);
      log('Default newline behavior');

      var atEnd = cursor.isAtEnd();
      var br = document.createElement('br');
      cursor.insertBefore(br);

      if(atEnd) {
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
        element.focus();
        break;
      case 'after':
        parent.insertBefore(newElement, element.nextSibling);
        newElement.focus();
        break;
      }
    },

    split: function(element, before, after, cursor) {
      var parent = element.parentNode;
      var newStart = after.firstChild;
      parent.insertBefore(before, element);
      parent.replaceChild(after, element);
      newStart.focus();
    },

    merge: function(element, direction, cursor) {
      log('Default merge ' + direction + ' behavior');
      var container, merger, fragment, chunks, i, newChild;

      switch(direction) {
      case 'before':
        container = block.previous(element);
        merger = element;
        break;
      case 'after':
        container = element;
        merger = block.next(element);
        break;
      }

      if(!(container && merger))
        return;

      if(container.childNodes.length > 0)
        cursor.moveAfter(container.lastChild);
      else
        cursor.moveBefore(container);
      cursor.update();

      fragment = document.createDocumentFragment();
      chunks = merger.childNodes;
      for(i = 0; i < chunks.length; i++) {
        fragment.appendChild(chunks[i].cloneNode(true));
      }
      newChild = container.appendChild(fragment);

      merger.parentNode.removeChild(merger);
    },

    empty: function(element) {
      log('Default empty behavior');
    },

    'switch': function(element, direction, cursor) {
      log('Default switch behavior');

      var next, previous;

      switch(direction) {
      case 'before':
        previous = block.previous(element);
        if(previous) {
          cursor.moveAfter(previous);
          cursor.update();
        }
        break;
      case 'after':
        next = block.next(element);
        if(next) {
          cursor.moveBefore(next);
          cursor.update();
        }
        break;
      }
    },

    move: function(element, selection, direction) {
      log('Default move behavior');
    },

    clipboard: function(element, action, cursor) {
      log('Default clipboard behavior');

      if(action !== 'paste') return;

      var sel = rangy.saveSelection();

      var pasteHolder = document.createElement('textarea');
      pasteHolder.setAttribute('style', 'position: absolute; left: -9999px');
      document.body.appendChild(pasteHolder);
      pasteHolder.focus();

      setTimeout(function() {
        rangy.restoreSelection(sel);
        var cursor = selectionWatcher.getCursor();
        var pasteElement = document.createTextNode(pasteHolder.value)
        cursor.insertAfter(pasteElement);
        cursor.moveAfter(pasteElement);
        cursor.update();
      }, 0);
    }
  };
})();

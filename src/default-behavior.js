/**
 * The Behavior module defines the behavior triggered in response to the Editable.JS
 * events (see {{#crossLink "Editable"}}{{/crossLink}}).
 * The behavior can be overwritten by a user with Editable.init() or on
 * Editable.add() per element.
 *
 * @module core
 * @submodule behavior
 */


var createDefaultBehavior = function(editable) {
  var document = editable.win.document;
  var selectionWatcher = editable.dispatcher.selectionWatcher;

  /**
    * Factory for the default behavior.
    * Provides default behavior of the Editable.JS API.
    *
    * @static
    */
  return {
    focus: function(element) {
      // Add a <br> element if the editable is empty to force it to have height
      // E.g. Firefox does not render empty block elements and most browsers do
      // not render  empty inline elements.
      if (parser.isVoid(element)) {
        var br = document.createElement('br');
        br.setAttribute('data-editable', 'remove');
        element.appendChild(br);
      }
    },

    blur: function(element) {
      content.cleanInternals(element);
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
      var atEnd = cursor.isAtEnd();
      var br = document.createElement('br');
      cursor.insertBefore(br);

      if (atEnd) {
        log('at the end');

        var noWidthSpace = document.createTextNode('\u200B');
        cursor.insertAfter(noWidthSpace);

        // var trailingBr = document.createElement('br');
        // trailingBr.setAttribute('type', '-editablejs');
        // cursor.insertAfter(trailingBr);

      } else {
        log('not at the end');
      }

      cursor.setVisibleSelection();
    },

    insert: function(element, direction, cursor) {
      var parent = element.parentNode;
      var newElement = element.cloneNode(false);
      if (newElement.id) newElement.removeAttribute('id');

      switch (direction) {
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
      var newNode = element.cloneNode();
      newNode.appendChild(before);

      var parent = element.parentNode;
      parent.insertBefore(newNode, element);

      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
      element.appendChild(after);

      content.tidyHtml(newNode);
      content.tidyHtml(element);
      element.focus();
    },

    merge: function(element, direction, cursor) {
      var container, merger, fragment, chunks, i, newChild, range;

      switch (direction) {
      case 'before':
        container = block.previous(element);
        merger = element;
        break;
      case 'after':
        container = element;
        merger = block.next(element);
        break;
      }

      if (!(container && merger))
        return;

      if (container.childNodes.length > 0) {
        cursor = editable.appendTo(container, merger.innerHTML);
      } else {
        cursor = editable.prependTo(container, merger.innerHTML);
      }

      // remove merged node
      merger.parentNode.removeChild(merger);

      cursor.save();
      content.tidyHtml(container);
      cursor.restore();
      cursor.setVisibleSelection();
    },

    empty: function(element) {
      log('Default empty behavior');
    },

    'switch': function(element, direction, cursor) {
      var next, previous;

      switch (direction) {
      case 'before':
        previous = block.previous(element);
        if (previous) {
          cursor.moveAtTextEnd(previous);
          cursor.setVisibleSelection();
        }
        break;
      case 'after':
        next = block.next(element);
        if (next) {
          cursor.moveAtBeginning(next);
          cursor.setVisibleSelection();
        }
        break;
      }
    },

    move: function(element, selection, direction) {
      log('Default move behavior');
    },

    clipboard: function(element, action, cursor) {
      if (action === 'paste') {
        clipboard.paste(element, action, cursor, document);
      }
    }
  };
};

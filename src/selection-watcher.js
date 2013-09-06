/**
 * The SelectionWatcher module watches for selection changes inside
 * of editable blocks.
 *
 * @module core
 * @submodule selectionWatcher
 */
var selectionWatcher = (function() {

  var rangySelection,
      currentSelection,
      currentRange;

  /**
   * Return a RangeContainer if the current selection is within an editable
   * otherwise return an empty RangeContainer
   */
  var getRangeContainer = function() {
    if (!rangySelection) {
      rangySelection = rangy.getSelection();
    } else {
      rangySelection.refresh();
    }

    // rangeCount is 0 or 1 in all browsers except firefox
    // firefox can work with multiple ranges
    // (I don't know if this occurs from normal use though)
    if (rangySelection.rangeCount) {
      var range = rangySelection.getRangeAt(0);
      var editableSelector = '.' + config.editableClass;
      var hostNode = $(range.commonAncestorContainer).closest(editableSelector);
      if (hostNode.length) {
        return new RangeContainer(hostNode[0], range);
      }
    }

    // return an empty range container
    return new RangeContainer();
  };

  return {

    // get a fresh Selection or Cursor
    getFreshSelection: function() {
      var range = getRangeContainer();
      if (!range.isAnythingSelected) return undefined;

      return range.isCursor ?
        new Cursor(range.host, range.range) :
        new Selection(range.host, range.range);
    },

    forceCursor: function() {
      var cursor = this.getFreshSelection();
      if (cursor instanceof Selection) {
        cursor = cursor.deleteContent();
      }
      return cursor;
    },

    getSelection: function() {
      return currentSelection;
    },

    selectionChanged: function() {
      var newRange = getRangeContainer();
      if (newRange.isDifferentFrom(currentRange)) {
        currentRange = newRange;

        if (currentRange.isAnythingSelected) {
          if (currentRange.isCursor) {

            // emtpy selection
            if (currentSelection instanceof Selection) {
              dispatcher.notifyListeners('selection', currentSelection.host);
            }

            // new cursor
            currentSelection = new Cursor(currentRange.host, currentRange.range);
            dispatcher.notifyListeners('cursor', currentSelection.host, currentSelection);
          } else {

            // emtpy cursor
            if (currentSelection instanceof Cursor) {
              dispatcher.notifyListeners('cursor', currentSelection.host);
            }

            // new selection
            currentSelection = new Selection(currentRange.host, currentRange.range);
            dispatcher.notifyListeners('selection', currentSelection.host, currentSelection);
          }
        } else {
          var previousSelection = currentSelection;
          currentSelection = undefined;

          // empty selection or cursor
          if (previousSelection instanceof Cursor) {
            dispatcher.notifyListeners('cursor', previousSelection.host);
          } else if (previousSelection instanceof Selection) {
            dispatcher.notifyListeners('selection', previousSelection.host);
          }
        }
      }
    }
  };
})();

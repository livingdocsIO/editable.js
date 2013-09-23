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
    rangySelection = rangy.getSelection();

    // rangeCount is 0 or 1 in all browsers except firefox
    // firefox can work with multiple ranges
    // (on a mac hold down the command key to select multiple ranges)
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

    /**
     * Gets a fresh RangeContainer with the current selection or cursor.
     *
     * @return RangeContainer instance
     */
    getFreshRange: function() {
      return getRangeContainer();
    },

    /**
     * Gets a fresh RangeContainer with the current selection or cursor.
     *
     * @return Either a Cursor or Selection instance or undefined if
     * there is neither a selection or cursor.
     */
    getFreshSelection: function() {
      var range = getRangeContainer();

      return range.isCursor ?
        range.getCursor() :
        range.getSelection();
    },

    /**
     * Get the selection set by the last selectionChanged event.
     * Sometimes the event does not fire fast enough and the seleciton
     * you get is not the one the user sees.
     * In those cases use #getFreshSelection()
     *
     * @return Either a Cursor or Selection instance or undefined if
     * there is neither a selection or cursor.
     */
    getSelection: function() {
      return currentSelection;
    },

    forceCursor: function() {
      var range = getRangeContainer();
      return range.forceCursor();
    },

    selectionChanged: function() {
      var newRange = getRangeContainer();
      if (newRange.isDifferentFrom(currentRange)) {
        var lastSelection = currentSelection;
        currentRange = newRange;

        // empty selection or cursor
        if (lastSelection) {
          if (lastSelection.isCursor && !currentRange.isCursor) {
            dispatcher.notifyListeners('cursor', lastSelection.host);
          } else if (lastSelection.isSelection && !currentRange.isSelection) {
            dispatcher.notifyListeners('selection', lastSelection.host);
          }
        }

        // set new selection or cursor and fire event
        if (currentRange.isCursor) {
          currentSelection = new Cursor(currentRange.host, currentRange.range);
          dispatcher.notifyListeners('cursor', currentSelection.host, currentSelection);
        } else if (currentRange.isSelection) {
          currentSelection = new Selection(currentRange.host, currentRange.range);
          dispatcher.notifyListeners('selection', currentSelection.host, currentSelection);
        } else {
          currentSelection = undefined;
        }
      }
    }
  };
})();

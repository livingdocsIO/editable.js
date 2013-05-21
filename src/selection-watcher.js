/**
 * The SelectionWatcher module watches for selection changes inside
 * of editable blocks.
 *
 * @module core
 * @submodule selectionWatcher
 */

var selectionWatcher = (function() {

  /** RangeContainer
   *
   * primarily used to compare ranges
   * its designed to work with undefined ranges as well
   * so we can easily compare them without checking for undefined
   * all the time
   */
  var RangeContainer = function(editableHost, rangyRange) {
    this.host = editableHost;
    this.range = rangyRange;
    this.isAnythingSelected = (rangyRange !== undefined);
    this.cursor = (this.isAnythingSelected && rangyRange.collapsed);
    this.selection = !this.cursor;
  };

  RangeContainer.prototype.isDifferentFrom = function(otherRangeContainer) {
    var self = this.range;
    var other = otherRangeContainer.range;
    if (self && other) {
      return !self.equals(other);
    } else if (!self && !other) {
      return false;
    } else {
      return true;
    }
  };


  var rangySelection,
      currentSelection,
      currentRange = new RangeContainer();

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

      var hostNode = $(range.commonAncestorContainer).closest('.-js-editable');
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

      return range.cursor ?
        new Cursor(range.host, range.range) :
        new Selection(range.host, range.range);
    },

    getCursor: function() {
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
      console.log('selection changed');
      var newRange = getRangeContainer();
      if (newRange.isDifferentFrom(currentRange)) {
        currentRange = newRange;

        if (currentRange.isAnythingSelected) {
          if (currentRange.cursor) {

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

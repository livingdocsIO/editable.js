/**
 * The SelectionWatcher module watches for selection changes inside
 * of editable blocks.
 *
 * @module core
 * @submodule selectionWatcher
 */

Editable.selectionWatcher = (function() {
  'use strict';

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


  var rangySelection;
  var currentRange = new RangeContainer();

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

    getRangySelection: function() {
      return rangySelection;
    },

    selectionChanged: function() {
      var newRange = getRangeContainer();
      if (newRange.isDifferentFrom(currentRange)) {
        currentRange = newRange;

        if (currentRange.isAnythingSelected) {
          if (currentRange.cursor) {
            console.log('cursor - changed selection');

            // console.log(currentRange.range.startContainer.textContent);
            // console.log(currentRange.range.startOffset);
          } else {
            console.log('selection - changed selection');
          }
        } else {
          console.log('empty - changed selection');
        }
      }
    }
  };
})();

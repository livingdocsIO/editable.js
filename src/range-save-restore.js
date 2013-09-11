/**
 * Inspired by the Selection save and restore module for Rangy by Tim Down
 * Saves and restores ranges using invisible marker elements in the DOM.
 */
var rangeSaveRestore = (function() {
  var boundaryMarkerId = 0;

  // (U+FEFF) zero width no-break space
  var markerTextChar = '\ufeff';

  var getMarker = function(host, id) {
    return host.querySelector('#'+ id);
  };

  return {

    insertRangeBoundaryMarker: function(range, atStart) {
      var markerId = 'editable-range-boundary-' + (boundaryMarkerId += 1);
      var markerEl;
      var doc = window.document;

      // Clone the Range and collapse to the appropriate boundary point
      var boundaryRange = range.cloneRange();
      boundaryRange.collapse(atStart);

      // Create the marker element containing a single invisible character using DOM methods and insert it
      markerEl = doc.createElement('span');
      markerEl.id = markerId;
      markerEl.style.lineHeight = '0';
      markerEl.style.display = 'none';
      // markerEl.className = "rangySelectionBoundary";
      markerEl.appendChild(doc.createTextNode(markerTextChar));

      boundaryRange.insertNode(markerEl);
      boundaryRange.detach();
      return markerEl;
    },

    setRangeBoundary: function(host, range, markerId, atStart) {
      var markerEl = getMarker(host, markerId);
      if (markerEl) {
        range[atStart ? 'setStartBefore' : 'setEndBefore'](markerEl);
        markerEl.parentNode.removeChild(markerEl);
      } else {
        console.log('Marker element has been removed. Cannot restore selection.');
      }
    },

    save: function(range) {
      var doc = window.document;
      var rangeInfo, startEl, endEl;

      // insert markers
      if (range.collapsed) {
        endEl = this.insertRangeBoundaryMarker(range, false);
        rangeInfo = {
          markerId: endEl.id,
          collapsed: true
        };
      } else {
        endEl = this.insertRangeBoundaryMarker(range, false);
        startEl = this.insertRangeBoundaryMarker(range, true);

        rangeInfo = {
          startMarkerId: startEl.id,
          endMarkerId: endEl.id,
          collapsed: false
        };
      }

      // Adjust each range's boundaries to lie between its markers
      if (range.collapsed) {
        range.collapseBefore(endEl);
      } else {
        range.setEndBefore(endEl);
        range.setStartAfter(startEl);
      }

      return rangeInfo;
    },

    restore: function(host, rangeInfo) {
      if (rangeInfo.restored) return;

      var range = rangy.createRange();
      if (rangeInfo.collapsed) {
        var markerEl = getMarker(host, rangeInfo.markerId);
        if (markerEl) {
          markerEl.style.display = 'inline';
          var previousNode = markerEl.previousSibling;

          // Workaround for rangy issue 17
          if (previousNode && previousNode.nodeType === 3) {
            markerEl.parentNode.removeChild(markerEl);
            range.collapseToPoint(previousNode, previousNode.length);
          } else {
            range.collapseBefore(markerEl);
            markerEl.parentNode.removeChild(markerEl);
          }
        } else {
          console.log('Marker element has been removed. Cannot restore selection.');
        }
      } else {
        this.setRangeBoundary(host, range, rangeInfo.startMarkerId, true);
        this.setRangeBoundary(host, range, rangeInfo.endMarkerId, false);
      }

      range.normalizeBoundaries();
      return range;
    }
  };
})();

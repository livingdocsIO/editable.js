import rangy from 'rangy'
import * as error from './util/error'
import * as nodeType from './node-type'

/**
 * Inspired by the Selection save and restore module for Rangy by Tim Down
 * Saves and restores ranges using invisible marker elements in the DOM.
 */
let boundaryMarkerId = 0

// (U+FEFF) zero width no-break space
const markerTextChar = '\ufeff'

export function insertRangeBoundaryMarker (range, atStart) {
  const container = range.commonAncestorContainer
  // If ownerDocument is null the commonAncestorContainer is window.document
  if (container.ownerDocument === null || container.ownerDocument === undefined) {
    error('Cannot save range: range is emtpy')
  }

  // Clone the Range and collapse to the appropriate boundary point
  const boundaryRange = range.cloneRange()
  boundaryRange.collapse(atStart)

  // Create the marker element containing a single invisible character using DOM methods and insert it
  const doc = container.ownerDocument.defaultView.document
  const markerEl = doc.createElement('span')
  markerEl.id = 'editable-range-boundary-' + ++boundaryMarkerId
  markerEl.setAttribute('data-editable', 'remove')
  markerEl.style.lineHeight = '0'
  markerEl.style.display = 'none'
  markerEl.appendChild(doc.createTextNode(markerTextChar))

  boundaryRange.insertNode(markerEl)
  return markerEl
}

export function setRangeBoundary (host, range, markerId, atStart) {
  const markerEl = getMarker(host, markerId)
  if (!markerEl) return console.log('Marker element has been removed. Cannot restore selection.')
  range[atStart ? 'setStartBefore' : 'setEndBefore'](markerEl)
  markerEl.parentNode.removeChild(markerEl)
}

export function save (range) {
  let rangeInfo, startEl, endEl

  // insert markers
  if (range.collapsed) {
    endEl = insertRangeBoundaryMarker(range, false)
    rangeInfo = {
      markerId: endEl.id,
      collapsed: true
    }
  } else {
    endEl = insertRangeBoundaryMarker(range, false)
    startEl = insertRangeBoundaryMarker(range, true)

    rangeInfo = {
      startMarkerId: startEl.id,
      endMarkerId: endEl.id,
      collapsed: false
    }
  }

  // Adjust each range's boundaries to lie between its markers
  if (range.collapsed) {
    range.collapseBefore(endEl)
  } else {
    range.setEndBefore(endEl)
    range.setStartAfter(startEl)
  }

  return rangeInfo
}

export function restore (host, rangeInfo) {
  if (rangeInfo.restored) return

  const range = rangy.createRange()
  if (rangeInfo.collapsed) {
    const markerEl = getMarker(host, rangeInfo.markerId)
    if (markerEl) {
      markerEl.style.display = 'inline'
      const previousNode = markerEl.previousSibling

      // Workaround for rangy issue 17
      if (previousNode && previousNode.nodeType === nodeType.textNode) {
        markerEl.parentNode.removeChild(markerEl)
        range.collapseToPoint(previousNode, previousNode.length)
      } else {
        range.collapseBefore(markerEl)
        markerEl.parentNode.removeChild(markerEl)
      }
    } else {
      console.log('Marker element has been removed. Cannot restore selection.')
    }
  } else {
    this.setRangeBoundary(host, range, rangeInfo.startMarkerId, true)
    this.setRangeBoundary(host, range, rangeInfo.endMarkerId, false)
  }

  range.normalizeBoundaries()
  return range
}

function getMarker (host, id) {
  return host.querySelector('#' + id)
}

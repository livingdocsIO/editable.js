import error from './util/error.js'
import * as nodeType from './node-type.js'
import {createRange, normalizeBoundaries} from './util/dom.js'

/**
 * Inspired by the Selection save and restore module for Rangy by Tim Down
 * Saves and restores ranges using invisible marker elements in the DOM.
 */
let boundaryMarkerId = 0

// (U+FEFF) zero width no-break space
const markerTextChar = '\ufeff'

function isSecondChildOfCommonAncestor (range, rangeContainer) {
  const parent = range.commonAncestorContainer
  if (parent.nodeType === 3) return false // if we are on the text node it can't be a parent
  const possibleChild = rangeContainer.parentElement
  return possibleChild?.parentElement === parent
}

export function insertRangeBoundaryMarker (range, atStart) {
  const container = range.commonAncestorContainer

  // If ownerDocument is null the commonAncestorContainer is window.document
  if (!container.ownerDocument) {
    error('Cannot save range: range is empty')
  }

  // Create the marker element containing a single
  // invisible character using DOM methods and insert it
  const doc = container.ownerDocument.defaultView.document
  const markerEl = doc.createElement('span')
  markerEl.id = `editable-range-boundary-${++boundaryMarkerId}`
  markerEl.setAttribute('data-editable', 'remove')
  markerEl.style.lineHeight = '0'
  markerEl.style.display = 'none'
  markerEl.appendChild(doc.createTextNode(markerTextChar))

  // This logic can expand the selection by inserting the marker before the element
  // of the start or end container. In some cases this prevents breaking up existing tags.
  // The solution is not perfect, but has been here a while.
  // And it is somewhat inconsistent as it check if the container is a second grade child
  // of the common ancestor.
  // It can help to prevent the nuking of e.g. comments when formatting like bold
  // is applied.
  const directlyBeforeFormatTag = atStart && isSecondChildOfCommonAncestor(range, range.startContainer)
  const directlyAfterFormatTag = !atStart && isSecondChildOfCommonAncestor(range, range.endContainer)
  if (directlyBeforeFormatTag) {
    const startParentElem = range.startContainer.parentElement
    startParentElem.parentElement.insertBefore(markerEl, startParentElem)
  } else if (directlyAfterFormatTag) {
    const endParentElem = range.endContainer.parentElement
    endParentElem.parentElement.insertBefore(markerEl, endParentElem.nextSibling)
  } else {
    // Clone the Range and collapse to the appropriate boundary point
    const boundaryRange = range.cloneRange()
    boundaryRange.collapse(atStart)
    boundaryRange.insertNode(markerEl)
  }

  return markerEl
}

export function setRangeBoundary (host, range, markerId, atStart) {
  const markerEl = getMarker(host, markerId)
  if (!markerEl) return console.log('Marker element has been removed. Cannot restore selection.')
  range[atStart ? 'setStartBefore' : 'setEndBefore'](markerEl)
  markerEl.remove()
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
    range.setStartBefore(endEl)
    range.collapse(true)
  } else {
    range.setEndBefore(endEl)
    range.setStartAfter(startEl)
  }

  return rangeInfo
}

export function restore (host, rangeInfo) {
  if (rangeInfo.restored) return

  const range = createRange()
  if (rangeInfo.collapsed) {
    const markerEl = getMarker(host, rangeInfo.markerId)
    if (markerEl) {
      markerEl.style.display = 'inline'
      const previousNode = markerEl.previousSibling

      // Workaround for rangy issue 17
      if (previousNode && previousNode.nodeType === nodeType.textNode) {
        markerEl.remove()
        range.setStart(previousNode, previousNode.length)
      } else {
        range.setStartBefore(markerEl)
        range.collapse(true)
        markerEl.remove()
      }
    } else {
      console.log('Marker element has been removed. Cannot restore selection.')
    }
  } else {
    setRangeBoundary(host, range, rangeInfo.startMarkerId, true)
    setRangeBoundary(host, range, rangeInfo.endMarkerId, false)
  }

  normalizeBoundaries(range)
  return range
}

function getMarker (host, id) {
  return host.querySelector(`#${id}`)
}

import rangy from 'rangy'
import error from './util/error'
import * as nodeType from './node-type'

/**
 * Inspired by the Selection save and restore module for Rangy by Tim Down
 * Saves and restores ranges using invisible marker elements in the DOM.
 */
let boundaryMarkerId = 0

// (U+FEFF) zero width no-break space
const markerTextChar = '\ufeff'

function isChildOf (parent, possibleChild) {
  for (let i = 0; i < parent.children.length; i++) {
    if (parent.children[i] === possibleChild) return true
  }
  return false
}

function isChildAtBeginning (parent, possibleChild) {
  const isChild = isChildOf(parent, possibleChild)
  return isChild && parent.childNodes[0] === possibleChild
}

function isChildAtEnd (parent, possibleChild) {
  const isChild = isChildOf(parent, possibleChild)
  return isChild && parent.childNodes[parent.children.length - 1] === possibleChild
}

export function insertRangeBoundaryMarker (range, atStart) {
  const container = range.commonAncestorContainer
  let trailsStart = false
  let trailsEnd = false
  if (isChildAtEnd(range.startContainer.parentElement, range.endContainer.parentElement)) {
    trailsEnd = true
  } else if (isChildAtBeginning(range.endContainer.parentElement, range.startContainer.parentElement)) {
    trailsStart = true
  }
  // If ownerDocument is null the commonAncestorContainer is window.document
  if (container.ownerDocument === null || container.ownerDocument === undefined) {
    error('Cannot save range: range is emtpy')
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

  // if another tag is trailing exactly at the start or end, prepend
  // or append the marker element directly on the parent.
  if (trailsStart && atStart) {
    range.endContainer.parentElement.prepend(markerEl)
  } else if (trailsEnd && !atStart) {
    range.startContainer.parentElement.append(markerEl)
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
        markerEl.remove()
        range.collapseToPoint(previousNode, previousNode.length)
      } else {
        range.collapseBefore(markerEl)
        markerEl.remove()
      }
    } else {
      console.log('Marker element has been removed. Cannot restore selection.')
    }
  } else {
    setRangeBoundary(host, range, rangeInfo.startMarkerId, true)
    setRangeBoundary(host, range, rangeInfo.endMarkerId, false)
  }

  range.normalizeBoundaries()
  return range
}

function getMarker (host, id) {
  return host.querySelector(`#${id}`)
}

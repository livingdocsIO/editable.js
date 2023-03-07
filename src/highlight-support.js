import rangy from 'rangy'
import * as content from './content'
import highlightText from './highlight-text'
import TextHighlighting from './plugins/highlighting/text-highlighting'
import {closest, createElement} from './util/dom'

function isInHost (elem, host) {
  return closest(elem, '[data-editable]:not([data-word-id])') === host
}

const highlightSupport = {

  highlightText (editableHost, text, highlightId, type) {
    if (this.hasHighlight(editableHost, highlightId)) return
    const blockText = highlightText.extractText(editableHost)

    const marker = `<span class="highlight-${type}"></span>`
    const markerNode = highlightSupport.createMarkerNode(marker, type, this.win)

    const textSearch = new TextHighlighting(markerNode, 'text')
    const matches = textSearch.findMatches(blockText, [text])

    if (matches && matches.length) {
      if (highlightId) matches[0].id = highlightId
      highlightText.highlightMatches(editableHost, matches)
      return matches[0].startIndex
    }
  },


  // This function was changed to track matches when text is added to the start of a component, but multiple white spaces break it in a strict sense
  // The function works in the editor and in browsers, but tests with multiple white spaces will fail.
  // Browsers change the white spaces to &nbsp and the function works, and the tests in highlight.spec.js have been updated to represent this.

  highlightRange (editableHost, text, highlightId, startIndex, endIndex, dispatcher, type = 'comment') {
    if (this.hasHighlight(editableHost, highlightId)) {
      this.removeHighlight(editableHost, highlightId)
    }
    const firstMarker = `<span class="highlight-${type}"></span>`
    const markerNode = highlightSupport.createMarkerNode(firstMarker, type, this.win)
    const textSearch = new TextHighlighting(markerNode, 'text')
    const blockText = highlightText.extractText(editableHost)
    if (blockText === '') return -1 // the text was deleted so we can't highlight it
    const matchesArray = textSearch.findMatches(blockText, [text])
    const {actualStartIndex, actualEndIndex} = this.getIndex(matchesArray, startIndex, endIndex)
    const range = rangy.createRange()
    range.selectCharacters(editableHost, actualStartIndex, actualEndIndex)

    if (!isInHost(range.commonAncestorContainer, editableHost)) {
      return -1
    }

    const marker = highlightSupport.createMarkerNode(
      `<span class="highlight-${type}" data-word-id="${highlightId}"></span>`,
      type,
      this.win
    )
    const fragment = range.extractContents()
    marker.appendChild(fragment)
    range.deleteContents()
    range.insertNode(marker)
    highlightSupport.cleanupStaleMarkerNodes(editableHost, 'comment')
    if (dispatcher) {
      dispatcher.notify('change', editableHost)
    }
    return actualStartIndex
  },

  updateHighlight (editableHost, highlightId, addCssClass, removeCssClass) {
    if (!document.documentElement.classList) return

    const elems = editableHost.querySelectorAll(`[data-word-id="${highlightId}"]`)
    for (const elem of elems) {
      if (removeCssClass) elem.classList.remove(removeCssClass)
      if (addCssClass) elem.classList.add(addCssClass)
    }
  },

  removeHighlight (editableHost, highlightId, dispatcher) {
    const elems = editableHost.querySelectorAll(`[data-word-id="${highlightId}"]`)
    for (const elem of elems) {
      content.unwrap(elem)
      // in Chrome browsers the unwrap method leaves the host node split into 2 (lastChild !== firstChild)
      editableHost.normalize()
      if (dispatcher) dispatcher.notify('change', editableHost)
    }
  },

  hasHighlight (editableHost, highlightId) {
    const matches = editableHost.querySelectorAll(`[data-word-id="${highlightId}"]`)
    return !!matches.length
  },

  extractHighlightedRanges (editableHost, type) {
    let findMarkersQuery = '[data-word-id]'
    if (type) findMarkersQuery += `[data-highlight="${type}"]`
    const markers = editableHost.querySelectorAll(findMarkersQuery)
    if (!markers.length) return

    const groups = {}
    for (const marker of markers) {
      const highlightId = marker.getAttribute('data-word-id')
      if (!groups[highlightId]) {
        groups[highlightId] = editableHost.querySelectorAll(`[data-word-id="${highlightId}"]`)
      }

    }

    const res = {}
    for (const highlightId in groups) {
      const position = this.extractMarkerNodePosition(editableHost, groups[highlightId])
      if (position) res[highlightId] = position
    }

    return res
  },

  extractMarkerNodePosition (editableHost, markers) {
    const range = rangy.createRange()
    if (markers.length > 1) {
      range.setStartBefore(markers[0])
      range.setEndAfter(markers[markers.length - 1])
    } else {
      range.selectNode(markers[0])
    }

    const textRange = range.toCharacterRange(editableHost)
    return {
      start: textRange.start,
      end: textRange.end,
      text: range.text(),
      nativeRange: range.nativeRange
    }
  },

  cleanupStaleMarkerNodes (editableHost, highlightType) {
    const nodes = editableHost.querySelectorAll(`span[data-highlight="${highlightType}"]`)
    for (const node of nodes) {
      if (!node.textContent.length) {
        node.remove()
      }
    }
  },

  createMarkerNode (markerMarkup, highlightType, win) {
    const marker = createElement(markerMarkup, win)
    marker.setAttribute('data-editable', 'ui-unwrap')
    marker.setAttribute('data-highlight', highlightType)
    return marker
  },

  // This function checks to see if text has been added to the component before the comment
  // If it has, the start index is updated, otherwise it remains the same
  getIndex (matchesArray, startIndex, endIndex) {
    const newStartIndex = matchesArray.find((match) => {
      return match.startIndex >= startIndex // checks if the startIndex has increased
    })
    const actualStartIndex = newStartIndex ? newStartIndex.startIndex : startIndex
    const actualEndIndex = actualStartIndex ? (actualStartIndex + (endIndex - startIndex)) : endIndex

    return {actualStartIndex, actualEndIndex}
  }

}

export default highlightSupport

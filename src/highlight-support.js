import * as content from './content.js'
import highlightText from './highlight-text.js'
import {searchText} from './plugins/highlighting/text-search.js'
import {createElement, createRange, toCharacterRange} from './util/dom.js'

const highlightSupport = {

  // Used to highlight arbitrary text in an editable. All occurrences
  // will be highlighted.
  highlightText (editableHost, text, highlightId, type) {
    if (this.hasHighlight(editableHost, highlightId)) return
    const blockText = highlightText.extractText(editableHost)

    const marker = `<span class="highlight-${type}"></span>`
    const markerNode = highlightSupport.createMarkerNode(marker, type, this.win)

    const matches = searchText(blockText, text, markerNode)

    if (matches && matches.length) {
      if (highlightId) matches[0].id = highlightId
      highlightText.highlightMatches(editableHost, matches)
      return matches[0].startIndex
    }
  },

  // Used to highlight comments.
  // This function was changed to track matches when text is added to the start
  // of a component, but multiple white spaces break it in a strict sense
  // The function works in the editor and in browsers, but tests with
  // multiple white spaces will fail.
  // Browsers change the white spaces to &nbsp and the function works,
  // and the tests in highlight.spec.js have been updated to represent this.
  highlightRange (editableHost, text, highlightId, startIndex, endIndex, dispatcher, type = 'comment') {
    if (this.hasHighlight(editableHost, highlightId)) {
      this.removeHighlight(editableHost, highlightId)
    }

    const blockText = highlightText.extractText(editableHost, false)
    if (blockText === '') return -1 // the text was deleted so we can't highlight anything

    const marker = highlightSupport.createMarkerNode(
      `<span class="highlight-${type}"></span>`,
      type,
      this.win
    )

    const actualStartIndex = startIndex
    const actualEndIndex = endIndex

    highlightText.highlightMatches(editableHost, [{
      startIndex: actualStartIndex,
      endIndex: actualEndIndex,
      id: highlightId,
      marker
    }], false)

    if (dispatcher) dispatcher.notify('change', editableHost)

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
    }

    // remove empty text nodes, combine adjacent text nodes
    editableHost.normalize()

    if (dispatcher) dispatcher.notify('change', editableHost)
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
    const range = createRange()
    if (markers.length > 1) {
      range.setStartBefore(markers[0])
      range.setEndAfter(markers[markers.length - 1])
    } else {
      range.selectNode(markers[0])
    }

    const textRange = toCharacterRange(range, editableHost)
    return {
      start: textRange.start,
      end: textRange.end,
      text: textRange.text, // browser range result (does whitespace normalization)
      nativeRange: range
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
  }
}

export default highlightSupport

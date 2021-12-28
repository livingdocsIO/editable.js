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

  highlightRange (editableHost, highlightId, startIndex, endIndex, dispatcher, type = 'comment') {
    if (this.hasHighlight(editableHost, highlightId)) {
      this.removeHighlight(editableHost, highlightId)
    }
    const range = rangy.createRange()
    range.selectCharacters(editableHost, startIndex, endIndex)

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
    return startIndex
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
  }

}

export default highlightSupport

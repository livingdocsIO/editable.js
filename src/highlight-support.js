import $ from 'jquery'

import * as content from './content'
import highlightText from './highlight-text'
import TextHighlighting from './plugins/highlighting/text-highlighting'

const highlightSupport = {

  highlightText (editableHost, text, highlightId) {
    if (this.hasHighlight(editableHost, highlightId)) return

    let blockText = highlightText.extractText(editableHost)

    const marker = '<span class="highlight-comment"></span>'
    const markerNode = highlightSupport.createMarkerNode(marker, this.win)

    const textSearch = new TextHighlighting(markerNode, 'text')
    const matches = textSearch.findMatches(blockText, [text])

    if (matches && matches.length) {
      if (highlightId) matches[0].id = highlightId
      highlightText.highlightMatches(editableHost, matches)
      return matches[0].startIndex
    }
  },

  updateHighlight (editableHost, highlightId, addCssClass, removeCssClass) {
    if (!document.documentElement.classList) return

    $(editableHost).find(`[data-word-id="${highlightId}"]`)
      .each((index, elem) => {
        if (removeCssClass) elem.classList.remove(removeCssClass)
        if (addCssClass) elem.classList.add(addCssClass)
      })
  },

  removeHighlight (editableHost, highlightId) {
    $(editableHost).find(`[data-word-id="${highlightId}"]`)
      .each((index, elem) => {
        content.unwrap(elem)
      })
  },

  hasHighlight (editableHost, highlightId) {
    const matches = $(editableHost).find(`[data-word-id="${highlightId}"]`)
    return !!matches.length
  },

  createMarkerNode (markerMarkup, win) {
    let marker = $(markerMarkup)[0]

    if (win) {
      marker = content.adoptElement(marker, win.document)
    }

    marker.setAttribute('data-editable', 'ui-unwrap')
    marker.setAttribute('data-highlight', 'highlight')
    return marker
  }

}

export default highlightSupport

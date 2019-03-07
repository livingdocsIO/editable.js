import $ from 'jquery'

import * as content from './content'
import highlightText from './highlight-text'
import TextHighlighting from './plugins/highlighting/text-highlighting'
import rangy from 'rangy'

const highlightSupport = {

  highlightText (editableHost, text, highlightId) {
    if (this.hasHighlight(editableHost, highlightId)) return

    let blockText = highlightText.extractText(editableHost)

    const marker = '<span class="highlight-comment"></span>'
    const markerNode = highlightSupport.createMarkerNode(marker, 'highlight', this.win)

    const textSearch = new TextHighlighting(markerNode, 'text')
    const matches = textSearch.findMatches(blockText, [text])

    if (matches && matches.length) {
      if (highlightId) matches[0].id = highlightId
      highlightText.highlightMatches(editableHost, matches)
      return matches[0].startIndex
    }
  },

  highlightRange (editableHost, text, highlightId, startIndex, endIndex) {
    if (this.hasHighlight(editableHost, highlightId)) return
    const marker = highlightSupport.createMarkerNode(
      '<span class="highlight-comment"></span>',
      'highlight',
      this.win
    )

    const match = {
      id: highlightId,
      startIndex,
      endIndex,
      match: text,
      marker: marker
    }
    highlightText.highlightMatches(editableHost, [match])
    return match.startIndex
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

  extractHighlightedRanges (editableHost) {
    const markers = $(editableHost).find('[data-word-id]')
    if (!markers.length) {
      return
    }
    const res = {}
    markers.each((_, marker) => {
      const highlightId = $(marker).data('word-id')
      res[highlightId] = this.extractMarkerNodePosition(
        editableHost, marker
      )
    })
    return res
  },

  extractMarkerNodePosition (editableHost, marker) {
    const range = rangy.createRange()
    if (range) {
      range.selectNode(marker)
      return range.toCharacterRange(editableHost)
    }
  },

  createMarkerNode (markerMarkup, highlightType, win) {
    let marker = $(markerMarkup)[0]

    if (win) {
      marker = content.adoptElement(marker, win.document)
    }

    marker.setAttribute('data-editable', 'ui-unwrap')
    marker.setAttribute('data-highlight', highlightType)
    return marker
  }

}

export default highlightSupport
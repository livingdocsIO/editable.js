import rangy from 'rangy'

import NodeIterator from './node-iterator'
import * as nodeType from './node-type'

export default {

  // Get the text from an editable block with a NodeIterator.
  // This must work the same as when later iterating over the text
  // in highlightMatches().
  extractText (element) {
    let text = ''
    getText(element, (part) => { text += part })
    return text
  },

  // Go through the element to highlight the matches while keeping the
  // existing html valid (highlighting a match may require inserting multiple
  // elements).
  //
  // @params
  // - matches
  //   Array of positions in the string to highlight:
  //   e.g [{startIndex: 0, endIndex: 1, match: 'The'}]
  highlightMatches (element, matches) {
    if (!matches || matches.length === 0) {
      return
    }

    const iterator = new NodeIterator(element)
    let currentMatchIndex = 0
    let totalOffset = 0
    let currentMatch = matches[currentMatchIndex]
    let portions = []
    let next
    let wordId
    let textNode
    while ((next = iterator.getNext())) {
      // Account for <br> elements
      if (next.nodeType === nodeType.textNode && next.data !== '') {
        textNode = next
      } else if (next.nodeType === nodeType.elementNode && next.nodeName === 'BR') {
        totalOffset += 1
        continue
      } else {
        continue
      }

      const nodeText = textNode.data
      let nodeEndOffset = totalOffset + nodeText.length
      if (currentMatch.startIndex < nodeEndOffset && totalOffset < currentMatch.endIndex) {
        // get portion position (fist, last or in the middle)
        const isFirstPortion = totalOffset <= currentMatch.startIndex
        const isLastPortion = nodeEndOffset >= currentMatch.endIndex

        if (isFirstPortion) {
          wordId = currentMatch.id || currentMatch.startIndex
        }

        // calculate offset and length
        let offset
        if (isFirstPortion) {
          offset = currentMatch.startIndex - totalOffset
        } else {
          offset = 0
        }

        let length
        if (isLastPortion) {
          length = (currentMatch.endIndex - totalOffset) - offset
        } else {
          length = nodeText.length - offset
        }

        // create portion object
        const portion = {
          element: textNode,
          text: nodeText.substring(offset, offset + length),
          offset,
          length,
          isLastPortion,
          wordId
        }

        portions.push(portion)

        if (isLastPortion) {
          const lastNode = this.wrapMatch(portions, currentMatch.marker, currentMatch.title)
          iterator.replaceCurrent(lastNode)

          // recalculate nodeEndOffset if we have to replace the current node.
          nodeEndOffset = totalOffset + portion.length + portion.offset

          portions = []
          currentMatchIndex += 1
          if (currentMatchIndex < matches.length) {
            currentMatch = matches[currentMatchIndex]
          }
        }
      }

      totalOffset = nodeEndOffset
    }
  },

  // @return the last wrapped element
  wrapMatch (portions, stencilElement, title) {
    return portions.map((portion) => this.wrapPortion(portion, stencilElement, title)).pop()
  },

  wrapPortion (portion, stencilElement, title) {
    const range = rangy.createRange()
    range.setStart(portion.element, portion.offset)
    range.setEnd(portion.element, portion.offset + portion.length)
    const node = stencilElement.cloneNode(true)
    node.setAttribute('data-word-id', portion.wordId)
    if (title) node.setAttribute('title', title)
    range.surroundContents(node)

    // Fix a weird behaviour where an empty text node is inserted after the range
    if (node.nextSibling) {
      const next = node.nextSibling
      if (next.nodeType === nodeType.textNode && next.data === '') {
        next.remove()
      }
    }

    return node
  }

}

// Extract the text of an element.
// This has two notable behaviours:
// - It uses a NodeIterator which will skip elements
//   with data-editable="remove"
// - It returns a \n for <br> elements
//   (The only block level element allowed inside of editables)
function getText (element, callback) {
  const iterator = new NodeIterator(element)
  let next
  while ((next = iterator.getNext())) {
    if (next.nodeType === nodeType.textNode && next.data !== '') {
      callback(next.data)
    } else if (next.nodeType === nodeType.elementNode && next.nodeName === 'BR') {
      callback('\n')
    }
  }
}

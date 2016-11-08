import rangy from 'rangy'

import NodeIterator from './node-iterator'
import * as nodeType from './node-type'

export default {
  // Get the text from an editable block
  extractText (element) {
    let text = ''
    getText(element, (part) => { text += part })
    return text
  },

  // highlight matches
  // 1. reduce element content to text with a NodeIterator
  // 2. find the matches (offsets) of the characters and words to highlight
  // 3. go through the element to highlight the matches while keeping the
  // existing html valid (highlighting a match may require inserting multiple
  // elements)
  highlight (element, regex, stencilElement) {
    const text = this.extractText(element)
    const matches = this.find(text, regex, stencilElement)
    this.highlightMatches(element, matches)
  },

  find (text, regex, marker) {
    const matches = []
    let match
    while ((match = regex.exec(text))) matches.push(match)

    return matches.map((entry) => this.prepareMatch(entry, marker))
  },

  // @params
  // - matches
  //   Array of positions in the string to highlight:
  //   e.g [{start: 0, end: 1, match: 'The'}]
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
    while ((next = iterator.getNext())) {
      // Account for <br> elements
      if (next.nodeType === nodeType.textNode && next.data !== '') {
        var textNode = next
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
        let isFirstPortion = isLastPortion = false
        if (totalOffset <= currentMatch.startIndex) {
          isFirstPortion = true
          var wordId = currentMatch.startIndex
        }
        if (nodeEndOffset >= currentMatch.endIndex) {
          var isLastPortion = true
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
          var lastNode = this.wrapMatch(portions, currentMatch.marker, currentMatch.title)
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

  getRange (element) {
    const range = rangy.createRange()
    range.selectNodeContents(element)
    return range
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
        next.parentNode.removeChild(next)
      }
    }

    return node
  },

  prepareMatch (match, marker) {
    // Quickfix for the spellcheck regex where we need to match the second subgroup.
    if (match[2]) return this.prepareMatchForSecondSubgroup(match, marker)

    return {
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      match: match[0],
      marker: marker
    }
  },

  prepareMatchForSecondSubgroup (match, marker) {
    const startIndex = match.index + match[1].length
    return {
      startIndex,
      endIndex: startIndex + match[2].length,
      match: match[0],
      marker: marker
    }
  }
}

// Extract the text of an element.
// This has two notable behaviours:
// - It uses a NodeIterator which will skip elements
//   with data-editable="remove"
// - It returns a space for <br> elements
//   (The only block level element allowed inside of editables)
function getText (element, callback) {
  const iterator = new NodeIterator(element)
  let next
  while ((next = iterator.getNext())) {
    if (next.nodeType === nodeType.textNode && next.data !== '') {
      callback(next.data)
    } else if (next.nodeType === nodeType.elementNode && next.nodeName === 'BR') {
      callback(' ')
    }
  }
}

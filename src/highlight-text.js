import rangy from 'rangy'

import NodeIterator from './node-iterator'
import * as nodeType from './node-type'

export default {
  extractText (element) {
    let text = ''
    this.getText(element, (part) => { text += part })
    return text
  },

  // Extract the text of an element.
  // This has two notable behaviours:
  // - It uses a NodeIterator which will skip elements
  //   with data-editable="remove"
  // - It returns a space for <br> elements
  //   (The only block level element allowed inside of editables)
  getText (element, callback) {
    const iterator = new NodeIterator(element)
    let next
    while ((next = iterator.getNext())) {
      if (next.nodeType === nodeType.textNode && next.data !== '') {
        callback(next.data)
      } else if (next.nodeType === nodeType.elementNode && next.nodeName === 'BR') {
        callback(' ')
      }
    }
  },

  highlight (element, regex, stencilElement) {
    const matches = this.find(element, regex)
    this.highlightMatches(element, matches, stencilElement)
  },

  find (element, regex) {
    const text = this.extractText(element)
    const matches = []
    let match
    while ((match = regex.exec(text))) matches.push(match)

    return matches.map(this.prepareMatch.bind(this))
  },

  highlightMatches (element, matches, stencilElement) {
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
          var lastNode = this.wrapWord(portions, stencilElement)
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
  wrapWord (portions, stencilElement) {
    return portions.map((portion) => this.wrapPortion(portion, stencilElement)).pop()
  },

  wrapPortion (portion, stencilElement) {
    const range = rangy.createRange()
    range.setStart(portion.element, portion.offset)
    range.setEnd(portion.element, portion.offset + portion.length)
    const node = stencilElement.cloneNode(true)
    node.setAttribute('data-word-id', portion.wordId)
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

  prepareMatch (match, matchIndex) {
    // Quickfix for the spellcheck regex where we need to match the second subgroup.
    if (match[2]) return this.prepareMatchForSecondSubgroup(match, matchIndex)

    return {
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      matchIndex,
      search: match[0]
    }
  },

  prepareMatchForSecondSubgroup (match, matchIndex) {
    const startIndex = match.index + match[1].length
    return {
      startIndex,
      endIndex: startIndex + match[2].length,
      matchIndex,
      search: match[0]
    }
  }
}

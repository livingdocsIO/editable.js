/**
 * @param {HTMLElement | Array | String} target
 * @param {Document} document
 */
export const domArray = (target, document) => {
  if (typeof target === 'string') return Array.from(document.querySelectorAll(target))
  if (target.tagName) return [target]
  if (Array.isArray(target)) return target
  // Support NodeList and jQuery arrays
  return Array.from(target)
}

/**
 * @param { HTMLElement | String } target
 * @param { Document } document
 * @returns { HTMLElement }
 */
export const domSelector = (target, document) => {
  if (typeof target === 'string') return document.querySelector(target)
  if (target.tagName) return target
  // Support NodeList and jQuery arrays
  if (target[0]) return target[0]
  return target
}

export const createElement = (html, win = window) => {
  const el = win.document.createElement('div')
  el.innerHTML = html
  return el.firstElementChild
}

/**
* Get the closest dom element matching a selector
* @description
*   - If a textNode is passed, it will still find the correct element
*   - If a document is passed, it will return undefined
* @param {Node} elem
* @param {String} selector
* @returns {HTMLElement|undefined}
*/
export const closest = (elem, selector) => {
  if (!elem.closest) elem = elem.parentNode
  if (elem && elem.closest) return elem.closest(selector)
}

export const createRange = (win = window) => {
  return win.document.createRange()
}

export const getSelection = (win = window) => {
  return win.document.getSelection()
}

export const getNodes = (range, nodeTypes, filterFunc, win = window) => {
  const nodes = []

  const nodeIterator = win.document.createNodeIterator(
    range.commonAncestorContainer,
    NodeFilter.SHOW_ALL,
    {
      acceptNode (node) {
        if (
          range.intersectsNode(node) &&
          nodeTypes.includes(node.nodeType) &&
          node !== range.commonAncestorContainer // Exclude the common ancestor container
        ) {
          if (typeof filterFunc === 'function') {
            return filterFunc(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
          }
          return NodeFilter.FILTER_ACCEPT
        }
        return NodeFilter.FILTER_SKIP
      }
    },
    false
  )

  let currentNode
  while ((currentNode = nodeIterator.nextNode())) {
    nodes.push(currentNode)
  }

  return nodes
}

// export const getNodes = (range, nodeTypes, filterFunc, win = window) => {
//   const nodes = []

//   const nodeIterator = win.document.createNodeIterator(
//     range.startContainer,
//     NodeFilter.SHOW_ALL,
//     {
//       acceptNode (node) {
//         if (
//           range.intersectsNode(node) &&
//           nodeTypes.includes(node.nodeType)
//         ) {
//           if (typeof filterFunc === 'function') {
//             return filterFunc(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
//           }
//           return NodeFilter.FILTER_ACCEPT
//         }
//         return NodeFilter.FILTER_SKIP
//       }
//     },
//     false
//   )

//   let currentNode
//   while ((currentNode = nodeIterator.nextNode())) {
//     if (range.intersectsNode(currentNode)) {
//       nodes.push(currentNode)
//     }
//   }

//   return nodes
// }


export const normalizeBoundaries = (range) => {
  if (range.startContainer.compareDocumentPosition(range.endContainer) === Node.DOCUMENT_POSITION_FOLLOWING) {
    range.setStartBefore(range.endContainer)
  }

  if (range.endContainer.compareDocumentPosition(range.startContainer) === Node.DOCUMENT_POSITION_PRECEDING) {
    range.setEndAfter(range.startContainer)
  }
}

export const containsRange = (containerRange, testRange) => {
  return (
    containerRange.compareBoundaryPoints(Range.START_TO_START, testRange) <= 0 &&
    containerRange.compareBoundaryPoints(Range.END_TO_END, testRange) >= 0
  )
}

export const containsNodeText = (range, node) => {
  const nodeRange = document.createRange()
  nodeRange.selectNodeContents(node)
  const comparisonStart = range.compareBoundaryPoints(Range.START_TO_START, nodeRange)
  const comparisonEnd = range.compareBoundaryPoints(Range.END_TO_END, nodeRange)
  return comparisonStart <= 0 && comparisonEnd >= 0
}

// export const splitBoundaries = (range) => {
//   const clonedRange = range.cloneRange()

//   // Split at the start boundary
//   const startContainer = range.startContainer
//   const startOffset = range.startOffset
//   range.setEnd(startContainer, startOffset)
//   clonedRange.setStart(startContainer, startOffset)

//   // Split at the end boundary
//   const endContainer = clonedRange.endContainer
//   const endOffset = clonedRange.endOffset
//   clonedRange.setStart(endContainer, endOffset)
//   range.setEnd(endContainer, endOffset)

//   return [range, clonedRange]
// }
const isCharacterDataNode = (node) => {
  return node && (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.COMMENT_NODE)
}

const splitDataNode = (node, offset) => {
  return node.splitText(offset)
}

export const splitBoundaries = (range) => {
  const startContainer = range.startContainer
  const startOffset = range.startOffset
  const endContainer = range.endContainer
  const endOffset = range.endOffset

  if (isCharacterDataNode(endContainer) && endOffset > 0 && endOffset < endContainer.length) {
    splitDataNode(endContainer, endOffset)
  }

  if (isCharacterDataNode(startContainer) && startOffset > 0 && startOffset < startContainer.length) {
    const newStartContainer = splitDataNode(startContainer, startOffset)
    range.setStart(newStartContainer, 0)
  }
}

export const toCharacterRange = (range, containerElement) => {
  const start = getCharacterOffset(containerElement, range.startContainer, range.startOffset)
  const end = getCharacterOffset(containerElement, range.endContainer, range.endOffset)
  return {start, end}
}

function getCharacterOffset (containerElement, container, offset) {
  const textContent = container.textContent || container.innerText
  const containerStart = containerElement.textContent.indexOf(textContent)
  if (containerStart !== -1) return containerStart + offset
  return -1
}

export const rangesAreEqual = (range1, range2) => {
  return (
    range1.startContainer === range2.startContainer &&
    range1.startOffset === range2.startOffset &&
    range1.endContainer === range2.endContainer &&
    range1.endOffset === range2.endOffset
  )
}

export const rangeToHtml = (range, win = window) => {
  const div = win.document.createElement('div')
  div.appendChild(range.cloneContents())
  return div.innerHTML
}

export const getSelectionCoordinates = (selection) => {
  const range = selection.getRangeAt(0) // Assuming you want coordinates of the first range

  const rects = range.getClientRects()
  const coordinates = []

  for (let i = 0; i < rects.length; i++) {
    const rect = rects[i]
    coordinates.push({
      top: rect.top,
      left: rect.left,
      bottom: rect.bottom,
      right: rect.right,
      width: rect.width,
      height: rect.height
    })
  }

  return coordinates
}

export const getRangeText = (range) => {
  const container = range.commonAncestorContainer
  const startNode = range.startContainer
  const endNode = range.endContainer
  const startOffset = range.startOffset
  const endOffset = range.endOffset

  if (startNode.nodeType === Node.TEXT_NODE && startNode === endNode) {
    return startNode.nodeValue.substring(startOffset, endOffset)
  }

  let text = ''
  let node = startNode

  while (node && node !== container) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node === startNode) {
        text += node.nodeValue.substring(startOffset)
      } else if (node === endNode) {
        text += node.nodeValue.substring(0, endOffset)
      } else {
        text += node.nodeValue
      }
    }
    node = node.nextSibling || node.parentNode
  }

  return text
}

export const selectCharacters = (range, actualStartIndex, actualEndIndex) => {
  const startContainer = range.startContainer
  const endContainer = range.endContainer
  const textNodes = getTextNodesInRange(startContainer, endContainer)

  let startNode
  let endNode
  let startOffset = actualStartIndex
  let endOffset = actualEndIndex

  for (const textNode of textNodes) {
    const textLength = textNode.length
    startOffset -= textLength

    if (startOffset <= textLength) {
      startNode = textNode
      break
    }

  }

  for (const textNode of textNodes) {
    const textLength = textNode.length
    endOffset -= textLength

    if (endOffset <= textLength) {
      endNode = textNode
      break
    }
  }

  if (!startNode || !endNode) {
    throw new Error('Invalid character offsets.')
  }

  range.setStart(startNode, startOffset)
  range.setEnd(endNode, endOffset)

  return range
}

// Helper function to get an array of text nodes within a range
const getTextNodesInRange = (startContainer, endContainer) => {
  const textNodes = []
  let commonAncestor = startContainer

  while (commonAncestor && !commonAncestor.contains(endContainer)) {
    commonAncestor = commonAncestor.parentNode
  }

  if (!commonAncestor) {
    return textNodes
  }

  const walker = document.createTreeWalker(commonAncestor, NodeFilter.SHOW_TEXT, null, false)

  let node
  while ((node = walker.nextNode())) {
    textNodes.push(node)
  }

  return textNodes
}

import NodeIterator from '../node-iterator'
import {textNode} from '../node-type'

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

export function findStartExcludingWhitespace ({root, startContainer, startOffset, whitespacesOnTheLeft}) {
  const isTextNode = startContainer.nodeType === textNode
  if (!isTextNode) {
    return findStartExcludingWhitespace({
      root,
      startContainer: startContainer.childNodes[startOffset],
      startOffset: 0,
      whitespacesOnTheLeft
    })
  }

  const offsetAfterWhitespace = startOffset + whitespacesOnTheLeft
  if (startContainer.length > offsetAfterWhitespace) {
    return [startContainer, offsetAfterWhitespace]
  }

  // Pass the root so that the iterator can traverse to siblings
  const iterator = new NodeIterator(root)
  // Set the position to the node which is selected
  iterator.nextNode = startContainer
  // Iterate once to avoid returning self
  iterator.getNextTextNode()

  const container = iterator.getNextTextNode()
  if (!container) {
    // No more text nodes - use the end of the last text node
    const previousTextNode = iterator.getPreviousTextNode()
    return [previousTextNode, previousTextNode.length]
  }

  return findStartExcludingWhitespace({
    root,
    startContainer: container,
    startOffset: 0,
    whitespacesOnTheLeft: offsetAfterWhitespace - startContainer.length
  })
}

export function findEndExcludingWhitespace ({root, endContainer, endOffset, whitespacesOnTheRight}) {
  const isTextNode = endContainer.nodeType === textNode
  if (!isTextNode) {
    const isFirstNode = !endContainer.childNodes[endOffset - 1]
    const container = isFirstNode
      ? endContainer.childNodes[endOffset]
      : endContainer.childNodes[endOffset - 1]
    let offset = 0
    if (!isFirstNode) {
      offset = container.nodeType === textNode
        ? container.length
        : container.childNodes.length
    }
    return findEndExcludingWhitespace({
      root,
      endContainer: container,
      endOffset: offset,
      whitespacesOnTheRight
    })
  }

  const offsetBeforeWhitespace = endOffset - whitespacesOnTheRight
  if (offsetBeforeWhitespace > 0) {
    return [endContainer, offsetBeforeWhitespace]
  }

  // Pass the root so that the iterator can traverse to siblings
  const iterator = new NodeIterator(root)
  // Set the position to the node which is selected
  iterator.previous = endContainer
  // Iterate once to avoid returning self
  iterator.getPreviousTextNode()

  const container = iterator.getPreviousTextNode()
  if (!container) {
    // No more text nodes - use the start of the first text node
    return [iterator.getNextTextNode(), 0]
  }

  return findEndExcludingWhitespace({
    root,
    endContainer: container,
    endOffset: container.length,
    whitespacesOnTheRight: whitespacesOnTheRight - endOffset
  })
}

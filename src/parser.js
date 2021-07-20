import * as string from './util/string'
import * as nodeType from './node-type'
import config from './config'
import {closest} from './util/dom'

/**
 * The parser module provides helper methods to parse html-chunks
 * manipulations and helpers for common tasks.
 * Provides DOM lookup helpers
 *
 * @module core
 * @submodule parser
 */

/**
 * Get the editableJS host block of a node.
 *
 * @method getHost
 * @param {DOM Node}
 * @return {DOM Node}
 */
export function getHost (node) {
  node = (node.jquery ? node[0] : node)
  return closest(node, `.${config.editableClass}`)
}

/**
 * Get the index of a node so that
 * parent.childNodes[ getNodeIndex(node) ] would return the node again.
 *
 * @method getNodeIndex
 * @param {HTMLElement}
 */
export function getNodeIndex (node) {
  let index = 0
  while ((node = node.previousSibling) !== null) index++
  return index
}

/**
 * Check if node contains text or element nodes
 * whitespace counts too!
 *
 * @method isVoid
 * @param {HTMLElement}
 */
export function isVoid (node) {
  for (const child of node.childNodes) {
    if (child.nodeType === nodeType.textNode && !isVoidTextNode(child)) {
      return false
    }
    if (child.nodeType === nodeType.elementNode) {
      return false
    }
  }
  return true
}

/**
 * Check if node is a text node and completely empty without any whitespace
 *
 * @method isVoidTextNode
 * @param {HTMLElement}
 */
export function isVoidTextNode (node) {
  return node.nodeType === nodeType.textNode && !node.nodeValue
}

/**
 * Check if node is a text node and contains nothing but whitespace
 *
 * @method isWhitespaceOnly
 * @param {HTMLElement}
 */
export function isWhitespaceOnly (node) {
  return node.nodeType === nodeType.textNode && lastOffsetWithContent(node) === 0
}

export function isLinebreak (node) {
  return node.nodeType === nodeType.elementNode && node.tagName === 'BR'
}

/**
 * Returns the last offset where the cursor can be positioned to
 * be at the visible end of its container.
 * Currently works only for empty text nodes (not empty tags)
 *
 * @method isWhitespaceOnly
 * @param {HTMLElement}
 */
export function lastOffsetWithContent (elem) {
  if (elem.nodeType === nodeType.textNode) return string.trimRight(elem.nodeValue).length

  let lastOffset = 0
  Array.from(elem.childNodes).reverse().every((node, index, nodes) => {
    if (isWhitespaceOnly(node) || isLinebreak(node)) return true

    lastOffset = nodes.length - index
    return false
  })
  return lastOffset
}

export function isBeginningOfHost (host, container, offset) {
  if (container === host) return isStartOffset(container, offset)

  if (isStartOffset(container, offset)) {
    // The index of the element simulates a range offset
    // right before the element.
    const offsetInParent = getNodeIndex(container)
    return isBeginningOfHost(host, container.parentNode, offsetInParent)
  }

  return false
}

export function isEndOfHost (host, container, offset) {
  if (container === host) return isEndOffset(container, offset)

  if (isEndOffset(container, offset)) {
    // The index of the element plus one simulates a range offset
    // right after the element.
    const offsetInParent = getNodeIndex(container) + 1
    return isEndOfHost(host, container.parentNode, offsetInParent)
  }

  return false
}

export function isStartOffset (container, offset) {
  if (container.nodeType === nodeType.textNode) return offset === 0

  if (container.childNodes.length === 0) return true

  if (
    container.childNodes.length === 1 &&
    container.firstChild.nodeType === nodeType.elementNode &&
    container.firstChild.getAttribute('data-editable') === 'remove'
  ) return true

  return container.childNodes[offset] === container.firstChild
}

export function isEndOffset (container, offset) {
  if (container.nodeType === nodeType.textNode) return offset === container.length

  if (container.childNodes.length === 0) return true

  if (offset > 0) return container.childNodes[offset - 1] === container.lastChild

  return false
}

export function isTextEndOfHost (host, container, offset) {
  if (container === host) return isTextEndOffset(container, offset)

  if (isTextEndOffset(container, offset)) {
    // The index of the element plus one simulates a range offset
    // right after the element.
    const offsetInParent = getNodeIndex(container) + 1
    return isTextEndOfHost(host, container.parentNode, offsetInParent)
  }

  return false
}

export function isTextEndOffset (container, offset) {
  if (container.nodeType === nodeType.textNode) {
    const text = string.trimRight(container.nodeValue)
    return offset >= text.length
  }

  if (container.childNodes.length === 0) return true

  return offset >= lastOffsetWithContent(container)
}

export function isSameNode (target, source) {
  let i, len, attr

  if (target.nodeType !== source.nodeType) return false

  if (target.nodeName !== source.nodeName) return false

  for (i = 0, len = target.attributes.length; i < len; i++) {
    attr = target.attributes[i]
    if (source.getAttribute(attr.name) !== attr.value) return false
  }

  return true
}

/**
 * Return the deepest last child of a node.
 *
 * @method  lastChild
 * @param  {HTMLElement} container The container to iterate on.
 * @return {HTMLElement}           The deepest last child in the container.
 */
export function lastChild (container) {
  return container.lastChild
    ? lastChild(container.lastChild)
    : container
}

/**
 * Obsolete version of {{#crossLink "lastChild"}}{{/crossLink}}.
 */
export function latestChild (container) {
  console.warn('Editable.js: Using obsolete function parser.latestCild(), use lastChild() instead')
  return lastChild(container)
}

/**
 * Checks if a documentFragment has no children.
 * Fragments without children can cause errors if inserted into ranges.
 *
 * @method  isDocumentFragmentWithoutChildren
 * @param  {HTMLElement} DOM node.
 * @return {Boolean}
 */
export function isDocumentFragmentWithoutChildren (fragment) {
  return fragment &&
    fragment.nodeType === nodeType.documentFragmentNode &&
    fragment.childNodes.length === 0
}

/**
 * Determine if an element behaves like an inline element.
 */
export function isInlineElement (window, element) {
  const styles = element.currentStyle || window.getComputedStyle(element, '')
  const display = styles.display
  switch (display) {
    case 'inline':
    case 'inline-block':
      return true
    default:
      return false
  }
}

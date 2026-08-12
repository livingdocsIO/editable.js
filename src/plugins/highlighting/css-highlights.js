import NodeIterator from '../../node-iterator.js'
import * as nodeType from '../../node-type.js'
import {createRange} from '../../util/dom.js'
import {getScrollPosition} from '../../util/viewport.js'

/**
 * Read an editable as one flat string. Callers place highlights by character
 * offset, so they need a view of the block with no markup in it. Elements
 * fall away, a <br> becomes a newline, and parts of the block that are
 * marked data-editable="remove" are left out.
 *
 * @param  {DOMNode} element
 * @return {String}
 */
export function getCssHighlightText (element) {
  let text = ''

  for (const node of new NodeIterator(element)) {
    if (node.nodeType === nodeType.textNode) text += node.data
    else if (node.nodeName === 'BR') text += '\n'
  }

  return text
}

/**
 * Highlight parts of an editable without touching its content. Highlights like
 * spell errors are not part of the document, so they should not end up in the
 * DOM.
 *
 * @param  {Object} options
 * @param  {String} options.name
 * @param  {Array} [options.ranges]
 * @param  {DOMNode} options.ranges[].editableHost
 * @param  {Number} options.ranges[].start
 * @param  {Number} options.ranges[].end
 * @param  {Window} [options.win]
 */
export function setCssHighlight ({name, ranges = [], win = window}) {
  const domRanges = []
  for (const {editableHost, start, end} of ranges) {
    const range = createCssHighlightRange({editableHost, start, end, win})
    if (range) domRanges.push(range)
  }

  if (!domRanges.length) return clearCssHighlight({name, win})

  win.CSS.highlights.set(name, new win.Highlight(...domRanges))
}

/**
 * Turn a character range into a DOM range. Everything else in this file goes
 * through here, so there is one place where offsets meet the DOM.
 *
 * @param  {Object} options
 * @param  {DOMNode} options.editableHost
 * @param  {Number} options.start
 * @param  {Number} options.end
 * @param  {Window} [options.win]
 * @return {Range|undefined}
 */
export function createCssHighlightRange ({editableHost, start, end, win = window}) {
  const startPoint = findRangeBoundary(editableHost, start, false)
  const endPoint = findRangeBoundary(editableHost, end, true)
  if (!startPoint || !endPoint) return

  const range = createRange(win)
  range.setStart(startPoint.node, startPoint.offset)
  range.setEnd(endPoint.node, endPoint.offset)
  return range
}

/**
 * Remove all highlights of one kind. The registry belongs to the window, not
 * to an editable, so highlights stay around until someone removes them.
 *
 * @param  {Object} options
 * @param  {String} options.name
 * @param  {Window} [options.win]
 */
export function clearCssHighlight ({name, win = window}) {
  win.CSS.highlights.delete(name)
}

/**
 * Where a highlight is positioned on screen.
 *
 * @param  {Object} options
 * @param  {DOMNode} options.editableHost
 * @param  {Number} options.start
 * @param  {Number} options.end
 * @param  {Window} [options.win]
 * @return {Object|undefined}
 */
export function getCssHighlightRects ({editableHost, start, end, win = window}) {
  const range = createCssHighlightRange({editableHost, start, end, win})
  if (!range) return

  const bounding = range.getBoundingClientRect()
  const rects = Array.from(range.getClientRects())
  const {x, y} = getScrollPosition(win)
  return {
    bounding: translate(bounding, x, y),
    rects: rects.map((rect) => translate(rect, x, y))
  }
}

/**
 * Count how far into a block a DOM position sits, the inverse of
 * findRangeBoundary(). Counts the same characters as getCssHighlightText() so
 * that a cursor and a highlight agree on where they are.
 *
 * @param  {DOMNode} element
 * @param  {DOMNode} container
 * @param  {Number} containerOffset
 * @return {Number|undefined}
 */
export function findCharacterOffset (element, container, containerOffset) {
  // A position in an element sits before one of its children rather than
  // inside text. Resolve it to that child so the walk can recognise it.
  const beforeNode = container.nodeType === nodeType.elementNode
    ? container.childNodes[containerOffset]
    : undefined

  const iterator = new NodeIterator(element)

  let offset = 0
  let next

  while ((next = iterator.getNext())) {
    if (next === beforeNode) return offset

    if (next.nodeType === nodeType.elementNode && next.nodeName === 'BR') {
      offset += 1
      continue
    }
    if (next.nodeType !== nodeType.textNode || next.data === '') continue

    if (next === container) return offset + containerOffset
    offset = offset + next.data.length
  }

  // Ran off the end without meeting the container. That is the position after
  // the last character when it came from an element, and a container the walk
  // does not count otherwise.
  if (!beforeNode && container.nodeType === nodeType.elementNode) return offset
}

/**
 * Find the spot in the DOM that a character offset points at. Callers count
 * characters, the browser wants nodes. This reads the block the same way as
 * getCssHighlightText(), so both agree on where an offset falls.
 *
 * @param  {DOMNode} element
 * @param  {Number} target
 * @param  {Boolean} inclusive True for a range end, false for a range start.
 * @return {Object|undefined}
 */
function findRangeBoundary (element, target, inclusive) {
  const iterator = new NodeIterator(element)

  let offset = 0
  let next

  while ((next = iterator.getNext())) {
    if (next.nodeType === nodeType.elementNode && next.nodeName === 'BR') {
      offset += 1
      continue
    }
    if (next.nodeType !== nodeType.textNode || next.data === '') continue

    const nodeEnd = offset + next.data.length
    if (inclusive ? nodeEnd >= target : nodeEnd > target) {
      return {node: next, offset: Math.max(0, target - offset)}
    }

    offset = nodeEnd
  }
}

/**
 * Shift a rect by a scroll offset.
 *
 * @param  {DOMRect} rect
 * @param  {Number} x
 * @param  {Number} y
 * @return {Object}
 */
function translate (rect, x, y) {
  return {
    top: rect.top + y,
    bottom: rect.bottom + y,
    left: rect.left + x,
    right: rect.right + x,
    width: rect.width,
    height: rect.height
  }
}

import NodeIterator from '../../node-iterator.js'
import * as nodeType from '../../node-type.js'
import {createRange} from '../../util/dom.js'
import {getScrollPosition} from '../../util/viewport.js'

// The DOM ranges in CSS.highlights do not survive markup changes, so keep the
// character offsets and redraw from those. One registry per window, because
// this module is shared by every editable on the page while CSS.highlights is
// not.
//
// win -> Map(name -> Map(editableHost -> [{start, end}]))
const registries = new WeakMap()

/**
 * Read an editable as plain text. Callers work in character offsets, so they
 * need the text those offsets count against. A <br> counts as a newline,
 * otherwise the words around it would run together. Text marked
 * data-editable="remove" is left out.
 *
 * @param  {Object} options
 * @param  {DOMNode} options.editableHost
 * @return {String}
 */
export function getCssHighlightText ({editableHost}) {
  let text = ''

  for (const node of new NodeIterator(editableHost)) {
    if (node.nodeType === nodeType.textNode) text += node.data
    else if (node.nodeName === 'BR') text += '\n'
  }

  return text
}

/**
 * Highlight parts of an editable without touching its content. Spell errors
 * are not part of the document, so they must not end up in the DOM.
 *
 * Each call replaces everything held under that name. The offsets are kept so
 * the highlight can be drawn again after someone else changes the markup.
 * Passing no ranges removes the highlight.
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
  const hosts = new Map()
  for (const {editableHost, start, end} of ranges) {
    const offsets = hosts.get(editableHost)
    if (offsets) offsets.push({start, end})
    else hosts.set(editableHost, [{start, end}])
  }

  if (!hosts.size) return deleteCssHighlight({name, win})

  let registry = registries.get(win)
  if (!registry) registries.set(win, registry = new Map())
  registry.set(name, hosts)

  drawCssHighlight({name, hosts, win})
}

/**
 * Draw the highlights of an editable again after its markup changed.
 *
 * Comments and formats wrap text in marker nodes, which breaks the ranges the
 * browser is holding. The markers carry no text themselves, so the offsets
 * still point at the right words and the highlight can be rebuilt from them.
 *
 * @param  {Object} options
 * @param  {DOMNode} options.editableHost
 * @param  {Window} [options.win]
 */
export function refreshCssHighlights ({
  editableHost,
  win = editableHost?.ownerDocument?.defaultView
}) {
  const registry = registries.get(win)
  if (!registry?.size) return

  for (const [name, hosts] of registry) {
    if (!hosts.has(editableHost)) continue

    for (const host of hosts.keys()) {
      if (!host?.isConnected) hosts.delete(host)
    }

    if (!hosts.size) deleteCssHighlight({name, win})
    else drawCssHighlight({name, hosts, win})
  }
}

/**
 * Turn a character range into a DOM range, for callers that need to select or
 * measure the text rather than highlight it.
 *
 * @param  {Object} options
 * @param  {DOMNode} options.editableHost
 * @param  {Number} options.start
 * @param  {Number} options.end
 * @param  {Window} [options.win]
 * @return {Range|undefined}
 */
export function createCssHighlightRange ({editableHost, start, end, win = window}) {
  const segments = collectTextSegments(editableHost)
  return createRangeFromSegments({segments, start, end, win})
}

/**
 * Remove the highlights of one name and forget where they were. Nothing does
 * this on its own, so whoever set them has to say when they are done.
 *
 * @param  {Object} options
 * @param  {String} options.name
 * @param  {Window} [options.win]
 */
export function deleteCssHighlight ({name, win = window}) {
  registries.get(win)?.delete(name)
  win.CSS.highlights.delete(name)
}

/**
 * Where a range sits on screen, so a caller can place something next to it.
 * The coordinates include the scroll offset.
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
 * Turn a DOM position into a character offset, so a caller can tell which
 * highlight a position falls in. Counts the same characters as
 * getCssHighlightText(), so the two always agree on where an offset falls.
 *
 * @param  {Object} options
 * @param  {DOMNode} options.editableHost
 * @param  {DOMNode} options.container
 * @param  {Number} options.containerOffset
 * @return {Number|undefined}
 */
export function getCssHighlightTextOffset ({editableHost, container, containerOffset}) {
  // A position in an element points before one of its children instead of
  // into text. Resolve it to that child so the walk can spot it.
  const beforeNode = container.nodeType === nodeType.elementNode
    ? container.childNodes[containerOffset]
    : undefined

  const iterator = new NodeIterator(editableHost)

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

  // The walk never met the container. For an element that means the end of the
  // block. Anything else is a node we do not count, so there is no offset.
  if (!beforeNode && container.nodeType === nodeType.elementNode) return offset
}

/**
 * Render one named highlight from character offsets.
 *
 * @param  {Object} options
 * @param  {String} options.name
 * @param  {Map} options.hosts editableHost -> [{start, end}]
 * @param  {Window} options.win
 */
function drawCssHighlight ({name, hosts, win}) {
  const domRanges = []

  for (const [editableHost, offsets] of hosts) {
    const segments = collectTextSegments(editableHost)
    if (!segments.length) continue

    for (const {start, end} of offsets) {
      const range = createRangeFromSegments({segments, start, end, win})
      if (range) domRanges.push(range)
    }
  }

  // Keep the offsets. An editable can be empty for a moment while it renders,
  // which does not mean the highlight has gone away.
  if (!domRanges.length) return win.CSS.highlights.delete(name)

  win.CSS.highlights.set(name, new win.Highlight(...domRanges))
}

/**
 * List the text nodes of an editable with the offsets each one covers. Reading
 * the block once serves any number of lookups, and it is read the same way as
 * getCssHighlightText() so the two agree on where an offset falls.
 *
 * @param  {DOMNode} element
 * @return {Array} [{node, start, end}] ordered and non overlapping
 */
function collectTextSegments (element) {
  const segments = []
  let offset = 0

  for (const node of new NodeIterator(element)) {
    if (node.nodeType === nodeType.elementNode && node.nodeName === 'BR') {
      offset += 1
      continue
    }
    if (node.nodeType !== nodeType.textNode || node.data === '') continue

    const end = offset + node.data.length
    segments.push({node, start: offset, end})
    offset = end
  }

  return segments
}

/**
 * @param  {Object} options
 * @param  {Array} options.segments
 * @param  {Number} options.start
 * @param  {Number} options.end
 * @param  {Window} options.win
 * @return {Range|undefined}
 */
function createRangeFromSegments ({segments, start, end, win}) {
  const startPoint = findRangeBoundary(segments, start, false)
  const endPoint = findRangeBoundary(segments, end, true)
  if (!startPoint || !endPoint) return

  const range = createRange(win)
  range.setStart(startPoint.node, startPoint.offset)
  range.setEnd(endPoint.node, endPoint.offset)
  return range
}

/**
 * Find the place in the DOM that a character offset points at. Callers count
 * characters, the browser wants nodes.
 *
 * Segments only ever move forward, so the right one can be found without
 * reading them all.
 *
 * @param  {Array} segments
 * @param  {Number} target
 * @param  {Boolean} inclusive True for a range end, false for a range start.
 * @return {Object|undefined}
 */
function findRangeBoundary (segments, target, inclusive) {
  let low = 0
  let high = segments.length

  while (low < high) {
    const middle = (low + high) >> 1
    const {end} = segments[middle]
    if (inclusive ? end >= target : end > target) high = middle
    else low = middle + 1
  }

  const segment = segments[low]
  if (!segment) return

  return {node: segment.node, offset: Math.max(0, target - segment.start)}
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

import * as nodeType from './node-type.js'
import * as rangeSaveRestore from './range-save-restore.js'
import * as parser from './parser.js'
import * as string from './util/string.js'
import {createElement, createRange, getNodes, normalizeBoundaries, splitBoundaries, containsNodeText} from './util/dom.js'
import config from './config.js'

function restoreRange (host, range, func) {
  range = rangeSaveRestore.save(range)
  func()
  return rangeSaveRestore.restore(host, range)
}

const zeroWidthSpace = /\u200B/g
const zeroWidthNonBreakingSpace = /\uFEFF/g
const whitespaceExceptSpace = /[^\S ]/g

// Clean up the Html.
export function tidyHtml (element) {
  // if (element.normalize) element.normalize()
  normalizeTags(element)
}

// Remove empty tags and merge consecutive tags (they must have the same
// attributes).
//
// @method normalizeTags
// @param  {HTMLElement} element The element to process.
export function normalizeTags (element) {
  const fragment = document.createDocumentFragment()

  // Remove line breaks at the beginning of a content block
  removeWhitespaces(element, 'firstChild')

  // Remove line breaks at the end of a content block
  removeWhitespaces(element, 'lastChild')

  for (const node of element.childNodes) {
    // skip empty tags, so they'll get removed
    if (node.nodeName !== 'BR' && !node.textContent) continue

    if (node.nodeType === nodeType.elementNode && node.nodeName !== 'BR') {
      let sibling = node
      while ((sibling = sibling.nextSibling) !== null) {
        if (!parser.isSameNode(sibling, node)) break

        for (const siblingChild of sibling.childNodes) {
          node.appendChild(siblingChild.cloneNode(true))
        }

        sibling.remove()
      }

      normalizeTags(node)
    }

    fragment.appendChild(node.cloneNode(true))
  }

  while (element.firstChild) element.removeChild(element.firstChild)

  element.appendChild(fragment)
}

export function normalizeWhitespace (text) {
  return text.replace(whitespaceExceptSpace, ' ')
}

// Clean the element from character, tags, etc... added by the plugin logic.
//
// @method cleanInternals
// @param  {HTMLElement} element The element to process.
export function cleanInternals (element) {
  // Uses extract content for simplicity. A custom method
  // that does not clone the element could be faster if needed.
  element.innerHTML = extractContent(element, true)
}

// Extracts the content from a host element.
// Does not touch or change the host. Just returns
// the content and removes elements marked for removal by editable.
//
// @param {DOM node or document fragment} Element where to clean out the innerHTML.
// If you pass a document fragment it will be empty after this call.
// @param {Boolean} Flag whether to keep ui elements like spellchecking highlights.
// @returns {String} The cleaned innerHTML of the passed element or document fragment.
export function extractContent (element, keepUiElements) {
  const innerHtml = (element.nodeType === nodeType.documentFragmentNode
    ? getInnerHtmlOfFragment(element)
    : element.innerHTML
  )
    .replace(zeroWidthNonBreakingSpace, '') // Used for forcing inline elements to have a height
    .replace(zeroWidthSpace, '<br>') // Used for cross-browser newlines

  const clone = document.createElement('div')
  clone.innerHTML = innerHtml
  unwrapInternalNodes(clone, keepUiElements)

  // Remove line breaks at the beginning of a content block
  removeWhitespaces(clone, 'firstChild')

  // Remove line breaks at the end of a content block
  removeWhitespaces(clone, 'lastChild')

  return clone.innerHTML
}

export function getInnerHtmlOfFragment (documentFragment) {
  const div = document.createElement('div')
  div.appendChild(documentFragment)
  return div.innerHTML
}

// Create a document fragment from an html string
// @param {String} e.g. 'some html <span>text</span>.'
export function createFragmentFromString (htmlString) {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = htmlString

  const fragment = document.createDocumentFragment()
  while (wrapper.firstChild) fragment.appendChild(wrapper.firstChild)
  return fragment
}

export function adoptElement (node, doc) {
  return node.ownerDocument !== doc
    ? doc.adoptNode(node)
    : node
}

// It will return a fragment with the cloned contents of the range
// without the commonAncestorElement.
//
// @param {Range}
// @return {DocumentFragment}
export function cloneRangeContents (range) {
  const rangeFragment = range.cloneContents()
  const parent = rangeFragment.childNodes[0]
  const fragment = document.createDocumentFragment()
  while (parent.childNodes.length) fragment.appendChild(parent.childNodes[0])
  return fragment
}

function removeWhitespaces (node, type, firstCall = true) {
  let elem
  while ((elem = node[type])) {
    if (elem.nodeType === nodeType.textNode) {
      if (/^\s+$/.test(elem.textContent)) node.removeChild(elem)
      else break
    } else if (elem.nodeName === 'BR') {
      elem.remove()
    } else {
      if (elem[type]) removeWhitespaces(elem, type, false)
      break
    }
  }

  if (!firstCall) return
  elem = node[type]
  if (elem?.nodeType !== nodeType.textNode) return
  // Remove whitespaces at the end or start of a block with content
  //   e.g. '  Hello world' > 'Hello World'
  if (config.trimLeadingAndTrailingWhitespaces) {
    elem.textContent = elem.textContent.replace(type.startsWith('last') ? / +$/ : /^ +/, '')
  }
}

// Remove elements that were inserted for internal or user interface purposes
//
// @param {DOM node}
// @param {Boolean} whether to keep ui elements like spellchecking highlights
// Currently:
// - Saved ranges
export function unwrapInternalNodes (sibling, keepUiElements) {
  while (sibling) {
    const nextSibling = sibling.nextSibling

    if (sibling.nodeType !== nodeType.elementNode) {
      sibling = nextSibling
      continue
    }

    const attr = sibling.getAttribute('data-editable')

    if (sibling.firstChild) unwrapInternalNodes(sibling.firstChild, keepUiElements)

    if (attr === 'remove' || (attr === 'ui-remove' && !keepUiElements)) {
      sibling.remove()
    } if (attr === 'unwrap' || (attr === 'ui-unwrap' && !keepUiElements)) {
      unwrap(sibling)
    }

    sibling = nextSibling
  }
}

// Get all tags that start or end inside the range
export function getTags (host, range, filterFunc) {
  const innerTags = getInnerTags(range, filterFunc)
  const ancestorTags = getAncestorTags(host, range, filterFunc)
  return innerTags.concat(ancestorTags)
}

// Get all ancestor tags that start or end inside the range
export function getAncestorTags (host, range, filterFunc) {
  const tags = []
  let node = range.commonAncestorContainer
  while (node !== host) {
    if (!filterFunc || filterFunc(node)) tags.push(node)
    node = node.parentNode
  }

  return tags
}

export function getTagsByName (host, range, tagName) {
  return getTags(host, range, (node) => {
    return node.nodeName.toUpperCase() === tagName.toUpperCase()
  })
}

export function getTagsByNameAndAttributes (host, range, elem) {
  return getTags(host, range, (node) => {
    return node.nodeName.toUpperCase() === elem.nodeName.toUpperCase() &&
      areSameAttributes(node.attributes, elem.attributes)
  })
}

export function areSameAttributes (attrs1, attrs2) {
  if (attrs1.length !== attrs2.length) return false

  for (let i = 0; i < attrs1.length; i++) {
    const attr = attrs2[attrs1[i].name]
    if (!(attr && attr.value === attrs1[i].value)) return false
  }

  return true
}

// Get all tags that start or end inside the range
export function getInnerTags (range, filterFunc) {
  return getNodes(range, [nodeType.elementNode], filterFunc)
}

// Get all tags whose text is completely within the current selection.
export function getContainedTags (range, filterFunc) {
  return getNodes(range, [nodeType.elementNode], filterFunc)
    .filter(elem => containsNodeText(range, elem))
}

// Transform an array of elements into an array
// of tagnames in uppercase
//
// @return example: ['STRONG', 'B']
export function getTagNames (elements = []) {
  return elements.map((element) => element.nodeName)
}

export function isAffectedBy (host, range, tagName) {
  return getTags(host, range)
    .some((elem) => elem.nodeName === tagName.toUpperCase())
}

// select a whole element
export function selectNodeContents (element) {
  const range = createRange()
  range.selectNodeContents(element)
  return range
}

function intersectsRange (range1, range2) {
  return range1.compareBoundaryPoints(Range.END_TO_START, range2) === -1 &&
    range2.compareBoundaryPoints(Range.END_TO_START, range1) === -1
}

// Check if the range selects all of the elements contents,
// not less or more.
//
// @param visible: Only compare visible text. That way it does not
//   matter if the user selects an additional whitespace or not.
export function isExactSelection (range, elem, visible) {
  const elemRange = createRange()
  elemRange.selectNodeContents(elem)

  if (!intersectsRange(range, elemRange)) return false

  let rangeText = range.toString()
  let elemText = (elem.jquery ? elem[0] : elem).textContent

  if (visible) {
    rangeText = string.trim(rangeText)
    elemText = string.trim(elemText)
  }

  return rangeText !== '' && rangeText === elemText
}

export function expandTo (host, range, elem) {
  range.selectNodeContents(elem)
  return range
}

export function toggleTag (host, range, elem) {
  const elems = getTagsByNameAndAttributes(host, range, elem)

  if (elems.length === 1 &&
    isExactSelection(range, elems[0], 'visible')) {
    return removeFormattingElem(host, range, elem)
  }

  return forceWrap(host, range, elem)
}

export function isWrappable (range) {
  return canSurroundContents(range)
}

export function forceWrap (host, range, elem) {
  let restoredRange = restoreRange(host, range, () => {
    nukeElem(host, range, elem)
  })

  // remove all tags if the range is not wrappable
  if (!isWrappable(restoredRange)) {
    restoredRange = restoreRange(host, restoredRange, () => {
      nuke(host, restoredRange)
    })
  }

  wrap(restoredRange, elem)
  return restoredRange
}

export function wrap (range, elem) {
  if (!isWrappable(range)) {
    console.log('content.wrap(): can not surround range')
    return
  }

  if (typeof elem === 'string') elem = createElement(elem)
  range.surroundContents(elem)
}

export function unwrap (elem) {
  elem = elem.jquery ? elem[0] : elem
  const parent = elem.parentNode
  while (elem.firstChild) parent.insertBefore(elem.firstChild, elem)
  parent.removeChild(elem)
}

export function removeFormattingElem (host, range, elem) {
  return restoreRange(host, range, () => {
    nukeElem(host, range, elem)
  })
}

export function removeFormatting (host, range, selector) {
  return restoreRange(host, range, () => {
    nuke(host, range, selector)
  })
}

// Unwrap all tags this range is affected by.
// Can also affect content outside of the range.
export function nuke (host, range, selector) {
  getTags(host, range).forEach((elem) => {
    if (elem.nodeName.toUpperCase() !== 'BR' && (!selector || elem.matches(selector))) {
      unwrap(elem)
    }
  })
}

// Unwrap all tags this range is affected by.
// Can also affect content outside of the range.
export function nukeElem (host, range, node) {
  getTags(host, range).forEach((elem) => {
    if (elem.nodeName.toUpperCase() !== 'BR' && (!node ||
        (elem.nodeName.toUpperCase() === node.nodeName.toUpperCase() &&
          areSameAttributes(elem.attributes, node.attributes)))) {
      unwrap(elem)
    }
  })
}

// Insert a single character (or string) before or after
// the range.
export function insertCharacter (range, character, atStart) {
  const insertEl = document.createTextNode(character)
  const boundaryRange = range.cloneRange()
  boundaryRange.collapse(atStart)
  boundaryRange.insertNode(insertEl)
  range[atStart ? 'setStartBefore' : 'setEndAfter'](insertEl)
  normalizeBoundaries(range)
}

// Surround the range with characters like start and end quotes.
//
// @method surround
export function surround (host, range, startCharacter, endCharacter) {
  insertCharacter(range, endCharacter || startCharacter, false)
  insertCharacter(range, startCharacter, true)
  return range
}

// Removes a character from the text within a range.
//
// @method deleteCharacter
export function deleteCharacter (host, range, character) {
  if (!containsString(range, character)) return range

  // check for selection.rangeCount > 0 ?
  if (window.getSelection().rangeCount > 0) splitBoundaries(range)
  const restoredRange = restoreRange(host, range, () => {
    getNodes(range, [nodeType.textNode], (node) => {
      return node.nodeValue.indexOf(character) >= 0
    })
      .forEach((node) => {
        node.nodeValue = node.nodeValue.replaceAll(character, '')
      })
  })

  normalizeBoundaries(restoredRange)
  return restoredRange
}

export function containsString (range, str) {
  return range.toString().indexOf(str) >= 0
}

// Unwrap all tags this range is affected by.
// Can also affect content outside of the range.
export function nukeTag (host, range, tagName) {
  getTags(host, range).forEach((elem) => {
    if (elem.nodeName.toUpperCase() === tagName.toUpperCase()) unwrap(elem)
  })
}

function createNodeIterator (root, filter) {
  let currentNode = root
  let previousNode = null

  function nextNode () {
    if (!currentNode) {
      return null
    }

    if (currentNode.firstChild && previousNode !== currentNode.firstChild) {
      previousNode = currentNode
      currentNode = currentNode.firstChild
    } else if (currentNode.nextSibling) {
      previousNode = currentNode
      currentNode = currentNode.nextSibling
    } else {
      let parent = currentNode.parentNode
      while (parent && parent !== root) {
        if (parent.nextSibling) {
          previousNode = currentNode = parent.nextSibling
          break
        }
        parent = parent.parentNode
      }
      if (!parent || parent === root) {
        previousNode = currentNode = null
      }
    }

    return currentNode
  }

  return {
    next: nextNode
  }
}

function isNodeFullyContained (node, range) {
  const nodeRange = document.createRange()
  nodeRange.selectNodeContents(node)
  return range.compareBoundaryPoints(Range.START_TO_START, nodeRange) <= 0 &&
         range.compareBoundaryPoints(Range.END_TO_END, nodeRange) >= 0
}

function canSurroundContents (range) {
  if (!range || !range.startContainer || !range.endContainer) {
    return false
  }

  if (range.startContainer === range.endContainer) return true

  // Create a custom node iterator for the common ancestor container
  const iterator = createNodeIterator(range.commonAncestorContainer, function (node) {
    return range.isPointInRange(node, 0)
  })

  let currentNode
  let boundariesInvalid = false

  while ((currentNode = iterator.next())) {
    if (currentNode.nodeType === Node.ELEMENT_NODE) {
      if (!isNodeFullyContained(currentNode, range)) {
        boundariesInvalid = true
        break
      }
    }
  }

  return !boundariesInvalid
}

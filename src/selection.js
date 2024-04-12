import Cursor from './cursor.js'
import * as content from './content.js'
import * as parser from './parser.js'
import * as block from './block.js'
import config from './config.js'
import highlightSupport from './highlight-support.js'
import highlightText from './highlight-text.js'
import {
  toCharacterRange,
  rangeToHtml,
  findStartExcludingWhitespace,
  findEndExcludingWhitespace
} from './util/dom.js'

/**
 * The Selection module provides a cross-browser abstraction layer for range
 * and selection.
 *
 * @module core
 * @submodule selection
 */
/**
 * Class that represents a selection and provides functionality to access or
 * modify the selection.
 *
 * @class Selection
 * @constructor
 */

export default class Selection extends Cursor {
  constructor () {
    super(...arguments)
    delete this.isCursor
    this.isSelection = true
  }

  // Get the text inside the selection.
  text () {
    return this.range.toString()
  }

  // Get the html inside the selection.
  html () {
    return rangeToHtml(this.range)
  }

  isAllSelected () {
    return parser.isBeginningOfHost(
      this.host,
      this.range.startContainer,
      this.range.startOffset
    ) && parser.isTextEndOfHost(
      this.host,
      this.range.endContainer,
      this.range.endOffset
    )
  }

  getTextRange () {
    return toCharacterRange(this.range, this.host)
  }

  // Return a plain string of the current selection content.
  toString () {
    return this.range.toString()
  }

  // Get the ClientRects of this selection.
  // Use this if you want more precision than getBoundingClientRect can give.
  getRects () {
    // consider: translate into absolute positions
    // just like Cursor#getCoordinates()
    return this.range.getClientRects()
  }

  link (href, attrs = {}) {
    if (href) attrs.href = href
    const link = this.createElement(config.linkMarkup.name, config.linkMarkup.attribs)
    for (const key in attrs) {
      const value = attrs[key]
      if (value === undefined) continue
      if (value === null) {
        link.removeAttribute(key)
      } else {
        link.setAttribute(key, value)
      }
    }
    if (config.linkMarkup.trim) this.trimRange()

    this.wrap(link)
  }

  // trims whitespaces on the left and right of a selection, i.e. what you want in case of links
  trimRange () {
    const textToTrim = this.range.toString()
    const whitespacesOnTheLeft = textToTrim.search(/\S|$/)
    const lastNonWhitespace = textToTrim.search(/\S[\s]+$/)
    const whitespacesOnTheRight = lastNonWhitespace === -1
      ? 0
      : textToTrim.length - (lastNonWhitespace + 1)

    const [startContainer, startOffset] = findStartExcludingWhitespace({
      root: this.range.commonAncestorContainer,
      startContainer: this.range.startContainer,
      startOffset: this.range.startOffset,
      whitespacesOnTheLeft
    })
    this.range.setStart(startContainer, startOffset)

    const [endContainer, endOffset] = findEndExcludingWhitespace({
      root: this.range.commonAncestorContainer,
      endContainer: this.range.endContainer,
      endOffset: this.range.endOffset,
      whitespacesOnTheRight
    })
    this.range.setEnd(endContainer, endOffset)
  }

  unlink () {
    this.removeFormatting(config.linkMarkup.name)
  }

  toggleLink (href, attrs) {
    const links = this.getTagsByName(config.linkMarkup.name)
    if (links.length >= 1) {
      const firstLink = links[0]
      if (this.isExactSelection(firstLink, 'visible')) {
        this.unlink()
      } else {
        this.expandTo(firstLink)
      }
    } else {
      this.link(href, attrs)
    }
  }

  highlightComment ({highlightId, textRange}) {
    highlightSupport.highlightRange(
      this.host,
      highlightId,
      textRange.text,
      textRange.start,
      textRange.end,
      undefined, // dispatcher
      'comment'
    )
  }

  // Manually add a highlight
  // Note: the current code does not work with newlines (LP)
  highlight ({highlightId}) {
    const textBefore = this.textBefore()
    const currentTextContent = this.text()

    const marker = '<span class="highlight-comment"></span>'
    const markerNode = highlightSupport.createMarkerNode(marker, this.win)

    markerNode.setAttribute('data-match', currentTextContent)

    const match = {
      startIndex: textBefore.length,
      endIndex: textBefore.length + currentTextContent.length,
      match: currentTextContent,
      marker: markerNode
    }

    // Note: highlighting won't retain the selection
    highlightText.highlightMatches(this.host, [match])
  }

  // e.g. toggle('<em>')
  toggle (elem) {
    if (block.isPlainTextBlock(this.host)) return
    if (this.range.collapsed) return
    elem = this.adoptElement(elem)
    this.range = content.toggleTag(this.host, this.range, elem)
    this.setVisibleSelection()
  }

  toggleCustom ({tagName, attributes, trim = false}) {
    const customElem = this.createElement(tagName, attributes)
    if (trim) this.trimRange()
    this.toggle(customElem)
  }

  makeCustom ({tagName, attributes, trim = false}) {
    const customElem = this.createElement(tagName, attributes)
    if (trim) this.trimRange()
    this.wrap(customElem)
  }

  makeBold () {
    const bold = this.createElement(config.boldMarkup.name, config.boldMarkup.attribs)
    if (config.boldMarkup.trim) this.trimRange()
    this.wrap(bold)
  }

  toggleBold () {
    const bold = this.createElement(config.boldMarkup.name, config.boldMarkup.attribs)
    if (config.boldMarkup.trim) this.trimRange()
    this.toggle(bold)
  }

  giveEmphasis () {
    const em = this.createElement(config.italicMarkup.name, config.italicMarkup.attribs)
    if (config.italicMarkup.trim) this.trimRange()
    this.wrap(em)
  }

  toggleEmphasis () {
    const em = this.createElement(config.italicMarkup.name, config.italicMarkup.attribs)
    if (config.italicMarkup.trim) this.trimRange()
    this.toggle(em)
  }

  makeUnderline () {
    const u = this.createElement(config.underlineMarkup.name, config.underlineMarkup.attribs)
    if (config.underlineMarkup.trim) this.trimRange()
    this.wrap(u)
  }

  toggleUnderline () {
    const u = this.createElement(config.underlineMarkup.name, config.underlineMarkup.attribs)
    if (config.underlineMarkup.trim) this.trimRange()
    this.toggle(u)
  }

  insertCharacter (character) {
    const cursor = this.deleteContent()
    const textNode = cursor.createTextNode(character)
    cursor.insertBefore(textNode)
    cursor.setVisibleSelection()
    return cursor
  }

  // Surround the selection with characters like quotes.
  //
  // @param {String} E.g. '«'
  // @param {String} E.g. '»'
  surround (startCharacter, endCharacter) {
    this.range = content.surround(this.host, this.range, startCharacter, endCharacter)
    this.setVisibleSelection()
  }

  removeSurround (startCharacter, endCharacter) {
    this.range = content.deleteCharacter(this.host, this.range, startCharacter)
    this.range = content.deleteCharacter(this.host, this.range, endCharacter)
    this.setVisibleSelection()
  }

  removeChars (chars = []) {
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i]
      this.range = content.deleteCharacter(this.host, this.range, char)
    }
    this.setVisibleSelection()
  }

  toggleSurround (startCharacter, endCharacter) {
    if (this.containsString(startCharacter) &&
    this.containsString(endCharacter)) {
      this.removeSurround(startCharacter, endCharacter)
    } else {
      this.surround(startCharacter, endCharacter)
    }
  }

  // @param {String} selector. An element selector, e.g. 'a' or 'span.some-class'
  //                           that represents elements to be removed; if undefined,
  //                           remove all.
  removeFormatting (selector) {
    const elems = document.querySelectorAll(selector)
    if (elems.length) {
      for (const elem of elems) {
        this.range = content.unwrap(this.host, this.range, elem)
      }
    } else {
      this.range = content.unwrap(this.host, this.range)
    }

    this.setVisibleSelection()
  }

  // Delete the farest ancestor that is an exact selection
  //
  // @return Selection instance
  deleteExactSurroundingTags () {
    const ancestorTags = this.getAncestorTags().reverse()
    for (const ancestorTag of ancestorTags) {
      if (this.isExactSelection(ancestorTag)) {
        ancestorTag.remove()
        break
      }
    }
    return new Selection(this.host, this.range)
  }

  // Delete all the tags whose text is completely within the current selection.
  //
  // @return Selection instance
  deleteContainedTags () {
    const containedTags = this.getContainedTags()
    containedTags.forEach(containedTag => containedTag.remove())
    return new Selection(this.host, this.range)
  }

  // Delete the contents inside the range and exact surrounding markups.
  // After that the selection will be a cursor.
  //
  // @return Cursor instance
  deleteContent () {
    this.range.deleteContents()
    return new Cursor(this.host, this.range)
  }

  // Expand the current selection.
  //
  // @param {DOM Node}
  expandTo (elem) {
    this.range = content.expandTo(this.host, this.range, elem)
    this.setVisibleSelection()
  }

  //  Collapse the selection at the beginning of the selection
  //
  //  @return Cursor instance
  collapseAtBeginning (elem) {
    this.range.collapse(true)
    this.setVisibleSelection()
    return new Cursor(this.host, this.range)
  }

  //  Collapse the selection at the end of the selection
  //
  //  @return Cursor instance
  collapseAtEnd (elem) {
    this.range.collapse(false)
    this.setVisibleSelection()
    return new Cursor(this.host, this.range)
  }

  // Wrap the selection with the specified tag.
  wrap (elem) {
    if (block.isPlainTextBlock(this.host)) return
    if (this.range.collapsed) return
    elem = this.adoptElement(elem)
    this.range = content.wrap(this.host, this.range, elem)
    this.setVisibleSelection()
  }

  // Check if the selection is the same as the elements contents.
  //
  // @method isExactSelection
  // @param {DOM Node}
  // @param {flag:  undefined or 'visible'} if 'visible' is passed
  //   whitespaces at the beginning or end of the selection will
  //   be ignored.
  // @return {Boolean}
  isExactSelection (elem, onlyVisible) {
    return content.isExactSelection(this.range, elem, onlyVisible)
  }

  // Check if the selection contains the passed string.
  //
  // @method containsString
  // @return {Boolean}
  containsString (str) {
    return content.containsString(this.range, str)
  }

  // Delete all occurrences of the specified character from the
  // selection.
  deleteCharacter (character) {
    this.range = content.deleteCharacter(this.host, this.range, character)
    this.setVisibleSelection()
  }
}
